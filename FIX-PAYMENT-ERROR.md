# 🔧 Fix Payment Error

## Why Payment is Failing

The error "Payment failed. Please try again." happens because the **Supabase Edge Functions** aren't deployed yet. These functions handle:
- Creating Cashfree payment orders
- Verifying payments
- Creating gym accounts after successful payment

## ✅ Solution: Deploy Edge Functions (5 minutes)

### Quick Fix

```bash
# Run the automated deployment script
./deploy-functions.sh
```

This will:
1. ✅ Login to Supabase
2. ✅ Link your project
3. ✅ Deploy 5 Edge Functions
4. ✅ Set Cashfree credentials
5. ✅ Configure secrets

### Manual Steps (If Script Fails)

#### 1. Login to Supabase CLI

```bash
supabase login
```

#### 2. Link Your Project

```bash
# Get project ref from: https://app.supabase.com
# Settings → General → Reference ID

supabase link --project-ref your-project-ref-here
```

#### 3. Deploy Functions

```bash
supabase functions deploy create-cashfree-order
supabase functions deploy verify-cashfree-payment
supabase functions deploy get-cashfree-payment-status
supabase functions deploy generate-invoice
supabase functions deploy send-notification
```

#### 4. Set Secrets

```bash
# Cashfree credentials (already configured for you)
supabase secrets set CASHFREE_APP_ID="TEST430329ae80e0f32e41a393d78b923034"
supabase secrets set CASHFREE_SECRET_KEY="TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
supabase secrets set CASHFREE_API_URL="https://sandbox.cashfree.com/pg"

# Your Supabase credentials
supabase secrets set SUPABASE_URL="https://your-project.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Where to find these:**
- SUPABASE_URL: Dashboard → Settings → API → Project URL
- SERVICE_ROLE_KEY: Dashboard → Settings → API → service_role (secret)

## 🧪 Test Payment After Deployment

1. Go to: `http://localhost:5173`
2. Click **"Get Started"**
3. Fill in gym details:
   - Name: Test Gym
   - Email: test@gym.com
   - Phone: 9876543210
4. Click **"Proceed to Payment - ₹2,999"**
5. Cashfree checkout should open
6. Use test card: `4111 1111 1111 1111`
7. Complete payment
8. Should redirect to dashboard ✅

## 🎯 Alternative: Manual Client Setup

If you don't want to deploy functions right now, use the Python script to manually set up clients:

```bash
# Set environment variables
export SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Run setup script
python3 setup_client.py
```

This lets you:
- Collect payment separately (via Cashfree dashboard)
- Manually create gym accounts
- Share credentials with clients

**Workflow:**
1. Client pays through Cashfree link
2. You receive payment confirmation
3. Run `python3 setup_client.py`
4. Enter client details
5. Share login credentials

## 📊 Verify Deployment

After deploying functions:

```bash
# Check function status
supabase functions list

# View function logs
supabase functions logs create-cashfree-order
```

Or in Supabase Dashboard:
1. Go to **Edge Functions**
2. You should see 5 deployed functions
3. Check **Secrets** tab for configured variables

## 🐛 Troubleshooting

### "Function not found" error
→ Functions not deployed. Run `./deploy-functions.sh`

### "Invalid credentials" error
→ Check secrets are set correctly: `supabase secrets list`

### Payment succeeds but gym not created
→ Check Edge Function logs: `supabase functions logs verify-cashfree-payment`

### Timeout error
→ Edge Functions might be cold starting. Wait 30 seconds and try again.

## 🎉 Success Indicators

When everything works:

1. ✅ Cashfree checkout opens
2. ✅ Test payment completes
3. ✅ Redirects to `/{slug}/admin/dashboard`
4. ✅ Can login with credentials
5. ✅ Dashboard loads with data
6. ✅ 4 membership plans created

## 📚 Additional Help

- **Deployment Guide**: `DEPLOYMENT.md`
- **Cashfree Integration**: `CASHFREE-INTEGRATION.md`
- **Manual Setup**: `CLIENT-SETUP-GUIDE.md`
- **Quick Start**: `QUICKSTART.md`

---

## ⚡ Quick Command Reference

```bash
# Deploy everything (recommended)
./deploy-functions.sh

# Or deploy individually
supabase login
supabase link --project-ref YOUR_REF
supabase functions deploy create-cashfree-order
supabase functions deploy verify-cashfree-payment
supabase functions deploy get-cashfree-payment-status
supabase functions deploy generate-invoice
supabase functions deploy send-notification

# Set secrets
supabase secrets set CASHFREE_APP_ID="TEST430329ae80e0f32e41a393d78b923034"
supabase secrets set CASHFREE_SECRET_KEY="TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
supabase secrets set CASHFREE_API_URL="https://sandbox.cashfree.com/pg"
supabase secrets set SUPABASE_URL="YOUR_URL"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_KEY"

# Verify
supabase functions list
supabase secrets list
```

---

**Run `./deploy-functions.sh` now to fix the payment error!** 🚀

