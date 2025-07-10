# Generated migration to add voting tables back

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('discussions', '0009_remove_voting_tables'),
    ]

    operations = [
        migrations.CreateModel(
            name='Upvote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('discussion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='upvotes', to='discussions.discussion')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'upvotes',
                'db_table_comment': 'Stores user agreements on discussions',
            },
        ),
        migrations.CreateModel(
            name='Downvote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('discussion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='downvotes', to='discussions.discussion')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'downvotes',
                'db_table_comment': 'Stores user disagreements on discussions',
            },
        ),
        migrations.AddConstraint(
            model_name='upvote',
            constraint=models.UniqueConstraint(fields=('user', 'discussion'), name='upvote_user_discussion_unique'),
        ),
        migrations.AddConstraint(
            model_name='downvote',
            constraint=models.UniqueConstraint(fields=('user', 'discussion'), name='downvote_user_discussion_unique'),
        ),
        migrations.AddIndex(
            model_name='upvote',
            index=models.Index(fields=['discussion', 'user'], name='upvotes_discuss_user_idx'),
        ),
        migrations.AddIndex(
            model_name='downvote',
            index=models.Index(fields=['discussion', 'user'], name='downvotes_discuss_user_idx'),
        ),
    ]
