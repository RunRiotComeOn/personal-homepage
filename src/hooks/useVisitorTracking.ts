import { useState, useEffect } from 'react';
import type { VisitorLocation } from '../lib/supabase';
import { getVisitorLocation, getVisitorLocationFallback } from '../services/geolocation';
import { VisitorService } from '../services/visitorService';

interface UseVisitorTrackingResult {
  visitors: VisitorLocation[];
  stats: {
    totalVisits: number;
    uniqueLocations: number;
    countries: string[];
  };
  loading: boolean;
  error: string | null;
}

export function useVisitorTracking(): UseVisitorTrackingResult {
  const [visitors, setVisitors] = useState<VisitorLocation[]>([]);
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueLocations: 0,
    countries: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function trackAndFetchVisitors() {
      try {
        // Track current visitor
        const location = await getVisitorLocation();

        if (location) {
          // Save to Supabase
          const saved = await VisitorService.saveVisitorLocation(location);

          if (!saved) {
            console.warn('Failed to save visitor location');
          }
        } else {
          // Try fallback API
          const fallbackLocation = await getVisitorLocationFallback();
          if (fallbackLocation) {
            await VisitorService.saveVisitorLocation(fallbackLocation);
          }
        }

        // Fetch all visitors
        const allVisitors = await VisitorService.getAllVisitorLocations();
        const visitorStats = await VisitorService.getVisitorStats();

        if (isMounted) {
          setVisitors(allVisitors);
          setStats({
            totalVisits: visitorStats.totalVisits,
            uniqueLocations: visitorStats.uniqueLocations,
            countries: visitorStats.countries,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in visitor tracking:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    }

    trackAndFetchVisitors();

    return () => {
      isMounted = false;
    };
  }, []);

  return { visitors, stats, loading, error };
}
