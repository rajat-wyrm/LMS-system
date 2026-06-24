# Course Compass — LMS System

A production-grade, full-stack **Learning Management System** with three purpose-built applications: a student-facing web portal, an instructor portal, and a dedicated admin console. Built with a modern TypeScript-first stack end to end.

> One repo. Three apps. One cohesive design system.

---

## Highlights

- 🎓 **Student portal** — course discovery, learning paths, video player, progress tracking, certificates, and a personal dashboard
- 👨‍🏫 **Instructor portal** — course authoring, lesson management, and student insights
- 🛠️ **Admin console** — platform-wide KPIs, user/course/teacher management, analytics, notifications, and settings
- 🔐 **JWT auth + role-based access** for student, instructor, and admin surfaces
- ⚡ **Production-ready backend** with Prisma, PostgreSQL, Redis caching, BullMQ queues, rate limiting, and OpenAPI docs
- 🎨 **A unified dark/light design system** with custom shadcn/ui primitives and bespoke admin components

---

## Architecture

```
LMS-system/
├── backend/              # Node.js + Express 5 API (Prisma + PostgreSQL)
├── course-compass-main/  # Student & instructor web portal (Vite + React + TS)
└── admin/                # Admin console (Vite + React + Tailwind)
```

```
┌──────────────────┐     ┌──────────────────┐
│  Student Portal  │     │  Admin Console   │
│  (Vite + React)  │     │  (Vite + React)  │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │      REST + JWT        │
         └──────────┬─────────────┘
                    │
            ┌───────▼────────┐
            │  Express 5 API │
            │  (Node.js)     │
            └───────┬────────┘
                    │
      ┌─────────────┼──────────────┐
      │             │              │
┌─────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐
│ PostgreSQL│ │   Redis    │ │  BullMQ    │
│  (Prisma) │ │ cache+rate │ │  workers   │
└───────────┘ └────────────┘ └────────────┘
```

---

## Tech Stack

### Backend (`/backend`)
- **Node.js** with **Express 5**
- **Prisma ORM** on **PostgreSQL** (read-replica ready)
- **Redis** (via `ioredis`) for caching and rate limiting
- **BullMQ** for background jobs (email worker included)
- **JWT** auth with refresh tokens
- **Zod** for runtime validation
- **Pino** structured logging
- **Swagger / OpenAPI** documentation
- **Helmet**, **CORS**, **compression**, **express-rate-limit**
- **Multer** for file uploads

### Student & Instructor Portal (`/course-compass-main`)
- **Vite** + **React 18** + **TypeScript**
- **TailwindCSS** with a custom design token layer
- **shadcn/ui** primitives (Radix UI under the hood)
- **React Router 6**, **TanStack Query**, **Axios**
- **React Hook Form** + **Zod** for forms
- **Recharts** for analytics visualizations
- **Sonner** for toasts, **Framer Motion** for motion

### Admin Console (`/admin`)
- **Vite** + **React 19** + **JavaScript (JSX)**
- **TailwindCSS** with a bespoke dark/light token system
- **Recharts** for charts
- **React Router 7**, **React Icons**, **Firebase** (auth/analytics)
- **Framer Motion** for transitions

---

## Getting Started

### Prerequisites
- **Node.js** v18+ (Node 20 LTS recommended)
- **PostgreSQL 14+** (or a hosted Supabase / Neon / RDS instance)
- **Redis 6+** (local Docker works fine)
- npm or pnpm

### 1. Clone & install
```bash
git clone https://github.com/rajat-wyrm/LMS-system.git
cd LMS-system
npm run install:all
```

This installs root, `backend`, `course-compass-main`, and `admin` workspaces in one go.

### 2. Configure environment

Before running the application, ensure your `.env` files are correctly configured.

#### `backend/.env`
Create a `.env` in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
# For local PostgreSQL:
DATABASE_URL="postgresql://postgres:password@localhost:5432/lms"
# For external Supabase PostgreSQL:
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
```

#### `admin/.env` (if using Firebase)
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### 3. Database setup
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed    # optional: loads sample courses
```

### 4. Run the stack
From the repo root:
```bash
npm run dev
```

This launches all three apps concurrently:

| App               | URL                       |
|-------------------|---------------------------|
| Backend API       | http://localhost:5000     |
| API Docs (Swagger)| http://localhost:5000/api-docs |
| Student Portal    | http://localhost:3000 (or http://localhost:8081) |
| Admin Console     | http://localhost:3001 (or http://localhost:5173) |

---

## Project Structure

