import { Link } from "react-router-dom";
import { CountdownTimer } from "./CountdownTimer";
import { cn } from "@/lib/utils";

export interface AuctionData {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  totalBids: number;
  endTime: Date;
  isLive?: boolean;
}

interface AuctionCardProps {
  auction: AuctionData;
  className?: string;
}

export function AuctionCard({ auction, className }: AuctionCardProps) {
  return (
    <Link
      to={`/auctions/${auction.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card overflow-hidden card-hover",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={auction.image}
          alt={auction.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {auction.isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-urgent text-urgent-foreground text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
          {auction.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Current Bid</p>
            <p className="text-lg font-semibold text-foreground">
              ${auction.currentBid.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{auction.totalBids} bids</p>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Ends in</p>
          <CountdownTimer endTime={auction.endTime} size="sm" />
        </div>
      </div>
    </Link>
  );
}
