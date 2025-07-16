from django.core.management.base import BaseCommand
from library.models import Book
import uuid
import qrcode
import os
from django.conf import settings
from django.utils import timezone


class Command(BaseCommand):
    help = 'Fix QR codes for books with broken MinIO URLs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be fixed without making changes',
        )

    def handle(self, *args, **options):
        # Find books with MinIO QR code URLs
        books_with_minio_qr = Book.objects.filter(qr_code_url__contains='minio')
        
        self.stdout.write(
            self.style.SUCCESS(f'Found {books_with_minio_qr.count()} books with MinIO QR URLs')
        )
        
        if options['dry_run']:
            self.stdout.write(self.style.WARNING('DRY RUN - No changes will be made'))
            for book in books_with_minio_qr:
                self.stdout.write(f'Would fix: {book.title} - {book.qr_code_url}')
            return
        
        fixed_count = 0
        
        for book in books_with_minio_qr:
            try:
                # Generate new QR code
                qr_id = uuid.uuid4()
                qr_data = f"bookswap://book/{book.book_id}"
                
                # Create QR code
                qr = qrcode.QRCode(
                    version=1,
                    error_correction=qrcode.constants.ERROR_CORRECT_L,
                    box_size=10,
                    border=4,
                )
                qr.add_data(qr_data)
                qr.make(fit=True)
                
                # Create image
                img = qr.make_image(fill_color="black", back_color="white")
                
                # Save to media directory
                qr_dir = os.path.join(settings.MEDIA_ROOT, 'qr-codes')
                os.makedirs(qr_dir, exist_ok=True)
                file_path = os.path.join(qr_dir, f"{qr_id}.png")
                img.save(file_path)
                
                # Update book record
                old_url = book.qr_code_url
                book.qr_code_url = f"{settings.MEDIA_URL}qr-codes/{qr_id}.png"
                book.save()
                
                fixed_count += 1
                self.stdout.write(f'Fixed QR code for: {book.title}')
                self.stdout.write(f'  Old: {old_url}')
                self.stdout.write(f'  New: {book.qr_code_url}')
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to fix QR code for {book.title}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully fixed {fixed_count} QR codes!')
        )
