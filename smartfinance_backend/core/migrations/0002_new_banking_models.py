# Generated migration for new banking models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
    ]

    operations = [
        # Rename old BankAccount table
        migrations.RunSQL(
            "ALTER TABLE core_bankaccount RENAME TO core_bankaccount_old;",
            reverse_sql="ALTER TABLE core_bankaccount_old RENAME TO core_bankaccount;"
        ),
        
        # Create Bank model
        migrations.CreateModel(
            name='Bank',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        
        # Create Account model
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('number', models.CharField(max_length=30)),
                ('balance', models.DecimalField(decimal_places=2, default=0, max_digits=15)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('bank', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accounts', to='core.bank')),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        
        # Update Transaction model
        migrations.CreateModel(
            name='NewTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=15)),
                ('type', models.CharField(choices=[('deposit', 'Deposit'), ('withdrawal', 'Withdrawal'), ('transfer', 'Transfer'), ('external_transfer', 'External Transfer')], max_length=20)),
                ('description', models.CharField(max_length=255)),
                ('recipient_name', models.CharField(blank=True, max_length=100, null=True)),
                ('recipient_details', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='core.account')),
                ('to_account', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='incoming_transfers', to='core.account')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        
        # Drop old Transaction table and rename new one
        migrations.DeleteModel(name='Transaction'),
        migrations.RenameModel(old_name='NewTransaction', new_name='Transaction'),
        
        # Add constraints
        migrations.AlterUniqueTogether(
            name='bank',
            unique_together={('user', 'name')},
        ),
        migrations.AlterUniqueTogether(
            name='account',
            unique_together={('bank', 'number')},
        ),
    ]
