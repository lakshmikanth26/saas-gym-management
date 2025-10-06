# ⚡ Quick Start Guide

Get your Gym Management SaaS up and running in 15 minutes!

## 🎯 Prerequisites

Before you start, make sure you have:
- ✅ Node.js 18+ installed ([download](https://nodejs.org))
- ✅ A code editor (VS Code recommended)
- ✅ Git installed
- ✅ A Supabase account (free tier works!)
- ✅ A Razorpay account (test mode is fine)

## 🚀 5-Minute Setup

### Step 1: Clone and Install (2 minutes)

```bash
# Navigate to your project directory
cd saas-gym-management

# Install dependencies
npm install
```

### Step 2: Set Up Supabase (3 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in details and create

2. **Deploy Database Schema**
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Copy entire contents of `supabase/schema.sql`
   - Paste and click "Run"
   - Wait for success message

3. **Get API Keys**
   - Go to Project Settings → API
   - Copy "Project URL"
   - Copy "anon public" key

### Step 3: Configure Environment (1 minute)

Create `.env` file in root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxx
VITE_APP_URL=http://localhost:5173
```

For Razorpay test key:
- Sign up at [razorpay.com](https://razorpay.com)
- Go to Settings → API Keys
- Generate Test Keys
- Copy Key ID

### Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Visit: `http://localhost:5173` 🎉

## 🧪 Test Your Setup

### Test 1: View Landing Page

1. Open `http://localhost:5173`
2. You should see the landing page with pricing
3. ✅ If you see it, frontend is working!

### Test 2: Try Registration (Without Payment)

1. Click "Get Started"
2. Fill in gym details
3. Note: Payment will fail without Edge Functions (we'll set these up later)
4. ✅ Form should work and validate

### Test 3: Check Database

1. Go to Supabase Dashboard → Table Editor
2. You should see all tables:
   - gyms
   - members
   - trainers
   - attendance
   - payments
   - etc.
3. ✅ If tables exist, database is ready!

## 📦 Deploy Edge Functions (Optional for Local Dev)

For full payment functionality, deploy Edge Functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
cd supabase/functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy generate-invoice
supabase functions deploy send-notification

# Set secrets
supabase secrets set RAZORPAY_KEY_ID="rzp_test_xxxxx"
supabase secrets set RAZORPAY_KEY_SECRET="your_secret"
supabase secrets set SUPABASE_URL="https://xxxxx.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_key"
```

## 🎨 Customize Your App

### 1. Update Branding

Edit `src/pages/LandingPage.jsx`:
```javascript
// Change app name
<span className="text-2xl font-bold">Your Gym Name</span>

// Update pricing
const pricingPlans = [
  { name: 'Monthly', price: 2999 }, // Change prices
  // ...
]
```

### 2. Modify Theme Colors

Edit `src/index.css`:
```css
:root {
  --primary: 262.1 83.3% 57.8%;  /* Change primary color */
  /* Adjust other colors */
}
```

### 3. Add Your Logo

Replace logo in components:
```javascript
// In layouts and pages
<img src="/your-logo.png" alt="Logo" />
```

## 🧪 Create Test Data

### Manual Test Gym

1. **Option 1: Via Registration Flow**
   - Use registration page
   - Use test Razorpay cards (after Edge Functions are set up)
   - Test card: `4111 1111 1111 1111`

2. **Option 2: Directly in Database**
   ```sql
   -- In Supabase SQL Editor
   
   -- 1. Create test gym
   INSERT INTO gyms (name, slug, email, phone, plan_type, plan_start, plan_end)
   VALUES (
     'Test Fitness Center',
     'test-gym',
     'admin@testgym.com',
     '9876543210',
     'monthly',
     NOW(),
     NOW() + INTERVAL '30 days'
   );
   
   -- 2. Create admin user (do this in Supabase Dashboard → Authentication → Add User)
   -- Email: admin@testgym.com
   -- Password: test123456
   
   -- 3. Link user to gym (replace user_id with actual UUID from step 2)
   INSERT INTO gym_members (user_id, gym_id, role)
   VALUES (
     'user_uuid_from_auth',
     (SELECT id FROM gyms WHERE slug = 'test-gym'),
     'admin'
   );
   ```

### Create Test Member

```sql
-- In SQL Editor
INSERT INTO members (
  gym_id,
  full_name,
  email,
  phone,
  membership_status
)
VALUES (
  (SELECT id FROM gyms WHERE slug = 'test-gym'),
  'John Doe',
  'john@example.com',
  '9876543211',
  'active'
);
```

## 🔍 Common Issues & Fixes

### Issue 1: Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Issue 2: Supabase Connection Error

- ✅ Check `.env` file exists and has correct values
- ✅ Restart dev server after changing `.env`
- ✅ Verify Supabase URL and anon key are correct

### Issue 3: Login Not Working

- ✅ Make sure you created the user in Supabase Dashboard → Authentication
- ✅ Check if `gym_members` table has the user-gym mapping
- ✅ Verify email is confirmed (or disable email confirmation in Supabase settings)

### Issue 4: RLS Policies Blocking Access

Temporarily disable RLS for testing:
```sql
-- In Supabase SQL Editor
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Re-enable when done testing
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
```

## 📱 Test Different User Flows

### Flow 1: Admin Login & Dashboard

```bash
# 1. Visit: http://localhost:5173/test-gym/login
# 2. Login with admin credentials
# 3. Should redirect to: http://localhost:5173/test-gym/admin/dashboard
# 4. Explore different admin pages
```

### Flow 2: Member Portal

```bash
# First create a member account in Supabase Auth
# Then:
# 1. Visit: http://localhost:5173/test-gym/login
# 2. Login with member credentials
# 3. Should redirect to customer dashboard
```

### Flow 3: Multi-Tenant Testing

```bash
# Create two gyms:
# - test-gym-1
# - test-gym-2

# Test isolation:
# 1. Login to test-gym-1
# 2. Create a member
# 3. Login to test-gym-2
# 4. Verify you can't see test-gym-1's members
```

## 🎓 Next Steps

Now that you're set up, check out:

1. **📖 [README.md](./README.md)** - Full feature documentation
2. **🚀 [DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to production
3. **🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical deep dive

## 🎯 Development Workflow

```bash
# Daily workflow
git pull origin main          # Get latest changes
npm install                   # Update dependencies if needed
npm run dev                   # Start development

# Before committing
npm run build                 # Test production build
git add .                     # Stage changes
git commit -m "Description"   # Commit
git push origin main          # Push (triggers auto-deploy if connected to Vercel)
```

## 🆘 Getting Help

Stuck? Here's how to get help:

1. **Check Error Message**
   - Read the error carefully
   - Look for line numbers in your code

2. **Browser Console**
   - Press F12 to open DevTools
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Supabase Logs**
   - Dashboard → Logs
   - Check for RLS policy violations
   - Look for function errors

4. **Common Solutions**
   - Restart dev server
   - Clear browser cache
   - Delete `node_modules` and reinstall
   - Check environment variables

## 🎊 You're Ready!

Congratulations! Your gym management platform is running locally. Now you can:

- ✅ Customize the UI
- ✅ Add new features
- ✅ Test workflows
- ✅ Deploy to production

**Happy coding! 🚀**

---

💡 **Pro Tip**: Start with small changes, test frequently, and commit often!

