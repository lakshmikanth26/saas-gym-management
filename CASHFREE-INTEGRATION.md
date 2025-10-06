# 💳 Cashfree Payment Integration Guide

Complete guide for Cashfree payment gateway integration in your Gym Management SaaS.

## ✅ Integration Complete!

Razorpay has been replaced with **Cashfree Inline Checkout**. Here's what was updated:

### Files Modified/Created

1. **package.json** - Added Cashfree SDK
2. **index.html** - Added Cashfree script
3. **src/lib/cashfree.js** - NEW: Cashfree utility library
4. **src/pages/RegisterGym.jsx** - Updated to use Cashfree
5. **supabase/functions/create-cashfree-order/** - NEW: Create order function
6. **supabase/functions/verify-cashfree-payment/** - NEW: Verify payment function
7. **supabase/functions/get-cashfree-payment-status/** - NEW: Get payment status
8. **supabase/schema.sql** - Updated to use cashfree fields
9. **env.example** - Updated with Cashfree config

---

## 📦 Your Cashfree Credentials

```env
App ID: TEST430329ae80e0f32e41a393d78b923034
Secret Key: TESTaf195616268bd6202eeb3bf8dc458956e7192a85
API URL: https://sandbox.cashfree.com/pg
Environment: sandbox
```

✅ Already configured in `.env.local`!

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase Edge Function Secrets

Deploy the Edge Functions and set secrets:

```bash
# Deploy functions
supabase functions deploy create-cashfree-order
supabase functions deploy verify-cashfree-payment  
supabase functions deploy get-cashfree-payment-status

# Set secrets
supabase secrets set CASHFREE_APP_ID="TEST430329ae80e0f32e41a393d78b923034"
supabase secrets set CASHFREE_SECRET_KEY="TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
supabase secrets set CASHFREE_API_URL="https://sandbox.cashfree.com/pg"
supabase secrets set SUPABASE_URL="your_supabase_url"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### 3. Update Database Schema

Run the updated schema in Supabase SQL Editor:
- Go to Supabase Dashboard → SQL Editor
- Copy contents from `supabase/schema.sql`
- Execute

The schema now uses:
- `cashfree_payment_id` instead of `razorpay_payment_id`
- `cashfree_order_id` instead of `razorpay_order_id`

### 4. Start Development Server

```bash
npm run dev
```

---

## 🎯 How It Works

### Payment Flow

```
1. User fills registration form
         ↓
2. Frontend calls createCashfreeOrder() 
         ↓
3. Edge Function creates order with Cashfree API
         ↓
4. Returns payment_session_id
         ↓
5. Frontend opens Cashfree checkout with session ID
         ↓
6. User completes payment
         ↓
7. Cashfree sends payment response
         ↓
8. Frontend calls verifyPaymentAndCreateGym()
         ↓
9. Edge Function verifies payment with Cashfree
         ↓
10. Creates gym, admin user, and default plans
         ↓
11. Redirects to admin dashboard
```

---

## 📝 Code Usage Examples

### Frontend: Process Payment

```javascript
import { openCashfreeModal } from '@/lib/cashfree'

// Open payment modal
await openCashfreeModal({
  amount: 2999,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '9876543210',
  notes: {
    gym_name: 'Test Gym',
    plan_type: 'monthly',
  },
  onSuccess: (paymentData) => {
    console.log('Payment successful:', paymentData)
    // paymentData contains: order_id, payment_id, payment_status, payment_amount
  },
  onFailure: (error) => {
    console.error('Payment failed:', error)
  },
})
```

### Backend: Verify Payment

```javascript
// Edge Function automatically verifies with Cashfree API
const response = await fetch(`${CASHFREE_API_URL}/orders/${order_id}/payments/${payment_id}`, {
  headers: {
    'x-client-id': CASHFREE_APP_ID,
    'x-client-secret': CASHFREE_SECRET_KEY,
    'x-api-version': '2023-08-01',
  },
})
```

---

## 🧪 Testing

### Test with Sandbox Credentials

Your sandbox credentials are already configured. Test payments will work without real money.

#### Test Cards

Cashfree Sandbox Test Cards:

**Success Scenarios:**
```
Card Number: 4111111111111111
CVV: 123
Expiry: Any future date
```

**UPI Test:**
```
UPI ID: success@cashfree
```

**Net Banking:**
Select any bank and use:
```
User ID: test
Password: test
```

---

## 📚 API Reference

### Create Order

**Endpoint**: `supabase/functions/create-cashfree-order`

**Request:**
```json
{
  "order_amount": 2999,
  "order_currency": "INR",
  "customer_details": {
    "customer_id": "CUST_123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "9876543210"
  },
  "order_meta": {
    "return_url": "https://yourdomain.com/payment/callback"
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "order_id": "order_1234567890",
    "payment_session_id": "session_abc123",
    "order_status": "ACTIVE"
  }
}
```

### Verify Payment

**Endpoint**: `supabase/functions/verify-cashfree-payment`

**Request:**
```json
{
  "order_id": "order_1234567890",
  "payment_id": "payment_abc123",
  "gym_data": {
    "name": "Test Gym",
    "slug": "test-gym",
    "email": "admin@testgym.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "admin_name": "John Doe",
    "password": "securepassword"
  },
  "plan_type": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "gym": { ... },
  "user": { ... },
  "message": "Gym registered successfully"
}
```

---

## 🔒 Security Best Practices

1. **Never expose secret key** on frontend
2. **Always verify payments** on server-side
3. **Use HTTPS** in production
4. **Validate webhook signatures** (when implementing webhooks)
5. **Store payment data** securely in database

---

## 🌐 Going Live (Production)

### 1. Get Production Credentials

1. Complete KYC on Cashfree
2. Get approved for live mode
3. Generate live credentials from [Cashfree Dashboard](https://merchant.cashfree.com/)

### 2. Update Environment Variables

**Frontend (.env.local):**
```env
VITE_CASHFREE_APP_ID=your_live_app_id
VITE_CASHFREE_ENV=production
```

**Edge Functions (Supabase secrets):**
```bash
supabase secrets set CASHFREE_APP_ID="your_live_app_id"
supabase secrets set CASHFREE_SECRET_KEY="your_live_secret_key"
supabase secrets set CASHFREE_API_URL="https://api.cashfree.com/pg"
```

### 3. Test Production

- Test with real payment methods
- Verify money reaches your account
- Check payment confirmation emails
- Test refund process

---

## 🔧 Troubleshooting

### Payment Modal Not Opening

**Check:**
1. Cashfree SDK loaded: `console.log(window.Cashfree)`
2. Environment variables set correctly
3. Edge Function deployed
4. Network tab for API errors

### Payment Verification Failing

**Check:**
1. Edge Function secrets configured
2. Cashfree credentials valid
3. Payment actually succeeded on Cashfree
4. Network connectivity

### Database Errors

**Check:**
1. Schema updated with cashfree fields
2. RLS policies allow inserts
3. Supabase service role key correct

---

## 📖 References

- **Cashfree Docs**: https://docs.cashfree.com/docs/payment-gateway
- **Inline Checkout**: https://docs.cashfree.com/docs/web-integration
- **API Reference**: https://docs.cashfree.com/reference
- **Test Credentials**: https://docs.cashfree.com/docs/test-credentials

---

## 🎉 You're All Set!

Cashfree is now fully integrated. Test the registration flow:

1. Go to `http://localhost:5173`
2. Click "Get Started"
3. Fill in gym details
4. Select a plan
5. Click "Proceed to Payment"
6. Use test card to complete payment
7. Get redirected to admin dashboard!

---

**Need Help?** 
- Check [Cashfree Documentation](https://docs.cashfree.com/)
- Review Edge Function logs in Supabase Dashboard

**Happy integrating! 💳✨**

