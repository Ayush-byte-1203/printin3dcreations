from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import Topic

class AdminPermissionsTests(APITestCase):
    def setUp(self):
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
        response = self.client.post('/api/login/', {'username': 'staff', 'password': 'test-password'})
        self.assertEqual(response.status_code, 200)
        token = response.data['token']
        self.assertTrue(Token.objects.filter(key=token, user=self.staff).exists())
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(self.client.post('/api/topics/', {'title': 'New', 'icon': 'Key', 'desc': 'New'}).status_code, 201)
        self.assertEqual(self.client.post('/api/upload/', {}).status_code, 400)

    def test_nonstaff_and_mock_tokens_cannot_write(self):
        self.assertEqual(self.client.post('/api/login/', {'username': 'customer', 'password': 'test-password'}).status_code, 401)
        token = Token.objects.create(user=self.customer)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        self.assertEqual(self.client.delete(f'/api/topics/{self.topic.pk}/').status_code, 403)
        self.client.credentials(HTTP_AUTHORIZATION='Token admin_token_fake')
        self.assertEqual(self.client.delete(f'/api/topics/{self.topic.pk}/').status_code, 401)
