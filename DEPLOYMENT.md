# Production Deployment Guide

## Vercel Deployment

### Quick Fix for Build Errors

**✅ FIXED: "vite: command not found" Error**

- Moved build dependencies (`vite`, `esbuild`, `typescript`, etc.) to main `dependencies`
- Updated Vercel install command to include dev dependencies
- Removed conflicting root `index.js` file

**If you're still getting npm E401 errors, try these additional steps:**

1. **In Vercel Dashboard → Project Settings → Environment Variables:**

   - Add `NPM_CONFIG_REGISTRY=https://registry.npmjs.org/`
   - Add `NODE_AUTH_TOKEN=""` (empty string)

2. **In Vercel Dashboard → Project Settings → Git:**

   - Ensure "Include source files outside of the Root Directory" is **disabled**
   - Set Root Directory to `./` (current directory)

3. **Force redeploy:**

   - Go to Vercel dashboard → Deployments
   - Click the three dots on latest deployment → Redeploy

4. **Alternative: Delete and re-import project**
   - If error persists, delete project in Vercel
   - Re-import from GitHub (forces fresh npm install)

The npm authentication error should be fixed with:

- ✅ `.npmrc` file added with public registry configuration
- ✅ `vercel.json` configuration for proper build process
- ✅ Updated package.json with Vercel-specific scripts

### Vercel Environment Variables

Set these in your Vercel dashboard (already configured):

- `DATABASE_URL`: Your Supabase connection string
- `NODE_ENV`: production
- `SESSION_SECRET`: Secure random string
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `TWILIO_WHATSAPP_NUMBER`: Your WhatsApp number

## Pre-Deployment Checklist

### 1. Environment Configuration

- [x] Vercel environment variables configured (from your screenshot)
- [ ] Verify `DATABASE_URL` points to production Supabase database
- [ ] Ensure `TWILIO_AUTH_TOKEN` is production token (not sandbox)
- [ ] Test database connectivity

### 2. Database Setup

- [ ] Ensure Supabase production database is created
- [ ] Run database migrations: `npm run db:push`
- [ ] Create initial admin account (see below)

### 3. Security

- [x] `.env` files are in `.gitignore`
- [x] `.npmrc` configured for Vercel deployment
- [x] `vercel.json` configured for proper routing
- [ ] Test Twilio WhatsApp integration

## Creating Production Admin Account

After deploying, create an admin account:

```bash
# Create a temporary script (don't commit this)
cat > create-production-admin.js << 'EOF'
import { config } from 'dotenv';
config({ path: '.env.production' });

import { storage } from './server/storage.js';

async function createAdmin() {
  try {
    const admin = await storage.createAdminWithPassword(
      'your-admin-email@example.com',
      'Your Name',
      'your-secure-password'
    );
    console.log('Production admin created:', admin);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

createAdmin();
EOF

# Run the script
NODE_ENV=production npx tsx create-production-admin.js

# Remove the script immediately
rm create-production-admin.js
```

## Deployment Commands

```bash
# Build the application
npm run build

# Start production server
npm start

# Or with specific environment file
NODE_ENV=production npm start
```

## Environment Files Structure

- `.env` - Local development (ignored by git)
- `.env.production` - Production configuration (ignored by git)
- `.env.production.template` - Template for new deployments (safe to commit)

## Security Notes

1. **Never commit actual `.env.production` with real credentials**
2. **Always use environment variables in production hosting platforms**
3. **Regularly rotate your SESSION_SECRET and database passwords**
4. **Use different Twilio credentials for development and production**
