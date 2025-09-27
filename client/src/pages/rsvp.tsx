import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  CheckCircle,
  Search,
  Heart,
  Calendar,
  Plane,
  User,
  Clock,
  Plus,
  Edit,
} from "lucide-react";

// Define form schemas for each step
const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  phoneWhatsapp: z.string().min(1, "WhatsApp number is required"),
  rsvpStatus: z.enum(["attending", "tentative", "declined"]),
});

const step2Schema = z.object({
  idDocumentType: z.enum(
    ["aadhar", "pan", "passport", "voter_id", "drivers_license"],
    {
      required_error: "Please select a valid ID type",
    }
  ),
  transportMode: z.string().min(1, "Please select your mode of transport"),
  needsTransportDec9: z.boolean(),
  needsTransportDec10: z.boolean(),
  needsTransportDec11: z.boolean(),
  needsTransportReturn: z.boolean(),
  flightNumber: z.string().optional(),
  trainNumber: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
  dropoffDate: z.string().optional(),
  dropoffTime: z.string().optional(),
  additionalNotes: z.string().optional(),
});

const findGuestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Valid email is required"),
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;
type FindGuestData = z.infer<typeof findGuestSchema>;

type RSVPFlow = "select" | "new" | "update" | "step1" | "step2" | "complete";

