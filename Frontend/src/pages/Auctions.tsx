import { useState, useEffect } from "react";
import { AuctionCard, AuctionData } from "@/components/auction/AuctionCard";
import { AuctionCardSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { categories } from "@/data/mockData";
import { Search, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Database } from "@/types/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

        const { auctions: data } = await apiClient.getAuctions('active');

        const mapped: AuctionData[] = (data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          image: a.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop",
          currentBid: a.current_price,
          totalBids: a.bid_count || 0,
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

  return (
    <div>
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="most-bids">Most Bids</SelectItem>
            </SelectContent>
          </Select>
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
                "transition-all duration-200",
                selectedCategory === category && "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Auction Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))
          ) : (
            filteredAuctions.map((auction, i) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                className="stagger-item"
                style={{ "--stagger-index": i } as React.CSSProperties}
              />
            ))
          )}
        </div>

        {!loading && filteredAuctions.length === 0 && (
          <div className="text-center py-16">
            <PackageSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground mb-1">No auctions found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
