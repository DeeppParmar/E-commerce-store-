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

## Backend Setup

1.  **Navigate to the Backend directory:**
    ```bash
    cd Backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `Backend` directory based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your credentials:
    ```env
    PORT=5000
    CORS_ORIGIN=http://localhost:5173
    SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```

4.  **Database Setup:**
    - Initialize your Supabase project.
    - Run the SQL schema provided in `backend/supabase_schema.sql` (if available) or `supabase_schema.sql` in your Supabase SQL Editor to set up tables and policies.

5.  **Run the Backend Server:**
    ```bash
    npm run dev
    ```
    The server should start on `http://localhost:5000`.

## Frontend Setup

1.  **Navigate to the Frontend directory:**
    Open a new terminal and navigate to the `Frontend` directory:
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
    Update the `.env` file with your credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_API_URL=http://localhost:5000
    ```

4.  **Run the Frontend Application:**
    ```bash
    npm run dev
    ```
    The application should be accessible at `http://localhost:5173`.

## Production Build

To build the application for production:

1.  **Backend:**
    ```bash
    cd Backend
    npm run build
    npm start
    ```

2.  **Frontend:**
    ```bash
    cd Frontend
    npm run build
    npm run preview
    ```
