import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image } from "lucide-react";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  uploadedBy?: string;
  createdAt: string;
}

export default function PhotoGallery() {
  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  // Default images if no custom images are uploaded - mix of family and friendly photos
  const defaultImages = [
    "/images/travel/car-yukon.jpg",
    "/images/travel/hike-glacier.jpg",
    "/images/family/cherry-blossom.jpeg",
    "/images/travel/hike-north-cascades.jpg",
    "/images/family/family.jpeg",
    "/images/family/mama-mami.jpeg",
  ];

  const displayImages =
    images.length > 0
      ? images
      : defaultImages.map((url, index) => ({
          id: `default-${index}`,
          imageUrl: url,
          caption: "",
          uploadedBy: "",
          createdAt: new Date().toISOString(),
        }));

  if (isLoading) {
    return (
      <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Photo Gallery
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="gallery"
      className="py-20 px-4 sm:px-6 lg:px-8"
      data-testid="photo-gallery"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4"
            data-testid="gallery-title"
          >
            Photo Gallery
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          <p className="text-muted-foreground mt-4">
            A glimpse into our journey together
          </p>
        </div>

        {displayImages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Photos Yet
              </h3>
              <p className="text-muted-foreground">
                Photos will appear here as they are uploaded by guests and
                admins.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="gallery-grid"
          >
            {displayImages.map((image, index) => {
              // Determine specific positioning for different image types
              let objectPosition = "center";

              if (image.imageUrl.includes("yukon-snow")) {
                // Portrait photo - focus on upper-center where people are positioned
                objectPosition = "50% 25%";
              } else if (image.imageUrl.includes("family")) {
                // Family photos - usually people in center-upper area
                objectPosition = "50% 30%";
              } else if (image.imageUrl.includes("cherry-blossom")) {
                // Cherry blossom photos - focus on people in the scene
                objectPosition = "50% 35%";
              } else if (image.imageUrl.includes("kits-volleyball")) {
                // Sports photo - focus on center action
                objectPosition = "center";
              }

              return (
                <div
                  key={image.id}
                  className="relative group overflow-hidden rounded-lg shadow-lg aspect-square"
                  data-testid={`gallery-item-${index}`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.caption || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{
                      objectPosition: objectPosition,
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>

                  {/* Caption overlay */}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm font-medium">
                        {image.caption}
                      </p>
                      {image.uploadedBy && (
                        <p className="text-white/80 text-xs">
                          by {image.uploadedBy}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 rounded-lg px-4 py-2">
            <Image className="w-4 h-4 text-accent-foreground" />
            <span className="text-sm text-accent-foreground">
              {images.length > 0
                ? `${images.length} photos uploaded by guests and admins`
                : "Upload photos during the wedding to see them here"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
