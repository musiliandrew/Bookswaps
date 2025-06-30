#!/usr/bin/env python3
"""
Database Integrity Check for BookSwaps
Comprehensive validation of database constraints, data integrity, and performance
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.db import connection, transaction, models
from django.core.exceptions import ValidationError
from django.db.models import Count, Q
import logging

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from backend.users.models import CustomUser, Follows
from backend.library.models import Book, Bookmark, Library, PopularBook
from backend.swaps.models import Swap, Location, Notification
from backend.discussions.models import Discussion, Note, Like, Upvote, Downvote, Society, SocietyMember
from backend.chat.models import Chats

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseIntegrityChecker:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.stats = {}
    
    def log_error(self, message):
        self.errors.append(message)
        logger.error(f"❌ {message}")
    
    def log_warning(self, message):
        self.warnings.append(message)
        logger.warning(f"⚠️  {message}")
    
    def log_info(self, message):
        logger.info(f"✅ {message}")
    
    def check_user_constraints(self):
        """Check user model constraints and data integrity"""
        logger.info("🔍 Checking User Constraints...")
        
        # Check for duplicate usernames
        duplicate_usernames = CustomUser.objects.values('username').annotate(
            count=Count('username')
        ).filter(count__gt=1)
        
        if duplicate_usernames.exists():
            self.log_error(f"Found {duplicate_usernames.count()} duplicate usernames")
        
        # Check for duplicate emails
        duplicate_emails = CustomUser.objects.values('email').annotate(
            count=Count('email')
        ).filter(count__gt=1)
        
        if duplicate_emails.exists():
            self.log_error(f"Found {duplicate_emails.count()} duplicate emails")
        
        # Check for invalid birth dates
        invalid_birth_dates = CustomUser.objects.filter(
            birth_date__gt=django.utils.timezone.now().date()
        ).count()
        
        if invalid_birth_dates > 0:
            self.log_error(f"Found {invalid_birth_dates} users with future birth dates")
        
        # Check profile completion consistency
        users_with_incomplete_profiles = CustomUser.objects.filter(
            profile_completed=True
        ).filter(
            Q(username__isnull=True) | Q(username='') |
            Q(email__isnull=True) | Q(email='')
        ).count()
        
        if users_with_incomplete_profiles > 0:
            self.log_warning(f"Found {users_with_incomplete_profiles} users marked as complete but missing required fields")
        
        self.stats['total_users'] = CustomUser.objects.count()
        self.stats['active_users'] = CustomUser.objects.filter(is_active=True).count()
        self.log_info(f"User checks completed. Total: {self.stats['total_users']}, Active: {self.stats['active_users']}")
    
    def check_book_constraints(self):
        """Check book model constraints and data integrity"""
        logger.info("🔍 Checking Book Constraints...")
        
        # Check for duplicate ISBNs (should be unique)
        duplicate_isbns = Book.objects.exclude(isbn__isnull=True).exclude(isbn='').values('isbn').annotate(
            count=Count('isbn')
        ).filter(count__gt=1)
        
        if duplicate_isbns.exists():
            self.log_warning(f"Found {duplicate_isbns.count()} duplicate ISBNs (this may be intentional for multiple copies)")
        
        # Check for books with invalid copy counts
        invalid_copy_counts = Book.objects.filter(copy_count__lt=1).count()
        if invalid_copy_counts > 0:
            self.log_error(f"Found {invalid_copy_counts} books with invalid copy counts")
        
        # Check for books with invalid years
        invalid_years = Book.objects.filter(
            Q(year__lt=0) | Q(year__gt=9999)
        ).count()
        if invalid_years > 0:
            self.log_error(f"Found {invalid_years} books with invalid publication years")
        
        # Check for orphaned books (no owner)
        orphaned_books = Book.objects.filter(user__isnull=True).count()
        if orphaned_books > 0:
            self.log_warning(f"Found {orphaned_books} books without owners")
        
        self.stats['total_books'] = Book.objects.count()
        self.stats['available_books'] = Book.objects.filter(
            Q(available_for_exchange=True) | Q(available_for_borrow=True)
        ).count()
        self.log_info(f"Book checks completed. Total: {self.stats['total_books']}, Available: {self.stats['available_books']}")
    
    def check_swap_constraints(self):
        """Check swap model constraints and data integrity"""
        logger.info("🔍 Checking Swap Constraints...")
        
        # Check for swaps with same initiator and receiver
        self_swaps = Swap.objects.filter(initiator=models.F('receiver')).count()
        if self_swaps > 0:
            self.log_error(f"Found {self_swaps} swaps where user is swapping with themselves")
        
        # Check for swaps with invalid status transitions
        invalid_status_swaps = Swap.objects.exclude(
            status__in=['Requested', 'Accepted', 'Confirmed', 'Completed', 'Cancelled']
        ).count()
        if invalid_status_swaps > 0:
            self.log_error(f"Found {invalid_status_swaps} swaps with invalid status")
        
        # Check for swaps with missing required fields
        incomplete_swaps = Swap.objects.filter(
            Q(initiator__isnull=True) | Q(initiator_book__isnull=True)
        ).count()
        if incomplete_swaps > 0:
            self.log_error(f"Found {incomplete_swaps} swaps missing required fields")
        
        self.stats['total_swaps'] = Swap.objects.count()
        self.stats['active_swaps'] = Swap.objects.exclude(status__in=['Completed', 'Cancelled']).count()
        self.log_info(f"Swap checks completed. Total: {self.stats['total_swaps']}, Active: {self.stats['active_swaps']}")
    
    def check_follow_constraints(self):
        """Check follow model constraints and data integrity"""
        logger.info("🔍 Checking Follow Constraints...")
        
        # Check for self-follows
        self_follows = Follows.objects.filter(follower=models.F('followed')).count()
        if self_follows > 0:
            self.log_error(f"Found {self_follows} users following themselves")
        
        # Check for duplicate follows
        duplicate_follows = Follows.objects.values('follower', 'followed').annotate(
            count=Count('follow_id')
        ).filter(count__gt=1)
        
        if duplicate_follows.exists():
            self.log_error(f"Found {duplicate_follows.count()} duplicate follow relationships")
        
        # Check mutual follow consistency
        inconsistent_mutual = Follows.objects.filter(
            is_mutual=True
        ).exclude(
            followed__in=Follows.objects.filter(
                follower=models.OuterRef('followed'),
                followed=models.OuterRef('follower'),
                active=True
            ).values('follower')
        ).count()
        
        if inconsistent_mutual > 0:
            self.log_warning(f"Found {inconsistent_mutual} follows marked as mutual but not reciprocated")
        
        self.stats['total_follows'] = Follows.objects.count()
        self.stats['active_follows'] = Follows.objects.filter(active=True).count()
        self.log_info(f"Follow checks completed. Total: {self.stats['total_follows']}, Active: {self.stats['active_follows']}")
    
    def check_discussion_constraints(self):
        """Check discussion model constraints and data integrity"""
        logger.info("🔍 Checking Discussion Constraints...")
        
        # Check for discussions with invalid types
        invalid_types = Discussion.objects.exclude(
            type__in=['Article', 'Synopsis', 'Query']
        ).count()
        if invalid_types > 0:
            self.log_error(f"Found {invalid_types} discussions with invalid types")
        
        # Check for orphaned notes
        orphaned_notes = Note.objects.filter(discussion__isnull=True).count()
        if orphaned_notes > 0:
            self.log_error(f"Found {orphaned_notes} orphaned notes")
        
        # Check for circular note references
        circular_notes = Note.objects.filter(parent_note=models.F('note_id')).count()
        if circular_notes > 0:
            self.log_error(f"Found {circular_notes} notes that are their own parent")
        
        self.stats['total_discussions'] = Discussion.objects.count()
        self.stats['total_notes'] = Note.objects.count()
        self.log_info(f"Discussion checks completed. Discussions: {self.stats['total_discussions']}, Notes: {self.stats['total_notes']}")
    
    def check_database_indexes(self):
        """Check database indexes and performance"""
        logger.info("🔍 Checking Database Indexes...")
        
        with connection.cursor() as cursor:
            # Check for missing indexes on foreign keys
            cursor.execute("""
                SELECT schemaname, tablename, attname, n_distinct, correlation
                FROM pg_stats
                WHERE schemaname = 'public'
                AND n_distinct > 100
                ORDER BY n_distinct DESC
                LIMIT 10;
            """)
            
            high_cardinality_columns = cursor.fetchall()
            if high_cardinality_columns:
                self.log_info(f"Found {len(high_cardinality_columns)} high-cardinality columns that may benefit from indexing")
        
        self.log_info("Database index check completed")
    
    def check_data_consistency(self):
        """Check cross-model data consistency"""
        logger.info("🔍 Checking Data Consistency...")
        
        # Check library entries consistency
        inconsistent_library = Library.objects.filter(
            book__user__isnull=True
        ).count()
        if inconsistent_library > 0:
            self.log_warning(f"Found {inconsistent_library} library entries for books without owners")
        
        # Check bookmark consistency
        invalid_bookmarks = Bookmark.objects.filter(
            Q(book__isnull=True) | Q(user__isnull=True)
        ).count()
        if invalid_bookmarks > 0:
            self.log_error(f"Found {invalid_bookmarks} invalid bookmarks")
        
        # Check notification consistency
        orphaned_notifications = Notification.objects.filter(
            user__isnull=True
        ).count()
        if orphaned_notifications > 0:
            self.log_error(f"Found {orphaned_notifications} orphaned notifications")
        
        self.log_info("Data consistency check completed")
    
    def run_all_checks(self):
        """Run all integrity checks"""
        logger.info("🚀 Starting Database Integrity Check...")
        logger.info("=" * 60)
        
        try:
            self.check_user_constraints()
            self.check_book_constraints()
            self.check_swap_constraints()
            self.check_follow_constraints()
            self.check_discussion_constraints()
            self.check_database_indexes()
            self.check_data_consistency()
            
        except Exception as e:
            self.log_error(f"Unexpected error during integrity check: {str(e)}")
        
        # Print summary
        logger.info("=" * 60)
        logger.info("📊 INTEGRITY CHECK SUMMARY")
        logger.info("=" * 60)
        
        for key, value in self.stats.items():
            logger.info(f"📈 {key.replace('_', ' ').title()}: {value}")
        
        if self.errors:
            logger.error(f"❌ Found {len(self.errors)} CRITICAL ERRORS:")
            for error in self.errors:
                logger.error(f"   • {error}")
        
        if self.warnings:
            logger.warning(f"⚠️  Found {len(self.warnings)} WARNINGS:")
            for warning in self.warnings:
                logger.warning(f"   • {warning}")
        
        if not self.errors and not self.warnings:
            logger.info("✅ All integrity checks passed!")
        
        return len(self.errors) == 0

def main():
    checker = DatabaseIntegrityChecker()
    success = checker.run_all_checks()
    
    if not success:
        logger.error("❌ Database integrity check failed!")
        sys.exit(1)
    else:
        logger.info("✅ Database integrity check completed successfully!")
        sys.exit(0)

if __name__ == "__main__":
    main()
