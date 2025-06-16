
"use client"; // Required for useState, useEffect, AnimatePresence

import type { Metadata } from 'next'; // Still can have metadata for the page
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { AnalyticsEvents } from '@/components/AnalyticsEvents';
import { SplashScreen } from '@/components/SplashScreen'; // Import the new component
import { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { AnimatePresence, motion } from 'framer-motion';

// Metadata can be defined even with "use client" at the top for the component itself
// export const metadata: Metadata = { // This would be for a server component layout
// title: 'Shifting Maze',
// description: 'An unsolvable puzzle game where rules change constantly.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // Ensure metadata is set (if done via document.title for client components)
    document.title = 'Shifting Maze';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'An unsolvable puzzle game where rules change constantly.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'An unsolvable puzzle game where rules change constantly.';
      document.head.appendChild(meta);
    }


    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2000); // Splash screen visible for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
          {/* Main App Content - always rendered but initially overlaid by splash */}
          {children}
          <Suspense fallback={null}>
            <AnalyticsEvents />
          </Suspense>
          <Toaster />

          <AnimatePresence>
            {isSplashVisible && (
              <motion.div
                key="splash-screen-container"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }} // Starts fading out at 1.5s, finishes by 2s
                className="fixed inset-0 z-[10000] flex items-center justify-center bg-background"
              >
                <SplashScreen />
              </motion.div>
            )}
          </AnimatePresence>
        </AuthProvider>
        
        {/* Google Tag Manager (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-FX1KCV8SMB"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FX1KCV8SMB');
          `}
        </Script>
      </body>
    </html>
  );
}
