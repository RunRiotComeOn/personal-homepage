import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, ExternalLink, GraduationCap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const researchData = [
  {
    institution: 'UC Davis',
    lab: 'LUKA Lab',
    year: '2026',
    logo: import.meta.env.BASE_URL + 'uc-davis-logo.svg',
    accent: '#022851',
    people: [
      {
        label: 'Advised by',
        names: [
          {
            name: 'Prof. Muhao Chen',
            url: 'https://muhaochen.github.io/',
          },
        ],
      },
      {
        label: 'Working closely with',
        names: [
          {
            name: 'Tinghui Zhu',
            url: 'https://darthzhu.github.io/',
          },
        ],
      },
    ],
  },
  {
    institution: 'UIUC',
    lab: 'TRAIS Lab',
    year: '2026',
    logo: import.meta.env.BASE_URL + 'uiuc-logo.svg',
    accent: '#e84a27',
    people: [
      {
        label: 'Advised by',
        names: [
          {
            name: 'Prof. Jiaqi W. Ma',
            url: 'https://jiaqima.github.io/',
          },
        ],
      },
    ],
  },
  {
    institution: 'Fudan University',
    lab: 'DISC Lab',
    year: '2025',
    logo: import.meta.env.BASE_URL + 'fudan-logo.svg',
    accent: '#9b1c31',
    people: [
      {
        label: 'Advised by',
        names: [
          {
            name: 'Prof. Zhongyu Wei',
            url: 'http://www.fudan-disc.com/people/zywei',
          },
        ],
      },
    ],
  },
];

export default function Research() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation with scramble effect simulation
      gsap.fromTo(
        '.research-title',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Cards animation
      gsap.fromTo(
        '.research-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.2,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="research"
      ref={sectionRef}
      className="py-24 lg:py-32"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="research-title section-title">Research Experience</h2>
          <p className="mt-4 text-[#6c757d] text-lg max-w-2xl mx-auto">
            Exploring the frontiers of AI through interdisciplinary research
          </p>
        </div>

        {/* Research cards */}
        <div className="relative space-y-5">
          <div className="absolute left-8 top-10 bottom-10 hidden w-px bg-gradient-to-b from-transparent via-[#ced4da] to-transparent lg:block" />
          {researchData.map((experience, index) => (
            <div
              key={index}
              className="research-card group relative overflow-hidden rounded-2xl border border-[#dee2e6] bg-white/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:p-6"
            >
              <div
                className="absolute inset-y-0 left-0 w-1.5"
                style={{ backgroundColor: experience.accent }}
              />
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4 sm:w-64 sm:flex-shrink-0">
                  <div className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-2xl border border-[#dee2e6] bg-[#f8f9fa] p-3 shadow-inner">
                    <img
                      src={experience.logo}
                      alt={`${experience.institution} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#6c757d]">
                      <Calendar size={15} />
                      {experience.year}
                    </div>
                    <h3 className="mt-1 font-serif text-xl font-bold text-[#343a40] transition-colors group-hover:text-black">
                      {experience.institution}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-base font-semibold text-[#495057]">
                      <GraduationCap size={17} />
                      {experience.lab}
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1 border-t border-[#e9ecef] pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                  <div className="space-y-3">
                    {experience.people.map((group) => (
                      <div key={group.label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                        <span className="w-40 flex-shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-[#868e96]">
                          {group.label}
                        </span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {group.names.map((person) => (
                            <a
                              key={person.name}
                              href={person.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-[#343a40] underline decoration-[#ced4da] underline-offset-4 transition-colors hover:text-black hover:decoration-[#343a40]"
                            >
                              {person.name}
                              <ExternalLink size={14} />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
