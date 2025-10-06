# 🏋️ Multi-Tenant SaaS Gym Management Platform

A complete, production-ready multi-tenant SaaS platform for gym management built with React, Supabase, and Razorpay.

---

## 🎯 **NEW HERE? START WITH [START-HERE.md](./START-HERE.md)** 

👆 *That guide will help you choose your path and get started quickly!*

---

## 🌟 Features

### 🌍 Multi-Tenancy
- **Complete tenant isolation** with Row-Level Security (RLS)
- **Flexible routing**: Custom domains OR subpath routes (`yourdomain.com/gym1` or `gym1.com`)
- **Automatic gym context detection** based on URL
- Each gym has isolated data, admin, and users

### 💼 Admin Dashboard
- 📊 **Analytics Dashboard** - Revenue, attendance trends, member stats
- 👥 **Member Management** - Add, edit, track members
- 🏷️ **QR Code Generation** - Unique QR codes for attendance
- 💳 **Payment Processing** - Integrated Razorpay payments
- 📄 **Invoice Generation** - Automated PDF invoices with email
- 🏃 **Trainer Management** - Assign and manage trainers
- 👔 **Staff Management** - Manage gym staff
- 📋 **Membership Plans** - Create and manage plans
- 📈 **Advanced Analytics** - Track performance metrics

### 🧑‍💼 Customer Portal
- 📱 **Personal Dashboard** - View membership status, stats
- 📅 **Attendance History** - Track gym visits
- 🎯 **Fitness Goals** - Set and track goals (weight, stamina, etc.)
- 🏆 **Badge System** - Earn consistency badges:
  - 🥉 Bronze: 10+ days/month
  - 🥈 Silver: 20+ days/month
  - 🥇 Gold: 26+ days/month
- 👨‍🏫 **Trainer Selection** - Book and schedule with trainers
- ⏸️ **Pause Membership** - Up to 30 days pause feature
- 📊 **Performance Charts** - Visual progress tracking

### 💳 Registration & Payments
- 🎨 **Beautiful landing page** with pricing tiers
- 💰 **Razorpay integration** for secure payments
- 📋 **Plans**: Monthly, Quarterly, Half-Yearly, Yearly
- ✅ **Auto-provisioning** - Instant gym setup after payment
- 🔐 **Secure authentication** via Supabase Auth
- 📧 **Email notifications** for renewals and updates

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **Shadcn/UI** components
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router DOM** for routing
- **Zustand** for state management

### Backend
- **Supabase**
  - PostgreSQL database
  - Authentication with SSO
  - Row-Level Security (RLS)
  - Storage for files
  - Edge Functions for serverless logic
- **Razorpay** for payments
- **SendGrid/Resend** for emails

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Razorpay account
- (Optional) SendGrid account for emails

### 1. Clone and Install

```bash
cd saas-gym-management
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents from `supabase/schema.sql`
   - Execute the SQL

3. Deploy Edge Functions:
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy generate-invoice
supabase functions deploy send-notification
```

4. Set Edge Function Secrets:
```bash
supabase secrets set RAZORPAY_KEY_ID=your_key_id
supabase secrets set RAZORPAY_KEY_SECRET=your_key_secret
supabase secrets set SENDGRID_API_KEY=your_sendgrid_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3. Configure Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_APP_URL=https://yourdomain.com
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel --prod
```

### Configure Custom Domains

For gyms using custom domains:

1. **In Vercel:**
   - Add domain to your project
   - Configure DNS with CNAME record

2. **In Database:**
   - Update gym's `custom_domain` field

3. **Routing Logic:**
   - Already implemented in `src/lib/gym-context.js`
   - Automatically detects and loads correct gym

## 🏗️ Project Structure

```
saas-gym-management/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   └── layouts/         # Layout components
│   ├── pages/
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── customer/        # Customer portal pages
│   │   ├── LandingPage.jsx
│   │   ├── RegisterGym.jsx
│   │   └── Login.jsx
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   ├── store/               # Zustand stores
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   ├── schema.sql           # Database schema
│   └── functions/           # Edge Functions
│       ├── create-razorpay-order/
│       ├── verify-razorpay-payment/
│       ├── generate-invoice/
│       └── send-notification/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔐 Multi-Tenancy Implementation

### Database Level
- All tables include `gym_id` for tenant isolation
- RLS policies ensure users only access their gym's data
- `gym_members` table maps users to gyms with roles

### Application Level
- `useGym()` hook provides current gym context
- `detectGymContext()` automatically identifies gym from URL
- All API calls automatically scoped by `gym_id`

### Routing Options

**Option 1: Subpath Routing**
```
yourdomain.com/iron-fitness/admin/dashboard
yourdomain.com/powerhouse-gym/customer/dashboard
```

**Option 2: Custom Domain**
```
ironfitness.com/admin/dashboard
powerhousegym.com/customer/dashboard
```

## 👥 User Roles

- **Admin**: Full access to gym management
- **Staff**: Member and attendance management
- **Trainer**: View assigned members, create workout plans
- **Member**: Access customer portal, track fitness

## 📊 Database Schema

### Core Tables
- `gyms` - Tenant/organization table
- `gym_members` - User-gym-role mapping
- `members` - Gym member profiles
- `membership_plans` - Pricing plans
- `trainers` - Trainer profiles
- `staff` - Staff profiles
- `attendance` - Check-in records
- `payments` - Payment transactions
- `invoices` - Generated invoices
- `member_goals` - Fitness goals
- `member_badges` - Achievement badges
- `notifications` - User notifications

## 🔧 Configuration

### Razorpay Setup
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get API keys from Dashboard
3. Add to environment variables
4. Test mode available for development

### Email Setup (Optional)
1. Sign up for SendGrid or Resend
2. Get API key
3. Configure in Supabase Edge Function secrets
4. Customize email templates in Edge Functions

## 🧪 Testing

### Test Gym Registration
1. Visit landing page
2. Click "Get Started"
3. Fill in gym details
4. Use Razorpay test cards:
   - Card: `4111 1111 1111 1111`
   - Any future expiry
   - Any CVV

### Test Member Portal
1. Admin creates member account
2. Member logs in with credentials
3. Explore dashboard, goals, badges

## 📝 API Documentation

### Edge Functions

**Create Razorpay Order**
```javascript
supabase.functions.invoke('create-razorpay-order', {
  body: {
    amount: 2999,
    currency: 'INR',
    receipt: 'receipt_id',
    notes: {}
  }
})
```

**Generate Invoice**
```javascript
supabase.functions.invoke('generate-invoice', {
  body: {
    payment_id: 'uuid'
  }
})
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal and commercial projects

## 🆘 Support

For issues or questions:
- Check documentation
- Search existing issues
- Create new issue with details

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Biometric attendance integration
- [ ] Video workout library
- [ ] Nutrition tracking
- [ ] WhatsApp notifications
- [ ] Advanced reporting
- [ ] Equipment maintenance tracking
- [ ] Class scheduling
- [ ] Member referral system

## 🙏 Acknowledgments

- Supabase for amazing backend platform
- Razorpay for payment infrastructure
- Shadcn for beautiful UI components
- All open-source contributors

---

Built with ❤️ for gym owners worldwide
