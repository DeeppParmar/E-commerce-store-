import { Router } from "express";

export const authRouter = Router();

// Auth is now handled by Supabase on the frontend.
// The backend just verifies tokens via middleware.
// We can keep this file if we need custom server-side auth flows later (e.g. admin actions).
