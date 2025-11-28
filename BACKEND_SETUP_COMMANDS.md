# 🚀 Backend Setup - Copy & Paste Commands

Complete setup commands to get your backend running in minutes.

---

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

**What it does**: Downloads all required packages (Express, Prisma, Zod, etc.)

**Expected output**:
```
added 373 packages, and audited 374 packages in 45s
```

---

## Step 2: Create PostgreSQL Database

### Option A: PostgreSQL CLI (if installed)

```bash
createdb barterverse
```

### Option B: Docker (Recommended)

```bash
docker run --name postgres-barterverse \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=barterverse \
  -p 5432:5432 \
  -d postgres:15
```

**Windows PowerShell** (single line):

```powershell
docker run --name postgres-barterverse -e POSTGRES_PASSWORD=password -e POSTGRES_DB=barterverse -p 5432:5432 -d postgres:15
```

---

## Step 3: Configure Environment

### Create/Edit `.env` file

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/barterverse"
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key_here_at_least_32_characters_long
```

**If using Docker with above command**:
- Username: `postgres`
- Password: `password`
- Database: `barterverse`
- Host: `localhost`
- Port: `5432`

---

## Step 4: Setup Database Schema

```bash
npm run prisma:generate
```

```bash
npm run prisma:migrate
```

**When prompted**:
```
? Enter a name for this migration: › create_initial_schema
```

**Expected output**:
```
✓ Created migration folders and migration_lock.toml
✓ Created migration: ./prisma/migrations/xxx/migration.sql
✓ Your database is now in sync with your schema.
```

---

## Step 5: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
✓ Database connected
✓ Server running on http://localhost:3000
✓ Environment: development
```

Server is now running! ✅

---

## Step 6: Test the API

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

**Expected response**:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Create a Test Listing

```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user-123" \
  -d '{
    "title": "Vintage Camera",
    "description": "Beautiful vintage camera in excellent condition, barely used",
    "category": "Photography",
    "is_service": false
  }'
```

**Expected response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "owner_id": "test-user-123",
    "title": "Vintage Camera",
    "description": "...",
    "category": "Photography",
    "is_service": false,
    "status": "ACTIVE",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

---

## Step 7: View Database (Optional)

Open Prisma Studio to view/edit data:

```bash
npm run prisma:studio
```

Opens at: `http://localhost:5555`

---

## ✅ All Set!

Your backend is now running and ready for:
- Frontend integration
- API testing
- Further development
- Deployment preparation

---

## 📚 Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled server |
| `npm run prisma:studio` | Open database UI |
| `npm run prisma:migrate` | Create new migration |
| `npm run prisma:generate` | Update Prisma types |

---

## 🐛 Troubleshooting

### "Cannot connect to database"

1. Check PostgreSQL is running:
   ```bash
   # If using Docker
   docker ps
   ```

2. Check DATABASE_URL in `.env`

3. Test connection:
   ```bash
   psql postgresql://postgres:password@localhost:5432/barterverse
   ```

### "Port 3000 in use"

Change in `.env`:
```env
PORT=3001
```

Then restart: `npm run dev`

### "Module not found"

Reinstall dependencies:
```bash
rm -r node_modules
npm install
```

### "Migration failed"

Reset database (⚠️ deletes all data):
```bash
npx prisma migrate reset
```

---

## 🔌 Frontend Integration

### API Base URL

```
http://localhost:3000/api
```

### Example Fetch Requests

```typescript
// Get listings
const response = await fetch('http://localhost:3000/api/listings');
const data = await response.json();

// Create listing (authenticated)
const response = await fetch('http://localhost:3000/api/listings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    title: 'Item Name',
    description: 'Item Description',
    category: 'Category',
    is_service: false
  })
});
```

---

## 📖 Full Documentation

- **API Docs**: `backend/README.md`
- **Quick Setup**: `backend/QUICKSTART.md`
- **Architecture**: `BACKEND_IMPLEMENTATION_COMPLETE.md`
- **Checklist**: `BACKEND_CHECKLIST.md`

---

## 🚀 Next Steps

1. ✅ Backend running locally
2. → Implement JWT authentication
3. → Connect frontend to backend
4. → Test all endpoints
5. → Deploy to production

---

## 💡 Tips

- Use `npm run prisma:studio` to view database while developing
- Check `backend/README.md` for all endpoint details
- Add logging with `console.log()` in services for debugging
- Use Postman/Insomnia to test endpoints with UI
- Keep `.env` secure, never commit to git

---

## ✨ You're Done!

Your backend is ready. Next, connect your frontend and start building! 🎉

---

*Last updated: November 27, 2025*
