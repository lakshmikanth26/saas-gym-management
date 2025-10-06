# 🏗️ Architecture Documentation

Detailed technical architecture of the Gym Management SaaS platform.

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │    Admin     │  │   Customer   │      │
│  │     Page     │  │   Dashboard  │  │    Portal    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                            │                                 │
│                            ▼                                 │
│                  ┌──────────────────┐                       │
│                  │  Supabase Client  │                       │
│                  └──────────────────┘                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           PostgreSQL Database with RLS                │  │
│  │  ┌────────┐  ┌────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │  │  gyms  │  │members │  │attendance │  │payments │  │  │
│  │  └────────┘  └────────┘  └──────────┘  └─────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                Edge Functions                         │  │
│  │  • create-razorpay-order                             │  │
│  │  • verify-razorpay-payment                           │  │
│  │  • generate-invoice                                  │  │
│  │  • send-notification                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase Auth                            │  │
│  │  • Email/Password                                     │  │
│  │  • OAuth (Google)                                     │  │
│  │  • JWT Tokens                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase Storage                         │  │
│  │  • Member Photos                                      │  │
│  │  • Invoices                                           │  │
│  │  • Documents                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────┬─────────────────────┘
                   │                   │
                   ▼                   ▼
         ┌─────────────────┐  ┌──────────────┐
         │    Razorpay     │  │   SendGrid   │
         │   (Payments)    │  │   (Emails)   │
         └─────────────────┘  └──────────────┘
```

## 🔐 Multi-Tenancy Architecture

### Data Isolation Strategy

**Database Level Isolation**
```sql
-- Every table has gym_id for tenant isolation
CREATE TABLE members (
    id UUID PRIMARY KEY,
    gym_id UUID NOT NULL REFERENCES gyms(id),
    -- other fields...
);

-- RLS policies ensure isolation
CREATE POLICY "Members belong to gym"
ON members FOR ALL
USING (gym_id IN (
    SELECT gym_id FROM gym_members 
    WHERE user_id = auth.uid()
));
```

**Application Level Isolation**
```javascript
// Gym context automatically loaded from URL
const { gym } = useGym() // From domain or subpath

// All queries scoped by gym_id
const { data } = await supabase
  .from('members')
  .select('*')
  .eq('gym_id', gym.id)
```

### Routing Architecture

**Domain Detection Flow**
```
1. User visits URL
   ├─ Custom domain? (gym1.com)
   │  └─> Query gyms WHERE custom_domain = 'gym1.com'
   └─ Subpath? (app.com/gym1)
      └─> Query gyms WHERE slug = 'gym1'

2. Load gym context
   └─> Store in global state (Zustand)

3. All subsequent requests use gym.id
   └─> RLS policies validate access
```

## 🗄️ Database Schema Design

### Entity Relationship Diagram

```
┌─────────────┐
│    gyms     │
│ (Tenants)   │
└──────┬──────┘
       │ 1
       │
       │ n
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ members  │  │ trainers │  │  staff   │  │  plans   │
└────┬─────┘  └────┬─────┘  └──────────┘  └────┬─────┘
     │             │                            │
     ├─────────────┼────────────────────────────┘
     │             │
     ▼             ▼
┌──────────┐  ┌──────────┐
│attendance│  │ payments │
└──────────┘  └──────────┘
     │             │
     └──────┬──────┘
            │
            ▼
     ┌──────────┐
     │ invoices │
     └──────────┘
```

### Key Design Patterns

**1. Soft Delete Pattern**
```sql
-- Instead of deleting, mark as inactive
UPDATE members SET is_active = false WHERE id = $1;
```

**2. Audit Trail Pattern**
```sql
-- Track all changes
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()

-- Trigger for automatic updates
CREATE TRIGGER update_updated_at 
BEFORE UPDATE ON table_name
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**3. JSONB for Flexibility**
```sql
-- Store flexible data as JSONB
body_metrics JSONB DEFAULT '{}'
settings JSONB DEFAULT '{}'

-- Query JSONB fields
SELECT * FROM members 
WHERE body_metrics->>'weight' < '70';
```

## 🔄 Data Flow

### Registration Flow

