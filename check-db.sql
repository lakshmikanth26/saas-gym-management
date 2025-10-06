-- Check if all required tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('gyms', 'gym_members', 'membership_plans', 'members', 'payments') THEN '✅'
        ELSE '❌'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('gyms', 'gym_members', 'membership_plans', 'members', 'payments', 'attendance', 'staff', 'trainers', 'notifications')
ORDER BY table_name;

-- Check gyms table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gyms' 
AND column_name IN ('cashfree_payment_id', 'cashfree_order_id')
ORDER BY column_name;

