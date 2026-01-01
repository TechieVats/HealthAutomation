# 🚀 Quick Deployment Guide - Step by Step

This is the **simplest and fastest** way to deploy your Home Health Automation MVP for **FREE**.

## 🎯 Recommended Approach

**Best Stack for Free Deployment:**
- ✅ **Vercel** - Next.js hosting (FREE)
- ✅ **Supabase** - PostgreSQL + Storage (FREE)
- ✅ **Railway** - Docker services (optional, $5 credit/month)

**Total Cost: $0/month** (for small to medium usage)

---

## ⚡ 15-Minute Deployment

### Step 1: Prepare Your Code (2 minutes)

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/hha-mvp.git
   git push -u origin main
   ```

   **Don't have GitHub?** Create account at: https://github.com

---

### Step 2: Deploy Database to Supabase (5 minutes)

1. **Sign up**: https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub (easiest)

2. **Create new project**:
   - Click "New Project"
   - Organization: Create new or use existing
   - Name: `hha-mvp`
   - Database Password: **Save this password!** (you'll need it)
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get connection string**:
   - Go to: **Settings** → **Database**
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy the connection string
   - It looks like: `postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - **Replace `[YOUR-PASSWORD]` with your actual password**

4. **Run database migrations**:
   ```bash
   # Set your database URL
   export DATABASE_URL="your-supabase-connection-string-here"
   
   # Or create a temporary .env file
   echo 'DATABASE_URL="your-supabase-connection-string-here"' > apps/portal/.env.temp
   
   # Generate Prisma client
   cd apps/portal
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   
   # Go back to root
   cd ../..
   ```

5. **Seed database** (optional, for testing):
   ```bash
   pnpm seed
   ```

✅ **Database is ready!**

---

### Step 3: Deploy to Vercel (5 minutes)

1. **Sign up**: https://vercel.com
   - Click "Sign Up"
   - Choose "Continue with GitHub" (recommended)

2. **Import project**:
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select your `hha-mvp` repository
   - Click "Import"

3. **Configure project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Click "Edit" → Set to: `apps/portal`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter portal build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `cd ../.. && pnpm install`

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add these variables one by one:

   ```
   DATABASE_URL
   Value: your-supabase-connection-string
   
   NEXTAUTH_SECRET
   Value: (generate with: openssl rand -base64 32)
   
   SIGNED_URL_SECRET
   Value: (generate with: openssl rand -base64 32)
   
   NEXT_PUBLIC_BASE_URL
   Value: https://your-app-name.vercel.app (you'll get this after first deploy)
   
   NEXTAUTH_URL
   Value: https://your-app-name.vercel.app (same as above)
   ```

   **To generate secrets** (run in terminal):
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate SIGNED_URL_SECRET (run again)
   openssl rand -base64 32
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-5 minutes for build
   - Your app will be live! 🎉

6. **Update URLs** (after first deploy):
   - Copy your app URL (e.g., `https://hha-mvp.vercel.app`)
   - Go to **Settings** → **Environment Variables**
   - Update `NEXT_PUBLIC_BASE_URL` and `NEXTAUTH_URL` with your actual URL
   - Redeploy (Vercel will auto-redeploy on next push)

✅ **Your app is live!**

---

### Step 4: Configure File Storage (3 minutes)

**Option A: Use Supabase Storage** (Recommended - already have account)

1. **Go to Supabase Dashboard**:
   - Open your project
   - Click "Storage" in left sidebar

2. **Create buckets**:
   - Click "New bucket"
   - Name: `referrals` → Create
   - Name: `esign` → Create (make it private)
   - Name: `payroll` → Create (make it private)

3. **Get API keys**:
   - Go to **Settings** → **API**
   - Copy "Project URL"
   - Copy "anon public" key (or "service_role" for server-side)

4. **Add to Vercel** (optional, for future enhancement):
   ```
   SUPABASE_URL
   Value: your-project-url
   
   SUPABASE_KEY
   Value: your-anon-key
   ```

**Note**: Currently the app uses local storage. For production, you'd need to update the code to use Supabase Storage API. This is optional for now.

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase account created
- [ ] Database created and migrations run
- [ ] Database seeded (optional)
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Root directory set to `apps/portal`
- [ ] Build command configured
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] URLs updated in environment variables
- [ ] App tested and working

---

## 🧪 Test Your Deployment

1. **Visit your app**: `https://your-app.vercel.app`
2. **Test features**:
   - Upload a referral PDF
   - View patients list
   - Check admin pages
   - Test file downloads

---

## 🔧 Troubleshooting

### Build Fails on Vercel

**Error**: "Cannot find module" or build errors

**Fix**:
1. Check Root Directory is set to `apps/portal`
2. Verify Build Command includes `pnpm install`
3. Check Vercel logs for specific errors

### Database Connection Fails

**Error**: "Can't reach database server"

**Fix**:
1. Verify `DATABASE_URL` is correct in Vercel
2. Check Supabase project is active
3. Test connection string locally first
4. Make sure password is URL-encoded in connection string

### Environment Variables Not Working

**Error**: Variables not found

**Fix**:
1. Make sure variables are added to **Production** environment
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

---

## 📊 What You Get

### Free Tier Limits:

| Service | Limit | Your Usage |
|---------|-------|------------|
| **Vercel** | 100GB bandwidth/month | ~10-20GB |
| **Supabase** | 500MB DB + 2GB storage | ~200-300MB |
| **Total Cost** | | **$0/month** |

### When to Upgrade:

- **High traffic**: >100GB/month → Vercel Pro ($20/month)
- **Large database**: >500MB → Supabase Pro ($25/month)
- **Heavy usage**: Consider paid tiers for reliability

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Free on Vercel):
   - Go to Vercel → Settings → Domains
   - Add your custom domain

2. **Set up monitoring**:
   - Vercel Analytics (included)
   - Supabase dashboard for database monitoring

3. **Configure backups**:
   - Supabase has automatic backups
   - Export data regularly for safety

4. **Update file storage** (optional):
   - Modify code to use Supabase Storage
   - Update upload/download endpoints

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Your App**: `https://your-app.vercel.app`

---

## 💡 Pro Tips

1. **Use GitHub for automatic deployments**:
   - Every push to `main` branch = auto deploy
   - Preview deployments for pull requests

2. **Monitor usage**:
   - Check Vercel dashboard for bandwidth
   - Check Supabase for database size

3. **Keep secrets safe**:
   - Never commit `.env` files
   - Use Vercel environment variables
   - Rotate secrets regularly

4. **Test locally first**:
   - Test with Supabase connection string locally
   - Verify everything works before deploying

---

**🎉 Congratulations! Your app is now live and accessible worldwide!**

For detailed information, see: [`DEPLOYMENT.md`](DEPLOYMENT.md)

---

**Need help?** Check the troubleshooting section or review the full deployment guide.

