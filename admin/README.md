# Vertex Labs Admin Panel

Secure, full-stack Admin CMS + CRM for the Vertex Engineering Labs portfolio website.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | NextAuth.js v4 (JWT + Credentials) |
| Media | Cloudinary |
| UI | Tailwind CSS + Radix UI |
| Validation | Zod |

## Features

- **CMS**: Homepage Manager, Services, Projects, Testimonials
- **Mini CRM**: Leads pipeline (NEW → CONTACTED → QUALIFIED → PROPOSAL → CLOSED)
- **Media Library**: Drag-and-drop upload to Cloudinary
- **SEO Manager**: Per-page meta, OG tags, noIndex
- **Site Settings**: Grouped global configuration
- **Role-Based Access**: ADMIN / EDITOR / VIEWER
- **Audit Logging**: All create/update/delete actions logged
- **Public API**: `/api/public/*` endpoints consumed by the Vite public site

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, Cloudinary credentials

# 3. Set up database
npm run db:generate   # Generate Prisma client
npm run db:push       # Create tables in Supabase
npm run db:seed       # Seed initial data + admin user

# 4. Start development server (port 3001)
npm run dev
```

Visit `http://localhost:3001/login` and log in with the seeded admin credentials.

## Project Structure

```
admin/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── (admin)/              # Protected admin pages
│   │   ├── dashboard/
│   │   ├── homepage/
│   │   ├── services/
│   │   ├── projects/
│   │   ├── testimonials/
│   │   ├── leads/
│   │   ├── media/
│   │   ├── seo/
│   │   ├── settings/
│   │   └── users/
│   └── api/
│       ├── admin/            # Protected API routes
│       └── public/           # Public read-only API
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client singleton
│   ├── cloudinary.ts         # Upload/delete helpers
│   ├── validations.ts        # Zod schemas
│   └── api-helpers.ts        # withAuth(), ok(), err()
├── components/admin/         # Sidebar, Topbar, Providers
├── prisma/
│   ├── schema.prisma         # Database schema (15 models)
│   └── seed.ts               # Initial data seed
└── middleware.ts             # Route protection
```

## Available Scripts

```bash
npm run dev          # Start development server (port 3001)
npm run build        # Production build
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Sync schema to database (dev)
npm run db:migrate   # Create versioned migration (prod)
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio (DB GUI)
```

## Roles

| Role | Permissions |
|---|---|
| ADMIN | Full access including user management and settings |
| EDITOR | Create/update/delete content and media |
| VIEWER | Read-only access to all admin pages |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

## Future Modules (stubbed in schema)

- Case Studies (full Markdown content)
- Team Members
- Blog Posts
- Analytics Events
- Activity Log viewer
