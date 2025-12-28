#!/bin/bash
set -e

echo "🚀 Starting Deployment..."

# Go to project dir
cd /var/www/dlas

# Pull latest code
echo "📦 Pulling latest code..."
git pull origin main

# Install dependencies if any
echo "📥 Installing dependencies..."
yarn install

# Generate and Migrate Prisma
echo "🗄️ Database setup..."
npx prisma generate
npx prisma migrate deploy

# Build Nuxt
echo "🏗️ Building application..."
yarn build

# Reload PM2 (Zero Downtime)
echo "🔄 Reloading PM2..."
pm2 reload dlas-smart-tour --update-env

echo "✅ Deployment Completed Successfully!"
