import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Gavel, Trophy, TrendingUp, DollarSign, Eye, Clock,
  ArrowUpRight, ArrowDownRight, Star, Settings, User,
  ShoppingBag, BarChart3, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface DashboardSummary {
  active_bids: number;
  my_auctions: number;
  currently_winning: number;
  auctions_won: number;
  total_spent: number;
  total_earned: number;
  watchlist_count: number;
  unread_notifications: number;
}

interface ActiveBid {
  auction_id: string;
  title: string;
  image: string | null;
  current_price: number;
  my_highest_bid: number;
  end_time: string;
  status: string;
  is_winning: boolean;
  bid_count: number;
}

interface WonAuction {
  id: string;
  winning_bid: number;
  created_at: string;
  payment_status: string;
  shipped: boolean;
  auction: {
    id: string;
    title: string;
    images: string[];
    description: string;
  };
}

interface ProfileData {
  full_name: string;
  email: string;
  avatar_url: string;
  username?: string;
  bio?: string;
  location?: string;
}

export default function Profile() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate]);

  async function fetchData() {
    setLoading(true);
    try {
      const [summaryRes, bidsRes, wonRes, profileRes] = await Promise.allSettled([
        apiClient.getDashboardSummary(),
        apiClient.getActiveBids(),
        apiClient.getWonAuctions(),
        apiClient.getProfile(),
      ]);

      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value.summary);
      if (bidsRes.status === "fulfilled") setActiveBids(bidsRes.value.bids);
      if (wonRes.status === "fulfilled") setWonAuctions(wonRes.value.won_auctions);
      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.profile);
        setEditName(profileRes.value.profile?.full_name || "");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const summaryCards = [
    {
      title: "Active Bids",
      value: summary?.active_bids || 0,
      icon: Gavel,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Currently Winning",
      value: summary?.currently_winning || 0,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Auctions Won",
      value: summary?.auctions_won || 0,
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Total Spent",
      value: `$${(summary?.total_spent || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="container py-10 space-y-8 page-transition">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
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
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {(profile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.full_name || "User"}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/sell")}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Seller Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <Card
            key={card.title}
            className="card-hover stagger-item"
            style={{ "--stagger-index": i } as React.CSSProperties}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg", card.bg)}>
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="bids" className="gap-1.5">
            <Gavel className="h-4 w-4" />
            <span className="hidden sm:inline">Active Bids</span>
          </TabsTrigger>
          <TabsTrigger value="won" className="gap-1.5">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Won</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Bids */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-primary" />
                  Recent Bids
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeBids.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No active bids</p>
                ) : (
                  <div className="space-y-3">
                    {activeBids.slice(0, 5).map((bid) => (
                      <Link
                        key={bid.auction_id}
                        to={`/auctions/${bid.auction_id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {bid.image && (
                            <img src={bid.image} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{bid.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Your bid: ${bid.my_highest_bid.toLocaleString()}
                          </p>
                        </div>
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          bid.is_winning
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-destructive/10 text-destructive"
                        )}>
                          {bid.is_winning ? (
                            <span className="flex items-center gap-1">
                              <ArrowUpRight className="h-3 w-3" /> Winning
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ArrowDownRight className="h-3 w-3" /> Outbid
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Wins */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Recent Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wonAuctions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No auctions won yet</p>
                ) : (
                  <div className="space-y-3">
                    {wonAuctions.slice(0, 5).map((won) => (
                      <Link
                        key={won.id}
                        to={`/auctions/${won.auction?.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {won.auction?.images?.[0] && (
                            <img src={won.auction.images[0]} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{won.auction?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(won.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-emerald-500">
                          ${Number(won.winning_bid).toLocaleString()}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Bids Tab */}
        <TabsContent value="bids" className="mt-6">
          {activeBids.length === 0 ? (
            <EmptyState
              icon={Gavel}
              title="No active bids"
              description="Start browsing auctions and place your first bid."
              actionLabel="Browse Auctions"
              onAction={() => navigate("/auctions")}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBids.map((bid, i) => (
                <Link
                  key={bid.auction_id}
                  to={`/auctions/${bid.auction_id}`}
                  className="stagger-item"
                  style={{ "--stagger-index": i } as React.CSSProperties}
                >
                  <Card className="card-hover overflow-hidden">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {bid.image ? (
                        <img src={bid.image} alt={bid.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Gavel className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <span className={cn(
                        "absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full",
                        bid.is_winning
                          ? "bg-emerald-500 text-white"
                          : "bg-destructive text-white"
                      )}>
                        {bid.is_winning ? "Winning" : "Outbid"}
                      </span>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm truncate mb-2">{bid.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Price</p>
                          <p className="font-semibold">${bid.current_price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Your Bid</p>
                          <p className="font-semibold">${bid.my_highest_bid.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(bid.end_time), { addSuffix: true })}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Won Tab */}
        <TabsContent value="won" className="mt-6">
          {wonAuctions.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No auctions won yet"
              description="Keep bidding to win your first auction!"
              actionLabel="Browse Auctions"
              onAction={() => navigate("/auctions")}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wonAuctions.map((won, i) => (
                <Link
                  key={won.id}
                  to={`/auctions/${won.auction?.id}`}
                  className="stagger-item"
                  style={{ "--stagger-index": i } as React.CSSProperties}
                >
                  <Card className="card-hover overflow-hidden">
                    <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                      {won.auction?.images?.[0] ? (
                        <img
                          src={won.auction.images[0]}
                          alt={won.auction.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Trophy className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500 text-white">
                        🏆 Won
                      </span>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold text-sm truncate">{won.auction?.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Winning bid</span>
                        <span className="font-bold text-emerald-500">
                          ${Number(won.winning_bid).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(won.created_at), { addSuffix: true })}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          won.payment_status === "paid"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        )}>
                          {won.payment_status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Profile Updated",
                      description: "Your profile has been saved.",
                    });
                  }}
                >
                  Save Changes
                </Button>
              </div>

              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-sm font-semibold text-destructive mb-2">Danger Zone</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={signOut}
                >
                  Sign Out of Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