export default function RSVP() {
  const [currentFlow, setCurrentFlow] = useState<RSVPFlow>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const [guestData, setGuestData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      needsTransportDec9: false,
      needsTransportDec10: false,
      needsTransportDec11: false,
      needsTransportReturn: false,
      trainNumber: "",
    },
  });

  // Watch transport mode to conditionally show fields
  const watchedTransportMode = step2Form.watch("transportMode");

  const findForm = useForm<FindGuestData>({
    resolver: zodResolver(findGuestSchema),
  });

  // Step 1 mutation
  const step1Mutation = useMutation({
    mutationFn: async (data: Step1FormData) => {
      console.log("Step 1 form data being sent:", data);

      const payload = {
        ...data,
        step1Completed: true,
      };

      console.log("Step 1 payload:", payload);

      const response = await apiRequest("POST", "/api/guests/step1", payload);
      const result = await response.json();

      console.log("Step 1 response:", result);

      return result;
    },
    onSuccess: (guest) => {
      setCurrentGuestId(guest.id);
      setGuestData(guest);
      if (step1Form.getValues("rsvpStatus") === "attending") {
        setCurrentFlow("step2");
        toast({
          title: "Thank you! 💕",
          description:
            "We're so excited you can make it! Please complete the additional details to help us plan better.",
        });
      } else if (step1Form.getValues("rsvpStatus") === "tentative") {
        setCurrentFlow("complete");
        toast({
          title: "Thanks for letting us know! 🤔",
          description:
            "No worries! When you've decided, just update your RSVP anytime.",
        });
      } else {
        setCurrentFlow("complete");
        toast({
          title: "Thank you for letting us know",
          description:
            "We'll miss you, but we understand. Wishing you all the best! 💕",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Oops! Something went wrong",
        description: error.message || "Please try again in a moment",
        variant: "destructive",
      });
    },
  });

  // Update guest mutation
  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Step1FormData }) => {
      const payload = {
        ...data,
        step1Completed: true,
      };
      const response = await apiRequest(
        "PUT",
        `/api/guests/${id}/step1`,
        payload
      );
      return response.json();
    },
    onSuccess: (guest) => {
      setGuestData(guest);
      if (step1Form.getValues("rsvpStatus") === "attending") {
        setCurrentFlow("step2");
        toast({
          title: "Updated! 💕",
          description: "Now let's get those travel details sorted!",
        });
      } else if (step1Form.getValues("rsvpStatus") === "tentative") {
        setCurrentFlow("complete");
        toast({
          title: "Updated! 🤔",
          description: "Thanks for the update. Let us know when you decide!",
        });
      } else {
        setCurrentFlow("complete");
        toast({
          title: "Updated successfully",
          description: "Thank you for letting us know.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Step 2 mutation
  const step2Mutation = useMutation({
    mutationFn: async (data: Step2FormData & { idDocument?: File }) => {
      const formData = new FormData();

      // Log the data being sent for debugging
      console.log("Step 2 form data:", data);

      Object.entries(data).forEach(([key, value]) => {
        if (key !== "idDocument") {
          // Handle different value types properly
          if (value !== undefined && value !== null) {
            if (typeof value === "boolean") {
              formData.append(key, value.toString());
            } else if (typeof value === "string") {
              formData.append(key, value);
            } else {
              formData.append(key, String(value));
            }
          } else {
            // Send null/undefined as empty string for optional fields
            formData.append(key, "");
          }
        }
      });

      if (data.idDocument) {
        formData.append("idDocument", data.idDocument);
        formData.append("originalFilename", data.idDocument.name);
      }
      formData.append("step2Completed", "true");

      // Log FormData contents for debugging
      console.log("FormData entries:");
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      return apiRequest("PUT", `/api/guests/${currentGuestId}/step2`, formData);
    },
    onSuccess: () => {
      setCurrentFlow("complete");
      // Clear the selected file and reset file input
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Perfect! All set! 🎉",
        description:
          "Thank you for providing all the details. We can't wait to celebrate with you!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Almost there!",
        description: error.message || "Please check your details and try again",
        variant: "destructive",
      });
    },
  });

  // Find guest mutation
  const findGuestMutation = useMutation({
    mutationFn: async (data: FindGuestData) => {
      const response = await apiRequest(
        "POST",
        "/api/guests/find-by-email",
        data
      );
      return response.json();
    },
    onSuccess: (guest) => {
      setCurrentGuestId(guest.id);
      setGuestData(guest);

      // Pre-fill step1 form
      step1Form.reset({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone || "",
        phoneWhatsapp: guest.phoneWhatsapp || "",
        rsvpStatus: guest.rsvpStatus,
      });

      // Pre-fill step2 form if it was completed (for future use if they change to attending)
      if (guest.step2Completed) {
        step2Form.reset({
          idDocumentType: guest.idDocumentType,
          transportMode: guest.transportMode || "",
          needsTransportDec9: guest.needsTransportDec9 || false,
          needsTransportDec10: guest.needsTransportDec10 || false,
          needsTransportDec11: guest.needsTransportDec11 || false,
          needsTransportReturn: guest.needsTransportReturn || false,
          flightNumber: guest.flightNumber || "",
          trainNumber: guest.trainNumber || "",
          pickupDate: guest.pickupDate || "",
          pickupTime: guest.pickupTime || "",
          dropoffDate: guest.dropoffDate || "",
          dropoffTime: guest.dropoffTime || "",
          additionalNotes: guest.additionalNotes || "",
        });
      } // Always start from step1 so users can update their RSVP status
      setCurrentFlow("step1");

      toast({
        title: "Found your RSVP! 😊",
        description:
          "Your existing details have been loaded. Feel free to update anything.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hmm, we couldn't find you",
        description:
          "Please check your name and email, or create a new RSVP instead.",
        variant: "destructive",
      });
    },
  });

  const onStep1Submit = (data: Step1FormData) => {
    if (currentGuestId) {
      // Update existing guest
      updateGuestMutation.mutate({ id: currentGuestId, data });
    } else {
      // Create new guest
      step1Mutation.mutate(data);
    }
  };

  const onStep2Submit = (data: Step2FormData) => {
    console.log("Step 2 form submit triggered with data:", data);

    // Get all current form values to ensure we have everything
    const allFormValues = step2Form.getValues();
    console.log("All step2Form values:", allFormValues);

    const submitData = {
      ...allFormValues, // Use all form values instead of just the submitted data
      ...data, // Override with any explicitly passed data
      idDocument: selectedFile || undefined,
    };

    console.log("Final submit data:", submitData);
    step2Mutation.mutate(submitData);
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

  // Render complete screen
  if (currentFlow === "complete") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 py-12 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md mx-4 border-0 shadow-xl">
            <CardContent className="pt-6 text-center">
              <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 fill-current" />
              <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
                Thank You! 💕
              </h1>
              <p className="text-muted-foreground mb-6">
                {guestData?.rsvpStatus === "attending"
                  ? "We're absolutely thrilled you'll be joining us for our special day! Your details have been saved and we'll be in touch soon."
                  : "We understand and appreciate you letting us know. You'll be in our hearts on our special day."}
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-pink-500 hover:bg-pink-600"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render selection screen
  if (currentFlow === "select") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 py-12 min-h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
                RSVP to Our Wedding 💕
              </h1>
              <div className="w-24 h-1 bg-pink-500 mx-auto rounded-full mb-6"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're so excited to celebrate our special day with you! Please
                let us know if you'll be joining us.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card
                className="border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer group"
                onClick={() => setCurrentFlow("new")}
              >
                <CardContent className="p-8 text-center">
                  <Plus className="w-16 h-16 text-pink-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-3">New RSVP</h3>
                  <p className="text-muted-foreground mb-6">
                    First time responding? Start here to create your RSVP.
                  </p>
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">
                    Create New RSVP
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer group"
                onClick={() => setCurrentFlow("update")}
              >
                <CardContent className="p-8 text-center">
                  <Edit className="w-16 h-16 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-3">Update RSVP</h3>
                  <p className="text-muted-foreground mb-6">
                    Already responded? Update your details or complete missing
                    information.
                  </p>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600">
                    Update Existing RSVP
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render update guest finder
  if (currentFlow === "update") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 py-12 min-h-[calc(100vh-4rem)]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                onClick={() => setCurrentFlow("select")}
                className="mb-4"
              >
                ← Back to options
              </Button>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                Find Your RSVP
              </h1>
              <p className="text-muted-foreground">
                Enter your first name and email to find and update your existing
                RSVP.
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <form
                  onSubmit={findForm.handleSubmit(onFindGuest)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Label htmlFor="findFirstName">First Name *</Label>
                      <Input
                        id="findFirstName"
                        {...findForm.register("firstName")}
                        className="mt-1"
                      />
                      {findForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive mt-1">
                          {findForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="findEmail">Email *</Label>
                      <Input
                        id="findEmail"
                        type="email"
                        {...findForm.register("email")}
                        className="mt-1"
                      />
                      {findForm.formState.errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {findForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    disabled={findGuestMutation.isPending}
                  >
                    {findGuestMutation.isPending
                      ? "Searching..."
                      : "Find My RSVP"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render Step 1 form
  if (currentFlow === "step1" || currentFlow === "new") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 py-12 min-h-[calc(100vh-4rem)]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                onClick={() => setCurrentFlow("select")}
                className="mb-4"
              >
                ← Back to options
              </Button>
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div className="w-16 h-1 bg-gray-200 mx-2"></div>
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                </div>
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                {currentGuestId
                  ? "Update Your Details"
                  : "Let's Get Started! 💕"}
              </h1>
              <p className="text-muted-foreground">
                First, we need some basic information to get your RSVP started.
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <form
                  onSubmit={step1Form.handleSubmit(onStep1Submit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...step1Form.register("firstName")}
                        className="mt-1"
                      />
                      {step1Form.formState.errors.firstName && (
                        <p className="text-sm text-destructive mt-1">
                          {step1Form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...step1Form.register("lastName")}
                        className="mt-1"
                      />
                      {step1Form.formState.errors.lastName && (
                        <p className="text-sm text-destructive mt-1">
                          {step1Form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...step1Form.register("email")}
                      className="mt-1"
                    />
                    {step1Form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {step1Form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        {...step1Form.register("phone")}
                        className="mt-1"
                      />
                      {step1Form.formState.errors.phone && (
                        <p className="text-sm text-destructive mt-1">
                          {step1Form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phoneWhatsapp">WhatsApp Number *</Label>
                      <Input
                        id="phoneWhatsapp"
                        type="tel"
                        placeholder="+91 98765 43210"
                        {...step1Form.register("phoneWhatsapp")}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        We'll use this for important updates
                      </p>
                      {step1Form.formState.errors.phoneWhatsapp && (
                        <p className="text-sm text-destructive mt-1">
                          {step1Form.formState.errors.phoneWhatsapp.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Will you be able to join us for our special day? 💕
                    </Label>
                    <RadioGroup
                      value={step1Form.watch("rsvpStatus")}
                      onValueChange={(value) => {
                        step1Form.setValue(
                          "rsvpStatus",
                          value as "attending" | "tentative" | "declined"
                        );
                      }}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="attending"
                        className="flex items-center space-x-3 p-4 border border-input rounded-lg hover:bg-pink-50 cursor-pointer"
                      >
                        <RadioGroupItem value="attending" id="attending" />
                        <div>
                          <div className="font-medium">Yes, absolutely! 🎉</div>
                          <p className="text-sm text-muted-foreground">
                            We're thrilled you can make it!
                          </p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="tentative"
                        className="flex items-center space-x-3 p-4 border border-input rounded-lg hover:bg-yellow-50 cursor-pointer"
                      >
                        <RadioGroupItem value="tentative" id="tentative" />
                        <div>
                          <div className="font-medium">
                            Maybe, still figuring it out 🤔
                          </div>
                          <p className="text-sm text-muted-foreground">
                            We'd love to have you! Please confirm soon so we can
                            save your spot
                          </p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="declined"
                        className="flex items-center space-x-3 p-4 border border-input rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <RadioGroupItem value="declined" id="declined" />
                        <div>
                          <div className="font-medium">
                            Sorry, can't make it 😔
                          </div>
                          <p className="text-sm text-muted-foreground">
                            We'll miss you but understand
                          </p>
                        </div>
                      </Label>
                    </RadioGroup>
                    {step1Form.formState.errors.rsvpStatus && (
                      <p className="text-sm text-destructive mt-1">
                        {step1Form.formState.errors.rsvpStatus.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="w-full bg-pink-500 hover:bg-pink-600"
                      disabled={
                        step1Mutation.isPending || updateGuestMutation.isPending
                      }
                    >
                      {step1Mutation.isPending || updateGuestMutation.isPending
                        ? "Saving..."
                        : step1Form.getValues("rsvpStatus") === "attending"
                        ? "Continue to Travel Details →"
                        : "Submit RSVP"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render Step 2 form - This is the detailed form for attendees
  if (currentFlow === "step2") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 py-12 min-h-[calc(100vh-4rem)]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <div className="w-16 h-1 bg-pink-500 mx-2"></div>
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                </div>
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                Travel & Stay Details ✈️
              </h1>
              <p className="text-muted-foreground">
                Help us plan the perfect experience for you! You can always
                complete this later if needed.
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <form
                  onSubmit={step2Form.handleSubmit(onStep2Submit)}
                  className="space-y-8"
                >
                  {/* ID Upload Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-pink-500" />
                      <h3 className="text-lg font-semibold">
                        Valid ID for Hotel Check-in
                      </h3>
                    </div>

                    <div>
                      <Label htmlFor="idDocumentType">ID Type *</Label>
                      <Select
                        onValueChange={(value) =>
                          step2Form.setValue("idDocumentType", value as any)
                        }
                        defaultValue={step2Form.getValues("idDocumentType")}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aadhar">Aadhar Card</SelectItem>
                          <SelectItem value="pan">PAN Card</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="voter_id">Voter ID</SelectItem>
                          <SelectItem value="drivers_license">
                            Driver's License
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {step2Form.formState.errors.idDocumentType && (
                        <p className="text-sm text-destructive mt-1">
                          {step2Form.formState.errors.idDocumentType.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="idUpload"
                        className="block text-sm font-medium mb-2"
                      >
                        Upload ID Document
                      </Label>

                      {/* Display previously uploaded document if it exists */}
                      {guestData?.idUploadUrl && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-900">
                                ID Document Uploaded
                              </p>
                              <p className="text-xs text-green-700 mb-2">
                                {guestData.idDocumentType
                                  ?.replace("_", " ")
                                  .toUpperCase()}{" "}
                                document
                              </p>
                              <a
                                href={guestData.idUploadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:text-green-800 underline"
                              >
                                View uploaded document →
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-pink-300 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="idUpload"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="idUpload" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {selectedFile
                              ? selectedFile.name
                              : guestData?.idUploadUrl
                              ? "Click to replace your ID document"
                              : "Click to upload your ID document"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, JPG, PNG up to 10MB
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Transport Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Plane className="w-5 h-5 text-pink-500" />
                      <h3 className="text-lg font-semibold">
                        Travel Information
                      </h3>
                    </div>

                    <div>
                      <Label htmlFor="transportMode">
                        How will you be traveling? *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          step2Form.setValue("transportMode", value)
                        }
                        defaultValue={step2Form.getValues("transportMode")}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your mode of transport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flight">Flight ✈️</SelectItem>
                          <SelectItem value="train">Train 🚂</SelectItem>
                          <SelectItem value="driving">Driving 🚗</SelectItem>
                          <SelectItem value="bus">Bus 🚌</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {step2Form.formState.errors.transportMode && (
                        <p className="text-sm text-destructive mt-1">
                          {step2Form.formState.errors.transportMode.message}
                        </p>
                      )}
                    </div>

                    {/* Conditional fields based on transport mode */}
                    {watchedTransportMode === "flight" && (
                      <div>
                        <Label htmlFor="flightNumber">
                          Flight Number (optional)
                        </Label>
                        <Input
                          id="flightNumber"
                          placeholder="e.g., AI 123"
                          {...step2Form.register("flightNumber")}
                          className="mt-1"
                        />
                      </div>
                    )}

                    {watchedTransportMode === "train" && (
                      <div>
                        <Label htmlFor="trainNumber">
                          Train Number (optional)
                        </Label>
                        <Input
                          id="trainNumber"
                          placeholder="e.g., 12345"
                          {...step2Form.register("trainNumber")}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* Transport Service Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-pink-500" />
                      <h3 className="text-lg font-semibold">
                        Complimentary Transport Service
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      We provide complimentary transport service from airports
                      and railway stations. Service available: 6:00 AM - 12:00
                      PM
                    </p>

                    {/* Important Information - moved up */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <svg
                          className="w-5 h-5 text-blue-500 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-2">
                            Important Information
                          </h4>
                          <p className="text-sm text-blue-800">
                            <strong>Drop off dates:</strong> 11th (till 10:00
                            PM) and 12th December (till 12:00 PM)
                            <br />
                            <strong>Check-in time:</strong> 12:00 PM (We can
                            accommodate early check-ins as well)
                            <br />
                            <strong>Check-out time:</strong> 11:00 AM on 12th
                            December
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* December 9th pickup option - temporarily hidden */}
                      {false && (
                        <div className="flex items-center space-x-3 p-4 border border-input rounded-lg">
                          <input
                            type="checkbox"
                            id="needsTransportDec9"
                            {...step2Form.register("needsTransportDec9")}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor="needsTransportDec9"
                              className="font-medium cursor-pointer"
                            >
                              Pickup on December 9th
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Airport/station pickup service for guest arrivals
                              (6:00 AM - 10:00 PM)
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 p-4 border border-input rounded-lg">
                        <input
                          type="checkbox"
                          id="needsTransportDec10"
                          {...step2Form.register("needsTransportDec10")}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="needsTransportDec10"
                            className="font-medium cursor-pointer"
                          >
                            Pickup on December 10th
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Airport/station pickup service for guest arrivals
                            (6:00 AM - 10:00 PM)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-input rounded-lg">
                        <input
                          type="checkbox"
                          id="needsTransportDec11"
                          {...step2Form.register("needsTransportDec11")}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="needsTransportDec11"
                            className="font-medium cursor-pointer"
                          >
                            Pickup on December 11th
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Airport/station pickup service for guest arrivals
                            (6:00 AM - 10:00 PM)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-input rounded-lg">
                        <input
                          type="checkbox"
                          id="needsTransportReturn"
                          {...step2Form.register("needsTransportReturn")}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="needsTransportReturn"
                            className="font-medium cursor-pointer"
                          >
                            Return Transport Service
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Return transport service to airport/station
                            (available till 12:00 PM on Dec 12th)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Time Selection */}
                    {(step2Form.watch("needsTransportDec9") ||
                      step2Form.watch("needsTransportDec10") ||
                      step2Form.watch("needsTransportDec11") ||
                      step2Form.watch("needsTransportReturn")) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-pink-50 rounded-lg">
                        {(step2Form.watch("needsTransportDec9") ||
                          step2Form.watch("needsTransportDec10") ||
                          step2Form.watch("needsTransportDec11")) && (
                          <>
                            <div>
                              <Label htmlFor="pickupDate">Pickup Date</Label>
                              <Select
                                onValueChange={(value) =>
                                  step2Form.setValue("pickupDate", value)
                                }
                                defaultValue={step2Form.getValues("pickupDate")}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select date" />
                                </SelectTrigger>
                                <SelectContent>
                                  {step2Form.watch("needsTransportDec9") && (
                                    <SelectItem value="dec9">
                                      December 9th
                                    </SelectItem>
                                  )}
                                  {step2Form.watch("needsTransportDec10") && (
                                    <SelectItem value="dec10">
                                      December 10th
                                    </SelectItem>
                                  )}
                                  {step2Form.watch("needsTransportDec11") && (
                                    <SelectItem value="dec11">
                                      December 11th
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="pickupTime">Pickup Time</Label>
                              <Select
                                onValueChange={(value) =>
                                  step2Form.setValue("pickupTime", value)
                                }
                                defaultValue={step2Form.getValues("pickupTime")}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="6:00am">
                                    6:00 AM
                                  </SelectItem>
                                  <SelectItem value="6:30am">
                                    6:30 AM
                                  </SelectItem>
                                  <SelectItem value="7:00am">
                                    7:00 AM
                                  </SelectItem>
                                  <SelectItem value="7:30am">
                                    7:30 AM
                                  </SelectItem>
                                  <SelectItem value="8:00am">
                                    8:00 AM
                                  </SelectItem>
                                  <SelectItem value="8:30am">
                                    8:30 AM
                                  </SelectItem>
                                  <SelectItem value="9:00am">
                                    9:00 AM
                                  </SelectItem>
                                  <SelectItem value="9:30am">
                                    9:30 AM
                                  </SelectItem>
                                  <SelectItem value="10:00am">
                                    10:00 AM
                                  </SelectItem>
                                  <SelectItem value="10:30am">
                                    10:30 AM
                                  </SelectItem>
                                  <SelectItem value="11:00am">
                                    11:00 AM
                                  </SelectItem>
                                  <SelectItem value="11:30am">
                                    11:30 AM
                                  </SelectItem>
                                  <SelectItem value="12:00pm">
                                    12:00 PM
                                  </SelectItem>
                                  <SelectItem value="12:30pm">
                                    12:30 PM
                                  </SelectItem>
                                  <SelectItem value="1:00pm">
                                    1:00 PM
                                  </SelectItem>
                                  <SelectItem value="1:30pm">
                                    1:30 PM
                                  </SelectItem>
                                  <SelectItem value="2:00pm">
                                    2:00 PM
                                  </SelectItem>
                                  <SelectItem value="2:30pm">
                                    2:30 PM
                                  </SelectItem>
                                  <SelectItem value="3:00pm">
                                    3:00 PM
                                  </SelectItem>
                                  <SelectItem value="3:30pm">
                                    3:30 PM
                                  </SelectItem>
                                  <SelectItem value="4:00pm">
                                    4:00 PM
                                  </SelectItem>
                                  <SelectItem value="4:30pm">
                                    4:30 PM
                                  </SelectItem>
                                  <SelectItem value="5:00pm">
                                    5:00 PM
                                  </SelectItem>
                                  <SelectItem value="5:30pm">
                                    5:30 PM
                                  </SelectItem>
                                  <SelectItem value="6:00pm">
                                    6:00 PM
                                  </SelectItem>
                                  <SelectItem value="6:30pm">
                                    6:30 PM
                                  </SelectItem>
                                  <SelectItem value="7:00pm">
                                    7:00 PM
                                  </SelectItem>
                                  <SelectItem value="7:30pm">
                                    7:30 PM
                                  </SelectItem>
                                  <SelectItem value="8:00pm">
                                    8:00 PM
                                  </SelectItem>
                                  <SelectItem value="8:30pm">
                                    8:30 PM
                                  </SelectItem>
                                  <SelectItem value="9:00pm">
                                    9:00 PM
                                  </SelectItem>
                                  <SelectItem value="9:30pm">
                                    9:30 PM
                                  </SelectItem>
                                  <SelectItem value="10:00pm">
                                    10:00 PM
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {step2Form.watch("needsTransportReturn") && (
                          <>
                            <div>
                              <Label htmlFor="dropoffDate">Dropoff Date</Label>
                              <Select
                                onValueChange={(value) =>
                                  step2Form.setValue("dropoffDate", value)
                                }
                                defaultValue={step2Form.getValues(
                                  "dropoffDate"
                                )}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select date" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dec11">
                                    December 11th
                                  </SelectItem>
                                  <SelectItem value="dec12">
                                    December 12th
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="dropoffTime">Dropoff Time</Label>
                              <Select
                                onValueChange={(value) =>
                                  step2Form.setValue("dropoffTime", value)
                                }
                                defaultValue={step2Form.getValues(
                                  "dropoffTime"
                                )}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="6:00am">
                                    6:00 AM
                                  </SelectItem>
                                  <SelectItem value="6:30am">
                                    6:30 AM
                                  </SelectItem>
                                  <SelectItem value="7:00am">
                                    7:00 AM
                                  </SelectItem>
                                  <SelectItem value="7:30am">
                                    7:30 AM
                                  </SelectItem>
                                  <SelectItem value="8:00am">
                                    8:00 AM
                                  </SelectItem>
                                  <SelectItem value="8:30am">
                                    8:30 AM
                                  </SelectItem>
                                  <SelectItem value="9:00am">
                                    9:00 AM
                                  </SelectItem>
                                  <SelectItem value="9:30am">
                                    9:30 AM
                                  </SelectItem>
                                  <SelectItem value="10:00am">
                                    10:00 AM
                                  </SelectItem>
                                  <SelectItem value="10:30am">
                                    10:30 AM
                                  </SelectItem>
                                  <SelectItem value="11:00am">
                                    11:00 AM
                                  </SelectItem>
                                  <SelectItem value="11:30am">
                                    11:30 AM
                                  </SelectItem>
                                  <SelectItem value="12:00pm">
                                    12:00 PM
                                  </SelectItem>
                                  {/* Extended hours for December 11th */}
                                  {step2Form.watch("dropoffDate") ===
                                    "dec11" && (
                                    <>
                                      <SelectItem value="12:30pm">
                                        12:30 PM
                                      </SelectItem>
                                      <SelectItem value="1:00pm">
                                        1:00 PM
                                      </SelectItem>
                                      <SelectItem value="1:30pm">
                                        1:30 PM
                                      </SelectItem>
                                      <SelectItem value="2:00pm">
                                        2:00 PM
                                      </SelectItem>
                                      <SelectItem value="2:30pm">
                                        2:30 PM
                                      </SelectItem>
                                      <SelectItem value="3:00pm">
                                        3:00 PM
                                      </SelectItem>
                                      <SelectItem value="3:30pm">
                                        3:30 PM
                                      </SelectItem>
                                      <SelectItem value="4:00pm">
                                        4:00 PM
                                      </SelectItem>
                                      <SelectItem value="4:30pm">
                                        4:30 PM
                                      </SelectItem>
                                      <SelectItem value="5:00pm">
                                        5:00 PM
                                      </SelectItem>
                                      <SelectItem value="5:30pm">
                                        5:30 PM
                                      </SelectItem>
                                      <SelectItem value="6:00pm">
                                        6:00 PM
                                      </SelectItem>
                                      <SelectItem value="6:30pm">
                                        6:30 PM
                                      </SelectItem>
                                      <SelectItem value="7:00pm">
                                        7:00 PM
                                      </SelectItem>
                                      <SelectItem value="7:30pm">
                                        7:30 PM
                                      </SelectItem>
                                      <SelectItem value="8:00pm">
                                        8:00 PM
                                      </SelectItem>
                                      <SelectItem value="8:30pm">
                                        8:30 PM
                                      </SelectItem>
                                      <SelectItem value="9:00pm">
                                        9:00 PM
                                      </SelectItem>
                                      <SelectItem value="9:30pm">
                                        9:30 PM
                                      </SelectItem>
                                      <SelectItem value="10:00pm">
                                        10:00 PM
                                      </SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <Label htmlFor="additionalNotes">
                      Additional Notes & Comments
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any special requests, dietary restrictions, or other information you'd like us to know..."
                      {...step2Form.register("additionalNotes")}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <div className="pt-6 space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-pink-500 hover:bg-pink-600"
                      disabled={step2Mutation.isPending}
                    >
                      {step2Mutation.isPending
                        ? "Saving..."
                        : "Complete RSVP 🎉"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentFlow("complete")}
                    >
                      I'll complete this later
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
