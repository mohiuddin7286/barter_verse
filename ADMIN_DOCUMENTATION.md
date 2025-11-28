# BarterVerse Admin Panel Documentation

## Admin Credentials

After running `npm run seed`, use these credentials to login as admin:

**Email:** `admin@barterverse.com`  
**Password:** `admin123`

Admin users have elevated privileges to manage users, coins, and trades.

---

## Admin API Endpoints

All admin endpoints require an Authorization header with a valid admin token:

```
Authorization: Bearer <admin_token>
```

### Base URL
```
http://localhost:5000/api/admin
```

---

## User Management

### Get All Users
**Endpoint:** `GET /users`  
**Description:** Retrieve all users in the system

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "avatar_url": null,
      "bio": "User bio",
      "coins": 100,
      "rating": 5.0,
      "role": "user",
      "created_at": "2025-11-28T...",
      "updated_at": "2025-11-28T..."
    }
  ]
}
```

### Get User by ID
**Endpoint:** `GET /users/:userId`  
**Description:** Get detailed information about a specific user

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "coins": 100,
    "rating": 5.0,
    "role": "user",
    "listings": [],
    "coin_transactions": []
  }
}
```

### Update User Role
**Endpoint:** `PUT /users/:userId/role`  
**Description:** Change a user's role (promote to admin or demote to user)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Valid Roles:** `user`, `admin`

---

## Coin Management

### Add Coins to User
**Endpoint:** `POST /coins/add`  
**Description:** Add coins to a user's balance

**Request Body:**
```json
{
  "userId": "user_id",
  "amount": 50,
  "reason": "Bonus coins"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "coins": 150
    },
    "transaction": {
      "amount": 50,
      "reason": "Bonus coins",
      "type": "added"
    }
  },
  "message": "Added 50 coins to user"
}
```

### Remove Coins from User
**Endpoint:** `POST /coins/remove`  
**Description:** Deduct coins from a user's balance

**Request Body:**
```json
{
  "userId": "user_id",
  "amount": 20,
  "reason": "Trade fee"
}
```

**Response:** Same as add coins (shows deduction)

---

## Trade Management

### Get All Trades
**Endpoint:** `GET /trades`  
**Description:** Retrieve all trades in the system

**Query Parameters:**
- `status` (optional): Filter by status (`PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "trade_id",
      "initiator_id": "user_id",
      "responder_id": "user_id",
      "listing_id": "listing_id",
      "status": "PENDING",
      "initiator": { "id": "...", "email": "...", "username": "..." },
      "responder": { "id": "...", "email": "...", "username": "..." },
      "listing": { "id": "...", "title": "..." },
      "created_at": "2025-11-28T..."
    }
  ]
}
```

### Get Trade by ID
**Endpoint:** `GET /trades/:tradeId`  
**Description:** Get detailed information about a specific trade

### Accept Trade
**Endpoint:** `PUT /trades/:tradeId/accept`  
**Description:** Accept a pending trade request

**Response:**
```json
{
  "success": true,
  "data": { "status": "ACCEPTED", ... },
  "message": "Trade accepted successfully"
}
```

### Reject Trade
**Endpoint:** `PUT /trades/:tradeId/reject`  
**Description:** Reject a pending trade request

**Request Body:**
```json
{
  "reason": "Items no longer available"
}
```

### Complete Trade
**Endpoint:** `PUT /trades/:tradeId/complete`  
**Description:** Mark an accepted trade as completed

**Response:**
```json
{
  "success": true,
  "data": { "status": "COMPLETED", ... },
  "message": "Trade completed successfully"
}
```

### Cancel Trade
**Endpoint:** `PUT /trades/:tradeId/cancel`  
**Description:** Cancel a trade (can be any status except completed)

**Request Body:**
```json
{
  "reason": "Cancellation reason"
}
```

---

## Admin Statistics

### Get Admin Stats
**Endpoint:** `GET /stats/overview`  
**Description:** Get overview statistics for the BarterVerse platform

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "adminUsers": 2,
    "regularUsers": 148,
    "totalTrades": 45,
    "totalCoinsInCirculation": 15000,
    "tradesByStatus": {
      "PENDING": 5,
      "ACCEPTED": 10,
      "COMPLETED": 30,
      "REJECTED": 0
    }
  }
}
```

---

## Error Handling

All endpoints return error responses in this format:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

**Common Error Codes:**
- `400`: Bad Request (invalid data)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (not admin)
- `404`: Not Found (user/trade not found)
- `409`: Conflict (duplicate email/username)

---

## Usage Examples

### Example 1: Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@barterverse.com",
    "password": "admin123"
  }'
```

Response will include `token` - use this for all admin API calls.

### Example 2: Add Coins to User

```bash
curl -X POST http://localhost:5000/api/admin/coins/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "userId": "user_id",
    "amount": 100,
    "reason": "Promotion bonus"
  }'
```

### Example 3: Accept a Trade

```bash
curl -X PUT http://localhost:5000/api/admin/trades/trade_id/accept \
  -H "Authorization: Bearer <admin_token>"
```

### Example 4: Get Platform Statistics

```bash
curl -X GET http://localhost:5000/api/admin/stats/overview \
  -H "Authorization: Bearer <admin_token>"
```

---

## Admin Features

✅ **User Management**
- View all users and their details
- Promote users to admin or demote admins to users
- View user coins and transaction history

✅ **Coin Management**
- Add coins to user accounts
- Remove coins from user accounts
- Track all coin transactions with reasons

✅ **Trade Management**
- View all trades on the platform
- Accept or reject pending trades
- Complete accepted trades
- Cancel trades if needed
- Filter trades by status

✅ **Platform Statistics**
- Total users, admins, and regular users
- Total trades and their status breakdown
- Total coins in circulation

---

## Security Notes

1. Admin credentials should be kept secure
2. Each admin action is logged (stored in transaction history)
3. Only users with `role: "admin"` can access admin endpoints
4. Tokens expire and must be renewed by logging in again
5. All admin actions should be audited in production

