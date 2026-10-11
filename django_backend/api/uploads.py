from io import BytesIO
import warnings
from PIL import Image, UnidentifiedImageError
from django.core.files.base import ContentFile
from rest_framework.exceptions import ValidationError

MAX_BYTES = 3 * 1024 * 1024
MAX_PIXELS = 16_000_000

def clean_image(file):
    if not file or file.size <= 0 or file.size > MAX_BYTES:
        raise ValidationError('Use a JPEG, PNG or WebP image up to 3 MB.')
    expected = {'image/jpeg': 'JPEG', 'image/png': 'PNG', 'image/webp': 'WEBP'}.get(file.content_type)
    if not expected:
        raise ValidationError('Only JPEG, PNG and WebP images are allowed.')
    try:
        raw = file.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES: raise ValueError('size')
        with warnings.catch_warnings():
            warnings.simplefilter('error', Image.DecompressionBombWarning)
            with Image.open(BytesIO(raw)) as image:
                if image.format != expected or image.width * image.height > MAX_PIXELS or max(image.size) > 8192 or getattr(image, 'n_frames', 1) != 1:
                    raise ValueError('image')
                image.verify()
            with Image.open(BytesIO(raw)) as image:
                image.load()
                clean = image.convert('RGB' if expected == 'JPEG' else 'RGBA')
                output = BytesIO()
                clean.save(output, format=expected)
        if output.tell() > MAX_BYTES: raise ValueError('size')
        return ContentFile(output.getvalue()), {'JPEG': '.jpg', 'PNG': '.png', 'WEBP': '.webp'}[expected]
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
        raise ValidationError('Invalid, oversized or unsafe image.') from error
