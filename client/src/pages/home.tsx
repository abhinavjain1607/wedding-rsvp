import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import PhotoGallery from "@/components/photo-gallery";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Calendar,
  MapPin,
  Plane,
  Car,
  Train,
  Users,
} from "lucide-react";
import { Link } from "wouter";

interface DashboardContent {
  sectionName: string;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function Home() {
  const { data: content = [] } = useQuery<DashboardContent[]>({
    queryKey: ["/api/dashboard-content"],
  });

  const { data: qrCode } = useQuery({
    queryKey: ["/api/qr-code"],
  });

  const ourStory = content.find((c) => c.sectionName === "our_story");
  const venueDetails = content.find((c) => c.sectionName === "venue_details");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section
        id="home"
        className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero/wedding-couple.jpg"
            alt="Elegant wedding couple portrait"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8"
          data-testid="hero-content"
        >
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 text-foreground">
            Sneha & Abhinav
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 font-light">
            December 10 -11, 2025
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12">
            Shakti Vilas, Debari, Udaipur
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rsvp">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-rsvp"
              >
                RSVP Now
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                document
                  .getElementById("details")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-testid="button-details"
            >
              View Details
            </Button>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4"
              data-testid="story-title"
            >
              {ourStory?.title || "Our Story"}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <img
                src="/images/story/couple-story.jpg"
                alt="Romantic couple embracing outdoors"
                className="rounded-lg shadow-lg w-full"
                data-testid="story-image"
              />
            </div>
            <div className="space-y-6">
              <div
                className="text-lg text-muted-foreground leading-relaxed"
                data-testid="story-content"
              >
                {ourStory?.content ? (
                  ourStory.content.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="mb-4">
                      We first met at a coffee shop in downtown Seattle on a
                      rainy Tuesday morning. Sarah was reading her favorite
                      novel while Michael was nervously preparing for a job
                      interview. When he accidentally spilled coffee on her
                      book, what started as an embarrassing moment turned into
                      hours of conversation and laughter.
                    </p>
                    <p className="mb-4">
                      Five years, countless adventures, and one unforgettable
                      proposal later, we're excited to celebrate our love story
                      with all of you in the beautiful setting of Lake Como,
                      Udaipur.
                    </p>
                  </>
                )}
              </div>
              <div className="bg-accent/30 p-6 rounded-lg">
                <p className="text-center text-foreground font-medium italic">
                  "Love is not about how many days, months, or years you have
                  been together. Love is about how much you love each other
                  every single day."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wedding Details Section */}
      <section id="details" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4"
              data-testid="details-title"
            >
              Wedding Details
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Welcome Reception */}
            <Card className="text-center" data-testid="card-welcome">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">
                  Welcome Reception
                </h3>
                <p className="text-muted-foreground mb-2">
                  Friday, December 10, 2025
                </p>
                <p className="text-muted-foreground mb-4">7:00 PM - 10:00 PM</p>
                <p className="text-sm text-muted-foreground">
                  Cocktails & Dinner by the Lake
                </p>
              </CardContent>
            </Card>

            {/* Wedding Ceremony */}
            <Card className="text-center" data-testid="card-ceremony">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">
                  Wedding Ceremony
                </h3>
                <p className="text-muted-foreground mb-2">
                  Saturday, December 10, 2025
                </p>
                <p className="text-muted-foreground mb-4">4:00 PM - 11:00 PM</p>
                <p className="text-sm text-muted-foreground">
                  Ceremony & Reception
                </p>
              </CardContent>
            </Card>

            {/* Farewell Brunch */}
            <Card className="text-center" data-testid="card-farewell">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">
                  Farewell Brunch
                </h3>
                <p className="text-muted-foreground mb-2">
                  Sunday, December 11, 2025
                </p>
                <p className="text-muted-foreground mb-4">10:00 AM - 1:00 PM</p>
                <p className="text-sm text-muted-foreground">
                  Casual Brunch & Goodbyes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Venue Information */}
          <Card className="mb-8" data-testid="card-venue">
            <CardContent className="p-8">
              <h3 className="font-serif text-2xl font-semibold mb-6 text-center text-foreground">
                Venue & Location
              </h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img
                    src="/images/venue/shakti-vilas.jpg"
                    alt="Elegant villa overlooking Lake Como with manicured gardens"
                    className="rounded-lg shadow-md w-full"
                    data-testid="venue-image"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-foreground">
                    Shakti Vilas
                  </h4>
                  <p className="text-muted-foreground">
                    Tehsil Mavli, Debari, Udaipur
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {venueDetails?.content ||
                      "A breathtaking botanical garden villa on the shores of Lake Como, featuring historic architecture and stunning panoramic views of the Italian Alps."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://maps.google.com/?q=Villa+Monastero+Varenna"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                      data-testid="link-maps"
                    >
                      <MapPin className="w-5 h-5 mr-2" />
                      View on Google Maps
                    </a>
                    <a
                      href="https://www.villamonastero.eu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                      data-testid="link-venue"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        ></path>
                      </svg>
                      Visit Venue Website
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transportation */}
          <Card data-testid="card-transport">
            <CardContent className="p-8">
              <h3 className="font-serif text-2xl font-semibold mb-6 text-center text-foreground">
                Transportation
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Plane className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Shuttle Service
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Complimentary shuttles from Milan Malpensa Airport
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Car className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Parking
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Limited parking available at venue
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Train className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Local Transport
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Ferry service available from Bellagio and Como
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <PhotoGallery />

      {/* QR Code Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <h3
            className="font-serif text-2xl font-semibold mb-4 text-foreground"
            data-testid="qr-title"
          >
            Share Your Photos
          </h3>
          <p className="text-muted-foreground mb-6">
            Scan the QR code during our wedding to upload your photos to our
            shared album
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div
                className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center"
                data-testid="qr-code"
              >
                {qrCode ? (
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M16 8h4.01M12 8h.01M8 12h.01M8 8h.01M8 20h.01M8 16h.01M16 12h.01M16 20h.01"
                      ></path>
                    </svg>
                    <p className="text-xs text-gray-600">QR Code</p>
                  </div>
                ) : (
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M16 8h4.01M12 8h.01M8 12h.01M8 8h.01M8 20h.01M8 16h.01M16 12h.01M16 20h.01"
                    ></path>
                  </svg>
                )}
              </div>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-foreground mb-2">
                How to share:
              </h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Scan the QR code with your phone camera</li>
                <li>2. Select photos from your gallery</li>
                <li>3. Add a caption (optional)</li>
                <li>4. Upload to our wedding album</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
