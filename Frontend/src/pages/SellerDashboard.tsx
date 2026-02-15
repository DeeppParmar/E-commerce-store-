import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import {
  Plus, Package, DollarSign, BarChart3, TrendingUp,
  ArrowLeft, ArrowRight, Check, ImagePlus, X, Clock,
  Tag, Gavel, Eye, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = [
  "Art", "Watches", "Jewelry", "Electronics", "Collectibles",
  "Fashion", "Vehicles", "Home", "Books", "Music", "Sports", "Other"
];

const CONDITIONS = [
  { value: "new", label: "Brand New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for_parts", label: "For Parts" },
];

const DURATIONS = [
  { value: "1", label: "1 Day" },
  { value: "3", label: "3 Days" },
  { value: "5", label: "5 Days" },
  { value: "7", label: "7 Days" },
  { value: "10", label: "10 Days" },
  { value: "14", label: "14 Days" },
];

type WizardStep = "details" | "pricing" | "duration" | "review";
const WIZARD_STEPS: { id: WizardStep; label: string; icon: any }[] = [
  { id: "details", label: "Item Details", icon: Package },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "duration", label: "Duration", icon: Clock },
  { id: "review", label: "Review", icon: Check },
];

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [myAuctions, setMyAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Wizard state
  const [step, setStep] = useState<WizardStep>("details");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [condition, setCondition] = useState("good");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [startingPrice, setStartingPrice] = useState("");
  const [minIncrement, setMinIncrement] = useState("10");
  const [reservePrice, setReservePrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [shippingCost, setShippingCost] = useState("0");
  const [sellerLocation, setSellerLocation] = useState("");
  const [duration, setDuration] = useState("7");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchMyAuctions();
  }, [isAuthenticated, navigate]);

  async function fetchMyAuctions() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("auctions")
        .select("*")
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyAuctions(data || []);
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
    } finally {
      setLoading(false);
    }
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || images.length >= 5) return;

    setImageUploading(true);
    try {
      for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${user?.id}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("auction-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("auction-images")
          .getPublicUrl(fileName);

        setImages((prev) => [...prev, publicUrl]);
      }
      toast({ title: "Images uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload image",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === step);

  function nextStep() {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setStep(WIZARD_STEPS[currentStepIndex + 1].id);
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      setStep(WIZARD_STEPS[currentStepIndex - 1].id);
    }
  }

  function canProceed() {
    switch (step) {
      case "details":
        return title.trim().length > 0;
      case "pricing":
        return parseFloat(startingPrice) > 0;
      case "duration":
        return true;
      default:
        return true;
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + parseInt(duration));

      await apiClient.createAuction({
        title,
        description,
        images,
        starting_price: parseFloat(startingPrice),
        end_time: endTime.toISOString(),
        category,
        condition,
        min_increment: parseFloat(minIncrement) || 10,
        tags,
        shipping_cost: parseFloat(shippingCost) || 0,
        seller_location: sellerLocation || undefined,
        reserve_price: reservePrice ? parseFloat(reservePrice) : undefined,
        buy_now_price: buyNowPrice ? parseFloat(buyNowPrice) : undefined,
      });

      toast({
        title: "Auction Created! 🎉",
        description: "Your auction is now live.",
      });

      // Reset form
      setCreating(false);
      setStep("details");
      setTitle("");
      setDescription("");
      setCategory("Other");
      setCondition("good");
      setTags([]);
      setImages([]);
      setStartingPrice("");
      setMinIncrement("10");
      setReservePrice("");
      setBuyNowPrice("");
      setShippingCost("0");
      setSellerLocation("");
      setDuration("7");
      fetchMyAuctions();
    } catch (error: any) {
      toast({
        title: "Failed to create auction",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Summary stats
  const activeAuctions = myAuctions.filter((a) => a.status === "active");
  const endedAuctions = myAuctions.filter((a) => a.status === "ended");
  const totalBids = myAuctions.reduce((sum, a) => sum + (a.bid_count || 0), 0);
  const totalRevenue = endedAuctions.reduce(
    (sum, a) => sum + (parseFloat(a.current_price) || 0),
    0
  );

  const statCards = [
    { title: "Active Auctions", value: activeAuctions.length, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Bids", value: totalBids, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Items Sold", value: endedAuctions.length, icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  if (loading) {
    return (
      <div className="container py-10 space-y-8 page-transition">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-8 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your auctions and track performance</p>
        </div>
        <Button onClick={() => { setCreating(!creating); setStep("details"); }}>
          <Plus className="h-4 w-4 mr-2" />
          {creating ? "Cancel" : "New Auction"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={card.title} className="card-hover stagger-item" style={{ "--stagger-index": i } as React.CSSProperties}>
            <CardContent className="p-5">
              <div className={cn("p-2 rounded-lg w-fit mb-3", card.bg)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Auction Creation Wizard */}
      {creating && (
        <Card className="animate-slide-down overflow-hidden">
          {/* Step Indicator */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              {WIZARD_STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => i <= currentStepIndex && setStep(s.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      s.id === step
                        ? "bg-primary text-primary-foreground"
                        : i < currentStepIndex
                          ? "bg-primary/10 text-primary cursor-pointer"
                          : "text-muted-foreground"
                    )}
                  >
                    <s.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 mx-1",
                      i < currentStepIndex ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <CardContent className="p-6">
            {/* Step 1: Item Details */}
            {step === "details" && (
              <div className="space-y-5 max-w-2xl animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Vintage Rolex Submariner 1968"
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your item in detail..."
                    rows={4}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags (max 5)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button variant="outline" size="sm" onClick={addTag} disabled={tags.length >= 5}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-1"
                        >
                          {tag}
                          <button onClick={() => removeTag(tag)}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label>Images (max 5)</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-0.5 bg-destructive rounded-full text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <ImagePlus className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">
                          {imageUploading ? "..." : "Upload"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={imageUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {step === "pricing" && (
              <div className="space-y-5 max-w-lg animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="price">Starting Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder="0.00"
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="increment">Minimum Bid Increment ($)</Label>
                  <Input
                    id="increment"
                    type="number"
                    min="1"
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(e.target.value)}
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground">Each new bid must exceed the current by this amount</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reserve">Reserve Price ($) <span className="text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="reserve"
                    type="number"
                    min="0"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    placeholder="Minimum sale price"
                  />
                  <p className="text-xs text-muted-foreground">If bids don't reach this, the item isn't sold</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buynow">Buy Now Price ($) <span className="text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="buynow"
                    type="number"
                    min="0"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(e.target.value)}
                    placeholder="Instant purchase price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping">Shipping Cost ($)</Label>
                  <Input
                    id="shipping"
                    type="number"
                    min="0"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Seller Location <span className="text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="location"
                    value={sellerLocation}
                    onChange={(e) => setSellerLocation(e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Duration */}
            {step === "duration" && (
              <div className="space-y-5 max-w-lg animate-fade-in">
                <div className="space-y-2">
                  <Label>Auction Duration</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDuration(d.value)}
                        className={cn(
                          "p-4 rounded-xl border text-center transition-all",
                          duration === d.value
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <Clock className="h-5 w-5 mx-auto mb-2" />
                        <span className="text-sm">{d.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Auction will end on {
                      new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000)
                        .toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === "review" && (
              <div className="space-y-6 max-w-2xl animate-fade-in">
                <h3 className="text-lg font-semibold">Review Your Listing</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Preview Image */}
                  <div className="aspect-[4/3] rounded-xl bg-muted overflow-hidden">
                    {images[0] ? (
                      <img src={images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <h4 className="text-xl font-bold">{title}</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{category}</span>
                      <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium capitalize">{condition.replace("_", " ")}</span>
                    </div>
                    {description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
                    )}
                    <div className="space-y-1 pt-2 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Starting price</span>
                        <span className="font-semibold">${parseFloat(startingPrice || "0").toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Min increment</span>
                        <span>${parseFloat(minIncrement || "10").toLocaleString()}</span>
                      </div>
                      {reservePrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reserve</span>
                          <span>${parseFloat(reservePrice).toLocaleString()}</span>
                        </div>
                      )}
                      {buyNowPrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Buy Now</span>
                          <span className="text-emerald-500 font-semibold">${parseFloat(buyNowPrice).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span>{DURATIONS.find(d => d.value === duration)?.label}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>${parseFloat(shippingCost || "0").toLocaleString()}</span>
                      </div>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {step === "review" ? (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Creating..." : "Create Auction 🎉"}
                </Button>
              ) : (
                <Button onClick={nextStep} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Auctions List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Auctions</h2>
        {myAuctions.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No auctions yet"
            description="Create your first auction and start selling!"
            actionLabel="Create Auction"
            onAction={() => setCreating(true)}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAuctions.map((auction, i) => (
              <Link
                key={auction.id}
                to={`/auctions/${auction.id}`}
                className="stagger-item"
                style={{ "--stagger-index": i } as React.CSSProperties}
              >
                <Card className="card-hover overflow-hidden">
                  <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                    {auction.images?.[0] ? (
                      <img
                        src={auction.images[0]}
                        alt={auction.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <span className={cn(
                      "absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full",
                      auction.status === "active"
                        ? "bg-emerald-500 text-white"
                        : auction.status === "ended"
                          ? "bg-muted-foreground text-white"
                          : "bg-destructive text-white"
                    )}>
                      {auction.status}
                    </span>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm truncate">{auction.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-bold">${parseFloat(auction.current_price).toLocaleString()}</span>
                    </div>
                    {auction.status === "active" && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Ends {formatDistanceToNow(new Date(auction.end_time), { addSuffix: true })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
