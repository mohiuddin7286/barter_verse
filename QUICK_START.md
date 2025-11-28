# 🚀 Quick Start Guide

## Prerequisites Check

✅ Node.js installed
✅ npm installed
✅ Backend dependencies installed
✅ Frontend dependencies installed
✅ Auth endpoints created
✅ API client configured

❌ **MISSING**: PostgreSQL Database
   - Need to install PostgreSQL
   - OR modify DATABASE_URL in backend/.env

---

## Running Everything

### Terminal 1: Backend
```powershell
cd d:\barter_verse\backend
npm run dev
```

**Wait for:**
```
✓ Database connected
✓ Server running on http://localhost:5000
```

### Terminal 2: Frontend
```powershell
cd d:\barter_verse
npm run dev
```

**Wait for:**
```
VITE v5.4.19  ready in 500 ms
Local: http://localhost:8080/
```

### Terminal 3: Optional - Prisma Studio
```powershell
cd d:\barter_verse\backend
npm run prisma:studio
```

Opens http://localhost:5555 to view/edit database

---

## Test In Browser

1. Open http://localhost:8080
2. Click "Sign Up"
3. Enter email & password
4. Should redirect to Dashboard
5. Open DevTools (F12)
6. Go to Storage → localStorage
7. Should see `auth_token` and `user` keys
8. Go to Network tab
9. Create a listing
10. Should see POST request to http://localhost:5000/api/listings
11. Should have header: `Authorization: Bearer ...`

---

## API Testing

### Using curl (Test auth endpoint)
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Using Postman
1. Create new request
2. Method: POST
3. URL: http://localhost:5000/api/auth/signin
4. Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password"
}
```
5. Send

**Response should be:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "username": "test",
      "coins": 100,
      "rating": 5.0
    },
    "token": "..."
  },
  "message": "Signed in successfully"
}
```

---

## Files Structure

```
Frontend:
├─ src/lib/api.ts              ← API client (Axios)
├─ src/contexts/
│  ├─ AuthContext.tsx          ← JWT token management
│  ├─ ListingsContext.tsx       ← Listing CRUD
│  ├─ CoinContext.tsx           ← Coin operations
│  └─ TradeContext.tsx          ← Trade management
├─ .env.local                  ← API_BASE_URL config
└─ package.json                ← Dependencies

Backend:
├─ src/
│  ├─ server.ts                ← Entry point
│  ├─ app.ts                   ← Express setup
│  ├─ routes/
│  │  ├─ auth.routes.ts        ← NEW: Auth endpoints
│  │  ├─ listings.routes.ts
│  │  ├─ coins.routes.ts
│  │  └─ trades.routes.ts
│  ├─ controllers/
│  │  ├─ auth.controller.ts    ← NEW: Auth logic
│  │  └─ ...
│  ├─ services/
│  │  ├─ auth.service.ts       ← NEW: Auth service
│  │  └─ ...
│  ├─ middleware/
│  │  ├─ auth.middleware.ts    ← UPDATED: Token verify
│  │  └─ error.middleware.ts
│  └─ prisma/
│     └─ client.ts             ← Prisma connection
├─ prisma/
│  ├─ schema.prisma            ← Database schema
│  └─ migrations/              ← DB migrations
├─ .env                        ← Config (DATABASE_URL, PORT)
└─ package.json                ← Dependencies
```

---

## What Was Added/Changed

### New Files
✨ `backend/src/controllers/auth.controller.ts`
✨ `backend/src/services/auth.service.ts`
✨ `backend/src/routes/auth.routes.ts`
✨ `CONNECTION_STATUS.md`
✨ `QUICK_START.md` (this file)

### Modified Files
📝 `backend/.env` - PORT changed 3000 → 5000
📝 `backend/src/app.ts` - Added auth routes
📝 `backend/src/middleware/auth.middleware.ts` - Token verification

### Key Changes
- ✅ Backend now listens on port 5000 (matches frontend config)
- ✅ Auth endpoints created: /api/auth/signup, /api/auth/signin
- ✅ Token generation and verification implemented
- ✅ All endpoints ready for frontend to call

---

## Common Issues & Fixes

### "Cannot find module '@/routes/auth.routes'"
**Fix**: Rebuild or restart `npm run dev`

### "ECONNREFUSED" on backend startup
**Fix**: PostgreSQL not running
```bash
# Start PostgreSQL (Windows)
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# Or use PostgreSQL GUI
```

### Frontend 404 on auth/signin
**Fix**: Check backend is running on port 5000
```bash
netstat -ano | findstr :5000  # Check port usage
```

### "Unauthorized" after signup
**Fix**: Token not in localStorage
1. Clear localStorage: `localStorage.clear()`
2. Signup again
3. Check DevTools → Storage

### "User already exists"
**Fix**: Use new email for each signup, or reset database

---

## Monitoring

### Backend Logs
```
✓ Database connected
✓ Server running on http://localhost:5000
✓ Environment: development
```

### Frontend Logs (DevTools Console)
```
API calls show in Network tab
Tokens visible in Storage → localStorage
Errors shown in Console
```

### Database (Prisma Studio)
```powershell
cd backend && npm run prisma:studio
# Opens http://localhost:5555
```

---

## Next Steps

1. ✅ Install PostgreSQL (if needed)
2. ✅ Configure DATABASE_URL in backend/.env
3. ✅ Start both servers
4. ✅ Test signup/login
5. ✅ Create listings
6. ✅ Send trade requests
7. ✅ Monitor Network tab for API calls

**Everything is ready!** Just need PostgreSQL database. 🎉

