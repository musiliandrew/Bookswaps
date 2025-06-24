# Generated manually for Downvote model

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('discussions', '0006_alter_reprint_table_comment_alter_reprint_comment_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Downvote',
            fields=[
                ('downvote_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('discussion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='downvotes', to='discussions.discussion')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'downvotes',
                'db_table_comment': 'Stores discussion downvotes',
                'indexes': [models.Index(fields=['discussion', 'user'], name='downvotes_discuss_user_idx')],
                'unique_together': {('discussion', 'user')},
            },
        ),
    ]
