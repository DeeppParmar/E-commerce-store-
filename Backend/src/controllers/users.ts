import { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase";
import { HttpError } from "../utils/httpError";

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new HttpError(401, "Unauthorized");

        // Fetch full profile if needed, or just return basic auth info
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore not found if profile not created yet, just return auth info
            console.error("Error fetching profile:", error);
        }

        res.json({ user: { ...req.user, ...data } });
    } catch (error) {
        next(error);
    }
};

export const getMyBids = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new HttpError(401, "Unauthorized");

        const { data, error } = await supabase
            .from("bids")
            .select(`
        *,
        auction:auctions (
          id, title, images, end_time, status, current_price
        )
      `)
            .eq("bidder_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.json({ bids: data });
    } catch (error) {
        next(error);
    }
};

export const getMyWins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new HttpError(401, "Unauthorized");

        const { data, error } = await supabase
            .from("auctions")
            .select("*")
            .eq("winner_id", userId)
            .eq("status", "ended") // Or just winner_id if we consider live auctions where user is winning (but that changes)
            // Usually "wins" implies ended. For "winning", we check active bids where bid amount == current price?
            // Let's stick to ended wins for this endpoint.
            .order("end_time", { ascending: false });

        if (error) throw error;

        res.json({ wins: data });
    } catch (error) {
        next(error);
    }
};

export const getMyAuctions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new HttpError(401, "Unauthorized");

        let query = supabase
            .from("auctions")
            .select("*")
            .eq("seller_id", userId)
            .order("created_at", { ascending: false });

        if (req.query.status) {
            query = query.eq("status", req.query.status);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ auctions: data });
    } catch (error) {
        next(error);
    }
};
