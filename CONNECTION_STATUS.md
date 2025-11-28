# ✅ Backend & Frontend Connection Status

## Current Configuration

### Backend Server
- **Port**: 5000 ✅ (Updated from 3000)
- **API Base URL**: `http://localhost:5000/api`
- **Status**: Ready to run

### Frontend Configuration
- **Port**: 8080 (Vite dev server)
- **API Client**: `src/lib/api.ts` ✅
- **API Base URL**: `http://localhost:5000/api` (configured in .env.local)
- **State**: Connected via Axios wrapper

---

## 📋 What Was Fixed

### Backend Setup
✅ Installed dependencies (130 packages)
✅ Fixed PORT from 3000 → 5000
✅ Generated Prisma client
✅ Created auth endpoints:
   - POST `/api/auth/signup`
   - POST `/api/auth/signin`
✅ Added auth middleware with token verification
✅ Integrated auth routes into Express app

### Frontend Setup
✅ Axios HTTP client configured
✅ API wrapper ready at `src/lib/api.ts`
✅ All contexts updated to use API client
✅ Environment variables set (VITE_API_BASE_URL)

---

## 🚀 How to Run

### Step 1: Ensure PostgreSQL is Running
```bash
# The backend expects PostgreSQL at localhost:5432
# Database: barterverse
# User: user
# Password: password

# If you don't have PostgreSQL, you need to install it or modify .env DATABASE_URL
```

### Step 2: Start Backend (Terminal 1)
```bash
cd d:\barter_verse\backend
npm run dev
```

**Expected Output:**
```
✓ Database connected
✓ Server running on http://localhost:5000
✓ Environment: development
```

### Step 3: Start Frontend (Terminal 2)
```bash
cd d:\barter_verse
npm run dev
```

**Expected Output:**
```
VITE v5.4.19  ready in 500 ms
Local: http://localhost:8080/
```

### Step 4: Test Connection
1. Open http://localhost:8080 in browser
2. Sign up with an email
3. Check Network tab in DevTools
4. Verify requests go to `http://localhost:5000/api/auth/signin`
5. Check localStorage for `auth_token` and `user`

---

## 🔐 Authentication Flow

### Signup/Signin
```
User enters email + password
        ↓
Frontend: api.signup(email, password)
        ↓
POST http://localhost:5000/api/auth/signup
        ↓
Backend: Creates user in PostgreSQL
        ↓
Generates token: base64(userId:email)
        ↓
Returns: { user: {...}, token: "..." }
        ↓
Frontend: Stores in localStorage
        ↓
api.setToken(token)
        ↓
All future requests include: Authorization: Bearer <token>
```

### Token Verification
```
Request to protected endpoint (e.g., create listing)
        ↓
Header: Authorization: Bearer <token>
        ↓
authMiddleware extracts token
        ↓
authService.verifyToken() decodes: userId:email
        ↓
Extracts userId
        ↓
Attaches req.userId
        ↓
Controller receives userId
```

---

## 📊 API Endpoints Available

### Authentication (NEW ✨)
- **POST** `/api/auth/signup` - Create account
- **POST** `/api/auth/signin` - Login

### Listings
- **GET** `/api/listings` - Get all listings
- **GET** `/api/listings/:id` - Get one listing
- **GET** `/api/listings/user/my-listings` - Get my listings (protected)
- **POST** `/api/listings` - Create listing (protected)
- **PATCH** `/api/listings/:id` - Update listing (protected)
- **DELETE** `/api/listings/:id` - Delete listing (protected)

### Coins
- **GET** `/api/coins/balance/:userId` - Get balance (protected)
- **POST** `/api/coins/add` - Add coins (protected)
- **POST** `/api/coins/spend` - Spend coins (protected)
- **POST** `/api/coins/transfer` - Transfer to user (protected)
- **GET** `/api/coins/history/:userId` - Get transactions (protected)

### Trades
- **GET** `/api/trades/:userId` - Get my trades (protected)
- **POST** `/api/trades` - Create trade (protected)
- **PATCH** `/api/trades/:id/confirm` - Accept/reject (protected)
- **PATCH** `/api/trades/:id/complete` - Complete (protected)
- **PATCH** `/api/trades/:id/cancel` - Cancel (protected)

---

## ⚠️ Important Notes

### Database Requirement
The backend needs PostgreSQL to work. The `.env` file has:
```
DATABASE_URL="postgresql://user:password@localhost:5432/barterverse"
```

You need to:
1. Install PostgreSQL if not already installed
2. Create a database named `barterverse`
3. Or modify DATABASE_URL to match your setup

Once connected, run migrations:
```bash
cd backend
npm run prisma:migrate
```

### Authentication (Simplified Version)
The current auth implementation:
- ✅ Creates user in database
- ✅ Returns token (simple base64 encoding)
- ✅ Verifies token on protected routes
- ⚠️ Does NOT hash passwords (for development only!)
- ⚠️ Does NOT validate password on signin (for development only!)

**For production**, you should:
```bash
npm install bcrypt jsonwebtoken
```

Then update `auth.service.ts` to:
- Hash passwords with bcrypt
- Use JWT tokens instead of base64
- Verify password hash on signin

