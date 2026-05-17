# 🚀 Smart Leads Dashboard

A full-stack **Lead Management Dashboard** built with the **MERN stack** (MongoDB, Express.js, React, Node.js). Features JWT authentication, role-based access control, advanced filtering with debounced search, CSV export, analytics, and dark mode.

---

## ✨ Features

### 🔐 Authentication System
- JWT-based authentication with secure token handling
- User registration with role selection (Admin / Sales)
- Login with persistent sessions
- Password hashing with bcrypt
- Auth middleware for protected routes
- Automatic token refresh and expiry handling

### 📋 Leads Management (CRUD)
- **Create** — Add new leads with validation
- **Read** — View leads list with detailed view per lead
- **Update** — Edit lead information, change status
- **Delete** — Admin-only lead deletion with confirmation dialog
- Lead fields: Name, Email, Status, Source, Phone, Company, Job Title, Notes
- Activity timeline tracking on each lead

### 🔍 Advanced Filtering & Search
- **Filter by Status**: New, Contacted, Qualified, Lost
- **Filter by Source**: Website, Instagram, Referral
- **Debounced Search** (300ms): Search by name or email
- **Sort by**: Latest, Oldest, Name A–Z, Name Z–A
- ✅ Multiple filters work together simultaneously
  - Example: Status = Qualified + Source = Instagram + Search = "Rahul"

### 📄 Pagination
- Backend pagination with **10 records per page**
- Proper `skip` and `limit` implementation
- Pagination metadata in API response (page, total, totalPages, hasNext, hasPrev)

### 🛡️ Role-Based Access Control
| Capability | Admin | Sales |
|---|---|---|
| View leads | ✅ | ✅ |
| Create leads | ✅ | ✅ |
| Edit leads | ✅ | ✅ |
| Delete leads | ✅ | ❌ |

### 📥 CSV Export
- Export all leads or filtered results to CSV
- Authenticated download with proper headers
- Date-stamped filenames (`leads_2024-01-15.csv`)

### 📊 Analytics Dashboard
- Summary statistics with animated counters
- Lead source bar chart
- Lead status donut chart
- Lead trends area chart
- Status breakdown with progress bars

### 🌙 Dark Mode
- Full dark mode support across all pages
- Toggle button in the top bar
- Smooth theme transitions
- Dark scrollbar styling

### 🎨 UI/UX
- Responsive design (mobile, tablet, desktop)
- Collapsible sidebar with hamburger menu on mobile
- Loading states with skeleton screens
- Empty states with helpful messages and CTAs
- Toast notifications for all user actions
- Form validation with inline error messages
- Smooth animations and micro-interactions

---

## 🛠️ Tech Stack

### Frontend
- **React.js** with **TypeScript**
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **React Router v7** for navigation
- **Axios** with interceptors for API
- **next-themes** for dark mode
- **date-fns** for date formatting
- **Zod** for validation schemas
- **Sonner** for toast notifications

### Backend
- **Node.js** with **Express.js**
- **TypeScript** throughout
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Zod** for request validation middleware
- **json2csv** for CSV export

---

## 📁 Project Structure

```
├── server/                      # Express backend
│   ├── constants/               # Shared enums and validation rules
│   │   └── index.ts
│   ├── controllers/             # Route controllers
│   │   ├── authController.ts
│   │   ├── leadController.ts
│   │   └── analyticsController.ts
│   ├── middleware/              # Auth, validation, error handling
│   │   ├── auth.ts              # JWT auth + role-based access
│   │   ├── validate.ts          # Zod validation middleware
│   │   └── errorHandler.ts      # Centralized error handler
│   ├── models/                  # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Lead.ts
│   │   └── Activity.ts
│   ├── routes/                  # API route definitions
│   ├── utils/                   # Seed data utility
│   ├── db/                      # Database connection
│   └── index.ts                 # Server entry point
├── src/                         # React frontend
│   ├── components/
│   │   ├── layout/              # Layout, Sidebar, TopBar, ProtectedRoute
│   │   ├── shared/              # StatusBadge, SourceBadge, EmptyState
│   │   └── ui/                  # shadcn/ui primitives
│   ├── contexts/                # AuthContext
│   ├── hooks/                   # useLeads, useDebounce, useIsMobile
│   ├── pages/                   # Dashboard, LeadsList, LeadDetail, LeadForm, Analytics, Login
│   ├── services/                # API service class
│   └── types/                   # TypeScript interfaces and enums
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
git clone <repository-url>
cd smart-leads-dashboard
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ `JWT_SECRET` is **required**. The server will not start without it.

### Running the Application

**Terminal 1 — Backend:**
```bash
npm run server:dev
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Frontend: `http://localhost:5173` | Backend: `http://localhost:5000`

### Using Docker

```bash
docker-compose up
```

This starts both MongoDB and the application automatically.

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@leadflow.com` | `admin123` |
| Sales | `rahul@leadflow.com` | `sales123` |

---

## 📡 API Documentation

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login and get JWT | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Leads

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/leads` | List leads (filtered, paginated) | ✅ | All |
| POST | `/api/leads` | Create new lead | ✅ | All |
| GET | `/api/leads/:id` | Get single lead + activities | ✅ | All |
| PUT | `/api/leads/:id` | Update lead | ✅ | All |
| DELETE | `/api/leads/:id` | Delete lead | ✅ | Admin |
| POST | `/api/leads/:id/activity` | Add activity | ✅ | All |
| GET | `/api/leads/export` | Export leads to CSV | ✅ | All |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/summary` | Dashboard summary | ✅ |

### Query Parameters for `GET /api/leads`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Records per page (max 100) |
| `search` | string | — | Search in name, email, company |
| `status` | string | — | `new`, `contacted`, `qualified`, `lost` |
| `source` | string | — | `website`, `instagram`, `referral` |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Valid email is required" }]
}
```

---

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | No (default: `development`) |
| `PORT` | Server port | No (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string | No (default: `localhost`) |
| `JWT_SECRET` | Secret key for JWT signing | **Yes** |
| `CLIENT_URL` | Frontend URL for CORS | No (default: `http://localhost:5173`) |
| `VITE_API_URL` | API base URL for frontend | No (default: `http://localhost:5000/api`) |

---

## ✅ Assignment Checklist

- [x] TypeScript (mandatory) — frontend + backend
- [x] Proper interfaces/types defined everywhere
- [x] Minimal `any` usage (zero)
- [x] JWT authentication with bcrypt
- [x] Protected routes + auth middleware
- [x] CRUD for leads
- [x] Filter by Status + Source
- [x] Search by Name or Email (debounced 300ms)
- [x] Sort by Latest / Oldest
- [x] Multiple filters working together
- [x] Backend pagination (10/page, skip/limit)
- [x] Pagination metadata in response
- [x] Responsive design
- [x] Reusable components
- [x] Proper folder structure
- [x] Loading states (skeletons)
- [x] Empty states
- [x] Error handling UI
- [x] Form validation
- [x] RESTful API with proper status codes
- [x] Centralized error handling
- [x] Request validation (Zod middleware)
- [x] Clean response format
- [x] Debounced search
- [x] CSV export functionality
- [x] Role-Based Access Control (Admin/Sales)
- [x] Docker setup (docker-compose + Dockerfile)
- [x] Dark mode support (bonus)
- [x] .env.example
- [x] API documentation
- [x] Setup instructions
