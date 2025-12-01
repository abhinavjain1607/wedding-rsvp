import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import RSVP from "@/pages/rsvp";
import Login from "@/pages/login";
import PhotoUpload from "@/pages/photo-upload";
import Itinerary from "@/pages/itinerary";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminContent from "@/pages/admin/content";
import AdminMessages from "@/pages/admin/messages";
import { useAuth } from "@/hooks/useAuth";

// Protected Route Component
function ProtectedRoute({ component: Component }: { component: any }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login instead of trying to use router
    window.location.href = "/login";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route
        path="/admin-logout"
        component={() => {
          // Call logout endpoint to destroy session
          fetch("/api/local-logout", {
            method: "POST",
            credentials: "include",
          }).finally(() => {
            // Force logout all admin sessions
            localStorage.setItem("admin-logged-out", "true");
            localStorage.removeItem("admin-auth");
            sessionStorage.clear();
            // Redirect to home
            window.location.href = "/";
          });
          return null;
        }}
      />
      <Route path="/rsvp" component={RSVP} />
      <Route path="/photo-upload" component={PhotoUpload} />
      <Route path="/itinerary" component={Itinerary} />

      {/* Protected Admin routes */}
      <Route
        path="/admin"
        component={() => <ProtectedRoute component={AdminDashboard} />}
      />
      <Route
        path="/admin/content"
        component={() => <ProtectedRoute component={AdminContent} />}
      />
      <Route
        path="/admin/messages"
        component={() => <ProtectedRoute component={AdminMessages} />}
      />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
