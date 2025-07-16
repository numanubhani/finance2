from django.db import models
from django.contrib.auth.models import User

class Bank(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ['user', 'name']  # Prevent duplicate bank names per user

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class Account(models.Model):
    bank = models.ForeignKey(Bank, on_delete=models.CASCADE, related_name='accounts')
    name = models.CharField(max_length=100)  # Account title/name
    number = models.CharField(max_length=30)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ['bank', 'number']  # Prevent duplicate account numbers per bank

    def __str__(self):
        return f"{self.bank.name} - {self.name} ({self.number})"

    @property
    def user(self):
        return self.bank.user

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('external_transfer', 'External Transfer'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255)

    # For internal transfers
    to_account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True, related_name='incoming_transfers')

    # For external transfers
    recipient_name = models.CharField(max_length=100, null=True, blank=True)
    recipient_details = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type.title()}: {self.amount} - {self.description}"

# Keep old model for backward compatibility during migration
class BankAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bank_name = models.CharField(max_length=100)
    account_title = models.CharField(max_length=100)
    account_number = models.CharField(max_length=30)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = 'core_bankaccount_old'  # Rename table to avoid conflicts

    def __str__(self):
        return f"{self.bank_name} - {self.account_title}"
