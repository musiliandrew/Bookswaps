from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.library.models import Book, PopularBook
import random

class Command(BaseCommand):
    help = 'Seed PopularBook table with existing books'

    def handle(self, *args, **kwargs):
        books = Book.objects.all()
        if not books:
            self.stdout.write(self.style.ERROR('No books found in the database.'))
            return

        for book in books:
            PopularBook.objects.get_or_create(
                book=book,
                defaults={
                    'swap_count': random.randint(1, 20),
                    'last_updated': timezone.now(),
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(books)} PopularBook entries.'))