import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Phone,
  Plane,
  Car,
  FileText,
  Download,
  Trash2,
  Save,
} from "lucide-react";
import type { Guest } from "@shared/schema";

// Room numbers from the hotel layout
const ROOM_OPTIONS = [
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
  { value: "S4", label: "S4" },
  { value: "101", label: "101" },
  { value: "102", label: "102" },
  { value: "103", label: "103" },
  { value: "104", label: "104" },
  { value: "105", label: "105" },
  { value: "106", label: "106" },
  { value: "107", label: "107" },
  { value: "201", label: "201" },
  { value: "202", label: "202" },
  { value: "203", label: "203" },
  { value: "204", label: "204" },
  { value: "205", label: "205" },
  { value: "206", label: "206" },
  { value: "207", label: "207" },
  { value: "301", label: "301" },
  { value: "302", label: "302" },
  { value: "303", label: "303" },
  { value: "304", label: "304" },
  { value: "305", label: "305" },
  { value: "306", label: "306" },
  { value: "307", label: "307" },
  { value: "308", label: "308" },
  { value: "309", label: "309" },
  { value: "310", label: "310" },
  { value: "311", label: "311" },
  { value: "312", label: "312" },
  { value: "314", label: "314" },
  { value: "315", label: "315" },
  { value: "316", label: "316" },
  { value: "317", label: "317" },
  { value: "318", label: "318" },
  { value: "319", label: "319" },
  { value: "401", label: "401" },
  { value: "402", label: "402" },
  { value: "403", label: "403" },
  { value: "404", label: "404" },
  { value: "405", label: "405" },
  { value: "406", label: "406" },
  { value: "407", label: "407" },
  { value: "501", label: "501" },
  { value: "502", label: "502" },
  { value: "503", label: "503" },
  { value: "504", label: "504" },
  { value: "505", label: "505" },
  { value: "506", label: "506" },
  { value: "507", label: "507" },
];

interface GuestDetailsModalProps {
  guest: Guest | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (guest: Guest) => void;
}

