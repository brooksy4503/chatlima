#!/bin/bash

# Token Metrics Backfill Script
# Recovers missing analytics data from billing records

echo "🚀 Starting ChatLima Token Metrics Backfill Process"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the ChatLima project root directory"
    exit 1
fi

# Check if the backfill script exists
if [ ! -f "scripts/backfill-token-metrics.ts" ]; then
    echo "❌ Error: Backfill script not found at scripts/backfill-token-metrics.ts"
    exit 1
fi

echo "📋 Pre-flight Checks:"
echo "   ✅ Project directory confirmed"
echo "   ✅ Backfill script found"
echo ""

# Warning and confirmation
echo "⚠️  WARNING: This script will:"
echo "   • Analyze 4,000+ missing analytics records"
echo "   • Create synthetic token usage metrics from billing data"
echo "   • Add 'backfilled: true' metadata to distinguish recovered data"
echo "   • Take approximately 5-10 minutes to complete"
echo ""

read -p "Do you want to proceed with the backfill? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Backfill cancelled by user"
    exit 0
fi

echo ""
echo "🔄 Starting backfill process..."
echo "   Database: Neon (branch: br-cool-bonus-a4rhluli)"
echo "   Estimated duration: 5-10 minutes"
echo ""

# Run the TypeScript script using tsx
if command -v tsx &> /dev/null; then
    tsx scripts/backfill-token-metrics.ts
elif command -v ts-node &> /dev/null; then
    ts-node scripts/backfill-token-metrics.ts
else
    # Fallback to tsc + node
    echo "📦 Compiling TypeScript..."
    npx tsc scripts/backfill-token-metrics.ts --target es2020 --module commonjs --moduleResolution node --esModuleInterop --outDir ./dist
    node dist/scripts/backfill-token-metrics.js
    rm -rf dist/scripts
fi

echo ""
echo "✅ Backfill process completed!"
echo ""
echo "📊 Next Steps:"
echo "   1. Check the logging health dashboard: /admin (if available)"
echo "   2. Monitor for any new discrepancies going forward"
echo "   3. Run 'npm run build' to ensure the fix is working in production"
echo ""
echo "🔍 To verify the fix worked:"
echo "   • Analytics records should now be close to billing record count"
echo "   • New chat completions should log to both systems independently"
echo "   • Missing data will have 'backfilled: true' in metadata"
echo ""