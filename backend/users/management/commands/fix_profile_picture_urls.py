from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Fix profile picture URLs to use localhost instead of minio service name'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Find users with profile pictures that use the internal minio URL
        users_to_fix = User.objects.filter(
            profile_picture__isnull=False,
            profile_picture__contains='minio:9000'
        )
        
        count = users_to_fix.count()
        self.stdout.write(f'Found {count} users with profile pictures to fix')
        
        fixed_count = 0
        for user in users_to_fix:
            old_url = user.profile_picture
            # Replace internal Docker service name with localhost
            new_url = old_url.replace('minio:9000', 'localhost:9000')
            user.profile_picture = new_url
            user.save(update_fields=['profile_picture'])
            
            self.stdout.write(f'Fixed {user.username}: {old_url} -> {new_url}')
            fixed_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully fixed {fixed_count} profile picture URLs')
        )
