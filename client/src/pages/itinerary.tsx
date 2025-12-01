import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone,
  User,
  Clock,
  Utensils,
  Bed,
  ShowerHead,
  Calendar,
  HelpCircle,
  MapPin,
  Sun,
  Music,
  Heart,
  Coffee,
} from "lucide-react";

// Contact information for various services
const CONTACTS = {
  logistics: {
    name: "TBD",
    phone: "TBD",
    role: "Logistics Coordinator",
  },
  helpDesk: {
    name: "Help Desk",
    phone: "TBD",
    role: "Guest Assistance",
  },
  reception: {
    name: "Hotel Reception",
    phone: "Dial 222 or 9 from room",
    role: "Front Desk",
  },
  houseKeeping: {
    name: "House Keeping",
    phone: "Dial 444 from room",
    role: "Room Cleaning & Services",
  },
};

// Schedule of events
const SCHEDULE = [
  {
    date: "December 10, 2025",
    day: "Wednesday",
    events: [
      {
        time: "Morning",
        title: "Guest Arrivals",
        description: "Check-in and room allocation",
        icon: MapPin,
      },
      {
        time: "9:00 AM",
        title: "Ganpati Sthapna",
        description: "Auspicious beginning with Ganpati pooja",
        icon: Heart,
        highlight: true,
      },
      {
        time: "12:00 PM onwards",
        title: "Minted Sunshine Haldi",
        description: "Dress code: Pastel shades of pink or peach",
        icon: Sun,
        highlight: true,
        dressCode: "Pastel pink or peach",
      },
      {
        time: "4:00 PM - 6:30 PM",
        title: "Rest & Get Ready",
        description: "Free time to freshen up for the evening",
        icon: Bed,
      },
      {
        time: "7:00 PM onwards",
        title: "Jashn-e-Mastani",
        description: "Sangeet & Reception - Glam up in metallics or glittering Indo-Western styles!",
        icon: Music,
        highlight: true,
        dressCode: "Metallics / Indo-Western",
      },
    ],
  },
  {
    date: "December 11, 2025",
    day: "Thursday",
    events: [
      {
        time: "9:00 AM",
        title: "Mayra",
        description: "Traditional ceremony",
        icon: Heart,
        highlight: true,
      },
      {
        time: "1:00 PM",
        title: "Baarat",
        description: "Groom's procession arrives",
        icon: Music,
        highlight: true,
      },
      {
        time: "4:00 PM",
        title: "Shagna Di Shaam",
        description: "Varmala & Pheras - From vows to celebration! Dress code: Sarees, lehengas, sherwanis, or kurtas",
        icon: Heart,
        highlight: true,
        dressCode: "Traditional Indian",
      },
      {
        time: "After Pheras",
        title: "Wedding Dinner & Reception",
        description: "Celebration dinner with the newlyweds. Special arrangement for dinner before sunset.",
        icon: Utensils,
        highlight: true,
      },
    ],
  },
  {
    date: "December 12, 2025",
    day: "Friday",
    events: [
      {
        time: "Until 10:00 AM",
        title: "Breakfast",
        description: "Buffet breakfast",
        icon: Coffee,
      },
      {
        time: "By 11:00 AM",
        title: "Check-out",
        description: "Departure and transportation arranged",
        icon: MapPin,
      },
    ],
  },
];

// Additional services available
const SERVICES = [
  {
    name: "Steam Iron",
    description: "Available on the property for self-service",
    icon: ShowerHead,
  },
  {
    name: "Laundry Service",
    description: "Same-day service if given before 10 AM",
    icon: ShowerHead,
  },
  {
    name: "Extra Bedding",
    description: "Contact housekeeping (dial 444) for additional pillows/blankets",
    icon: Bed,
  },
  {
    name: "Wake-up Call",
    description: "Request at reception the night before",
    icon: Clock,
  },
  {
    name: "Medical Assistance",
    description: "First aid available at reception. Doctor on call.",
    icon: HelpCircle,
  },
  {
    name: "Transportation",
    description: "Coordinate with logistics for any travel needs",
    icon: MapPin,
  },
];

export default function Itinerary() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-script text-4xl sm:text-5xl lg:text-6xl font-medium text-white drop-shadow-2xl tracking-wide mb-4">
            Wedding Itinerary
          </h1>
          <p className="text-white/80 text-lg">
            Everything you need for a comfortable stay
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            Important Contacts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CONTACTS).map(([key, contact]) => (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {key === "logistics" && (
                      <User className="w-6 h-6 text-primary" />
                    )}
                    {key === "helpDesk" && (
                      <HelpCircle className="w-6 h-6 text-primary" />
                    )}
                    {key === "reception" && (
                      <Bed className="w-6 h-6 text-primary" />
                    )}
                    {key === "houseKeeping" && (
                      <ShowerHead className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {contact.role}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {contact.name}
                    </p>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule of Events */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            Schedule of Events
          </h2>
          <div className="space-y-8">
            {SCHEDULE.map((day, dayIndex) => (
              <Card key={dayIndex}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>
                      {day.date}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({day.day})
                      </span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {day.events.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`flex gap-4 p-3 rounded-lg ${
                          event.highlight
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted/30"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            event.highlight
                              ? "bg-primary/20"
                              : "bg-muted"
                          }`}
                        >
                          <event.icon
                            className={`w-5 h-5 ${
                              event.highlight
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <h4
                              className={`font-semibold ${
                                event.highlight
                                  ? "text-primary"
                                  : "text-foreground"
                              }`}
                            >
                              {event.title}
                            </h4>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            Services Available
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <service.icon className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        {service.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <HelpCircle className="w-5 h-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Please carry your ID proof for check-in (Aadhar/Passport/Voter ID)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Dec 10 Haldi:</strong> Pastel shades of pink or peach
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Dec 10 Sangeet:</strong> Metallics or glittering Indo-Western styles
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Dec 11 Wedding:</strong> Sarees, lehengas, sherwanis, or kurtas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Special arrangement for dinner before sunset on Dec 11
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  The venue is in Debari, about 20 minutes from Udaipur city center
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Complimentary transportation available from Airport/Railway Station
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Check-out is by 11:00 AM on December 12
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  For any emergencies, contact the Help Desk immediately
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-8"></div>
    </div>
  );
}
