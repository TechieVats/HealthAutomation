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
   - **Database Password**: ⚠️ **THIS IS THE PASSWORD YOU NEED!**
     - You will **create this password yourself** when creating the project
     - **Make it strong** (at least 12 characters, mix of letters, numbers)
     - **SAVE IT IMMEDIATELY** - Write it down or save it in a password manager
     - **Example**: `MySecurePass123!` or `HHA2024#Secure`
     - ⚠️ **You cannot see this password again** if you forget it (you'll need to reset it)
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup
   
   **💡 Tip**: Use a password manager or write it down - you'll need it in Step 3!

3. **Get connection string** (This is the tricky part!):
   
   **Step 3a: Find your connection string**
   - In Supabase dashboard, go to: **Settings** (gear icon) → **Database**
   - Scroll down to find "Connection string" section
   - You'll see several tabs: "URI", "JDBC", "Golang", etc.
   - Click on the **"URI"** tab
   - You'll see a connection string that looks like one of these:
     
     **Direct Connection** (port 5432) - Most common:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
     ```
     
     **OR Pooler Connection** (port 6543) - Alternative:
     ```
     postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
     ```
     
     **✅ Both work!** Use whichever one Supabase shows you. The Direct connection (port 5432) is perfectly fine!
   
   **Step 3b: Replace the password placeholder**
   - The connection string will have `[YOUR-PASSWORD]` as a placeholder
   - You need to replace `[YOUR-PASSWORD]` with the **actual password you set when creating the project**
   - **Where to find your password?**
     - If you saved it when creating the project → use that
     - If you forgot it → Go to **Settings** → **Database** → Click "Reset database password" (or check project settings)
   
   **Step 3c: URL-encode your password (if it has special characters)**
   - If your password contains special characters like `@`, `#`, `$`, `%`, etc., you need to URL-encode them
   - Example: If password is `MyP@ss#123`, it becomes `MyP%40ss%23123`
   - Or use an online tool: https://www.urlencoder.org/
   
   **Final connection string examples:**
   
   **Direct Connection format** (what you likely have):
   ```
   postgresql://postgres:MyPassword123@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
   
   **Pooler Connection format** (alternative):
   ```
   postgresql://postgres.xxxxxxxxxxxxx:MyPassword123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
   
   **⚠️ Important Notes:**
   - **Both formats work perfectly!** Use the one Supabase shows you
   - Direct connection (port 5432) is great for development
   - Pooler connection (port 6543) is better for production with many connections
   - Make sure there are **no spaces** in the connection string
   - **Remove the brackets** `[` and `]` when replacing `[YOUR-PASSWORD]`
   - The password goes **directly** in place of `[YOUR-PASSWORD]` (no brackets)

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

