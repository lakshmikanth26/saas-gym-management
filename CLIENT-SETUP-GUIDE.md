# 🚀 Client Setup Script Guide

Automated script to onboard new gym clients to your SaaS platform.

## 📋 What It Does

The `setup_client.py` script automates:
- ✅ Creates gym record in database
- ✅ Generates admin user account
- ✅ Links admin to gym with proper role
- ✅ Creates 4 default membership plans
- ✅ Validates slug availability
- ✅ Calculates subscription dates
- ✅ Provides secure password generation
- ✅ Beautiful colored terminal output

## 🔧 Setup

### 1. Install Python Dependencies

```bash
# Install required packages
pip install -r requirements.txt
```

Or install individually:
```bash
pip install requests python-dotenv
```

### 2. Set Environment Variables

Create a `.env` file or export these variables:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

**Where to find these:**
1. Go to Supabase Dashboard
2. Click "Project Settings" → "API"
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT**: The service_role key is different from the anon key!

### 3. Make Script Executable (Optional)

```bash
chmod +x setup_client.py
```

## 🎯 Usage

### Interactive Mode

Simply run the script:

```bash
python setup_client.py
```

Or if you made it executable:

```bash
./setup_client.py
```

### Sample Session

```
============================================================
         GYM MANAGEMENT SAAS - CLIENT SETUP
============================================================

ℹ Loading configuration...
✓ Connected to Supabase


============================================================
                STEP 1: GYM INFORMATION
============================================================

Enter gym name: Iron Fitness Center
Enter URL slug [iron-fitness-center]: 
Enter gym email: admin@ironfitness.com
Enter gym phone: 9876543210
Enter gym address: 123 Main Street, Mumbai


============================================================
                STEP 2: ADMIN ACCOUNT
============================================================

Enter admin name: John Doe
Enter admin email [admin@ironfitness.com]: 
Generate random password? (Y/n): Y
✓ Generated password: Xa9kL_mP2rT4vN8Q
⚠ IMPORTANT: Save this password securely!


============================================================
              STEP 3: SUBSCRIPTION PLAN
============================================================

Available plans:
  1. Monthly - ₹2,999
  2. Quarterly - ₹7,999
  3. Half Yearly - ₹14,999
  4. Yearly - ₹27,999
Select plan (1-4) [2]: 2


============================================================
          STEP 4: PAYMENT DETAILS (Optional)
============================================================

Enter Cashfree payment ID (optional): cf_123456789
Enter Cashfree order ID (optional): order_abc123


============================================================
                    CONFIRMATION
============================================================

Gym Name: Iron Fitness Center
Slug: iron-fitness-center
URL: https://yourdomain.com/iron-fitness-center
Admin Email: admin@ironfitness.com
Plan: quarterly
Duration: 90 days

Proceed with setup? (Y/n): Y


============================================================
              STEP 5: CREATING RECORDS
============================================================

ℹ Creating gym record...
✓ Gym created with ID: 550e8400-e29b-41d4-a716-446655440000
ℹ Creating admin user account...
✓ Admin user created: admin@ironfitness.com
ℹ Linking admin to gym...
✓ Admin linked to gym
ℹ Creating default membership plans...
  ✓ Monthly Plan - ₹1500
  ✓ Quarterly Plan - ₹4000
  ✓ Half Yearly Plan - ₹7500
  ✓ Yearly Plan - ₹14000


============================================================
                  SETUP COMPLETE!
============================================================

✓ Client setup successful!

Gym Details:
  • Name: Iron Fitness Center
  • ID: 550e8400-e29b-41d4-a716-446655440000
  • Slug: iron-fitness-center
  • URL: https://yourdomain.com/iron-fitness-center

Admin Credentials:
  • Email: admin@ironfitness.com
  • Password: Xa9kL_mP2rT4vN8Q
  • Login URL: https://yourdomain.com/iron-fitness-center/login

Subscription:
  • Plan: quarterly
  • Start: 2025-01-06
  • End: 2025-04-06

Membership Plans Created:
  • Monthly Plan - ₹1,500
  • Quarterly Plan - ₹4,000
  • Half Yearly Plan - ₹7,500
  • Yearly Plan - ₹14,000

⚠ IMPORTANT:
  • Save the admin credentials securely
  • Send login details to the gym owner
  • Test the login before sharing
```

## 🎨 Features

### Smart Defaults
- Auto-generates URL slug from gym name
- Uses gym email as admin email by default
- Suggests quarterly plan (most popular)
- Generates secure random passwords

### Input Validation
- Checks if slug already exists
- Validates email format
- Ensures password strength (min 8 characters)
- Confirms before creating records

### Error Handling
- Validates environment variables
- Handles database connection errors
- Provides clear error messages
- Graceful exit on Ctrl+C

### Colored Output
- ✓ Green for success
- ✗ Red for errors
- ℹ Blue for information
- ⚠ Yellow for warnings

## 📊 What Gets Created

