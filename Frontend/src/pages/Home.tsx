import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { ArrowRight, Gavel, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlobButton } from "@/components/ui/blob-button";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { ProductCard } from "@/components/product/ProductCard";
import { AuctionCardSkeleton, ProductCardSkeleton } from "@/components/ui/skeleton";
import { featuredProducts } from "@/data/mockData";

export default function Home() {
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [endingSoonAuctions, setEndingSoonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const { data: auctionsData, error } = await supabase
          .from("auctions")
          .select("*")
          .eq("status", "active")
          .order("end_time", { ascending: true })
          .limit(10);

        if (error) throw error;

        const auctions = auctionsData || [];
        setLiveAuctions(auctions.slice(0, 4));

        const sorted = [...auctions].sort((a: any, b: any) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime());
        setEndingSoonAuctions(sorted.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch auctions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-card border-b border-border">
        {/* Decorative gradient accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="container relative py-16 md:py-24 lg:py-28">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 stagger-item"
              style={{ "--stagger-index": 0 } as React.CSSProperties}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Auctions Now
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 stagger-item"
              style={{ "--stagger-index": 1 } as React.CSSProperties}
            >
              Discover & Bid on
              <span className="text-primary"> Unique Items</span>
            </h1>
            <p
              className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed stagger-item"
              style={{ "--stagger-index": 2 } as React.CSSProperties}
            >
              Join thousands of collectors and enthusiasts in our trusted marketplace.
              Bid on rare finds or shop premium products.
            </p>
            <div
              className="flex flex-wrap gap-4 stagger-item"
              style={{ "--stagger-index": 3 } as React.CSSProperties}
            >
              <BlobButton to="/auctions" size="lg">
                <Gavel className="h-5 w-5" />
                Explore Auctions
              </BlobButton>
              <Button size="lg" variant="outline" asChild>
                <Link to="/shop">
                  Browse Shop
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-14 pt-8 border-t border-border max-w-xl">
            {[
              { value: "12K+", label: "Active Auctions" },
              { value: "$8M+", label: "Items Sold" },
              { value: "50K+", label: "Happy Buyers" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="stagger-item"
                style={{ "--stagger-index": 4 + i } as React.CSSProperties}
              >
                <p className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Auctions Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-urgent/10 text-urgent text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-urgent animate-pulse" />
                LIVE
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Live Auctions</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/auctions" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <AuctionCardSkeleton key={i} />
              ))
            ) : liveAuctions.length > 0 ? (
              liveAuctions.map((auction: any, i: number) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  className="stagger-item"
                  style={{ "--stagger-index": i } as React.CSSProperties}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No live auctions at the moment</p>
                <p className="text-sm mt-1">Check back soon for new listings!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ending Soon Section */}
      <section className="py-12 md:py-16 bg-card border-y border-border">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-warning" />
              <h2 className="text-2xl md:text-3xl font-bold">Ending Soon</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/auctions?sort=ending-soon" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <AuctionCardSkeleton key={i} />
              ))
            ) : endingSoonAuctions.length > 0 ? (
              endingSoonAuctions.map((auction: any, i: number) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  className="stagger-item"
                  style={{ "--stagger-index": i } as React.CSSProperties}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No ending soon auctions</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Shop Now</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/shop" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                className="stagger-item"
                style={{ "--stagger-index": i } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-card border-t border-border">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              List your items and reach thousands of buyers. No listing fees, just results.
            </p>
            <BlobButton to="/sell" size="lg">
              Start Selling Today
            </BlobButton>
          </div>
        </div>
      </section>
    </div>
  );
}
