# ✅ Final Checklist Before Testing

## Status: **READY TO CONNECT** ✅

---

## ✅ Backend Setup Complete

- [x] Dependencies installed (npm install)
- [x] Port changed from 3000 to 5000
- [x] Prisma client generated
- [x] Auth endpoints created (/auth/signup, /auth/signin)
- [x] Token verification middleware implemented
- [x] Auth service for user creation
- [x] Auth controller with signup/signin logic
- [x] Express app configured with all routes
- [x] CORS enabled for frontend
- [x] Error handling middleware added
- [x] Security headers (Helmet) enabled
- [x] Database schema ready (Profile, Listing, Trade, CoinTransaction)
- [x] All 18 API endpoints configured
- [ ] PostgreSQL database created and running

---

## ✅ Frontend Setup Complete

- [x] Axios HTTP client created (src/lib/api.ts)
- [x] API base URL configured (http://localhost:5000/api)
- [x] Auth context updated for JWT tokens
- [x] Listings context updated for API calls
- [x] Coins context updated for API calls
- [x] Trades context updated for API calls
- [x] All page components use new API client
- [x] Token stored in localStorage
- [x] Environment variables configured
- [x] npm install completed
- [x] No compilation errors

---

## ⚠️ Prerequisites Check

- [ ] **PostgreSQL installed** (https://www.postgresql.org/download/)
- [ ] **PostgreSQL running** (default: localhost:5432)
- [ ] **Database created**: barterverse
- [ ] **backend/.env DATABASE_URL configured**

Example .env:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/barterverse"
```

---

## 🚀 Launch Sequence

### Pre-Launch (Do Once)
- [ ] PostgreSQL running
- [ ] Database "barterverse" created
- [ ] backend/.env DATABASE_URL correct
- [ ] No TypeScript errors in backend
- [ ] No TypeScript errors in frontend

### Launch Step 1 - Backend
```powershell
cd d:\barter_verse\backend
npm run dev
```

**Wait for this message:**
```
✓ Database connected
✓ Server running on http://localhost:5000
```

If not seen, check:
- [ ] PostgreSQL running
- [ ] DATABASE_URL correct in .env
- [ ] Check backend error logs

### Launch Step 2 - Frontend
```powershell
cd d:\barter_verse
npm run dev
```

**Wait for this message:**
```
VITE v5.4.19  ready in 500 ms
Local: http://localhost:8080/
```

---

## 🧪 Test Sequence

### Test 1: Server Health Check
```bash
curl http://localhost:5000/health
# Expected: {"success":true,"message":"Server is running"}
```
- [ ] Backend responds on port 5000

### Test 2: Signup via API
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"test123","username":"test1"}'
```
- [ ] Returns 201 Created
- [ ] Returns user object and token

### Test 3: Signup via Frontend
1. Open http://localhost:8080
2. Click "Sign Up"
3. Enter: test2@example.com / password123
4. Click Submit
- [ ] Redirects to Dashboard
- [ ] No error messages

### Test 4: Check Token Storage
1. Open DevTools (F12)
2. Go to Application → Storage → localStorage
- [ ] Find key: "auth_token"
- [ ] Find key: "user"
- [ ] Token is not empty

### Test 5: Create Listing
1. Click "Post Listing"
2. Fill in: Title, Description, Category
3. Upload image (optional)
4. Click "Post"
- [ ] Deducts 10 coins (100 → 90)
- [ ] Redirects to Explore
- [ ] Listing appears in list

### Test 6: View Listings
1. Click "Explore"
2. See all listings
3. Click on a listing
4. Click "Send Trade Request"
- [ ] Modal opens
- [ ] Can enter amount and message
- [ ] Can submit request

### Test 7: API Calls Verification
1. Open DevTools (F12)
2. Go to Network tab
3. Perform any action (create listing, send trade, etc)
4. Look for API call
- [ ] Request URL: http://localhost:5000/api/...
- [ ] Request header: Authorization: Bearer ...
- [ ] Response status: 200/201/202

---

## 📊 Verification Checklist

### Backend
- [ ] Port 5000 configured in .env
- [ ] DATABASE_URL points to PostgreSQL
- [ ] Auth endpoints exist: /api/auth/signup, /api/auth/signin
- [ ] Middleware folder has auth.middleware.ts
- [ ] Controllers folder has auth.controller.ts
- [ ] Services folder has auth.service.ts
- [ ] Routes folder has auth.routes.ts
- [ ] No TypeScript compilation errors
- [ ] Prisma client generated successfully

### Frontend
- [ ] src/lib/api.ts exists and has all methods
- [ ] .env.local has VITE_API_BASE_URL=http://localhost:5000/api
- [ ] AuthContext.tsx uses api.signin() and api.signup()
- [ ] ListingsContext.tsx uses api.getListings(), etc
- [ ] CoinContext.tsx uses api.getBalance(), etc
- [ ] TradeContext.tsx uses api.getTrades(), etc
- [ ] No TypeScript compilation errors
- [ ] npm install completed without errors

---

## 🔍 Error Diagnostics

### If Backend Won't Start

Check these in order:
1. [ ] PostgreSQL is running
2. [ ] DATABASE_URL in .env is correct
3. [ ] Database "barterverse" exists
4. [ ] Port 5000 is not in use: `netstat -ano | findstr :5000`
5. [ ] Delete node_modules and reinstall: `npm install`
6. [ ] Check npm run dev output for error message

### If Frontend Won't Start

Check these in order:
1. [ ] npm install completed
2. [ ] Node.js version compatible (18+)
3. [ ] .env.local exists with VITE_API_BASE_URL
4. [ ] Port 8080 is not in use
5. [ ] Check npm run dev output for error message
6. [ ] Try: `npm cache clean --force && npm install`

### If Backend and Frontend Connected But No Data

Check these in order:
1. [ ] DevTools Network tab shows requests to :5000
2. [ ] Responses have "success": true
3. [ ] Check browser console for error messages
4. [ ] Check backend console for error messages
5. [ ] Clear localStorage and try again
6. [ ] Check Prisma Studio: `npm run prisma:studio`

---

## 📝 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Backend won't start | PostgreSQL not running - install and start it |
| "Cannot connect to database" | Check DATABASE_URL matches your setup |
| "Port 5000 already in use" | Kill process: `netstat -ano \| findstr :5000` |
| Frontend shows blank page | Check browser console for errors |
| "Module not found" errors | Run `npm install` again |
| Token not in localStorage | Sign out, clear cache, sign in again |
| "Unauthorized" on API calls | Verify Authorization header in Network tab |

---

## 📚 Documentation Reference

| File | Purpose |
|------|---------|
| START_HERE.md | Quick 3-step startup guide |
| CONNECTION_STATUS.md | Detailed connection guide with examples |
| QUICK_START.md | Quick reference for common tasks |
| INTEGRATION_SUMMARY.md | Full architectural overview |
| backend/README.md | Complete API documentation |

---

## 🎯 Success Criteria

You're successful when:

✅ Backend running on http://localhost:5000 without errors
✅ Frontend running on http://localhost:8080 without errors
✅ Can signup with email and password
✅ Token appears in browser localStorage
✅ Can create listing
✅ Can see all listings
✅ Can send trade request
✅ Network tab shows Authorization header on requests
✅ No console errors in browser or terminal

---

## 🚨 Critical Requirements

**MUST HAVE:**
1. PostgreSQL database running locally
2. Backend/.env DATABASE_URL configured
3. Both servers running (backend on :5000, frontend on :8080)

**OPTIONAL (Nice to have):**
1. Prisma Studio for database inspection
2. curl or Postman for API testing
3. PostgreSQL GUI tool (pgAdmin)

---

## 📞 Getting Help

1. **Check documentation first**: All 5 markdown files above
2. **Read error messages carefully**: They usually tell you what's wrong
3. **Check DevTools Network tab**: See exact API requests/responses
4. **Verify both servers are running**: Check terminal output
5. **Check PostgreSQL is running**: This is the most common issue

---

**Status**: 🟢 READY TO TEST - Just start both servers!

