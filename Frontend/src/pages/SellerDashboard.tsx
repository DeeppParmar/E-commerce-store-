import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Package, DollarSign, TrendingUp,
  Image as ImageIcon, ChevronRight, Edit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Auction = {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  end_time: string;
  status: string;
  images: string[];
  created_at: string;
  winner_id?: string;
};

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // Use 'overview' for Active, 'sold' for Sold
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeListings: 0,
    totalSold: 0,
    avgSalePrice: 0,
  });

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [duration, setDuration] = useState("1"); // days
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop");



  // ... inside component

  const fetchAuctions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: auctionsData, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const auctions: Auction[] = (auctionsData || []) as any;
      setMyAuctions(auctions);

      // Calculate Stats
      const soldItems = auctions.filter(a => a.status === 'ended' || (a.status === 'active' && new Date(a.end_time) <= new Date()));
      const activeItems = auctions.filter(a => a.status === 'active' && new Date(a.end_time) > new Date());
      const totalEarnings = soldItems.reduce((sum, item) => sum + Number(item.current_price), 0);

      setStats({
        totalEarnings,
        activeListings: activeItems.length,
        totalSold: soldItems.length,
        avgSalePrice: soldItems.length > 0 ? totalEarnings / soldItems.length : 0
      });
    } catch (error) {
      console.error("Failed to fetch auctions", error);
      toast({ title: "Error", description: "Could not load auctions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAuctions();
    }
  }, [user]);

  // ... inside component
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const { uploadImage } = await import("@/lib/storage");
      const publicUrl = await uploadImage(file);

      if (publicUrl) {
        setImageUrl(publicUrl);
        toast({ title: "Success", description: "Image uploaded successfully" });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateAuction = async () => {
    if (!title || !startingPrice || !imageUrl) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Calculate End Time
      const days = parseInt(duration);
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + days);

      const { error } = await supabase
        .from('auctions')
        .insert({
          seller_id: user?.id!,
          title,
          description,
          starting_price: parseFloat(startingPrice),
          current_price: parseFloat(startingPrice),
          end_time: endTime.toISOString(),
          status: 'active',
          images: [imageUrl],
        });

      if (error) throw error;

      toast({ title: "Success", description: "Auction created successfully!" });
      setShowCreateForm(false);
      // Reset form
      setTitle("");
      setDescription("");
      setStartingPrice("");
      setImageUrl("");

      // Refresh list
      fetchAuctions();

    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not create auction", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const displayedAuctions = activeTab === 'overview'
    ? myAuctions.filter(a => a.status === 'active' && new Date(a.end_time) > new Date())
    : myAuctions.filter(a => a.status === 'ended' || new Date(a.end_time) <= new Date());

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">Manage your listings and sales</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Auction
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Package className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{stats.activeListings}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sold</p>
                <p className="text-2xl font-bold">{stats.totalSold}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Sale Price</p>
                <p className="text-2xl font-bold">${stats.avgSalePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "overview"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Live Auctions
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "sold"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Sold Items
          </button>
        </div>

        {/* Content */}
        {displayedAuctions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {activeTab === 'overview' ? "No active auctions found. Create one to get started!" : "No sold items yet."}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedAuctions.map(auction => (
              <Link
                key={auction.id}
                to={`/auctions/${auction.id}`}
                className="block"
              >
                <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-muted-foreground transition-colors">
                  <img
                    src={auction.images?.[0] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop"}
                    alt={auction.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{auction.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Current Price: ${auction.current_price.toLocaleString()}</span>
                      <span>Ends: {new Date(auction.end_time).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      auction.status === 'active' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {auction.status.toUpperCase()}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Auction Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg p-6 rounded-xl bg-card border border-border animate-scale-in max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-6">Create New Auction</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Item name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your item..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startingBid">Starting Bid ($)</Label>
                    <Input
                      id="startingBid"
                      type="number"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full mt-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="5">5 days</option>
                      <option value="7">7 days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Image URL</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="mt-1"
                    />
                    {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  {imageUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                      <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleCreateAuction} disabled={loading}>
                    {loading ? "Creating..." : "Create Auction"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
