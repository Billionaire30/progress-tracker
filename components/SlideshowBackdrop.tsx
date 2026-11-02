"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Simplified slideshow - only use 5 images for performance
const slideshowImages = [
  "/slideshow/adrien-olichon-Lu5DaTljjQk-unsplash.jpg",
  "/slideshow/alberto-domingo-carreiro-tXZK-YLlwcE-unsplash.jpg",
  "/slideshow/ali-aziz-FZ7yMBQCFXM-unsplash.jpg",
  "/slideshow/arya-jalundhwala-yWwteltnrQ0-unsplash.jpg",
  "/slideshow/atai-anarbek-I9abQT6ZEY4-unsplash.jpg",
];

const SLIDESHOW_INTERVAL = 60000; // 1 minute
const TRANSITION_DURATION = 1500; // Smoother, slower transition

export function SlideshowBackdrop() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowImages.length);
    }, SLIDESHOW_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none gpu-accelerated">
      <Image
        key={currentIndex}
        src={slideshowImages[currentIndex]}
        alt=""
        fill
        className="object-cover transition-opacity duration-1500 ease-in-out smooth-opacity"
        priority
        quality={60}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
    </div>
  );
}
