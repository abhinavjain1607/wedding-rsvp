import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle, Search } from "lucide-react";

const rsvpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneWhatsapp: z.string().min(1, "WhatsApp number is required"),
  phoneSms: z.string().optional(),
  guestCount: z.number().min(1, "Guest count is required"),
  requiresAccommodation: z.boolean(),
  transportMode: z.string().optional(),
  rsvpStatus: z.enum(["attending", "declined"]),
});

const findGuestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;
type FindGuestData = z.infer<typeof findGuestSchema>;

export default function RSVP() {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      requiresAccommodation: false,
      rsvpStatus: "attending",
    },
  });

  const findForm = useForm<FindGuestData>({
    resolver: zodResolver(findGuestSchema),
  });

  const createGuestMutation = useMutation({
    mutationFn: async (data: RSVPFormData & { idDocument?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "idDocument" && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (data.idDocument) {
        formData.append("idDocument", data.idDocument);
      }
      return apiRequest("POST", "/api/guests", formData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "RSVP Submitted!",
        description: "Thank you for your response. We can't wait to celebrate with you!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit RSVP",
        variant: "destructive",
      });
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RSVPFormData & { idDocument?: File } }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "idDocument" && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (data.idDocument) {
        formData.append("idDocument", data.idDocument);
      }
      return apiRequest("PUT", `/api/guests/${id}`, formData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "RSVP Updated!",
        description: "Your details have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update RSVP",
        variant: "destructive",
      });
    },
  });

  const findGuestMutation = useMutation({
    mutationFn: async (data: FindGuestData) => {
      const response = await apiRequest("POST", "/api/guests/find", data);
      return response.json();
    },
    onSuccess: (guest) => {
      form.reset({
        firstName: guest.firstName,
        lastName: guest.lastName,
        phoneWhatsapp: guest.phoneWhatsapp,
        phoneSms: guest.phoneSms || "",
        guestCount: guest.guestCount,
        requiresAccommodation: guest.requiresAccommodation,
        transportMode: guest.transportMode || "",
        rsvpStatus: guest.rsvpStatus,
      });
      setShowUpdateForm(false);
      toast({
        title: "Guest Found!",
        description: "Your existing details have been loaded. You can now update them.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Guest Not Found",
        description: "No RSVP found with that name. Please check the spelling or create a new RSVP.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RSVPFormData) => {
    const submitData = {
      ...data,
      guestCount: parseInt(data.guestCount.toString()),
      idDocument: selectedFile || undefined,
    };

    // Check if we're updating an existing guest
    const existingGuest = form.getValues();
    if (existingGuest.firstName && findGuestMutation.data?.id) {
      updateGuestMutation.mutate({
        id: findGuestMutation.data.id,
        data: submitData,
      });
    } else {
      createGuestMutation.mutate(submitData);
    }
  };

  const onFindGuest = (data: FindGuestData) => {
    findGuestMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="min-h-screen bg-muted/30 py-12 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
                Thank You!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your RSVP has been submitted successfully. We're so excited to celebrate with you!
              </p>
              <Button onClick={() => window.location.href = "/"} data-testid="button-home">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="rsvp-title">
              RSVP
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6"></div>
            <p className="text-muted-foreground">
              We can't wait to celebrate with you! Please let us know if you'll be joining us.
            </p>
          </div>

          <Card data-testid="card-rsvp-form">
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      data-testid="input-firstName"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      data-testid="input-lastName"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phoneWhatsapp">WhatsApp Number *</Label>
                  <Input
                    id="phoneWhatsapp"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...form.register("phoneWhatsapp")}
                    data-testid="input-whatsapp"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code for international numbers
                  </p>
                  {form.formState.errors.phoneWhatsapp && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.phoneWhatsapp.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneSms">SMS Number (Optional)</Label>
                  <Input
                    id="phoneSms"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...form.register("phoneSms")}
                    data-testid="input-sms"
                  />
                </div>

                <div>
                  <Label htmlFor="guestCount">Total Guests in Your Party *</Label>
                  <Select
                    onValueChange={(value) => form.setValue("guestCount", parseInt(value))}
                    defaultValue={form.getValues("guestCount")?.toString()}
                  >
                    <SelectTrigger data-testid="select-guestCount">
                      <SelectValue placeholder="Select number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Guest</SelectItem>
                      <SelectItem value="2">2 Guests</SelectItem>
                      <SelectItem value="3">3 Guests</SelectItem>
                      <SelectItem value="4">4 Guests</SelectItem>
                      <SelectItem value="5">5+ Guests</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.guestCount && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.guestCount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Will you require accommodation?
                  </Label>
                  <RadioGroup
                    onValueChange={(value) => form.setValue("requiresAccommodation", value === "yes")}
                    defaultValue={form.getValues("requiresAccommodation") ? "yes" : "no"}
                    className="flex gap-4"
                    data-testid="radio-accommodation"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="acc-yes" />
                      <Label htmlFor="acc-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="acc-no" />
                      <Label htmlFor="acc-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="transportMode">Mode of Transport</Label>
                  <Select
                    onValueChange={(value) => form.setValue("transportMode", value)}
                    defaultValue={form.getValues("transportMode")}
                  >
                    <SelectTrigger data-testid="select-transport">
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="driving">Driving</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="idUpload" className="block text-sm font-medium mb-2">
                    Personal ID for Hotel Check-in
                  </Label>
                  <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="idUpload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="input-file"
                    />
                    <label htmlFor="idUpload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {selectedFile ? selectedFile.name : "Click to upload your ID document"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">RSVP Status *</Label>
                  <RadioGroup
                    onValueChange={(value) => form.setValue("rsvpStatus", value as "attending" | "declined")}
                    defaultValue={form.getValues("rsvpStatus")}
                    className="space-y-3"
                    data-testid="radio-rsvpStatus"
                  >
                    <div className="flex items-center space-x-3 p-4 border border-input rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="attending" id="attending" />
                      <div>
                        <Label htmlFor="attending" className="font-medium cursor-pointer">
                          Joyfully Accepting
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Can't wait to celebrate with you!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border border-input rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="declined" id="declined" />
                      <div>
                        <Label htmlFor="declined" className="font-medium cursor-pointer">
                          Regretfully Declining
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          We'll miss you but understand
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.rsvpStatus && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.rsvpStatus.message}
                    </p>
                  )}
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createGuestMutation.isPending || updateGuestMutation.isPending}
                    data-testid="button-submit-rsvp"
                  >
                    {createGuestMutation.isPending || updateGuestMutation.isPending
                      ? "Submitting..."
                      : "Submit RSVP"}
                  </Button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-muted-foreground mb-4">Already RSVP'd?</p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowUpdateForm(!showUpdateForm)}
                  data-testid="button-update-toggle"
                >
                  Click here to update your details
                </Button>
              </div>
            </CardContent>
          </Card>

          {showUpdateForm && (
            <Card className="mt-8" data-testid="card-update-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Update Your RSVP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={findForm.handleSubmit(onFindGuest)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="updateFirstName">First Name *</Label>
                      <Input
                        id="updateFirstName"
                        {...findForm.register("firstName")}
                        data-testid="input-update-firstName"
                      />
                      {findForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive mt-1">
                          {findForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="updateLastName">Last Name *</Label>
                      <Input
                        id="updateLastName"
                        {...findForm.register("lastName")}
                        data-testid="input-update-lastName"
                      />
                      {findForm.formState.errors.lastName && (
                        <p className="text-sm text-destructive mt-1">
                          {findForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={findGuestMutation.isPending}
                    data-testid="button-find-guest"
                  >
                    {findGuestMutation.isPending ? "Searching..." : "Find My RSVP"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
