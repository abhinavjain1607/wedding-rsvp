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
import {
  Users,
  UserCheck,
  UserX,
  Building,
  Plus,
  Car,
  Plane,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
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

  // Calculate enhanced stats from guest data
  const enhancedStats = {
    totalResponded: guests.length,
    attending: guests.filter((g) => g.rsvpStatus === "attending").length,
    declined: guests.filter((g) => g.rsvpStatus === "declined").length,
    tentative: guests.filter((g) => g.rsvpStatus === "tentative").length,
    accommodationNeeded: guests.filter((g) => g.requiresAccommodation).length,
    step1Completed: guests.filter((g) => g.step1Completed).length,
    step2Completed: guests.filter((g) => g.step2Completed).length,
    needsTaxi: guests.filter(
      (g) => g.needsTaxiDec10 || g.needsTaxiDec11 || g.needsTaxiReturn
    ).length,
    hasFlightInfo: guests.filter(
      (g) => g.flightNumber && g.flightNumber.trim() !== ""
    ).length,
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
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
                    {guestsLoading ? "..." : enhancedStats.totalResponded}
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
                    {guestsLoading ? "..." : enhancedStats.attending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-declined">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <UserX className="w-4 h-4 text-red-600" />
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
                    {guestsLoading ? "..." : enhancedStats.declined}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-tentative">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Tentative
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-tentative-value"
                  >
                    {guestsLoading ? "..." : enhancedStats.tentative}
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
                    {guestsLoading ? "..." : enhancedStats.accommodationNeeded}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Planning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-step1">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Step 1 Complete
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-step1-value"
                  >
                    {guestsLoading ? "..." : enhancedStats.step1Completed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-step2">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Step 2 Complete
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-step2-value"
                  >
                    {guestsLoading ? "..." : enhancedStats.step2Completed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-taxi">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Car className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Need Taxi
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-taxi-value"
                  >
                    {guestsLoading ? "..." : enhancedStats.needsTaxi}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-flights">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Plane className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Flight Info
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-flights-value"
                  >
                    {guestsLoading ? "..." : enhancedStats.hasFlightInfo}
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
