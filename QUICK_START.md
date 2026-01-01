# Quick Start Guide

## What You Can Run Right Now

### ✅ 1. Run Tests (No Setup Required)

```bash
npm test
```

This will run the Zod schema and adapter tests.

### ✅ 2. Check TypeScript Compilation

```bash
npx tsc --noEmit
```

### ✅ 3. Run Linter

```bash
npm run lint
```

## To Run the Full Application

### Step 1: Create .env File

```bash
cp .env.example .env
```

Then edit `.env` and set at minimum:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret (run: `openssl rand -base64 32`)
- `JWT_SECRET` - Random secret (run: `openssl rand -base64 32`)

### Step 2: Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- n8n (port 5678)
- Metabase (port 3001)

### Step 3: Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with synthetic data
npm run db:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Quick Test Without Database

You can test the adapters and validation without a database:

```bash
npm test
```

## What Works Without Setup

- ✅ All Zod schema validation
- ✅ Adapter interface tests
- ✅ TypeScript compilation checks
- ✅ Linting

## What Requires Database

- ❌ API routes (need PostgreSQL)
- ❌ NextAuth (needs database)
- ❌ Prisma queries
- ❌ File uploads (need uploads directory, but that exists)

