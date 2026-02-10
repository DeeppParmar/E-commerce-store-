import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, CreditCard, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

type Step = "address" | "payment" | "confirmation";

export default function Checkout() {
  const { items: cartItems, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const shipping = subtotal > 500 ? 0 : 15;
  const total = subtotal + shipping;

  const steps: { key: Step; label: string }[] = [
    { key: "address", label: "Shipping" },
    { key: "payment", label: "Payment" },
    { key: "confirmation", label: "Confirm" },
  ];

  useEffect(() => {
    if (cartItems.length === 0 && currentStep !== "confirmation") {
      navigate("/cart");
      toast({ title: "Cart is empty", description: "Please add items to checkout", variant: "destructive" });
    }
  }, [cartItems, currentStep, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinue = () => {
    if (currentStep === "address") {
      if (!formData.email || !formData.address || !formData.city || !formData.zipCode) {
        toast({ title: "Missing Information", description: "Please fill in all shipping details", variant: "destructive" });
        return;
      }
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      if (!formData.cardNumber || !formData.expiry || !formData.cvc) {
        toast({ title: "Missing Payment Info", description: "Please fill in card details", variant: "destructive" });
        return;
      }
      // Process order...
      clearCart();
      setCurrentStep("confirmation");
    }
  };

  if (currentStep === "confirmation") {
    return (
      <div className="animate-fade-in container py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-2">
          Thank you for your purchase. Your order #{Math.floor(Math.random() * 10000)} has been placed.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          You'll receive a confirmation email shortly.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link to="/profile">View Order</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>

          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    currentStep === step.key
                      ? "bg-primary text-primary-foreground"
                      : steps.findIndex((s) => s.key === currentStep) > index
                        ? "bg-success text-success-foreground"
                        : "bg-secondary text-muted-foreground"
                  )}
                >
                  {steps.findIndex((s) => s.key === currentStep) > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    currentStep === step.key ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {currentStep === "address" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <h2 className="font-semibold text-lg">Contact Information</h2>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <h2 className="font-semibold text-lg">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Button variant="bid" size="lg" className="w-full" onClick={handleContinue}>
                  Continue to Payment
                </Button>
              </div>
            )}

            {currentStep === "payment" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <h2 className="font-semibold text-lg">Payment Details</h2>
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Your payment information is encrypted and secure</span>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" size="lg" onClick={() => setCurrentStep("address")}>
                    Back
                  </Button>
                  <Button variant="bid" size="lg" className="flex-1" onClick={handleContinue}>
                    Place Order - ${total.toLocaleString()}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-xl bg-card border border-border space-y-4">
              <h2 className="font-semibold text-lg">Order Summary</h2>

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
