import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Globe } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function VisitorMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

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

      // Map container animation
      gsap.fromTo(
        mapRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.2,
        }
      );

      // Location cards animation
      gsap.fromTo(
        '.location-card',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.1,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="map-title section-title text-white">Visitor Map</h2>
          <p className="mt-4 text-[#adb5bd] text-lg">
            Where visitors come from around the world
          </p>
        </div>

        {/* Map container with embedded OpenStreetMap */}
        <div
          ref={mapRef}
          className="relative bg-[#1a1d21] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          <div className="aspect-[16/9] lg:aspect-[21/9]">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-60%2C180%2C75&layer=mapnik"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(30%) contrast(1.1)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Visitor Map"
            />
          </div>
          
          {/* Map overlay with subtle gradient */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#1a1d21]/30 to-transparent" />
        </div>

        {/* Location info cards */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {/* Current Location */}
          <div className="location-card bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#4dabf7]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={24} className="text-[#4dabf7]" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Current Location</h3>
                <p className="text-[#adb5bd] text-sm">
                  Chengdu, Sichuan, China
                </p>
                <p className="text-[#6c757d] text-xs mt-2">
                  {/* University of California, Davis */}
                </p>
              </div>
            </div>
          </div>

          {/* Home Location */}
          <div className="location-card bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#51cf66]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe size={24} className="text-[#51cf66]" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Home Institution</h3>
                <p className="text-[#adb5bd] text-sm">
                  Shanghai, China
                </p>
                <p className="text-[#6c757d] text-xs mt-2">
                  Fudan University
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-sm text-[#6c757d] mt-8">
          This map shows the global reach of visitors to this website.
        </p>
      </div>
    </section>
  );
}
