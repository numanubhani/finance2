# SmartFinance Backend API Documentation

## Authentication

All API endpoints (except registration and login) require JWT authentication.
Include the token in the Authorization header: `Authorization: Bearer <token>`

## Authentication Endpoints

### POST /api/register/

Register a new user.

```json
{
  "username": "john_doe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "secure_password123"
}
```

### POST /api/login/

Login and get JWT tokens.

```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```

Response:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### POST /api/token/refresh/

Refresh access token using refresh token.

### GET /api/user/

Get current user profile.

## Banking Endpoints

### POST /api/setup-banks/

Setup multiple banks with accounts in one call (recommended for initial setup).

```json
{
  "banks": [
    {
      "bankName": "Meezan Bank",
      "accounts": [
        {
          "title": "Current Account",
          "number": "01234567890",
          "balance": 50000
        },
        {
          "title": "Savings Account",
          "number": "09876543210",
          "balance": 25000
        }
      ]
    },
    {
      "bankName": "HBL",
      "accounts": [
        {
          "title": "Business Account",
          "number": "11223344556",
          "balance": 100000
        }
      ]
    }
  ]
}
```

### GET /api/dashboard/

Get complete dashboard data including banks, accounts, transactions, and summary.
Response includes:

- `banks`: Array of banks with their accounts
- `recent_transactions`: Last 10 transactions
- `summary`: Financial summary (total balance, income, expenses, account count)

## Banks API

### GET /api/banks/

List all banks for the authenticated user.

### POST /api/banks/

Create a new bank.

```json
{
  "name": "Bank Name",
  "accounts": [
    // Optional: Create accounts with the bank
    {
      "name": "Account Name",
      "number": "1234567890",
      "balance": 10000
    }
  ]
}
```

### GET /api/banks/{id}/

Get specific bank details with all accounts.

### PUT /api/banks/{id}/

Update bank information.

### DELETE /api/banks/{id}/

Delete bank and all its accounts.

### POST /api/banks/{id}/add_account/

Add a new account to a specific bank.

```json
{
  "name": "New Account",
  "number": "9876543210",
  "balance": 5000
}
```

## Accounts API

### GET /api/accounts/

List all accounts for the authenticated user.

### POST /api/accounts/

Create a new account.

```json
{
  "bank_id": 1,
  "name": "Savings Account",
  "number": "1234567890",
  "balance": 10000
}
```

### GET /api/accounts/{id}/

Get specific account details.

### PUT /api/accounts/{id}/

Update account information.

### DELETE /api/accounts/{id}/

Delete account.

### POST /api/accounts/{id}/transfer/

Transfer money between accounts.

```json
{
  "to_account_id": 2,
  "amount": 1000,
  "description": "Monthly transfer"
}
```

## Transactions API

### GET /api/transactions/

List all transactions for the authenticated user.

### POST /api/transactions/

Create a new transaction.

**Deposit:**

```json
{
  "account_id": 1,
  "amount": 5000,
  "type": "deposit",
  "description": "Salary deposit"
}
```

**Withdrawal:**

```json
{
  "account_id": 1,
  "amount": 1000,
  "type": "withdrawal",
  "description": "ATM withdrawal"
}
```

**Internal Transfer:**

```json
{
  "account_id": 1,
  "to_account_id": 2,
  "amount": 2000,
  "type": "transfer",
  "description": "Transfer to savings"
}
```

**External Transfer:**

```json
{
  "account_id": 1,
  "amount": 3000,
  "type": "external_transfer",
  "description": "Payment to vendor",
  "recipient_name": "John Smith",
  "recipient_details": "Account: 1234567890"
}
```

### GET /api/transactions/{id}/

Get specific transaction details.

### PUT /api/transactions/{id}/

Update transaction information.

### DELETE /api/transactions/{id}/

Delete transaction (will reverse balance effects).

## Data Models

### Bank

- `id`: Integer (auto)
- `name`: String (max 100 chars)
- `user`: Foreign key to User
- `created_at`: DateTime
- `updated_at`: DateTime
- `accounts`: Related accounts

### Account

- `id`: Integer (auto)
- `name`: String (max 100 chars)
- `number`: String (max 30 chars)
- `balance`: Decimal (15 digits, 2 decimal places)
- `bank`: Foreign key to Bank
- `created_at`: DateTime
- `updated_at`: DateTime

### Transaction

- `id`: Integer (auto)
- `amount`: Decimal (15 digits, 2 decimal places)
- `type`: Choice ('deposit', 'withdrawal', 'transfer', 'external_transfer')
- `description`: String (max 255 chars)
- `account`: Foreign key to Account (source account)
- `to_account`: Foreign key to Account (for transfers, optional)
- `recipient_name`: String (for external transfers, optional)
- `recipient_details`: String (for external transfers, optional)
- `user`: Foreign key to User
- `created_at`: DateTime
- `updated_at`: DateTime

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": "Error description"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (permission denied)
- `404`: Not Found
- `500`: Internal Server Error

## Business Logic

### Balance Management

- Deposits: Add to account balance
- Withdrawals: Subtract from account balance (requires sufficient balance)
- Internal Transfers: Subtract from source, add to destination
- External Transfers: Subtract from source only

### Validation

- Users can only access their own banks/accounts/transactions
- Account numbers must be unique within a bank
- Bank names must be unique per user
- Sufficient balance required for withdrawals and transfers
- Required fields validated per transaction type

### Transaction History

- All balance changes create transaction records
- Transfers create records in both source and destination accounts
- Transaction deletion reverses balance effects
- Transactions are ordered by creation date (newest first)
