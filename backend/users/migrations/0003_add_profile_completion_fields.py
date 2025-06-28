# Generated manually for Google OAuth and simplified registration

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_remove_customuser_age_customuser_birth_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='profile_completed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customuser',
            name='registration_step',
            field=models.IntegerField(default=1),
        ),
    ]
