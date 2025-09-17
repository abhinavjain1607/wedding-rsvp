import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle, Camera } from "lucide-react";

interface PhotoUploadData {
  caption?: string;
  uploadedBy?: string;
}

export default function PhotoUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const { toast } = useToast();

  const form = useForm<PhotoUploadData>();

  const uploadMutation = useMutation({
    mutationFn: async (data: PhotoUploadData & { photos: FileList }) => {
      const formData = new FormData();
      Array.from(data.photos).forEach(file => {
        formData.append("photos", file);
      });
      if (data.caption) formData.append("caption", data.caption);
      if (data.uploadedBy) formData.append("uploadedBy", data.uploadedBy);
      
      return apiRequest("POST", "/api/gallery/upload", formData);
    },
    onSuccess: () => {
      setIsUploaded(true);
      toast({
        title: "Photos Uploaded!",
        description: "Thank you for sharing your memories with us!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photos",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Validate file sizes
      const maxSize = 5 * 1024 * 1024; // 5MB
      const invalidFiles = Array.from(files).filter(file => file.size > maxSize);
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Files too large",
          description: "Please select photos smaller than 5MB each",
          variant: "destructive",
        });
        return;
      }

      setSelectedFiles(files);
    }
  };

  const onSubmit = (data: PhotoUploadData) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "No photos selected",
        description: "Please select at least one photo to upload",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      ...data,
      photos: selectedFiles,
    });
  };

  if (isUploaded) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
              Thank You!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your photos have been uploaded successfully. Sarah & Michael will treasure these memories!
            </p>
            <Button onClick={() => window.location.href = "/"} data-testid="button-home">
              Back to Wedding Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-8">
          <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4" data-testid="upload-title">
            Share Your Wedding Photos
          </h1>
          <p className="text-muted-foreground">
            Help Sarah & Michael capture every moment by uploading your photos from the celebration!
          </p>
        </div>

        <Card data-testid="card-upload">
          <CardHeader>
            <CardTitle>Upload Your Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="photos" className="block text-sm font-medium mb-2">
                  Select Photos
                </Label>
                <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="photos"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-photos"
                  />
                  <label htmlFor="photos" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {selectedFiles && selectedFiles.length > 0
                        ? `${selectedFiles.length} photo(s) selected`
                        : "Click to select photos or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Multiple JPG, PNG files up to 5MB each
                    </p>
                  </label>
                </div>
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Selected files:</p>
                    <ul className="text-sm space-y-1">
                      {Array.from(selectedFiles).map((file, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{file.name}</span>
                          <span className="text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="uploadedBy">Your Name (Optional)</Label>
                <Input
                  id="uploadedBy"
                  placeholder="Enter your name"
                  {...form.register("uploadedBy")}
                  data-testid="input-name"
                />
              </div>

              <div>
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption to your photos..."
                  rows={3}
                  {...form.register("caption")}
                  data-testid="input-caption"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={uploadMutation.isPending || !selectedFiles || selectedFiles.length === 0}
                data-testid="button-upload"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Photos"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            By uploading photos, you grant Sarah & Michael permission to use them for their wedding memories.
          </p>
        </div>
      </div>
    </div>
  );
}
