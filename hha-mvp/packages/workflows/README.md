# n8n Workflows

This package contains n8n workflow definitions for Home Health Automation MVP.

## 📋 Available Workflows

### 1. Admission Intake Flow (`flow_admission_intake.json`)

**Purpose**: Automatically process referral PDFs when uploaded to `/var/data/referrals`

**Flow**:
1. **Trigger**: Folder Watch on `/var/data/referrals` (watches for PDF files)
2. **OCR Processing**: Extracts text from PDF (placeholder - configure actual OCR service)
3. **Upload to API**: POST to `/api/referrals/upload` with the PDF file
4. **Log Result**: Records processing completion

**Trigger**: File system watch (new PDF files)

**Notes**:
- Ensure `/var/data/referrals` directory exists and n8n has read permissions
- Configure OCR service node with actual Tesseract or cloud OCR API
- API endpoint handles OCR extraction and creates Patient/Referral/AdmissionPacket

### 2. E-Signature Reminder Flow (`flow_esign_reminder.json`)

**Purpose**: Send reminder emails for unsigned admission packets older than 48 hours

**Flow**:
1. **Trigger**: Daily at 9:00 AM (cron: `0 9 * * *`)
2. **Fetch Pending**: GET `/api/admissions/pending-reminders` (returns admissions with `status='pending_signature'` older than 48h)
3. **Check Has Items**: Conditional check if any pending admissions exist
4. **Loop Admissions**: Iterate through each pending admission
5. **Send Email**: Send reminder via Mailpit (dev) or SMTP (prod)

**Trigger**: Cron schedule (daily at 9am)

**Notes**:
- Requires API endpoint `/api/admissions/pending-reminders` to be implemented
- Uses Mailpit in development (localhost:1025)
- In production, configure SMTP credentials

### 3. EVV Daily Validation Flow (`flow_evv_daily_validate.json`)

**Purpose**: Hourly validation of visits with EVV events

**Flow**:
1. **Trigger**: Every hour (cron: `0 * * * *`)
2. **Fetch Visits**: GET `/api/visits/pending-validation` (returns visits with events but not validated)
3. **Loop Visits**: Iterate through each visit
4. **Validate**: GET `/api/evv/validate?visitId={id}` - calls validation endpoint
5. **Post Audit**: POST to `/api/audit/events` - creates AuditEvent record

**Trigger**: Cron schedule (hourly)

**Notes**:
- Requires API endpoints `/api/visits/pending-validation` and `/api/audit/events`
- Creates audit trail for all validation attempts
- Updates visit status to `completed` (Verified) if validation passes

## 🚀 Importing Workflows into n8n

### Method 1: Via n8n UI (Recommended)

1. **Access n8n**: Open http://localhost:5678 (or your n8n instance)
2. **Login**: Use credentials from docker-compose.yml (default: admin/admin)
3. **Import Workflow**:
   - Click **"Workflows"** in the sidebar
   - Click **"Import from File"** or **"..."** → **"Import from File"**
   - Select the JSON file from `packages/workflows/`
   - Click **"Import"**
4. **Activate**: Click the toggle switch to activate the workflow

### Method 2: Via n8n CLI

```bash
# Copy workflow file to n8n import directory
cp packages/workflows/flow_admission_intake.json /path/to/n8n/.n8n/workflows/

# Or use n8n import command (if available)
n8n import:workflow --input=packages/workflows/flow_admission_intake.json
```

### Method 3: Via REST API

```bash
# Get API key from n8n settings
export N8N_API_KEY="your-api-key"
export N8N_URL="http://localhost:5678"

# Import workflow
curl -X POST \
  "${N8N_URL}/api/v1/workflows" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @packages/workflows/flow_admission_intake.json
```

## ⚙️ Required Environment Variables

Set these in n8n environment settings or `.env` file:

### Application URLs
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# or in production:
# NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Mailpit (Development)
```bash
MAILPIT_HOST=localhost
MAILPIT_PORT=1025
```

### SMTP (Production - for email reminders)
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@hha.local
```

### File System (for folder watch)
- Ensure n8n container has access to `/var/data/referrals`
- Mount volume in docker-compose.yml if needed:
```yaml
volumes:
  - ./var/data/referrals:/var/data/referrals:ro
```

## 📝 Workflow Configuration

After importing, configure each workflow:

### Admission Intake Flow
1. **Folder Watch Node**:
   - Verify path: `/var/data/referrals`
   - Ensure n8n has file system access
2. **OCR Processing Node**:
   - Replace placeholder with actual OCR service
   - Options: Tesseract CLI, Google Vision API, AWS Textract
3. **HTTP Request Node**:
   - Verify `NEXT_PUBLIC_BASE_URL` is set correctly
   - Test endpoint is accessible from n8n container

### E-Signature Reminder Flow
1. **Cron Trigger**:
   - Verify timezone settings
   - Adjust cron expression if needed: `0 9 * * *` (9am daily)
2. **Email Node**:
   - Configure Mailpit in dev
   - Configure SMTP in production
   - Test email delivery

### EVV Daily Validation Flow
1. **Cron Trigger**:
   - Verify hourly schedule: `0 * * * *`
2. **API Endpoints**:
   - Ensure `/api/visits/pending-validation` exists
   - Ensure `/api/audit/events` exists
   - Test endpoints respond correctly

## 🔧 Required API Endpoints

Some workflows require API endpoints that may need to be implemented:

### `/api/admissions/pending-reminders`
```typescript
// Returns admissions with status='pending_signature' older than 48 hours
GET /api/admissions/pending-reminders
Response: Array<{
  id: string
  patientName: string
  patientEmail: string
  signatureLink: string
  sentAt: string
}>
```

### `/api/visits/pending-validation`
```typescript
// Returns visits with EVV events but not yet validated
GET /api/visits/pending-validation
Response: Array<{
  id: string
  patientId: string
  startPlanned: string
  evvEvents: Array<EvvEvent>
}>
```

### `/api/audit/events`
```typescript
// Creates audit event
POST /api/audit/events
Body: {
  who: string
  action: string
  entity: string
  entityId: string
  metaJson?: Record<string, unknown>
}
```

## 🧪 Testing Workflows

### Test Admission Intake
1. Copy a PDF to `/var/data/referrals/`
2. Watch n8n execution logs
3. Verify API call is made
4. Check database for new Patient/Referral/AdmissionPacket

### Test E-Signature Reminder
1. Create admission with `status='pending_signature'` and `sentAt` > 48h ago
2. Manually trigger workflow or wait for 9am
3. Check Mailpit inbox: http://localhost:8025
4. Verify email content

### Test EVV Validation
1. Create visit with EVV events
2. Manually trigger workflow or wait for next hour
3. Check validation result
4. Verify AuditEvent was created

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Workflow Examples](https://n8n.io/workflows/)
- [Cron Expression Guide](https://crontab.guru/)

## 🔒 Security Notes

- **API Authentication**: In production, configure authentication for API endpoints
- **File Access**: Restrict n8n container file system access
- **Email**: Use secure SMTP connections (TLS/SSL)
- **Credentials**: Store sensitive credentials in n8n credential manager, not in workflow JSON

## ✅ Validation

All workflow JSON files are validated for:
- ✅ Valid JSON syntax
- ✅ Required n8n node structure
- ✅ Proper connections between nodes
- ✅ Environment variable usage
- ✅ Notes and documentation

---

**Note**: These workflows are templates. Configure nodes based on your environment and replace placeholder nodes (like OCR) with actual service integrations.
