import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Mail, Github, Twitter, Gamepad2 } from 'lucide-react';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background gradient animation
      gsap.fromTo(
        '.hero-bg',
        { opacity: 0, scale: 1.2 },
        { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' }
      );

      // Image 3D flip entrance
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, rotateY: -90 },
        { opacity: 1, rotateY: 0, duration: 1, ease: 'expo.out', delay: 0.4 }
      );

      // Name letter-by-letter animation
      const nameLetters = document.querySelectorAll('.name-letter');
      gsap.fromTo(
        nameLetters,
        { opacity: 0, rotateX: -90, y: 20 },
        {
          opacity: 1,
          rotateX: 0,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
          stagger: 0.05,
          delay: 0.8,
        }
      );

      // Description lines
      gsap.fromTo(
        '.desc-line',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'expo.out',
          stagger: 0.15,
          delay: 1.2,
        }
      );

      // Buttons
      gsap.fromTo(
        '.hero-btn',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
          stagger: 0.1,
          delay: 1.6,
        }
      );

      // Floating animation for image
      gsap.to(imageRef.current, {
        y: -10,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = (clientX / innerWidth - 0.5) * 2;
      const yPercent = (clientY / innerHeight - 0.5) * 2;
      
      gsap.to(imageRef.current, {
        rotateY: xPercent * 5,
        rotateX: -yPercent * 3,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const name = 'Yixu Huang';

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated background gradient */}
      <div className="hero-bg absolute inset-0 bg-gradient-to-br from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6] opacity-0" />
      
      {/* Decorative floating shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#343a40]/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#6c757d]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-[#adb5bd]/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Container */}
          <div
            ref={imageRef}
            className="relative mx-auto lg:mx-0"
            style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
          >
            <div className="oil-frame relative w-72 sm:w-80 lg:w-96 aspect-[3/4]">
              <img
                src={`${import.meta.env.BASE_URL}hero-portrait.jpg`}
                alt="Yixu Huang"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-[#343a40]/20 rounded-lg -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 border-t-2 border-l-2 border-[#343a40]/30" />
          </div>

          {/* Content */}
          <div ref={contentRef} className="text-center lg:text-left">
            {/* Name with letter animation */}
            <h1 className="mb-6">
              <span className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#343a40] inline-block">
                {name.split('').map((letter, index) => (
                  <span
                    key={index}
                    className="name-letter inline-block"
                    style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </span>
                ))}
              </span>
            </h1>

            {/* Description */}
            <div className="space-y-2 mb-8">
              <p className="desc-line font-serif text-xl sm:text-2xl text-[#495057] italic">
                An undergraduate student at Fudan University
              </p>
              <p className="desc-line text-lg text-[#6c757d]">
                specializing in Large Language Models,
              </p>
              <p className="desc-line text-lg text-[#6c757d]">
                Multimodal Large Language Models,
              </p>
              <p className="desc-line text-lg text-[#6c757d]">
                and agentic systems.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="mailto:yixuhuang23@m.fudan.edu.cn"
                className="hero-btn btn-magnetic inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#343a40] text-white rounded-lg font-medium hover:bg-black transition-colors"
              >
                <Mail size={20} />
                Email
              </a>
              <a
                href="https://github.com/RunRiotComeOn"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn btn-magnetic inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#343a40] text-[#343a40] rounded-lg font-medium hover:bg-[#343a40] hover:text-white transition-colors"
              >
                <Github size={20} />
                GitHub
              </a>
              <a
                href="https://x.com/YixuHuang342"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn btn-magnetic inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#343a40] text-[#343a40] rounded-lg font-medium hover:bg-[#343a40] hover:text-white transition-colors"
              >
                <Twitter size={20} />
                X
              </a>
              <a
                href="https://yxsophie.itch.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn btn-magnetic inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#343a40] text-[#343a40] rounded-lg font-medium hover:bg-[#343a40] hover:text-white transition-colors"
              >
                <Gamepad2 size={20} />
                Itch.io
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-[#343a40]/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-[#343a40]/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
