import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
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
  style?: React.CSSProperties;
}

export function ProductCard({ product, className, style }: ProductCardProps) {
  const { addToCart } = useCart();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    setIsCartAnimating(true);
    setShowCheck(true);
    setTimeout(() => setIsCartAnimating(false), 350);
    setTimeout(() => setShowCheck(false), 1200);
  }

  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card overflow-hidden card-hover",
        className
      )}
      style={style}
    >
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {hasDiscount && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/20">
            -{discountPercent}%
          </div>
        )}
        {/* Quick view overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-4 py-2 rounded-lg bg-background/90 text-foreground text-sm font-medium backdrop-blur-sm">
            Quick View
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors duration-200">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground tabular-nums">
              ${product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through tabular-nums">
                ${product.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 transition-all duration-200",
              isCartAnimating && "animate-cart-click",
              showCheck && "border-green-500 text-green-500"
            )}
            onClick={handleAddToCart}
          >
            {showCheck ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
