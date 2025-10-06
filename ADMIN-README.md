# 🎯 Admin Guide - Client Onboarding

Quick reference for onboarding new gym clients to your SaaS platform.

## 🚀 Quick Start

```bash
# 1. One-time setup
./quick_setup.sh

# 2. Set credentials (get from Supabase Dashboard)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# 3. Onboard a client
python3 setup_client.py
```

## 📋 Files Overview

| File | Purpose |
|------|---------|
| `setup_client.py` | Main setup script |
| `requirements.txt` | Python dependencies |
| `quick_setup.sh` | One-time installation script |
| `CLIENT-SETUP-GUIDE.md` | Detailed documentation |

## 🎯 Typical Workflow

### When a New Gym Pays

1. **Receive Payment**
   - Customer completes Cashfree payment
   - You receive payment confirmation
   - Note the payment ID and order ID

2. **Run Setup Script**
   ```bash
   python3 setup_client.py
   ```

3. **Enter Details**
   - Gym name (e.g., "Iron Fitness Center")
   - Contact info (email, phone, address)
   - Admin credentials
   - Plan type (based on payment)
   - Payment IDs (optional but recommended)

4. **Save Output**
   - Copy the complete output
   - Save admin credentials securely
   - Store in your client management system

5. **Share with Client**
   - Send login URL: `https://yourdomain.com/{slug}/login`
   - Send email and password securely
   - Provide onboarding guide
   - Schedule demo/training call

## 🔑 Getting Your Credentials

### Supabase URL & Service Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → This is your `SUPABASE_URL`
   - **service_role key** → This is your `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **NEVER** share the service_role key publicly!

## 📊 What Happens During Setup

```mermaid
1. Validate slug availability
2. Create gym record in database
3. Create admin user in Supabase Auth
4. Link admin to gym (gym_members table)
5. Create 4 default membership plans
6. Return success with credentials
```

## 🎨 Example Output

```
✓ Client setup successful!

Gym Details:
  • Name: Iron Fitness Center
  • URL: https://yourdomain.com/iron-fitness-center

Admin Credentials:
  • Email: admin@ironfitness.com
  • Password: Xa9kL_mP2rT4vN8Q
  • Login URL: https://yourdomain.com/iron-fitness-center/login

Subscription:
  • Plan: quarterly
  • Duration: 90 days

⚠ IMPORTANT: Save credentials and share securely with client
```

## 🔧 Troubleshooting

### Script Fails

**Check:**
1. Environment variables set correctly
2. Supabase connection working
3. Database schema deployed
4. Python dependencies installed

### Slug Already Exists

- Use different gym name
- Or manually specify unique slug
- Check database for existing gyms

### User Creation Fails

- Email might already exist
- Check Supabase Auth is enabled
- Verify email format

## 📝 Manual Cleanup (If Needed)

If setup fails halfway:

```sql
-- In Supabase SQL Editor

-- 1. Find the gym
SELECT * FROM gyms WHERE slug = 'gym-slug';

-- 2. Delete gym (cascades to related records)
DELETE FROM gyms WHERE slug = 'gym-slug';

-- 3. Delete auth user if created
-- Go to Authentication → Users → Delete manually
```

## 🔒 Security Checklist

- [ ] Service role key stored securely
- [ ] Not committed to git
- [ ] Only accessible to authorized admins
- [ ] Admin passwords shared securely (not via email)
- [ ] Client credentials documented in secure system

## 📞 Client Communication Template

```
Subject: Your Gym Management Platform is Ready!

Hi [Client Name],

Your gym management platform is now set up and ready to use!

Login Details:
━━━━━━━━━━━━━
URL: https://yourdomain.com/[slug]
Email: [admin_email]
Password: [password]

Getting Started:
━━━━━━━━━━━━━
1. Visit the URL above
2. Login with your credentials
3. Explore the dashboard
4. Start adding members!

Features Available:
━━━━━━━━━━━━━
✓ Member management with QR codes
✓ Attendance tracking
✓ Payment processing
✓ Membership plans
✓ Trainer management
✓ Analytics dashboard

Need Help?
━━━━━━━━━━━━━
• Documentation: [link]
• Support: [email]
• Call: [phone]

Welcome aboard!
[Your Name]
```

## 🎓 Training Checklist

Items to cover with new clients:

- [ ] Dashboard overview
- [ ] Adding first member
- [ ] QR code generation
- [ ] Processing payments
- [ ] Viewing analytics
- [ ] Managing trainers/staff
- [ ] Membership plans
- [ ] Profile settings

## 📊 Tracking Clients

Keep a spreadsheet:

| Gym Name | Slug | Admin Email | Plan | Start Date | End Date | Status |
|----------|------|-------------|------|------------|----------|--------|
| Iron Fitness | iron-fitness | admin@iron.com | Quarterly | 2025-01-06 | 2025-04-06 | Active |

## 🔄 Renewal Process

Before plan expires:

1. **30 Days Before**: Send renewal reminder
2. **15 Days Before**: Follow-up email
3. **7 Days Before**: Final reminder
4. **On Expiry**: Deactivate gym (set `is_active = false`)
5. **After Payment**: Reactivate and extend dates

## 💡 Pro Tips

1. **Test First**: Always test with dummy gym before real clients
2. **Document Everything**: Keep records of all gyms created
3. **Automate Reminders**: Set up calendar alerts for renewals
4. **Backup Credentials**: Store securely in password manager
5. **Monitor Usage**: Check analytics to ensure client engagement

## 📈 Scaling Tips

As you grow:

1. **Batch Onboarding**: Process multiple gyms at once
2. **API Integration**: Integrate with payment gateway callbacks
3. **Self-Service**: Let clients register themselves
4. **Automated Emails**: Welcome emails, guides, reminders
5. **Dashboard**: Build admin dashboard to manage all gyms

## 🎉 Success Metrics

Track these per gym:

- Member count
- Monthly active users
- Revenue generated
- Retention rate
- Support tickets
- Feature usage

## 📚 Additional Resources

- **Setup Script**: `setup_client.py`
- **Detailed Guide**: `CLIENT-SETUP-GUIDE.md`
- **App Docs**: `README.md`
- **Deployment**: `DEPLOYMENT.md`
- **Cashfree**: `CASHFREE-INTEGRATION.md`

---

## 🆘 Need Help?

If you encounter issues:

1. Check `CLIENT-SETUP-GUIDE.md` for detailed docs
2. Review Supabase dashboard logs
3. Test database connection
4. Verify environment variables
5. Check Python dependencies

---

**Happy onboarding! 🚀**

Every new gym is a step toward building an amazing SaaS business!

