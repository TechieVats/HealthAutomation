# 🏥 Home Health Automation MVP

A comprehensive home health automation system built with modern web technologies. This application helps manage patient referrals, admissions, visits, EVV (Electronic Visit Verification), payroll, and more.

## 📋 Table of Contents

- [What is This?](#what-is-this)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Using the Application](#using-the-application)
- [Services & Ports](#services--ports)
- [Project Structure](#project-structure)
- [Deployment](#deployment) 🆕
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## 🎯 What is This?

This is a **Home Health Automation MVP** (Minimum Viable Product) that automates various tasks in a home health care business:

- **📄 Referral Processing**: Upload referral PDFs and automatically extract patient information using OCR
- **✍️ E-Signatures**: Send admission packets for electronic signatures
- **📅 Visit Management**: Schedule and track home health visits
- **✅ EVV Verification**: Verify visits using Electronic Visit Verification (EVV) with geofencing
- **💰 Payroll**: Generate timesheets and export payroll data
- **📊 Analytics**: View reports and analytics in Metabase

**Perfect for**: Home health agencies, care coordinators, and healthcare administrators.

---

## 📦 Prerequisites

Before you begin, make sure you have the following installed on your computer:

### Required Software

1. **Node.js** (version 18.18 or higher)
   - Download from: https://nodejs.org/
   - Recommended: Version 20.9 or higher
   - Verify installation: Open terminal and run `node --version`

2. **pnpm** (package manager)
   - Install globally: `npm install -g pnpm`
   - Verify installation: Run `pnpm --version` (should be 8.0 or higher)

3. **Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - This is needed to run PostgreSQL, n8n, Documenso, and Metabase
   - Verify installation: Run `docker --version`

4. **Git** (optional, only needed if cloning from repository)
   - Download from: https://git-scm.com/
   - **Note**: If you're using a zip file, you don't need Git!

### System Requirements

- **Operating System**: macOS, Windows, or Linux
- **RAM**: At least 4GB (8GB recommended)
- **Disk Space**: At least 2GB free
- **Internet**: Required for downloading dependencies

---

## 🚀 Installation Guide

### Step 1: Get the Code

You can get the code in two ways:

#### Option A: Using Git (Recommended)

If you have Git installed:

```bash
# Clone the repository
git clone <repository-url>
cd hha-mvp
```

#### Option B: Using a Zip File

If you downloaded the project as a zip file:

1. **Extract the zip file**:
   - On **Windows**: Right-click the zip file → "Extract All" → Choose a location
   - On **Mac**: Double-click the zip file (it will extract automatically)
   - On **Linux**: Right-click → "Extract Here" or use: `unzip hha-mvp.zip`

2. **Navigate to the extracted folder**:
   ```bash
   # Open terminal/command prompt and navigate to the folder
   cd /path/to/extracted/hha-mvp
   
   # Example on Windows:
   cd C:\Users\YourName\Downloads\hha-mvp
   
   # Example on Mac/Linux:
   cd ~/Downloads/hha-mvp
   ```

3. **Verify you're in the right folder**:
   ```bash
   # You should see files like package.json, pnpm-workspace.yaml, etc.
   ls  # Mac/Linux
   dir # Windows
   ```

**Note**: Make sure you extracted the entire folder structure. You should see folders like `apps/`, `packages/`, `infra/`, etc.

### Step 2: Install Dependencies

Open a terminal/command prompt in the project folder and run:

```bash
# Install all project dependencies
pnpm install
```

This will install all required packages. It may take a few minutes the first time.

**What this does**: Downloads and installs all the code libraries (dependencies) needed to run the application.

### Step 3: Set Up Environment Variables

Create a `.env` file in the `apps/portal` folder:

```bash
# Navigate to the portal folder
cd apps/portal

# Create .env file (on Mac/Linux)
touch .env

# Or create it manually using a text editor
```

Add the following content to `apps/portal/.env`:

```env
# Database Connection
DATABASE_URL="postgresql://hha:hha@localhost:5432/hha"

# NextAuth Secret (generate a random string)
NEXTAUTH_SECRET="your-random-secret-key-here-change-this"

# Signed URL Secret (for secure PDF downloads)
SIGNED_URL_SECRET="your-random-secret-key-here-change-this"

# Base URL (usually localhost for development)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**How to generate secrets**: You can use any random string generator, or run:
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use an online generator like: https://randomkeygen.com/
```

**Important**: Never share your `.env` file or commit it to version control!

### Step 4: Start Docker Services

Docker services provide the database and other tools needed by the application.

```bash
# Navigate to the docker folder
cd ../../infra/docker

# Start all services (PostgreSQL, n8n, Documenso, Metabase)
docker compose up -d
```

**What this does**: 
- Starts PostgreSQL database (stores all your data)
- Starts n8n (workflow automation tool)
- Starts Documenso (e-signature service)
- Starts Metabase (analytics dashboard)

**Verify services are running**:
```bash
# Check if all services are up
docker compose ps
```

You should see 4 services running:
- `hha-postgres` (PostgreSQL)
- `hha-n8n` (n8n)
- `hha-documenso` (Documenso)
- `hha-metabase` (Metabase)

**If services fail to start**: See [Troubleshooting](#troubleshooting) section below.

### Step 5: Set Up the Database

```bash
# Go back to project root
cd ../../

# Generate Prisma client (database toolkit)
pnpm --filter portal db:generate

# Create database tables
pnpm --filter portal db:push
```

**What this does**: 
- Creates all the database tables needed (patients, visits, employees, etc.)
- Sets up the database structure

### Step 6: Add Sample Data

```bash
# Seed the database with test data
pnpm seed
```

**What this does**: Adds sample data so you can test the application:
- 3 sample patients
- 2 employees
- 5 scheduled visits

### Step 7: Start the Application

```bash
# Start the Next.js portal
pnpm dev
```

**What this does**: Starts the web application on your computer.

You should see output like:
```
✓ Ready in 2.3s
○ Local:        http://localhost:3000
```

### Step 8: Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

You should see the Home Health Automation Portal homepage! 🎉

---

## ⚡ Quick Start

If you're already familiar with the setup, here's the quick version:

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env file in apps/portal/ (see Step 3 above)

# 3. Start Docker services
cd infra/docker && docker compose up -d && cd ../../

# 4. Set up database
pnpm --filter portal db:generate
pnpm --filter portal db:push

# 5. Seed database
pnpm seed

# 6. Start application
pnpm dev
```

Then open: **http://localhost:3000**

---

## 📖 Detailed Setup

### Understanding the Services

This application uses several services that work together:

1. **Portal** (Next.js App) - The main web application you interact with
2. **PostgreSQL** - Database that stores all your data
3. **n8n** - Workflow automation (handles automated tasks)
4. **Documenso** - E-signature service (for signing documents)
5. **Metabase** - Analytics and reporting dashboard

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string for PostgreSQL | `postgresql://hha:hha@localhost:5432/hha` |
| `NEXTAUTH_SECRET` | Secret key for authentication | Random string (32+ characters) |
| `SIGNED_URL_SECRET` | Secret for secure PDF downloads | Random string (32+ characters) |
| `NEXT_PUBLIC_BASE_URL` | Base URL of your application | `http://localhost:3000` |

### Database Connection String Format

```
postgresql://[username]:[password]@[host]:[port]/[database]
```

For Docker setup:
```
postgresql://hha:hha@localhost:5432/hha
```

---

## 🎮 Using the Application

### Main Features

#### 1. Upload a Referral

1. Go to: **http://localhost:3000/referrals/new**
2. Click **"Select PDF File"** and choose a referral PDF
3. Click **"Upload & Extract"**
4. Review the extracted patient information
5. Click **"View Admission Packet"** to proceed

**What happens**: The system uses OCR (Optical Character Recognition) to extract patient information from the PDF automatically.

#### 2. View Patients

1. Go to: **http://localhost:3000/patients**
2. See a list of all patients
3. Click **"View"** next to a patient to see their admission packet

#### 3. Send Admission for Signature

1. Go to a patient's admission page: **http://localhost:3000/patients/[patientId]/admission**
2. Review the admission packet
3. Click **"Send for Signature"**
4. The system will simulate sending it for e-signature
5. Click **"Refresh Status"** to see when it's completed
6. Click **"Download Signed PDF"** to get the signed document

#### 4. Manage Visit Schedule

1. Go to: **http://localhost:3000/admin/schedule**
2. See all scheduled visits
3. For each visit, you can:
   - **Push to EVV**: Send visit to Electronic Visit Verification system
   - **Simulate Clock In**: Simulate caregiver arriving at patient's home
   - **Simulate Clock Out**: Simulate caregiver leaving
   - **Validate**: Verify the visit meets EVV requirements

#### 5. View and Export Timesheets

1. Go to: **http://localhost:3000/admin/timesheets**
2. Select a week using the date picker
3. Review the timesheet preview
4. Click **"Export CSV"** to download payroll data

#### 6. Add Manual Timesheet Entry

1. Go to: **http://localhost:3000/admin/timesheets/manual**
2. Fill in the form:
   - Select an employee
   - Choose a date
   - Enter minutes worked
   - Select type (visit, travel, or admin)
3. Click **"Create Entry"**

---

## 🌐 Services & Ports

Here are all the services and how to access them:

| Service | URL | Default Credentials | Purpose |
|---------|-----|---------------------|---------|
| **Portal** | http://localhost:3000 | None (dev mode) | Main web application |
| **n8n** | http://localhost:5678 | admin / admin | Workflow automation |
| **Documenso** | http://localhost:3001 | Create account | E-signature service |
| **Metabase** | http://localhost:3002 | Create account | Analytics dashboard |
| **PostgreSQL** | localhost:5432 | hha / hha | Database |

### Accessing n8n

1. Go to: **http://localhost:5678**
2. First time: Create an admin account
   - Username: `admin`
   - Password: `admin` (change in production!)
3. Import workflows from `packages/workflows/` folder

### Accessing Metabase

1. Go to: **http://localhost:3002**
2. First time: Create an admin account
3. Connect to database:
   - Host: `postgres` (or `localhost:5432`)
   - Port: `5432`
   - Database: `hha`
   - Username: `hha`
   - Password: `hha`

---

## 📁 Project Structure

```
hha-mvp/
├── apps/
│   └── portal/              # Main Next.js application
│       ├── app/            # Pages and API routes
│       ├── components/     # React components
│       ├── lib/            # Utilities and helpers
│       └── prisma/         # Database schema
│
├── packages/
│   ├── domain/             # Data models and schemas
│   ├── adapters/           # External service integrations
│   ├── workflows/          # n8n workflow definitions
│   └── testing/            # Test utilities and seed data
│
├── infra/
│   └── docker/             # Docker Compose configuration
│
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

### Key Folders Explained

- **`apps/portal/`**: The main web application
- **`packages/domain/`**: Data models (Patient, Visit, Employee, etc.)
- **`packages/adapters/`**: Integrations with external services (OCR, EVV, etc.)
- **`infra/docker/`**: Docker configuration for services
- **`docs/`**: Documentation files

---

## 🌐 Deployment

**Want to deploy this application for FREE?** 

Yes! I recommend deploying using this **proven free stack**:

### 🎯 Recommended Free Stack

- ✅ **Vercel** - Next.js hosting (FREE, 100GB/month)
- ✅ **Supabase** - PostgreSQL + Storage (FREE, 500MB DB + 2GB storage)
- ✅ **Total Cost: $0/month** for small to medium usage

### ⚡ Quick Start (15 minutes)

**📖 [Quick Deployment Guide](docs/DEPLOYMENT_QUICKSTART.md)** - Step-by-step in 15 minutes!

**Or follow these steps:**

1. **Deploy Database** (5 min):
   - Sign up at https://supabase.com
   - Create project → Get connection string
   - Run: `pnpm --filter portal db:push`

2. **Deploy App** (5 min):
   - Sign up at https://vercel.com
   - Import GitHub repo
   - Set root directory: `apps/portal`
   - Add environment variables
   - Deploy!

3. **Done!** Your app is live at `https://your-app.vercel.app`

### 📚 Full Documentation

- **🚀 [Quick Start Guide](docs/DEPLOYMENT_QUICKSTART.md)** - Fastest way to deploy (15 min)
- **📖 [Complete Guide](docs/DEPLOYMENT.md)** - Detailed instructions with all options

### Why This Stack?

✅ **Easiest to set up** - Both services have excellent free tiers  
✅ **Perfect for Next.js** - Vercel is made by Next.js creators  
✅ **Includes storage** - Supabase provides database + file storage  
✅ **Automatic HTTPS** - SSL certificates included  
✅ **Auto deployments** - Deploy on every Git push  
✅ **Generous limits** - Enough for development and small production

---

## 🔧 Troubleshooting

### Problem: Docker services won't start

**Solution**:
```bash
# Check Docker is running
docker ps

# View logs
cd infra/docker
docker compose logs

# Restart services
docker compose restart

# If still failing, rebuild
docker compose up -d --build
```

### Problem: "Cannot connect to database"

**Check**:
1. Is PostgreSQL running? `docker compose ps`
2. Is `DATABASE_URL` correct in `.env`?
3. Try connecting manually:
   ```bash
   psql postgresql://hha:hha@localhost:5432/hha -c "SELECT 1"
   ```

**Solution**: Make sure Docker services are running and `DATABASE_URL` matches the Docker setup.

### Problem: "Port 3000 is already in use"

**Solution**:
```bash
# Find what's using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use a different port
# Edit package.json in apps/portal and change:
# "dev": "next dev -p 3001"
```

### Problem: "Module not found" errors

**Solution**:
```bash
# Clean install
rm -rf node_modules
pnpm install

# Regenerate Prisma client
pnpm --filter portal db:generate
```

### Problem: Extracted zip file has wrong folder structure

**Symptoms**: Can't find `apps/` or `packages/` folders, or `package.json` is missing.

**Solution**:
1. Make sure you extracted the **entire zip file**, not just individual files
2. Check that you're in the `hha-mvp` folder (the root folder)
3. You should see these folders:
   - `apps/`
   - `packages/`
   - `infra/`
   - `docs/`
   - `package.json` (file)
   - `pnpm-workspace.yaml` (file)

**If structure is wrong**:
- Re-extract the zip file
- Make sure you're extracting to a folder, not just opening the zip
- On Windows: Use "Extract All" instead of "Open"
- On Mac: Make sure the extracted folder contains all subfolders

### Problem: Application shows blank page

**Check**:
1. Open browser console (F12) for errors
2. Check terminal for build errors
3. Verify all services are running

**Solution**:
```bash
# Clear Next.js cache
rm -rf apps/portal/.next

# Restart application
pnpm dev
```

### Problem: Database schema errors

**Solution**:
```bash
# Reset database (WARNING: Deletes all data!)
pnpm --filter portal db:push --force-reset

# Re-seed data
pnpm seed
```

### Problem: n8n workflows not running

**Check**:
1. Are workflows **Active** in n8n?
2. Check execution history in n8n
3. View logs: `docker compose logs n8n`

**Solution**: Make sure workflows are activated and triggers are configured correctly.

---

## 🎯 Next Steps

Once you have the application running, you can:

1. **Explore the Features**: Try uploading a referral, creating a visit, and exporting payroll
2. **Set Up n8n Workflows**: Import workflows from `packages/workflows/` to automate tasks
3. **Configure Metabase**: Connect to the database and create dashboards
4. **Customize**: Modify the code to fit your specific needs
5. **Add Real Integrations**: Replace mock adapters with real services

### For Production

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Set up proper authentication (NextAuth providers)
- [ ] Configure real email service
- [ ] Set up SSL/HTTPS
- [ ] Configure production database
- [ ] Set up monitoring and logging
- [ ] Review security settings
- [ ] Set up backups

---

## 📚 Additional Resources

- **Runbook**: See `docs/runbook.md` for detailed operational guide
- **Deployment Guide**: See `docs/DEPLOYMENT.md` for **FREE deployment options** (Vercel, Supabase, etc.)
- **Workflows**: See `packages/workflows/README.md` for n8n workflow documentation
- **Analytics**: See `packages/analytics/metabase.md` for Metabase setup
- **API Documentation**: See `docs/api.md` (if available)

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**: `docker compose logs` for Docker services
2. **Check the terminal**: Look for error messages when running `pnpm dev`
3. **Check browser console**: Press F12 and look at the Console tab
4. **Review documentation**: Check `docs/` folder for more details
5. **Common issues**: See [Troubleshooting](#troubleshooting) section above

---

## 📝 Important Notes

⚠️ **Security Reminders**:
- Never commit `.env` files to version control
- Change all default passwords and secrets in production
- Use strong, unique secrets for `NEXTAUTH_SECRET` and `SIGNED_URL_SECRET`
- This is a development setup - not suitable for production without security hardening

💡 **Development Mode**:
- Authentication is bypassed in development mode
- Mock services are used for OCR, EVV, and e-signatures
- All data is stored locally (not in the cloud)

---

## ✅ Success Checklist

Use this checklist to verify your setup:

- [ ] Node.js and pnpm installed
- [ ] Docker Desktop installed and running
- [ ] Dependencies installed (`pnpm install`)
- [ ] `.env` file created with correct values
- [ ] Docker services running (`docker compose ps`)
- [ ] Database set up (`db:generate` and `db:push`)
- [ ] Sample data seeded (`pnpm seed`)
- [ ] Application running (`pnpm dev`)
- [ ] Portal accessible at http://localhost:3000
- [ ] Can upload a referral PDF
- [ ] Can view patients list
- [ ] Can access admin pages

---

**🎉 Congratulations!** You've successfully set up the Home Health Automation MVP!

If you have any questions or run into issues, refer to the [Troubleshooting](#troubleshooting) section or check the documentation in the `docs/` folder.

---

**Last Updated**: See git history for latest changes.

**Version**: 1.0.0

**License**: MIT
