#!/bin/bash

echo "🚀 Deploying Cashfree Payment Functions to Supabase"
echo "=================================================="
echo ""

# Check if logged in
echo "📋 Step 1: Login to Supabase"
echo "----------------------------"
supabase login

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please try again."
    exit 1
fi

echo ""
echo "📋 Step 2: Link to your project"
echo "--------------------------------"
echo "Find your project ref at: https://app.supabase.com"
echo "(Settings → General → Reference ID)"
echo ""
read -p "Enter your project ref: " PROJECT_REF

supabase link --project-ref "$PROJECT_REF"

if [ $? -ne 0 ]; then
    echo "❌ Project linking failed."
    exit 1
fi

echo ""
echo "📋 Step 3: Deploy Edge Functions"
echo "--------------------------------"

echo "Deploying create-cashfree-order..."
supabase functions deploy create-cashfree-order

echo ""
echo "Deploying verify-cashfree-payment..."
supabase functions deploy verify-cashfree-payment

echo ""
echo "Deploying get-cashfree-payment-status..."
supabase functions deploy get-cashfree-payment-status

echo ""
echo "Deploying generate-invoice..."
supabase functions deploy generate-invoice

echo ""
echo "Deploying send-notification..."
supabase functions deploy send-notification

echo ""
echo "📋 Step 4: Set Function Secrets"
echo "--------------------------------"
echo ""
echo "Setting Cashfree credentials..."

supabase secrets set CASHFREE_APP_ID="TEST430329ae80e0f32e41a393d78b923034"
supabase secrets set CASHFREE_SECRET_KEY="TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
supabase secrets set CASHFREE_API_URL="https://sandbox.cashfree.com/pg"

echo ""
read -p "Enter your SUPABASE_URL: " SUPABASE_URL
supabase secrets set SUPABASE_URL="$SUPABASE_URL"

echo ""
echo "Go to Supabase Dashboard → Settings → API"
echo "Copy the 'service_role' key (secret)"
read -p "Enter your SUPABASE_SERVICE_ROLE_KEY: " SERVICE_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_KEY"

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "Your functions are now live at:"
echo "https://$PROJECT_REF.supabase.co/functions/v1/create-cashfree-order"
echo "https://$PROJECT_REF.supabase.co/functions/v1/verify-cashfree-payment"
echo ""
echo "🎉 Payment processing should now work!"
echo ""
echo "Test it:"
echo "1. Go to your app registration page"
echo "2. Fill in details"
echo "3. Click 'Proceed to Payment'"
echo "4. Use test card: 4111 1111 1111 1111"
echo ""

