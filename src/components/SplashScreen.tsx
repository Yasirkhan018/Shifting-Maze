
"use client";

import { motion } from 'framer-motion';

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-2xl sm:text-3xl text-primary font-headline"
      >
        design by
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="mt-1 text-4xl sm:text-5xl text-accent font-bold font-headline"
      >
        Lale
      </motion.div>
    </div>
  );
}
