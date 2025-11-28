# 🚀 Quick Start - Supabase Removed, Backend Integrated

## ⚡ 2-Minute Setup

### Terminal 1 - Start Backend
```bash
cd d:\barter_verse\backend
npm run dev
```
✅ Backend runs on `http://localhost:5000`

### Terminal 2 - Start Frontend
```bash
cd d:\barter_verse
npm run dev
```
✅ Frontend runs on `http://localhost:8080`

### Open in Browser
```
http://localhost:8080
```

---

## ✨ What's Changed?

### ✅ Removed
- `@supabase/supabase-js` package
- `src/integrations/supabase/` folder
- `supabase/` folder (functions, migrations)
- All Supabase Edge Functions
- All Supabase environment variables

### ✅ Added
- `axios` package
- `src/lib/api.ts` - HTTP API client
- Integrated with your Express backend
- JWT token-based authentication

### ✅ Updated
- **AuthContext.tsx** - Now uses backend JWT auth
- **ListingsContext.tsx** - Now uses backend API
- **CoinContext.tsx** - Now uses backend API
- **TradeContext.tsx** - Now uses backend API
- **PostListing.tsx** - Now uses API client
- **Dashboard.tsx** - Now uses API client
- **ListingModal.tsx** - Now uses API client
- **.env.local** - New backend configuration

---

## 📡 How It Works Now

```
Frontend Request
    ↓
src/lib/api.ts (Axios)
    ↓
http://localhost:5000/api/...
    ↓
Express Backend
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Response back to Frontend
```

---

## 🔐 Authentication Flow

1. **Sign Up / Sign In**
   ```
   User enters email/password
        ↓
   api.signup() or api.signin()
        ↓
   Backend generates JWT token
        ↓
   Token + User stored in localStorage
        ↓
   Token added to all future requests
   ```

2. **Authenticated Requests**
   ```
   GET /listings
   Header: "Authorization: Bearer <token>"
        ↓
   Backend validates token
        ↓
   Returns protected data
   ```

3. **Logout**
   ```
   localStorage cleared
   Token removed from requests
   User redirected to /auth
   ```

---

## 📝 API Endpoints

Your frontend automatically calls these endpoints:

### Auth
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Login

### Listings
- `GET /listings` - List all (paginated)
- `GET /listings/:id` - Get one
- `GET /listings/user/:id` - User's listings
- `POST /listings` - Create
- `PATCH /listings/:id` - Update
- `DELETE /listings/:id` - Delete

### Coins
- `GET /coins/balance/:id` - Get balance
- `POST /coins/add` - Add coins
- `POST /coins/spend` - Spend coins
- `POST /coins/transfer` - Transfer coins
- `GET /coins/history/:id` - History

### Trades
- `GET /trades/:id` - Get trades
- `POST /trades` - Create trade
- `PATCH /trades/:id/confirm` - Accept/reject
- `PATCH /trades/:id/complete` - Complete
- `PATCH /trades/:id/cancel` - Cancel

---

## 🛠️ API Client Usage

The API client is in `src/lib/api.ts` and automatically:
- ✅ Adds Authorization header with token
- ✅ Sets proper Content-Type headers
- ✅ Handles base URL (`http://localhost:5000/api`)
- ✅ Manages request/response

Use it everywhere:
```typescript
import { api } from '@/lib/api';

// Set token after login
api.setToken(token);

// Make requests
const listings = await api.getListings(1, 10);
const profile = await api.getBalance(userId);
await api.createListing(data);
```

---

## 📊 Architecture

```
Frontend (React + TypeScript)
├─ Pages (Dashboard, PostListing, etc)
├─ Contexts (Auth, Listings, Coins, Trades)
├─ Components (UI, Modals)
└─ API Client (src/lib/api.ts)
     ↓
Express Backend
├─ Routes (listings, coins, trades, auth)
├─ Controllers (request handlers)
├─ Services (business logic)
├─ Middleware (auth, error handling)
└─ Prisma
     ↓
PostgreSQL Database
```

---

## 🔄 Real-time Updates

**Old way (Supabase)**: Real-time subscriptions
**New way (Express)**: Polling every 30 seconds

For true real-time, the backend is ready for WebSocket integration.

---

## ⚠️ Important Notes

1. **Backend must be running** before frontend
   ```bash
   npm run dev  # in backend folder
   ```

2. **Environment variables** - Already configured in `.env.local`
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **No more Supabase keys needed** - All in backend now

4. **Production deployment** - Update API URL:
   ```
   VITE_API_BASE_URL=https://yourdomain.com/api
   ```

---

## 🧪 Test It

### 1. Create an account
- Open http://localhost:8080
- Click "Sign Up"
- Enter email/password
- Should redirect to Dashboard

### 2. Create a listing
- Click "Post Listing"
- Fill in details
- Click "Post" (costs 10 coins)

### 3. View listings
- Click "Explore"
- See all listings
- Click to see details

### 4. Trade
- Click on a listing
- Click "Send Trade Request"
- Check trades in Dashboard

---

## 📚 Documentation

| File | Content |
|------|---------|
| `SUPABASE_REMOVAL_COMPLETE.md` | Detailed removal summary |
| `backend/README.md` | Complete API documentation |
| `src/lib/api.ts` | API client with all methods |
| `src/contexts/*.tsx` | Updated context hooks |

---

## 💡 Next Steps

### Immediate (Today)
1. ✅ Run backend: `npm run dev` in backend folder
2. ✅ Run frontend: `npm run dev` in root folder
3. ✅ Test login and listings

### This Week
1. Test all CRUD operations
2. Verify trades work end-to-end
3. Check coin transactions

### Next
1. Deploy backend (Railway, Render, etc)
2. Update frontend API URL for production
3. Add real-time WebSocket if needed
4. Monitor performance

---

## 🆘 Troubleshooting

### "Cannot connect to backend"
```bash
# Make sure backend is running
cd backend && npm run dev
# Should see: "Server running on port 5000"
```

### "Unauthorized" errors
- Clear localStorage and login again
- Check token is being saved
- Check Authorization header in network tab

### "CORS errors"
Backend has CORS enabled - shouldn't happen

### "Module not found" errors
```bash
npm install  # in root folder
cd backend && npm install  # in backend folder
```

---

## 🎉 You're Ready!

Everything is set up and ready to go. Your frontend is now completely independent from Supabase and uses your Express backend.

**Run both servers and start building!** 🚀

For detailed information, see:
- `SUPABASE_REMOVAL_COMPLETE.md` - Detailed changes
- `backend/README.md` - API documentation
- `START_HERE.md` - Project overview

