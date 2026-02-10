# Setup Guide for E-commerce-store-

This guide provides step-by-step instructions to set up the E-commerce store project locally.

## Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase](https://supabase.com/) account for database

## Repository Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DeeppParmar/E-commerce-store-.git
    cd E-commerce-store-
    ```

## Supabase Setup

1.  **Create a Supabase Project**: Go to [database.new](https://database.new) and create a new project.
2.  **Database Schema**:
    - Go to the SQL Editor in your Supabase Dashboard.
    - Run the contents of `SUPABASE_MIGRATION.sql` (found in the root of this repo).
3.  **Storage**:
    - Create a public bucket named `auctions`.

## Frontend Setup

1.  **Navigate to the Frontend directory:**
    ```bash
    cd Frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `Frontend` directory based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your credentials from Supabase Settings -> API:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *Note: `VITE_API_URL` is no longer needed.*

4.  **Run the Application:**
    ```bash
    npm run dev
    ```
    The application should be accessible at `http://localhost:5173`.

## Production Build

To build the application for production:

```bash
cd Frontend
npm run build
npm run preview
```
