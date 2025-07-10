# Generated manually to handle existing table

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('discussions', '0010_add_voting_tables'),
        ('users', '0001_initial'),
    ]

    operations = [
        # This migration is marked as fake since the table already exists
        # The DiscussionBookmark model will work with the existing table
    ]
