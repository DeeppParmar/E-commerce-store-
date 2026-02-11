# E-Commerce Store - Complete Setup Guide

This guide walks you through setting up the entire project locally with the new backend API architecture.

## Architecture Overview

```
User Browser → Frontend (React/Vite) → Backend API (/api/*) → Supabase (Database + Auth)
```

## Prerequisites

- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Supabase Account** ([Sign up](https://supabase.com/))
- **Vercel Account** (optional, for deployment)

---

## Step 1: Clone Repository

```bash
git clone https://github.com/DeeppParmar/E-commerce-store-.git
cd E-commerce-store-
```

---

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [database.new](https://database.new)
2. Create a new project
3. Wait for the project to be ready

### 2.2 Run Database Migration

1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy the contents of `SUPABASE_MIGRATION.sql` from the root directory
3. Paste and run the SQL

This creates:
- `profiles` table (user information)
- `auctions` table (auction listings)
- `bids` table (bid history)
- `notifications` table (user notifications)
- `watchlist` table (saved auctions)
- Required functions and triggers

### 2.3 Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket named: `auctions`
3. Set it to **Public**

### 2.4 Get Your Credentials

Go to **Settings → API** and copy:
- `Project URL` (e.g., `https://wtgyhiozvnparkttjxby.supabase.co`)
- `anon public` key (starts with `eyJ...`)
- `service_role` key (starts with `eyJ...`) - **Keep this secret!**

---

## Step 3: Backend API Setup

### 3.1 Install Backend Dependencies

```bash
# From the root directory
npm install
```

This installs:
- `@supabase/supabase-js` - Supabase client
- `@vercel/node` - Vercel serverless functions
- TypeScript and types

### 3.2 Create Root Environment File (for local development)

Create `.env` in the **root directory**:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
```

**Replace** with your actual Supabase credentials.

---

## Step 4: Frontend Setup

### 4.1 Navigate to Frontend Directory

```bash
cd Frontend
```

### 4.2 Install Frontend Dependencies

```bash
npm install
```

### 4.3 Create Frontend Environment File

Create `.env` in the `Frontend` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_BASE_URL=/api
```

**Note:** Only use the `anon` key in the frontend, never the `service_role` key!

---

## Step 5: Running Locally

You have two options for local development:

### Option A: Using Vercel Dev (Recommended)

This runs both frontend and backend API together:

```bash
# From the root directory
npm run dev
```

This starts:
- Frontend at `http://localhost:3000`
- Backend API at `http://localhost:3000/api/*`

### Option B: Frontend Only

If you just want to run the frontend:

```bash
cd Frontend
npm run dev
```

Frontend runs at `http://localhost:5173`

**Note:** API calls will fail unless the backend is deployed or running via Vercel dev.

---

## Step 6: Testing the Application

1. Open your browser to `http://localhost:3000` (or `http://localhost:5173` if running frontend only)
2. Try to sign up/login:
   - Email: `test@example.com`
   - Password: `password123`
   - Full Name: `Test User`
3. Browse auctions page
4. Test authentication features

---

## Step 7: Deployment to Production

See `API_DEPLOYMENT.md` for detailed deployment instructions to Vercel.

### Quick Deploy Steps:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from root directory:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel Dashboard:**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_ANON_KEY`

4. **Deploy frontend separately:**
   ```bash
   cd Frontend
   vercel
   ```

---

## Project Structure

```
E-commerce-store-/
├── api/                          # Backend serverless functions
│   ├── auth/
│   │   ├── login.ts             # Login/signup endpoint
│   │   ├── logout.ts            # Logout endpoint
│   │   └── session.ts           # Get session endpoint
│   ├── auctions/
│   │   ├── index.ts             # List auctions
│   │   ├── [id].ts              # Get auction details
│   │   └── create.ts            # Create auction
│   ├── bids/
│   │   └── place.ts             # Place bid
│   └── profile/
│       └── me.ts                # Get user profile
├── Frontend/                     # React frontend
│   ├── src/
│   │   ├── lib/
│   │   │   └── api.ts           # API client
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   └── auth/                # Auth context
│   └── .env                     # Frontend environment variables
├── vercel.json                   # Vercel configuration
├── package.json                  # Backend dependencies
├── tsconfig.json                 # TypeScript config
├── SUPABASE_MIGRATION.sql        # Database schema
└── .env                          # Backend environment variables (local only)
```

---

## Common Issues

### Issue: "Cannot find module '@vercel/node'"

**Solution:** 
```bash
# Run from root directory
npm install
```

### Issue: "Failed to load resource: 400" errors in browser

**Solution:** Make sure you're using the API client (`apiClient`) in frontend code, not direct Supabase calls.

### Issue: Database trigger errors during signup

**Solution:** Make sure you ran the `SUPABASE_MIGRATION.sql` script completely in Supabase SQL Editor.

### Issue: CORS errors

**Solution:** The API endpoints have CORS configured. If you still see errors, make sure you're calling the API through `/api/*` routes.

---

## Environment Variables Reference

### Backend (.env in root)
| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key (admin access) | `eyJ...` |
| `SUPABASE_ANON_KEY` | Anonymous key (public access) | `eyJ...` |

### Frontend (.env in Frontend/)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anonymous key only | `eyJ...` |
| `VITE_API_BASE_URL` | API base path | `/api` |

---

## Next Steps

- ✅ Set up Supabase database
- ✅ Install dependencies
- ✅ Configure environment variables
- ✅ Run locally
- 📝 Deploy to production (see `API_DEPLOYMENT.md`)
- 🎨 Customize the UI
- 🔒 Implement additional security features

---

## Support

- **Documentation:** See `API_DEPLOYMENT.md` for deployment details
- **Database Schema:** See `SUPABASE_MIGRATION.sql`
- **Architecture:** See `implementation_plan.md` artifact

For issues, create a GitHub issue or check the Supabase documentation.
