import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  LogOut,
} from "lucide-react";

export default function AdminNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear any stored auth state and redirect to home
      localStorage.removeItem("admin-auth");
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/content", label: "Content", icon: FileText },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <nav
      className="bg-card border-b border-border"
      data-testid="admin-navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin">
              <div className="flex items-center space-x-3 cursor-pointer">
                <img
                  src="/images/logo.svg"
                  alt="Wedding Admin Logo"
                  className="w-6 h-6 text-primary"
                />
                <h1
                  className="text-xl font-semibold text-foreground"
                  data-testid="admin-logo"
                >
                  Wedding Admin
                </h1>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:text-primary hover:bg-muted"
                      }`}
                      data-testid={`admin-nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="admin-nav-home">
                View Site
              </Button>
            </Link>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span data-testid="admin-user-name">
                {(user as any)?.firstName || (user as any)?.email || "Admin"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
                data-testid="admin-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
