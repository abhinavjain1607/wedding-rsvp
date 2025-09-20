import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StoryPhoto {
  src: string;
  alt: string;
  caption?: string;
}

interface StoryPhotoCarouselProps {
  photos: StoryPhoto[];
  badgeText: string;
  badgeColor: "primary" | "secondary" | "accent";
}

export function StoryPhotoCarousel({
  photos,
  badgeText,
  badgeColor,
}: StoryPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + photos.length) % photos.length
    );
  };

  const goToPhoto = (index: number) => {
    setCurrentIndex(index);
  };

  const badgeColorClasses = {
    primary: "text-primary border-primary/20",
    secondary: "text-secondary border-secondary/20",
    accent: "text-accent-foreground border-accent/20",
  };

  return (
    <div className="relative group">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={photos[currentIndex].src}
          alt={photos[currentIndex].alt}
          className="w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-all duration-500 group-hover:shadow-3xl shadow-2xl rounded-2xl"
        />

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Badge */}
        <div
          className={`absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold shadow-lg border ${badgeColorClasses[badgeColor]}`}
        >
          {badgeText}
        </div>

        {/* Photo Indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 right-4 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPhoto(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-white scale-110"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Photo Caption */}
      {photos[currentIndex].caption && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 italic">
          {photos[currentIndex].caption}
        </p>
      )}
    </div>
  );
}
