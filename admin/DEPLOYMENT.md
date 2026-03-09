# Vertex Labs Admin Panel — Deployment Guide

## Architecture Overview

```
vertex-labs/
├── (root)              ← Public Vite site (Vercel project #1)
└── admin/              ← Next.js Admin Panel (Vercel project #2)
    ├── app/            ← App Router pages + API routes
    ├── prisma/         ← Schema + migrations + seed
    └── lib/            ← Auth, Prisma client, helpers
```

Both apps share the same **Supabase PostgreSQL** database. The public site fetches data from the admin's `/api/public/*` endpoints.

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier: 25GB)
- [Vercel](https://vercel.com) account

---

## Step 1: Get Supabase Connection String

1. Go to **Supabase Dashboard → Settings → Database**
2. Under **Connection string**, select **URI** tab
3. Copy the **Direct connection** URI (for Prisma migrations):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```
4. For **production serverless** (pooled connection), also copy the **Pooler → Transaction** URI

---

## Step 2: Configure Environment Variables

```bash
cd admin
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3001"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
SEED_ADMIN_EMAIL="admin@vertexlabs.com"
SEED_ADMIN_PASSWORD="ChangeMe123!"
ALLOWED_ORIGINS="http://localhost:5173"
```

---

## Step 3: Install Dependencies & Set Up Database

```bash
cd admin

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to Supabase (creates all tables)
npm run db:push

# Seed the database with initial data + admin user
npm run db:seed
```

> **Note:** `db:push` is used for initial setup. For subsequent changes, use `npm run db:migrate` to create versioned migrations.

---

## Step 4: Run Locally

```bash
# Terminal 1: Admin panel (port 3001)
cd admin && npm run dev

# Terminal 2: Public Vite site (port 5173)
cd .. && npm run dev
```

Visit:
- Admin panel: http://localhost:3001/login
- Login with the email/password from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`

To connect the Vite site to the admin API, add to `/.env.local`:
```env
VITE_ADMIN_API_URL=http://localhost:3001
```

---

## Step 5: Deploy Admin Panel to Vercel

### 5a. Create a new Vercel project for the admin

```bash
# From the admin directory
npx vercel --cwd admin
```

Or via the Vercel dashboard:
1. **New Project → Import Repository** (your GitHub repo)
2. Set **Root Directory** to `admin`
3. Framework: **Next.js**

### 5b. Set Environment Variables in Vercel

In Vercel dashboard → Project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase **pooled** connection URI (from Step 1) |
| `NEXTAUTH_SECRET` | Random 32-byte base64 string |
| `NEXTAUTH_URL` | `https://admin.yourdomain.com` (your admin Vercel URL) |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `ALLOWED_ORIGINS` | `https://yourdomain.com` (public site URL) |
| `SEED_ADMIN_EMAIL` | Initial admin email |
| `SEED_ADMIN_PASSWORD` | Initial admin password |

### 5c. Run migrations in production

After first deploy, run the seed via Vercel's build command or locally:
```bash
DATABASE_URL="your-production-url" npm run db:push
DATABASE_URL="your-production-url" npm run db:seed
```

---

## Step 6: Connect Public Vite Site to Admin API

In the public site's Vercel project, add:
```env
VITE_ADMIN_API_URL=https://your-admin-app.vercel.app
```

The public site's `src/lib/adminApi.ts` automatically uses this URL.

---

## Step 7: Custom Domain (Optional)

1. In Vercel: **Project → Settings → Domains**
2. Add `admin.yourdomain.com` for the admin panel
3. Update `NEXTAUTH_URL` and `ALLOWED_ORIGINS` accordingly

---

## Updating the Database Schema

When you add new Prisma models:
```bash
cd admin

# Create a versioned migration
npm run db:migrate

# Push the migration to production
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| "PrismaClient not initialized" | Run `npm run db:generate` |
| "Unauthorized" on API routes | Check `NEXTAUTH_SECRET` matches between client and server |
| Images not loading | Verify your Cloudinary cloud name and that the domain is in `next.config.js` |
| CORS errors on public API | Add your domain to `ALLOWED_ORIGINS` env var |
| Supabase connection timeout | Use the **pooled** connection URI for serverless deployments |
