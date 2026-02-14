# Supabase Authentication Setup for Your Deployment

## Your URLs:
- **Frontend:** `https://bid-valut.vercel.app`
- **Backend:** `https://e-commerce-store-theta-ten.vercel.app`

## Step 1: Configure Supabase Redirect URLs

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **wtgyhiozvnparkttjxby**
3. Go to **Authentication** → **URL Configuration**

### Set These URLs:

**Site URL:**
```
https://bid-valut.vercel.app
```
(You already have this set correctly ✅)

**Redirect URLs** - Click "Add URL" for each:
```
https://bid-valut.vercel.app/**
https://bid-valut.vercel.app/auth/callback
http://localhost:5173/**
http://localhost:5173/auth/callback
http://localhost:3000/**
```

The `**` wildcard allows all paths under your domain.

## Step 2: Add Test Auction Data

Your auctions table is empty. Let's add some test data:

1. Go to **Table Editor** → **auctions**
2. Click **"Insert row"** or run this SQL in **SQL Editor**:

```sql
-- First, create a test user profile (you might already have one from login attempts)
-- Check your profiles table first

-- Add test auctions
INSERT INTO auctions (seller_id, title, description, starting_price, current_price, end_time, status, images)
VALUES 
  (
    (SELECT id FROM profiles LIMIT 1), -- Uses first user as seller
    'Vintage Camera',
    'Rare vintage camera from the 1960s in excellent condition',
    50.00,
    50.00,
    NOW() + INTERVAL '7 days',
    'active',
    ARRAY['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800']
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'Designer Watch',
    'Luxury designer watch, barely used',
    200.00,
    200.00,
    NOW() + INTERVAL '5 days',
    'active',
    ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800']
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'Gaming Console',
    'Latest generation gaming console with controller',
    300.00,
    300.00,
    NOW() + INTERVAL '3 days',
    'active',
    ARRAY['https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800']
  );
```

## Step 3: Click "Save changes" in Supabase

After adding the redirect URLs, click **"Save changes"** at the bottom.

## Step 4: Test Your Frontend

Now visit: **https://bid-valut.vercel.app/**

You should see:
- ✅ Homepage loads (no 404)
- ✅ Can click "Auctions" and see the 3 test auctions
- ✅ Can click "Login" and register/login
- ✅ After login, redirects back to your site

## Troubleshooting

### If still 404:
The issue is with Vercel deployment settings. In Vercel:
1. Go to bid-valut project → **Settings** → **General**
2. Verify **Root Directory** says exactly: `Frontend`
3. Settings → **Build & Development**
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Then go to **Deployments** and **Redeploy**

### If login doesn't work:
- Make sure redirect URLs are saved in Supabase
- Check browser console for errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel environment variables

## Summary

✅ Site URL: `https://bid-valut.vercel.app`  
✅ Redirect URLs: Add `https://bid-valut.vercel.app/**` to Supabase  
✅ Test data: Add 3 sample auctions  
✅ Vercel settings: Root Directory = `Frontend`, Framework = Vite  
