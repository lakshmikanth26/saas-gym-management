# 📂 Complete File Structure

Visual guide to understand the project organization.

```
saas-gym-management/
│
├── 📄 Root Configuration Files
│   ├── package.json                    # Dependencies & scripts
│   ├── vite.config.js                  # Vite bundler config
│   ├── tailwind.config.js              # Tailwind CSS config
│   ├── postcss.config.js               # PostCSS config
│   ├── .eslintrc.cjs                   # ESLint rules
│   ├── .gitignore                      # Git ignore patterns
│   ├── index.html                      # HTML entry point
│   └── env.example                     # Environment template
│
├── 📚 Documentation
│   ├── README.md                       # Main documentation (500+ lines)
│   ├── DEPLOYMENT.md                   # Deployment guide (600+ lines)
│   ├── ARCHITECTURE.md                 # Technical architecture (800+ lines)
│   ├── QUICKSTART.md                   # Quick start guide (400+ lines)
│   ├── PROJECT-SUMMARY.md              # Project summary
│   └── FILE-STRUCTURE.md               # This file
│
├── 🎨 src/ - Frontend Source Code
│   │
│   ├── 🧩 components/
│   │   │
│   │   ├── ui/                         # Shadcn/UI Base Components
│   │   │   ├── button.jsx              # Button component
│   │   │   ├── card.jsx                # Card component
│   │   │   ├── input.jsx               # Input component
│   │   │   ├── label.jsx               # Label component
│   │   │   ├── dialog.jsx              # Modal dialog
│   │   │   ├── toast.jsx               # Toast notifications
│   │   │   ├── tabs.jsx                # Tabs component
│   │   │   ├── badge.jsx               # Badge component
│   │   │   └── select.jsx              # Select dropdown
│   │   │
│   │   └── layouts/                    # Layout Components
│   │       ├── AdminLayout.jsx         # Admin dashboard layout
│   │       └── CustomerLayout.jsx      # Customer portal layout
│   │
│   ├── 📄 pages/
│   │   │
│   │   ├── LandingPage.jsx             # Marketing homepage with pricing
│   │   ├── RegisterGym.jsx             # Gym registration & Razorpay
│   │   ├── Login.jsx                   # Authentication page
│   │   │
│   │   ├── admin/                      # Admin Dashboard Pages
│   │   │   ├── Dashboard.jsx           # Main admin dashboard
│   │   │   ├── Members.jsx             # Member management
│   │   │   ├── Trainers.jsx            # Trainer management
│   │   │   ├── Staff.jsx               # Staff management
│   │   │   ├── Plans.jsx               # Membership plans
│   │   │   └── Analytics.jsx           # Analytics & reports
│   │   │
│   │   └── customer/                   # Customer Portal Pages
│   │       ├── Dashboard.jsx           # Member dashboard
│   │       ├── Attendance.jsx          # Attendance history
│   │       ├── Goals.jsx               # Fitness goals
│   │       ├── Trainers.jsx            # Trainer selection
│   │       └── Badges.jsx              # Achievement badges
│   │
│   ├── 🪝 hooks/                        # Custom React Hooks
│   │   ├── useAuth.js                  # Authentication hook
│   │   ├── useGym.js                   # Gym context hook
│   │   ├── useUserRole.js              # Role checking hook
│   │   └── useToast.js                 # Toast notification hook
│   │
│   ├── 📚 lib/                          # Utility Libraries
│   │   ├── supabase.js                 # Supabase client setup
│   │   ├── utils.js                    # Helper functions
│   │   ├── gym-context.js              # Gym detection logic
│   │   └── razorpay.js                 # Razorpay integration
│   │
│   ├── 🗃️ store/                        # Global State Management
│   │   └── gymStore.js                 # Zustand store for gym context
│   │
│   ├── App.jsx                         # Main app component with routes
│   ├── main.jsx                        # React entry point
│   └── index.css                       # Global styles & Tailwind
│
└── 🗄️ supabase/ - Backend Code
    │
    ├── schema.sql                      # Complete Database Schema (1200+ lines)
    │                                   # • 15+ tables
    │                                   # • 30+ RLS policies
    │                                   # • Triggers & functions
    │
    └── functions/                      # Edge Functions (Serverless)
        │
        ├── create-razorpay-order/
        │   └── index.ts                # Create payment order
        │
        ├── verify-razorpay-payment/
        │   └── index.ts                # Verify & complete registration
        │
        ├── generate-invoice/
        │   └── index.ts                # Generate PDF invoice
        │
        └── send-notification/
            └── index.ts                # Send email notifications
```

## 📊 File Statistics

### Configuration (8 files)
- Build & Dev Tools
- Styling Configuration
- Code Quality Tools

### Documentation (6 files)
- Setup Guides
- Architecture Docs
- Deployment Instructions

### Frontend Components (25+ files)
- UI Components: 9
- Layouts: 2
- Pages: 13
- Hooks: 4
- Utils: 4
- Store: 1

### Backend (5 files)
- Database Schema: 1
- Edge Functions: 4

## 🎯 Key Files by Purpose