```
User fills form → Frontend validates
                      ↓
                Create Razorpay order (Edge Function)
                      ↓
                User completes payment
                      ↓
                Verify payment (Edge Function)
                      ↓
            ┌─────────────────────────┐
            │ 1. Create gym record    │
            │ 2. Create admin user    │
            │ 3. Create gym_member    │
            │ 4. Create default plans │
            │ 5. Send welcome email   │
            └─────────────────────────┘
                      ↓
            Redirect to admin dashboard
```

### Member Check-In Flow

```
Member scans QR code → Frontend captures data
                             ↓
                   Parse gym_id & member_id
                             ↓
                   Validate against database
                             ↓
                 Create attendance record
                             ↓
              ┌──────────────────────────┐
              │ Check monthly attendance │
              │ Award badge if eligible  │
              │ Send notification        │
              └──────────────────────────┘
```

### Payment Processing Flow

```
Admin initiates payment → Create Razorpay order
                               ↓
                    Customer completes payment
                               ↓
                    Webhook/Frontend callback
                               ↓
                ┌──────────────────────────┐
                │ 1. Verify payment        │
                │ 2. Create payment record │
                │ 3. Update membership     │
                │ 4. Generate invoice      │
                │ 5. Send invoice email    │
                └──────────────────────────┘
```

## 🧩 Component Architecture

### React Component Hierarchy

```
App
├── Routes
│   ├── Public Routes
│   │   ├── LandingPage
│   │   ├── RegisterGym
│   │   └── Login
│   │
│   ├── Admin Routes (Protected)
│   │   └── AdminLayout
│   │       ├── Dashboard
│   │       ├── Members
│   │       ├── Trainers
│   │       ├── Staff
│   │       ├── Plans
│   │       └── Analytics
│   │
│   └── Customer Routes (Protected)
│       └── CustomerLayout
│           ├── Dashboard
│           ├── Attendance
│           ├── Goals
│           ├── Trainers
│           └── Badges
```

### State Management Strategy

**Global State (Zustand)**
```javascript
// Gym context - shared across app
useGymStore
  - gym: Current gym object
  - setGym()
  - clearGym()
```

**React Query / SWR (Future Enhancement)**
```javascript
// Server state caching
useQuery(['members', gymId], fetchMembers)
useMutation(createMember)
```

**Local Component State**
```javascript
// Form inputs, UI toggles
useState()
useReducer()
```

## 🔒 Security Architecture

### Authentication & Authorization

**Authentication Flow**
```
1. User enters credentials
2. Supabase Auth validates
3. JWT token generated
4. Token stored in localStorage
5. Token sent with all requests
6. Server validates JWT
```

**Authorization Levels**
```
┌─────────────────────────────────────┐
│          Supabase Auth              │
│  • Generates JWT with user.id       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│         gym_members table            │
│  Maps user_id → gym_id + role       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│         RLS Policies                │
│  Check: user → gym → role → data    │
└─────────────────────────────────────┘
```

### Row-Level Security (RLS)

**Policy Pattern**
```sql
-- Generic template for all tables
CREATE POLICY "policy_name"
ON table_name
FOR operation
USING (
  gym_id IN (
    SELECT gym_id 
    FROM gym_members 
    WHERE user_id = auth.uid()
    AND role IN ('allowed', 'roles')
  )
);
```

**Example Policies**
```sql
-- Members can view their own data
CREATE POLICY "Members view own data"
ON members FOR SELECT
USING (user_id = auth.uid());

-- Admins can manage all gym data
CREATE POLICY "Admins manage all"
ON members FOR ALL
USING (
  gym_id IN (
    SELECT gym_id FROM gym_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

## 📡 API Architecture

### Supabase Client Pattern

**Initialization**
```javascript
// lib/supabase.js
export const supabase = createClient(url, anonKey)
```

**Query Pattern**
```javascript
// Automatic RLS enforcement
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('gym_id', gymId)
```

**Real-time Subscriptions**
```javascript
// Listen to changes
const subscription = supabase
  .from('attendance')
  .on('INSERT', payload => {
    // Handle new check-in
  })
  .subscribe()
