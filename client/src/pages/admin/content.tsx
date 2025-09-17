import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminNavigation from "@/components/admin-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Trash2, Move } from "lucide-react";
import type { DashboardContent, GalleryImage } from "@shared/schema";

interface ContentData {
  sectionName: string;
  title: string;
  content: string;
}

export default function AdminContent() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: content = [] } = useQuery<DashboardContent[]>({
    queryKey: ["/api/dashboard-content"],
    retry: false,
  });

  const { data: galleryImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
    retry: false,
  });

  const storyForm = useForm<ContentData>({
    defaultValues: {
      sectionName: "our_story",
      title: "Our Story",
      content: "",
    },
  });

  const venueForm = useForm<ContentData>({
    defaultValues: {
      sectionName: "venue_details",
      title: "Venue & Location",
      content: "",
    },
  });

  // Load existing content into forms
  useEffect(() => {
    const ourStory = content.find((c) => c.sectionName === "our_story");
    const venueDetails = content.find((c) => c.sectionName === "venue_details");

    if (ourStory) {
      storyForm.reset({
        sectionName: "our_story",
        title: ourStory.title || "Our Story",
        content: ourStory.content || "",
      });
    }

    if (venueDetails) {
      venueForm.reset({
        sectionName: "venue_details",
        title: venueDetails.title || "Venue & Location",
        content: venueDetails.content || "",
      });
    }
  }, [content, storyForm, venueForm]);

  const updateContentMutation = useMutation({
    mutationFn: async (data: ContentData) => {
      return apiRequest("PUT", "/api/admin/dashboard-content", data);
    },
    onSuccess: () => {
      toast({
        title: "Content Updated",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-content"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update content",
        variant: "destructive",
      });
    },
  });

  const uploadGalleryMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append("images", file);
      });
      return apiRequest("POST", "/api/admin/gallery", formData);
    },
    onSuccess: () => {
      toast({
        title: "Photos Uploaded",
        description: "New gallery images have been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setSelectedFiles(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload gallery images",
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return apiRequest("DELETE", `/api/admin/gallery/${imageId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Image Deleted",
        description: "The gallery image has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const invalidFiles = Array.from(files).filter(file => file.size > maxSize);
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Files too large",
          description: "Please select images smaller than 5MB each",
          variant: "destructive",
        });
        return;
      }

      setSelectedFiles(files);
    }
  };

  const onUpdateStory = (data: ContentData) => {
    updateContentMutation.mutate(data);
  };

  const onUpdateVenue = (data: ContentData) => {
    updateContentMutation.mutate(data);
  };

  const onUploadGallery = () => {
    if (selectedFiles) {
      uploadGalleryMutation.mutate(selectedFiles);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2" data-testid="content-title">
            Content Management
          </h1>
          <p className="text-muted-foreground">Update your wedding website content and photo gallery</p>
        </div>

        <div className="space-y-8">
          {/* Our Story Section */}
          <Card data-testid="card-story">
            <CardHeader>
              <CardTitle>Our Story Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={storyForm.handleSubmit(onUpdateStory)} className="space-y-4">
                <div>
                  <Label htmlFor="storyTitle">Section Title</Label>
                  <Input
                    id="storyTitle"
                    {...storyForm.register("title")}
                    data-testid="input-story-title"
                  />
                </div>
                <div>
                  <Label htmlFor="storyContent">Story Content</Label>
                  <Textarea
                    id="storyContent"
                    rows={6}
                    {...storyForm.register("content")}
                    data-testid="textarea-story-content"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateContentMutation.isPending}
                  data-testid="button-update-story"
                >
                  {updateContentMutation.isPending ? "Updating..." : "Update Story"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Venue Details Section */}
          <Card data-testid="card-venue">
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={venueForm.handleSubmit(onUpdateVenue)} className="space-y-4">
                <div>
                  <Label htmlFor="venueTitle">Section Title</Label>
                  <Input
                    id="venueTitle"
                    {...venueForm.register("title")}
                    data-testid="input-venue-title"
                  />
                </div>
                <div>
                  <Label htmlFor="venueContent">Venue Description</Label>
                  <Textarea
                    id="venueContent"
                    rows={4}
                    {...venueForm.register("content")}
                    data-testid="textarea-venue-content"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateContentMutation.isPending}
                  data-testid="button-update-venue"
                >
                  {updateContentMutation.isPending ? "Updating..." : "Update Venue Details"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Photo Gallery Management */}
          <Card data-testid="card-gallery">
            <CardHeader>
              <CardTitle>Photo Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload New Photos */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="galleryUpload"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-gallery-upload"
                  />
                  <label htmlFor="galleryUpload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {selectedFiles && selectedFiles.length > 0
                        ? `${selectedFiles.length} image(s) selected`
                        : "Click to upload photos or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Multiple JPG, PNG files up to 5MB each
                    </p>
                  </label>
                </div>
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={onUploadGallery}
                      disabled={uploadGalleryMutation.isPending}
                      data-testid="button-upload-gallery"
                    >
                      {uploadGalleryMutation.isPending ? "Uploading..." : "Upload Photos"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Existing Photos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="gallery-grid">
                {galleryImages.map((image: any) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.imageUrl}
                      alt="Gallery image"
                      className="w-full h-24 object-cover rounded-lg"
                      data-testid={`gallery-image-${image.id}`}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => deleteImageMutation.mutate(image.id)}
                        className="text-white hover:text-red-400 mr-2 p-1"
                        disabled={deleteImageMutation.isPending}
                        data-testid={`button-delete-${image.id}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        className="text-white hover:text-blue-400 p-1"
                        data-testid={`button-reorder-${image.id}`}
                      >
                        <Move className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
