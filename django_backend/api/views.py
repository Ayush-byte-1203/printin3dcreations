import uuid
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.files.storage import default_storage
from django.db import transaction
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import BasePermission, SAFE_METHODS, AllowAny, IsAdminUser
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from .models import Topic, Product, AdminSession
from .serializers import TopicSerializer, ProductSerializer
from .security import LoginIPThrottle, LoginAccountThrottle, WriteThrottle
from .uploads import clean_image

class PublicReadAdminWrite(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(request.user and request.user.is_authenticated and request.user.is_active and request.user.is_staff)
    def has_object_permission(self, request, view, obj):
        # This catalog is public; all active staff have catalog management authority.
        return self.has_permission(request, view)

class TopicViewSet(viewsets.ModelViewSet):
    permission_classes = [PublicReadAdminWrite]
    throttle_classes = [WriteThrottle]
    throttle_scope = 'admin_write'
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [PublicReadAdminWrite]
    throttle_classes = [WriteThrottle]
    throttle_scope = 'admin_write'
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    def get_queryset(self):
        queryset = Product.objects.all()
        topic_id = self.request.query_params.get('topic')
        if topic_id is not None:
            if not topic_id.isascii() or not topic_id.isdigit() or len(topic_id) > 10:
                raise ValidationError({'topic': 'Use a numeric category ID.'})
            queryset = queryset.filter(topic_id=int(topic_id))
        return queryset

class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    parser_classes = [JSONParser, FormParser]
    throttle_classes = [LoginIPThrottle, LoginAccountThrottle]
    def post(self, request):
        username, password = request.data.get('username'), request.data.get('password')
        if not isinstance(username, str) or not isinstance(password, str) or len(username) > 150 or len(password) > 1024:
            return Response({'error': 'Invalid administrator credentials'}, status=401)
        user = authenticate(username=username, password=password)
        if user is None or not user.is_active or not user.is_staff:
            return Response({'error': 'Invalid administrator credentials'}, status=401)
        with transaction.atomic():
            user = get_user_model().objects.select_for_update().get(pk=user.pk)
            devices = TOTPDevice.objects.filter(user=user, confirmed=True).select_for_update()
            requires_mfa = settings.REQUIRE_ADMIN_MFA or devices.exists()
            verified = False
            if requires_mfa:
                code = str(request.data.get('otp_code', ''))
                if not code:
                    return Response({'code': 'mfa_required', 'error': 'Authenticator verification required'}, status=401)
                if len(code) != 6 or not code.isascii() or not code.isdigit():
                    return Response({'error': 'Invalid verification code'}, status=401)
                for device in devices:
                    if device.verify_token(code):
                        verified = True
                        break
                if not verified:
                    return Response({'error': 'Invalid verification code'}, status=401)
            # Rotate credentials after every successful login. Old tokens cannot be reused.
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
            AdminSession.objects.create(token=token, mfa_verified=verified)
        return Response({'success': True, 'token': token.key, 'username': user.username}, status=200)

class AdminLogoutView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        request.auth.delete()
        return Response(status=204)

class ImageUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = (MultiPartParser, FormParser)
    throttle_classes = [WriteThrottle]
    throttle_scope = 'upload'
    def post(self, request, *args, **kwargs):
        content, extension = clean_image(request.FILES.get('image'))
        saved_path = default_storage.save('images/' + uuid.uuid4().hex + extension, content)
        return Response({'success': True, 'url': request.build_absolute_uri(settings.MEDIA_URL + saved_path)}, status=status.HTTP_201_CREATED)
