"""
Migrate existing images in Django database to Cloudinary.
Run this script after configuring your CLOUDINARY credentials in django_backend/.env:
    python3 migrate_to_cloudinary.py
"""

import os
import sys
import django
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'print3d_backend.settings')
django.setup()

from django.conf import settings
from api.models import Topic, Product
import cloudinary
import cloudinary.uploader

if not getattr(settings, 'CLOUDINARY_CLOUD_NAME', None):
    print("Error: CLOUDINARY_CLOUD_NAME is not set. Please add your credentials to .env")
    sys.exit(1)

FRONTEND_PUBLIC = BASE_DIR.parent / 'public'
MEDIA_DIR = BASE_DIR / 'media'

def upload_target(image_ref, folder="printin3d"):
    """
    Uploads a URL or local file to Cloudinary and returns secure_url.
    If already hosted on Cloudinary, returns as-is.
    """
    if not image_ref or not isinstance(image_ref, str):
        return image_ref

    # Already on Cloudinary
    if 'res.cloudinary.com' in image_ref:
        return image_ref

    try:
        # Remote URL
        if image_ref.startswith('http://') or image_ref.startswith('https://'):
            print(f"Uploading remote URL: {image_ref} ...")
            res = cloudinary.uploader.upload(image_ref, folder=folder, resource_type="auto")
            return res.get('secure_url')

        # Local static or media path
        clean_path = image_ref.lstrip('/')
        # Check media folder
        local_file = MEDIA_DIR / clean_path.replace('media/', '', 1)
        if not local_file.exists():
            # Check frontend public folder
            local_file = FRONTEND_PUBLIC / clean_path

        if local_file.exists():
            print(f"Uploading local file: {local_file} ...")
            res = cloudinary.uploader.upload(str(local_file), folder=folder, resource_type="auto")
            return res.get('secure_url')
        else:
            print(f"Warning: File not found locally: {image_ref}")
            return image_ref
    except Exception as e:
        print(f"Failed to upload {image_ref}: {e}")
        return image_ref

def run_migration():
    print(f"Connected to Cloudinary cloud: {settings.CLOUDINARY_CLOUD_NAME}")
    print("Starting migration to Cloudinary...\n")

    # 1. Topics
    topics = Topic.objects.all()
    print(f"Checking {topics.count()} categories/topics...")
    for topic in topics:
        if topic.image and 'res.cloudinary.com' not in topic.image:
            new_url = upload_target(topic.image, folder="printin3d/topics")
            if new_url != topic.image:
                topic.image = new_url
                topic.save()
                print(f"Updated Topic [{topic.title}]: {new_url}")

    # 2. Products
    products = Product.objects.all()
    print(f"\nChecking {products.count()} products...")
    for prod in products:
        changed = False

        # Main images
        updated_images = []
        for img in (prod.images or []):
            new_img = upload_target(img, folder="printin3d/products")
            updated_images.append(new_img)
            if new_img != img:
                changed = True
        prod.images = updated_images

        # Color options
        if prod.color_options:
            updated_colors = []
            for opt in prod.color_options:
                opt_copy = dict(opt)
                opt_imgs = []
                for img in (opt.get('images') or []):
                    new_img = upload_target(img, folder="printin3d/products")
                    opt_imgs.append(new_img)
                    if new_img != img:
                        changed = True
                opt_copy['images'] = opt_imgs
                updated_colors.append(opt_copy)
            prod.color_options = updated_colors

        if changed:
            prod.save()
            print(f"Updated Product [{prod.name}]")

    print("\nMigration to Cloudinary complete!")

if __name__ == '__main__':
    run_migration()
