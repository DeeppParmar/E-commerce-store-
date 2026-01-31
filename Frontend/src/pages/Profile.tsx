import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Settings, Wallet, Package, Gavel, Trophy, 
  ChevronRight, Edit, LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const activeBids = [
  {
    id: "1",
    title: "Vintage Rolex Submariner 1968",
    image: "https://images.unsplash.com/photo-1587836374828-a58e06cc6b8e?w=200&h=200&fit=crop",
    currentBid: 12500,
    yourBid: 12000,
    status: "outbid",
    endsIn: "45m",
  },
  {
    id: "2",
    title: "Original Abstract Oil Painting",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop",
    currentBid: 3200,
    yourBid: 3200,
    status: "winning",
    endsIn: "2h",
  },
];

const wonAuctions = [
  {
    id: "3",
    title: "Antique Persian Rug",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=200&h=200&fit=crop",
    finalBid: 4800,
    date: "Jan 15, 2025",
    status: "shipped",
  },
];

const orders = [
  {
    id: "o1",
    items: 2,
    total: 578,
    date: "Jan 20, 2025",
    status: "delivered",
  },
  {
    id: "o2",
    items: 1,
    total: 329,
    date: "Jan 18, 2025",
    status: "in-transit",
  },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("bids");

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">John Doe</h1>
              <p className="text-muted-foreground">john@example.com</p>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            <button
              onClick={() => setActiveTab("bids")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                activeTab === "bids"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Gavel className="h-4 w-4" />
              Active Bids
            </button>
            <button
              onClick={() => setActiveTab("won")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                activeTab === "won"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Trophy className="h-4 w-4" />
              Won Auctions
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                activeTab === "orders"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Package className="h-4 w-4" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                activeTab === "wallet"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Wallet className="h-4 w-4" />
              Wallet
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                activeTab === "settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

            <div className="pt-4 border-t border-border">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "bids" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Active Bids</h2>
                {activeBids.map((bid) => (
                  <Link
                    key={bid.id}
                    to={`/auctions/${bid.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-muted-foreground transition-colors"
                  >
                    <img
                      src={bid.image}
                      alt={bid.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-1">{bid.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Your bid: ${bid.yourBid.toLocaleString()} • Ends in {bid.endsIn}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${bid.currentBid.toLocaleString()}</p>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          bid.status === "winning"
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                        )}
                      >
                        {bid.status === "winning" ? "Winning" : "Outbid"}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}

            {activeTab === "won" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Won Auctions</h2>
                {wonAuctions.map((auction) => (
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
                      <p className="text-sm text-muted-foreground">{auction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${auction.finalBid.toLocaleString()}</p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/20 text-success">
                        {auction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Orders</h2>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Order #{order.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.items} items • {order.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total}</p>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          order.status === "delivered"
                            ? "bg-success/20 text-success"
                            : "bg-warning/20 text-warning"
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Wallet</h2>
                <div className="p-6 rounded-xl bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-4xl font-bold">$1,250.00</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button size="lg" className="w-full">Add Funds</Button>
                  <Button variant="outline" size="lg" className="w-full">Withdraw</Button>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Settings</h2>
                <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Display Name</label>
                    <Input defaultValue="John Doe" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <Input defaultValue="john@example.com" className="mt-1" />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
