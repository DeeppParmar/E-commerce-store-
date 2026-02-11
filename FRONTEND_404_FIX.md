# Frontend 404 Fix - Step by Step

Your frontend is showing 404 because Vercel isn't configured correctly. Follow these exact steps:

## Option 1: Redeploy with Correct Settings (Recommended)

### Step 1: Delete and Reimport Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **bid-valut** project
3. Go to **Settings** → Scroll down to **"Delete Project"**
4. Delete the project
5. Click **"Add New..."** → **"Project"**
6. Import your GitHub repository again

### Step 2: Configure Deployment Settings

When importing, set these **EXACT** settings:

**Project Name:**
```
bid-valut
```

**Framework Preset:**
- Select: **Vite**

**Root Directory:**
- Click **"Edit"**
- Set to: **`Frontend`** (with capital F)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Step 3: Add Environment Variables

Before deploying, add these for **Production, Preview, AND Development**:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://wtgyhiozvnparkttjxby.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_Hs93qOK7L_S-DYpjs2CTRQ_Dp8OXDBk` |
| `VITE_API_BASE_URL` | `https://e-commerce-store-theta-ten.vercel.app` |

### Step 4: Deploy

Click **"Deploy"** and wait for it to finish.

---

## Option 2: Fix Existing Project Settings

If you don't want to delete and reimport:

### Step 1: Update Project Settings

1. Go to your **bid-valut** project in Vercel
2. Click **Settings**
3. Go to **General** section

### Step 2: Check Root Directory

Scroll to **Root Directory**:
- If it shows `./`, click **"Edit"**
- Change to: **`Frontend`**
- Click **"Save"**

### Step 3: Check Build & Development Settings

Scroll to **Build & Development Settings**:
- **Framework Preset**: Should be **Vite**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

If any are wrong, click **"Override"** and set them correctly.

### Step 4: Add Environment Variables

Go to **Settings** → **Environment Variables**

Add these for **all three environments** (Production, Preview, Development):

```
VITE_SUPABASE_URL=https://wtgyhiozvnparkttjxby.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Hs93qOK7L_S-DYpjs2CTRQ_Dp8OXDBk
VITE_API_BASE_URL=https://e-commerce-store-theta-ten.vercel.app
```

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

---

## Verification

After deployment completes, visit: https://bid-valut.vercel.app/

You should see:
- ✅ Homepage loads (not 404)
- ✅ Can click "Login" button
- ✅ Can navigate around

---

## Common Issues

### Issue: Still getting 404

**Solution:** Your Root Directory is probably wrong. Make sure it's set to `Frontend` (with capital F) exactly as it appears in your repository.

### Issue: "Cannot find package.json"

**Solution:** Root Directory is incorrect. Set it to `Frontend`.

### Issue: Build succeeds but still 404

**Solution:** 
1. Check that `Frontend/vercel.json` exists with SPA rewrite rules
2. Make sure Output Directory is `dist` (not `Frontend/dist`)

---

## Need Help?

If still not working, share:
1. Screenshot of Vercel Project Settings → General (Root Directory section)
2. Screenshot of Build & Development Settings
3. Screenshot of deployment logs (especially the build output)
