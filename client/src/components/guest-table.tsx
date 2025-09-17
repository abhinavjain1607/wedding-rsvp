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
  TableRow 
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
  SelectValue 
} from "@/components/ui/select";
import MessageModal from "@/components/message-modal";
import { Search, MessageSquare, Users } from "lucide-react";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phoneWhatsapp?: string;
  phoneSms?: string;
  guestCount: number;
  requiresAccommodation: boolean;
  transportMode?: string;
  rsvpStatus: string;
  createdAt: string;
}

interface GuestTableProps {
  guests: Guest[];
}

export default function GuestTable({ guests }: GuestTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [bulkMessageMode, setBulkMessageMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter guests based on search and status
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = 
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phoneWhatsapp?.includes(searchTerm);
    
    const matchesStatus = !statusFilter || guest.rsvpStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectGuest = (guestId: string, checked: boolean) => {
    if (checked) {
      setSelectedGuests([...selectedGuests, guestId]);
    } else {
      setSelectedGuests(selectedGuests.filter(id => id !== guestId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuests(filteredGuests.map(guest => guest.id));
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "attending":
        return <Badge className="bg-secondary/10 text-secondary">Attending</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="attending">Attending</SelectItem>
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
                  checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Accommodation</TableHead>
              <TableHead>Transport</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {guests.length === 0 ? "No guests have RSVP'd yet" : "No guests match your search criteria"}
                </TableCell>
              </TableRow>
            ) : (
              filteredGuests.map((guest) => (
                <TableRow key={guest.id} data-testid={`guest-row-${guest.id}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedGuests.includes(guest.id)}
                      onCheckedChange={(checked) => handleSelectGuest(guest.id, checked as boolean)}
                      data-testid={`checkbox-guest-${guest.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{guest.firstName} {guest.lastName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {guest.phoneWhatsapp && (
                        <div className="text-sm">{guest.phoneWhatsapp}</div>
                      )}
                      {guest.phoneSms && guest.phoneSms !== guest.phoneWhatsapp && (
                        <div className="text-sm text-muted-foreground">{guest.phoneSms}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {guest.guestCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(guest.rsvpStatus)}
                  </TableCell>
                  <TableCell>
                    <span className={guest.requiresAccommodation ? "text-foreground" : "text-muted-foreground"}>
                      {guest.requiresAccommodation ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-sm">
                      {guest.transportMode || "Not specified"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(guest.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendMessage(guest)}
                      disabled={!guest.phoneWhatsapp}
                      data-testid={`button-message-${guest.id}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
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
          queryClient.invalidateQueries({ queryKey: ["/api/admin/message-logs"] });
        }}
      />
    </div>
  );
}
