// Vitest setup file - MUST run before any imports that use Prisma
// Set environment variables immediately
if (!process.env.NODE_ENV) {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true,
    configurable: true,
  })
}

// Set DATABASE_URL before any Prisma imports
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hha_test'
}

// Set other required env vars
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-key-change-in-production'
process.env.SIGNED_URL_SECRET = process.env.SIGNED_URL_SECRET || 'test-secret-key-change-in-production'
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

