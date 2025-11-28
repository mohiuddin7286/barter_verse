# Admin Panel - Quick Reference

## 🔑 Default Admin Credentials

```
Email:    admin@barterverse.com
Password: admin123
```

## 📋 Core Functions

### 1️⃣ Manage Coins
```
POST /api/admin/coins/add
POST /api/admin/coins/remove
```
- Add or remove coins from any user
- Track all transactions

### 2️⃣ Manage Trades
```
GET    /api/admin/trades              (view all)
GET    /api/admin/trades/:tradeId     (view one)
PUT    /api/admin/trades/:tradeId/accept
PUT    /api/admin/trades/:tradeId/reject
PUT    /api/admin/trades/:tradeId/complete
PUT    /api/admin/trades/:tradeId/cancel
```
- Accept, reject, complete, or cancel any trade
- Full control over all trade states

### 3️⃣ Manage Users
```
GET    /api/admin/users               (view all)
GET    /api/admin/users/:userId       (view one)
PUT    /api/admin/users/:userId/role  (promote/demote)
```
- View all users and their details
- Promote users to admin
- Demote admins to regular users

### 4️⃣ View Statistics
```
GET /api/admin/stats/overview
```
- Total users & admins
- Total trades & status breakdown
- Coins in circulation

---

## 🚀 Quick Start

### Step 1: Get Admin Token
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@barterverse.com",
    "password": "admin123"
  }'
```
Copy the `token` from response.

### Step 2: Use Token in Requests
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Common Operations

**Add 100 coins to user:**
```bash
curl -X POST http://localhost:5000/api/admin/coins/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","amount":100,"reason":"Bonus"}'
```

**Accept a trade:**
```bash
curl -X PUT http://localhost:5000/api/admin/trades/TRADE_ID/accept \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Promote user to admin:**
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

---

## 📊 Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Action completed"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error description",
  "statusCode": 400
}
```

---

## 🔐 Security

- ✅ Admin-only endpoints require valid token
- ✅ All actions logged as transactions
- ✅ Role-based access control
- ✅ Secure password hashing (bcryptjs)

---

## 🛠️ Helpful Links

- Full Documentation: `ADMIN_DOCUMENTATION.md`
- Database Viewer: `npm run prisma:studio` (http://localhost:5555)
- Backend: http://localhost:5000
- Frontend: http://localhost:8080