### 1. Gym Record (`gyms` table)
```sql
- name: "Iron Fitness Center"
- slug: "iron-fitness-center"
- email: "admin@ironfitness.com"
- phone: "9876543210"
- address: "123 Main Street"
- plan_type: "quarterly"
- plan_start: "2025-01-06"
- plan_end: "2025-04-06"
- is_active: true
- cashfree_payment_id: "cf_123456789" (if provided)
- cashfree_order_id: "order_abc123" (if provided)
```

### 2. Admin User (Supabase Auth)
```sql
- email: "admin@ironfitness.com"
- password: "Xa9kL_mP2rT4vN8Q"
- email_confirmed: true
- user_metadata:
    - full_name: "John Doe"
    - gym_id: "550e8400..."
```

### 3. Gym Member Link (`gym_members` table)
```sql
- user_id: "user-uuid"
- gym_id: "gym-uuid"
- role: "admin"
```

### 4. Membership Plans (`membership_plans` table)
```sql
4 plans created:
- Monthly (30 days) - ₹1,500
- Quarterly (90 days) - ₹4,000
- Half Yearly (180 days) - ₹7,500
- Yearly (365 days) - ₹14,000
```

## 🔒 Security Best Practices

### Password Generation
- Uses `secrets.token_urlsafe()` for cryptographic strength
- Generates 16-character random passwords
- Option to use custom password if needed

### Service Role Key
- ⚠️ Never commit service role key to git
- ⚠️ Store in environment variables only
- ⚠️ Has full database access - keep secure

### Access Control
- Creates admin with proper role assignment
- Links through `gym_members` table
- RLS policies automatically enforce isolation

## 🐛 Troubleshooting

### "SUPABASE_URL not set"
```bash
# Set environment variable
export SUPABASE_URL="https://your-project.supabase.co"
```

Or create `.env` file:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### "Slug already exists"
The slug is already taken. Choose a different one or modify the gym name.

### "Database insert failed"
- Check your service role key is correct
- Verify database schema is deployed
- Check network connectivity
- Review RLS policies

### "User creation failed"
- Check email is valid and unique
- Verify password meets requirements
- Check Supabase auth is enabled

## 📝 Customization

### Modify Default Plans

Edit the `create_default_membership_plans()` function:

```python
plans = [
    {
        'gym_id': gym_id,
        'name': 'Custom Plan',
        'description': 'Your custom plan',
        'duration_days': 60,
        'price': 3000,
        'is_active': True
    },
    # ... more plans
]
```

### Change Plan Prices

Edit in the `plans` list in `create_default_membership_plans()`:

```python
'price': 2000,  # Change from 1500 to 2000
```

### Add Custom Fields

In the `gym_data` dictionary:

```python
gym_data = {
    # ... existing fields
    'custom_field': 'custom_value',
    'settings': json.dumps({'key': 'value'})
}
```

## 🚀 Advanced Usage

### Batch Setup (Coming Soon)

Create multiple gyms from CSV:

```bash
python setup_client.py --batch gyms.csv
```

### API Mode (Coming Soon)

Run as API endpoint:

```python
from setup_client import setup_gym_programmatically

result = setup_gym_programmatically({
    'gym_name': 'Test Gym',
    'email': 'test@gym.com',
    # ... other fields
})
```

### Integration with Payment Gateway

After successful Cashfree payment:

```python
# In your payment callback
payment_id = cashfree_response['payment_id']
order_id = cashfree_response['order_id']

# Run setup script with payment info
python setup_client.py \
    --gym-name "Iron Fitness" \
    --email "admin@iron.com" \
    --payment-id "$payment_id" \
    --order-id "$order_id"
```

## 📋 Checklist After Setup

- [ ] Save admin credentials securely
- [ ] Test login at `/{slug}/login`
- [ ] Verify all 4 membership plans created
- [ ] Check gym appears in database
- [ ] Send credentials to gym owner
- [ ] Verify subscription end date
- [ ] Test creating a member
- [ ] Test payment processing

## 🎓 Next Steps

After running the script:

1. **Test the Login**
   ```
   URL: http://localhost:5173/{slug}/login
   Email: [admin_email]
   Password: [generated_password]
   ```

2. **Verify in Supabase Dashboard**
   - Check `gyms` table
   - Check `gym_members` table
   - Check `membership_plans` table
   - Check Auth users

3. **Share with Client**
   - Send login URL
   - Send credentials securely
   - Provide onboarding guide
   - Schedule training call

## 💡 Pro Tips

1. **Save Output**: Copy the success output to a secure note
2. **Test First**: Run with test data before real clients
3. **Backup**: Keep record of all gyms created
4. **Monitor**: Check Supabase dashboard after each setup
5. **Secure**: Never share service role key

## 🆘 Support

If you encounter issues:

1. Check environment variables are set
2. Verify Supabase connection
3. Review database schema is deployed
4. Check script output for error messages
5. Review Supabase logs

---

**Happy onboarding! 🎉**

Your clients can start using the platform immediately after setup!

