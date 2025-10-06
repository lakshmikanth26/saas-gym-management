# 🚀 Deploy Edge Functions - Step by Step

## ⚠️ Why You're Seeing "Registration Failed"

Even though payment is successful, the **Edge Functions** that verify payment and create your gym aren't deployed yet. That's why it fails after payment.

---

## 📋 Quick Deploy Steps

### Step 1: Login to Supabase CLI

```bash
supabase login
```

This will open your browser - login with your Supabase account.

---

### Step 2: Link Your Project

```bash
cd /Volumes/Personal/saas-gym-management
supabase link --project-ref elffbjoqzvtpndtenzaz
```

When prompted for database password, check your Supabase dashboard → Project Settings → Database → Password

---

### Step 3: Deploy All Edge Functions

```bash
supabase functions deploy create-cashfree-order --no-verify-jwt
supabase functions deploy verify-cashfree-payment --no-verify-jwt  
supabase functions deploy get-cashfree-payment-status --no-verify-jwt
supabase functions deploy generate-invoice --no-verify-jwt
supabase functions deploy send-notification --no-verify-jwt
```

---

### Step 4: Set Secrets (Environment Variables for Edge Functions)

```bash
# Cashfree credentials
supabase secrets set CASHFREE_APP_ID="TEST430329ae80e0f32e41a393d78b923034"
supabase secrets set CASHFREE_SECRET_KEY="TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
supabase secrets set CASHFREE_API_URL="https://sandbox.cashfree.com/pg"

# Supabase credentials (from your .env.local)
supabase secrets set SUPABASE_URL="https://elffbjoqzvtpndtenzaz.supabase.co"
```

For `SUPABASE_SERVICE_ROLE_KEY`, go to:
- Supabase Dashboard → Project Settings → API → `service_role` key (secret)

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

---

## ✅ That's It!

After deploying, try the registration again. The payment will now successfully create your gym! 🎉

---

## 🔍 Verify Deployment

Check if functions are deployed:
```bash
supabase functions list
```

Check if secrets are set:
```bash
supabase secrets list
```

---

## 🆘 Need Help?

If you get errors, check:
1. **Database password** - Get it from Supabase Dashboard
2. **Service role key** - Must be the SECRET key, not anon key
3. **Project ref** - Should be `elffbjoqzvtpndtenzaz`

