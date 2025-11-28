# System Architecture Diagram

## 🏗️ Complete Backend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend)                            │
│              React + TypeScript + Supabase SDK                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    HTTP/HTTPS
                         │
           ┌─────────────▼─────────────┐
           │    Express Server         │
           │   (app.ts, server.ts)     │
           └─────────────┬─────────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
    ┌───────▼──────┐ ┌──▼────────┐ ┌─▼──────────┐
    │ Middleware   │ │ Routes    │ │ CORS/      │
    │ (Auth, Error)│ │ (API      │ │ Helmet/    │
    │              │ │ Endpoints)│ │ Compression│
    └───────┬──────┘ └──┬────────┘ └─┬──────────┘
            │           │            │
            └───────────┼────────────┘
                        │
          ┌─────────────▼──────────────┐
          │    Controllers Layer       │
          │ (Request/Response Handlers)│
          │ • listings.controller.ts   │
          │ • coins.controller.ts      │
          │ • trades.controller.ts     │
          └─────────────┬──────────────┘
                        │
          ┌─────────────▼──────────────┐
          │     Services Layer         │
          │  (Business Logic)          │
          │ • listings.service.ts      │
          │ • coins.service.ts         │
          │ • trades.service.ts        │
          └─────────────┬──────────────┘
                        │
          ┌─────────────▼──────────────┐
          │   Data Access Layer        │
          │  (Prisma ORM Client)       │
          └─────────────┬──────────────┘
                        │
          ┌─────────────▼──────────────┐
          │    Database (PostgreSQL)   │
          │                            │
          │ • Profile Table            │
          │ • Listing Table            │
          │ • Trade Table              │
          │ • CoinTransaction Table    │
          └────────────────────────────┘
```

---

## 📊 Request/Response Flow

```
CLIENT REQUEST
    ↓
Express Server (app.ts)
    ↓
Routes (*.routes.ts) - Matches URL & HTTP method
    ↓
Middleware - Auth check, error handling
    ↓
Controller (*.controller.ts) - Validates input with Zod
    ↓
Service (*.service.ts) - Business logic, Prisma queries
    ↓
Database (PostgreSQL) - CRUD operations
    ↓
Response ← Formatted as JSON ← Service returns data
    ↓
CLIENT RECEIVES RESPONSE
```

---

## 🔄 API Endpoint Organization

```
BASE URL: http://localhost:3000/api

┌─ /listings (7 endpoints)
│  ├─ POST   /              Create new listing
│  ├─ GET    /              Get all listings (paginated)
│  ├─ GET    /:id           Get single listing
│  ├─ GET    /user/my-listings  Get user's listings
│  ├─ PATCH  /:id           Update listing
│  ├─ DELETE /:id           Delete listing
│  └─ POST   /:id/archive   Archive listing
│
├─ /coins (5 endpoints)
│  ├─ GET    /balance           Get balance
│  ├─ POST   /add               Add coins
│  ├─ POST   /spend             Spend coins
│  ├─ GET    /history           Transaction history
│  └─ POST   /transfer          Transfer coins
│
└─ /trades (6 endpoints)
   ├─ POST   /                  Create trade
   ├─ GET    /                  Get my trades
   ├─ GET    /:id               Get trade details
   ├─ POST   /:id/confirm       Accept/reject
   ├─ POST   /:id/complete      Complete trade
   └─ POST   /:id/cancel        Cancel trade
```

---

## 🗄️ Database Entity Relationships

```
                    Profile
                   ┌──────┐
                   │ id   │
                   │ email│
                   │coins │
                   └──┬───┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    (owns)        (initiates)   (receives)
        │             │             │
    ┌───▼────────┐ ┌─▼──────────┐  │
    │  Listing   │ │   Trade    │  │
    ├────────────┤ ├────────────┤  │
    │ id         │ │ id         │  │
    │ owner_id ──┼─┼─ initiator │  │
    │ title      │ │ responder ──┼──┘
    │ category   │ │ listing_id  │
    │ status     │ │ status      │
    └────────────┘ └────────────┘
         │              │
         │          (references)
         │              │
         │         ┌────▼──────────┐
         │         │CoinTransaction│
         │         ├────────────────┤
         │         │ id             │
         │         │ user_id ───────┼─→ Profile
         │         │ amount         │
         └─────────┼─ reason        │
            (for)  └────────────────┘
```

---

## 🔐 Authentication Flow

```
Client
    ↓
Provides Authorization Header: "Bearer <token>"
    ↓
Express Router receives request
    ↓
Route has authMiddleware?
    ├─ NO  → Pass to controller
    │
    └─ YES → Auth Middleware (auth.middleware.ts)
            ├─ Extract token from header
            ├─ Verify token (JWT ready)
            ├─ Extract userId
            │
            ├─ Valid? → req.userId = extracted_id → Next
            │
            └─ Invalid? → 401 Unauthorized Error
                ↓
            Global Error Handler
                ↓
            Return error response
```

---

## 📝 Validation & Error Handling

```
Controller receives request.body
    ↓
Validate with Zod schema
    ├─ Valid? ──→ Pass to service
    │
    └─ Invalid? → Validation Error (400)
                ↓
            Format error response
                ↓
            Return to client

