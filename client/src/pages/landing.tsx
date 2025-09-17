import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Calendar, MapPin } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-effect border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-serif font-semibold text-primary">Sarah & Michael</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#rsvp" className="text-foreground hover:text-primary transition-colors">RSVP</a>
              <Button onClick={handleLogin} variant="outline" data-testid="button-login">
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Elegant wedding couple portrait" 
            className="w-full h-full object-cover opacity-30" 
          />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8" data-testid="hero-content">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 text-foreground">
            Sarah & Michael
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 font-light">
            October 24-26, 2025
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12">
            Villa Monastero, Lake Como, Italy
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
              onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-details"
            >
              View Details
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Details Section */}
      <section id="details" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">Join Our Celebration</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center" data-testid="card-when">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">When</h3>
                <p className="text-muted-foreground mb-2">October 24-26, 2025</p>
                <p className="text-sm text-muted-foreground">Three days of celebration</p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-where">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">Where</h3>
                <p className="text-muted-foreground mb-2">Villa Monastero</p>
                <p className="text-sm text-muted-foreground">Lake Como, Italy</p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-love">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">Why</h3>
                <p className="text-muted-foreground mb-2">Love & Joy</p>
                <p className="text-sm text-muted-foreground">Celebrating our union</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6" data-testid="rsvp-title">
            RSVP Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your presence would make our special day even more meaningful. Please let us know if you can join us in Italy.
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
            © 2025 Sarah & Michael Wedding. Made with ❤️ for our special day.
          </p>
        </div>
      </footer>
    </div>
  );
}
