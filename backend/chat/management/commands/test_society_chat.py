"""
Django management command to test society chat functionality
Usage: python manage.py test_society_chat
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from backend.discussions.models import Society, SocietyMember, SocietyMessage
import random
import string
from datetime import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Test society chat functionality by creating a test user and sending messages'

    def add_arguments(self, parser):
        parser.add_argument(
            '--society-name',
            type=str,
            default='Test Book Society 181743',
            help='Name of the society to test (default: Test Book Society 181743)'
        )
        parser.add_argument(
            '--cleanup',
            action='store_true',
            help='Clean up test users after testing'
        )

    def handle(self, *args, **options):
        self.society_name = options['society_name']
        self.cleanup = options['cleanup']
        
        self.stdout.write(self.style.SUCCESS('🚀 Starting Society Chat Test'))
        self.stdout.write('=' * 60)
        
        try:
            # Step 1: Find or create society
            society = self.find_or_create_society()
            if not society:
                return
            
            # Step 2: Create test user
            test_user = self.create_test_user()
            if not test_user:
                return
            
            # Step 3: Join society
            if not self.join_society(test_user, society):
                return
            
            # Step 4: Get existing messages
            existing_messages = self.get_existing_messages(society)
            
            # Step 5: Send test messages
            self.send_test_messages(test_user, society, existing_messages)
            
            # Step 6: Cleanup if requested
            if self.cleanup:
                self.cleanup_test_data(test_user)
            
            self.stdout.write('=' * 60)
            self.stdout.write(self.style.SUCCESS('🎉 Society Chat Test Completed Successfully!'))
            self.stdout.write(f'✅ Test user: {test_user.username}')
            self.stdout.write(f'✅ Society: {society.name}')
            self.stdout.write('✅ Check your chat interface to see the messages!')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Test failed: {str(e)}'))

    def find_or_create_society(self):
        """Find existing society or create it if it doesn't exist"""
        self.stdout.write(f'🔍 Looking for society: {self.society_name}')
        
        try:
            society = Society.objects.filter(name__icontains=self.society_name).first()
            
            if society:
                self.stdout.write(self.style.SUCCESS(f'✅ Found existing society: {society.name}'))
                return society
            else:
                self.stdout.write(f'⚠️  Society not found, creating: {self.society_name}')
                
                # Create a test admin user for the society
                admin_user = self.get_or_create_admin_user()
                
                society = Society.objects.create(
                    name=self.society_name,
                    description='Automated test society for book discussions',
                    creator=admin_user,
                    visibility='public',
                    focus_type='Book',
                    status='ACTIVE'
                )
                
                # Make admin user a member
                SocietyMember.objects.create(
                    society=society,
                    user=admin_user,
                    role='admin',
                    status='ACTIVE'
                )
                
                self.stdout.write(self.style.SUCCESS(f'✅ Created society: {society.name}'))
                return society
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error with society: {str(e)}'))
            return None

    def get_or_create_admin_user(self):
        """Get or create an admin user for the society"""
        admin_user, created = User.objects.get_or_create(
            username='society_admin',
            defaults={
                'email': 'admin@bookswap.com',
                'first_name': 'Society',
                'last_name': 'Admin',
                'is_active': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('✅ Created admin user for society')
        return admin_user

    def create_test_user(self):
        """Create a test user"""
        random_suffix = ''.join(random.choices(string.digits, k=4))
        username = f'testuser_{random_suffix}'

        self.stdout.write(f'👤 Creating test user: {username}')

        try:
            user = User.objects.create_user(
                username=username,
                email=f'{username}@example.com',
                password='testpass123'
            )

            self.stdout.write(self.style.SUCCESS(f'✅ Created test user: {user.username}'))
            return user

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error creating user: {str(e)}'))
            return None

    def join_society(self, user, society):
        """Make user join the society"""
        self.stdout.write(f'🤝 Adding {user.username} to society')
        
        try:
            member, created = SocietyMember.objects.get_or_create(
                society=society,
                user=user,
                defaults={
                    'role': 'member',
                    'status': 'ACTIVE'
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ {user.username} joined society'))
            else:
                self.stdout.write(self.style.SUCCESS(f'✅ {user.username} already a member'))
            
            return True
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error joining society: {str(e)}'))
            return False

    def get_existing_messages(self, society):
        """Get existing messages from the society"""
        self.stdout.write('📨 Fetching existing messages...')
        
        try:
            messages = SocietyMessage.objects.filter(
                society=society,
                status='ACTIVE'
            ).order_by('-created_at')[:5]
            
            self.stdout.write(self.style.SUCCESS(f'✅ Found {messages.count()} existing messages'))
            return list(messages)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error fetching messages: {str(e)}'))
            return []

    def send_test_messages(self, user, society, existing_messages):
        """Send test messages to the society"""
        self.stdout.write('💬 Sending test messages...')
        
        messages_to_send = [
            f"Hello everyone! 👋 I'm {user.username} and I just joined this amazing book society! Looking forward to discussing great books with you all. 📚✨",
        ]
        
        # Add reply with mention if there are existing messages
        if existing_messages:
            target_message = existing_messages[0]
            sender_username = target_message.user.username
            reply_message = f"@{sender_username} Great point! I completely agree with your perspective. Have you read any books that explore similar themes? I'd love to get some recommendations! 🤔📖"
            messages_to_send.append(reply_message)
        else:
            discussion_message = "What's everyone currently reading? I'm always looking for new book recommendations! Drop your current reads below 👇📚"
            messages_to_send.append(discussion_message)
        
        # Add final message
        messages_to_send.append("Thanks for welcoming me to the society! I'm excited to be part of this book-loving community. Happy reading everyone! 🎉📚")
        
        # Send all messages
        for i, content in enumerate(messages_to_send, 1):
            try:
                message = SocietyMessage.objects.create(
                    society=society,
                    user=user,
                    content=content,
                    status='ACTIVE'
                )
                
                self.stdout.write(self.style.SUCCESS(f'✅ Message {i}/{len(messages_to_send)} sent: {content[:50]}...'))
                
                # Simulate some delay between messages
                import time
                time.sleep(1)
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error sending message {i}: {str(e)}'))

    def cleanup_test_data(self, user):
        """Clean up test data"""
        self.stdout.write('🧹 Cleaning up test data...')
        
        try:
            # Delete test user's messages
            deleted_messages = SocietyMessage.objects.filter(user=user).delete()
            self.stdout.write(f'✅ Deleted {deleted_messages[0]} messages')
            
            # Delete test user's memberships
            deleted_memberships = SocietyMember.objects.filter(user=user).delete()
            self.stdout.write(f'✅ Deleted {deleted_memberships[0]} memberships')
            
            # Delete test user
            user.delete()
            self.stdout.write(f'✅ Deleted test user')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error during cleanup: {str(e)}'))
