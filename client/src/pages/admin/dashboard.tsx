import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import AdminNavigation from "@/components/admin-navigation";
import GuestTable from "@/components/guest-table";
import AddGuestModal from "@/components/add-guest-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Building, Plus } from "lucide-react";
import type { Guest } from "@shared/schema";

interface GuestStats {
  totalResponded: number;
  attending: number;
  declined: number;
  accommodationNeeded: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [addGuestModalOpen, setAddGuestModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<GuestStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: guests = [], isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: ["/api/admin/guests"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-serif font-bold text-foreground mb-2"
            data-testid="dashboard-title"
          >
            Wedding Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your wedding guests and RSVPs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-total">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Responded
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-total-value"
                  >
                    {statsLoading ? "..." : stats?.totalResponded || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-attending">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-secondary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Attending
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-attending-value"
                  >
                    {statsLoading ? "..." : stats?.attending || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-declined">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <UserX className="w-4 h-4 text-destructive" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Declined
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-declined-value"
                  >
                    {statsLoading ? "..." : stats?.declined || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-accommodation">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-accent-foreground" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Need Accommodation
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-accommodation-value"
                  >
                    {statsLoading ? "..." : stats?.accommodationNeeded || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guest List */}
        <Card data-testid="card-guest-list">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Guest List</CardTitle>
              <Button
                onClick={() => setAddGuestModalOpen(true)}
                className="flex items-center gap-2"
                data-testid="button-add-guest"
              >
                <Plus className="w-4 h-4" />
                Add Guest
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {guestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <GuestTable guests={guests} />
            )}
          </CardContent>
        </Card>

        {/* Add Guest Modal */}
        <AddGuestModal
          open={addGuestModalOpen}
          onClose={() => setAddGuestModalOpen(false)}
          onSuccess={() => setAddGuestModalOpen(false)}
        />
      </div>
    </div>
  );
}
