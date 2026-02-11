# Frontend Deployment Fix - 404 Error

Your frontend is showing a 404 error. Here's how to fix it:

## Issue
The frontend isn't loading because environment variables aren't set in Vercel.

## Solution

### Step 1: Add Environment Variables to Frontend Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **bid-valut** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **Production**, **Preview**, AND **Development**:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://wtgyhiozvnparkttjxby.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_Hs93qOK7L_S-DYpjs2CTRQ_Dp8OXDBk` |
| `VITE_API_BASE_URL` | `https://e-commerce-store-theta-ten.vercel.app` |

### Step 2: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 3: Test

Visit: https://bid-valut.vercel.app/

Expected results:
- ✅ Homepage loads
- ✅ Can navigate to /login
- ✅ Can login/register
- ✅ Auctions page works

---

## Architecture Overview

```
User Browser
     ↓
Frontend: https://bid-valut.vercel.app
     ↓
Backend: https://e-commerce-store-theta-ten.vercel.app/api/*
     ↓
Supabase Database
```

---

## If 404 Persists

Check these in Vercel project settings:

### Build Settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Root Directory:
- Should be `./` (if deploying from Frontend folder)
- Or set to `Frontend` if deploying from root

---

## Testing API Connection

Once frontend loads, open browser console (F12) and check:

1. Go to **Network** tab
2. Try to login
3. Should see request to: `https://e-commerce-store-theta-ten.vercel.app/api/auth/login`
4. Should return 200 OK with user data

If API calls fail:
- Check backend environment variables are set
- Test backend directly: https://e-commerce-store-theta-ten.vercel.app/api/auctions/index

---

## Summary

✅ **Backend deployed**: https://e-commerce-store-theta-ten.vercel.app  
✅ **Frontend deployed**: https://bid-valut.vercel.app  
✅ **Environment variables set** in both projects  
✅ **SPA routing configured** in Frontend/vercel.json  

After redeploying with env vars, everything should work! 🚀
