import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Package, DollarSign, TrendingUp, 
  Calendar, Image as ImageIcon, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock seller data
const myAuctions = [
  {
    id: "s1",
    title: "Vintage Camera Collection",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop",
    currentBid: 450,
    bids: 12,
    endsIn: "2d 4h",
    status: "live",
  },
  {
    id: "s2",
    title: "Rare Vinyl Records Set",
    image: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=200&h=200&fit=crop",
    currentBid: 280,
    bids: 8,
    endsIn: "5d",
    status: "live",
  },
];

const soldItems = [
  {
    id: "sold1",
    title: "Antique Pocket Watch",
    image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=200&h=200&fit=crop",
    soldFor: 1250,
    date: "Jan 10, 2025",
  },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Stats
  const stats = {
    totalEarnings: 4580,
    activeListings: 2,
    totalSold: 12,
    avgSalePrice: 382,
  };

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
                <p className="text-2xl font-bold">${stats.avgSalePrice}</p>
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
        {activeTab === "overview" && (
          <div className="space-y-4">
            {myAuctions.map((auction) => (
              <div
                key={auction.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <img
                  src={auction.image}
                  alt={auction.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{auction.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {auction.bids} bids • Ends in {auction.endsIn}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${auction.currentBid}</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/20 text-success">
                    Live
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        {activeTab === "sold" && (
          <div className="space-y-4">
            {soldItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.soldFor}</p>
                  <span className="text-xs text-muted-foreground">Sold</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Auction Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg p-6 rounded-xl bg-card border border-border animate-scale-in">
              <h2 className="text-xl font-semibold mb-6">Create New Auction</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Item name" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your item..." className="mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startingBid">Starting Bid</Label>
                    <Input id="startingBid" type="number" placeholder="$0" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <select
                      id="duration"
                      className="w-full mt-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      <option>1 day</option>
                      <option>3 days</option>
                      <option>5 days</option>
                      <option>7 days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Images</Label>
                  <div className="mt-1 border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop images or click to upload
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={() => setShowCreateForm(false)}>
                    Create Auction
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