```

### Edge Functions Pattern

**Structure**
```
functions/
  └── function-name/
      └── index.ts
```

**Template**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Function logic
    const { data } = await req.json()
    
    // Process
    const result = await processData(data)
    
    // Return
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: corsHeaders }
    )
  }
})
```

## 🎨 Frontend Architecture

### Design System

**Styling Approach**
- **TailwindCSS**: Utility-first CSS
- **Shadcn/UI**: Pre-built accessible components
- **CSS Variables**: Theme customization

**Component Structure**
```
src/components/
  ├── ui/           # Base components (Button, Input, etc.)
  ├── layouts/      # Page layouts
  └── features/     # Feature-specific components
```

### Performance Optimizations

**Code Splitting**
```javascript
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
```

**Memoization**
```javascript
const MemberList = memo(({ members }) => {
  // Component logic
})
```

**Virtual Scrolling** (Future)
```javascript
<VirtualList
  items={members}
  itemHeight={60}
  renderItem={renderMember}
/>
```

## 🔄 Deployment Architecture

### CI/CD Pipeline

```
Developer pushes code
         ↓
    GitHub detects push
         ↓
    Vercel webhook triggered
         ↓
┌────────────────────────┐
│   Vercel Build Process  │
│  1. npm install         │
│  2. npm run build       │
│  3. Optimize assets     │
│  4. Generate preview    │
└────────────────────────┘
         ↓
    Deploy to edge
         ↓
    Update DNS records
```

### Infrastructure

**Hosting**
- Frontend: Vercel Edge Network
- Backend: Supabase (AWS)
- CDN: Vercel + Cloudflare

**Regions**
- Database: Closest to users
- Edge Functions: Global distribution
- Static Assets: CDN cached

## 📊 Monitoring & Observability

### Logging Strategy

**Application Logs**
```javascript
// Custom logger
const logger = {
  info: (msg, meta) => console.log({ level: 'info', msg, meta }),
  error: (msg, error) => console.error({ level: 'error', msg, error }),
}
```

**Database Logs**
- Supabase Dashboard → Database → Logs
- Track slow queries
- Monitor connections

**Edge Function Logs**
```bash
supabase functions logs function-name
```

### Metrics to Track

**Business Metrics**
- New gym registrations
- Active members per gym
- Monthly recurring revenue (MRR)
- Churn rate

**Technical Metrics**
- API response times
- Database query performance
- Error rates
- Uptime percentage

## 🔮 Scalability Considerations

### Current Capacity

- **Database**: PostgreSQL can handle 100K+ gyms
- **Storage**: Unlimited (S3-backed)
- **Edge Functions**: Auto-scaling
- **Frontend**: CDN-cached, globally distributed

### Future Scaling Strategies

**Database Sharding**
```sql
-- Partition large tables by gym_id
CREATE TABLE attendance PARTITION BY HASH (gym_id);
```

**Caching Layer**
```javascript
// Redis for hot data
const cachedData = await redis.get(`gym:${gymId}:stats`)
```

**Queue System**
```javascript
// For long-running tasks
await queue.publish('generate-invoice', { paymentId })
```

## 🛠️ Development Workflow

### Local Development

```bash
# 1. Start frontend
npm run dev

# 2. Start Supabase locally (optional)
supabase start

# 3. Run tests
npm test
```

### Testing Strategy

**Unit Tests**
```javascript
// Component tests
test('renders member list', () => {
  render(<MemberList members={mockData} />)
  expect(screen.getByText('John Doe')).toBeInTheDocument()
})
```

**Integration Tests**
```javascript
// API tests
test('creates member successfully', async () => {
  const result = await createMember(memberData)
  expect(result.error).toBeNull()
  expect(result.data.id).toBeDefined()
})
```

**E2E Tests** (Future)
```javascript
// Playwright/Cypress
test('complete registration flow', async ({ page }) => {
  await page.goto('/register')
  await page.fill('#gymName', 'Test Gym')
  // ... complete flow
  await expect(page).toHaveURL('/test-gym/admin/dashboard')
})
```

---

## 📚 Further Reading

- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- [React Performance](https://react.dev/learn/render-and-commit)

---

Built with modern best practices for scalability, security, and maintainability.

