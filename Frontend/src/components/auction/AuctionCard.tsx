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
  style?: React.CSSProperties;
}

export function AuctionCard({ auction, className, style }: AuctionCardProps) {
  return (
    <Link
      to={`/auctions/${auction.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card overflow-hidden card-hover",
        className
      )}
      style={style}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={auction.image}
          alt={auction.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Dark gradient overlay for text contrast */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {auction.isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-urgent text-urgent-foreground text-xs font-semibold shadow-lg shadow-urgent/30">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors duration-200">
          {auction.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Current Bid</p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              ${auction.currentBid.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground tabular-nums">
              {auction.totalBids} bid{auction.totalBids !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1.5">Ends in</p>
          <CountdownTimer endTime={auction.endTime} size="sm" />
        </div>
      </div>
    </Link>
  );
}