Service executes business logic
    ├─ Success? ──→ Return data
    │
    └─ Error? ──→ Throw AppError
            ↓
        Global Error Middleware
            ├─ Prisma error? → 400/500
            ├─ AppError? → Use statusCode
            └─ Other error? → 500 Internal Server Error
                ↓
            Return error response
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────┐
│         Cloud Platform                   │
│  (Railway / Render / Vercel)             │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  Express Server                  │   │
│  │  • Node.js 18+                   │   │
│  │  • Environment variables         │   │
│  │  • Health checks                 │   │
│  └────────────────┬─────────────────┘   │
│                   │                      │
│  ┌────────────────▼─────────────────┐   │
│  │  PostgreSQL Database             │   │
│  │  • Managed database              │   │
│  │  • Automatic backups             │   │
│  │  • SSL encrypted                 │   │
│  └──────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
         ↑
         │ HTTPS
         │
    Client Apps
    ├─ Web (React)
    ├─ Mobile (native)
    └─ Desktop (Electron)
```

---

## 🔄 Coin Transfer Transaction

```
User A (100 coins)
    │
    ↓ Requests transfer to User B: 30 coins
    │
Express Server
    │
    ↓ Validate: User A has ≥ 30 coins?
    │
Service Layer
    │
    ↓ Start Database Transaction
    ├─ Decrement User A coins by 30
    ├─ Increment User B coins by 30
    ├─ Create CoinTransaction for A: -30
    └─ Create CoinTransaction for B: +30
    │
    ↓ Commit Transaction (all or nothing)
    │
User A (70 coins)  ✓
User B (130 coins) ✓
    │
    ↓ Return success response
Client
```

---

## 📊 Data Flow: Creating a Trade

```
1. Frontend sends:
   POST /api/trades
   { listing_id, proposed_listing_id, coin_amount, message }

2. Express receives request
   ├─ Auth middleware validates token
   └─ Router forwards to tradesController

3. Controller (tradesController.createTrade)
   ├─ Extract userId from request
   ├─ Validate data with Zod schema
   └─ Call service layer

4. Service (tradesService.createTrade)
   ├─ Verify listing exists
   ├─ Check if user is listing owner (prevent self-trade)
   ├─ Verify proposed listing if provided
   └─ Create Trade in database

5. Prisma ORM
   ├─ Generate SQL: INSERT INTO trades ...
   └─ Execute on PostgreSQL

6. Database
   ├─ Add new row to trades table
   └─ Return created trade with ID

7. Service returns:
   { id, initiator_id, responder_id, status: PENDING }

8. Controller formats response:
   {
     success: true,
     data: { trade object },
     message: "Trade created successfully"
   }

9. Frontend receives response (201 Created)
   └─ Display new trade to user
```

---

## 🎯 MVC Architecture Pattern

```
            REQUEST

                ↓

        ┌───────────────┐
        │  ROUTES       │  Define endpoints & middleware
        │  (*.routes)   │
        └───────┬───────┘
                │
                ↓

        ┌───────────────────────┐
        │  CONTROLLERS          │  Handle HTTP
        │  (*.controller.ts)    │  Request/Response
        │                       │
        │ • Validate input      │
        │ • Call services       │
        │ • Format response     │
        └───────┬───────────────┘
                │
                ↓

        ┌───────────────────────┐
        │  SERVICES             │  Business logic
        │  (*.service.ts)       │
        │                       │
        │ • Query logic         │
        │ • Validation          │
        │ • Database calls      │
        └───────┬───────────────┘
                │
                ↓

        ┌───────────────────────┐
        │  PRISMA ORM           │  Database access
        │  (Database client)    │
        │                       │
        │ • Build queries       │
        │ • Execute SQL         │
        │ • Return results      │
        └───────┬───────────────┘
                │
                ↓

        ┌───────────────────────┐
        │  DATABASE             │  Data storage
        │  (PostgreSQL)         │
        └───────┬───────────────┘
                │
                ↓

            RESPONSE
```

---

## 📈 Scalability Path

```
Current Setup (Single Server)
│
├─ ✓ Works locally
├─ ✓ Works in development
├─ ✓ Works in staging
└─ ✓ Works in production (small scale)

Scale to Multiple Servers
│
├─ Add load balancer (nginx)
├─ Run multiple server instances
└─ Use managed database (AWS RDS, Render)

Add Caching Layer
│
├─ Redis for session caching
├─ Redis for coin balances
└─ Redis for trade notifications

Add Message Queue
│
├─ Bull queue for background jobs
├─ Email notifications
└─ Async operations

Add Real-time Features
│
├─ Socket.io for live chat
├─ WebSockets for notifications
└─ Real-time trade updates
```

---

## 🎓 Architecture Benefits

| Pattern | Benefit |
|---------|---------|
| **Layered** | Clear separation of concerns |
| **MVC** | Easy to find and modify code |
| **Services** | Reusable business logic |
| **Controllers** | Testable request handlers |
| **Types** | Compile-time error checking |
| **Validation** | Safe data operations |
| **Transactions** | Data consistency |

---

*Diagram created: November 27, 2025*
*BarterVerse Backend Architecture*
