from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.users.models import Follows
from backend.chat.models import Chats
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup chat test: testuser follows Test and sends a chat message'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-users',
            action='store_true',
            help='Create test users if they don\'t exist',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Setting up chat test scenario...'))
        
        try:
            with transaction.atomic():
                # Get or create users
                testuser, created_testuser = User.objects.get_or_create(
                    username='testuser',
                    defaults={
                        'email': 'testuser@example.com',
                        'first_name': 'Test',
                        'last_name': 'User',
                        'is_active': True,
                    }
                )
                
                if created_testuser:
                    testuser.set_password('testpass123')
                    testuser.save()
                    self.stdout.write(f'✅ Created user: {testuser.username}')
                else:
                    self.stdout.write(f'📝 Found existing user: {testuser.username}')

                test_user, created_test = User.objects.get_or_create(
                    username='Test',
                    defaults={
                        'email': 'test@example.com',
                        'first_name': 'Test',
                        'last_name': 'Account',
                        'is_active': True,
                    }
                )
                
                if created_test:
                    test_user.set_password('testpass123')
                    test_user.save()
                    self.stdout.write(f'✅ Created user: {test_user.username}')
                else:
                    self.stdout.write(f'📝 Found existing user: {test_user.username}')

                # Create follow relationship: testuser follows Test
                follow, created_follow = Follows.objects.get_or_create(
                    follower=testuser,
                    followed=test_user,
                    defaults={'active': True, 'source': 'Chat'}
                )
                
                if created_follow:
                    self.stdout.write(f'✅ Created follow: {testuser.username} → {test_user.username}')
                else:
                    self.stdout.write(f'📝 Follow already exists: {testuser.username} → {test_user.username}')

                # Create chat message from testuser to Test
                chat_message, created_chat = Chats.objects.get_or_create(
                    sender=testuser,
                    receiver=test_user,
                    content="Hey Test! This is a test message from testuser. How are you doing? 👋",
                    defaults={
                        'message_type': 'TEXT',
                        'status': 'SENT'
                    }
                )
                
                if created_chat:
                    self.stdout.write(f'✅ Created chat message: {testuser.username} → {test_user.username}')
                    self.stdout.write(f'   Message: "{chat_message.content}"')
                else:
                    self.stdout.write(f'📝 Chat message already exists')

                # Create a response from Test to testuser
                response_message, created_response = Chats.objects.get_or_create(
                    sender=test_user,
                    receiver=testuser,
                    content="Hello testuser! Thanks for reaching out. I'm doing great! How about you? 😊",
                    defaults={
                        'message_type': 'TEXT',
                        'status': 'SENT'
                    }
                )
                
                if created_response:
                    self.stdout.write(f'✅ Created response message: {test_user.username} → {testuser.username}')
                    self.stdout.write(f'   Message: "{response_message.content}"')
                else:
                    self.stdout.write(f'📝 Response message already exists')

                # Display summary
                self.stdout.write(self.style.SUCCESS('\n🎉 Test scenario setup complete!'))
                self.stdout.write(self.style.SUCCESS('\n📋 Summary:'))
                self.stdout.write(f'   • User 1: {testuser.username} (ID: {testuser.user_id})')
                self.stdout.write(f'   • User 2: {test_user.username} (ID: {test_user.user_id})')
                self.stdout.write(f'   • Follow relationship: {testuser.username} follows {test_user.username}')
                self.stdout.write(f'   • Chat messages: 2 messages exchanged')
                
                self.stdout.write(self.style.SUCCESS('\n🔑 Login credentials:'))
                self.stdout.write(f'   • Username: testuser, Password: testpass123')
                self.stdout.write(f'   • Username: Test, Password: testpass123')
                
                self.stdout.write(self.style.SUCCESS('\n📱 Next steps:'))
                self.stdout.write('   1. Login to frontend as "testuser"')
                self.stdout.write('   2. Go to chat section')
                self.stdout.write('   3. You should see conversation with "Test"')
                self.stdout.write('   4. Check message positioning and usernames')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error setting up test scenario: {str(e)}'))
            raise e
