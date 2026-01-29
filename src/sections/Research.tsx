import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlaskConical, Building2, Calendar } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const researchData = [
  {
    title: 'RA@Mitigating Overthinking in Reasoning VLMs via Dynamic Token Budgeting',
    institution: 'University of California, Davis',
    advisor: 'Prof. Muhao Chen',
    location: 'Davis, CA, USA',
    period: '2025 – Present',
    description: 'Current reasoning VLMs suffer from severe overthinking, consuming excessive tokens, creating a critical need to reduce this redundancy while maintaining performance. Propose to adaptively allocate the thinking budgets based on the visual tasks difficulty, skipping reasoning steps for simpler queries. Train the model via SFT and RL to dynamically select the optimal inference path (Direct, Perception-based, or Reasoning-based) by incentivizing correctness and penalizing excessive reasoning tokens through a strictly constrained reward function.',
    tags: ['Vision-Language Models', 'Reinforcement Learning', 'Efficiency'],
  },
  {
    title: 'RA@Super-Resolution Spatial Omics Benchmarking',
    institution: 'Fudan University',
    advisor: 'Prof. Zhiyuan Yuan',
    location: 'Shanghai, China',
    period: '2024 – Sept 2025',
    description: 'Worked on constructing a novel multi-modal benchmarking method through super-resolution technology using spatial omics data for diverse H&E foundation models.',
    tags: ['Spatial Omics', 'Super-Resolution', 'Benchmarking'],
  },
  {
    title: 'AI-Powered Intestinal Polyp Diagnosis & Mobile Digital Ecosystem',
    institution: 'Challenge Cup 2025',
    advisor: 'Prof. Xiahai Zhuang and Prof. Zhiyuan Yuan',
    location: 'Shanghai, China',
    period: '2024 – Mar 2025',
    description: 'Spearheaded the development of a YOLOv5-based diagnostic system using clinical data from Zhongshan Hospital; achieved real-time polyp detection and histological classification (benign vs. malignant) during colonoscopy procedures.',
    tags: ['Computer Vision', 'Medical AI', 'YOLOv5'],
  },
  {
    title: 'RA@AI-based Nb and Antigen Binding Site Prediction',
    institution: 'Fudan University',
    advisor: 'Prof. Yu Ding',
    location: 'Shanghai, China',
    period: '2023 – Sept 2024',
    description: 'Investigated existing protein structure prediction models and studied the framework and application of MSA- and Transformer-based models.',
    tags: ['Protein Structure', 'Transformers', 'Bioinformatics'],
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
        <div className="space-y-8">
          {researchData.map((project, index) => (
            <div
              key={index}
              className="research-card card-3d bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-[#dee2e6] group cursor-pointer"
            >
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-xl lg:text-2xl font-bold text-[#343a40] group-hover:text-black transition-colors flex items-center gap-3">
                      <FlaskConical size={24} className="text-[#6c757d]" />
                      {project.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#6c757d]">
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      {project.institution}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {project.period}
                    </span>
                  </div>
                </div>

                {/* Advisor */}
                <div className="text-sm text-[#6c757d]">
                  Advisor: <span className="text-[#495057]">{project.advisor}</span>
                </div>

                {/* Description */}
                <p className="text-[#495057] leading-relaxed">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#f8f9fa] text-[#495057] text-xs font-medium rounded-full border border-[#dee2e6]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
