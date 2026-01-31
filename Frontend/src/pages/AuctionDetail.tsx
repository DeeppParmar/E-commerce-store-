import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { BidInput } from "@/components/auction/BidInput";
import { allAuctions } from "@/data/mockData";
import { Heart, Share2, Shield, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock bid history
const bidHistory = [
  { user: "collector_89", amount: 12500, time: "2 min ago" },
  { user: "art_lover", amount: 12200, time: "5 min ago" },
  { user: "premium_buyer", amount: 12000, time: "12 min ago" },
  { user: "vintage_fan", amount: 11500, time: "20 min ago" },
  { user: "john_d", amount: 11000, time: "35 min ago" },
];

export default function AuctionDetail() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const auction = allAuctions.find((a) => a.id === id) || allAuctions[0];
  
  // Mock multiple images
  const images = [
    auction.image,
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop",
  ];

  const handlePlaceBid = (amount: number) => {
    console.log("Placing bid:", amount);
    // Would integrate with backend
  };

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
              {auction.isLive && (
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
                <span>{auction.totalBids} bids</span>
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
                    ${auction.currentBid.toLocaleString()}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground mb-2">Ends in</p>
                  <CountdownTimer endTime={auction.endTime} size="lg" />
                </div>
              </div>

              {/* Bid Input */}
              <BidInput
                currentBid={auction.currentBid}
                minIncrement={50}
                onPlaceBid={handlePlaceBid}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Heart className="h-4 w-4" />
                Watch
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Seller Info */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Premium Seller</p>
                  <p className="text-sm text-muted-foreground">98% positive feedback • 245 sales</p>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Bid History */}
            <div>
              <h3 className="font-semibold mb-4">Bid History</h3>
              <div className="space-y-2">
                {bidHistory.map((bid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                        {bid.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{bid.user}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${bid.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{bid.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auction Rules */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <h4 className="font-medium mb-2">Auction Rules</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All bids are final and binding</li>
                <li>• Buyer premium: 10% of final bid</li>
                <li>• Payment due within 48 hours</li>
                <li>• Free shipping on orders over $500</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bid Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Current Bid</span>
          <span className="font-bold text-lg">${auction.currentBid.toLocaleString()}</span>
        </div>
        <Button variant="bid" size="lg" className="w-full">
          Place Bid
        </Button>
      </div>
    </div>
  );
}
