from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.users.models import Follows
from backend.chat.models import Chats

User = get_user_model()

class Command(BaseCommand):
    help = 'Verify the chat test scenario data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Verifying chat test scenario...'))
        
        try:
            # Get users
            testuser = User.objects.get(username='testuser')
            test_user = User.objects.get(username='Test')
            
            self.stdout.write(f'✅ Found testuser: {testuser.username} (ID: {testuser.user_id})')
            self.stdout.write(f'✅ Found Test: {test_user.username} (ID: {test_user.user_id})')
            
            # Check follow relationship
            follow = Follows.objects.filter(follower=testuser, followed=test_user).first()
            if follow:
                self.stdout.write(f'✅ Follow relationship exists: {testuser.username} → {test_user.username}')
                self.stdout.write(f'   Active: {follow.active}, Source: {follow.source}')
            else:
                self.stdout.write(self.style.ERROR('❌ No follow relationship found'))
            
            # Check chat messages
            messages = Chats.objects.filter(
                sender__in=[testuser, test_user],
                receiver__in=[testuser, test_user]
            ).order_by('sent_at')
            
            self.stdout.write(f'✅ Found {messages.count()} chat messages:')
            
            for i, msg in enumerate(messages, 1):
                sender_name = msg.sender.username
                receiver_name = msg.receiver.username
                self.stdout.write(f'   {i}. {sender_name} → {receiver_name}: "{msg.content[:50]}..."')
                self.stdout.write(f'      Status: {msg.status}, Type: {msg.message_type}')
                self.stdout.write(f'      Sent: {msg.sent_at}')
                
                # Show message structure for debugging
                self.stdout.write(f'      Message ID: {msg.chat_id}')
                self.stdout.write(f'      Sender ID: {msg.sender.user_id}')
                self.stdout.write(f'      Receiver ID: {msg.receiver.user_id}')
                self.stdout.write('')
            
            # Summary for frontend testing
            self.stdout.write(self.style.SUCCESS('\n🎯 Frontend Testing Instructions:'))
            self.stdout.write('1. Open http://localhost:5173')
            self.stdout.write('2. Login with:')
            self.stdout.write('   Username: testuser')
            self.stdout.write('   Password: testpass123')
            self.stdout.write('3. Navigate to Chat section')
            self.stdout.write('4. Look for conversation with "Test"')
            self.stdout.write('5. Verify:')
            self.stdout.write('   - Your messages appear on RIGHT with "You" label')
            self.stdout.write('   - Test\'s messages appear on LEFT with "Test" username')
            self.stdout.write('   - Your messages have dark teal color')
            self.stdout.write('   - Test\'s messages have white background')
            
        except User.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(f'❌ User not found: {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {e}'))
