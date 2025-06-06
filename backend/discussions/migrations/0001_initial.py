# Generated by Django 5.2 on 2025-04-28 18:22

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Discussion',
            fields=[
                ('discussion_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('type', models.CharField(choices=[('Article', 'Article'), ('Synopsis', 'Synopsis'), ('Query', 'Query')], max_length=20)),
                ('title', models.CharField(max_length=200)),
                ('content', models.TextField()),
                ('tags', models.JSONField(default=list)),
                ('media_urls', models.JSONField(default=list)),
                ('spoiler_flag', models.BooleanField(default=False)),
                ('status', models.CharField(default='active', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_edited_at', models.DateTimeField(auto_now=True)),
                ('views', models.PositiveIntegerField(default=0)),
            ],
            options={
                'db_table': 'discussions',
                'db_table_comment': 'Stores user discussions',
            },
        ),
        migrations.CreateModel(
            name='Note',
            fields=[
                ('note_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('content', models.TextField()),
                ('depth', models.PositiveIntegerField(default=0)),
                ('likes', models.PositiveIntegerField(default=0)),
                ('status', models.CharField(default='active', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'notes',
                'db_table_comment': 'Stores comments on discussions',
            },
        ),
        migrations.CreateModel(
            name='Reprint',
            fields=[
                ('reprint_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('comment', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'reprints',
                'db_table_comment': 'Stores discussion shares',
            },
        ),
        migrations.CreateModel(
            name='Society',
            fields=[
                ('society_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('visibility', models.CharField(choices=[('public', 'Public'), ('private', 'Private')], default='public', max_length=20)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('INACTIVE', 'Inactive'), ('ARCHIVED', 'Archived')], default='ACTIVE', max_length=20)),
                ('focus_type', models.CharField(blank=True, choices=[('Book', 'Book'), ('Genre', 'Genre')], max_length=20, null=True)),
                ('focus_id', models.CharField(blank=True, db_comment='UUID for Book or genre string', max_length=36, null=True)),
                ('icon_url', models.URLField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'societies',
                'db_table_comment': 'Stores Societies for discussions and group chats',
            },
        ),
        migrations.CreateModel(
            name='SocietyEvent',
            fields=[
                ('event_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('event_date', models.DateTimeField()),
                ('location', models.CharField(blank=True, max_length=200, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'society_events',
                'db_table_comment': 'Stores Society events',
            },
        ),
        migrations.CreateModel(
            name='SocietyMember',
            fields=[
                ('member_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('role', models.CharField(choices=[('admin', 'Admin'), ('member', 'Member')], default='member', max_length=20)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('PENDING', 'Pending'), ('BANNED', 'Banned'), ('REMOVED', 'Removed')], default='ACTIVE', max_length=20)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'society_members',
                'db_table_comment': 'Tracks Society membership and roles',
            },
        ),
        migrations.CreateModel(
            name='SocietyMessage',
            fields=[
                ('message_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('content', models.TextField()),
                ('is_pinned', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('EDITED', 'Edited'), ('DELETED', 'Deleted'), ('FLAGGED', 'Flagged')], default='ACTIVE', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('edited_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'society_messages',
                'db_table_comment': 'Stores Society group chat messages',
            },
        ),
    ]
