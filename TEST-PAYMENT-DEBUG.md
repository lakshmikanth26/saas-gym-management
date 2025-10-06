# 🔍 Payment Debug Guide

## What I've Added

I've added detailed console logging to help us see exactly what's failing.

---

## 🧪 Test Steps

1. **Open Browser Console** (F12 or Right-click → Inspect → Console)

2. **Clear Console** (click the 🚫 icon)

3. **Fill registration form and proceed to payment**

4. **Complete payment with test card:**
   - Card: `4111 1111 1111 1111`
   - Expiry: `12/25`
   - CVV: `123`

5. **Watch Console Output** - Look for these logs:
   ```
   Payment successful: {...}
   Verifying payment with: {...}
   Verification response: {...}
   ```

---

## 🔍 What to Check

### If you see "Supabase function error":
- The Edge Function is returning an error
- Look at the error message - it will tell us what's wrong

### If you see "No response from verification function":
- The function might be crashing
- Check Supabase Dashboard → Edge Functions → Logs

### If you see "Verification failed":
- Payment verification with Cashfree failed
- The `order_id` or `payment_id` might be incorrect

---

## 📋 Send Me This Info

After testing, send me:

1. **Console logs** - Copy everything from console
2. **Error message** - The exact error shown on screen
3. **Payment details** - Did the payment show success in Cashfree?

---

## 🔗 Check Supabase Logs

Go to: **Supabase Dashboard → Edge Functions → verify-cashfree-payment → Logs**

This will show the server-side error if the function is crashing.

---

## ⚡ Quick Fix Checklist

✅ Functions deployed - **YES** (we verified this)  
✅ Secrets set - **YES** (we verified this)  
❓ Database schema created - **Check this!**  
❓ RLS policies set - **Check this!**

### Check Database Schema

Go to: **Supabase Dashboard → SQL Editor**

Run this to check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('gyms', 'gym_members', 'membership_plans');
```

Should return 3 rows. If not, run the schema.sql file!

