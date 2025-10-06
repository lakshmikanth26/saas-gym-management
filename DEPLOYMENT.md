# 🚀 Deployment Guide

Complete step-by-step guide to deploy your Gym Management SaaS platform to production.

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Edge Functions deployed
- [ ] Razorpay account set up
- [ ] Environment variables ready
- [ ] Domain name purchased (optional)
- [ ] Email service configured (optional)

## 🗄️ Supabase Setup

### 1. Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and region
4. Set database password (save it securely!)
5. Wait for project to initialize

### 2. Deploy Database Schema

```bash
# Option 1: Via Supabase Dashboard
1. Go to SQL Editor
2. Copy entire content from supabase/schema.sql
3. Click "Run"
4. Verify tables created in Table Editor

# Option 2: Via CLI
supabase db push
```

### 3. Configure Authentication

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Enable **Google** OAuth (optional):
   - Get credentials from Google Cloud Console
   - Add redirect URLs
4. Configure email templates in **Authentication → Email Templates**

### 4. Set Up Storage

1. Go to **Storage**
2. Create buckets:
   ```
   - member-photos
   - invoices
   - equipment-manuals
   ```
3. Set policies for each bucket:
   ```sql
   -- Example for member-photos bucket
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'member-photos');
   
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'member-photos' AND auth.role() = 'authenticated');
   ```

### 5. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
cd supabase/functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy generate-invoice
supabase functions deploy send-notification
```

### 6. Set Function Secrets

```bash
# Razorpay credentials
supabase secrets set RAZORPAY_KEY_ID="rzp_live_xxxxx"
supabase secrets set RAZORPAY_KEY_SECRET="your_secret_key"

# Email service (SendGrid)
supabase secrets set SENDGRID_API_KEY="SG.xxxxx"

# Supabase service role key (from project settings)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Supabase URL
supabase secrets set SUPABASE_URL="https://xxxxx.supabase.co"
```

## 💳 Razorpay Configuration

### 1. Create Account

1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Get approved for live mode

### 2. Get API Keys

1. Go to **Settings → API Keys**
2. Generate live keys
3. Copy Key ID and Key Secret
4. Add to Supabase secrets (above)

### 3. Configure Webhooks (Optional)

1. Go to **Settings → Webhooks**
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/razorpay-webhook`
3. Select events:
   - payment.captured
   - payment.failed
   - subscription.charged

### 4. Test Mode

For testing, use test keys:
```
Key ID: rzp_test_xxxxx
Key Secret: test_secret_xxxxx
```

Test cards:
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002

## 🌐 Vercel Deployment

### 1. Prepare Repository

```bash
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/gym-saas.git
git push -u origin main
```

### 2. Deploy to Vercel

```bash
# Option 1: Via Dashboard
1. Go to vercel.com
2. Click "New Project"
3. Import from GitHub
4. Select repository
5. Configure project:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
6. Add environment variables (see below)
7. Click "Deploy"

# Option 2: Via CLI
npm install -g vercel
vercel login
vercel --prod
```

### 3. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
VITE_APP_URL=https://yourdomain.com
```

### 4. Configure Custom Domain

1. Go to **Settings → Domains**
2. Add your domain: `yourdomain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-30 minutes)
5. SSL certificate auto-generated

## 🔧 Advanced Configuration

### Multi-Domain Setup

For gyms with custom domains:

#### 1. Vercel Configuration

Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ]
}
```

#### 2. Add Wildcard Domain

In Vercel:
1. Add domain: `*.yourdomain.com`
2. Configure DNS:
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   ```

#### 3. Database Configuration

When gym adds custom domain:
```sql
UPDATE gyms 
SET custom_domain = 'customgym.com' 
WHERE slug = 'custom-gym';
```

### Edge Middleware (Optional)

Create `src/middleware.js` for advanced routing:

```javascript
export function middleware(request) {
  const hostname = request.headers.get('host')
  const url = request.nextUrl
  
  // Handle custom domains
  // Your custom logic here
  
  return NextResponse.next()
}
```

## 📧 Email Configuration

### SendGrid Setup

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify sender identity
3. Create API key
4. Add to Supabase secrets

