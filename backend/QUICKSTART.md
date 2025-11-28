# Quick Start Guide

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Set Up Database

Create a PostgreSQL database:

```bash
createdb barterverse
```

Or use Docker:

```bash
docker run --name postgres-barterverse \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=barterverse \
  -p 5432:5432 \
  -d postgres:15
```

## 3. Configure Environment

Update `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/barterverse"
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

## 4. Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted, create your first migration:

```
→ What is the name of your migration? create_initial_schema
```

## 5. Start Development Server

```bash
npm run dev
```

Should see:
```
✓ Database connected
✓ Server running on http://localhost:3000
✓ Environment: development
```

## 6. Test API

Try the health check endpoint:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

## 7. Create Test Data

Use Prisma Studio to add test data:

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555` - add profiles and listings through the UI.

## Testing Endpoints

### Create a listing (with auth)

```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "title": "Laptop",
    "description": "Great working condition",
    "category": "Electronics",
    "is_service": false
  }'
```

### Get listings

```bash
curl http://localhost:3000/api/listings?page=1&limit=10
```

### Get balance

```bash
curl http://localhost:3000/api/coins/balance \
  -H "Authorization: Bearer test-token"
```

## Next Steps

1. **Implement JWT Authentication**: Update `auth.middleware.ts` and frontend
2. **Add Validation**: Extend Zod schemas in services
3. **Add Rate Limiting**: Use `express-rate-limit`
4. **Add Logging**: Use `pino` or `winston`
5. **Add Tests**: Use Jest and Supertest
6. **Deploy**: Use Railway, Render, or Vercel

## Troubleshooting

### "Cannot find module 'express'"

```bash
# Install dependencies again
npm install
```

### "Database connection failed"

Check your DATABASE_URL in `.env` matches your PostgreSQL instance.

### "Migration failed"

Reset the database:

```bash
npx prisma migrate reset
```

## Project Structure Explanation

- **services/**: Business logic (create, read, update, delete operations)
- **controllers/**: Request handling and response formatting
- **routes/**: API endpoint definitions and middleware
- **middleware/**: Error handling, authentication, logging
- **prisma/**: Database schema and client

This follows the **MVC (Model-View-Controller)** pattern for clean, maintainable code.

## Key Features Implemented

✅ Complete CRUD for Listings, Coins, and Trades
✅ Input validation with Zod
✅ Error handling middleware
✅ Database transactions for coin transfers
✅ Ownership verification for sensitive operations
✅ Pagination support
✅ Search and filtering
✅ TypeScript for type safety
✅ Prisma ORM for database management

Ready to build! 🚀