export default function GuestDetailsModal({
  guest,
  open,
  onClose,
  onDelete,
}: GuestDetailsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneWhatsapp: "",
    adultCount: 1,
    kidCount: 0,
    rsvpStatus: "pending",
    roomNumber: "",
    transportMode: "",
    flightNumber: "",
    trainNumber: "",
    needsTransportPickup: false,
    needsTransportReturn: false,
    pickupDate: "",
    pickupTime: "",
    pickupLocation: "",
    dropoffDate: "",
    dropoffTime: "",
    dropoffLocation: "",
    additionalNotes: "",
  });

  // Update form when guest changes
  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName || "",
        lastName: guest.lastName || "",
        email: guest.email || "",
        phone: guest.phone || "",
        phoneWhatsapp: guest.phoneWhatsapp || "",
        adultCount: guest.adultCount || 1,
        kidCount: guest.kidCount || 0,
        rsvpStatus: guest.rsvpStatus || "pending",
        roomNumber: guest.roomNumber || "",
        transportMode: guest.transportMode || "",
        flightNumber: guest.flightNumber || "",
        trainNumber: guest.trainNumber || "",
        needsTransportPickup: guest.needsTransportPickup || false,
        needsTransportReturn: guest.needsTransportReturn || false,
        pickupDate: guest.pickupDate || "",
        pickupTime: guest.pickupTime || "",
        pickupLocation: guest.pickupLocation || "",
        dropoffDate: guest.dropoffDate || "",
        dropoffTime: guest.dropoffTime || "",
        dropoffLocation: guest.dropoffLocation || "",
        additionalNotes: guest.additionalNotes || "",
      });
    }
  }, [guest]);

  // Update guest mutation
  const updateGuestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PUT", `/api/guests/${guest?.id}`, data);
      if (!response.ok) {
        throw new Error("Failed to update guest");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Guest updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update guest",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGuestMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!guest) return null;

  const idUrls = Array.isArray(guest.idUploadUrls) ? guest.idUploadUrls : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            Edit Guest: {guest.firstName} {guest.lastName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneWhatsapp">WhatsApp Number</Label>
                <Input
                  id="phoneWhatsapp"
                  value={formData.phoneWhatsapp}
                  onChange={(e) => handleChange("phoneWhatsapp", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* RSVP Status & Room */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">RSVP & Room Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>RSVP Status</Label>
                  <Select
                    value={formData.rsvpStatus}
                    onValueChange={(value) => handleChange("rsvpStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="attending">Attending</SelectItem>
                      <SelectItem value="tentative">Tentative</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.adultCount === 0 ? "" : formData.adultCount}
                    onChange={(e) => handleChange("adultCount", e.target.value === "" ? 0 : parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kids</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.kidCount === 0 ? "" : formData.kidCount}
                    onChange={(e) => handleChange("kidCount", e.target.value === "" ? 0 : parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Select
                  value={formData.roomNumber || "unassigned"}
                  onValueChange={(value) => handleChange("roomNumber", value === "unassigned" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Not Assigned</SelectItem>
                    {ROOM_OPTIONS.map((room) => (
                      <SelectItem key={room.value} value={room.value}>
                        {room.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transport Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Transport Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Transport Mode</Label>
                  <Select
                    value={formData.transportMode || "none"}
                    onValueChange={(value) => handleChange("transportMode", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="driving">Driving</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flightNumber">Flight Number</Label>
                  <Input
                    id="flightNumber"
                    value={formData.flightNumber}
                    onChange={(e) => handleChange("flightNumber", e.target.value)}
                    placeholder="e.g., AI817"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainNumber">Train Number</Label>
                  <Input
                    id="trainNumber"
                    value={formData.trainNumber}
                    onChange={(e) => handleChange("trainNumber", e.target.value)}
                    placeholder="e.g., 12345"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needsTransportPickup"
                    checked={formData.needsTransportPickup}
                    onCheckedChange={(checked) => handleChange("needsTransportPickup", !!checked)}
                  />
                  <Label htmlFor="needsTransportPickup">Needs Pickup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needsTransportReturn"
                    checked={formData.needsTransportReturn}
                    onCheckedChange={(checked) => handleChange("needsTransportReturn", !!checked)}
                  />
                  <Label htmlFor="needsTransportReturn">Needs Drop-off</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pickup Date</Label>
                  <Select
                    value={formData.pickupDate || "none"}
                    onValueChange={(value) => handleChange("pickupDate", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      <SelectItem value="dec10">December 10</SelectItem>
                      <SelectItem value="dec11">December 11</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupTime">Pickup Time</Label>
                  <Input
                    id="pickupTime"
                    value={formData.pickupTime}
                    onChange={(e) => handleChange("pickupTime", e.target.value)}
                    placeholder="e.g., 10:30am"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => handleChange("pickupLocation", e.target.value)}
                  placeholder="Airport, Station, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dropoff Date</Label>
                  <Select
                    value={formData.dropoffDate || "none"}
                    onValueChange={(value) => handleChange("dropoffDate", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      <SelectItem value="dec11">December 11</SelectItem>
                      <SelectItem value="dec12">December 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoffTime">Dropoff Time</Label>
                  <Input
                    id="dropoffTime"
                    value={formData.dropoffTime}
                    onChange={(e) => handleChange("dropoffTime", e.target.value)}
                    placeholder="e.g., 2:00pm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoffLocation">Dropoff Location</Label>
                <Input
                  id="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={(e) => handleChange("dropoffLocation", e.target.value)}
                  placeholder="Airport, Station, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* ID Documents (View Only) */}
          {idUrls.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ID Documents ({idUrls.length} uploaded)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {idUrls.map((url, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Document {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.additionalNotes}
                onChange={(e) => handleChange("additionalNotes", e.target.value)}
                placeholder="Any special requirements, dietary restrictions, etc."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            {onDelete && (
              <Button
                type="button"
                onClick={() => {
                  onDelete(guest);
                  onClose();
                }}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateGuestMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                {updateGuestMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
