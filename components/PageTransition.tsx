"use client";

import { memo } from "react";
import { motion } from "framer-motion";

export const PageTransition = memo(function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1],
        scale: { type: "spring", stiffness: 200, damping: 20 }
      }}
    >
      {children}
    </motion.div>
  );
});