### Email Templates

Customize in Edge Functions:
```typescript
// In send-notification/index.ts
const emailTemplate = `
  <!DOCTYPE html>
  <html>
    <head>...</head>
    <body>
      <h1>${title}</h1>
      <p>${message}</p>
    </body>
  </html>
`
```

## 🔒 Security Checklist

- [ ] All RLS policies enabled
- [ ] Service role key secure
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection protection via parameterized queries
- [ ] XSS protection with input sanitization
- [ ] HTTPS enforced
- [ ] API keys not exposed in frontend
- [ ] Secrets stored in Supabase/Vercel
- [ ] Regular security audits

## 📊 Monitoring & Analytics

### Supabase Monitoring

1. **Database**:
   - Go to **Database → Logs**
   - Monitor query performance
   - Check error logs

2. **Edge Functions**:
   - Go to **Edge Functions → Logs**
   - Monitor invocations
   - Check for errors

### Vercel Analytics

1. Enable in **Settings → Analytics**
2. View metrics:
   - Page views
   - Performance
   - Error rates

### Custom Monitoring

Integrate Sentry or LogRocket:

```bash
npm install @sentry/react

# In main.jsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
})
```

## 🔄 Continuous Deployment

### Auto-Deploy from GitHub

Vercel automatically deploys when you push to main:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically deploys
```

### Preview Deployments

Every pull request gets a preview URL:
1. Create branch
2. Make changes
3. Open PR
4. Vercel creates preview
5. Test before merging

## 🧪 Production Testing

### Post-Deployment Tests

1. **Registration Flow**:
   - [ ] Landing page loads
   - [ ] Registration form works
   - [ ] Razorpay payment processes
   - [ ] Gym created in database
   - [ ] Admin can login

2. **Admin Dashboard**:
   - [ ] Dashboard loads with stats
   - [ ] Can add members
   - [ ] QR codes generate
   - [ ] Payment processing works

3. **Customer Portal**:
   - [ ] Members can login
   - [ ] Dashboard displays correctly
   - [ ] Goals can be created
   - [ ] Badges display

4. **Multi-Tenancy**:
   - [ ] Different gyms isolated
   - [ ] Custom domains work
   - [ ] Subpath routing works

## 🐛 Troubleshooting

### Common Issues

**Edge Functions Not Working**
```bash
# Check logs
supabase functions logs create-razorpay-order

# Verify secrets are set
supabase secrets list

# Redeploy
supabase functions deploy create-razorpay-order --no-verify-jwt
```

**Database Connection Issues**
- Check RLS policies
- Verify anon key is correct
- Check CORS settings in Supabase

**Razorpay Payments Failing**
- Verify API keys are for live mode
- Check webhook configuration
- Review Razorpay dashboard logs

**Custom Domain Not Working**
- Wait for DNS propagation (up to 48 hours)
- Verify CNAME records
- Check domain in Vercel settings

## 📈 Performance Optimization

### Database

```sql
-- Add indexes for frequent queries
CREATE INDEX idx_members_gym_id ON members(gym_id);
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_payments_gym_id ON payments(gym_id);
```

### Frontend

```javascript
// Code splitting
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))

// Image optimization
<img src="/image.jpg" loading="lazy" />

// Bundle analysis
npm run build -- --analyze
```

## 🎉 Launch Checklist

- [ ] All features tested in production
- [ ] Payment gateway verified
- [ ] Email notifications working
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Support channels ready
- [ ] Marketing materials prepared

## 🔮 Post-Launch

### Monitoring

- Check Supabase Dashboard daily
- Monitor Vercel Analytics
- Review error logs weekly
- Performance audits monthly

### Backups

Supabase provides automatic backups. For additional safety:

```bash
# Manual database backup
supabase db dump > backup-$(date +%Y%m%d).sql
```

### Updates

```bash
# Update dependencies monthly
npm update

# Test thoroughly
npm run build
npm run preview

# Deploy
git push origin main
```

---

## 🆘 Support

Need help? Check:
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Razorpay docs: [razorpay.com/docs](https://razorpay.com/docs)

---

🎊 Congratulations on deploying your Gym Management SaaS!

