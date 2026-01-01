# Architecture Assumptions

## Monorepo Structure

- **apps/**: Application packages (Next.js, etc.)
- **packages/**: Shared libraries and utilities
- **infra/**: Infrastructure as code (Docker, etc.)
- **docs/**: Documentation

## Database

- PostgreSQL 15 via Docker
- Default credentials: hha/hha/hha (dev only)
- Prisma for ORM and migrations

## Authentication

- NextAuth with email provider
- File-based adapter for development (stores in `.next/auth-sessions.json`)
- Production should use Prisma adapter

## Adapters

All external system integrations use interface-first pattern:
- Mock implementations in development
- Easy to swap for production implementations
- No hardcoded credentials

## Workflows

- n8n for automation
- Workflow definitions stored as JSON
- Import/export via n8n UI

## Testing

- Synthetic data only (no PHI)
- Test utilities in `@hha-mvp/testing`
- Domain types validated with Zod

## Development

- pnpm workspaces for monorepo management
- TypeScript strict mode
- Shared domain types across packages

