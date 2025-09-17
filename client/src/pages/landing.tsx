import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Calendar,
  MapPin,
  Plane,
  Car,
  Train,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PhotoGallery from "@/components/photo-gallery";

interface DashboardContent {
  sectionName: string;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function Landing() {
  const { data: content = [] } = useQuery<DashboardContent[]>({
    queryKey: ["/api/dashboard-content"],
  });

  const ourStory = content.find((c) => c.sectionName === "our_story");
  const venueDetails = content.find((c) => c.sectionName === "venue_details");

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-effect border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-serif font-semibold text-primary">
                Sneha & Abhinav
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="#story"
                className="text-foreground hover:text-primary transition-colors"
              >
                Our Story
              </a>
              <a
                href="#details"
                className="text-foreground hover:text-primary transition-colors"
              >
                Details
              </a>
              <a
                href="#gallery"
                className="text-foreground hover:text-primary transition-colors"
              >
                Gallery
              </a>
              <a
                href="#rsvp"
                className="text-foreground hover:text-primary transition-colors"
              >
                RSVP
              </a>
              <Button
                onClick={handleLogin}
                variant="outline"
                size="sm"
                data-testid="button-login"
              >
                Admin
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden">
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
            <a href="#rsvp">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-rsvp"
              >
                RSVP Now
              </Button>
            </a>
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
                      Our journey began in the vibrant city of Bangalore, where
                      two paths crossed in the most unexpected way. What started
                      as a chance encounter blossomed into a beautiful love
                      story filled with laughter, adventures, and countless
                      memories.
                    </p>
                    <p className="mb-4">
                      Through years of friendship and love, we've grown
                      together, supported each other's dreams, and discovered
                      that we truly are better together. Now we're ready to take
                      the next step in our journey and celebrate with our
                      closest family and friends in the magical city of Udaipur.
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
                    alt="Elegant venue in Udaipur with beautiful architecture"
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
                      "A breathtaking venue in the royal city of Udaipur, featuring traditional Rajasthani architecture and stunning views of the Aravalli hills."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://maps.google.com/?q=Shakti+Vilas+Debari+Udaipur"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                      data-testid="link-maps"
                    >
                      <MapPin className="w-5 h-5 mr-2" />
                      View on Google Maps
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
                    Airport
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Udaipur Airport (UDR) - 30km from venue
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
                    Ample parking available at venue
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Train className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Railway
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Udaipur City Railway Station - 25km from venue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <PhotoGallery />

      {/* RSVP Section */}
      <section id="rsvp" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6"
            data-testid="rsvp-title"
          >
            RSVP Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your presence would make our special day even more meaningful.
            Please let us know if you can join us in Udaipur.
          </p>
          <a href="/rsvp">
            <Button size="lg" className="px-8" data-testid="button-rsvp-page">
              Complete Your RSVP
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            © 2025 Sneha & Abhinav Wedding. Made with ❤️ for our special day.
          </p>
        </div>
      </footer>
    </div>
  );
}
