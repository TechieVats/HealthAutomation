# 🚀 Free Deployment Guide

This guide shows you how to deploy the Home Health Automation MVP to free hosting services.

## 📋 Overview

You can deploy this application completely free using:
- **Vercel** (Next.js hosting) - Free tier
- **Supabase** or **Neon** (PostgreSQL database) - Free tier
- **Railway** or **Render** (Docker services) - Free tier
- **Cloudflare R2** or **Supabase Storage** (File storage) - Free tier

## 🎯 Recommended Free Stack

### Option 1: Fully Free (Recommended)

| Service | Purpose | Free Tier Limits |
|---------|---------|------------------|
| **Vercel** | Next.js app hosting | 100GB bandwidth/month, unlimited requests |
| **Supabase** | PostgreSQL database | 500MB database, 2GB bandwidth |
| **Supabase Storage** | File storage | 1GB storage, 2GB bandwidth |
| **Railway** | Docker services (n8n, Metabase) | $5 credit/month (enough for dev) |

### Option 2: Alternative Free Stack

| Service | Purpose | Free Tier Limits |
|---------|---------|------------------|
| **Vercel** | Next.js app hosting | 100GB bandwidth/month |
| **Neon** | PostgreSQL database | 0.5GB storage, unlimited projects |
| **Cloudflare R2** | File storage | 10GB storage, 1M operations/month |
| **Render** | Docker services | Free tier (with limitations) |

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Code

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/hha-mvp.git
   git push -u origin main
   ```

2. **Create `.env.production`** file (for reference):
   ```env
   DATABASE_URL="your-supabase-connection-string"
   NEXTAUTH_SECRET="generate-random-secret"
   SIGNED_URL_SECRET="generate-random-secret"
   NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
   NEXTAUTH_URL="https://your-app.vercel.app"
   ```

---

## 📦 Deploy Next.js App to Vercel (Free)

### Why Vercel?
- **Perfect for Next.js** - Made by the Next.js creators
- **Free tier** - Generous limits for small projects
- **Automatic deployments** - Deploys on every Git push
- **HTTPS included** - SSL certificates automatically

### Steps:

1. **Sign up for Vercel**:
   - Go to: https://vercel.com
   - Sign up with GitHub (recommended)

2. **Import your project**:
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select your `hha-mvp` repository

3. **Configure build settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/portal`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter portal build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `cd ../.. && pnpm install`

4. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add these variables:
     ```
     DATABASE_URL=your-supabase-url
     NEXTAUTH_SECRET=your-secret-here
     SIGNED_URL_SECRET=your-secret-here
     NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
     NEXTAUTH_URL=https://your-app.vercel.app
     ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your app will be live at: `https://your-app.vercel.app`

### Vercel Free Tier Limits:
- ✅ 100GB bandwidth/month
- ✅ Unlimited requests
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ⚠️ Serverless functions: 100GB-hours/month
- ⚠️ Build time: 45 minutes/month

---

## 🗄️ Deploy PostgreSQL Database (Free)

### Option A: Supabase (Recommended)

**Why Supabase?**
- Free PostgreSQL database
- Built-in authentication (can replace NextAuth)
- Free file storage included
- Easy to use dashboard

**Steps:**

1. **Sign up**: https://supabase.com
2. **Create a new project**:
   - Click "New Project"
   - Choose organization
   - Name: `hha-mvp`
   - Database password: (save this!)
   - Region: Choose closest to you
   - Wait 2-3 minutes for setup

3. **Get connection string**:
   - Go to Project Settings → Database
   - Copy "Connection string" → "URI"
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

4. **Run migrations**:
   ```bash
   # Set DATABASE_URL
   export DATABASE_URL="your-supabase-connection-string"
   
   # Generate Prisma client
   pnpm --filter portal db:generate
   
   # Push schema
   pnpm --filter portal db:push
   ```

5. **Seed database** (optional):
   ```bash
   pnpm seed
   ```

**Supabase Free Tier:**
- ✅ 500MB database storage
- ✅ 2GB bandwidth
- ✅ 2GB file storage
- ✅ 50,000 monthly active users
- ⚠️ 2 projects max

### Option B: Neon (Alternative)

**Why Neon?**
- Serverless PostgreSQL
- Generous free tier
- Easy setup

**Steps:**

1. **Sign up**: https://neon.tech
2. **Create project**:
   - Click "Create Project"
   - Name: `hha-mvp`
   - Region: Choose closest
   - PostgreSQL version: 15 (recommended)

3. **Get connection string**:
   - Copy connection string from dashboard
   - Format: `postgresql://user:password@ep-xxx.region.neon.tech/dbname`

4. **Run migrations** (same as Supabase above)

**Neon Free Tier:**
- ✅ 0.5GB storage
- ✅ Unlimited projects
- ✅ Automatic backups
- ⚠️ Compute time limits (usually enough for small apps)

---

## 📁 File Storage (Free)

### Option A: Supabase Storage

**If using Supabase for database, use their storage too:**

1. **Enable Storage**:
   - Go to Storage in Supabase dashboard
   - Create buckets:
     - `referrals` (public or private)
     - `esign` (private)
     - `payroll` (private)

2. **Update code** (future enhancement):
   - Replace local file storage with Supabase Storage API
   - Use Supabase client to upload/download files

### Option B: Cloudflare R2

**Why R2?**
- 10GB free storage
- No egress fees
- S3-compatible API

**Steps:**

1. **Sign up**: https://cloudflare.com (free account)
2. **Enable R2**:
   - Go to R2 in dashboard
   - Create buckets
3. **Update code** to use R2 API (similar to S3)

**Cloudflare R2 Free Tier:**
- ✅ 10GB storage
- ✅ 1M Class A operations/month
- ✅ 10M Class B operations/month
- ✅ No egress fees

