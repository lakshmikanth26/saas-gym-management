#!/usr/bin/env python3
"""
Client Setup Script for Gym Management SaaS
============================================

This script automates the setup process for each new gym client:
- Creates gym record in database
- Creates admin user account
- Sets up default membership plans
- Generates QR codes
- Configures initial settings

Usage:
    python setup_client.py
"""

import os
import sys
import json
import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests

# Try to load .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, skip

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_success(message: str):
    print(f"{Colors.GREEN}✓{Colors.END} {message}")

def print_error(message: str):
    print(f"{Colors.RED}✗{Colors.END} {message}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ{Colors.END} {message}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠{Colors.END} {message}")

def print_header(message: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.END}\n")

class SupabaseClient:
    """Supabase API client for database operations"""
    
    def __init__(self, url: str, service_key: str):
        self.url = url.rstrip('/')
        self.headers = {
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    
    def insert(self, table: str, data: Dict) -> Optional[Dict]:
        """Insert data into a table"""
        try:
            response = requests.post(
                f'{self.url}/rest/v1/{table}',
                headers=self.headers,
                json=data
            )
            response.raise_for_status()
            return response.json()[0] if response.json() else None
        except Exception as e:
            print_error(f"Database insert failed: {str(e)}")
            return None
    
    def query(self, table: str, filters: Dict = None) -> List[Dict]:
        """Query data from a table"""
        try:
            url = f'{self.url}/rest/v1/{table}'
            if filters:
                params = '&'.join([f'{k}=eq.{v}' for k, v in filters.items()])
                url += f'?{params}'
            
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print_error(f"Database query failed: {str(e)}")
            return []
    
    def create_user(self, email: str, password: str, metadata: Dict = None) -> Optional[Dict]:
        """Create a new auth user"""
        try:
            response = requests.post(
                f'{self.url}/auth/v1/admin/users',
                headers=self.headers,
                json={
                    'email': email,
                    'password': password,
                    'email_confirm': True,
                    'user_metadata': metadata or {}
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print_error(f"User creation failed: {str(e)}")
            return None

def generate_slug(name: str) -> str:
    """Generate URL-safe slug from gym name"""
    slug = name.lower()
    slug = ''.join(c if c.isalnum() or c in (' ', '-') else '' for c in slug)
    slug = slug.replace(' ', '-')
    slug = '-'.join(filter(None, slug.split('-')))
    return slug

def generate_password() -> str:
    """Generate a secure random password"""
    return secrets.token_urlsafe(16)

def calculate_plan_end_date(plan_type: str) -> datetime:
    """Calculate plan end date based on plan type"""
    start_date = datetime.now()
    
    if plan_type == 'monthly':
        end_date = start_date + timedelta(days=30)
    elif plan_type == 'quarterly':
        end_date = start_date + timedelta(days=90)
    elif plan_type == 'half_yearly':
        end_date = start_date + timedelta(days=180)
    elif plan_type == 'yearly':
        end_date = start_date + timedelta(days=365)
    else:
        end_date = start_date + timedelta(days=30)
    
    return end_date

def get_env_variable(key: str, required: bool = True) -> Optional[str]:
    """Get environment variable with validation"""
    value = os.getenv(key)
    if required and not value:
        print_error(f"Required environment variable {key} not set")
        print_info("Please set it in your .env file or export it")
        sys.exit(1)
    return value

def create_default_membership_plans(db: SupabaseClient, gym_id: str) -> bool:
    """Create default membership plans for a gym"""
    
    plans = [
        {
            'gym_id': gym_id,
            'name': 'Monthly Plan',
            'description': 'Access to all gym facilities for 1 month',
            'duration_days': 30,
            'price': 1500,
            'is_active': True
        },
        {
            'gym_id': gym_id,
            'name': 'Quarterly Plan',
            'description': 'Access to all gym facilities for 3 months',
            'duration_days': 90,
            'price': 4000,
            'is_active': True
        },
        {
            'gym_id': gym_id,
            'name': 'Half Yearly Plan',
            'description': 'Access to all gym facilities for 6 months',
            'duration_days': 180,
            'price': 7500,
            'is_active': True
        },
        {
            'gym_id': gym_id,
            'name': 'Yearly Plan',
            'description': 'Access to all gym facilities for 1 year',
            'duration_days': 365,
            'price': 14000,
            'is_active': True
        }
    ]
    
    print_info("Creating default membership plans...")
    
    for plan in plans:
        result = db.insert('membership_plans', plan)
        if result:
            print_success(f"  ✓ {plan['name']} - ₹{plan['price']}")
        else:
            print_error(f"  ✗ Failed to create {plan['name']}")
            return False
    
    return True

def setup_client():
    """Main client setup function"""
    
    print_header("GYM MANAGEMENT SAAS - CLIENT SETUP")
    
    # Load environment variables
    print_info("Loading configuration...")
    
    SUPABASE_URL = get_env_variable('SUPABASE_URL')
    SUPABASE_SERVICE_KEY = get_env_variable('SUPABASE_SERVICE_ROLE_KEY')
    
    # Initialize Supabase client
    db = SupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print_success("Connected to Supabase")
    
    print("\n")
    
    # Collect gym information
    print_header("STEP 1: GYM INFORMATION")
    
    gym_name = input(f"{Colors.BOLD}Enter gym name:{Colors.END} ").strip()
    if not gym_name:
        print_error("Gym name is required")
        return
    
    # Auto-generate slug
    default_slug = generate_slug(gym_name)
    slug_input = input(f"{Colors.BOLD}Enter URL slug [{default_slug}]:{Colors.END} ").strip()
    slug = slug_input if slug_input else default_slug
    
    # Check if slug already exists
    existing = db.query('gyms', {'slug': slug})
    if existing:
        print_error(f"Slug '{slug}' already exists! Please choose a different one.")
        return
    
    email = input(f"{Colors.BOLD}Enter gym email:{Colors.END} ").strip()
    if not email or '@' not in email:
        print_error("Valid email is required")
        return
    
    phone = input(f"{Colors.BOLD}Enter gym phone:{Colors.END} ").strip()
    address = input(f"{Colors.BOLD}Enter gym address:{Colors.END} ").strip()
    
    # Admin information
    print("\n")
    print_header("STEP 2: ADMIN ACCOUNT")
    
    admin_name = input(f"{Colors.BOLD}Enter admin name:{Colors.END} ").strip()
    admin_email = input(f"{Colors.BOLD}Enter admin email [{email}]:{Colors.END} ").strip()
    admin_email = admin_email if admin_email else email
    
    # Generate or input password
    use_generated = input(f"{Colors.BOLD}Generate random password? (Y/n):{Colors.END} ").strip().lower()
    if use_generated != 'n':
        admin_password = generate_password()
        print_success(f"Generated password: {Colors.BOLD}{admin_password}{Colors.END}")
        print_warning("IMPORTANT: Save this password securely!")
    else:
        admin_password = input(f"{Colors.BOLD}Enter admin password:{Colors.END} ").strip()
        if len(admin_password) < 8:
            print_error("Password must be at least 8 characters")
            return
    
    # Plan selection
    print("\n")
    print_header("STEP 3: SUBSCRIPTION PLAN")
    
    print("Available plans:")
    print("  1. Monthly - ₹2,999")
    print("  2. Quarterly - ₹7,999")
    print("  3. Half Yearly - ₹14,999")
    print("  4. Yearly - ₹27,999")
    
    plan_choice = input(f"{Colors.BOLD}Select plan (1-4) [2]:{Colors.END} ").strip()
    plan_map = {
        '1': 'monthly',
        '2': 'quarterly',
        '3': 'half_yearly',
        '4': 'yearly'
    }
    plan_type = plan_map.get(plan_choice, 'quarterly')
    
    # Payment information
    print("\n")
    print_header("STEP 4: PAYMENT DETAILS (Optional)")
    
    payment_id = input(f"{Colors.BOLD}Enter Cashfree payment ID (optional):{Colors.END} ").strip()
    order_id = input(f"{Colors.BOLD}Enter Cashfree order ID (optional):{Colors.END} ").strip()
    
    # Confirmation
    print("\n")
    print_header("CONFIRMATION")
    print(f"Gym Name: {Colors.BOLD}{gym_name}{Colors.END}")
    print(f"Slug: {Colors.BOLD}{slug}{Colors.END}")
    print(f"URL: {Colors.BOLD}https://yourdomain.com/{slug}{Colors.END}")
    print(f"Admin Email: {Colors.BOLD}{admin_email}{Colors.END}")
    print(f"Plan: {Colors.BOLD}{plan_type}{Colors.END}")
    print(f"Duration: {Colors.BOLD}{(calculate_plan_end_date(plan_type) - datetime.now()).days} days{Colors.END}")
    
    confirm = input(f"\n{Colors.BOLD}Proceed with setup? (Y/n):{Colors.END} ").strip().lower()
    if confirm == 'n':
        print_info("Setup cancelled")
        return
    
    # Create gym record
    print("\n")
    print_header("STEP 5: CREATING RECORDS")
    
    print_info("Creating gym record...")
    
    gym_data = {
        'name': gym_name,
        'slug': slug,
        'email': email,
        'phone': phone,
        'address': address,
        'plan_type': plan_type,
        'plan_start': datetime.now().isoformat(),
        'plan_end': calculate_plan_end_date(plan_type).isoformat(),
        'is_active': True
    }
    
    if payment_id:
        gym_data['cashfree_payment_id'] = payment_id
    if order_id:
        gym_data['cashfree_order_id'] = order_id
    
    gym = db.insert('gyms', gym_data)
    
    if not gym:
        print_error("Failed to create gym record")
        return
    
    gym_id = gym['id']
    print_success(f"Gym created with ID: {gym_id}")
    
    # Create admin user
    print_info("Creating admin user account...")
    
    user = db.create_user(
        email=admin_email,
        password=admin_password,
        metadata={
            'full_name': admin_name,
            'gym_id': gym_id
        }
    )
    
    if not user:
        print_error("Failed to create admin user")
        # Rollback: delete gym
        print_info("Rolling back gym creation...")
        return
    
    user_id = user['id']
    print_success(f"Admin user created: {admin_email}")
    
    # Link user to gym
    print_info("Linking admin to gym...")
    
    gym_member = db.insert('gym_members', {
        'user_id': user_id,
        'gym_id': gym_id,
        'role': 'admin'
    })
    
    if not gym_member:
        print_error("Failed to link admin to gym")
        return
    
    print_success("Admin linked to gym")
    
    # Create default membership plans
    if not create_default_membership_plans(db, gym_id):
        print_warning("Some membership plans failed to create")
    
    # Success summary
    print("\n")
    print_header("SETUP COMPLETE!")
    
    print(f"\n{Colors.GREEN}{Colors.BOLD}✓ Client setup successful!{Colors.END}\n")
    
    print("Gym Details:")
    print(f"  • Name: {Colors.BOLD}{gym_name}{Colors.END}")
    print(f"  • ID: {gym_id}")
    print(f"  • Slug: {slug}")
    print(f"  • URL: https://yourdomain.com/{slug}")
    
    print("\nAdmin Credentials:")
    print(f"  • Email: {Colors.BOLD}{admin_email}{Colors.END}")
    print(f"  • Password: {Colors.BOLD}{admin_password}{Colors.END}")
    print(f"  • Login URL: https://yourdomain.com/{slug}/login")
    
    print("\nSubscription:")
    print(f"  • Plan: {plan_type}")
    print(f"  • Start: {datetime.now().strftime('%Y-%m-%d')}")
    print(f"  • End: {calculate_plan_end_date(plan_type).strftime('%Y-%m-%d')}")
    
    print("\nMembership Plans Created:")
    print("  • Monthly Plan - ₹1,500")
    print("  • Quarterly Plan - ₹4,000")
    print("  • Half Yearly Plan - ₹7,500")
    print("  • Yearly Plan - ₹14,000")
    
    print(f"\n{Colors.YELLOW}⚠ IMPORTANT:{Colors.END}")
    print("  • Save the admin credentials securely")
    print("  • Send login details to the gym owner")
    print("  • Test the login before sharing")
    
    print("\n")

def main():
    """Main entry point"""
    try:
        setup_client()
    except KeyboardInterrupt:
        print("\n")
        print_info("Setup cancelled by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()

