import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { BidInput } from "@/components/auction/BidInput";
import { Heart, Share2, Shield, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuctionRealtime } from "@/hooks/useAuctionRealtime";
import { useAuth } from "@/auth/AuthContext";
import { supabase } from "@/lib/supabase";

type AuctionDetailType = {
  id: string;
  title: string;
  description: string;
  images: string[];
  current_price: number;
  starting_price: number;
  end_time: string;
  status: string;
  seller_id: string;
  seller: {
    full_name: string;
    avatar_url: string;
  };
  bids: {
    id: string;
    amount: number;
    created_at: string;
    bidder: {
      full_name: string;
      avatar_url: string;
    };
  }[];
};

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<AuctionDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Real-time updates
  useAuctionRealtime({
    auctionId: id,
    onBid: (newBid) => {
      // In a real app we might fetch the bidder details, but for now we can just push
      // or re-fetch. Re-fetching is safer to get the relation data.
      // For optimistic UI we could just show "New Bidder"
      fetchAuction();
    },
    onAuctionUpdate: (updatedAuction) => {
      setAuction((prev) => prev ? { ...prev, ...updatedAuction } : null);
    }
  });

  const fetchAuction = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('auctions')
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
        .eq('id', id)
        .order('amount', { foreignTable: 'bids', ascending: false })
        .single();

      if (error) throw error;
      setAuction(data as any); // Type assertion needed due to complex join types
    } catch (error) {
      toast({ title: "Error", description: "Could not load auction details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [id, toast]);

  const handlePlaceBid = async (amount: number) => {
    if (!isAuthenticated || !user) {
      toast({ title: "Login Required", description: "Please login to place a bid", variant: "destructive" });
      return;
    }

    if (auction && user.id === auction.seller_id) {
      toast({ title: "Error", description: "You cannot bid on your own auction", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('place_bid', {
        auction_id: id,
        bid_amount: amount
      });

      if (error) throw error;

      toast({ title: "Success", description: "Bid placed successfully!" });
      fetchAuction(); // Refresh to see new state
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to place bid", variant: "destructive" });
    }
  };

  // Watchlist & Share Logic
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    if (user && id) {
      const checkWatchStatus = async () => {
        const { data } = await supabase
          .from("watchlist")
          .select("*")
          .eq("user_id", user.id)
          .eq("auction_id", id)
          .single();
        setIsWatching(!!data);
      };
      checkWatchStatus();
    }
  }, [user, id]);

  const handleToggleWatch = async () => {
    if (!isAuthenticated || !user) {
      toast({ title: "Login Required", description: "Please login to watch items", variant: "destructive" });
      return;
    }

    try {
      if (isWatching) {
        const { error } = await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", user.id)
          .eq("auction_id", id);
        if (error) throw error;
        setIsWatching(false);
        toast({ title: "Removed from Watchlist" });
      } else {
        const { error } = await supabase
          .from("watchlist")
          .insert({ user_id: user.id, auction_id: id });
        if (error) throw error;
        setIsWatching(true);
        toast({ title: "Added to Watchlist" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not update watchlist", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied", description: "Auction link copied to clipboard!" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    }
  };

  if (loading) return <div className="container py-12 text-center animate-pulse">Loading auction details...</div>;
  if (!auction) return <div className="container py-12 text-center">Auction not found</div>;

  const images = auction.images && auction.images.length > 0 ? auction.images : ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop"];
  const isLive = auction.status === 'active';
  const totalBids = auction.bids ? auction.bids.length : 0;

  return (
    <div className="animate-fade-in">
      <div className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
              <img
                src={images[currentImageIndex]}
                alt={auction.title}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Live Badge */}
              {isLive && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-urgent text-urgent-foreground text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  LIVE
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                      currentImageIndex === index ? "border-primary" : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auction Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{auction.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{totalBids} bids</span>
                <span>•</span>
                <span>15 watching</span>
              </div>
            </div>

            {/* Current Bid & Timer */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
                  <p className="text-3xl md:text-4xl font-bold text-foreground">
                    ${auction.current_price.toLocaleString()}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground mb-2">Ends in</p>
                  <CountdownTimer endTime={new Date(auction.end_time)} size="lg" />
                </div>
              </div>

              {/* Bid Input */}
              {isLive ? (
                <BidInput
                  currentBid={auction.current_price}
                  minIncrement={10} // Could make this dynamic
                  onPlaceBid={handlePlaceBid}
                />
              ) : (
                <div className="p-4 bg-muted rounded-lg text-center font-medium">
                  This auction has ended.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant={isWatching ? "default" : "outline"}
                className="flex-1"
                onClick={handleToggleWatch}
                disabled={loading}
              >
                <Heart className={cn("h-4 w-4 mr-2", isWatching && "fill-current")} />
                {isWatching ? "Watching" : "Watch"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Seller Info */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {auction.seller?.avatar_url ? (
                    <img src={auction.seller.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{auction.seller?.full_name || "Unknown Seller"}</p>
                  <p className="text-sm text-muted-foreground">Seller</p>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Bid History */}
            <div>
              <h3 className="font-semibold mb-4">Bid History</h3>
              <div className="space-y-2">
                {auction.bids && auction.bids.length > 0 ? (
                  auction.bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium overflow-hidden">
                          {bid.bidder?.avatar_url ? (
                            <img src={bid.bidder.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            (bid.bidder?.full_name || "A").charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-sm">{bid.bidder?.full_name || "Anonymous"}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${bid.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(bid.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No bids yet. Be the first!</p>
                )}
              </div>
            </div>

            {/* Description & Details moved to bottom or tabs if needed, keeping simple for now */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border mt-4">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{auction.description}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
