import hashlib
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.throttling import SimpleRateThrottle, ScopedRateThrottle

class ExpiringAdminTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        if not user.is_active or not user.is_staff:
            raise AuthenticationFailed('Administrator access required.')
        if token.created <= timezone.now() - timedelta(hours=8):
            token.delete()
            raise AuthenticationFailed('Session expired. Sign in again.')
        from .models import AdminSession
        session = AdminSession.objects.filter(token=token).first()
        if session is None or (settings.REQUIRE_ADMIN_MFA and not session.mfa_verified):
            raise AuthenticationFailed('Sign in again to verify your administrator session.')
        return user, token

class LoginIPThrottle(SimpleRateThrottle):
    scope = 'login_ip'
    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}

class LoginAccountThrottle(SimpleRateThrottle):
    scope = 'login_account'
    def get_cache_key(self, request, view):
        username = str(request.data.get('username', '')).strip().casefold()[:150]
        digest = hashlib.sha256(username.encode()).hexdigest()
        return self.cache_format % {'scope': self.scope, 'ident': digest}

class WriteThrottle(ScopedRateThrottle):
    def allow_request(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return super().allow_request(request, view)
