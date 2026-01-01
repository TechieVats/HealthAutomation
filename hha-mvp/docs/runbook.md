# HHA MVP Runbook

Step-by-step guide to set up and run the Home Health Automation MVP.

## Prerequisites

- Node.js >= 18.18.0
- pnpm >= 8.0.0
- Docker and Docker Compose
- Git

## Initial Setup

### 1. Install Dependencies

```bash
# Install pnpm globally if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `SIGNED_URL_SECRET` - Secret for signed URL generation
- `NEXT_PUBLIC_BASE_URL` - Base URL of your portal (default: http://localhost:3000)

### 3. Start Docker Services

Start PostgreSQL, n8n, Documenso, and Metabase:

```bash
cd infra/docker
docker compose up -d
```

Verify services are running:

```bash
docker compose ps
```

Expected services:
- `postgres` on port 5432
- `n8n` on port 5678
- `documenso` on port 3001
- `metabase` on port 3002

### 4. Generate Prisma Client

Generate Prisma client for the portal app:

```bash
pnpm --filter portal db:generate
```

### 5. Run Database Migrations

Push the database schema:

```bash
pnpm --filter portal db:push
```

### 6. Seed Database

Populate the database with synthetic test data:

```bash
pnpm seed
```

This creates:
- 3 patients
- 2 employees
- 5 visits with future times
- Associated EVV events and timesheet rows

### 7. Start Portal

Start the Next.js portal:

```bash
pnpm dev
```

The portal will be available at: http://localhost:3000

## Running the Demo Script

The demo script automates the complete workflow:

```bash
pnpm demo
```

This script:
1. Generates/uploads a referral PDF
2. Calls `/api/referrals/upload` (OCR extraction)
3. Creates patient, referral, and admission
4. Sends admission for signature (mock)
5. Completes signature via webhook
6. Creates a visit
7. Simulates EVV clock in/out
8. Validates the visit
9. Exports payroll CSV

At the end, it prints all artifact paths and portal URLs.

## Setting Up n8n Workflows

### 1. Access n8n

Open n8n in your browser:
- URL: http://localhost:5678
- First time: Create admin account

### 2. Import Workflows

Import the workflow JSON files from `packages/workflows/`:

1. Click **"Workflows"** → **"Import from File"**
2. Select `packages/workflows/flow_admission_intake.json`
3. Repeat for:
   - `flow_esign_reminder.json`
   - `flow_evv_daily_validate.json`

### 3. Configure Environment Variables

In n8n, go to **"Settings"** → **"Variables"** and set:

- `NEXT_PUBLIC_BASE_URL`: `http://localhost:3000` (or your portal URL)
- `MAILPIT_HOST`: `localhost` (if using Mailpit for emails)

### 4. Activate Workflows

For each imported workflow:
1. Click the workflow to open it
2. Click **"Active"** toggle to enable it
3. Verify trigger nodes are configured correctly

### 5. Test Workflows

**Admission Intake Flow:**
- Place a PDF in `/var/data/referrals/`
- Watch folder should trigger OCR and upload

**E-Signature Reminder Flow:**
- Runs daily at 9am
- Finds pending signatures > 48 hours old
- Sends reminder emails

**EVV Daily Validate Flow:**
- Runs hourly
- Validates visits with events
- Posts audit events

See `packages/workflows/README.md` for detailed workflow documentation.

## Setting Up Metabase

### 1. Access Metabase

Open Metabase in your browser:
- URL: http://localhost:3002
- First time: Create admin account

### 2. Connect to PostgreSQL

1. Click **"Settings"** → **"Admin"** → **"Databases"**
2. Click **"Add database"**
3. Select **"PostgreSQL"**
4. Enter connection details:
   ```
   Display name: HHA MVP Production
   Host: postgres (or localhost:5432)
   Port: 5432
   Database name: hha
   Username: hha
   Password: hha
   ```
5. Click **"Save"**

### 3. Verify Connection

1. Test the connection
2. Metabase will scan the database schema
3. Tables should appear in the data browser

### 4. Create Dashboards

Import or create dashboards using the example SQL queries from `packages/analytics/metabase.md`:

