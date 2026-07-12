# AssetFlow

## Overview

**AssetFlow** is a complete enterprise asset management solution built for the Oddo hackathon. It is designed to solve the problem of fragmented asset tracking, department resource allocation, maintenance coordination, bookings, and audit compliance.

This project is built top-to-bottom by our team and includes:
- full frontend user experience
- secure backend API
- data models, business rules, and workflow automation
- seeded demo data and role-based access control

## Problem Statement

Organizations often struggle with asset visibility, approvals, and lifecycle tracking. Existing systems are disjointed, resulting in:
- asset loss and misallocation
- maintenance delays
- booking conflicts
- audit gaps
- poor stakeholder communication

**AssetFlow** solves this by unifying asset, booking, maintenance, audit, notifications, and reporting workflows in one application.

## What AssetFlow Delivers

- Asset registration & categorization
- Department and employee organization management
- Asset allocation and transfer request workflows
- Resource booking with conflict prevention
- Maintenance request lifecycle and approval tracking
- Audit cycle verification with immutable activity logs
- Real-time user notifications via SSE
- Role-based access control for secure operations
- Analytics dashboard with charts and KPI summaries

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, React Router, React Hook Form, Zod, TanStack Query, TanStack Table, Recharts, FullCalendar, React QR Code
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT authentication, RBAC middleware, SSE notifications
- **Monorepo:** `client/` for frontend, `server/` for backend

## Architecture Summary

- `client/` contains the React dashboard and all user-facing pages.
- `server/` provides REST APIs, authentication, business logic, and MongoDB persistence.
- `server/src/models` defines data entities such as `Asset`, `User`, `Department`, `Booking`, `MaintenanceRequest`, and `AuditCycle`.
- `server/src/controllers` encapsulates each workflow and ensures validation, notifications, and audit logging.
- `server/src/routes` exposes protected endpoints for organization setup, assets, allocations, bookings, maintenance, audits, reports, and notifications.

## Key Features

### Role-based workflows
- **Admin**: Manage departments, categories, employees, and system settings
- **Asset Manager**: Create departments and categories, manage assets and allocations
- **Department Head**: Approve transfers/bookings and manage audit process
- **Employee**: Request assets, book resources, raise maintenance cases

### Asset management
- Auto-generated asset tags
- QR payload generation for asset scans
- Full asset history and status tracking
- Category-specific custom fields

### Allocation & transfer
- Prevents duplicate asset allocation
- Tracks active allocations and returns
- Transfer requests with approval flow
- Asset status updates on allocation

### Booking & availability
- Resource booking for rooms, vehicles, and equipment
- Availability conflict detection
- Bookings show calendar and department allocation

### Maintenance workflow
- Maintenance request creation and tracking
- Approval/rejection flow for technicians and managers
- Asset status transitions during maintenance

### Audit and reporting
- Build audit cycles for departments and locations
- Verify assets and log audit results
- Report metrics for utilization, maintenance, department distribution, retirement, and warranty

### Notifications
- Real-time Server-Sent Events (SSE) notifications
- Notification feed with unread tracking
- Notification broadcasting for asset changes, approvals, and maintenance updates

## Demo Data and Users

The project includes seeded demo data to make evaluation easy. Seeded users and roles:
- **Admin:** `admin@assetflow.com` / `Admin@123`
- **Asset Manager:** `manager@assetflow.com` / `Manager@123`
- **Department Head:** `head@assetflow.com` / `Head@123`
- **Employee:** `employee@assetflow.com` / `Employee@123`

Seeded departments and categories include IT, HR, and Operations plus assets like laptops, vehicles, and conference rooms.

## Setup Instructions

### 1. Install dependencies
From project root:
```bash
npm install
npm install -w server
npm install -w client
```

### 2. Configure environment variables
- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` (or create `client/.env`) if needed
- Add:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `JWT_EXPIRES`
  - `APP_BASE_URL`
  - `VITE_API_URL`

### 3. Seed demo data
```bash
npm run seed
```

### 4. Run application
```bash
npm run dev
```

### 5. Access the app
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Project Structure

### Frontend (`client/`)
- `src/pages/` — feature pages for dashboard, assets, bookings, maintenance, audit, reports, org setup, notifications
- `src/components/` — reusable UI components such as cards, tables, sidebar, topbar
- `src/context/` — authentication and theme state
- `src/api/client.js` — Axios instance with auth header injection

### Backend (`server/`)
- `src/models/` — Mongoose models for users, assets, departments, bookings, maintenance, audit, notifications, and activity logs
- `src/controllers/` — business logic and workflow implementation
- `src/routes/` — secure REST endpoints with role-based access control
- `src/middleware/` — JWT authentication, RBAC, error handling
- `src/utils/` — activity logging, notifications, asset tagging, constants
- `src/seed.js` — seed script for demo data

## API Highlights

- `POST /api/auth/login` — user login with JWT
- `GET /api/auth/me` — current user profile
- `GET /api/org` — load departments, categories, employees
- `POST /api/org/departments` — create department
- `POST /api/assets` — create asset
- `POST /api/allocations` — allocate asset
- `POST /api/bookings` — create booking
- `POST /api/maintenance` — create maintenance request
- `POST /api/audits` — create audit cycle
- `GET /api/notifications/stream` — real-time SSE notification stream

## Evaluation Highlights

This repo demonstrates a full-featured end-to-end asset management MVP that is:
- built from scratch by the team
- based on a real enterprise workflow
- backed by MongoDB and secure JWT auth
- equipped with RBAC and approval flows
- seeded with realistic sample data
- designed for hackathon delivery and live demo readiness

## Future Improvements

Possible production upgrades include:
- SMTP email for verification and password reset
- image/file uploads via S3 or cloud storage
- Redis caching and queueing
- CI pipeline and automated tests
- audit tamper-evident logs and compliance reporting

## Notes for Evaluators

AssetFlow is a complete team-built solution for the Oddo hackathon problem statement. It is not a template or copied sample — it includes custom data models, permission rules, real-time notifications, asset lifecycle workflows, and a user-friendly admin experience.

For a demo, log in as Admin, create a department or category, allocate an asset, place a booking, submit a maintenance request, and review the audit flow.
