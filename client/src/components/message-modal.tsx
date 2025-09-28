import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Users, Phone } from "lucide-react";
import type { Guest as GuestType } from "@shared/schema";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phoneWhatsapp?: string | null;
}

interface MessageTemplate {
  id: string;
  name: string;
  subject?: string;
  content: string;
}

interface MessageModalProps {
  open: boolean;
  onClose: () => void;
  guest?: Guest | null;
  selectedGuestIds?: string[];
  onSuccess?: () => void;
}

interface MessageFormData {
  message: string;
  template?: string;
  selectedGuestId?: string;
  customPhoneNumber?: string;
}

export default function MessageModal({
  open,
  onClose,
  guest,
  selectedGuestIds = [],
  onSuccess,
}: MessageModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [customPhoneNumber, setCustomPhoneNumber] = useState<string>("");
  const [useCustomPhone, setUseCustomPhone] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<MessageFormData>({
    defaultValues: {
      message: "",
      template: "",
      selectedGuestId: "",
      customPhoneNumber: "",
    },
  });

  const { data: customTemplates = [] } = useQuery<MessageTemplate[]>({
    queryKey: ["/api/admin/message-templates"],
    enabled: open,
  });

  const { data: allGuests = [] } = useQuery<GuestType[]>({
    queryKey: ["/api/admin/guests"],
    enabled: open,
  });

  const { data: guestList = [] } = useQuery<GuestType[]>({
    queryKey: ["/api/admin/guests"],
    enabled: open && selectedGuestIds.length > 0,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: {
      guestId?: string;
      phoneNumber: string;
      message: string;
    }) => {
      return apiRequest("POST", "/api/admin/message/send", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      onSuccess?.();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const sendBulkMessageMutation = useMutation({
    mutationFn: async (data: { guestIds: string[]; message: string }) => {
      return apiRequest("POST", "/api/admin/message/bulk", data);
    },
    onSuccess: () => {
      toast({
        title: "Messages Sent",
        description: "Your messages have been sent to all selected guests.",
      });
      onSuccess?.();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send bulk messages",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== "custom") {
      // Find template from database templates
      const template = customTemplates.find((t) => t.id === selectedTemplate);
      if (template) {
        form.setValue("message", template.content);
      }
    } else if (selectedTemplate === "custom") {
      form.setValue("message", "");
    }
  }, [selectedTemplate, form, customTemplates]);

  const onSubmit = (data: MessageFormData) => {
    if (!data.message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    if (selectedGuestIds.length > 0) {
      // Bulk message
      sendBulkMessageMutation.mutate({
        guestIds: selectedGuestIds,
        message: data.message,
      });
    } else if (guest?.phoneWhatsapp) {
      // Single message - using provided guest
      sendMessageMutation.mutate({
        guestId: guest.id,
        phoneNumber: guest.phoneWhatsapp,
        message: data.message,
      });
    } else if (useCustomPhone && customPhoneNumber) {
      // Custom phone number
      sendMessageMutation.mutate({
        phoneNumber: customPhoneNumber,
        message: data.message,
      });
    } else if (selectedGuestId) {
      // Selected guest from dropdown
      const selectedGuest = allGuests.find((g) => g.id === selectedGuestId);
      if (selectedGuest?.phoneWhatsapp) {
        sendMessageMutation.mutate({
          guestId: selectedGuest.id,
          phoneNumber: selectedGuest.phoneWhatsapp,
          message: data.message,
        });
      } else {
        toast({
          title: "No Phone Number",
          description: "Selected guest doesn't have a WhatsApp number",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Recipient Required",
        description: "Please select a guest or enter a phone number",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedTemplate("");
    setSelectedGuestId("");
    setCustomPhoneNumber("");
    setUseCustomPhone(false);
    onClose();
  };

  const isBulkMode = selectedGuestIds.length > 0;
  const isNewMessageMode = !guest && selectedGuestIds.length === 0;
  const selectedGuests = isBulkMode
    ? guestList.filter((g) => selectedGuestIds.includes(g.id))
    : [];

  const guestsWithWhatsApp = allGuests.filter((g) => g.phoneWhatsapp);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="message-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {isBulkMode ? "Send Bulk Message" : "Send WhatsApp Message"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Recipient Info */}
          <div>
            <Label className="text-sm font-medium">
              {isBulkMode ? "Recipients" : "Recipient"}
            </Label>
            <div className="mt-1 p-3 bg-muted rounded-md">
              {isBulkMode ? (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {selectedGuests.length} guests selected
                  </span>
                </div>
              ) : (
                <div className="text-sm">
                  {guest?.firstName} {guest?.lastName}
                  {guest?.phoneWhatsapp && (
                    <span className="text-muted-foreground ml-2">
                      ({guest.phoneWhatsapp})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Message Template */}
          <div>
            <Label htmlFor="template">Message Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger data-testid="select-template">
                <SelectValue placeholder="Choose a template or write custom message" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Message</SelectItem>
                {customTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Content */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              rows={6}
              {...form.register("message", { required: true })}
              data-testid="textarea-message"
            />
            <div className="text-xs text-muted-foreground mt-1 space-y-1">
              <div>
                Keep messages personal and concise for better engagement
              </div>
              {isBulkMode && (
                <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                  <div className="font-medium text-blue-800 mb-1">
                    💡 Template Variables Available:
                  </div>
                  <div className="text-blue-700 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                    <span>
                      <code>{"{{firstName}}"}</code> - First name
                    </span>
                    <span>
                      <code>{"{{lastName}}"}</code> - Last name
                    </span>
                    <span>
                      <code>{"{{fullName}}"}</code> - Full name
                    </span>
                    <span>
                      <code>{"{{guestCount}}"}</code> - Total number of guests
                      (adults + kids)
                    </span>
                    <span>
                      <code>{"{{transportMode}}"}</code> - Transport method
                    </span>
                    <span>
                      <code>{"{{rsvpStatus}}"}</code> - RSVP status
                    </span>
                  </div>
                  <div className="text-blue-700 text-xs mt-1">
                    <div>
                      <code>
                        {"{{ifAccommodation}}...{{/ifAccommodation}}"}
                      </code>{" "}
                      - Show only if needs accommodation
                    </div>
                    <div>
                      <code>{"{{ifAttending}}...{{/ifAttending}}"}</code> - Show
                      only if attending
                    </div>
                  </div>
                </div>
              )}
            </div>
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
              disabled={
                sendMessageMutation.isPending ||
                sendBulkMessageMutation.isPending
              }
              data-testid="button-send"
            >
              {sendMessageMutation.isPending ||
              sendBulkMessageMutation.isPending
                ? "Sending..."
                : isBulkMode
                ? `Send to ${selectedGuests.length} Guests`
                : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
