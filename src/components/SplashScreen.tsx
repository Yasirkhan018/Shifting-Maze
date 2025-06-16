
"use client";

import { motion } from 'framer-motion';

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        className="text-2xl sm:text-3xl text-primary font-headline"
      >
        Design By
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        className="mt-1 text-4xl sm:text-5xl text-accent font-pacifico" // Added font-pacifico
      >
        Lale & Co
      </motion.div>
    </div>
  );
}