**Example Queries:**
1. EVV Verification Rate by Week
2. Average Time from Referral Upload to Signed Admission
3. Payroll Minutes by Employee, Week

See `packages/analytics/metabase.md` for complete SQL queries and setup instructions.

## Common Workflows

### Upload a Referral

1. Go to: http://localhost:3000/referrals/new
2. Upload a PDF file
3. Review extracted fields (OCR)
4. Click **"Create Admission"**

### View Patient Admission

1. Go to: http://localhost:3000/patients/[patientId]/admission
2. Review admission data
3. Click **"Send for Signature"**
4. Refresh status to see completion
5. Download signed PDF

### Manage Visit Schedule

1. Go to: http://localhost:3000/admin/schedule
2. Find a visit
3. Click **"Push to EVV"**
4. Click **"Simulate Clock In"** / **"Simulate Clock Out"**
5. Click **"Validate"** to verify

### Export Payroll

1. Go to: http://localhost:3000/admin/timesheets
2. Select a week
3. Review timesheet preview
4. Click **"Export CSV"**

## Troubleshooting

### Docker Services Not Starting

```bash
# Check logs
docker compose logs

# Restart services
docker compose restart

# Rebuild if needed
docker compose up -d --build
```

### Database Connection Issues

```bash
# Verify PostgreSQL is running
docker compose ps postgres

# Check connection string in .env
# Should be: postgresql://hha:hha@localhost:5432/hha

# Test connection
psql postgresql://hha:hha@localhost:5432/hha -c "SELECT 1"
```

### Portal Not Starting

```bash
# Check if port 3000 is in use
lsof -i :3000

# Regenerate Prisma client
pnpm --filter portal db:generate

# Clear Next.js cache
rm -rf apps/portal/.next
```

### n8n Workflows Not Running

1. Verify workflows are **Active**
2. Check trigger configurations (cron schedules, folder paths)
3. View execution history in n8n
4. Check n8n logs: `docker compose logs n8n`

### Metabase Connection Fails

1. Verify PostgreSQL container name: `postgres`
2. Check if using Docker network (use `postgres` as host) or external (use `localhost:5432`)
3. Test PostgreSQL connection from Metabase container:
   ```bash
   docker compose exec metabase ping postgres
   ```

## Development Commands

```bash
# Start portal
pnpm dev

# Run tests
pnpm --filter portal test

# Type check
pnpm type-check

# Lint
pnpm lint

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

## Data Storage

### Local File Paths

- Referrals: `var/data/referrals/`
- E-signature PDFs: `var/data/esign/`
- Payroll CSVs: `var/data/payroll/`

### Database

- Location: PostgreSQL in Docker
- Connection: `postgresql://hha:hha@localhost:5432/hha`
- Schema: Managed by Prisma in `apps/portal/prisma/schema.prisma`

## Security Notes

⚠️ **Important for Production:**

1. **Change Default Secrets**: Update `NEXTAUTH_SECRET` and `SIGNED_URL_SECRET` in `.env`
2. **Database Credentials**: Use strong passwords for PostgreSQL
3. **Environment Variables**: Never commit `.env` to version control
4. **PHI Protection**: Logger automatically redacts PHI-like patterns
5. **Admin Routes**: Protected by NextAuth middleware
6. **Signed URLs**: PDF downloads require signed URLs with 10-minute expiry

## Next Steps

1. **Authentication**: Set up real NextAuth providers (email, OAuth)
2. **OCR**: Integrate production OCR service
3. **E-Signature**: Connect to real Documenso or DocuSign
4. **EHR Integration**: Implement real EHR adapter
5. **EVV**: Connect to production EVV system
6. **Email**: Configure email provider for notifications
7. **Monitoring**: Set up logging and error tracking
8. **CI/CD**: Configure automated testing and deployment

## Support

For issues or questions:
- Check logs: `docker compose logs`
- Review test outputs: `pnpm test`
- See workflow docs: `packages/workflows/README.md`
- See analytics docs: `packages/analytics/metabase.md`

---

**Last Updated**: See git history for latest changes.

