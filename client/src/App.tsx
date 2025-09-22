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
import AdminDashboard from "@/pages/admin/dashboard";
import AdminContent from "@/pages/admin/content";
import AdminMessages from "@/pages/admin/messages";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/rsvp" component={RSVP} />
      <Route path="/photo-upload" component={PhotoUpload} />

      {/* Admin routes - authentication is handled inside the components */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/content" component={AdminContent} />
      <Route path="/admin/messages" component={AdminMessages} />

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