### Getting Started
```
📖 QUICKSTART.md         → Start here for setup
📖 README.md             → Feature overview
📄 env.example           → Environment setup
📄 package.json          → Install dependencies
```

### Development
```
📄 src/App.jsx           → Main routing
📄 src/main.jsx          → Entry point
📄 src/index.css         → Global styles
📚 src/lib/supabase.js   → Database client
📚 src/lib/gym-context.js → Multi-tenancy logic
```

### Admin Features
```
📄 src/pages/admin/Dashboard.jsx  → Analytics
📄 src/pages/admin/Members.jsx    → Member CRUD
📄 src/pages/admin/Plans.jsx      → Plan management
```

### Customer Features
```
📄 src/pages/customer/Dashboard.jsx → Member home
📄 src/pages/customer/Goals.jsx     → Goal tracking
📄 src/pages/customer/Badges.jsx    → Achievements
```

### Backend
```
📄 supabase/schema.sql                           → Database
📄 supabase/functions/verify-razorpay-payment/   → Payments
📄 supabase/functions/generate-invoice/          → Invoices
```

### Deployment
```
📖 DEPLOYMENT.md         → Deploy guide
📄 vite.config.js        → Build config
```

## 🗂️ File Categories

### Must Read First
1. `QUICKSTART.md` - Get running in 15 minutes
2. `README.md` - Understand features
3. `env.example` - Configure environment

### Must Deploy
1. `supabase/schema.sql` - Database
2. `supabase/functions/*` - Serverless functions
3. Frontend build - Vercel

### Can Customize
1. `src/pages/LandingPage.jsx` - Marketing
2. `src/index.css` - Theme colors
3. `package.json` - App metadata

## 🎨 Component Dependency Graph

```
App.jsx
  ├─→ LandingPage.jsx
  │     └─→ ui/* components
  │
  ├─→ RegisterGym.jsx
  │     ├─→ ui/* components
  │     └─→ razorpay.js
  │
  ├─→ Login.jsx
  │     ├─→ ui/* components
  │     └─→ useAuth hook
  │
  ├─→ AdminLayout.jsx
  │     ├─→ useAuth hook
  │     ├─→ useGym hook
  │     └─→ Admin Pages
  │           ├─→ Dashboard.jsx (charts, stats)
  │           ├─→ Members.jsx (CRUD, QR codes)
  │           ├─→ Trainers.jsx
  │           ├─→ Staff.jsx
  │           ├─→ Plans.jsx
  │           └─→ Analytics.jsx
  │
  └─→ CustomerLayout.jsx
        ├─→ useAuth hook
        ├─→ useGym hook
        └─→ Customer Pages
              ├─→ Dashboard.jsx (stats, badges)
              ├─→ Attendance.jsx
              ├─→ Goals.jsx
              ├─→ Trainers.jsx
              └─→ Badges.jsx
```

## 🔄 Data Flow

```
User Action
    ↓
React Component
    ↓
Custom Hook (useAuth, useGym)
    ↓
Supabase Client (lib/supabase.js)
    ↓
Supabase Backend
    ├─→ PostgreSQL Database
    ├─→ Edge Functions
    └─→ Authentication
    ↓
Response Back to Component
    ↓
UI Update
```

## 📝 Quick Reference

### Need to add a new admin page?
1. Create file in `src/pages/admin/`
2. Add route in `src/App.jsx`
3. Add nav item in `src/components/layouts/AdminLayout.jsx`

### Need to add a new UI component?
1. Create in `src/components/ui/`
2. Follow Shadcn/UI pattern
3. Export from component file

### Need to modify database?
1. Update `supabase/schema.sql`
2. Run migration in Supabase Dashboard
3. Update RLS policies if needed

### Need to add Edge Function?
1. Create folder in `supabase/functions/`
2. Add `index.ts` file
3. Deploy with `supabase functions deploy`

## 🎯 File Size Guide

### Large Files (500+ lines)
- `README.md` - Comprehensive docs
- `DEPLOYMENT.md` - Step-by-step guide
- `ARCHITECTURE.md` - Technical details
- `supabase/schema.sql` - Database schema
- `src/pages/admin/Members.jsx` - Full CRUD

### Medium Files (200-500 lines)
- `src/pages/LandingPage.jsx` - Marketing
- `src/pages/RegisterGym.jsx` - Registration
- `src/pages/admin/Dashboard.jsx` - Analytics
- `src/pages/customer/Dashboard.jsx` - Member home

### Small Files (< 200 lines)
- UI components
- Hooks
- Utility functions
- Configuration files

## 💡 Navigation Tips

**Looking for styling?**
→ `src/index.css` and `tailwind.config.js`

**Looking for API calls?**
→ Check page components and `src/lib/supabase.js`

**Looking for routing?**
→ `src/App.jsx`

**Looking for authentication?**
→ `src/hooks/useAuth.js` and `src/pages/Login.jsx`

**Looking for multi-tenancy?**
→ `src/lib/gym-context.js` and `src/hooks/useGym.js`

**Looking for payments?**
→ `src/lib/razorpay.js` and Edge Functions

---

**Happy exploring! 🚀**
