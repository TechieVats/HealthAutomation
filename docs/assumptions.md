# Architecture Assumptions & Decisions

This document outlines key assumptions and architectural decisions made during development.

## Node.js Version

- **Assumption**: Node.js 18.18+ is available (20.9+ recommended)
- **Rationale**: Next.js 16 requires Node 20.9+, but we use compatible versions where possible
- **Note**: LangChain integration requires Node 20+

## Database

- **Assumption**: PostgreSQL is available (via Docker Compose or external)
- **Default**: Docker Compose provides PostgreSQL on port 5432
- **Schema**: Managed via Prisma migrations

## Authentication

- **Assumption**: Email provider requires SMTP configuration
- **Fallback**: GitHub and Google OAuth as alternatives
- **Session Strategy**: JWT-based (stateless)

## File Storage

- **Development**: Local filesystem (`/uploads`)
- **Production**: Should migrate to cloud storage (S3, etc.)
- **Access**: Signed URLs with expiration (default 1 hour)

## Synthetic Data

- **Assumption**: Development uses synthetic patient data only
- **No PHI**: Real PHI should never be used in development/testing
- **Synthetic IDs**: All patients have `syntheticId` for tracking without PHI

## Adapters

### EHR Adapter
- **Interface-First**: Implementation can be swapped
- **Mock Mode**: Returns mock data in development
- **Future**: Integrate with Epic, Cerner, AllScripts, etc.

### EVV Adapter
- **Interface-First**: Implementation can be swapped
- **Mock Mode**: Returns mock verification in development
- **Future**: Integrate with HHAeXchange, CareVoyant, etc.

### E-Signature Adapter
- **Target**: Documenso (self-hosted)
- **Mock Mode**: Returns mock signature IDs in development
- **Future**: Full Documenso API integration

### OCR Adapter
- **Engine**: Tesseract.js (client-side)
- **Optional**: LangChain for structured parsing (requires Node 20+)
- **Future**: Cloud OCR services (Google Vision, AWS Textract)

## Workflows (n8n)

- **Access**: http://localhost:5678
- **Database**: Uses same PostgreSQL instance
- **Default Auth**: Basic auth (change in production!)
- **Future**: OAuth, webhook integrations

## Analytics (Metabase)

- **Access**: http://localhost:3001
- **Database**: Separate database on same PostgreSQL instance
- **Future**: Connect to production analytics warehouse

## Environment Variables

- **Required**: `DATABASE_URL`, `NEXTAUTH_SECRET`
- **Optional**: All adapter configurations
- **Security**: Never commit `.env` to version control

## API Design

- **RESTful**: Standard REST patterns
- **Validation**: Zod schemas for all inputs
- **Response Format**: `{ success: boolean, data?: T, error?: string }`
- **Error Handling**: Consistent error responses

## Logging

- **No PHI**: Never log patient names, DOB, SSN, addresses
- **Synthetic IDs**: Use `syntheticId` for patient references
- **Structured Logs**: JSON format for production

## Testing

- **Minimal Tests**: Focus on critical paths
- **Seed Data**: Always includes synthetic test data
- **Integration**: Test adapters with mocks

## shadcn/ui

- **Note**: shadcn/ui CLI requires Node.js 20+
- **Current State**: Tailwind CSS is configured and ready for shadcn/ui
- **Installation**: Can be done manually or when Node.js 20+ is available
- **Components**: Can be added individually using `npx shadcn@latest add [component]`

## Future Considerations

1. **Scalability**: Consider Redis for caching, queue management
2. **Monitoring**: Add OpenTelemetry, Sentry
3. **Compliance**: HIPAA considerations for production
4. **Performance**: Database indexing, query optimization
5. **Security**: Rate limiting, input sanitization
6. **Deployment**: Docker images, CI/CD pipelines
7. **UI Components**: Install shadcn/ui components when Node.js 20+ is available

