import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import AuctionCard, { AuctionData } from "@/components/auction/AuctionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gavel, ArrowRight, Clock, TrendingUp, Sparkles,
  Palette, Watch, Gem, Cpu, Car, Home as HomeIcon,
  BookOpen, Music, Trophy, ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";

const BROWSE_CATEGORIES = [
  { name: "Art", icon: Palette, color: "from-rose-500 to-pink-500" },
  { name: "Watches", icon: Watch, color: "from-blue-500 to-indigo-500" },
  { name: "Jewelry", icon: Gem, color: "from-amber-500 to-orange-500" },
  { name: "Electronics", icon: Cpu, color: "from-emerald-500 to-teal-500" },
  { name: "Collectibles", icon: Trophy, color: "from-violet-500 to-purple-500" },
  { name: "Vehicles", icon: Car, color: "from-slate-500 to-zinc-500" },
  { name: "Fashion", icon: ShoppingBag, color: "from-pink-500 to-fuchsia-500" },
  { name: "Books", icon: BookOpen, color: "from-cyan-500 to-blue-500" },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [liveAuctions, setLiveAuctions] = useState<AuctionData[]>([]);
  const [endingSoonAuctions, setEndingSoonAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalActiveCount, setTotalActiveCount] = useState(0);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const { data: auctionsData, error, count } = await supabase
          .from("auctions")
          .select("*", { count: "exact" })
          .eq("status", "active")
          .order("end_time", { ascending: true })
          .limit(12);

        if (error) throw error;

        setTotalActiveCount(count || 0);

        const mapped: AuctionData[] = (auctionsData || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          image: a.images?.[0] || "",
          currentBid: parseFloat(a.current_price),
          totalBids: a.bid_count || 0,
          endTime: new Date(a.end_time),
          isLive: true,
          category: a.category,
        }));

        setLiveAuctions(mapped.slice(0, 4));

        // Ending soon = ending within 2 hours
        const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const ending = mapped.filter(
          (a) => a.endTime <= twoHoursFromNow && a.endTime > new Date()
        );
        setEndingSoonAuctions(ending.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch auctions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              {totalActiveCount > 0
                ? `${totalActiveCount} live auction${totalActiveCount !== 1 ? "s" : ""} right now`
                : "Discover rare finds"
              }
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Bid, Win & Collect
              <span className="block text-primary">Rare Treasures</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Discover unique items from trusted sellers. Real-time bidding,
              secure transactions, and a curated marketplace.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" asChild>
                <Link to="/auctions">
                  <Gavel className="h-5 w-5 mr-2" />
                  Browse Auctions
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Create Account</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      <section className="container py-16 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse-slow" />
            <h2 className="text-2xl font-bold">Live Auctions</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auctions" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : liveAuctions.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {liveAuctions.map((auction, i) => (
              <div
                key={auction.id}
                className="stagger-item"
                style={{ "--stagger-index": i } as React.CSSProperties}
              >
                <AuctionCard auction={auction} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Gavel className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No live auctions at the moment</p>
            <p className="text-sm mt-1">Check back soon or list your own item!</p>
          </div>
        )}
      </section>

      {/* Ending Soon */}
      {endingSoonAuctions.length > 0 && (
        <section className="bg-card border-y border-border">
          <div className="container py-16 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-destructive animate-pulse-urgent" />
                <h2 className="text-2xl font-bold">Ending Soon</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auctions?sort=ending-soon" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {endingSoonAuctions.map((auction, i) => (
                <div
                  key={auction.id}
                  className="stagger-item"
                  style={{ "--stagger-index": i } as React.CSSProperties}
                >
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section className="container py-16 space-y-6">
        <h2 className="text-2xl font-bold">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BROWSE_CATEGORIES.map((cat, i) => (
            <Link
              key={cat.name}
              to={`/auctions?category=${cat.name}`}
              className="stagger-item group"
              style={{ "--stagger-index": i } as React.CSSProperties}
            >
              <div className="relative overflow-hidden rounded-xl border border-border p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/30">
                <div className={cn(
                  "inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br text-white mb-3 transition-transform group-hover:scale-110",
                  cat.color
                )}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card">
        <div className="container py-16 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mx-auto">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold">Start Selling Today</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            List your unique items and reach thousands of collectors.
            No listing fees, real-time bidding, and secure payments.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/sell">
                <Gavel className="h-5 w-5 mr-2" />
                Start Selling
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
