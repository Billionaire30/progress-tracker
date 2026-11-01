"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { memo, useMemo, useState, useEffect } from "react";
import { Sparkles, TrendingUp, Target } from "lucide-react";

const heroImages = [
  "/thisisengineering-hoivM01c-vg-unsplash.jpg",
  "/thisisengineering-nyAzMQ6Ejgs-unsplash.jpg",
  "/thisisengineering-sbVu5zitZt0-unsplash.jpg",
  "/scott-blake-x-ghf9LjrVg-unsplash.jpg",
  "/encata-pd-ZmDk8tXQRS0-unsplash.jpg",
];

export const Hero = memo(function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentImage = heroImages[currentIndex];

  return (
    <Card className="overflow-hidden shadow-premium-xl border-0 gradient-border gradient-border-animated card-premium animate-scale-in">
      <CardContent className="p-0">
        <div className="relative h-48 sm:h-56 md:h-72 lg:h-80 overflow-hidden">
          <Image
            key={currentIndex}
            src={currentImage}
            alt="Civil Engineering"
            fill
            className={`object-cover transition-all duration-1000 ease-in-out ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            loading="eager"
            priority
            quality={90}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
            onLoad={() => setIsImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-purple-900/30 to-transparent transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70 transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 md:p-10">
            <div className={`transform transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 animate-icon-bounce" />
                <span className="text-xs sm:text-sm font-medium text-white/80 uppercase tracking-wider">Premium Edition</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white mb-2 sm:mb-3 drop-shadow-2xl gradient-text animate-text-reveal">
                Progress Tracker
              </h2>
              <p className="text-white/95 text-sm sm:text-base md:text-lg drop-shadow-lg line-clamp-2 max-w-2xl mb-3 sm:mb-4">
                Your 12-month journey to mastering development fundamentals
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Track Progress</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Achieve Goals</span>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 flex items-center gap-2">
                <div className="h-1 flex-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full max-w-[200px] animate-premium-pulse" />
                <div className="flex gap-1">
                  {heroImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex ? 'bg-white scale-125 shadow-glow' : 'bg-white/40 hover:bg-white/60'
                      }`}
                      onClick={() => setCurrentIndex(idx)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
