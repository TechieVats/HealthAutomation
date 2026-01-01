# Home Health Automation MVP

A Home Health Automation MVP built exclusively with free and open-source tools.

## 🎯 Features

- **Patient Management**: Track patients using synthetic IDs (no PHI in development)
- **Document Processing**: OCR using Tesseract.js with optional LangChain integration
- **E-signature**: Documenso integration for document signing
- **EHR Integration**: Interface-first adapter for EHR systems (Epic, Cerner, etc.)
- **EVV**: Electronic Visit Verification adapter
- **Workflow Automation**: n8n integration for automated workflows
- **Analytics**: Metabase for reporting and dashboards
- **Authentication**: NextAuth with email link, GitHub, and Google providers

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (TypeScript), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Zod validation
- **Database**: PostgreSQL (via Prisma)
- **Workflows**: n8n (Docker)
- **OCR**: Tesseract.js + LangChain (optional)
- **E-signature**: Documenso (self-hosted)
- **Analytics**: Metabase
- **Storage**: Local filesystem with signed URLs
- **Auth**: NextAuth

## 📋 Prerequisites

- Node.js 18.18+ (20.9+ recommended)
- Docker and Docker Compose
- PostgreSQL (or use Docker Compose)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd HealthAutomation
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- n8n workflow engine (http://localhost:5678)
- Metabase analytics (http://localhost:3001)

### 4. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with synthetic data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── patients/     # Patient endpoints
│   │   ├── documents/    # Document management
│   │   ├── visits/       # Visit tracking
│   │   └── care-plans/   # Care plan management
│   ├── lib/
│   │   ├── adapters/     # Interface-first adapters
│   │   │   ├── ehr-adapter.ts
│   │   │   ├── evv-adapter.ts
│   │   │   ├── esign-adapter.ts
│   │   │   └── ocr-adapter.ts
│   │   ├── prisma.ts     # Prisma client
│   │   ├── storage.ts    # File storage utilities
│   │   └── zod-schemas.ts # Validation schemas
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data script
├── docs/
│   └── assumptions.md    # Architecture decisions
├── uploads/              # File uploads (local storage)
└── docker-compose.yml    # Docker services
```

## 🔐 Security & Privacy

- **No PHI in logs**: All logging uses synthetic data
- **Secrets management**: All secrets via `.env`, never hardcoded
- **Signed URLs**: Secure file access with JWT tokens
- **Interface-first adapters**: Easy to swap implementations

## 🔌 Adapters

### EHR Adapter

Interface: `EHRAdapter`

```typescript
import { ehrAdapter } from '@/app/lib/adapters/ehr-adapter'

// Sync care plan to EHR
const result = await ehrAdapter.syncCarePlan(carePlanId, carePlanData)
```

### EVV Adapter

Interface: `EVVAdapter`

```typescript
import { evvAdapter } from '@/app/lib/adapters/evv-adapter'

// Verify visit
const result = await evvAdapter.verifyVisit(visitId, visitData)
```

### E-Signature Adapter

Interface: `ESignAdapter`

```typescript
import { esignAdapter } from '@/app/lib/adapters/esign-adapter'

// Request signature
const result = await esignAdapter.requestSignature(documentId, email, name)
```

### OCR Adapter

Interface: `OCRAdapter`

```typescript
import { ocrAdapter } from '@/app/lib/adapters/ocr-adapter'

// Process document
const result = await ocrAdapter.processDocument(filePath, {
  outputFormat: 'structured',
})
```

## 📝 API Endpoints

### Patients

- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient

### Documents

- `GET /api/documents?patientId=...` - List documents
- `POST /api/documents` - Upload document (multipart/form-data)
- `POST /api/documents/[id]/ocr` - Process OCR on document

### Visits

- `GET /api/visits?patientId=...` - List visits
- `POST /api/visits` - Create visit

### Care Plans

- `GET /api/care-plans?patientId=...&status=...` - List care plans
- `POST /api/care-plans` - Create care plan

### Files

- `GET /api/files/[...path]?token=...` - Access file via signed URL

## 🧪 Testing

```bash
npm test
```

## 📚 Documentation

See `/docs/assumptions.md` for architecture decisions and assumptions.

## 🔄 Workflows (n8n)

Access n8n at http://localhost:5678

- Default username: `admin`
- Default password: `admin` (change in production!)

Create workflows to automate:
- Document processing pipelines
- EHR synchronization
- Visit verification
- Notification systems

## 📊 Analytics (Metabase)

Access Metabase at http://localhost:3001

Set up dashboards to visualize:
- Patient metrics
- Visit statistics
- Document processing rates
- Care plan completion rates

## 🚨 Important Notes

1. **Node Version**: Requires Node.js 18.18+ (20.9+ recommended for Next.js 16)
2. **Synthetic Data**: Development uses synthetic patient data - no real PHI
3. **Production**: Update all secrets and configure proper auth providers
4. **LangChain**: Requires Node.js 20+. Enable with `ENABLE_LANGCHAIN=true`

## 🤝 Contributing

1. Follow the interface-first adapter pattern
2. All features must include:
   - Zod schemas for validation
   - Minimal tests
   - Seed data
   - README documentation

## 📄 License

MIT

---

**SUCCESS**: Home Health Automation MVP initialized with all core components!