```
LMS-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Data model
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js                 # Express app wiring
│   │   ├── config/                # DB client, env
│   │   ├── controllers/           # Route handlers
│   │   ├── docs/                  # Swagger spec
│   │   ├── middlewares/           # auth, validate, error, cache, upload
│   │   ├── queues/                # BullMQ queues
│   │   ├── routes/v1/             # Versioned API routes
│   │   ├── services/              # Redis service
│   │   ├── utils/                 # logger, jwt, ai generator
│   │   ├── validations/           # Zod schemas
│   │   └── workers/               # Background job workers
│   ├── scripts/                   # CLI utilities
│   └── server.js                  # Entry point
│
├── course-compass-main/
│   └── src/
│       ├── api/                   # Axios clients per domain
│       ├── components/
│       │   ├── common/            # CourseCard, etc.
│       │   └── ui/                # shadcn primitives + Navbar/Sidebar/Footer
│       ├── hooks/
│       ├── layouts/               # MainLayout
│       ├── pages/
│       │   ├── Auth/              # Login, Register, Forgot/Reset Password
│       │   ├── Certificate/
│       │   ├── Courses/           # Courses, CourseDetails, CoursePlayer, LearningPaths, CreateCourse
│       │   ├── Dashboard/
│       │   ├── Portal/            # InstructorPortal, ManageCourse
│       │   └── Profile/
│       ├── routes/                # AppRouter
│       ├── store/                 # AuthContext
│       ├── styles/                # Global CSS + design tokens
│       └── utils/
│
├── admin/
│   └── src/
│       ├── components/
│       │   ├── admin/             # analytics, courses, dashboard, notifications, settings, students, teachers
│       │   └── ui/                # Navbar, AdminSidebar, KpiCard, StatsCard, FilterDropdown, HeroHeader
│       ├── context/               # Sidebar, DateRange, Theme
│       ├── hooks/
│       ├── layouts/               # AdminLayout
│       ├── pages/
│       │   ├── Auth/              # AdminLogin
│       │   └── Dashboard/Admin/   # Dashboard, Courses, Students, Teachers, Users, Reviews, Analytics, Notifications, Settings
│       ├── routes/                # AppRouter, AdminRoute
│       └── utils/                 # theme, dashboardDateFilter, export, search, courseUtils, teacherUtils
│
└── package.json                   # Root workspace orchestrator (concurrently)
```

---

## API Overview

Versioned REST API under `/api/v1`. All authenticated endpoints expect `Authorization: Bearer <jwt>`.

| Resource     | Endpoints                                                |
|--------------|----------------------------------------------------------|
| Auth         | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh` |
| Users        | `GET /users`, `GET /users/:id`, `PATCH /users/:id`       |
| Profile      | `GET /profile/me`, `PATCH /profile/me`                   |
| Courses      | `GET /courses`, `POST /courses`, `GET /courses/:id`, `PATCH /courses/:id`, `DELETE /courses/:id` |
| Enrollment   | `POST /enrollment`, `GET /enrollment/me`                 |
| Upload       | `POST /upload` (multipart)                               |
| Admin        | `/admin/*` — gated by admin role                          |

Full schemas available at **`http://localhost:5000/api-docs`**.

---

## Design System

The system uses a **dark-first, glassmorphic, neon-accented** visual language shared across the student portal and the admin console.

- **Primary:** Cyan `#06B6D4` (HSL `189 94% 43%`)
- **Secondary:** Violet `#8B5CF6` (HSL `258 90% 66%`)
- **Accent:** Blue `#3B82F6` (HSL `217 91% 60%`)
- **Background:** Deep navy `#0A0E1F` (HSL `229 63% 5%`)
- **Typography:** Poppins (display), Inter (body), JetBrains Mono (code)
- **Effects:** glassmorphism, gradient mesh, glow shadows, aurora background

A complete, copy-pasteable design token spec is included in [`UI-UX-DESIGN.md`](./UI-UX-DESIGN.md).

---

## Scripts

From the repo root:

| Command                | Description                                      |
|------------------------|--------------------------------------------------|
| `npm run dev`          | Start backend + student portal + admin in parallel |
| `npm run dev:backend`  | Backend only                                     |
| `npm run dev:frontend` | Student portal only                              |
| `npm run dev:admin`    | Admin console only                               |
| `npm run install:all`  | Install all workspaces                           |

From `backend/`:
| Command                       | Description                       |
|-------------------------------|-----------------------------------|
| `npm run dev`                 | Nodemon with auto-reload          |
| `npm start`                   | Production start                  |
| `npx prisma migrate dev`      | Apply migrations                  |
| `npx prisma studio`           | Inspect DB                        |

---

## Performance & Production Notes

- **Caching** is layered: in-memory `node-cache` for hot paths, Redis for shared sessions and rate-limit counters
- **Read-replica support** via `@prisma/extension-read-replicas`
- **Queue-based** email and async work via BullMQ — request handlers return immediately
- **Compression** (gzip) and **Helmet** security headers enabled by default
- **Rate limiting** uses Redis so it works correctly across instances
- Frontends use **code-splitting** and **lazy routes** for fast first paints

Optimization write-ups live in `backend/Phase_1_Optimization_Report.md` and `backend/Phase_2_Report.md`.

---

## Deployment

A typical split:

- **Backend** → Render / Railway / Fly.io / a VM behind Nginx
- **Student portal** → Vercel / Netlify / Cloudflare Pages (Vite static build)
- **Admin console** → Vercel / Netlify / Cloudflare Pages (Vite static build)
- **PostgreSQL** → Supabase / Neon / RDS
- **Redis** → Upstash / Redis Cloud / self-hosted

Configure the frontend `VITE_API_BASE_URL` (or equivalent) to point at the deployed backend.

---

## Roadmap

- [ ] Live classes (WebRTC)
- [ ] Discussion forum per course
- [ ] Mobile app (React Native, sharing the design system)
- [ ] AI tutor (extending the `aiGenerator` backend utility)
- [ ] Multi-tenant org support

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Author

**Rajat Kumar**
GitHub: [@rajat-wyrm](https://github.com/rajat-wyrm)
