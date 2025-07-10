# Generated migration to remove voting tables

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('discussions', '0008_rename_downvotes_discuss_user_idx_downvotes_discuss_76be57_idx'),
    ]

    operations = [
        migrations.RunSQL(
            "DROP TABLE IF EXISTS upvotes CASCADE;",
            reverse_sql="-- Cannot reverse this operation"
        ),
        migrations.RunSQL(
            "DROP TABLE IF EXISTS downvotes CASCADE;",
            reverse_sql="-- Cannot reverse this operation"
        ),
    ]