---

## 🐳 Deploy Docker Services (Optional)

### Option A: Railway (Recommended)

**Why Railway?**
- $5 free credit/month
- Easy Docker deployment
- Good for n8n and Metabase

**Steps:**

1. **Sign up**: https://railway.app (with GitHub)
2. **Deploy n8n**:
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose "Dockerfile" or use `n8nio/n8n:latest`
   - Add environment variables:
     ```
     DB_TYPE=postgresdb
     DB_POSTGRESDB_HOST=your-db-host
     DB_POSTGRESDB_DATABASE=your-db-name
     DB_POSTGRESDB_USER=your-db-user
     DB_POSTGRESDB_PASSWORD=your-db-password
     ```

3. **Deploy Metabase** (similar process)

**Railway Free Tier:**
- ✅ $5 credit/month
- ✅ 500 hours compute time
- ⚠️ Credit expires monthly

### Option B: Render

**Why Render?**
- Free tier available
- Good for Docker services

**Steps:**

1. **Sign up**: https://render.com
2. **Create Web Service**:
   - Connect GitHub repo
   - Use Docker
   - Select free tier

**Render Free Tier:**
- ✅ Free tier available
- ⚠️ Services spin down after 15 min inactivity
- ⚠️ Limited resources

---

## 🔧 Configuration Updates

### Update Environment Variables

After deploying, update these in Vercel:

```env
# Database (from Supabase/Neon)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Secrets (generate new ones!)
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
SIGNED_URL_SECRET="generate-with: openssl rand -base64 32"

# URLs
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
NEXTAUTH_URL="https://your-app.vercel.app"

# Optional: File storage
SUPABASE_URL="your-supabase-url"
SUPABASE_KEY="your-supabase-key"
```

### Update Code for Cloud Storage

Currently, the app uses local file storage. For production, you'll need to:

1. **Update file upload endpoints** to use cloud storage
2. **Update file download endpoints** to use cloud storage URLs
3. **Update signed URL generation** if needed

**Example locations to update:**
- `apps/portal/app/api/referrals/upload/route.ts`
- `apps/portal/app/api/files/download/route.ts`
- `apps/portal/lib/security/signed-url.ts`

---

## 🎯 Complete Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Next.js app deployed to Vercel
- [ ] Supabase/Neon account created
- [ ] PostgreSQL database created
- [ ] Database migrations run (`db:push`)
- [ ] Database seeded (optional)
- [ ] Environment variables set in Vercel
- [ ] File storage configured (Supabase/Cloudflare R2)
- [ ] Docker services deployed (Railway/Render) - Optional
- [ ] Test the deployed application
- [ ] Update `NEXT_PUBLIC_BASE_URL` in Vercel
- [ ] Test file uploads/downloads
- [ ] Test authentication
- [ ] Monitor usage (stay within free tier limits)

---

## 💰 Cost Breakdown (Free Tier)

### Monthly Costs: $0

| Service | Free Tier | Your Usage | Cost |
|---------|----------|------------|------|
| Vercel | 100GB bandwidth | ~10GB | $0 |
| Supabase | 500MB DB + 2GB storage | ~200MB | $0 |
| Railway | $5 credit | ~$2-3 | $0 |
| **Total** | | | **$0/month** |

### When You Might Need to Pay:

- **High traffic**: >100GB bandwidth/month → Vercel Pro ($20/month)
- **Large database**: >500MB → Supabase Pro ($25/month)
- **Heavy Docker usage**: >$5 credit → Railway Pro ($5-20/month)

---

## 🚨 Important Notes

### Free Tier Limitations:

1. **Vercel**:
   - Functions timeout after 10 seconds (free tier)
   - 100GB bandwidth limit
   - Build time limits

2. **Supabase**:
   - 500MB database limit
   - 2GB file storage
   - API rate limits

3. **Railway**:
   - $5 credit/month (resets monthly)
   - Services may pause if credit runs out

### Production Considerations:

⚠️ **For production use, consider:**
- Upgrading to paid tiers for reliability
- Setting up monitoring and alerts
- Regular backups
- Custom domain (free on Vercel)
- SSL certificates (automatic on Vercel)

### Security:

- ✅ Change all default secrets
- ✅ Use strong database passwords
- ✅ Enable 2FA on all accounts
- ✅ Review environment variables regularly
- ✅ Set up proper CORS policies

---

## 🔗 Quick Links

- **Vercel**: https://vercel.com
- **Supabase**: https://supabase.com
- **Neon**: https://neon.tech
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Cloudflare R2**: https://developers.cloudflare.com/r2

---

## 🆘 Troubleshooting

### Build Fails on Vercel

**Problem**: Build errors during deployment

**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure `package.json` has correct scripts
3. Verify all dependencies are in `package.json`
4. Check Node.js version (should be 18+)

### Database Connection Fails

**Problem**: Can't connect to Supabase/Neon

**Solutions**:
1. Verify connection string format
2. Check database is running (Supabase/Neon dashboard)
3. Verify IP allowlist (if enabled)
4. Test connection locally first

### File Uploads Not Working

**Problem**: Files not saving

**Solutions**:
1. Check file storage is configured
2. Verify storage bucket exists
3. Check permissions/API keys
4. Review storage limits

---

## 📚 Next Steps

1. **Deploy to Vercel** (easiest first step)
2. **Set up Supabase database**
3. **Test locally with cloud database**
4. **Deploy and test**
5. **Add file storage** (if needed)
6. **Deploy Docker services** (optional)

---

**🎉 You can deploy this entire application for FREE!**

The free tiers are generous enough for development, testing, and small production deployments.

---

**Last Updated**: See git history for latest changes.

