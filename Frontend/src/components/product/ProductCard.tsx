import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { useCart } from "@/context/CartContext";

export interface ProductData {
  id: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
}

interface ProductCardProps {
  product: ProductData;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  const [isCartAnimating, setIsCartAnimating] = useState(false);

  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card overflow-hidden card-hover",
        className
      )}
    >
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            -{discountPercent}%
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground">
              ${product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className={cn("h-9 w-9", isCartAnimating && "animate-cart-click")}
            onClick={(e) => {
              e.preventDefault();
              addToCart({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
              });
              setIsCartAnimating(true);
              window.setTimeout(() => setIsCartAnimating(false), 350);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
