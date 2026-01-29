import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
      </div>
    </section>
  );
}
