"use client";

import { useEffect, useRef } from "react";

export function LiveAnnouncer({ message }: { message: string }) {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={announcementRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
