import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { BidInput } from "@/components/auction/BidInput";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart, Share2, Shield, User, ChevronLeft, ChevronRight,
  Tag, MapPin, Package, Truck, Clock, Gavel, Star, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuctionRealtime } from "@/hooks/useAuctionRealtime";
import { useAuth } from "@/auth/AuthContext";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

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
  category?: string;
  condition?: string;
  min_increment?: number;
  tags?: string[];
  shipping_cost?: number;
  seller_location?: string;
  local_pickup?: boolean;
  reserve_price?: number;
  buy_now_price?: number;
  view_count?: number;
  created_at: string;
  seller: {
    full_name: string;
    avatar_url: string;
    seller_rating?: number;
    total_sales?: number;
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

const CONDITION_LABELS: Record<string, string> = {
  new: "Brand New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  for_parts: "For Parts",
};

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<AuctionDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useAuctionRealtime({
    auctionId: id,
    onBid: () => fetchAuction(),
    onAuctionUpdate: (updatedAuction) => {
      setAuction((prev) => prev ? { ...prev, ...updatedAuction } : null);
    }
  });

  const fetchAuction = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("auctions")
        .select(`
                    *,
                    seller:profiles!seller_id(full_name, avatar_url, seller_rating, total_sales),
                    bids (
                        id,
                        amount,
                        created_at,
                        bidder:profiles!bidder_id(full_name, avatar_url)
                    )
                `)
        .eq("id", id)
        .order("amount", { foreignTable: "bids", ascending: false })
        .single();

      if (error) throw error;
      setAuction(data as any);
    } catch (error) {
      toast({ title: "Error", description: "Could not load auction details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [id]);

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
      const { error } = await supabase.rpc("place_bid", {
        auction_id: id,
        bid_amount: amount,
      });
      if (error) throw error;
      toast({ title: "Bid Placed! 🎉", description: `Your bid of $${amount.toLocaleString()} was placed.` });
      fetchAuction();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to place bid", variant: "destructive" });
    }
  };

  // Watchlist
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    if (user && id) {
      supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .eq("auction_id", id)
        .single()
        .then(({ data }) => setIsWatching(!!data));
    }
  }, [user, id]);

  const handleToggleWatch = async () => {
    if (!isAuthenticated || !user) {
      toast({ title: "Login Required", description: "Please login to watch items", variant: "destructive" });
      return;
    }
    try {
      if (isWatching) {
        await supabase.from("watchlist").delete().eq("user_id", user.id).eq("auction_id", id);
        setIsWatching(false);
        toast({ title: "Removed from Watchlist" });
      } else {
        await supabase.from("watchlist").insert({ user_id: user.id, auction_id: id });
        setIsWatching(true);
        toast({ title: "Added to Watchlist ❤️" });
      }
    } catch {
      toast({ title: "Error", description: "Could not update watchlist", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Auction link copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="container py-8 page-transition">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container py-20 text-center page-transition">
        <Gavel className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h2 className="text-xl font-semibold mb-2">Auction Not Found</h2>
        <p className="text-muted-foreground mb-6">This auction may have been removed or doesn't exist.</p>
        <Button asChild>
          <Link to="/auctions">Browse Auctions</Link>
        </Button>
      </div>
    );
  }

  const images = auction.images?.length > 0
    ? auction.images
    : ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop"];
  const isLive = auction.status === "active";
  const totalBids = auction.bids?.length || 0;
  const minIncrement = auction.min_increment || 10;

  return (
    <div className="page-transition">
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/auctions" className="hover:text-foreground transition-colors">Auctions</Link>
          <span>/</span>
          {auction.category && (
            <>
              <Link
                to={`/auctions?category=${auction.category}`}
                className="hover:text-foreground transition-colors"
              >
                {auction.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate max-w-[200px]">{auction.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
              <img
                src={images[currentImageIndex]}
                alt={auction.title}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {isLive && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-urgent text-urgent-foreground text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    LIVE
                  </div>
                )}
                {auction.category && (
                  <span className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
                    {auction.category}
                  </span>
                )}
              </div>

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
                  {currentImageIndex + 1}/{images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                      currentImageIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground"
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
            {/* Title & Meta */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{auction.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Gavel className="h-3.5 w-3.5" /> {totalBids} bid{totalBids !== 1 ? "s" : ""}
                </span>
                {auction.view_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {auction.view_count} views
                  </span>
                )}
                {auction.condition && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                    <Package className="h-3 w-3" />
                    {CONDITION_LABELS[auction.condition] || auction.condition}
                  </span>
                )}
              </div>
            </div>

            {/* Current Bid & Timer */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
                    <p className="text-3xl md:text-4xl font-bold">
                      ${auction.current_price.toLocaleString()}
                    </p>
                    {auction.reserve_price && auction.current_price < auction.reserve_price && (
                      <p className="text-xs text-amber-500 mt-1">Reserve not met</p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground mb-2">
                      {isLive ? "Ends in" : "Ended"}
                    </p>
                    {isLive ? (
                      <CountdownTimer endTime={new Date(auction.end_time)} size="lg" />
                    ) : (
                      <p className="text-sm font-medium">
                        {formatDistanceToNow(new Date(auction.end_time), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>

                {isLive ? (
                  <BidInput
                    currentBid={auction.current_price}
                    minIncrement={minIncrement}
                    onPlaceBid={handlePlaceBid}
                  />
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center font-medium">
                    This auction has ended.
                  </div>
                )}

                {/* Buy Now */}
                {isLive && auction.buy_now_price && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground mb-2">Or buy it now for</p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="font-bold text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => handlePlaceBid(auction.buy_now_price!)}
                    >
                      Buy Now — ${auction.buy_now_price.toLocaleString()}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant={isWatching ? "default" : "outline"}
                className="flex-1"
                onClick={handleToggleWatch}
              >
                <Heart className={cn("h-4 w-4 mr-2", isWatching && "fill-current")} />
                {isWatching ? "Watching" : "Watch"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Seller Info Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                    {auction.seller?.avatar_url ? (
                      <img src={auction.seller.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{auction.seller?.full_name || "Unknown Seller"}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {auction.seller?.seller_rating && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          {auction.seller.seller_rating.toFixed(1)}
                        </span>
                      )}
                      {auction.seller?.total_sales !== undefined && (
                        <span>{auction.seller.total_sales} sales</span>
                      )}
                    </div>
                  </div>
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            {/* Item Details */}
            <div className="space-y-3">
              {/* Tags */}
              {auction.tags && auction.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {auction.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Shipping & Location */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {auction.shipping_cost !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4" />
                    {auction.shipping_cost === 0 ? "Free Shipping" : `$${auction.shipping_cost} shipping`}
                  </span>
                )}
                {auction.seller_location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {auction.seller_location}
                  </span>
                )}
                {auction.local_pickup && (
                  <span className="flex items-center gap-1.5">
                    <Package className="h-4 w-4" />
                    Local Pickup Available
                  </span>
                )}
              </div>
            </div>

            {/* Bid History */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Bid History ({totalBids})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {auction.bids?.length > 0 ? (
                  auction.bids.map((bid, i) => (
                    <div
                      key={bid.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border border-border transition-colors",
                        i === 0 ? "bg-primary/5 border-primary/20" : "bg-card"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium overflow-hidden">
                          {bid.bidder?.avatar_url ? (
                            <img src={bid.bidder.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            (bid.bidder?.full_name || "A").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{bid.bidder?.full_name || "Anonymous"}</span>
                          {i === 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                              HIGHEST
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${bid.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-6">No bids yet. Be the first!</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-5 rounded-xl bg-muted/50 border border-border">
              <h4 className="font-semibold mb-3">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{auction.description || "No description provided."}</p>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-card border border-border">
                <p className="text-xs text-muted-foreground">Starting Price</p>
                <p className="font-semibold">${auction.starting_price.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <p className="text-xs text-muted-foreground">Min Increment</p>
                <p className="font-semibold">${minIncrement.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <p className="text-xs text-muted-foreground">Listed</p>
                <p className="font-semibold">{formatDistanceToNow(new Date(auction.created_at), { addSuffix: true })}</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <p className="text-xs text-muted-foreground">Item ID</p>
                <p className="font-semibold truncate text-xs">{auction.id.slice(0, 8)}...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
