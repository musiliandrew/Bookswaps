from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.chat.models import Chats
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Update message statuses for testing read/seen functionality'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔄 Updating message statuses for testing...'))
        
        try:
            # Get test users
            testuser = User.objects.get(username='testuser')
            test_user = User.objects.get(username='Test')
            
            # Get messages between these users
            messages = Chats.objects.filter(
                sender__in=[testuser, test_user],
                receiver__in=[testuser, test_user]
            ).order_by('sent_at')
            
            if messages.count() == 0:
                self.stdout.write(self.style.ERROR('❌ No messages found. Run setup_chat_test first.'))
                return
            
            # Update message statuses to show different states
            for i, message in enumerate(messages):
                if i == 0:
                    # First message: DELIVERED
                    message.status = 'DELIVERED'
                    message.delivered_at = timezone.now()
                    message.save()
                    self.stdout.write(f'✅ Message 1: {message.sender.username} → {message.receiver.username} = DELIVERED')
                elif i == 1:
                    # Second message: SENT (not delivered yet)
                    message.status = 'SENT'
                    message.delivered_at = None
                    message.read_at = None
                    message.save()
                    self.stdout.write(f'✅ Message 2: {message.sender.username} → {message.receiver.username} = SENT')
                else:
                    # Additional messages: READ
                    message.status = 'READ'
                    message.delivered_at = timezone.now()
                    message.read_at = timezone.now()
                    message.save()
                    self.stdout.write(f'✅ Message {i+1}: {message.sender.username} → {message.receiver.username} = READ')
            
            # Create additional test messages with different statuses
            # Message from Test to testuser (DELIVERED)
            new_message1 = Chats.objects.create(
                sender=test_user,
                receiver=testuser,
                content="This message should show as DELIVERED ✓✓",
                message_type='TEXT',
                status='DELIVERED',
                delivered_at=timezone.now()
            )
            self.stdout.write(f'✅ Created new message: {new_message1.sender.username} → {new_message1.receiver.username} = DELIVERED')
            
            # Message from Test to testuser (SENT)
            new_message2 = Chats.objects.create(
                sender=test_user,
                receiver=testuser,
                content="This message should show as SENT ✓",
                message_type='TEXT',
                status='SENT'
            )
            self.stdout.write(f'✅ Created new message: {new_message2.sender.username} → {new_message2.receiver.username} = SENT')
            
            # Message from testuser to Test (will be marked as READ when viewed)
            new_message3 = Chats.objects.create(
                sender=testuser,
                receiver=test_user,
                content="This is my message that should get marked as READ when Test views it",
                message_type='TEXT',
                status='DELIVERED',
                delivered_at=timezone.now()
            )
            self.stdout.write(f'✅ Created new message: {new_message3.sender.username} → {new_message3.receiver.username} = DELIVERED')
            
            self.stdout.write(self.style.SUCCESS('\n🎉 Message statuses updated successfully!'))
            self.stdout.write(self.style.SUCCESS('\n📱 Testing Instructions:'))
            self.stdout.write('1. Login as "testuser"')
            self.stdout.write('2. Go to chat with "Test"')
            self.stdout.write('3. Check message status icons:')
            self.stdout.write('   - ✓ = SENT (single gray checkmark)')
            self.stdout.write('   - ✓✓ = DELIVERED (double gray checkmarks)')
            self.stdout.write('   - ✓✓ = READ (double blue/teal checkmarks)')
            self.stdout.write('4. Scroll to view messages and watch them get marked as read')
            
        except User.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(f'❌ User not found: {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {e}'))