### Frontend State Management
The frontend uses React Context API for:
- **AuthContext**: User auth state, login/logout
- **ListingsContext**: Listings CRUD with 30s polling
- **CoinContext**: Coin balance & transactions with 30s polling
- **TradeContext**: Trade requests with 30s polling

The polling (instead of WebSockets) is simpler but refreshes every 30 seconds.

---

## 🧪 Test These Flows

### Test 1: Sign Up
```
1. Go to http://localhost:8080
2. Click "Sign Up"
3. Enter email: test@example.com
4. Enter password: password123
5. Should create user and redirect to Dashboard
6. Check localStorage: should have auth_token
```

### Test 2: Create Listing
```
1. After signup, click "Post Listing"
2. Fill: Title, Description, Category
3. Click "Post"
4. Should deduct 10 coins (from 100 → 90)
5. Should redirect to Explore
6. New listing should appear
```

### Test 3: View Listings
```
1. Click "Explore"
2. Should show all listings
3. Search/filter should work
4. Click a listing to see details
```

### Test 4: Send Trade Request
```
1. From Explore, click on someone else's listing
2. Click "Send Trade Request"
3. Go to Dashboard
4. Should appear in your "Outgoing Trades"
```

### Test 5: Accept Trade
```
1. As different user, check Dashboard
2. See incoming trade request
3. Click "Accept"
4. Check coins transferred (if coin offer was made)
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
**Problem**: Frontend can't reach http://localhost:5000
**Solution**:
```bash
# Make sure backend is running
cd backend && npm run dev
# Should see: "Server running on http://localhost:5000"
```

### "Connection refused" on backend start
**Problem**: PostgreSQL not running or DATABASE_URL wrong
**Solution**:
```bash
# Check PostgreSQL is running
# Or update .env DATABASE_URL to your actual database

# If using local SQLite for testing:
# DATABASE_URL="file:./dev.db"
# Change provider in prisma/schema.prisma from "postgresql" to "sqlite"
```

### "User already exists"
**Problem**: Trying to signup with same email twice
**Solution**: Use different email for each test

### "Unauthorized" errors in frontend
**Problem**: Token not being sent or expired
**Solution**:
1. Open DevTools → Storage → localStorage
2. Check `auth_token` exists
3. Clear and login again: `localStorage.clear()`
4. Check Network tab → Request Headers → Authorization

### "Module not found: @/" errors
**Problem**: TypeScript path alias not working
**Solution**: Check `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 📈 Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│          React Frontend (Port 8080)              │
├─────────────────────────────────────────────────┤
│ AuthContext, ListingsContext, CoinContext, etc  │
│                      ↓                           │
│        src/lib/api.ts (Axios Wrapper)           │
│        ↓ Adds Authorization header              │
└────────────────────────┬────────────────────────┘
                         │
                   HTTP Requests
                         │
         ┌───────────────┴───────────────┐
         ↓                               ↓
  GET http://localhost:5000/api/listings
  POST http://localhost:5000/api/auth/signin
                         
┌─────────────────────────────────────────────────┐
│       Express Backend (Port 5000)                │
├─────────────────────────────────────────────────┤
│ Auth Router        Listings Router              │
│ ├─ /auth/signup    ├─ /listings                │
│ └─ /auth/signin    ├─ /listings/:id            │
│                    ├─ /listings (POST, PATCH)  │
│                    └─ /listings/:id (DELETE)   │
│                                                │
│ Coins Router       Trades Router               │
│ ├─ /coins/balance  ├─ /trades                 │
│ ├─ /coins/add      ├─ /trades/:id             │
│ └─ /coins/history  └─ /trades/:id/confirm     │
│                      Middleware                │
│      authMiddleware (verifies tokens)         │
│      errorMiddleware (handles errors)         │
└────────────────────┬────────────────────────────┘
                     │
              Services Layer
              ├─ authService
              ├─ listingsService
              ├─ coinsService
              └─ tradesService
                     │
              Prisma ORM Layer
                     │
         ┌───────────┴────────────┐
         ↓                        ↓
    PostgreSQL Database    (Tables: Profile,
    (or SQLite for dev)     Listing, Trade,
                            CoinTransaction)
```

---

## ✅ Pre-Launch Checklist

- [ ] PostgreSQL is running on localhost:5432
- [ ] Database `barterverse` exists
- [ ] Backend `.env` has correct DATABASE_URL
- [ ] Backend runs without "Database connection" error
- [ ] Frontend `.env.local` has VITE_API_BASE_URL=http://localhost:5000/api
- [ ] Can signup and create user
- [ ] Tokens appear in localStorage
- [ ] Can create listing (deducts 10 coins)
- [ ] Can view all listings
- [ ] Can send trade request
- [ ] Network tab shows Authorization header on protected requests

---

## 🎉 Next Steps

1. **Start both servers** as shown in "How to Run"
2. **Test signup/login** to verify auth works
3. **Create listings** and check balance changes
4. **Send trades** between test accounts
5. **Monitor Network tab** to verify token transmission
6. **Check browser console** for any errors
7. **Use Prisma Studio** to inspect database: `npm run prisma:studio`

**You're all set!** Everything is configured and ready to test. 🚀

