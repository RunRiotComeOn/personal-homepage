import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image entrance animation
      gsap.fromTo(
        imageRef.current,
        { x: -100, rotateY: 25, opacity: 0 },
        {
          x: 0,
          rotateY: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Title animation
      gsap.fromTo(
        '.about-title',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
          delay: 0.2,
        }
      );

      // Paragraphs animation
      gsap.fromTo(
        '.about-para',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.4,
        }
      );

      // Game card animation
      gsap.fromTo(
        '.game-card-item',
        { rotateY: -90, opacity: 0 },
        {
          rotateY: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.game-card-item',
            start: 'top 85%',
          },
          delay: 0.3,
        }
      );

      // Parallax effect on scroll
      gsap.to(imageRef.current, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Image */}
          <div className="lg:col-span-5">
            <div
              ref={imageRef}
              className="relative"
              style={{ perspective: '1000px' }}
            >
              <div className="oil-frame aspect-[4/5] max-w-md mx-auto lg:mx-0 lg:-ml-8">
                <img
                  src={`${import.meta.env.BASE_URL}hero-portrait.jpg`}
                  alt="About Yixu Huang"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative frame */}
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-[#343a40]/10 rounded-lg -z-10" />
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="lg:col-span-7 lg:pl-8">
            <h2 className="about-title section-title mb-8">About</h2>
            
            <div className="space-y-6 text-[#495057] leading-relaxed">
              <p className="about-para drop-cap text-lg">
                I am an undergraduate student at Fudan University, pursuing my Bachelor's 
                degree with a focus on artificial intelligence and machine learning.
              </p>
              
              <p className="about-para text-lg">
                My research interests lie at the intersection of Large Language Models (LLMs), 
                Multimodal Large Language Models (MLLMs), and agentic systems. I am fascinated 
                by how these technologies can be harnessed to solve complex real-world problems 
                and push the boundaries of artificial intelligence.
              </p>
              
              <p className="about-para text-lg">
                I am currently working under the supervision of{' '}
                <a 
                  href="https://muhaochen.github.io/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#343a40] font-semibold hover:underline transition-all"
                >
                  Professor Muhao Chen
                </a>{' '}
                at UC Davis, conducting research on Vision-Language Models and their applications.
              </p>
              
              <p className="about-para text-lg">
                Through my research, I aim to advance the understanding of how AI systems can better 
                perceive, reason, and interact with the world.
              </p>
            </div>
          </div>
        </div>

        {/* Game Promo Card */}
        <div className="mt-16 max-w-xl mx-auto">
          <div
            className="game-card-item award-card h-20 cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => window.open('https://runriotcomeon.github.io/One-Button-Boss/', '_blank')}
          >
            <div className="award-card-inner relative w-full h-full">
              {/* Front */}
              <div className="award-card-front absolute inset-0 bg-white rounded-2xl px-6 shadow-sm border border-[#dee2e6] flex items-center justify-center gap-3">
                <span className="text-2xl flex-shrink-0">🎮</span>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff0066] to-[#ff00ff] flex items-center justify-center shadow-md flex-shrink-0">
                  <svg viewBox="0 0 64 64" width="22" height="22" style={{ imageRendering: 'pixelated' }}>
                    <rect width="64" height="64" fill="#330011" rx="4"/>
                    <rect x="8" y="8" width="8" height="8" fill="#ff0066"/>
                    <rect x="48" y="8" width="8" height="8" fill="#ff0066"/>
                    <rect x="16" y="12" width="32" height="8" fill="#ff0066"/>
                    <rect x="8" y="24" width="16" height="12" fill="#ff0066"/>
                    <rect x="40" y="24" width="16" height="12" fill="#ff0066"/>
                    <rect x="12" y="28" width="8" height="4" fill="#ffff00"/>
                    <rect x="44" y="28" width="8" height="4" fill="#ffff00"/>
                    <rect x="28" y="32" width="8" height="8" fill="#ff0066"/>
                    <rect x="16" y="44" width="32" height="8" fill="#ff0066"/>
                    <rect x="20" y="52" width="24" height="8" fill="#ff0066"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-base font-bold text-[#343a40]">
                    Come play <span className="text-[#ff0066]">One Button Boss</span> !
                  </h3>
                  <p className="text-xs text-[#6c757d]">A pixel-art bullet hell I built for fun</p>
                </div>
                <span className="text-xl flex-shrink-0">👾</span>
              </div>

              {/* Back */}
              <div
                className="award-card-back absolute inset-0 rounded-2xl px-6 flex items-center justify-center gap-3 overflow-hidden"
                style={{
                  background: '#0a0a0f',
                  border: '1px solid rgba(0, 255, 200, 0.2)',
                }}
              >
                {/* Pixel grid overlay */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,255,200,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.15) 1px, transparent 1px)',
                    backgroundSize: '6px 6px',
                  }}
                />
                {/* Floating pixels */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-[#00ffc8] pointer-events-none"
                    style={{
                      left: `${10 + i * 12}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      opacity: 0.25,
                      animation: `pixelFloat${i % 2} ${2 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
                <ExternalLink size={18} className="text-[#00ffc8] flex-shrink-0 relative z-10" />
                <div className="relative z-10">
                  <p className="text-[#00ffc8] font-mono text-xs font-bold">
                    runriotcomeon.github.io/One-Button-Boss
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">Click to play!</p>
                </div>
                <style>{`
                  @keyframes pixelFloat0 {
                    0%, 100% { transform: translateY(0); opacity: 0.2; }
                    50% { transform: translateY(-8px); opacity: 0.5; }
                  }
                  @keyframes pixelFloat1 {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.15; }
                    50% { transform: translateY(-6px) translateX(4px); opacity: 0.4; }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
