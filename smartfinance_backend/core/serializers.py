from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from .models import Bank, Account, Transaction

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    username = serializers.CharField(required=True)
    fullName = serializers.CharField(write_only=True)  # This is just for frontend use
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('username', 'fullName', 'email', 'password')

    def create(self, validated_data):
        full_name = validated_data.pop('fullName')  # Remove fullName from validated_data
        first_name = full_name  # or you can split if needed
        user = User.objects.create_user(
            username=validated_data['username'],  # this will now stay 'faiz'
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name  # optional: save fullName in first_name
        )
        return user

class AccountSerializer(serializers.ModelSerializer):
    bank_name = serializers.CharField(source='bank.name', read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'number', 'balance', 'bank_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class BankSerializer(serializers.ModelSerializer):
    accounts = AccountSerializer(many=True, read_only=True)
    accounts_count = serializers.SerializerMethodField()
    total_balance = serializers.SerializerMethodField()

    class Meta:
        model = Bank
        fields = ['id', 'name', 'accounts', 'accounts_count', 'total_balance', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_accounts_count(self, obj):
        return obj.accounts.count()

    def get_total_balance(self, obj):
        return sum(account.balance for account in obj.accounts.all())

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class BankCreateSerializer(serializers.ModelSerializer):
    accounts = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Bank
        fields = ['name', 'accounts']

    def create(self, validated_data):
        accounts_data = validated_data.pop('accounts', [])
        validated_data['user'] = self.context['request'].user

        bank = Bank.objects.create(**validated_data)

        for account_data in accounts_data:
            Account.objects.create(
                bank=bank,
                name=account_data.get('name'),
                number=account_data.get('number'),
                balance=account_data.get('balance', 0)
            )

        return bank

class AccountCreateSerializer(serializers.ModelSerializer):
    bank_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Account
        fields = ['name', 'number', 'balance', 'bank_id']

    def create(self, validated_data):
        bank_id = validated_data.pop('bank_id')
        user = self.context['request'].user

        try:
            bank = Bank.objects.get(id=bank_id, user=user)
        except Bank.DoesNotExist:
            raise serializers.ValidationError("Bank not found or you don't have permission to access it.")

        validated_data['bank'] = bank
        return super().create(validated_data)

class TransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    bank_name = serializers.CharField(source='account.bank.name', read_only=True)
    to_account_name = serializers.CharField(source='to_account.name', read_only=True)
    to_bank_name = serializers.CharField(source='to_account.bank.name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'type', 'description', 'account_name', 'bank_name',
            'to_account_name', 'to_bank_name', 'recipient_name', 'recipient_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class TransactionCreateSerializer(serializers.ModelSerializer):
    account_id = serializers.IntegerField(write_only=True)
    to_account_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Transaction
        fields = [
            'account_id', 'amount', 'type', 'description', 'to_account_id',
            'recipient_name', 'recipient_details'
        ]

    def validate(self, data):
        transaction_type = data.get('type')

        if transaction_type == 'transfer' and not data.get('to_account_id'):
            raise serializers.ValidationError("to_account_id is required for transfers")

        if transaction_type == 'external_transfer' and not data.get('recipient_name'):
            raise serializers.ValidationError("recipient_name is required for external transfers")

        return data

    def create(self, validated_data):
        account_id = validated_data.pop('account_id')
        to_account_id = validated_data.pop('to_account_id', None)
        user = self.context['request'].user

        try:
            account = Account.objects.get(id=account_id, bank__user=user)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Account not found or you don't have permission to access it.")

        validated_data['account'] = account
        validated_data['user'] = user

        if to_account_id:
            try:
                to_account = Account.objects.get(id=to_account_id, bank__user=user)
                validated_data['to_account'] = to_account
            except Account.DoesNotExist:
                raise serializers.ValidationError("Destination account not found or you don't have permission to access it.")

        return super().create(validated_data)
