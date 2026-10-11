from getpass import getpass
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django_otp.plugins.otp_totp.models import TOTPDevice

class Command(BaseCommand):
    help = 'Enroll a staff authenticator from a private interactive console. Never paste enrollment secrets into chat or logs.'
    def add_arguments(self, parser):
        parser.add_argument('username')
    def handle(self, *args, **options):
        try: user = get_user_model().objects.get(username=options['username'], is_staff=True, is_active=True)
        except get_user_model().DoesNotExist: raise CommandError('Active staff account not found.')
        if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            raise CommandError('An authenticator is already enrolled. Manage recovery through the secured admin console.')
        device, _ = TOTPDevice.objects.get_or_create(user=user, name='Administrator authenticator', defaults={'confirmed': False})
        self.stdout.write('Add this private enrollment URI to your authenticator app. Do not share it:')
        self.stdout.write(device.config_url)
        code = getpass('Enter the current six digit code to confirm enrollment: ')
        if not device.verify_token(code): raise CommandError('Code was not accepted. Enrollment remains unconfirmed.')
        device.confirmed = True; device.save(update_fields=['confirmed'])
        self.stdout.write(self.style.SUCCESS('Authenticator confirmed.'))
