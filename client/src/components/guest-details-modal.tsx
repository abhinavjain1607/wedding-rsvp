import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Mail,
  Phone,
  MessageSquare,
  Plane,
  Calendar,
  Car,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Trash2,
  Users,
} from "lucide-react";
import type { Guest } from "@shared/schema";

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
  if (!guest) return null;

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
            <AlertCircle className="w-3 h-3 mr-1" />
            Tentative
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getStepCompletionBadge = (completed: boolean, stepName: string) => {
    return completed ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        {stepName} Complete
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600 border-gray-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        {stepName} Incomplete
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIdDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      aadhar: "Aadhar Card",
      pan: "PAN Card",
      passport: "Passport",
      voter_id: "Voter ID",
      drivers_license: "Driver's License",
    };
    return labels[type] || type;
  };

  const getTransportModeIcon = (mode: string) => {
    switch (mode) {
      case "flight":
        return <Plane className="w-4 h-4" />;
      case "train":
        return <Car className="w-4 h-4" />;
      case "driving":
        return <Car className="w-4 h-4" />;
      case "bus":
        return <Car className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const formatTime = (time: string) => {
    // Handle both old and new time formats
    const timeLabels: Record<string, string> = {
      "6am": "6:00 AM",
      "7am": "7:00 AM",
      "8am": "8:00 AM",
      "9am": "9:00 AM",
      "10am": "10:00 AM",
      "11am": "11:00 AM",
      "12pm": "12:00 PM",
      "6:00am": "6:00 AM",
      "6:30am": "6:30 AM",
      "7:00am": "7:00 AM",
      "7:30am": "7:30 AM",
      "8:00am": "8:00 AM",
      "8:30am": "8:30 AM",
      "9:00am": "9:00 AM",
      "9:30am": "9:30 AM",
      "10:00am": "10:00 AM",
      "10:30am": "10:30 AM",
      "11:00am": "11:00 AM",
      "11:30am": "11:30 AM",
      "12:00pm": "12:00 PM",
      "12:30pm": "12:30 PM",
      "1:00pm": "1:00 PM",
      "1:30pm": "1:30 PM",
      "2:00pm": "2:00 PM",
      "2:30pm": "2:30 PM",
      "3:00pm": "3:00 PM",
      "3:30pm": "3:30 PM",
      "4:00pm": "4:00 PM",
      "4:30pm": "4:30 PM",
      "5:00pm": "5:00 PM",
      "5:30pm": "5:30 PM",
      "6:00pm": "6:00 PM",
      "6:30pm": "6:30 PM",
      "7:00pm": "7:00 PM",
      "7:30pm": "7:30 PM",
      "8:00pm": "8:00 PM",
      "8:30pm": "8:30 PM",
      "9:00pm": "9:00 PM",
      "9:30pm": "9:30 PM",
      "10:00pm": "10:00 PM",
    };
    return timeLabels[time] || time;
  };

  const formatPickupDate = (date: string) => {
    const dateLabels: Record<string, string> = {
      dec10: "December 10th",
      dec11: "December 11th",
      dec12: "December 12th",
    };
    return dateLabels[date] || date;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            {guest.firstName} {guest.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Progress Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    RSVP Status
                  </h3>
                  {getStatusBadge(guest.rsvpStatus || "pending")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Step 1
                  </h3>
                  {getStepCompletionBadge(
                    guest.step1Completed || false,
                    "Basic Info"
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Step 2
                  </h3>
                  {getStepCompletionBadge(
                    guest.step2Completed || false,
                    "Travel Details"
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.phoneWhatsapp || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Party Size</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.adultCount || 1} adult
                      {(guest.adultCount || 1) !== 1 ? "s" : ""}
                      {guest.kidCount
                        ? `, ${guest.kidCount} kid${
                            guest.kidCount !== 1 ? "s" : ""
                          }`
                        : ""}
                    </p>
                  </div>
                </div>
                {guest.phoneSms && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">SMS Number</p>
                      <p className="text-sm text-muted-foreground">
                        {guest.phoneSms}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: ID Document */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                ID Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Document Type</p>
                  <p className="text-sm text-muted-foreground">
                    {guest.idDocumentType
                      ? getIdDocumentTypeLabel(guest.idDocumentType)
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Documents Uploaded</p>
                  {(() => {
                    // Handle array format for multiple documents
                    const urls = Array.isArray(guest.idUploadUrls)
                      ? guest.idUploadUrls
                      : [];

                    if (urls.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground">
                          No documents uploaded
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {urls.length} document{urls.length > 1 ? "s" : ""}{" "}
                          uploaded
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {urls.map((url, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(url, "_blank")}
                              className="text-xs"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Document {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Transport Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plane className="w-5 h-5 text-teal-600" />
                Transport Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {guest.transportMode ? (
                    getTransportModeIcon(guest.transportMode)
                  ) : (
                    <Car className="w-4 h-4" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Mode of Transport</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {guest.transportMode
                        ? guest.transportMode.replace("_", " ")
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Flight Number</p>
                  <p className="text-sm text-muted-foreground">
                    {guest.flightNumber || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Taxi Service Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-600" />
                Taxi Service Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    guest.needsTransportPickup ? "bg-green-50" : "bg-gray-50"
                  }`}
                >
                  {guest.needsTransportPickup ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Pickup Service</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.needsTransportPickup ? "Required" : "Not needed"}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    guest.needsTransportReturn ? "bg-blue-50" : "bg-gray-50"
                  }`}
                >
                  {guest.needsTransportReturn ? (
                    <Car className="w-5 h-5 text-blue-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Return Drop-off</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.needsTransportReturn ? "Required" : "Not needed"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pickup and Dropoff Timing Details */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pickup & Dropoff Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Pickup Date</p>
                    <p className="text-muted-foreground">
                      {guest.pickupDate
                        ? formatPickupDate(guest.pickupDate)
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Pickup Time</p>
                    <p className="text-muted-foreground">
                      {guest.pickupTime
                        ? formatTime(guest.pickupTime)
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Dropoff Date</p>
                    <p className="text-muted-foreground">
                      {guest.dropoffDate
                        ? formatPickupDate(guest.dropoffDate)
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Dropoff Time</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.dropoffTime
                        ? formatTime(guest.dropoffTime)
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {guest.additionalNotes || "No additional notes provided"}
              </p>
            </CardContent>
          </Card>

          {/* Guest Entry Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Guest Entry Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-muted-foreground">
                    {guest.createdAt
                      ? formatDate(guest.createdAt.toString())
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-muted-foreground">
                    {guest.updatedAt
                      ? formatDate(guest.updatedAt.toString())
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4 border-t">
          {onDelete && (
            <Button
              onClick={() => {
                onDelete(guest);
                onClose();
              }}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Guest
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
