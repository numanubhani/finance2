from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import transaction
from .models import Bank, Account, Transaction
from .serializers import (
    RegisterSerializer, BankSerializer, BankCreateSerializer,
    AccountSerializer, AccountCreateSerializer,
    TransactionSerializer, TransactionCreateSerializer
)


# --- User Registration View ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# --- Get Logged-in User Profile ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })


# --- Banks ViewSet ---
class BankViewSet(viewsets.ModelViewSet):
    serializer_class = BankSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Bank.objects.filter(user=self.request.user).prefetch_related('accounts')

    def get_serializer_class(self):
        if self.action == 'create':
            return BankCreateSerializer
        return BankSerializer

    @action(detail=True, methods=['post'])
    def add_account(self, request, pk=None):
        """Add a new account to a specific bank"""
        bank = self.get_object()
        serializer = AccountCreateSerializer(
            data={**request.data, 'bank_id': bank.id},
            context={'request': request}
        )
        if serializer.is_valid():
            account = serializer.save()
            return Response(AccountSerializer(account).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- Accounts ViewSet ---
class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(bank__user=self.request.user).select_related('bank')

    def get_serializer_class(self):
        if self.action == 'create':
            return AccountCreateSerializer
        return AccountSerializer

    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        """Transfer money between accounts"""
        from_account = self.get_object()
        to_account_id = request.data.get('to_account_id')
        amount = request.data.get('amount')
        description = request.data.get('description', 'Transfer')

        if not to_account_id or not amount:
            return Response(
                {'error': 'to_account_id and amount are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(amount)
            if amount <= 0:
                return Response(
                    {'error': 'Amount must be positive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            to_account = Account.objects.get(id=to_account_id, bank__user=request.user)
        except Account.DoesNotExist:
            return Response(
                {'error': 'Destination account not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if from_account.balance < amount:
            return Response(
                {'error': 'Insufficient balance'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Perform transfer
        with transaction.atomic():
            from_account.balance -= amount
            from_account.save()

            to_account.balance += amount
            to_account.save()

            # Create transaction records
            Transaction.objects.create(
                user=request.user,
                account=from_account,
                amount=-amount,
                type='transfer',
                description=f"Transfer to {to_account.name}",
                to_account=to_account
            )

            Transaction.objects.create(
                user=request.user,
                account=to_account,
                amount=amount,
                type='transfer',
                description=f"Transfer from {from_account.name}"
            )

        return Response({
            'message': 'Transfer completed successfully',
            'from_account': AccountSerializer(from_account).data,
            'to_account': AccountSerializer(to_account).data
        })


# --- Transactions ViewSet ---
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related('account', 'account__bank', 'to_account', 'to_account__bank')

    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionCreateSerializer
        return TransactionSerializer

    def perform_create(self, serializer):
        """Handle transaction creation with balance updates"""
        transaction_obj = serializer.save()
        account = transaction_obj.account

        with transaction.atomic():
            if transaction_obj.type == 'deposit':
                account.balance += transaction_obj.amount
                account.save()
            elif transaction_obj.type == 'withdrawal':
                if account.balance < transaction_obj.amount:
                    raise ValueError("Insufficient balance")
                account.balance -= transaction_obj.amount
                account.save()
            elif transaction_obj.type == 'transfer':
                if account.balance < transaction_obj.amount:
                    raise ValueError("Insufficient balance")
                # Subtract from source account
                account.balance -= transaction_obj.amount
                account.save()

                # Add to destination account
                if transaction_obj.to_account:
                    transaction_obj.to_account.balance += transaction_obj.amount
                    transaction_obj.to_account.save()
            elif transaction_obj.type == 'external_transfer':
                if account.balance < transaction_obj.amount:
                    raise ValueError("Insufficient balance")
                account.balance -= transaction_obj.amount
                account.save()


# --- Setup Banks API (Bulk bank and account creation) ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setup_banks(request):
    """Setup multiple banks with their accounts in one API call"""
    banks_data = request.data.get('banks', [])

    if not banks_data:
        return Response(
            {'error': 'banks data is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    created_banks = []

    try:
        with transaction.atomic():
            for bank_data in banks_data:
                bank_name = bank_data.get('bankName')
                accounts_data = bank_data.get('accounts', [])

                if not bank_name:
                    return Response(
                        {'error': 'bankName is required for each bank'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Check if bank already exists for this user
                bank, created = Bank.objects.get_or_create(
                    user=request.user,
                    name=bank_name
                )

                for account_data in accounts_data:
                    Account.objects.get_or_create(
                        bank=bank,
                        number=account_data.get('number'),
                        defaults={
                            'name': account_data.get('title'),
                            'balance': account_data.get('balance', 0)
                        }
                    )

                created_banks.append(bank)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Return created banks with their accounts
    serializer = BankSerializer(created_banks, many=True)
    return Response({
        'message': 'Banks setup completed successfully',
        'banks': serializer.data
    }, status=status.HTTP_201_CREATED)


# --- Dashboard API ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """Get dashboard data with banks, accounts, and recent transactions"""
    user = request.user
    banks = Bank.objects.filter(user=user).prefetch_related('accounts')
    recent_transactions = Transaction.objects.filter(user=user).select_related('account', 'account__bank')[:10]

    # Calculate totals
    total_balance = sum(
        account.balance
        for bank in banks
        for account in bank.accounts.all()
    )

    total_income = sum(
        t.amount for t in Transaction.objects.filter(user=user, type='deposit')
    )

    total_expenses = sum(
        abs(t.amount) for t in Transaction.objects.filter(
            user=user,
            type__in=['withdrawal', 'external_transfer']
        )
    )

    return Response({
        'banks': BankSerializer(banks, many=True).data,
        'recent_transactions': TransactionSerializer(recent_transactions, many=True).data,
        'summary': {
            'total_balance': total_balance,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'total_accounts': sum(bank.accounts.count() for bank in banks)
        }
    })
