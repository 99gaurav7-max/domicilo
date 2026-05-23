# 🏠 Domicilo - Premium Property Rental Management Platform 

A full-stack property rental management platform built with React, TypeScript, Tailwind CSS, and Node.js.

## Tech Stack

**Frontend:** React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Recharts + Zustand  
**Backend:** Node.js + Express + TypeScript + PostgreSQL  
**Authentication:** JWT with refresh tokens, role-based access  
**Payments:** Razorpay integration  
**Notifications:** Email (Nodemailer) + SMS (Twilio)  
**Deployment:** Vercel-ready

## Features

### Public
- Responsive landing page with hero section, feature cards, KPIs
- Property discovery with search/filter/sort
- Property detail page with image gallery
- Enquiry/booking submission form
- Dark/light theme auto-switch based on timezone

### Owner Dashboard
- KPI cards: Revenue, Occupancy, Dues, Tenants, Properties, Leads
- Revenue charts (Line + Bar) with date range filters
- Property management (CRUD, bulk room updates)
- Tenant management (create, search, filter, fine calculation)
- Lead management (view, approve, reject, convert to tenant)
- Payment tracking with status filters
- CSV export for payments and analytics
- Tenant onboarding with auto-generated password + SMS/Email

### Tenant Dashboard
- Rent status, due amounts, overdue flags
- Payment history
- Property & room details
- Notification center

### Admin Dashboard
- Global platform KPIs
- User management (edit/delete any user)
- Platform revenue monitoring
- Payment oversight

### Authentication
- Login/Register with role-based routing
- Forgot/Reset password flow
- Change password after login
- JWT with auto-refresh

### Payments
- Razorpay order creation and payment verification
- Invoice auto-generation
- Payment history with status tracking
- Support for Rent, Water, Electricity, Maintenance, Other

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- npm or yarn

### Environment Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd domicilo
```

2. Copy environment file:
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Database Setup

1. Create PostgreSQL database:
```bash
psql -U postgres -c "CREATE DATABASE domicilo;"
```

2. Run schema:
```bash
psql -U postgres -d domicilo -f database/schema.sql
```

3. Seed demo data:
```bash
psql -U postgres -d domicilo -f database/seed.sql
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server starts at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App starts at `http://localhost:5173`

## Demo Credentials

| Role   | Email                | Password      |
|--------|----------------------|---------------|
| Admin  | admin@domicilo.com   | Domicilo@123  |
| Owner  | rahul@example.com    | Domicilo@123  |
| Owner  | priya@example.com    | Domicilo@123  |
| Tenant | vikram@example.com   | Domicilo@123  |

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh-token` - Refresh JWT
- `GET /api/auth/profile` - Get profile (auth)
- `POST /api/auth/change-password` - Change password (auth)

### Properties (Public)
- `GET /api/properties` - List with search/filter/pagination
- `GET /api/properties/:id` - Get details
- `POST /api/properties/enquiry` - Submit enquiry

### Owner (auth: owner)
- `GET /api/owner/dashboard` - KPI dashboard
- `GET /api/owner/chart-data` - Revenue chart data
- `GET /api/owner/properties` - List properties
- `POST /api/owner/properties` - Create property
- `PUT /api/owner/properties/:id` - Update property
- `DELETE /api/owner/properties/:id` - Delete property
- `GET /api/owner/tenants` - List tenants
- `POST /api/owner/tenants` - Create tenant
- `POST /api/owner/fines` - Apply fine
- `GET /api/owner/leads` - List leads
- `PUT /api/owner/leads/:id/status` - Update lead status
- `POST /api/owner/payments/create-order` - Create Razorpay order
- `POST /api/owner/payments/verify` - Verify payment
- `GET /api/owner/payments` - List payments
- `PUT /api/owner/rooms/:id` - Update room
- `POST /api/owner/rooms/bulk-update` - Bulk update rooms

### Tenant (auth: tenant)
- `GET /api/tenant/dashboard` - Tenant dashboard data
- `GET /api/tenant/notifications` - List notifications
- `PUT /api/tenant/notifications/:id/read` - Mark read
- `PUT /api/tenant/notifications/read-all` - Mark all read

### Admin (auth: admin)
- `GET /api/admin/dashboard` - Global dashboard
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/payments` - List all payments
- `GET /api/admin/export?type=payments|tenants|properties` - CSV export

## Testing Guide

### Responsive Testing
- Use Chrome DevTools device toolbar (Ctrl+Shift+M)
- Test breakpoints: 375px (mobile), 768px (tablet), 1024px+ (desktop)
- Verify sticky headers, table responsiveness, navigation collapse

### API Testing
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@test.com","password":"test123"}'

# Get properties (public)
curl http://localhost:5000/api/properties?city=Mumbai&roomType=2BHK
```

### Payment Testing (Razorpay test mode)
Use Razorpay test card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `1234`

## Project Structure

```
domicilo/
├── frontend/           # React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── components/ # Shared UI components
│       ├── pages/      # Route pages by role
│       ├── services/   # API client
│       ├── store/      # Zustand stores
│       └── types/      # TypeScript types
├── backend/            # Express + TypeScript API
│   └── src/
│       ├── config/     # App configuration
│       ├── controllers/# Route handlers
│       ├── middleware/  # Auth, validation
│       ├── routes/     # Express routes
│       ├── types/      # Type definitions
│       └── utils/      # Helpers
└── database/           # Schema & seed files
```

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

For serverless, configure `vercel.json` to route `/api/*` to the backend.
