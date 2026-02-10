# Backend API Deployment to Vercel

This guide explains how to deploy the backend API functions to Vercel.

## Prerequisites

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Have your Supabase credentials ready (from SUPABASE_SETUP.txt)

##Step 1: Configure Environment Variables

In the Vercel dashboard (or via CLI), set these environment variables:

```bash
SUPABASE_URL=https://wtgyhiozvnparkttjxby.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Z3loaW96dm5wYXJrdHRqeGJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5MTk2MCwiZXhwIjoyMDg2MjY3OTYwfQ.4VCH9PBIKo4zwZ8tFvXnTOBBeToo3YzLen6tNV89gLI
SUPABASE_ANON_KEY=sb_publishable_Hs93qOK7L_S-DYpjs2CTRQ_Dp8OXDBk
```

### Using Vercel CLI:

```bash
cd E-commerce-store-
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add SUPABASE_ANON_KEY
```

Paste the values when prompted. Choose "Production", "Preview", and "Development" for all.

## Step 2: Deploy to Vercel

```bash
# From the root directory
cd E-commerce-store-

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** Choose your account
- **Link to existing project?** N (if first time)
- **Project name?** e-commerce-store (or your preference)
- **Directory?** ./ (current directory)
- **Override settings?** N

## Step 3: Deploy Frontend

The frontend should be deployed from the `Frontend` directory:

```bash
cd Frontend

# Make sure you have a .env file with:
VITE_API_BASE_URL=/api

# Deploy to Vercel
vercel
```

## Step 4: Test the Deployment

Once deployed, test your endpoints:

```bash
# Get your deployment URL from Vercel
DEPLOYMENT_URL="your-deployment-url.vercel.app"

# Test auctions endpoint
curl https://$DEPLOYMENT_URL/api/auctions/index

# Test login endpoint
curl -X POST https://$DEPLOYMENT_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Architecture

```
User Browser
     ↓
Frontend (React SPA on Vercel)
     ↓
Vercel Rewrites (/api/*)
     ↓
Backend API (Vercel Serverless Functions in /api)
     ↓
Supabase (PostgreSQL + Auth)
```

## Important Notes

1. **Service Key Security**: The `SUPABASE_SERVICE_KEY` is ONLY used in backend functions, never exposed to the frontend.

2. **CORS**: The API endpoints have CORS configured to accept requests from any origin. For production, you should restrict this.

3. **Environment Variables**: Make sure all environment variables are set in both Development and Production environments in Vercel.

## Local Development

To run locally with the API:

```bash
# Install root dependencies (if not already done)
npm install

# Run Vercel dev server
vercel dev
```

This will start:
- API functions at `http://localhost:3000/api/...`
- Frontend (if configured) at `http://localhost:3000`

## Troubleshooting

### Error: "Cannot find module '@vercel/node'"
- Run `npm install` in the root directory
- Make sure `package.json` existsin the root with the correct dependencies

### Error: Environment variables not found
- Check that environment variables are set in Vercel dashboard
- Run `vercel env pull` to sync environment variables locally

### Error: 404 on API endpoints
- Check that `vercel.json` exists in the root directory
- Verify that API files are in the `/api` directory
- Redeploy with `vercel --prod`
