-- ============================================
-- MULTI-TENANT GYM MANAGEMENT SAAS SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- GYMS TABLE (Main Tenant Table)
-- ============================================
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'quarterly', 'half_yearly', 'yearly')),
    plan_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    plan_end TIMESTAMPTZ NOT NULL,
    custom_domain TEXT UNIQUE,
    cashfree_payment_id TEXT,
    cashfree_order_id TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast domain lookups
CREATE INDEX idx_gyms_slug ON gyms(slug);
CREATE INDEX idx_gyms_custom_domain ON gyms(custom_domain) WHERE custom_domain IS NOT NULL;

-- ============================================
-- GYM MEMBERS (User-Gym Mapping)
-- ============================================
CREATE TABLE gym_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'trainer', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, gym_id)
);

CREATE INDEX idx_gym_members_user_id ON gym_members(user_id);
CREATE INDEX idx_gym_members_gym_id ON gym_members(gym_id);

-- ============================================
-- MEMBERSHIP PLANS
-- ============================================
CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_membership_plans_gym_id ON membership_plans(gym_id);

-- ============================================
-- MEMBERS
-- ============================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_plan_id UUID REFERENCES membership_plans(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    photo_url TEXT,
    qr_code TEXT UNIQUE,
    membership_start TIMESTAMPTZ,
    membership_end TIMESTAMPTZ,
    membership_status TEXT DEFAULT 'active' CHECK (membership_status IN ('active', 'paused', 'expired', 'cancelled')),
    pause_days_remaining INTEGER DEFAULT 0,
    pause_start_date TIMESTAMPTZ,
    assigned_trainer_id UUID,
    health_conditions TEXT,
    fitness_goals JSONB DEFAULT '{}',
    body_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id, email)
);

CREATE INDEX idx_members_gym_id ON members(gym_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_qr_code ON members(qr_code);

-- ============================================
-- TRAINERS
-- ============================================
CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT,
    specialization TEXT[],
    experience_years INTEGER,
    certifications JSONB DEFAULT '[]',
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id, email)
);

CREATE INDEX idx_trainers_gym_id ON trainers(gym_id);

-- ============================================
-- STAFF
-- ============================================
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT,
    position TEXT,
    salary DECIMAL(10,2),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id, email)
);

CREATE INDEX idx_staff_gym_id ON staff(gym_id);

-- ============================================
-- ATTENDANCE
-- ============================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out TIMESTAMPTZ,
    attendance_type TEXT DEFAULT 'qr' CHECK (attendance_type IN ('qr', 'biometric', 'manual')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_gym_id ON attendance(gym_id);
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_check_in ON attendance(check_in);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    membership_plan_id UUID REFERENCES membership_plans(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    payment_method TEXT DEFAULT 'cashfree',
    cashfree_payment_id TEXT,
    cashfree_order_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    invoice_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_gym_id ON payments(gym_id);
CREATE INDEX idx_payments_member_id ON payments(member_id);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date TIMESTAMPTZ DEFAULT NOW(),
    amount DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    invoice_url TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_gym_id ON invoices(gym_id);
CREATE INDEX idx_invoices_member_id ON invoices(member_id);

-- ============================================
-- WORKOUT SESSIONS
-- ============================================
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    session_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    exercises JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_sessions_gym_id ON workout_sessions(gym_id);
CREATE INDEX idx_workout_sessions_member_id ON workout_sessions(member_id);

-- ============================================
-- MEMBER GOALS
-- ============================================
CREATE TABLE member_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_building', 'stamina', 'body_fat', 'other')),
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    unit TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'achieved', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_goals_gym_id ON member_goals(gym_id);
CREATE INDEX idx_member_goals_member_id ON member_goals(member_id);

-- ============================================
-- MEMBER BADGES
-- ============================================
CREATE TABLE member_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('bronze', 'silver', 'gold')),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    days_attended INTEGER NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_id, member_id, badge_type, month, year)
);

CREATE INDEX idx_member_badges_gym_id ON member_badges(gym_id);
CREATE INDEX idx_member_badges_member_id ON member_badges(member_id);

