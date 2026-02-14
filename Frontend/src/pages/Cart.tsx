import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { items: cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState("");

  const shipping = subtotal > 500 ? 0 : 15;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Looks like you haven't added any items yet. Explore our shop to find something you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/shop">Browse Shop</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auctions">View Auctions</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, i) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl bg-card border border-border stagger-item transition-all duration-200 hover:border-border/80"
                style={{ "--stagger-index": i } as React.CSSProperties}
              >
                <Link to={`/products/${item.id}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 rounded-lg object-cover transition-transform duration-200 hover:scale-105"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.id}`}>
                    <h3 className="font-medium hover:text-primary transition-colors duration-200 line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-lg font-semibold mt-1 tabular-nums">${item.price}</p>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 transition-all duration-200"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium tabular-nums">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 transition-all duration-200"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold tabular-nums">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-xl bg-card border border-border space-y-4">
              <h2 className="font-semibold text-lg">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? "text-green-500 font-medium" : "font-medium tabular-nums"}>
                    {shipping === 0 ? "Free" : `$${shipping}`}
                  </span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2">
                <Input
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button variant="outline">Apply</Button>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">${total.toLocaleString()}</span>
                </div>
              </div>

              <Button variant="bid" size="lg" className="w-full" asChild>
                <Link to="/checkout">
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Free shipping on orders over $500
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
