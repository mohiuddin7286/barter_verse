# BarterVerse Backend API

A complete Node.js + Express + Prisma backend for the BarterVerse peer-to-peer trading platform.

## 🏗️ Architecture

```
backend/
├─ src/
│  ├─ app.ts                 # Express app setup
│  ├─ server.ts              # Server entry point
│  ├─ prisma/
│  │  └─ client.ts           # Prisma client singleton
│  ├─ routes/
│  │  ├─ listings.routes.ts  # Listing endpoints
│  │  ├─ coins.routes.ts     # Coin endpoints
│  │  └─ trades.routes.ts    # Trade endpoints
│  ├─ controllers/
│  │  ├─ listings.controller.ts
│  │  ├─ coins.controller.ts
│  │  └─ trades.controller.ts
│  ├─ services/
│  │  ├─ listings.service.ts
│  │  ├─ coins.service.ts
│  │  └─ trades.service.ts
│  ├─ middleware/
│  │  ├─ error.middleware.ts    # Error handling
│  │  └─ auth.middleware.ts     # Auth validation
│  └─ types/
│     └─ index.ts               # TypeScript types
│
├─ prisma/
│  ├─ schema.prisma             # Database schema
│  └─ migrations/               # Database migrations
│
├─ package.json
├─ tsconfig.json
├─ nodemon.json
└─ .env
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/barterverse"

# Server
PORT=3000
NODE_ENV=development

# JWT Secret (if needed)
JWT_SECRET=your_jwt_secret_here

# Supabase (optional)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format

All endpoints return JSON in this format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## 📋 Listings API

### Create Listing
**POST** `/api/listings`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Vintage Camera",
  "description": "Beautiful vintage camera in great condition",
  "category": "Photography",
  "image_url": "https://example.com/image.jpg",
  "is_service": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "title": "Vintage Camera",
    "description": "...",
    "category": "Photography",
    "image_url": "...",
    "is_service": false,
    "status": "ACTIVE",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

### Get All Listings
**GET** `/api/listings?page=1&limit=10&category=Photography&search=camera`

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 10
- `category` (optional): Filter by category
- `search` (optional): Search title/description

**Response:** `200 OK`

### Get Listing by ID
**GET** `/api/listings/:id`

**Response:** `200 OK`

### Get My Listings
**GET** `/api/listings/user/my-listings`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Update Listing
**PATCH** `/api/listings/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "Electronics",
  "image_url": "...",
  "is_service": false
}
```

**Response:** `200 OK`

### Delete Listing
**DELETE** `/api/listings/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Archive Listing
**POST** `/api/listings/:id/archive`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 💰 Coins API

### Get Balance
**GET** `/api/coins/balance`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "balance": 150
  }
}
```

### Add Coins
**POST** `/api/coins/add`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "amount": 50,
  "reason": "Referral bonus"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "balance": 200,
    "transaction": {
      "id": "uuid",
      "user_id": "uuid",
      "amount": 50,
      "reason": "Referral bonus",
      "created_at": "..."
    }
  }
}
```

### Spend Coins
**POST** `/api/coins/spend`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "amount": 25,
  "reason": "Featured listing"
}
```

**Response:** `200 OK`

### Get Transaction History
**GET** `/api/coins/history?limit=50`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of transactions, default: 50

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "amount": -25,
      "reason": "Featured listing",
      "created_at": "..."
    }
  ]
}
```

### Transfer Coins
**POST** `/api/coins/transfer`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "toUserId": "recipient-uuid",
  "amount": 30,
  "reason": "Trade payment"
}
```

**Response:** `200 OK`

---

## 🤝 Trades API

### Create Trade
**POST** `/api/trades`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "listing_id": "uuid",
  "proposed_listing_id": "uuid (optional)",
  "coin_amount": 10,
  "message": "Interested in this item"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "initiator_id": "uuid",
    "responder_id": "uuid",
    "listing_id": "uuid",
    "proposed_listing_id": null,
    "coin_amount": 10,
    "message": "Interested in this item",
    "status": "PENDING",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### Get My Trades
**GET** `/api/trades?type=incoming`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type`: `incoming` or `outgoing`, default: `incoming`

**Response:** `200 OK`

### Get Trade by ID
**GET** `/api/trades/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Confirm Trade
**POST** `/api/trades/:id/confirm`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "accepted": true
}
```

**Response:** `200 OK`

### Complete Trade
**POST** `/api/trades/:id/complete`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Cancel Trade
**POST** `/api/trades/:id/cancel`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 🔐 Authentication

Current implementation uses a basic `userId` from request headers/body. 

To implement JWT:

1. Update `auth.middleware.ts` to verify JWT tokens
2. Update the `AuthProvider` in frontend to send tokens
3. Add login/signup endpoints

```typescript
// Example JWT verification (update auth.middleware.ts)
import jwt from 'jsonwebtoken';

const token = authHeader.substring(7);
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
req.userId = decoded.userId;
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Production server
npm start

# Prisma migrations
npm run prisma:migrate

# View database in UI
npm run prisma:studio

# Generate Prisma types
npm run prisma:generate
```

### Database Schema

The Prisma schema includes:

- **Profile**: User profiles with coins, rating, bio
- **Listing**: Items/services to trade with owner reference
- **Trade**: Trade requests between users
- **CoinTransaction**: Coin ledger for tracking

See `prisma/schema.prisma` for full schema.

---

## 📊 Error Handling

All errors are caught and formatted:

- **400 Bad Request**: Validation errors, insufficient coins, etc.
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Unauthorized action (e.g., deleting someone else's listing)
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Database or server errors

---

## 🚀 Deployment

### Using Railway, Render, or Vercel

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables (DATABASE_URL, etc.)
4. Platform automatically builds and deploys

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 📝 License

MIT

## 👥 Support

For issues or questions, open an issue in the repository.
