import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { memo, useMemo } from "react";

const heroImages = [
  "/thisisengineering-hoivM01c-vg-unsplash.jpg",
  "/thisisengineering-nyAzMQ6Ejgs-unsplash.jpg",
  "/thisisengineering-sbVu5zitZt0-unsplash.jpg",
  "/scott-blake-x-ghf9LjrVg-unsplash.jpg",
  "/encata-pd-ZmDk8tXQRS0-unsplash.jpg",
];

export const Hero = memo(function Hero() {
  const randomImage = useMemo(() => {
    return heroImages[Math.floor(Math.random() * heroImages.length)];
  }, []);

  return (
    <Card className="overflow-hidden shadow-premium-xl hover:shadow-premium-xl transition-all duration-300 gradient-border">
      <CardContent className="p-0">
        <div className="relative h-40 sm:h-48 md:h-64">
          <Image
            src={randomImage}
            alt="Civil Engineering"
            fill
            className="object-cover"
            loading="eager"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-white mb-1 sm:mb-2 drop-shadow-lg">
              Progress Tracker
            </h2>
            <p className="text-white/95 text-xs sm:text-sm md:text-base drop-shadow-md line-clamp-2">
              Your 12-month journey to mastering development fundamentals
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
