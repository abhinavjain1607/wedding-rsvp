import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import PhotoGallery from "@/components/photo-gallery";
import { StoryPhotoCarousel } from "@/components/story-photo-carousel";
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
  // Check for family-friendly version query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isFamilyVersion = urlParams.get("t") === "fm";

  const { data: content = [] } = useQuery<DashboardContent[]>({
    queryKey: ["/api/dashboard-content"],
  });

  const { data: qrCode } = useQuery({
    queryKey: ["/api/qr-code"],
  });

  // Family-friendly photo collection - using engagement/proposal photos
  const familyPhotos = [
    {
      src: "/images/photoshoot/moraine-proposal.jpeg",
      alt: "Sneha & Abhinav - A beautiful love story",
      caption: "A magical proposal moment at the breathtaking Moraine Lake",
    },
    {
      src: "/images/photoshoot/peyto-ring.jpeg",
      alt: "Beautiful engagement moments",
      caption: "Celebrating our engagement in the Canadian Rockies",
    },
    {
      src: "/images/photoshoot/bow-walk.jpeg",
      alt: "Romantic couple moments",
      caption: "A special moment captured forever",
    },
  ];

  // Photo collections for story carousels
  const vancouverPhotos = [
    {
      src: "/images/travel/yukon-snow.jpg",
      alt: "Vancouver - Where it all began",
      caption: "Our adventure began in beautiful Vancouver",
    },
    {
      src: "images/travel/smile-cincin.jpg",
      alt: "Special moments together",
      caption: "Capturing smiles and laughter in the city",
    },
    {
      src: "/images/family/kits-volleyball.jpeg",
      alt: "Active life in Vancouver",
      caption: "Enjoying beach volleyball at Kits",
    },
  ];

  const adventurePhotos = [
    {
      src: "/images/travel/la-beach.jpeg",
      alt: "Adventures and fun times together",
      caption: "Exploring beaches and cities",
    },
    {
      src: "/images/travel/boat-party.jpg",
      alt: "Fun celebration moments",
      caption: "Celebrating life together",
    },
    {
      src: "/images/travel/party.jpeg",
      alt: "Party moments",
      caption: "Blurry nights and fun times",
    },
    {
      src: "/images/travel/stanley-park.jpeg",
      alt: "Travel celebrations",
      caption: "Cycling in Stanley Park",
    },
  ];

  const proposalPhotos = [
    {
      src: "/images/photoshoot/moraine-proposal.jpeg",
      alt: "The magical proposal moment at Moraine Lake",
      caption: "A perfect proposal at the stunning Moraine Lake",
    },
    {
      src: "/images/photoshoot/peyto-ring.jpeg",
      alt: "Beautiful engagement moments",
      caption: "Exploring beautiful glaciers and mountain trails",
    },
    {
      src: "/images/photoshoot/bow-movie.jpeg",
      alt: "Romantic moment captured in the Canadian Rockies",
      caption: "Beautiful moments in the Canadian wilderness",
    },
  ];

  const ourStory = content.find((c) => c.sectionName === "our_story");
  const venueDetails = content.find((c) => c.sectionName === "venue_details");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section
        id="home"
        className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Desktop/Tablet image - centered */}
          <img
            src="/images/hero/wedding-couple.jpg"
            alt="Elegant wedding couple portrait"
            className="hidden sm:block w-full h-full object-cover object-center"
          />
          {/* Mobile image - positioned to show both people, especially Sneha on the right */}
          <img
            src="/images/hero/wedding-couple.jpg"
            alt="Elegant wedding couple portrait"
            className="block sm:hidden w-full h-full object-cover"
            style={{
              objectPosition: "60% center",
            }}
          />
          {/* Modern gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/20"></div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 z-5 pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-16 w-1 h-1 bg-pink-300/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-purple-300/25 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-10 w-1 h-1 bg-white/15 rounded-full animate-pulse delay-3000"></div>
        </div>

        {/* Main content */}
        <div
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
          data-testid="hero-content"
        >
          {/* Elegant content without heavy container */}
          <div className="space-y-8">
            {/* Main title with elegant styling */}
            <div className="space-y-6">
              <h1 className="font-script text-5xl sm:text-7xl lg:text-8xl font-medium text-white drop-shadow-2xl tracking-wide">
                Sneha <span className="text-pink-300">&</span> Abhinav
              </h1>

              {/* Subtle decorative element */}
              <div className="flex items-center justify-center">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                <div className="mx-4 w-1 h-1 bg-white/80 rounded-full"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>

            {/* Event details with refined styling */}
            <div className="space-y-4 py-6">
              <p
                className="font-script text-xl sm:text-3xl text-white/95 font-medium tracking-wider"
                style={{ fontSize: "min(2.25rem, 7vw)" }}
              >
                December 10-11, 2025
              </p>
              <p
                className="font-script text-base sm:text-xl text-white/85 font-medium tracking-wide"
                style={{ fontSize: "min(1.5rem, 5vw)" }}
              >
                Shakti Vilas, Debari, Udaipur
              </p>
            </div>

            {/* Enhanced buttons without container */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6">
              <Link href="/rsvp">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 w-52 h-14 rounded-full font-medium shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg tracking-wide"
                  data-testid="button-rsvp"
                >
                  RSVP Now
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-52 h-14 border-2 border-white/60 text-white hover:bg-white/20 hover:border-white/80 hover:text-white rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg tracking-wide backdrop-blur-sm bg-white/10"
                onClick={() => {
                  const detailsSection = document.getElementById("details");
                  if (detailsSection) {
                    detailsSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                data-testid="button-details"
              >
                View Details
              </Button>
            </div>
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
              {isFamilyVersion
                ? "A beautiful love story"
                : "Our journey from Vancouver to forever"}
            </p>
          </div>

          {isFamilyVersion ? (
            /* Family-Friendly Story Version */
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <StoryPhotoCarousel
                    photos={familyPhotos}
                    badgeText="Banff"
                    badgeColor="primary"
                  />
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    <Heart className="w-4 h-4" />A Love Story
                  </div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    How We Met & Our Journey Together
                  </h3>
                  <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                    Sneha and Abhinav met in beautiful Vancouver, Canada, where
                    they quickly became the best of friends. Through shared
                    adventures, travels, and countless happy moments, their
                    friendship blossomed into something truly special. From
                    exploring the Canadian wilderness to making memories around
                    the world, they discovered they were perfect partners in
                    life. Their love story reached its most beautiful moment
                    when Abhinav proposed at the stunning Moraine Lake, and now
                    they're excited to celebrate this new chapter with all their
                    loved ones in Udaipur this December!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      Best Friends ❤️
                    </span>
                    <span className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      Travel Adventures ✈️
                    </span>
                    <span className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      Moraine Lake 💍
                    </span>
                    <span className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      December 2025 💕
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Original Detailed Story Version */
            <div className="relative">
              {/* Elegant Timeline Connector */}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-16 bottom-16 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 hidden lg:block">
                {/* Chapter connection dots */}
                <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary/50 rounded-full border-2 border-background shadow-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary/50 rounded-full border-2 border-background shadow-lg"></div>
                <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary/50 rounded-full border-2 border-background shadow-lg"></div>
              </div>

              {/* Branch connectors for each section */}
              <div className="absolute left-1/2 top-1/4 transform -translate-x-1/2 -translate-y-1/2 w-16 h-px bg-gradient-to-r from-primary/40 to-transparent hidden lg:block"></div>
              <div className="absolute right-1/2 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-16 h-px bg-gradient-to-l from-primary/40 to-transparent hidden lg:block"></div>
              <div className="absolute left-1/2 top-3/4 transform -translate-x-1/2 -translate-y-1/2 w-16 h-px bg-gradient-to-r from-primary/40 to-transparent hidden lg:block"></div>

              {/* Story Item 1 - How We Met (Left Image, Right Content) */}
              <div className="relative mb-20 lg:mb-32">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  <div className="lg:order-1 relative">
                    <StoryPhotoCarousel
                      photos={vancouverPhotos}
                      badgeText="Vancouver, Canada 🇨🇦"
                      badgeColor="primary"
                    />
                  </div>
                  <div className="lg:order-2 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                      <Heart className="w-4 h-4" />
                      Chapter 1: The Beginning
                    </div>
                    <h3 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      How We Met: A Vancouver Love Story
                    </h3>
                    <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                      Our love story began in the beautiful city of Vancouver,
                      Canada, where our mutual friend Jimit played cupid and
                      introduced us. Before romance even entered the picture, we
                      found ourselves on an epic adventure to the Yukon with
                      friends, chasing the Northern Lights. Little did we know
                      we'd find our own kind of magic right there in the group!
                      What followed was beautifully organic - dance classes that
                      turned into long walks around the city, swimming sessions
                      that became our regular thing, and those unofficial dinner
                      dates that somehow made everything click perfectly.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-sm">
                        Northern Lights ✨
                      </span>
                      <span className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-sm">
                        Swimming Pool 🏊‍♀️
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
                    <StoryPhotoCarousel
                      photos={adventurePhotos}
                      badgeText="Adventures & Fun 🎮"
                      badgeColor="secondary"
                    />
                  </div>
                  <div className="lg:order-1 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
                      <Users className="w-4 h-4" />
                      Chapter 2: Adventures
                    </div>
                    <h3 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      Inseparable Adventures
                    </h3>
                    <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                      From there, we were inseparable - partying together,
                      having epic game nights, trying surfing, and going on
                      camping trips that tested our relationship survival skills
                      (spoiler: we passed!). We're complete opposites in the
                      best way: Sneha's sweet tooth meets Abhinav's fitness
                      obsession, creating the perfect balance. Our first TV show
                      as a couple was <em>The Office</em>, which basically means
                      our relationship foundation was built on Jim and Pam
                      references.
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
                    <StoryPhotoCarousel
                      photos={proposalPhotos}
                      badgeText="Moraine Lake 💍"
                      badgeColor="accent"
                    />
                  </div>
                  <div className="lg:order-2 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                      <Heart className="w-4 h-4" />
                      Chapter 3: Forever
                    </div>
                    <h3 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      The Proposal & Our Future
                    </h3>
                    <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                      Recently, we took our biggest adventure yet: a 10-day RV
                      trip with our closest friends through the Canadian
                      Rockies. At the breathtakingly beautiful Moraine Lake,
                      Abhinav got down on one knee and asked Sneha to be his
                      adventure partner for life. From the Northern Lights to
                      Moraine Lake, from Stanley Park bike rides to RV road
                      trips, every adventure has led us here - to December 10th
                      & 11th, 2025, when we'll officially become the Jains!
                    </p>
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-2xl border border-primary/20">
                      <p className="text-gray-900 dark:text-white font-medium text-center">
                        "We can't wait to celebrate with all of you in beautiful
                        Udaipur!"
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 text-center mt-2">
                        P.S. - There will definitely be tiramisu at the
                        reception! 😉
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
          )}
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
            {/* Haldi Ceremony */}
            <Card className="text-center" data-testid="card-haldi">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">
                  Minted Sunshine Haldi
                </h3>
                <p className="text-muted-foreground mb-2">
                  Wednesday, December 10, 2025
                </p>
                <p className="text-muted-foreground mb-4">12:00 PM - 3:00 PM</p>
                <p className="text-sm text-muted-foreground">
                  Traditional Haldi Ceremony with Lunch
                </p>
              </CardContent>
            </Card>

            {/* Sangeet & Reception */}
            <Card className="text-center" data-testid="card-sangeet">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">
                  Jashn-e-Mastani
                </h3>
                <p className="text-muted-foreground mb-2">
                  Wednesday, December 10, 2025
                </p>
                <p className="text-muted-foreground mb-4">6:30 PM - 10:00 PM</p>
                <p className="text-sm text-muted-foreground">
                  Dance, Music & Dinner
                </p>
              </CardContent>
            </Card>

            {/* Shagna di Shaam (Pheras) */}
            <Card className="text-center" data-testid="card-wedding">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">
                  Shagna di Shaam
                </h3>
                <p className="text-muted-foreground mb-2">
                  Thursday, December 11, 2025
                </p>
                <p className="text-muted-foreground mb-4">2:00 PM - 6:00 PM</p>
                <p className="text-sm text-muted-foreground">
                  Pheras with Lunch, Snacks & Dinner
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
                    alt="Majestic heritage palace in the Aravalli Hills with traditional Rajasthani architecture"
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
                      "A peaceful heritage property located in Debari, about 20 minutes from Udaipur city. The venue features traditional Rajasthani architecture with comfortable courtyards and nice views of the surrounding hills. A lovely spot for our celebration with family and friends."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://maps.google.com/?q=Shakti+Vilas+Debari+Udaipur+Rajasthan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                      data-testid="link-maps"
                    >
                      <MapPin className="w-5 h-5 mr-2" />
                      View on Google Maps
                    </a>
                    <a
                      href="tel:+91-294-2222222"
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                      Contact Venue
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
