from django.conf import settings
from django.contrib.admin import AdminSite
from django_otp.admin import OTPAdminSite

class SecureAdminSite(OTPAdminSite if settings.REQUIRE_ADMIN_MFA else AdminSite):
    site_header = 'Print-IN 3D administration'
