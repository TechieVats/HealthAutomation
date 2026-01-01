# Monorepo Structure Verification

## ✅ Created Structure

```
hha-mvp/
├── apps/
│   └── portal/                    # Next.js application
│       ├── app/                   # Next.js App Router
│       ├── lib/                   # Utilities (Prisma, Auth)
│       ├── prisma/                # Prisma schema
│       └── package.json
├── packages/
│   ├── domain/                    # Zod schemas + types
│   │   ├── src/index.ts
│   │   └── package.json
│   ├── adapters/                  # External system adapters
│   │   ├── src/index.ts
│   │   └── package.json
│   ├── workflows/                 # n8n workflow JSON
│   │   ├── referral-processing.json
│   │   ├── visit-verification.json
│   │   └── README.md
│   └── testing/                   # Test utilities
│       ├── src/index.ts
│       └── package.json
├── infra/
│   └── docker/
│       └── docker-compose.yml    # PostgreSQL, n8n, Documenso, Metabase
├── docs/
│   └── assumptions.md
├── .env.example
├── .gitignore
├── .prettierrc
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## ✅ Key Features

1. **Monorepo with pnpm workspaces**
2. **Portal app** with Next.js, Tailwind, NextAuth (file-based adapter)
3. **Domain package** with Zod schemas for all entities
4. **Adapters package** with mock implementations
5. **Workflows package** with n8n JSON definitions
6. **Testing package** with synthetic data generators
7. **Docker Compose** with all services configured
8. **Prisma schema** with all required entities

## ✅ Prisma Schema Entities

- Patient (id, mrn, firstName, lastName, dob, payer)
- Referral (id, patientId, source, pdfPath, status)
- AdmissionPacket (id, patientId, dataJson, signedPdfPath, status)
- Employee (id, name, role, licenseNo, licenseExpiry)
- Visit (id, patientId, caregiverName, startPlanned, endPlanned, status)
- EvvEvent (id, visitId, kind, timestamp, lat, lng)
- TimesheetRow (id, employeeId, visitId, minutes, type)
- Notification (id, to, channel, subject, link, sentAt)
- AuditEvent (id, who, action, entity, entityId, when, metaJson)

## ✅ Docker Services

- postgres:15 (port 5432, db=hha, user=hha, pass=hha)
- n8n (port 5678, admin/admin)
- documenso (port 3001)
- metabase (port 3002)

## 📝 Next Steps

1. Install pnpm: `npm install -g pnpm`
2. Install dependencies: `pnpm install`
3. Start services: `docker compose -f infra/docker/docker-compose.yml up -d`
4. Run dev: `pnpm -w run dev` or `pnpm --filter portal dev`

---

**SUCCESS P1**: Monorepo structure complete!

