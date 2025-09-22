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
      <section
        id="story"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4"
              data-testid="story-title"
            >
              {ourStory?.title || "Our Story"}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            <p className="text-muted-foreground mt-4 text-lg">
              Our journey from Vancouver to forever
            </p>
          </div>

          {/* Story Timeline with Zig-Zag Layout */}
          <div className="relative">
            {/* Dotted Line Connector */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 hidden lg:block">
              <div className="absolute top-0 w-full h-full bg-dotted-line opacity-60"></div>
            </div>

            {/* Story Item 1 - How We Met (Left Image, Right Content) */}
            <div className="relative mb-20 lg:mb-32">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div className="lg:order-1 relative">
                  <div className="relative group">
                    <img
                      src="/images/story/couple-story.jpg"
                      alt="Vancouver - Where it all began"
                      className="rounded-2xl shadow-2xl w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary shadow-lg">
                      Vancouver, Canada 🇨🇦
                    </div>
                  </div>
                  {/* Connector Dot */}
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-primary rounded-full border-4 border-background shadow-lg hidden lg:block z-10">
                    <div className="w-full h-full bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="lg:order-2 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    <Heart className="w-4 h-4" />
                    Chapter 1: The Beginning
                  </div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
                    How We Met: A Vancouver Love Story
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Our love story began in the beautiful city of Vancouver,
                    Canada, where our mutual friend Jimit played cupid and
                    introduced us. Before romance even entered the picture, we
                    found ourselves on an epic adventure to the Yukon with
                    friends, chasing the Northern Lights. Little did we know
                    we'd find our own kind of magic right there in the group!
                    What followed was Sneha's strategic mastermind plan
                    involving dance classes and mysteriously acquiring a fob to
                    Abhinav's building pool for "swimming lessons" (complete
                    with backup friend Ria).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      Northern Lights ✨
                    </span>
                    <span className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      Swimming Pool Strategy 🏊‍♀️
                    </span>
                    <span className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      Stanley Park 🚴‍♂️
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Item 2 - Adventures Together (Right Image, Left Content) */}
            <div className="relative mb-20 lg:mb-32">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div className="lg:order-2 relative">
                  <div className="relative group">
                    <img
                      src="/images/gallery/gallery-2.jpg"
                      alt="Adventures and fun times together"
                      className="rounded-2xl shadow-2xl w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tl from-secondary/20 to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-secondary shadow-lg">
                      Adventures & Fun 🎮
                    </div>
                  </div>
                  {/* Connector Dot */}
                  <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-secondary rounded-full border-4 border-background shadow-lg hidden lg:block z-10">
                    <div className="w-full h-full bg-secondary rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="lg:order-1 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />
                    Chapter 2: Adventures
                  </div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
                    Inseparable Adventures
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    From there, we were inseparable - partying together, having
                    epic game nights, trying surfing, and going on camping trips
                    that tested our relationship survival skills (spoiler: we
                    passed!). We're complete opposites in the best way: Sneha's
                    sweet tooth meets Abhinav's fitness obsession, creating the
                    perfect balance. Our first TV show as a couple was{" "}
                    <em>The Office</em>, which basically means our relationship
                    foundation was built on Jim and Pam references.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">
                      The Office 📺
                    </span>
                    <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">
                      Game Nights 🎮
                    </span>
                    <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">
                      Surfing 🏄‍♂️
                    </span>
                    <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">
                      Camping ⛺
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Item 3 - The Proposal (Left Image, Right Content) */}
            <div className="relative mb-16">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div className="lg:order-1 relative">
                  <div className="relative group">
                    <img
                      src="/images/gallery/gallery-3.jpg"
                      alt="Moraine Lake - Where forever began"
                      className="rounded-2xl shadow-2xl w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-accent-foreground shadow-lg">
                      Moraine Lake 💍
                    </div>
                  </div>
                  {/* Connector Dot */}
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-accent rounded-full border-4 border-background shadow-lg hidden lg:block z-10">
                    <div className="w-full h-full bg-accent rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="lg:order-2 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                    <Heart className="w-4 h-4" />
                    Chapter 3: Forever
                  </div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
                    The Proposal & Our Future
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Recently, we took our biggest adventure yet: a 10-day RV
                    trip with our closest friends through the Canadian Rockies.
                    At the breathtakingly beautiful Moraine Lake, Abhinav got
                    down on one knee and asked Sneha to be his adventure partner
                    for life. From the Northern Lights to Moraine Lake, from
                    Stanley Park bike rides to RV road trips, every adventure
                    has led us here - to December 10th & 11th, 2025, when we'll
                    officially become the Jains!
                  </p>
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-2xl border border-primary/20">
                    <p className="text-foreground font-medium text-center">
                      "We can't wait to celebrate with all of you in beautiful
                      Udaipur!"
                    </p>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      P.S. - There will definitely be tiramisu at the reception!
                      😉
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      RV Adventures 🚐
                    </span>
                    <span className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      Moraine Lake 💍
                    </span>
                    <span className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      Tiramisu Promise 🍰
                    </span>
                  </div>
                </div>
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
