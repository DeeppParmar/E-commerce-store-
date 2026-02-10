import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User, Settings, Wallet, Package, Gavel, Trophy,
  ChevronRight, Edit, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Bid = {
  id: string;
  amount: number;
  created_at: string;
  auction: {
    id: string;
    title: string;
    images: string[];
    end_time: string;
    status: string;
    current_price: number;
  };
};

type Win = {
  id: string;
  title: string;
  images: string[];
  current_price: number; // final price
  end_time: string;
  status: string;
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState("bids");
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Win[]>([]);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!user) return;

        // Fetch Bids
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select(`
            *,
            auction:auctions (
              id,
              title,
              images,
              end_time,
              status,
              current_price
            )
          `)
          .eq('bidder_id', user.id)
          .order('created_at', { ascending: false });

        if (bidsError) throw bidsError;

        // Map data to match expected shape if necessary, or just cast
        // Supabase returns nested objects, which matches our type definition if we align them.
        // Our 'auction' type in Bid matches valid Supabase response structure roughly.
        // We might need to handle array vs single object for relation. 
        // In this case 'auction' is a single object (Many-to-One).

        // Ensure type safety manually or via casting for now
        const mappedBids: Bid[] = (bidsData || []).map((b: any) => ({
          id: b.id,
          amount: b.amount,
          created_at: b.created_at,
          auction: b.auction // Supabase returns single object for foreign key if configured correctly
        }));

        setActiveBids(mappedBids);

        // Fetch Wins
        const { data: winsData, error: winsError } = await supabase
          .from('auctions')
          .select('*')
          .eq('winner_id', user.id)
          .eq('status', 'ended')
          .order('end_time', { ascending: false });

        if (winsError) throw winsError;

        setWonAuctions((winsData || []) as any);

      } catch (error) {
        console.error("Failed to fetch profile data", error);
        toast({ title: "Error", description: "Could not load profile data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, toast]);

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
              <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || "User"}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
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
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
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
                {activeBids.length === 0 ? (
                  <p className="text-muted-foreground">You haven't placed any bids yet.</p>
                ) : (
                  activeBids.map((bid) => (
                    <Link
                      key={bid.id}
                      to={`/auctions/${bid.auction?.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-muted-foreground transition-colors"
                    >
                      <img
                        src={bid.auction?.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop"}
                        alt={bid.auction?.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-1">{bid.auction?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Your bid: ${bid.amount.toLocaleString()} • Status: {bid.auction?.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${bid.auction?.current_price.toLocaleString()}</p>
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            bid.amount >= bid.auction?.current_price
                              ? "bg-success/20 text-success"
                              : "bg-destructive/20 text-destructive"
                          )}
                        >
                          {bid.amount >= bid.auction?.current_price ? "Winning" : "Outbid"}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeTab === "won" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Won Auctions</h2>
                {wonAuctions.length === 0 ? (
                  <p className="text-muted-foreground">You haven't won any auctions yet.</p>
                ) : (
                  wonAuctions.map((auction) => (
                    <div
                      key={auction.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                    >
                      <img
                        src={auction.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop"}
                        alt={auction.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(auction.end_time).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${auction.current_price.toLocaleString()}</p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/20 text-success">
                          Won
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="text-center py-12 text-muted-foreground">
                No orders found.
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
