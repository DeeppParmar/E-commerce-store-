import { Link } from "react-router-dom";
import { Gavel, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 font-semibold text-lg mb-4 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform duration-200 group-hover:scale-105">
                <Gavel className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>BidVault</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The trusted marketplace for live auctions and premium products.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider text-foreground/80">Marketplace</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/auctions" className="hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="h-px w-0 group-hover:w-3 bg-primary transition-all duration-200" />
                  Live Auctions
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="h-px w-0 group-hover:w-3 bg-primary transition-all duration-200" />
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/sell" className="hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="h-px w-0 group-hover:w-3 bg-primary transition-all duration-200" />
                  Sell
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider text-foreground/80">Account</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/profile" className="hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="h-px w-0 group-hover:w-3 bg-primary transition-all duration-200" />
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="h-px w-0 group-hover:w-3 bg-primary transition-all duration-200" />
                  My Bids
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="h-px w-0 group-hover:w-3 bg-primary transition-all duration-200" />
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider text-foreground/80">Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="h-px w-0 group-hover:w-3 bg-primary transition-all duration-200" />
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="h-px w-0 group-hover:w-3 bg-primary transition-all duration-200" />
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="h-px w-0 group-hover:w-3 bg-primary transition-all duration-200" />
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BidVault. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
