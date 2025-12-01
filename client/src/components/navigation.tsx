import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", label: "Home", id: "home" },
    { href: "#story", label: "Our Story", id: "story" },
    { href: "#details", label: "Details", id: "details" },
    { href: "#gallery", label: "Gallery", id: "gallery" },
  ];

  const scrollToSection = (id: string) => {
    if (location !== "/") {
      window.location.href = `/#${id}`;
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className="glass-effect border-b border-border sticky top-0 z-50"
      data-testid="navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href={`/${window.location.search}`}>
              <div className="flex items-center space-x-3 cursor-pointer">
                <img
                  src="/images/logo.svg"
                  alt="Sneha & Abhinav Wedding Logo"
                  className="w-8 h-8 text-primary"
                />
                <h1
                  className="text-xl font-serif font-semibold text-primary"
                  data-testid="nav-logo"
                >
                  Sneha & Abhinav
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-foreground hover:text-primary transition-colors"
                data-testid={`nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
            <Link href="/itinerary">
              <button
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-itinerary"
              >
                Itinerary
              </button>
            </Link>
            <Link href={`/rsvp${window.location.search}`}>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="nav-rsvp"
              >
                RSVP
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="nav-mobile-toggle"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-left text-foreground hover:text-primary transition-colors p-2"
                      data-testid={`nav-mobile-${item.id}`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <Link href="/itinerary">
                    <button
                      className="text-left text-foreground hover:text-primary transition-colors p-2 w-full"
                      onClick={() => setIsOpen(false)}
                      data-testid="nav-mobile-itinerary"
                    >
                      Itinerary
                    </button>
                  </Link>
                  <Link href={`/rsvp${window.location.search}`}>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setIsOpen(false)}
                      data-testid="nav-mobile-rsvp"
                    >
                      RSVP
                    </Button>
                  </Link>
                  {!isAuthenticated ? (
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsOpen(false)}
                        data-testid="nav-mobile-admin"
                      >
                        Admin
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/admin">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsOpen(false)}
                        data-testid="nav-mobile-admin-dashboard"
                      >
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
