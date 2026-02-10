import { useState, useEffect } from "react";
import { AuctionCard, AuctionData } from "@/components/auction/AuctionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/data/mockData"; // Keep categories for now
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type AuctionRow = Database['public']['Tables']['auctions']['Row'];

export default function Auctions() {
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("ending-soon");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from('auctions')
          .select(`
            *,
            bids (count)
          `)
          .eq('status', 'active');

        // Apply filters if needed (e.g. category if added to DB)
        // For now, we fetch active auctions

        const { data, error } = await query;

        if (error) throw error;

        const mapped: AuctionData[] = (data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          image: a.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop",
          currentBid: a.current_price,
          totalBids: a.bids?.[0]?.count || 0, // Approx count if using separate query or simplify
          endTime: new Date(a.end_time),
          isLive: a.status === 'active',
        }));

        setAuctions(mapped);
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Could not load auctions", variant: "destructive" });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, [toast]);

  const filteredAuctions = auctions
    .filter((auction) => {
      // Client-side filtering for title/category as we fetched all active
      if (selectedCategory !== "All") {
        return auction.title.toLowerCase().includes(selectedCategory.toLowerCase());
      }
      return true;
    })
    .filter((auction) => {
      if (searchQuery) {
        return auction.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "ending-soon":
          return a.endTime.getTime() - b.endTime.getTime();
        case "price-high":
          return b.currentBid - a.currentBid;
        case "price-low":
          return a.currentBid - b.currentBid;
        case "most-bids":
          return b.totalBids - a.totalBids;
        default:
          return 0;
      }
    });

  if (loading) {
    return <div className="container py-12 text-center">Loading auctions...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Live Auctions</h1>
          <p className="text-muted-foreground">
            Browse and bid on {auctions.length}+ live auctions
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-accent/50 border-0 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              <option value="ending-soon">Ending Soon</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="most-bids">Most Bids</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                selectedCategory === category && "bg-primary text-primary-foreground"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredAuctions.length} auctions
        </p>

        {/* Auction Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>

        {filteredAuctions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No auctions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
