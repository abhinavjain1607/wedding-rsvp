import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

interface AddGuestModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface GuestFormData {
  firstName: string;
  lastName: string;
  phoneWhatsapp?: string;
  phoneSms?: string;
  guestCount: number;
  requiresAccommodation: boolean;
  transportMode?: string;
  rsvpStatus: string;
}

export default function AddGuestModal({
  open,
  onClose,
  onSuccess,
}: AddGuestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GuestFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneWhatsapp: "",
      phoneSms: "",
      guestCount: 1,
      requiresAccommodation: false,
      transportMode: "",
      rsvpStatus: "pending",
    },
  });

  const addGuestMutation = useMutation({
    mutationFn: async (data: GuestFormData) => {
      return apiRequest("POST", "/api/admin/guests", data);
    },
    onSuccess: () => {
      toast({
        title: "Guest Added",
        description: "Guest has been successfully added to the list.",
      });
      // Refresh guest list and stats
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      onSuccess?.();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Add Failed",
        description: error.message || "Failed to add guest",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GuestFormData) => {
    // Validate required fields
    if (!data.firstName.trim() || !data.lastName.trim()) {
      toast({
        title: "Required Fields",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    // Validate guest count
    if (data.guestCount < 1 || data.guestCount > 10) {
      toast({
        title: "Invalid Guest Count",
        description: "Guest count must be between 1 and 10",
        variant: "destructive",
      });
      return;
    }

    addGuestMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const watchRequiresAccommodation = form.watch("requiresAccommodation");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="add-guest-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Guest
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name*</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...form.register("firstName", { required: true })}
                data-testid="input-first-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name*</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...form.register("lastName", { required: true })}
                data-testid="input-last-name"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneWhatsapp">WhatsApp Number</Label>
              <Input
                id="phoneWhatsapp"
                placeholder="+1234567890"
                {...form.register("phoneWhatsapp")}
                data-testid="input-whatsapp"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Include country code (e.g., +1234567890)
              </div>
            </div>
            <div>
              <Label htmlFor="phoneSms">SMS Number</Label>
              <Input
                id="phoneSms"
                placeholder="+1234567890"
                {...form.register("phoneSms")}
                data-testid="input-sms"
              />
              <div className="text-xs text-muted-foreground mt-1">
                If different from WhatsApp number
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guestCount">Number of Guests*</Label>
              <Input
                id="guestCount"
                type="number"
                min="1"
                max="10"
                {...form.register("guestCount", {
                  required: true,
                  valueAsNumber: true,
                  min: 1,
                  max: 10,
                })}
                data-testid="input-guest-count"
              />
            </div>
            <div>
              <Label htmlFor="rsvpStatus">RSVP Status</Label>
              <Select
                value={form.watch("rsvpStatus")}
                onValueChange={(value) => form.setValue("rsvpStatus", value)}
              >
                <SelectTrigger data-testid="select-rsvp-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="attending">Attending</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Accommodation */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresAccommodation"
              checked={watchRequiresAccommodation}
              onCheckedChange={(checked) =>
                form.setValue("requiresAccommodation", checked as boolean)
              }
              data-testid="checkbox-accommodation"
            />
            <Label htmlFor="requiresAccommodation">
              Requires accommodation
            </Label>
          </div>

          {/* Transport Mode */}
          <div>
            <Label htmlFor="transportMode">Transport Mode</Label>
            <Select
              value={form.watch("transportMode") || "not_specified"}
              onValueChange={(value) =>
                form.setValue(
                  "transportMode",
                  value === "not_specified" ? "" : value
                )
              }
            >
              <SelectTrigger data-testid="select-transport">
                <SelectValue placeholder="Select transport mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_specified">Not specified</SelectItem>
                <SelectItem value="flight">Flight</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="train">Train</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addGuestMutation.isPending}
              data-testid="button-add-guest"
            >
              {addGuestMutation.isPending ? "Adding..." : "Add Guest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
