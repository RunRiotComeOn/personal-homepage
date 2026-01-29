import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Globe, Users, MapPinned } from 'lucide-react';
import { useVisitorTracking } from '../hooks/useVisitorTracking';
import { VisitorService } from '../services/visitorService';
import 'leaflet/dist/leaflet.css';

gsap.registerPlugin(ScrollTrigger);

// Custom marker icon
const createCustomIcon = (count: number) => {
  const size = Math.min(30 + count * 2, 50);
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4dabf7" stroke="white" stroke-width="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Component to fit map bounds to markers
function MapBounds({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = positions.map(pos => pos as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4 });
    }
  }, [positions, map]);

  return null;
}

export default function VisitorMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const { visitors, stats, loading, error } = useVisitorTracking();

  // Group visitors by city to avoid overlapping markers
  const groupedVisitors = useMemo(() => {
    return Array.from(VisitorService.groupVisitorsByCity(visitors).values());
  }, [visitors]);

  const markerPositions = useMemo(() => {
    return groupedVisitors.map(v => [v.latitude, v.longitude] as LatLngExpression);
  }, [groupedVisitors]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.map-title',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Stats cards animation
      gsap.fromTo(
        '.stat-card',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.2,
        }
      );

      // Map container animation
      gsap.fromTo(
        '.map-container',
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
          },
          delay: 0.4,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gradient-to-b from-[#e9ecef] to-[#343a40]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="map-title section-title text-white">Visitor Map</h2>
          <p className="mt-4 text-[#adb5bd] text-lg">
            Live tracking of visitors from around the world
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="stat-card bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#4dabf7]/20 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-[#4dabf7]" />
              </div>
              <div>
                <p className="text-[#adb5bd] text-sm">Total Visits</p>
                <p className="text-white text-2xl font-bold">
                  {loading ? '...' : stats.totalVisits}
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#51cf66]/20 rounded-lg flex items-center justify-center">
                <MapPinned size={24} className="text-[#51cf66]" />
              </div>
              <div>
                <p className="text-[#adb5bd] text-sm">Unique Locations</p>
                <p className="text-white text-2xl font-bold">
                  {loading ? '...' : stats.uniqueLocations}
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#ff6b6b]/20 rounded-lg flex items-center justify-center">
                <Globe size={24} className="text-[#ff6b6b]" />
              </div>
              <div>
                <p className="text-[#adb5bd] text-sm">Countries</p>
                <p className="text-white text-2xl font-bold">
                  {loading ? '...' : stats.countries.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="map-container relative bg-[#1a1d21] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {loading ? (
            <div className="aspect-[16/9] lg:aspect-[21/9] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4dabf7] mx-auto mb-4"></div>
                <p className="text-[#adb5bd]">Loading visitor data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="aspect-[16/9] lg:aspect-[21/9] flex items-center justify-center">
              <div className="text-center text-[#ff6b6b]">
                <p className="mb-2">Failed to load visitor data</p>
                <p className="text-sm text-[#adb5bd]">{error}</p>
              </div>
            </div>
          ) : (
            <div className="aspect-[16/9] lg:aspect-[21/9]">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-tiles"
                />

                {groupedVisitors.map((visitor, index) => (
                  <Marker
                    key={`${visitor.city}-${visitor.country}-${index}`}
                    position={[visitor.latitude, visitor.longitude]}
                    icon={createCustomIcon(visitor.count)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold text-[#1a1d21]">
                          {visitor.city}, {visitor.country}
                        </p>
                        <p className="text-[#495057] text-xs mt-1">
                          {visitor.count} visit{visitor.count > 1 ? 's' : ''}
                        </p>
                        {visitor.region && (
                          <p className="text-[#6c757d] text-xs">
                            Region: {visitor.region}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {markerPositions.length > 0 && <MapBounds positions={markerPositions} />}
              </MapContainer>
            </div>
          )}
        </div>

        {/* Location info cards */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {/* Current Location */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#4dabf7]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={24} className="text-[#4dabf7]" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Current Location</h3>
                <p className="text-[#adb5bd] text-sm">Chengdu, Sichuan, China</p>
              </div>
            </div>
          </div>

          {/* Home Institution */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#51cf66]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe size={24} className="text-[#51cf66]" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Home Institution</h3>
                <p className="text-[#adb5bd] text-sm">Shanghai, China</p>
                <p className="text-[#6c757d] text-xs mt-2">Fudan University</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-sm text-[#6c757d] mt-8">
          This map shows real-time visitor locations. Your privacy is protected - only city-level data is displayed.
        </p>
      </div>
    </section>
  );
}
