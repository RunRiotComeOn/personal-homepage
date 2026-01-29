import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Camera, Mountain, Plane, BookOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const lifeImages = [
  {
    src: `${import.meta.env.BASE_URL}life-hiking.jpg`,
    alt: 'Hiking in mountains',
    icon: Mountain,
    title: 'Hiking',
    description: 'Exploring nature trails',
  },
  {
    src: `${import.meta.env.BASE_URL}life-photography.jpg`,
    alt: 'Photography',
    icon: Camera,
    title: 'Photography',
    description: 'Capturing moments',
  },
  {
    src: `${import.meta.env.BASE_URL}life-travel.jpg`,
    alt: 'Traveling',
    icon: Plane,
    title: 'Travel',
    description: 'Discovering new places',
  },
  {
    src: `${import.meta.env.BASE_URL}life-reading.jpg`,
    alt: 'Reading',
    icon: BookOpen,
    title: 'Reading',
    description: 'Learning and relaxing',
  },
];

export default function PersonalLife() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.life-title',
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

      // Images animation with stagger
      gsap.fromTo(
        '.life-image-card',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.2,
        }
      );

      // Description animation
      gsap.fromTo(
        '.life-desc',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
          },
          delay: 0.6,
        }
      );

      // Parallax effect for each image
      document.querySelectorAll('.life-image-card').forEach((card, index) => {
        const speed = [40, 20, 50, 30][index];
        gsap.to(card, {
          y: -speed,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="personal-life"
      ref={sectionRef}
      className="py-24 lg:py-32"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="life-title section-title">Personal Life</h2>
        </div>

        {/* Masonry-style image grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {lifeImages.map((image, index) => {
            const Icon = image.icon;
            return (
              <div
                key={index}
                className={`life-image-card group relative overflow-hidden rounded-xl cursor-pointer ${
                  index === 0 || index === 2 ? 'aspect-[3/4]' : 'aspect-square'
                }`}
              >
                {/* Image */}
                <div className="absolute inset-0 img-zoom">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content on hover */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="flex items-center gap-2 text-white mb-1">
                    <Icon size={18} />
                    <span className="font-serif font-bold text-lg">{image.title}</span>
                  </div>
                  <p className="text-white/80 text-sm">{image.description}</p>
                </div>

                {/* Oil painting frame effect */}
                <div className="absolute inset-0 border-4 border-white/20 rounded-xl pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Description */}
        <div className="life-desc max-w-2xl mx-auto text-center">
          <p className="text-lg text-[#495057] leading-relaxed italic font-serif">
            "Beyond research, I enjoy hiking, photography, and exploring new cultures. 
            I believe that diverse experiences fuel creativity and innovation. I've been to nearly 20 countries, and I'm always passionate to explore more!"
          </p>
          
          {/* Hobby tags */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Nature', 'Art', 'Travel', 'Literature', 'Music'].map((hobby, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white rounded-full text-sm text-[#495057] border border-[#dee2e6] shadow-sm hover:shadow-md hover:border-[#adb5bd] transition-all cursor-default"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
