import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MessageModal from "@/components/message-modal";
import GuestDetailsModal from "@/components/guest-details-modal";
import {
  Search,
  MessageSquare,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";
import type { Guest } from "@shared/schema";

interface GuestTableProps {
  guests: Guest[];
}

export default function GuestTable({ guests }: GuestTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [bulkMessageMode, setBulkMessageMode] = useState(false);
  const [selectedGuestForDetails, setSelectedGuestForDetails] =
    useState<Guest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete guest mutation
  const deleteGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      const response = await apiRequest(
        "DELETE",
        `/api/admin/guests/${guestId}`
      );
      if (!response.ok) {
        throw new Error("Failed to delete guest");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Guest deleted successfully",
      });
      setDeleteConfirmOpen(false);
      setGuestToDelete(null);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter guests based on search and status
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phoneWhatsapp?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || guest.rsvpStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSelectGuest = (guestId: string, checked: boolean) => {
    if (checked) {
      setSelectedGuests([...selectedGuests, guestId]);
    } else {
      setSelectedGuests(selectedGuests.filter((id) => id !== guestId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuests(filteredGuests.map((guest) => guest.id));
    } else {
      setSelectedGuests([]);
    }
  };

  const handleSendMessage = (guest: Guest) => {
    setSelectedGuest(guest);
    setBulkMessageMode(false);
    setMessageModalOpen(true);
  };

  const handleBulkMessage = () => {
    if (selectedGuests.length === 0) {
      toast({
        title: "No guests selected",
        description: "Please select guests to send a message to",
        variant: "destructive",
      });
      return;
    }
    setBulkMessageMode(true);
    setSelectedGuest(null);
    setMessageModalOpen(true);
  };

  const openGuestDetails = (guest: Guest) => {
    setSelectedGuestForDetails(guest);
    setDetailsModalOpen(true);
  };

  const closeGuestDetails = () => {
    setSelectedGuestForDetails(null);
    setDetailsModalOpen(false);
  };

  const handleDeleteGuest = (guest: Guest) => {
    setGuestToDelete(guest);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteGuest = () => {
    if (guestToDelete) {
      deleteGuestMutation.mutate(guestToDelete.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "attending":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Attending
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      case "tentative":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="w-3 h-3 mr-1" />
            Tentative
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getCompletionBadge = (guest: Guest) => {
    if (!guest.step1Completed) {
      return (
        <Badge variant="outline" className="text-xs">
          Incomplete
        </Badge>
      );
    }

    if (guest.rsvpStatus === "attending" && !guest.step2Completed) {
      return (
        <Badge
          variant="outline"
          className="text-xs border-yellow-300 text-yellow-700"
        >
          Step 2 Pending
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
        Complete
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPickupDateTime = (pickupDate: string, pickupTime: string) => {
    // Convert date format (e.g., "dec10" -> "Dec 10")
    const dateFormatted = pickupDate.replace(
      /^(dec|december)(\d+)$/i,
      (_, month, day) => {
        return `Dec ${day}`;
      }
    );

    // Convert time format (e.g., "12:30pm" -> "12:30 PM")
    const timeFormatted = pickupTime.replace(
      /(\d+):(\d+)(am|pm)/i,
      (_, hour, minute, period) => {
        return `${hour}:${minute} ${period.toUpperCase()}`;
      }
    );

    return `${dateFormatted} at ${timeFormatted}`;
  };

  return (
    <div className="space-y-4" data-testid="guest-table">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-guests"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="filter-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="attending">Attending</SelectItem>
              <SelectItem value="tentative">Tentative</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {selectedGuests.length > 0 && (
            <Button
              onClick={handleBulkMessage}
              className="flex items-center gap-2"
              data-testid="button-bulk-message"
            >
              <MessageSquare className="w-4 h-4" />
              Message Selected ({selectedGuests.length})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedGuests.length === filteredGuests.length &&
                    filteredGuests.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Attending</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Need Taxi</TableHead>
              <TableHead>Flight/Train Info</TableHead>
              <TableHead>Pickup Date & Time</TableHead>
              <TableHead>Document Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  {guests.length === 0
                    ? "No guests have RSVP'd yet"
                    : "No guests match your search criteria"}
                </TableCell>
              </TableRow>
            ) : (
              filteredGuests.map((guest) => (
                <TableRow key={guest.id} data-testid={`guest-row-${guest.id}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedGuests.includes(guest.id)}
                      onCheckedChange={(checked) =>
                        handleSelectGuest(guest.id, checked as boolean)
                      }
                      data-testid={`checkbox-guest-${guest.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {guest.firstName} {guest.lastName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {guest.phoneWhatsapp && (
                        <div className="text-sm">{guest.phoneWhatsapp}</div>
                      )}
                      {guest.phoneSms &&
                        guest.phoneSms !== guest.phoneWhatsapp && (
                          <div className="text-sm text-muted-foreground">
                            {guest.phoneSms}
                          </div>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {guest.rsvpStatus === "attending" ? (
                        <span className="text-green-600 font-medium">
                          {guest.adultCount || 1} Adult
                          {(guest.adultCount || 1) !== 1 ? "s" : ""}
                          {guest.kidCount
                            ? ` ${guest.kidCount} Kid${
                                guest.kidCount !== 1 ? "s" : ""
                              }`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground capitalize">
                          {guest.rsvpStatus || "pending"}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCompletionBadge(guest)}</TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {guest.needsTransportPickup && (
                        <div className="text-orange-600">Pickup needed</div>
                      )}
                      {guest.needsTransportReturn && (
                        <div className="text-orange-600">Dropoff needed</div>
                      )}
                      {!guest.needsTransportPickup &&
                        !guest.needsTransportReturn && (
                          <span className="text-muted-foreground">No</span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {guest.flightNumber || guest.trainNumber ? (
                        <div className="space-y-1">
                          {guest.flightNumber && (
                            <div className="text-indigo-600">
                              ✈️ {guest.flightNumber}
                            </div>
                          )}
                          {guest.trainNumber && (
                            <div className="text-green-600">
                              🚂 {guest.trainNumber}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {guest.pickupDate && guest.pickupTime ? (
                        <span className="text-foreground">
                          {formatPickupDateTime(
                            guest.pickupDate,
                            guest.pickupTime
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Not specified
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {guest.idUploadUrls &&
                      Array.isArray(guest.idUploadUrls) &&
                      guest.idUploadUrls.length > 0 ? (
                        <span className="text-green-600 font-medium">
                          ✓ {guest.idUploadUrls.length} document
                          {guest.idUploadUrls.length > 1 ? "s" : ""} uploaded
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Not uploaded
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openGuestDetails(guest)}
                        data-testid={`button-details-${guest.id}`}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendMessage(guest)}
                        disabled={!guest.phoneWhatsapp}
                        data-testid={`button-message-${guest.id}`}
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGuest(guest)}
                        data-testid={`button-delete-${guest.id}`}
                        title="Delete Guest"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Message Modal */}
      <MessageModal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        guest={selectedGuest}
        selectedGuestIds={bulkMessageMode ? selectedGuests : undefined}
        onSuccess={() => {
          setMessageModalOpen(false);
          setSelectedGuests([]);
          queryClient.invalidateQueries({
            queryKey: ["/api/admin/message-logs"],
          });
        }}
      />

      {/* Guest Details Modal */}
      <GuestDetailsModal
        guest={selectedGuestForDetails}
        open={detailsModalOpen}
        onClose={closeGuestDetails}
        onDelete={handleDeleteGuest}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Guest</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {guestToDelete?.firstName} {guestToDelete?.lastName}
              </strong>
              ? This action cannot be undone and will permanently remove all of
              their RSVP information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGuest}
              disabled={deleteGuestMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteGuestMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
