import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, User, Menu, X, Gavel, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "next-themes";
import { NotificationBell } from "./NotificationBell";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/auctions", label: "Auctions" },
  { href: "/shop", label: "Shop" },
  { href: "/sell", label: "Sell" },
];

export function Header() {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const { isAuthenticated, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      closeMobileMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function closeMobileMenu() {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }, 250);
  }

  function toggleMobileMenu() {
    if (mobileMenuOpen) {
      closeMobileMenu();
    } else {
      setMobileMenuOpen(true);
    }
  }

  function isActive(href: string) {
    if (href === "/") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname === href || location.pathname.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-xl tracking-tight group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Gavel className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">BidVault</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-accent/50",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {/* Active underline indicator */}
                  <span
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300",
                      active ? "w-4/5 opacity-100" : "w-0 opacity-0"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-semibold flex items-center justify-center text-primary-foreground animate-scale-in shadow-sm">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <NotificationBell />
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
                    "absolute inset-0 h-5 w-5 transition-all duration-300",
                    resolvedTheme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                  )}
                />
                <Moon
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-all duration-300",
                    resolvedTheme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
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
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="relative h-5 w-5">
              <Menu
                className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-200",
                  mobileMenuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                )}
              />
              <X
                className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-200",
                  mobileMenuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                )}
              />
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu — animated */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className={cn(
            "md:hidden border-t border-border overflow-hidden",
            isClosing ? "animate-slide-up" : "animate-slide-down"
          )}
        >
          <nav className="container py-3 flex flex-col gap-1">
            {navLinks.map((link, i) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 stagger-item",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  style={{ "--stagger-index": i } as React.CSSProperties}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="border-t border-border my-1" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 stagger-item"
                  style={{ "--stagger-index": navLinks.length } as React.CSSProperties}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    closeMobileMenu();
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 text-left stagger-item"
                  style={{ "--stagger-index": navLinks.length + 1 } as React.CSSProperties}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 stagger-item"
                style={{ "--stagger-index": navLinks.length } as React.CSSProperties}
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
