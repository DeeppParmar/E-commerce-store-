# Deployment Guide

This guide covers deploying the **Frontend** to Vercel. Since we migrated to a Supabase-only architecture, there is no separate backend to deploy.

## Prerequisites

1.  **GitHub Account**: Ensure your code is pushed to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Supabase Project**: You need your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## Deploying to Vercel

1.  **Login to Vercel**: Go to your dashboard.
2.  **Add New Project**: Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository**: Select your repository (`E-commerce-store-`).
4.  **Configure Project**:
    *   **Framework Preset**: Select **Vite**.
    *   **Root Directory**: Click "Edit" and select **`Frontend`**.
    *   **Build Command**: `vite build` (Default)
    *   **Output Directory**: `dist` (Default)
    *   **Install Command**: `npm install` (Default)
5.  **Environment Variables**:
    *   Expand the **"Environment Variables"** section.
    *   Add the following variables (copy values from your `Frontend/.env` or Supabase dashboard):
        *   `VITE_SUPABASE_URL`: Your Supabase Project URL.
        *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon/Public Key.
    *   **Note**: `VITE_API_URL` is no longer needed as the backend has been removed.
6.  **Deploy**: Click **"Deploy"**.

## Post-Deployment Checks

1.  **Visit URL**: Open the deployed Vercel URL.
2.  **Test Auth**: Try signing in/up.
3.  **Test Routing**: Navigate to different pages (e.g., `/auctions`, `/profile`) and refresh the page to ensure SPA routing (via `vercel.json`) works.
4.  **Supabase Auth Redirects**:
    *   Go to your Supabase Dashboard -> **Authentication** -> **URL Configuration**.
    *   Add your detailed Vercel URL (e.g., `https://your-project.vercel.app`) to **Site URL** and **Redirect URLs**.

## Troubleshooting

-   **404 on Refresh**: Ensure `vercel.json` exists in `Frontend/` with the rewrite rule pointing to `/index.html`.
-   **Auth Errors**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in Vercel settings.
-   **Build Fails**: Check Vercel logs. Ensure all dependencies are in `Frontend/package.json`.
