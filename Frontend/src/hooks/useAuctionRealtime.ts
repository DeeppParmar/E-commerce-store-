import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UseAuctionRealtimeProps {
    auctionId: string | undefined;
    onBid: (payload: any) => void;
    onAuctionUpdate: (payload: any) => void;
}

export function useAuctionRealtime({ auctionId, onBid, onAuctionUpdate }: UseAuctionRealtimeProps) {
    const { toast } = useToast();

    useEffect(() => {
        if (!auctionId) return;

        // Channel for Auction Updates (Price, Status, End Time)
        const auctionChannel = supabase
            .channel(`auction:${auctionId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "auctions",
                    filter: `id=eq.${auctionId}`,
                },
                (payload) => {
                    console.log("Auction update received:", payload);
                    onAuctionUpdate(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log("Subscribed to auction updates");
                }
            });

        // Channel for New Bids
        const bidChannel = supabase
            .channel(`bids:${auctionId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "bids",
                    filter: `auction_id=eq.${auctionId}`,
                },
                (payload) => {
                    console.log("New bid received:", payload);
                    onBid(payload.new);
                    toast({
                        title: "New Bid!",
                        description: `A new bid of $${payload.new.amount} was just placed.`,
                    });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log("Subscribed to bid updates");
                }
            });

        return () => {
            supabase.removeChannel(auctionChannel);
            supabase.removeChannel(bidChannel);
        };
    }, [auctionId, onBid, onAuctionUpdate, toast]);
}
