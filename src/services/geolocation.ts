import type { VisitorLocation } from '../lib/supabase';

// Free IP Geolocation API - no API key required
// Alternatives: ipapi.co, ip-api.com, geojs.io
const GEO_API_URL = 'https://ipapi.co/json/';

interface GeoAPIResponse {
  city: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  region: string;
  timezone: string;
  ip: string;
  error?: boolean;
  reason?: string;
}

// Simple hash function for IP addresses (for privacy)
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

export async function getVisitorLocation(): Promise<VisitorLocation | null> {
  try {
    const response = await fetch(GEO_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeoAPIResponse = await response.json();

    if (data.error) {
      console.error('Geolocation API error:', data.reason);
      return null;
    }

    // Hash the IP address for privacy
    const ipHash = await hashIP(data.ip);

    return {
      city: data.city || 'Unknown',
      country: data.country || 'Unknown',
      country_code: data.country_code || 'XX',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      region: data.region,
      timezone: data.timezone,
      ip_hash: ipHash,
      user_agent: navigator.userAgent,
      visited_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    return null;
  }
}

// Fallback API if ipapi.co fails
export async function getVisitorLocationFallback(): Promise<VisitorLocation | null> {
  try {
    // Using ip-api.com as fallback (free, no key required, but has rate limits)
    const response = await fetch('http://ip-api.com/json/?fields=status,country,countryCode,region,city,lat,lon,timezone,query');
    const data = await response.json();

    if (data.status === 'fail') {
      return null;
    }

    const ipHash = await hashIP(data.query);

    return {
      city: data.city || 'Unknown',
      country: data.country || 'Unknown',
      country_code: data.countryCode || 'XX',
      latitude: data.lat || 0,
      longitude: data.lon || 0,
      region: data.region,
      timezone: data.timezone,
      ip_hash: ipHash,
      user_agent: navigator.userAgent,
      visited_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching fallback geolocation:', error);
    return null;
  }
}
