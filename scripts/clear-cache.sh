#!/bin/bash

echo "🧹 Clearing Next.js and TypeScript caches..."

# Remove Next.js build cache
if [ -d ".next" ]; then
  echo "Removing .next directory..."
  rm -rf .next
fi

# Remove node_modules cache
if [ -d "node_modules/.cache" ]; then
  echo "Removing node_modules/.cache..."
  rm -rf node_modules/.cache
fi

# Remove TypeScript build info
if [ -f "tsconfig.tsbuildinfo" ]; then
  echo "Removing tsconfig.tsbuildinfo..."
  rm -f tsconfig.tsbuildinfo
fi

# Remove .next/cache/.tsbuildinfo if it exists
if [ -f ".next/cache/.tsbuildinfo" ]; then
  echo "Removing .next/cache/.tsbuildinfo..."
  rm -f .next/cache/.tsbuildinfo
fi

echo "✅ Cache cleared successfully!"
echo ""
echo "You can now run 'pnpm dev' for a fresh start."