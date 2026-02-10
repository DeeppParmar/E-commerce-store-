import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase"; // Use supabase admin client
import { HttpError } from "../utils/httpError";

const createAuctionSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    startingPrice: z.number().positive(),
    endTime: z.string().datetime(), // ISO string
    images: z.array(z.string()).optional(),
});

export const createAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, startingPrice, endTime, images } = createAuctionSchema.parse(req.body);
        const userId = req.user?.id;

        if (!userId) throw new HttpError(401, "Unauthorized");

        const { data, error } = await supabase
            .from("auctions")
            .insert({
                seller_id: userId,
                title,
                description,
                starting_price: startingPrice,
                current_price: startingPrice,
                end_time: endTime,
                images: images || [],
                status: "active",
            })
            .select()
            .single();

        if (error) throw error; // Supabase error

        res.status(201).json({ auction: data });
    } catch (error) {
        next(error);
    }
};

export const getAuctions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status = "active" } = req.query;

        const { data, error } = await supabase
            .from("auctions")
            .select(`
        *,
        seller:profiles!seller_id(full_name, avatar_url),
        bids (id)
      `)
            .eq("status", status)
            .order("end_time", { ascending: true });

        if (error) throw error;

        res.json({ auctions: data });
    } catch (error) {
        next(error);
    }
};

export const getAuctionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("auctions")
            .select(`
        *,
        seller:profiles!seller_id(full_name, avatar_url),
        bids (
          id,
          amount,
          created_at,
          bidder:profiles!bidder_id(full_name, avatar_url)
        )
      `)
            .eq("id", id)
            .single();

        if (error) throw new HttpError(404, "Auction not found");

        res.json({ auction: data });
    } catch (error) {
        next(error);
    }
};
