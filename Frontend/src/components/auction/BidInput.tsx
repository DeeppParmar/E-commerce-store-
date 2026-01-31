import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface BidInputProps {
  currentBid: number;
  minIncrement?: number;
  onPlaceBid: (amount: number) => void;
  className?: string;
}

export function BidInput({
  currentBid,
  minIncrement = 10,
  onPlaceBid,
  className,
}: BidInputProps) {
  const [bidAmount, setBidAmount] = useState(currentBid + minIncrement);

  const quickIncrements = [minIncrement, minIncrement * 2, minIncrement * 5, minIncrement * 10];

  const handleIncrement = (amount: number) => {
    setBidAmount((prev) => Math.max(currentBid + minIncrement, prev + amount));
  };

  const handleDecrement = (amount: number) => {
    setBidAmount((prev) => Math.max(currentBid + minIncrement, prev - amount));
  };

  const handleSubmit = () => {
    if (bidAmount > currentBid) {
      onPlaceBid(bidAmount);
    }
  };

  const isValidBid = bidAmount > currentBid;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Bid Input with Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDecrement(minIncrement)}
          disabled={bidAmount <= currentBid + minIncrement}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(Math.max(currentBid + minIncrement, Number(e.target.value)))}
            className="pl-7 text-center text-lg font-semibold"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleIncrement(minIncrement)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Increment Buttons */}
      <div className="flex gap-2 flex-wrap">
        {quickIncrements.map((increment) => (
          <Button
            key={increment}
            variant="secondary"
            size="sm"
            onClick={() => handleIncrement(increment)}
            className="flex-1 min-w-[60px]"
          >
            +${increment}
          </Button>
        ))}
      </div>

      {/* Place Bid Button */}
      <Button
        variant="bid"
        size="xl"
        className="w-full"
        onClick={handleSubmit}
        disabled={!isValidBid}
      >
        Place Bid - ${bidAmount.toLocaleString()}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Minimum bid: ${(currentBid + minIncrement).toLocaleString()}
      </p>
    </div>
  );
}
