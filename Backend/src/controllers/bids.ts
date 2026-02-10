import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase";
import { HttpError } from "../utils/httpError";

const placeBidSchema = z.object({
    auctionId: z.string().uuid(),
    amount: z.number().positive(),
});

export const placeBid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { auctionId, amount } = placeBidSchema.parse(req.body);
        const userId = req.user?.id;
        const userEmail = req.user?.email;

        if (!userId) throw new HttpError(401, "Unauthorized");

        // 1. Fetch Auction
        const { data: auction, error: auctionError } = await supabase
            .from("auctions")
            .select("*")
            .eq("id", auctionId)
            .single();

        if (auctionError || !auction) {
            throw new HttpError(404, "Auction not found");
        }

        // 2. Business Logic Validation
        const now = new Date();
        if (new Date(auction.end_time) < now) {
            throw new HttpError(400, "Auction has ended");
        }
        if (auction.status !== "active") {
            throw new HttpError(400, "Auction is not active");
        }
        if (auction.seller_id === userId) {
            throw new HttpError(400, "You cannot bid on your own auction");
        }
        if (amount <= auction.current_price) {
            throw new HttpError(400, `Bid must be higher than current price ($${auction.current_price})`);
        }

        // 3. Place Bid
        const { data: bid, error: bidError } = await supabase
            .from("bids")
            .insert({
                auction_id: auctionId,
                bidder_id: userId,
                amount: amount,
            })
            .select()
            .single();

        if (bidError) {
            throw new HttpError(500, "Failed to place bid");
        }

        // 4. Update Auction (Optimistic update pattern, ignoring race conditions for now)
        // Ideally this should be a database trigger or RPC for atomicity
        const { error: updateError } = await supabase
            .from("auctions")
            .update({
                current_price: amount,
                winner_id: userId,
            })
            .eq("id", auctionId);

        if (updateError) {
            // If update fails, we might want to rollback the bid (delete it)
            // For this MVP, we'll just log it. 
            console.error("Failed to update auction price:", updateError);
        }

        res.status(201).json({ message: "Bid placed successfully", bid });
    } catch (error) {
        next(error);
    }
};
