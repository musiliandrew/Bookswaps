# Generated by Django 5.2 on 2025-04-28 18:22

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('chat', '0002_initial'),
        ('discussions', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='chats',
            name='receiver',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='received_chats', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='chats',
            name='sender',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sent_chats', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='messagereaction',
            name='chat',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='chat.chats'),
        ),
        migrations.AddField(
            model_name='messagereaction',
            name='society_message',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='discussions.societymessage'),
        ),
        migrations.AddField(
            model_name='messagereaction',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='chats',
            index=models.Index(fields=['sender', 'receiver'], name='chats_sender__acde62_idx'),
        ),
        migrations.AddIndex(
            model_name='chats',
            index=models.Index(fields=['created_at'], name='chats_created_e8f0e7_idx'),
        ),
        migrations.AddIndex(
            model_name='messagereaction',
            index=models.Index(fields=['chat'], name='message_rea_chat_id_016b0c_idx'),
        ),
        migrations.AddIndex(
            model_name='messagereaction',
            index=models.Index(fields=['society_message'], name='message_rea_society_5cdd84_idx'),
        ),
    ]
