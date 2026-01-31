import { Link } from "react-router-dom";
import { Gavel } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Gavel className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>BidVault</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The trusted marketplace for live auctions and premium products.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-medium mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/auctions" className="hover:text-foreground transition-colors">Live Auctions</Link></li>
              <li><Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link></li>
              <li><Link to="/sell" className="hover:text-foreground transition-colors">Sell</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-medium mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/profile" className="hover:text-foreground transition-colors">Profile</Link></li>
              <li><Link to="/profile" className="hover:text-foreground transition-colors">My Bids</Link></li>
              <li><Link to="/profile" className="hover:text-foreground transition-colors">Orders</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BidVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
