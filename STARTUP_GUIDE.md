# 🚀 How to Start BarterVerse Website

## Quick Start (5 minutes)

### Prerequisites
- Node.js v16+ installed
- PostgreSQL running locally
- Git clone of the repository

---

## Step 1: Setup Environment Variables

### Backend Setup
Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/barterverse"
JWT_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
ENCRYPTION_KEY="your-256-bit-key-for-data-encryption"
CORS_ORIGINS="http://localhost:5173,http://localhost:8080"
PORT=5000
```

### Frontend Setup
Create `frontend/.env.local`:
```env
VITE_API_URL="http://localhost:5000"
```

---

## Step 2: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## Step 3: Setup Database

### Run Prisma Migrations
```bash
cd backend
npx prisma migrate dev --name initial_migration
```

This will:
- Create all database tables
- Setup Prisma client
- Seed initial data (if seed script exists)

---

## Step 4: Start the Servers

### Option A: Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```
✅ Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend runs on `http://localhost:8080`

### Option B: Using Concurrently (Both in One Terminal)

From root directory:
```bash
npm run dev  # if concurrently is configured
```

---

## Step 5: Access the Website

### 🌐 URLs
- **Frontend**: `http://localhost:8080`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

### Login
1. Go to `http://localhost:8080`
2. Click **Sign Up** or **Login**
3. Create new account or use test credentials

---

## 📊 What You Can Test

Once running, test these 4 new features:

### 1️⃣ **Data Protection & Privacy** 🔐
- Navigate to **Settings** → **Privacy Settings**
- Export your data (downloads as JSON)
- View activity audit logs
- Delete account (anonymizes data)

### 2️⃣ **Location Matching** 🗺️
- Go to **Explore** → **Location Matching**
- Allow browser to access location or enter city/country
- Search for nearby traders within 50km radius
- Find nearby listings by category

### 3️⃣ **Session Scheduling** 📅
- Navigate to **Skill Sessions**
- Create new skill session with date/time
- Set location or meeting link (for online)
- View and manage sessions
- Rate completed sessions

### 4️⃣ **Chat System** 💬
- Go to **Messages** section
- Start new conversation by entering user ID
- Send and receive messages
- View conversation history
- See unread message count

---

## 🔧 Development Commands

### Backend
```bash
cd backend

# Start development server (with auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Database commands
npx prisma migrate dev        # Create migration
npx prisma migrate reset      # Reset database
npx prisma studio            # Open Prisma Studio UI

# Seed database
npm run seed
```

### Frontend
```bash
cd frontend

# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check TypeScript errors
npm run type-check
```

---

## 🐛 Troubleshooting

### Backend won't start
- **Error: Port 5000 in use**
  ```bash
  # Kill process on port 5000
  lsof -ti:5000 | xargs kill -9  # macOS/Linux
  netstat -ano | findstr :5000   # Windows (find PID)
  taskkill /PID <PID> /F         # Windows (kill process)
  ```

- **Error: Cannot connect to database**
  - Verify PostgreSQL is running
  - Check `DATABASE_URL` in `.env`
  - Try: `psql -U postgres -d barterverse`

- **Error: Module not found**
  ```bash
  cd backend
  rm -rf node_modules package-lock.json
  npm install
  ```

### Frontend won't start
- **Error: Port 8080 in use**
  ```bash
  # Kill process or use different port
  npm run dev -- --port 3000
  ```

- **Error: Cannot reach backend**
  - Check backend is running on port 5000
  - Verify `VITE_API_URL` in `.env.local`

### Database issues
- **Migration failed**
  ```bash
  npx prisma migrate reset  # Reset and re-run all migrations
  ```

- **No tables created**
  ```bash
  npx prisma migrate dev --name init
  npx prisma db push
  ```

---

## 📈 Performance Tips

### Backend
- Use development mode for faster builds: `npm run dev`
- Clear build cache if issues: `rm -rf dist`
- Monitor API responses: Use browser DevTools Network tab

### Frontend
- Enable React DevTools extension for debugging
- Clear browser cache if styles look wrong
- Use `npm run type-check` to catch TypeScript errors early

---

## 🔐 Security Notes

⚠️ **Development vs Production:**

| Setting | Development | Production |
|---------|-------------|-----------|
| CORS_ORIGINS | `localhost:*` | `www.barterverse.in` |
| JWT_SECRET | test-secret | Strong random key |
| ENCRYPTION_KEY | test-key | 256-bit key |
| NODE_ENV | development | production |
| Database | Local PostgreSQL | Cloud/Managed DB |

---

## 📦 Project Structure

```
barter_verse/
├── backend/                 # Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/         # API endpoints (4 new routes)
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, error handling
│   │   ├── utils/          # Helpers (encryption, location, gdpr)
│   │   └── server.ts       # Entry point
│   ├── prisma/             # Database schema
│   └── package.json
│
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components (4 new)
│   │   ├── contexts/      # State management
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Main app
│   └── package.json
│
└── documentation/          # Setup guides, API docs
```

---

## ✅ Complete Startup Checklist

- [ ] Clone repository: `git clone <repo-url>`
- [ ] Backend: Create `.env` file with database URL
- [ ] Frontend: Create `.env.local` file
- [ ] Backend: `npm install` & `npm start`
- [ ] Frontend: `npm install` & `npm run dev`
- [ ] Create database and run migrations
- [ ] Verify both servers running (port 5000 & 8080)
- [ ] Open `http://localhost:8080` in browser
- [ ] Sign up / Login
- [ ] Test 4 new features

---

## 🎯 First Steps to Try

1. **Sign Up**: Create a test account
2. **Update Location**: Go to location matching, set your location
3. **Create Listing**: Post a skill/item you want to trade
4. **Schedule Session**: Create a skill session for tomorrow
5. **Send Message**: Message another user (if available)
6. **Export Data**: Go to privacy settings, download your data
7. **Check Logs**: View your activity audit log

---

## 📞 Getting Help

If you encounter issues:

1. **Check the logs**
   - Backend: Look at terminal output
   - Frontend: Open browser console (F12)

2. **Verify connectivity**
   - Backend health: `curl http://localhost:5000/api/health`
   - Frontend loads: `http://localhost:8080`

3. **Database issues**
   - Connect directly: `psql -U postgres -d barterverse`
   - Check migrations: `npx prisma migrate status`

4. **Review documentation**
   - Backend API docs in `FEATURES_IMPLEMENTATION_COMPLETE.md`
   - Feature usage guide in `FEATURE_USAGE_GUIDE.md`

---

## 🚀 You're Ready!

Everything is set up. Just run:

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev

# Then open: http://localhost:8080 🎉
```

Happy coding! 🎉
