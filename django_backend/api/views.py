from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
from rest_framework.permissions import BasePermission, SAFE_METHODS, AllowAny, IsAdminUser
from rest_framework.authtoken.models import Token
from django.conf import settings
try:
    import cloudinary.uploader
except ImportError:
    cloudinary = None

from .models import Topic, Product
from .serializers import TopicSerializer, ProductSerializer

class PublicReadAdminWrite(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )


class TopicViewSet(viewsets.ModelViewSet):
    permission_classes = [PublicReadAdminWrite]
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [PublicReadAdminWrite]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        topic_id = self.request.query_params.get('topic', None)
        if topic_id is not None:
            queryset = queryset.filter(topic_id=topic_id)
        return queryset

class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user is not None and user.is_staff:
            return Response({
                'success': True,
                'token': Token.objects.get_or_create(user=user)[0].key,
                'username': user.username
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': 'Invalid administrator credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

class AdminLogoutView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        if request.auth:
            request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ImageUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        # If Cloudinary is configured, upload directly to Cloudinary
        if getattr(settings, 'CLOUDINARY_CLOUD_NAME', None):
            try:
                upload_result = cloudinary.uploader.upload(
                    file_obj,
                    folder="printin3d/images",
                    resource_type="auto"
                )
                return Response({
                    'success': True,
                    'url': upload_result.get('secure_url')
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'success': False,
                    'error': f"Cloudinary upload failed: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Fallback to local storage if Cloudinary credentials are not configured yet
        ext = os.path.splitext(file_obj.name)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join('images', unique_filename)
        
        saved_path = default_storage.save(file_path, ContentFile(file_obj.read()))
        
        request_url = request.build_absolute_uri('/')
        if request_url.endswith('/'):
            request_url = request_url[:-1]
        
        public_url = f"{request_url}/media/{saved_path}"
        
        return Response({
            'success': True,
            'url': public_url
        }, status=status.HTTP_201_CREATED)

