import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gavel, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlobButton } from "@/components/ui/blob-button";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { ProductCard } from "@/components/product/ProductCard";
import { featuredProducts } from "@/data/mockData"; // Keeping products mock for now as we focused on auctions

export default function Home() {
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [endingSoonAuctions, setEndingSoonAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/auctions?status=active`);
        if (res.ok) {
          const data = await res.json();
          const auctions = data.auctions || [];
          setLiveAuctions(auctions.slice(0, 4));
          // For ending soon, we could sort on client or server. 
          // Assuming server returns sorted by created_at, we might need another endpoint or sort here.
          // Let's just use the same list sorted by end_time for now.
          const sorted = [...auctions].sort((a: any, b: any) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime());
          setEndingSoonAuctions(sorted.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch auctions", error);
      }
    };
    fetchAuctions();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-card border-b border-border">
        <div className="container py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Auctions Now
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Discover & Bid on
              <span className="text-primary"> Unique Items</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Join thousands of collectors and enthusiasts in our trusted marketplace.
              Bid on rare finds or shop premium products.
            </p>
            <div className="flex flex-wrap gap-4">
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
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 pt-8 border-t border-border max-w-xl">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">12K+</p>
              <p className="text-sm text-muted-foreground">Active Auctions</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">$8M+</p>
              <p className="text-sm text-muted-foreground">Items Sold</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">50K+</p>
              <p className="text-sm text-muted-foreground">Happy Buyers</p>
            </div>
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
            {liveAuctions.length > 0 ? (
              liveAuctions.map((auction: any) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">No live auctions at the moment.</div>
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
            {endingSoonAuctions.length > 0 ? (
              endingSoonAuctions.map((auction: any) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">No ending soon auctions.</div>
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
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-card border-t border-border">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-muted-foreground mb-8">
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
