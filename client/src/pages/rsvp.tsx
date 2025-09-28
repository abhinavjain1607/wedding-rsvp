import { useState, useRef, useEffect } from "react";
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
  X,
  AlertCircle,
} from "lucide-react";

// Define form schemas for each step
const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  phoneWhatsapp: z.string().min(1, "WhatsApp number is required"),
  adultCount: z.number().min(1).max(10),
  kidCount: z.number().min(0).max(10),
  rsvpStatus: z.enum(["attending", "tentative", "declined"]),
});

const step2Schema = z
  .object({
    transportMode: z.string().optional(),
    needsTransportPickup: z.boolean(),
    needsTransportReturn: z.boolean(),
    flightNumber: z.string().optional(),
    trainNumber: z.string().optional(),
    pickupDate: z.string().optional(),
    pickupTime: z.string().optional(),
    pickupLocation: z.string().optional(),
    dropoffDate: z.string().optional(),
    dropoffTime: z.string().optional(),
    dropoffLocation: z.string().optional(),
    additionalNotes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate pickup location if pickup is selected
      if (data.needsTransportPickup && !data.pickupLocation?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Pickup location is required when pickup service is selected",
      path: ["pickupLocation"],
    }
  )
  .refine(
    (data) => {
      // Validate dropoff location if dropoff is selected
      if (data.needsTransportReturn && !data.dropoffLocation?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Dropoff location is required when dropoff service is selected",
      path: ["dropoffLocation"],
    }
  )
  .refine((data) => {
    // Always allow submission - we'll show warnings instead of blocking
    return true;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const [guestData, setGuestData] = useState<any>(null);
  const [needsTransportService, setNeedsTransportService] =
    useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [dropoffTimeWarning, setDropoffTimeWarning] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      needsTransportPickup: false,
      needsTransportReturn: false,
      trainNumber: "",
    },
  });

  // Watch transport mode to conditionally show fields
  const watchedTransportMode = step2Form.watch("transportMode");
  const watchedDropoffDate = step2Form.watch("dropoffDate");
  const watchedDropoffTime = step2Form.watch("dropoffTime");

  // Check for drop-off time warning
  useEffect(() => {
    if (watchedDropoffDate === "dec12" && watchedDropoffTime) {
      const [hours] = watchedDropoffTime.split(":").map(Number);
      if (hours >= 12) {
        setDropoffTimeWarning(
          "Heads up: Drop-off service on December 12th is typically available until 12:00 PM. If you need a later drop-off, we'll do our best to accommodate your request."
        );
      } else {
        setDropoffTimeWarning("");
      }
    } else {
      setDropoffTimeWarning("");
    }
  }, [watchedDropoffDate, watchedDropoffTime]);

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
    mutationFn: async (
      data: Step2FormData & { idDocuments?: File[]; existingUrls?: string[] }
    ) => {
      const formData = new FormData();

      // Log the data being sent for debugging
      console.log("Step 2 form data:", data);

      Object.entries(data).forEach(([key, value]) => {
        if (key !== "idDocuments" && key !== "existingUrls") {
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

      // Handle existing URLs
      if (data.existingUrls && data.existingUrls.length > 0) {
        data.existingUrls.forEach((url, index) => {
          formData.append("existingUrls", url);
        });
      }

      // Handle new files to upload
      if (data.idDocuments && data.idDocuments.length > 0) {
        data.idDocuments.forEach((file, index) => {
          formData.append("idDocuments", file);
          formData.append(`originalFilename_${index}`, file.name);
        });
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
      // Clear the selected files and reset file input
      setSelectedFiles([]);
      setExistingUrls([]);
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

      // Initialize existing URLs for document management
      const existingUrls = guest.idUploadUrls
        ? Array.isArray(guest.idUploadUrls)
          ? guest.idUploadUrls
          : [guest.idUploadUrls]
        : guest.idUploadUrl
        ? [guest.idUploadUrl]
        : [];
      setExistingUrls(existingUrls);

      // Pre-fill step1 form
      step1Form.reset({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone || "",
        phoneWhatsapp: guest.phoneWhatsapp || "",
        adultCount: guest.adultCount || 1,
        kidCount: guest.kidCount || 0,
        rsvpStatus: guest.rsvpStatus,
      });

      // Pre-fill step2 form if it was completed (for future use if they change to attending)
      if (guest.step2Completed) {
        const hasTransportPickup =
          guest.needsTransportPickup || // Check new unified field first
          guest.needsTransportDec9 ||
          guest.needsTransportDec10 ||
          guest.needsTransportDec11 ||
          false;
        const hasTransportReturn = guest.needsTransportReturn || false;

        console.log("Guest transport data:", {
          needsTransportPickup: guest.needsTransportPickup,
          needsTransportDec9: guest.needsTransportDec9,
          needsTransportDec10: guest.needsTransportDec10,
          needsTransportDec11: guest.needsTransportDec11,
          needsTransportReturn: guest.needsTransportReturn,
          hasTransportPickup,
          hasTransportReturn,
        });

        step2Form.reset({
          transportMode: guest.transportMode || "",
          needsTransportPickup: hasTransportPickup,
          needsTransportReturn: hasTransportReturn,
          flightNumber: guest.flightNumber || "",
          trainNumber: guest.trainNumber || "",
          pickupDate: guest.pickupDate || "",
          pickupTime: guest.pickupTime || "",
          pickupLocation: guest.pickupLocation || "",
          dropoffDate: guest.dropoffDate || "",
          dropoffTime: guest.dropoffTime || "",
          dropoffLocation: guest.dropoffLocation || "",
          additionalNotes: guest.additionalNotes || "",
        });

        // Enable transport service section if they previously selected any transport
        if (hasTransportPickup || hasTransportReturn) {
          console.log("Setting needsTransportService to true");
          setNeedsTransportService(true);
        } else {
          console.log(
            "Not setting needsTransportService - no transport selected"
          );
        }
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

    // Validate that the number of ID documents is at least the number of adults
    const adultCount = guestData?.adultCount || 1;
    const totalDocuments = existingUrls.length + selectedFiles.length;

    if (totalDocuments < adultCount) {
      toast({
        title: "ID Document Count Requirement",
        description: `You have ${adultCount} adult${
          adultCount > 1 ? "s" : ""
        } in your party, so you need to upload at least ${adultCount} ID document${
          adultCount > 1 ? "s" : ""
        }. Currently you have ${totalDocuments} document${
          totalDocuments !== 1 ? "s" : ""
        }.`,
        variant: "destructive",
      });
      return;
    }

    if (totalDocuments === 0) {
      toast({
        title: "ID Documents Required",
        description: `Please upload ${adultCount} ID document${
          adultCount > 1 ? "s" : ""
        } (one for each adult) to complete your RSVP.`,
        variant: "destructive",
      });
      return;
    }

    // Validate transport mode if transport service is needed
    if (needsTransportService && !data.transportMode) {
      toast({
        title: "Transport Mode Required",
        description: "Please select how you will be traveling.",
        variant: "destructive",
      });
      return;
    }

    // Get all current form values to ensure we have everything
    const allFormValues = step2Form.getValues();
    console.log("All step2Form values:", allFormValues);

    const submitData = {
      ...allFormValues, // Use all form values instead of just the submitted data
      ...data, // Override with any explicitly passed data
      idDocuments: selectedFiles.length > 0 ? selectedFiles : undefined,
      existingUrls: existingUrls.length > 0 ? existingUrls : undefined,
    };

    console.log("Final submit data:", submitData);
    step2Mutation.mutate(submitData);
  };

  const onFindGuest = (data: FindGuestData) => {
    findGuestMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      filesArray.forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          invalidFiles.push(`${file.name} is too large`);
        } else {
          validFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        toast({
          title: "Some files were too large",
          description: `${invalidFiles.join(
            ", "
          )}. Please select files smaller than 10MB.`,
          variant: "destructive",
        });
      }

      if (validFiles.length > 0) {
        // Check total file count (existing + new <= 5)
        const totalFiles =
          existingUrls.length + selectedFiles.length + validFiles.length;
        if (totalFiles > 5) {
          toast({
            title: "Too many files",
            description: "You can upload a maximum of 5 ID documents total.",
            variant: "destructive",
          });
          return;
        }

        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="adultCount">Number of Adults *</Label>
                      <Input
                        id="adultCount"
                        type="number"
                        min="1"
                        max="10"
                        placeholder="1"
                        {...step1Form.register("adultCount", {
                          valueAsNumber: true,
                        })}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Each adult needs a valid ID for hotel check-in
                      </p>
                      {step1Form.formState.errors.adultCount && (
                        <p className="text-sm text-destructive mt-1">
                          {step1Form.formState.errors.adultCount.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="kidCount">Number of Kids</Label>
                      <Input
                        id="kidCount"
                        type="number"
                        min="0"
                        max="10"
                        placeholder="0"
                        {...step1Form.register("kidCount", {
                          valueAsNumber: true,
                        })}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Kids don't need IDs for check-in
                      </p>
                      {step1Form.formState.errors.kidCount && (
                        <p className="text-sm text-destructive mt-1">
                          {step1Form.formState.errors.kidCount.message}
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
                      <Label
                        htmlFor="idUpload"
                        className="block text-sm font-medium mb-2"
                      >
                        Upload ID Document *
                      </Label>
                      <p className="text-sm text-muted-foreground mt-2 py-1">
                        Upload at least one valid ID document for each adult in
                        your party ({guestData?.adultCount || 1} required). Kids
                        don't need IDs for check-in.
                      </p>

                      {/* Display existing uploaded documents */}
                      {existingUrls.length > 0 && (
                        <div className="mb-4 space-y-2">
                          <p className="text-sm font-medium text-green-900 mb-2">
                            Already Uploaded Documents
                          </p>
                          {existingUrls.map((url: string, index: number) => (
                            <div
                              key={`existing-${index}`}
                              className="p-3 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-green-900">
                                    Document {index + 1}
                                  </p>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-green-600 hover:text-green-800 underline"
                                  >
                                    View document →
                                  </a>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setExistingUrls((prev) =>
                                      prev.filter((_, i) => i !== index)
                                    );
                                  }}
                                  className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display newly selected files */}
                      {selectedFiles.length > 0 && (
                        <div className="mb-4 space-y-2">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            New Files to Upload
                          </p>
                          {selectedFiles.map((file, index) => (
                            <div
                              key={`new-${index}`}
                              className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Upload className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-blue-900">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedFiles((prev) =>
                                      prev.filter((_, i) => i !== index)
                                    );
                                  }}
                                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-pink-300 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="idUpload"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="idUpload" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {selectedFiles.length > 0
                              ? `${selectedFiles.length} file${
                                  selectedFiles.length > 1 ? "s" : ""
                                } selected`
                              : existingUrls.length > 0
                              ? "Click to add more ID documents (optional)"
                              : "Click to upload your ID documents (required)"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, JPG, PNG up to 10MB each (max 5 total)
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
                        How will you be traveling?{" "}
                        {needsTransportService ? "*" : "(optional)"}
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

                  {/* Transport Service Checkbox */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border border-input rounded-lg">
                      <input
                        type="checkbox"
                        id="needsTransportService"
                        checked={needsTransportService}
                        onChange={(e) =>
                          setNeedsTransportService(e.target.checked)
                        }
                        className="rounded"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="needsTransportService"
                          className="font-medium cursor-pointer"
                        >
                          Do you need pickup or drop-off transportation service?
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          We provide complimentary transport from Udaipur
                          Airport and Railway station
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transport Service Section */}
                  {needsTransportService && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-pink-500" />
                        <h3 className="text-lg font-semibold">
                          Transportation
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        We provide complimentary transport service from airports
                        and railway stations.
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
                              PM) and 12th December (standard availability till
                              12:00 PM)
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
                        <div className="flex items-center space-x-3 p-4 border border-input rounded-lg">
                          <input
                            type="checkbox"
                            id="needsTransportPickup"
                            {...step2Form.register("needsTransportPickup")}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor="needsTransportPickup"
                              className="font-medium cursor-pointer"
                            >
                              Pickup
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Airport/station pickup service for guest arrivals
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
                              Drop Off
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Drop off service to airport/station (standard
                              availability till 12:00 PM on Dec 12th)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Time Selection */}
                      {(step2Form.watch("needsTransportPickup") ||
                        step2Form.watch("needsTransportReturn")) && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-pink-50 rounded-lg">
                            {step2Form.watch("needsTransportPickup") && (
                              <>
                                <div>
                                  <Label htmlFor="pickupDate">
                                    Pickup Date
                                  </Label>
                                  <Select
                                    onValueChange={(value) =>
                                      step2Form.setValue("pickupDate", value)
                                    }
                                    defaultValue={step2Form.getValues(
                                      "pickupDate"
                                    )}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="dec10">
                                        December 10th
                                      </SelectItem>
                                      <SelectItem value="dec11">
                                        December 11th
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="pickupTime">
                                    Pickup Time
                                  </Label>
                                  <Input
                                    id="pickupTime"
                                    type="time"
                                    placeholder="e.g., 14:30"
                                    {...step2Form.register("pickupTime")}
                                    className="mt-1"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <Label htmlFor="pickupLocation">
                                    Exact Pickup Location
                                  </Label>
                                  <Input
                                    id="pickupLocation"
                                    placeholder="e.g., Maharana Pratap Railway Station"
                                    {...step2Form.register("pickupLocation")}
                                    className="mt-1"
                                  />
                                </div>
                              </>
                            )}

                            {step2Form.watch("needsTransportReturn") && (
                              <>
                                <div>
                                  <Label htmlFor="dropoffDate">
                                    Dropoff Date
                                  </Label>
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
                                  <Label htmlFor="dropoffTime">
                                    Dropoff Time
                                  </Label>
                                  <Input
                                    id="dropoffTime"
                                    type="time"
                                    placeholder="e.g., 16:30"
                                    {...step2Form.register("dropoffTime")}
                                    className="mt-1"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <Label htmlFor="dropoffLocation">
                                    Dropoff Location
                                  </Label>
                                  <Input
                                    id="dropoffLocation"
                                    placeholder="e.g., Udaipur Airport, Maharana Pratap Railway Station"
                                    {...step2Form.register("dropoffLocation")}
                                    className="mt-1"
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          {/* Warning displayed outside the grid for full width */}
                          {dropoffTimeWarning && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-amber-800">
                                  {dropoffTimeWarning}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

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
