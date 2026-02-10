# Deployment Guide for "Dumbo" (E-commerce-store-)

This guide explains how to deploy your full-stack application to the web.

## Overview

- **Frontend:** Deployed on **Netlify** (or Vercel).
- **Backend:** Deployed on **Render** (or Railway/Heroku).
- **Database:** Hosted on **Supabase**.

---

## 1. Database Setup (Supabase)

Your database is already hosted on Supabase. Ensure you have your production credentials ready:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (for Backend)
- `SUPABASE_ANON_KEY` (for Frontend)

*Note: You might want to create a separate project in Supabase for production data vs development data.*

---

## 2. Backend Deployment (Render)

We recommended **Render** for the backend because it offers a free tier for web services and is easy to set up with Node.js.

1.  **Create a Render Account:** Go to [render.com](https://render.com/) and sign up.
2.  **New Web Service:** Click "New +" and select "Web Service".
3.  **Connect Repository:** Connect your GitHub account and select your `E-commerce-store-` repository.
4.  **Configure Service:**
    - **Name:** `dumbo-backend` (or your preferred name)
    - **Region:** Choose one close to you (e.g., Singapore, Frankfurt).
    - **Branch:** `main`
    - **Root Directory:** `Backend` (Important!)
    - **Runtime:** `Node`
    - **Build Command:** `npm install && npm run build`
    - **Start Command:** `npm start`
5.  **Environment Variables:**
    Scroll down to "Environment Variables" and add the following:
    - `PORT`: `10000` (Render's default)
    - `CORS_ORIGIN`: `https://your-frontend-domain.netlify.app` (You will update this after deploying the frontend)
    - `SUPABASE_URL`: `your_supabase_url`
    - `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_key`
6.  **Create Web Service:** Click "Create Web Service".
7.  **Copy Backend URL:** Once deployed, copy the URL (e.g., `https://dumbo-backend.onrender.com`).

---

## 3. Frontend Deployment (Netlify)

Since you already have a `netlify.toml` file, deployment on Netlify is straightforward.

1.  **Create a Netlify Account:** Go to [netlify.com](https://netlify.com/) and sign up.
2.  **Add New Site:** Click "Add new site" -> "Import an existing project".
3.  **Connect GitHub:** Authorize GitHub and select your `E-commerce-store-` repository.
4.  **Configure Build:**
    - **Base directory:** `Frontend`
    - **Build command:** `npm run build`
    - **Publish directory:** `Frontend/dist`
    *Note: Netlify should auto-detect these settings from your `netlify.toml` file.*
5.  **Environment Variables:**
    Click "Show advanced" -> "New Variable" (or go to Site Settings > Environment variables later) and add:
    - `VITE_SUPABASE_URL`: `your_supabase_url`
    - `VITE_SUPABASE_ANON_KEY`: `your_supabase_anon_key`
    - `VITE_API_URL`: `https://dumbo-backend.onrender.com` (The URL from step 2)
6.  **Deploy Site:** Click "Deploy site".
7.  **Update Backend CORS:**
    Once your frontend is live (e.g., `https://dumbo-store.netlify.app`), go back to your **Render Dashboard** -> **Environment Variables** and update `CORS_ORIGIN` to this new URL. Redeploy the backend if necessary.

---

## 4. Final Checks

1.  Visit your Netlify URL.
2.  Check if products/auctions are loading (tests backend connection).
3.  Try logging in (tests Supabase connection).
