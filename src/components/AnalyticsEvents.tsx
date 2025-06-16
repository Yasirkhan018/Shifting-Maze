
"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Define gtag on the window object for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function AnalyticsEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const measurementId = "G-FX1KCV8SMB"; // Your GA Measurement ID

    if (pathname && typeof window.gtag === 'function') {
      // Construct the full path including search parameters
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      // Send a page_view event to Google Analytics
      window.gtag('event', 'page_view', {
        page_path: url,
        page_location: window.location.href, // Full URL of the current page
        send_to: measurementId 
      });
      console.log(`GA: Manually sent page_view for ${url} to ${measurementId}`);
    }
  }, [pathname, searchParams]);

  return null; // This component does not render anything
}
