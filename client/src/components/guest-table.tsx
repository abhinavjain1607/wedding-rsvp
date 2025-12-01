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
  Download,
} from "lucide-react";
import type { Guest } from "@shared/schema";

interface GuestTableProps {
  guests: Guest[];
}

// Room numbers from the hotel layout
const ROOM_OPTIONS = [
  // Suite rooms (S series)
  { value: "S1", label: "S1 - NR RK" },
  { value: "S2", label: "S2 - Neeraj Sneha Aneri Chetansi" },
  { value: "S3", label: "S3 - Mama maami rudra pahal tatsat uncle aunty" },
  { value: "S4", label: "S4 - Harsh Divanshu Jimit Rubeena Sweeha Bhavana" },
  // Ground floor (10x series)
  { value: "101", label: "101 - Moni Parag" },
  { value: "102", label: "102 - Kaka Kaki" },
  { value: "103", label: "103 - Foi Fua" },
  { value: "104", label: "104 - Nani Nana Maya" },
  { value: "105", label: "105 - Sonu Nimu Tinku Meena" },
  { value: "106", label: "106 - Mota Dada" },
  { value: "107", label: "107 - Parlour" },
  // 1st floor (20x series)
  { value: "201", label: "201 - Prateek Shruti" },
  { value: "202", label: "202 - Sweety Bhautik" },
  { value: "203", label: "203 - Rosy and fam" },
  { value: "204", label: "204 - Kashyap meera" },
  { value: "205", label: "205 - Gunjan Mithila" },
  { value: "206", label: "206 - Aafreen Mudra" },
  { value: "207", label: "207" },
  // 3rd floor front (30x series)
  { value: "301", label: "301 - Thakore Jain Ashok" },
  { value: "302", label: "302 - Jayesh uncle and" },
  { value: "303", label: "303 - Chetansi parents" },
  { value: "304", label: "304 - Bobby uncle" },
  { value: "305", label: "305 - Ruma aunty" },
  { value: "306", label: "306 - Sangu aunty" },
  { value: "307", label: "307 - Manisha" },
  { value: "308", label: "308 - Priti Piyush" },
  { value: "309", label: "309 - Tejal and Bhushan" },
  { value: "310", label: "310 - Nihar and Riddhi" },
  { value: "311", label: "311 - Ketan, Abhay and Julie" },
  { value: "312", label: "312 - Bakul and fam" },
  { value: "314", label: "314 - Balendu and fam" },
  { value: "315", label: "315 - Malti and fam" },
  { value: "316", label: "316 - Meena aunty and fam" },
  { value: "317", label: "317 - Vaishali aunty and fam" },
  { value: "318", label: "318" },
  { value: "319", label: "319 - Bhadra aunty, Madhu" },
  // Ground floor back (40x series)
  { value: "401", label: "401 - Manju Rekha Laji" },
  { value: "402", label: "402 - Shreepal Jiyaji Jony" },
  { value: "403", label: "403 - Fufasa Bapu Sona daughter" },
  { value: "404", label: "404 - Mammi papa Bhua" },
  { value: "405", label: "405 - Jitendra nadiad 4 people" },
  { value: "406", label: "406 - Ider 2 people can be 4" },
  { value: "407", label: "407" },
  // 1st floor back (50x series)
  { value: "501", label: "501 - Hani Abhi Monu" },
  { value: "502", label: "502 - Shubham Araansha" },
  { value: "503", label: "503 - Aakash Rajat Milind" },
  { value: "504", label: "504 - Shashank Sumit" },
  { value: "505", label: "505" },
  { value: "506", label: "506" },
  { value: "507", label: "507 - Vishal Chahat Saini Shalini" },
];

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

  // Update room assignment mutation
  const updateRoomMutation = useMutation({
    mutationFn: async ({ guestId, roomNumber }: { guestId: string; roomNumber: string | null }) => {
      const response = await apiRequest("PUT", `/api/guests/${guestId}`, {
        roomNumber: roomNumber,
      });
      if (!response.ok) {
        throw new Error("Failed to update room assignment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      toast({
        title: "Success",
        description: "Room assignment updated",
      });
    },
    onError: (error) => {
      console.error("Update room error:", error);
      toast({
        title: "Error",
        description: "Failed to update room assignment",
        variant: "destructive",
      });
    },
  });

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

  const handleRoomChange = (guestId: string, roomNumber: string) => {
    updateRoomMutation.mutate({
      guestId,
      roomNumber: roomNumber === "unassigned" ? null : roomNumber,
    });
  };

  // Export guest data for hotel staff
  const exportForHotel = () => {
    const attendingGuests = guests.filter((g) => g.rsvpStatus === "attending" || g.rsvpStatus === "tentative");

    // Create CSV content
    const headers = [
      "Room Number",
      "Guest Name",
      "RSVP Status",
      "Adults",
      "Children",
      "Phone",
      "Transport Mode",
      "Flight/Train Info",
      "Pickup Date",
      "Pickup Time",
      "Pickup Location",
      "Dropoff Date",
      "Dropoff Time",
      "Dropoff Location",
      "ID Document Type",
      "ID Document URLs",
      "Additional Notes",
    ];

    const rows = attendingGuests.map((guest) => {
      const idUrls = Array.isArray(guest.idUploadUrls)
        ? guest.idUploadUrls.join(" | ")
        : "";

      return [
        guest.roomNumber || "Not Assigned",
        `${guest.firstName} ${guest.lastName}`,
        guest.rsvpStatus === "attending" ? "Attending" : "Tentative",
        guest.adultCount || 1,
        guest.kidCount || 0,
        guest.phoneWhatsapp || guest.phone || "",
        guest.transportMode || "",
        guest.flightNumber || guest.trainNumber || "",
        guest.pickupDate || "",
        guest.pickupTime || "",
        guest.pickupLocation || "",
        guest.dropoffDate || "",
        guest.dropoffTime || "",
        guest.dropoffLocation || "",
        guest.idDocumentType || "",
        idUrls,
        guest.additionalNotes || "",
      ];
    });

    // Sort by room number
    rows.sort((a, b) => {
      const roomA = a[0] === "Not Assigned" ? "ZZZ" : a[0];
      const roomB = b[0] === "Not Assigned" ? "ZZZ" : b[0];
      return String(roomA).localeCompare(String(roomB));
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `wedding_guest_list_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Exported ${attendingGuests.length} guests (attending + tentative)`,
    });
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
          <Button
            onClick={exportForHotel}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-export"
          >
            <Download className="w-4 h-4" />
            Export for Hotel
          </Button>
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
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
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
              <TableHead>Room</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Transport</TableHead>
              <TableHead>Docs</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
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
                    <div className="text-sm">
                      {guest.rsvpStatus === "attending" ? (
                        <span className="text-green-600">Attending</span>
                      ) : guest.rsvpStatus === "declined" ? (
                        <span className="text-red-600">Declined</span>
                      ) : guest.rsvpStatus === "tentative" ? (
                        <span className="text-orange-600">Tentative</span>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={guest.roomNumber || "unassigned"}
                      onValueChange={(value) => handleRoomChange(guest.id, value)}
                      disabled={guest.rsvpStatus !== "attending"}
                    >
                      <SelectTrigger className="w-20 h-8 text-xs">
                        <SelectValue placeholder="Assign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Not Set</SelectItem>
                        {ROOM_OPTIONS.map((room) => (
                          <SelectItem key={room.value} value={room.value}>
                            {room.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {guest.phoneWhatsapp || guest.phone || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {guest.rsvpStatus === "attending" ? (
                        <>
                          {guest.adultCount || 1} Adult{(guest.adultCount || 1) > 1 ? "s" : ""}
                          {guest.kidCount ? `, ${guest.kidCount} Kid${guest.kidCount > 1 ? "s" : ""}` : ""}
                        </>
                      ) : (
                        "-"
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-0.5">
                      {guest.needsTransportPickup && (
                        <div className="text-orange-600">Pickup needed</div>
                      )}
                      {guest.needsTransportReturn && (
                        <div className="text-orange-600">Drop needed</div>
                      )}
                      {guest.flightNumber && (
                        <div className="text-indigo-600">✈️ {guest.flightNumber}</div>
                      )}
                      {guest.trainNumber && (
                        <div className="text-green-600">🚂 {guest.trainNumber}</div>
                      )}
                      {!guest.needsTransportPickup && !guest.needsTransportReturn &&
                       !guest.flightNumber && !guest.trainNumber && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {guest.idUploadUrls &&
                      Array.isArray(guest.idUploadUrls) &&
                      guest.idUploadUrls.length > 0 ? (
                        <span className="text-green-600 font-medium">
                          {guest.idUploadUrls.length} uploaded
                        </span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
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