-- ============================================
-- EQUIPMENT
-- ============================================
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    quantity INTEGER DEFAULT 1,
    purchase_date DATE,
    maintenance_schedule TEXT,
    last_maintenance DATE,
    next_maintenance DATE,
    instructions_url TEXT,
    video_url TEXT,
    is_operational BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_gym_id ON equipment(gym_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('renewal_reminder', 'payment_success', 'membership_expiring', 'announcement', 'trainer_assigned', 'goal_achieved')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_gym_id ON notifications(gym_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_member_id ON notifications(member_id);

-- ============================================
-- TRAINER SCHEDULES
-- ============================================
CREATE TABLE trainer_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    schedule_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trainer_schedules_gym_id ON trainer_schedules(gym_id);
CREATE INDEX idx_trainer_schedules_trainer_id ON trainer_schedules(trainer_id);
CREATE INDEX idx_trainer_schedules_member_id ON trainer_schedules(member_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_membership_plans_updated_at BEFORE UPDATE ON membership_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_goals_updated_at BEFORE UPDATE ON member_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_schedules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GYMS TABLE POLICIES
-- ============================================
-- Allow anyone to read gym info by slug or domain (for routing)
CREATE POLICY "Allow public read access to gyms by slug or domain"
ON gyms FOR SELECT
USING (true);

-- Allow gym admins to update their gym
CREATE POLICY "Allow gym admins to update their gym"
ON gyms FOR UPDATE
USING (
    id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- GYM_MEMBERS TABLE POLICIES
-- ============================================
-- Users can read their own gym memberships
CREATE POLICY "Users can read their own gym memberships"
ON gym_members FOR SELECT
USING (user_id = auth.uid());

-- Gym admins can manage gym members
CREATE POLICY "Gym admins can manage gym members"
ON gym_members FOR ALL
USING (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- HELPER FUNCTION FOR TENANT ISOLATION
-- ============================================
CREATE OR REPLACE FUNCTION get_user_gym_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT gym_id FROM gym_members WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MEMBERSHIP PLANS POLICIES
-- ============================================
-- Allow users to view plans for their gyms
CREATE POLICY "Users can view membership plans for their gyms"
ON membership_plans FOR SELECT
USING (gym_id IN (SELECT get_user_gym_ids()));

-- Allow gym admins and staff to manage plans
CREATE POLICY "Admins and staff can manage membership plans"
ON membership_plans FOR ALL
USING (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- ============================================
-- MEMBERS TABLE POLICIES
-- ============================================
-- Members can view their own data
CREATE POLICY "Members can view their own data"
ON members FOR SELECT
USING (
    user_id = auth.uid() 
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff', 'trainer')
    )
);

-- Admins and staff can manage members
CREATE POLICY "Admins and staff can manage members"
ON members FOR ALL
USING (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Members can update their own profile
CREATE POLICY "Members can update their own profile"
ON members FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- TRAINERS TABLE POLICIES
-- ============================================
-- Users can view trainers in their gyms
CREATE POLICY "Users can view trainers in their gyms"
ON trainers FOR SELECT
USING (gym_id IN (SELECT get_user_gym_ids()));

-- Admins can manage trainers
CREATE POLICY "Admins can manage trainers"
ON trainers FOR ALL
USING (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- STAFF TABLE POLICIES
-- ============================================
-- Admins can view and manage staff
CREATE POLICY "Admins can manage staff"
ON staff FOR ALL
USING (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- ATTENDANCE TABLE POLICIES
-- ============================================
-- Members can view their own attendance
CREATE POLICY "Members can view their own attendance"
ON attendance FOR SELECT
USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff', 'trainer')
    )
);

-- Staff can create attendance records
CREATE POLICY "Staff can create attendance records"
ON attendance FOR INSERT
WITH CHECK (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================
-- Members can view their own payments
CREATE POLICY "Members can view their own payments"
ON payments FOR SELECT
USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Admins and staff can manage payments
CREATE POLICY "Admins and staff can manage payments"
ON payments FOR ALL
USING (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- ============================================
-- INVOICES TABLE POLICIES
-- ============================================
-- Members can view their own invoices
CREATE POLICY "Members can view their own invoices"
ON invoices FOR SELECT
USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Admins and staff can manage invoices
CREATE POLICY "Admins and staff can manage invoices"
ON invoices FOR ALL
USING (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- ============================================
-- WORKOUT SESSIONS POLICIES
-- ============================================
-- Members and trainers can view relevant sessions
CREATE POLICY "Users can view relevant workout sessions"
ON workout_sessions FOR SELECT
USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    OR trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Trainers can create sessions for their members
CREATE POLICY "Trainers can create workout sessions"
ON workout_sessions FOR INSERT
WITH CHECK (
    trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- ============================================
-- MEMBER GOALS POLICIES
-- ============================================
-- Members can manage their own goals
CREATE POLICY "Members can manage their own goals"
ON member_goals FOR ALL
USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff', 'trainer')
    )
);

-- ============================================
-- MEMBER BADGES POLICIES
-- ============================================
-- Members can view their own badges
CREATE POLICY "Members can view their own badges"
ON member_badges FOR SELECT
USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- ============================================
-- EQUIPMENT POLICIES
-- ============================================
-- Users can view equipment in their gyms
CREATE POLICY "Users can view equipment in their gyms"
ON equipment FOR SELECT
USING (gym_id IN (SELECT get_user_gym_ids()));

-- Admins and staff can manage equipment
CREATE POLICY "Admins and staff can manage equipment"
ON equipment FOR ALL
USING (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (
    user_id = auth.uid() 
    OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (
    user_id = auth.uid() 
    OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

-- Admins and staff can create notifications
CREATE POLICY "Admins and staff can create notifications"
ON notifications FOR INSERT
WITH CHECK (
    gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- ============================================
-- TRAINER SCHEDULES POLICIES
-- ============================================
-- Users can view relevant schedules
CREATE POLICY "Users can view relevant trainer schedules"
ON trainer_schedules FOR SELECT
USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    OR trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Members and trainers can create schedules
CREATE POLICY "Users can create trainer schedules"
ON trainer_schedules FOR INSERT
WITH CHECK (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    OR gym_id IN (
        SELECT gym_id FROM gym_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff', 'trainer')
    )
);

-- ============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================

-- Function to calculate monthly attendance for badges
CREATE OR REPLACE FUNCTION calculate_monthly_attendance(
    p_member_id UUID,
    p_month INTEGER,
    p_year INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    days_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT DATE(check_in))
    INTO days_count
    FROM attendance
    WHERE member_id = p_member_id
    AND EXTRACT(MONTH FROM check_in) = p_month
    AND EXTRACT(YEAR FROM check_in) = p_year;
    
    RETURN days_count;
END;
$$ LANGUAGE plpgsql;

-- Function to award badges automatically
CREATE OR REPLACE FUNCTION award_monthly_badges()
RETURNS void AS $$
DECLARE
    member_record RECORD;
    days_attended INTEGER;
    last_month INTEGER;
    last_year INTEGER;
BEGIN
    -- Get last month
    last_month := EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'));
    last_year := EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'));
    
    -- Loop through all active members
    FOR member_record IN 
        SELECT id, gym_id FROM members WHERE membership_status = 'active'
    LOOP
        days_attended := calculate_monthly_attendance(
            member_record.id, 
            last_month, 
            last_year
        );
        
        -- Award appropriate badge
        IF days_attended >= 26 THEN
            INSERT INTO member_badges (gym_id, member_id, badge_type, month, year, days_attended)
            VALUES (member_record.gym_id, member_record.id, 'gold', last_month, last_year, days_attended)
            ON CONFLICT (gym_id, member_id, badge_type, month, year) DO NOTHING;
        ELSIF days_attended >= 20 THEN
            INSERT INTO member_badges (gym_id, member_id, badge_type, month, year, days_attended)
            VALUES (member_record.gym_id, member_record.id, 'silver', last_month, last_year, days_attended)
            ON CONFLICT (gym_id, member_id, badge_type, month, year) DO NOTHING;
        ELSIF days_attended >= 10 THEN
            INSERT INTO member_badges (gym_id, member_id, badge_type, month, year, days_attended)
            VALUES (member_record.gym_id, member_record.id, 'bronze', last_month, last_year, days_attended)
            ON CONFLICT (gym_id, member_id, badge_type, month, year) DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check and expire memberships
CREATE OR REPLACE FUNCTION check_membership_expiry()
RETURNS void AS $$
BEGIN
    UPDATE members
    SET membership_status = 'expired'
    WHERE membership_status = 'active'
    AND membership_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Default Membership Plans)
-- ============================================
-- Note: This is just an example, actual plans will be created per gym
-- You can remove this section if you want to create plans manually

-- ============================================
-- END OF SCHEMA
-- ============================================

