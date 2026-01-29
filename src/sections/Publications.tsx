import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Users, BookOpen, ExternalLink, Code } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const publications = [
  {
    title: 'Research in Progress',
    authors: '',
    venue: '',
    type: 'Wish me good luck!',
    abstract: ':)',
    links: {
      pdf: '#',
      code: 'https://github.com/RunRiotComeOn',
    },
  },
];

export default function Publications() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.pub-title',
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Cards animation
      gsap.fromTo(
        '.pub-card',
        { y: 40, rotateX: 10, opacity: 0 },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 0.5,
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
      id="publications"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gradient-to-b from-[#e9ecef] to-[#f8f9fa]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-16">
          <h2 className="pub-title section-title">Publications</h2>
          <p className="mt-4 text-[#6c757d] text-lg">
            Research papers and ongoing projects
          </p>
        </div>

        {/* Publication cards */}
        <div className="space-y-6">
          {publications.map((pub, index) => (
            <div
              key={index}
              className="pub-card pub-card bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-[#dee2e6]"
              style={{ perspective: '1000px' }}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <FileText size={24} className="text-[#343a40] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#343a40] leading-tight">
                    {pub.title}
                  </h3>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-[#6c757d]">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {pub.authors}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={14} />
                  {pub.venue}
                </span>
                <span className="px-2 py-0.5 bg-[#f8f9fa] rounded text-xs border border-[#dee2e6]">
                  {pub.type}
                </span>
              </div>

              {/* Abstract - expands on hover */}
              <div className="pub-abstract">
                <p className="text-[#495057] leading-relaxed text-sm pt-2 border-t border-[#dee2e6]">
                  {pub.abstract}
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#dee2e6]">
                <a
                  href={pub.links.pdf}
                  className="flex items-center gap-2 text-sm text-[#343a40] font-medium hover:text-black transition-colors"
                >
                  <ExternalLink size={16} />
                  PDF
                </a>
                <a
                  href={pub.links.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#343a40] font-medium hover:text-black transition-colors"
                >
                  <Code size={16} />
                  Code
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon note */}
        <div className="mt-10 text-center p-6 bg-white rounded-xl border border-dashed border-[#dee2e6]">
          <p className="text-[#6c757d]">
            More publications coming soon. Stay tuned!
          </p>
        </div>
      </div>
    </section>
  );
}
