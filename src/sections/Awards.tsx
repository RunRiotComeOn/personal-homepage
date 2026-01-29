import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, Award, Star, Medal } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const awardsData = [
  {
    title: 'First-class Scholarship',
    year: '2024',
    detail: 'Fudan University (Top 5%)',
    icon: Trophy,
    color: 'from-yellow-400 to-amber-500',
  },
  {
    title: 'Second Prize',
    year: '2025',
    detail: 'China Undergraduate Mathematical Contest in Modeling',
    icon: Award,
    color: 'from-blue-400 to-blue-500',
  },
  {
    title: 'Outstanding Student Award',
    year: '2024',
    detail: 'Fudan University (Top 5%)',
    icon: Star,
    color: 'from-purple-400 to-purple-500',
  },
  {
    title: "Dean's Honor List",
    year: '2025',
    detail: 'College of Engineering, UC Davis (Top 8%)',
    icon: Medal,
    color: 'from-green-400 to-green-500',
  },
];

export default function Awards() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.awards-title',
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Cards 3D flip animation
      gsap.fromTo(
        '.award-card-item',
        { rotateY: -90, opacity: 0 },
        {
          rotateY: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          stagger: 0.13,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.15,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="awards"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="awards-title section-title">Awards & Honors</h2>
          <p className="mt-4 text-[#6c757d] text-lg">
            Recognition for academic excellence and research achievements
          </p>
        </div>

        {/* Awards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {awardsData.map((award, index) => {
            const Icon = award.icon;
            return (
              <div
                key={index}
                className="award-card-item award-card h-64 cursor-pointer"
                style={{ perspective: '1000px' }}
              >
                <div className="award-card-inner relative w-full h-full">
                  {/* Front */}
                  <div className="award-card-front absolute inset-0 bg-white rounded-2xl p-6 shadow-sm border border-[#dee2e6] flex flex-col items-center justify-center text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${award.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon size={32} className="text-white" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#343a40] mb-2">
                      {award.title}
                    </h3>
                    <span className="text-2xl font-bold text-[#6c757d]">
                      {award.year}
                    </span>
                  </div>

                  {/* Back */}
                  <div className="award-card-back absolute inset-0 bg-gradient-to-br from-[#343a40] to-[#495057] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <Icon size={40} className="text-white/80 mb-4" />
                    <h3 className="font-serif text-xl font-bold text-white mb-2">
                      {award.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {award.detail}
                    </p>
                    <span className="mt-4 px-3 py-1 bg-white/20 rounded-full text-white text-xs">
                      {award.year}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
