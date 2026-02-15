import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AuctionCard, { AuctionData } from "@/components/auction/AuctionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All", "Art", "Watches", "Jewelry", "Electronics", "Collectibles",
  "Fashion", "Vehicles", "Home", "Books", "Music", "Sports", "Other"
];

const SORT_OPTIONS = [
  { value: "ending-soon", label: "Ending Soon" },
  { value: "newest", label: "Newly Listed" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const CONDITION_OPTIONS = [
  { value: "all", label: "Any Condition" },
  { value: "new", label: "Brand New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for_parts", label: "For Parts" },
];

export default function Auctions() {
  const { toast } = useToast();
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("all");
  const [sort, setSort] = useState("ending-soon");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchAuctions();
  }, [category, condition, sort, debouncedSearch]);

  async function fetchAuctions() {
    try {
      setLoading(true);
      const { auctions: data } = await apiClient.getAuctions({
        status: "active",
        category: category !== "All" ? category : undefined,
        condition: condition !== "all" ? condition : undefined,
        search: debouncedSearch || undefined,
        sort,
      });

      const mapped: AuctionData[] = (data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        image: a.images?.[0] || "",
        currentBid: parseFloat(a.current_price),
        totalBids: a.bid_count || 0,
        endTime: new Date(a.end_time),
        isLive: a.status === "active",
        category: a.category,
        condition: a.condition,
      }));

      setAuctions(mapped);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not load auctions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setCategory("All");
    setCondition("all");
    setSort("ending-soon");
  }

  const hasActiveFilters = category !== "All" || condition !== "all" || searchQuery.length > 0;

  return (
    <div className="container py-10 page-transition">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live Auctions</h1>
        <p className="text-muted-foreground">
          {loading ? "Loading..." : `${auctions.length} active auction${auctions.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search auctions..."
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44 hidden sm:flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                category === c
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-card border border-border animate-slide-down">
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile sort */}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40 sm:hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                <X className="h-3.5 w-3.5 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No auctions found"
          description={hasActiveFilters
            ? "Try adjusting your filters or search query."
            : "No active auctions at the moment. Check back later!"
          }
          actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map((auction, i) => (
            <div
              key={auction.id}
              className="stagger-item"
              style={{ "--stagger-index": i } as React.CSSProperties}
            >
              <AuctionCard auction={auction} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
