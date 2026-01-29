import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, MapPin, Calendar } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const educationData = [
  {
    school: 'University of California, Davis',
    location: 'Davis, CA, USA',
    degree: 'Exchange Student in Computer Science',
    period: '2025 (Fall Quarter)',
    details: ['College of Engineering'],
  },
  {
    school: 'Fudan University',
    location: 'Shanghai, China',
    degree: 'B.S. in Data Science and Big Data Technology',
    period: '2023 – Present',
    details: ['School of Data Science'],
  },
];

export default function Education() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.edu-title',
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

      // Timeline line animation
      gsap.fromTo(
        '.timeline-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.2,
        }
      );

      // Cards animation
      gsap.fromTo(
        '.edu-card',
        { x: -80, rotateY: 15, opacity: 0 },
        {
          x: 0,
          rotateY: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.4,
        }
      );

      // Dots animation
      gsap.fromTo(
        '.timeline-dot',
        { scale: 0 },
        {
          scale: 1,
          duration: 0.4,
          ease: 'elastic.out(1, 0.5)',
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.6,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="education"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="edu-title section-title">Education</h2>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Timeline line */}
          <div className="timeline-line absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#343a40] to-[#adb5bd] origin-top" />

          {/* Education cards */}
          <div className="space-y-12">
            {educationData.map((edu, index) => (
              <div key={index} className="relative pl-16">
                {/* Timeline dot */}
                <div className="timeline-dot absolute left-3 top-6 w-6 h-6 bg-[#343a40] rounded-full border-4 border-white shadow-lg animate-pulse-dot" />

                {/* Card */}
                <div className="edu-card card-3d bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-[#dee2e6]">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      {/* School name */}
                      <h3 className="font-serif text-2xl font-bold text-[#343a40] mb-2">
                        {edu.school}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-[#6c757d] mb-3">
                        <MapPin size={16} />
                        <span className="text-sm">{edu.location}</span>
                      </div>

                      {/* Degree */}
                      <div className="flex items-center gap-2 text-[#495057] mb-3">
                        <GraduationCap size={18} />
                        <span className="font-medium">{edu.degree}</span>
                      </div>

                      {/* Period */}
                      <div className="flex items-center gap-2 text-[#6c757d]">
                        <Calendar size={16} />
                        <span className="text-sm">{edu.period}</span>
                      </div>
                    </div>

                    {/* Details tags */}
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                      {edu.details.map((detail, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#f8f9fa] text-[#495057] text-sm rounded-full border border-[#dee2e6]"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
