#!/bin/bash

echo "🚀 Quick Setup for Client Onboarding Script"
echo "==========================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "   Install from: https://www.python.org/downloads/"
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check environment variables
echo ""
echo "🔍 Checking environment variables..."

if [ -z "$SUPABASE_URL" ]; then
    echo "⚠️  SUPABASE_URL not set"
    echo "   Export it: export SUPABASE_URL='https://your-project.supabase.co'"
    ENV_MISSING=1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set"
    echo "   Export it: export SUPABASE_SERVICE_ROLE_KEY='your-service-key'"
    ENV_MISSING=1
fi

if [ -z "$ENV_MISSING" ]; then
    echo "✓ Environment variables configured"
else
    echo ""
    echo "📋 To set environment variables:"
    echo "   export SUPABASE_URL='https://your-project.supabase.co'"
    echo "   export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    echo ""
    echo "Or create a .env file with:"
    echo "   SUPABASE_URL=https://your-project.supabase.co"
    echo "   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
fi

# Make script executable
chmod +x setup_client.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Set your environment variables (if not done)"
echo "   2. Run: python3 setup_client.py"
echo "   3. Follow the interactive prompts"
echo ""
echo "📚 For detailed guide, see: CLIENT-SETUP-GUIDE.md"
