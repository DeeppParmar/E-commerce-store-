import { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase";
import { HttpError } from "../utils/httpError";

// Add user to Request interface
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email?: string;
                role?: string;
            };
        }
    }
}

export const checkAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new HttpError(401, "Authorization header missing");
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new HttpError(401, "Invalid or expired token");
        }

        // Optionally fetch profile role from DB if needed, 
        // but for now we trust the auth user exists.
        // We can add a specialized query to 'profiles' if we need the role here.

        req.user = {
            id: user.id,
            email: user.email,
        };

        next();
    } catch (error) {
        next(error);
    }
};
