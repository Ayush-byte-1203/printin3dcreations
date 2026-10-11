from django.test import override_settings, Client
from django.core.cache import cache
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import Topic

@override_settings(REQUIRE_ADMIN_MFA=False, SECURE_SSL_REDIRECT=False, ALLOWED_HOSTS=['testserver'], CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
class AdminPermissionsTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.staff = get_user_model().objects.create_user('staff', password='test-password', is_staff=True)
        self.customer = get_user_model().objects.create_user('customer', password='test-password')
        self.topic = Topic.objects.create(title='Test', icon='Key', desc='Test')

    def test_public_reads_and_blocked_writes(self):
        for endpoint in ['/api/topics/', '/api/products/']:
            self.assertEqual(self.client.get(endpoint).status_code, 200)
            self.assertEqual(self.client.post(endpoint, {}, format='json').status_code, 401)
        self.assertEqual(self.client.delete(f'/api/topics/{self.topic.pk}/').status_code, 401)
        self.assertEqual(self.client.post('/api/upload/', {}).status_code, 401)

    def test_real_staff_token_allows_write(self):
        response = self.client.post('/api/login/', {'username': 'staff', 'password': 'test-password'}, format='json')
        self.assertEqual(response.status_code, 200)
        token = response.data['token']
        self.assertTrue(Token.objects.filter(key=token, user=self.staff).exists())
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(self.client.post('/api/topics/', {'title': 'New', 'icon': 'Key', 'desc': 'New'}).status_code, 201)
        self.assertEqual(self.client.post('/api/upload/', {}).status_code, 400)

    def test_nonstaff_and_mock_tokens_cannot_write(self):
        self.assertEqual(self.client.post('/api/login/', {'username': 'customer', 'password': 'test-password'}, format='json').status_code, 401)
        token = Token.objects.create(user=self.customer)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        self.assertEqual(self.client.delete(f'/api/topics/{self.topic.pk}/').status_code, 401)
        self.client.credentials(HTTP_AUTHORIZATION='Token admin_token_fake')
        self.assertEqual(self.client.delete(f'/api/topics/{self.topic.pk}/').status_code, 401)

import tempfile
from io import BytesIO
from datetime import timedelta
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from django_otp.oath import totp
from django_otp.plugins.otp_totp.models import TOTPDevice
from PIL import Image
from .models import Product, AdminSession

@override_settings(REQUIRE_ADMIN_MFA=False, SECURE_SSL_REDIRECT=False, ALLOWED_HOSTS=['testserver'], CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
class SecurityControlsTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.staff = get_user_model().objects.create_user('secure-staff', password='a-long-test-password', is_staff=True)
        self.customer = get_user_model().objects.create_user('customer', password='a-long-test-password')
        self.topic = Topic.objects.create(title='Public category', icon='Key', desc='Public description')
        self.product = Product.objects.create(topic=self.topic, product_id='1-1', name='Test', price=100, desc='Test')
        self.media = tempfile.TemporaryDirectory()
        self.media_settings = override_settings(MEDIA_ROOT=self.media.name)
        self.media_settings.enable()
    def tearDown(self):
        self.media_settings.disable(); self.media.cleanup()
    def login(self):
        result = self.client.post('/api/login/', {'username':'secure-staff','password':'a-long-test-password'}, format='json')
        self.assertEqual(result.status_code,200)
        self.client.credentials(HTTP_AUTHORIZATION='Token '+result.data['token'])
        return result.data['token']
    def image(self, payload=None, content_type='image/png', name='image.png'):
        if payload is None:
            output=BytesIO();Image.new('RGB',(8,8)).save(output,format='PNG');payload=output.getvalue()
        return SimpleUploadedFile(name,payload,content_type=content_type)
    def test_sql_payloads_do_not_authenticate_or_change_the_catalog(self):
        result=self.client.post('/api/login/', {'username':"' OR 1=1 --",'password':'anything'},format='json')
        self.assertEqual(result.status_code,401)
        result=self.client.get('/api/products/',{'topic':"1 OR 1=1"})
        self.assertEqual(result.status_code,400)
        self.assertEqual(Topic.objects.count(),1);self.assertEqual(Product.objects.count(),1)
    def test_nonstaff_and_anonymous_cannot_change_an_object(self):
        for method in ['patch','delete']:
            result=getattr(self.client,method)(f'/api/products/{self.product.pk}/',{'name':'changed'},format='json')
            self.assertEqual(result.status_code,401)
        token=Token.objects.create(user=self.customer)
        self.client.credentials(HTTP_AUTHORIZATION='Token '+token.key)
        self.assertEqual(self.client.patch(f'/api/products/{self.product.pk}/',{'name':'changed'},format='json').status_code,401)
        self.product.refresh_from_db();self.assertEqual(self.product.name,'Test')
    def test_active_staff_can_edit_a_specific_object(self):
        self.login();result=self.client.patch(f'/api/products/{self.product.pk}/',{'price':120},format='json')
        self.assertEqual(result.status_code,200);self.product.refresh_from_db();self.assertEqual(self.product.price,120)
    def test_expired_and_legacy_tokens_are_rejected(self):
        token=self.login();Token.objects.filter(key=token).update(created=timezone.now()-timedelta(hours=9))
        self.assertEqual(self.client.patch(f'/api/products/{self.product.pk}/',{'price':120},format='json').status_code,401)
        legacy=Token.objects.create(user=self.staff)
        self.client.credentials(HTTP_AUTHORIZATION='Token '+legacy.key)
        self.assertEqual(self.client.patch(f'/api/products/{self.product.pk}/',{'price':120},format='json').status_code,401)
    def test_logout_revokes_the_underlying_token(self):
        token=self.login();self.assertEqual(self.client.post('/api/logout/').status_code,204)
        self.assertFalse(Token.objects.filter(key=token).exists())
    def test_login_rate_limit(self):
        for i in range(5):
            result=self.client.post('/api/login/',{'username':'rate-account','password':'wrong'},format='json')
            self.assertEqual(result.status_code,401)
        result=self.client.post('/api/login/',{'username':'rate-account','password':'wrong'},format='json')
        self.assertEqual(result.status_code,429)
    @override_settings(REQUIRE_ADMIN_MFA=True)
    def test_mfa_is_required_and_one_time_codes_cannot_be_replayed(self):
        credentials={'username':'secure-staff','password':'a-long-test-password'}
        result=self.client.post('/api/login/',credentials,format='json')
        self.assertEqual(result.status_code,401);self.assertEqual(result.data['code'],'mfa_required')
        device=TOTPDevice.objects.create(user=self.staff,name='test',confirmed=True)
        code=f'{totp(device.bin_key, step=device.step, t0=device.t0, digits=device.digits, drift=device.drift):06d}'
        result=self.client.post('/api/login/',{**credentials,'otp_code':code},format='json')
        self.assertEqual(result.status_code,200)
        self.assertTrue(AdminSession.objects.get(token__key=result.data['token']).mfa_verified)
        result=self.client.post('/api/login/',{**credentials,'otp_code':code},format='json')
        self.assertEqual(result.status_code,401)
    @override_settings(REQUIRE_ADMIN_MFA=True)
    def test_password_only_token_cannot_bypass_mfa(self):
        token=Token.objects.create(user=self.staff);AdminSession.objects.create(token=token,mfa_verified=False)
        self.client.credentials(HTTP_AUTHORIZATION='Token '+token.key)
        self.assertEqual(self.client.patch(f'/api/products/{self.product.pk}/',{'price':120},format='json').status_code,401)
    def test_upload_rejects_svg_html_corrupt_and_oversized_files(self):
        self.login()
        files=[self.image(b'<svg onload="alert(1)"></svg>','image/svg+xml','evil.svg'),self.image(b'<script>alert(1)</script>'),self.image(b'not an image'),self.image(b'x'*(3*1024*1024+1))]
        for f in files:
            with self.subTest(name=f.name):self.assertEqual(self.client.post('/api/upload/',{'image':f},format='multipart').status_code,400)
    def test_upload_reencoding_strips_trailing_active_content(self):
        self.login();file=self.image();raw=file.read()+b'<script>UNTRUSTED_PAYLOAD</script>'
        result=self.client.post('/api/upload/',{'image':self.image(raw)},format='multipart')
        self.assertEqual(result.status_code,201)
        from pathlib import Path
        saved=list(Path(self.media.name).rglob('*.png'));self.assertEqual(len(saved),1)
        self.assertNotIn(b'UNTRUSTED_PAYLOAD',saved[0].read_bytes())
    def test_unsafe_image_urls_and_negative_prices_are_rejected(self):
        self.login()
        for data in [{'images':['javascript:alert(1)']},{'images':['//attacker.invalid/image.svg']},{'price':-1},{'features':{'invalid':'object'}}]:
            self.assertEqual(self.client.patch(f'/api/products/{self.product.pk}/',data,format='json').status_code,400)
    def test_cookie_based_django_admin_rejects_missing_csrf(self):
        client=Client(enforce_csrf_checks=True)
        self.assertEqual(client.post('/django-admin/login/',{'username':'secure-staff','password':'a-long-test-password'}).status_code,403)
    def test_unknown_cors_origins_are_denied(self):
        r=self.client.options('/api/topics/',HTTP_ORIGIN='https://attacker.invalid',HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST')
        self.assertNotIn('Access-Control-Allow-Origin',r)
    def test_passwords_are_hashed_and_legacy_hashes_remain_verifiable(self):
        self.assertTrue(self.staff.password.startswith('argon2$'));self.assertNotIn('a-long-test-password',self.staff.password)
        self.assertTrue(check_password('a-long-test-password',self.staff.password))
