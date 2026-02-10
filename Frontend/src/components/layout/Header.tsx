import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Gavel, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/auctions", label: "Auctions" },
  { href: "/shop", label: "Shop" },
  { href: "/sell", label: "Sell" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Gavel className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">BidVault</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            (() => {
              const isActive =
                link.href === "/"
                  ? location.pathname === "/" || location.pathname === "/home"
                  : location.pathname === link.href;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors stroke-hover",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })()
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                3
              </span>
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hidden sm:block">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Login</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => {
              if (!isMounted) return;
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
          >
            {isMounted && (
              <span className="relative h-5 w-5">
                <Sun
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-transform duration-300",
                    resolvedTheme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                  )}
                />
                <Moon
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-transform duration-300",
                    resolvedTheme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
                  )}
                />
              </span>
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? location.pathname === "/" || location.pathname === "/home"
                  : location.pathname === link.href;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors stroke-hover",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground transition-colors stroke-hover"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground transition-colors stroke-hover"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
