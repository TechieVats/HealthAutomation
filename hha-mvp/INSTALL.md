# Installation Guide

## Install pnpm

If pnpm is not installed:

```bash
# Using npm
npm install -g pnpm

# Using Homebrew (macOS)
brew install pnpm

# Using curl
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Setup Steps

1. **Install dependencies**
   ```bash
   cd hha-mvp
   pnpm install
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start Docker services**
   ```bash
   docker compose -f infra/docker/docker-compose.yml up -d
   ```

4. **Generate Prisma client**
   ```bash
   cd apps/portal
   pnpm db:generate
   ```

5. **Push database schema**
   ```bash
   pnpm db:push
   ```

6. **Start development server**
   ```bash
   # From root
   pnpm -w run dev
   
   # Or from portal directory
   cd apps/portal
   pnpm dev
   ```

## Verify Installation

- ✅ `pnpm i` succeeds
- ✅ `pnpm -w run dev` starts Next.js
- ✅ Docker services start: `docker compose -f infra/docker/docker-compose.yml up -d`

