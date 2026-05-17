# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack. This application provides a complete CRM solution for managing leads with authentication, role-based access control, advanced filtering, CSV export, and analytics.

## Features

### Authentication
- JWT-based authentication with secure token handling
- User registration and login
- Password hashing with bcrypt
- Protected routes with auth middleware

### Lead Management (CRUD)
- Create, read, update, and delete leads
- Lead fields: Name, Email, Phone, Company, Job Title, Status, Source, Notes
- View single lead details with activity timeline
- Auto-generated activities on lead creation and status changes

### Advanced Filtering & Search
- Filter by Status (New, In Progress, Converted, Lost)
- Filter by Source (Website, Social Media, Referral, Email, Direct)
- Search by Name, Email, or Company (debounced at 300ms)
- Sort by Latest/Oldest or Name A-Z/Z-A
- Multiple filters work together simultaneously

### Pagination
- Backend pagination with 10 records per page
- Proper skip/limit implementation
- Pagination metadata in API response

### Role-Based Access Control
- Admin role: Full access (create, edit, delete all leads)
- Sales role: Can create and edit leads, cannot delete

### CSV Export
- Export all leads or filtered results to CSV
- Proper headers with all lead fields
- Direct download via API endpoint

### Analytics Dashboard
- Summary statistics with animated counters
- Lead source bar chart
- Lead status donut chart
- Lead trends area chart
- Status breakdown with progress bars

### UI/UX
- Responsive design for all screen sizes
- Loading states and skeleton screens
- Empty states with helpful messages
- Toast notifications for user feedback
- Form validation with inline error messages
- Smooth animations and transitions

## Tech Stack

### Frontend
- React.js with TypeScript
- TailwindCSS for styling
- shadcn/ui components
- Recharts for data visualization
- React Router for navigation
- Axios for API requests
- date-fns for date formatting

### Backend
- Node.js with Express.js
- TypeScript throughout
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- json2csv for CSV export

## Project Structure

```
.
├── server/                  # Express backend
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Auth & error middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── utils/               # Seed data utility
│   ├── db/                  # Database connection
│   └── index.ts             # Server entry point
├── src/                     # React frontend
│   ├── components/          # Reusable components
│   │   ├── layout/          # Sidebar, TopBar, Layout
│   │   └── shared/          # StatusBadge, SourceBadge, EmptyState
│   ├── contexts/            # Auth context
│   ├── hooks/               # Custom hooks (useLeads, useDebounce)
│   ├── pages/               # Page components
│   ├── services/            # API service
│   └── types/               # TypeScript types
├── docker-compose.yml       # Docker setup
├── Dockerfile               # Container configuration
└── .env.example             # Environment variables template
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-leads-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and JWT secret.

### Running the Application

#### Development Mode (Frontend + Backend separately)

Terminal 1 - Backend:
```bash
npm run server:dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000`.

#### Using Docker

```bash
docker-compose up
```

This starts both MongoDB and the application.

#### Production Build

Build the frontend:
```bash
npm run build
```

Start the backend (serves both API and frontend):
```bash
npm run server
```

### Default Login Credentials

After seeding, you can log in with:
- **Admin**: `admin@leadflow.com` / `admin123`
- **Sales**: `rahul@leadflow.com` / `sales123`

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user |

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (with filters, pagination) |
| POST | `/api/leads` | Create new lead |
| GET | `/api/leads/:id` | Get single lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/activity` | Add activity |
| GET | `/api/leads/export` | Export leads to CSV |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Get dashboard summary |

### Query Parameters for GET /api/leads
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, searches name/email/company)
- `status` (string: new, in_progress, converted, lost)
- `source` (string: website, social_media, referral, email, direct)
- `sortBy` (string: createdAt, name)
- `sortOrder` (string: asc, desc)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smart-leads` |
| `JWT_SECRET` | Secret key for JWT | Required |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## Evaluation Criteria Coverage

- [x] TypeScript usage throughout (frontend + backend)
- [x] Proper interfaces and types defined
- [x] Clean folder structure
- [x] Reusable components
- [x] Loading states and empty states
- [x] Error handling (UI + API)
- [x] Form validation
- [x] Debounced search (300ms)
- [x] CSV export functionality
- [x] Role-based access control (Admin/Sales)
- [x] Docker setup
- [x] RESTful API with proper status codes
- [x] Centralized error handling
- [x] Request validation
- [x] Clean response format
- [x] Pagination with metadata
- [x] Responsive design
# Smart-Leads-Dashboard
