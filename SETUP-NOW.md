# 🚀 Quick Setup Guide - Get Running in 10 Minutes

## Current Status

✅ **Cashfree Integration** - Complete and configured
⚠️ **Supabase** - Needs setup (required for app to work)

---

## Why the App Isn't Loading Yet

The app needs **Supabase** for:
- Database (storing gyms, members, etc.)
- Authentication (login/signup)
- Backend functions (payment verification)

Without Supabase credentials, the app can't connect to the database.

---

## ⚡ Quick Setup (10 minutes)

### Step 1: Create Supabase Project (3 minutes)

1. Go to https://supabase.com
2. Click **"Start your project"** (or "New Project")
3. Sign in with GitHub/Google
4. Click **"New Project"**
5. Fill in:
   - **Name**: gym-management
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
6. Click **"Create new project"**
7. Wait ~2 minutes for project to initialize

### Step 2: Get Your Credentials (1 minute)

1. In your Supabase project, click **"Project Settings"** (gear icon)
2. Click **"API"** in the sidebar
3. You'll see:
   - **Project URL** - Copy this
   - **anon public key** - Copy this

### Step 3: Update .env.local (1 minute)

Open `.env.local` file and update:

```env
# Replace these two lines:
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder-key

# With your actual credentials:
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Keep Cashfree as is (already configured):
VITE_CASHFREE_APP_ID=TEST430329ae80e0f32e41a393d78b923034
VITE_CASHFREE_ENV=sandbox
VITE_APP_URL=http://localhost:5173
```

### Step 4: Create Database Tables (3 minutes)

1. In Supabase Dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase/schema.sql` in your project
4. **Copy ALL the contents** (it's ~780 lines)
5. **Paste** into the SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. Wait for success message

### Step 5: Restart Dev Server (1 minute)

```bash
# Stop current server (Ctrl+C if running)
# Then run:
npm run dev
```

Visit: http://localhost:5173

---

## ✅ Verification

After setup, you should see:
- ✅ Landing page loads
- ✅ No console errors about Supabase
- ✅ "Get Started" button works
- ✅ Registration form loads
- ✅ Slug shows "Available!" ✓

---

## 🎯 What Works Now vs After Supabase

### Without Supabase ❌
- Landing page loads
- UI shows but can't interact
- Forms don't submit
- Slug always shows "Not available"

### With Supabase ✅
- **Everything works!**
- Registration with payment
- Admin dashboard
- Member management
- All features functional

---

## 🐛 Troubleshooting

### "Invalid API key" error
→ Check you copied the **anon public** key, not the service role key

### SQL execution failed
→ Make sure you copied the ENTIRE schema.sql file

### Tables not showing
→ Go to Table Editor in Supabase to verify tables were created

### Port 5173 already in use
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9
# Then restart
npm run dev
```

---

## 📋 Your Credentials Checklist

Before proceeding, make sure you have:

- [ ] Supabase Project URL (starts with `https://`)
- [ ] Supabase anon public key (long string starting with `eyJ`)
- [ ] Updated `.env.local` file
- [ ] Database tables created (15 tables should exist)
- [ ] Dev server restarted

---

## 🎉 After Setup

Once Supabase is configured:

1. **Test Registration:**
   - Click "Get Started"
   - Fill in gym details (slug will show "Available!")
   - Select a plan
   - Click "Proceed to Payment"
   - Use Cashfree test card: `4111 1111 1111 1111`
   - Complete payment
   - Get redirected to dashboard!

2. **Deploy Edge Functions** (Later):
   ```bash
   supabase functions deploy create-cashfree-order
   supabase functions deploy verify-cashfree-payment
   supabase functions deploy get-cashfree-payment-status
   supabase functions deploy generate-invoice
   supabase functions deploy send-notification
   ```

3. **Set Edge Function Secrets:**
   ```bash
   supabase secrets set CASHFREE_APP_ID="TEST430329ae80e0f32e41a393d78b923034"
   supabase secrets set CASHFREE_SECRET_KEY="TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
   supabase secrets set CASHFREE_API_URL="https://sandbox.cashfree.com/pg"
   supabase secrets set SUPABASE_URL="your_supabase_url"
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   ```

---

## 🚀 You're Almost There!

**Current Progress:**
- ✅ Project structure created
- ✅ Code complete
- ✅ Cashfree integrated
- ⏳ Supabase setup (10 minutes away!)

**After Supabase setup:**
- ✅ Full app functionality
- ✅ Can test all features
- ✅ Ready to deploy

---

## 💡 Pro Tip

Save your Supabase credentials somewhere safe:
- Project URL
- anon public key
- Database password
- Service role key (from API settings)

You'll need them for deployment too!

---

**Let's get Supabase set up and see your app come to life! 🎊**

Need help? Check:
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [QUICKSTART.md](./QUICKSTART.md) in this project

