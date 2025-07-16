from django.contrib import admin
from .models import Bank, Account, Transaction, BankAccount

@admin.register(Bank)
class BankAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['name', 'user__username']
    ordering = ['-created_at']

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'number', 'bank', 'balance', 'created_at']
    list_filter = ['bank', 'created_at']
    search_fields = ['name', 'number', 'bank__name']
    ordering = ['-created_at']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['description', 'type', 'amount', 'account', 'created_at']
    list_filter = ['type', 'created_at', 'account__bank']
    search_fields = ['description', 'account__name', 'recipient_name']
    ordering = ['-created_at']

# Keep old model registered for migration purposes
@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ['bank_name', 'account_title', 'account_number', 'balance']
    search_fields = ['bank_name', 'account_title', 'account_number']
