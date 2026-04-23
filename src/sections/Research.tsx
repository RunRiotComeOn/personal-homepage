import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlaskConical, Building2, Calendar } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const researchData = [
  {
    title: 'Learning Adaptive Reasoning Paths for Efficient Visual Reasoning',
    institution: 'UC Davis',
    advisor: 'Prof. Muhao Chen',
    advisorUrl: 'https://muhaochen.github.io/',
    location: 'Davis, CA, USA',
    period: 'Sept. 2025 - March. 2026',
    status: 'Submitted to COLM 2026 (first author)',
    role: 'Research Assistant at UC Davis',
    bullets: [
      'Current reasoning Visual Reasoning Models (VRMs) suffer from severe overthinking, consuming excessive tokens, creating a critical need to reduce this redundancy while maintaining performance.',
      'Proposed AVR, an adaptive visual reasoning training framework that decomposes visual reasoning into three cognitive functions: visual perception, logical reasoning, and answer application, enabling models to dynamically choose among three response formats: Full Format, Perception-Only Format, and Direct Answer.',
      'Developed FS-GRPO, an adaptation of Group Relative Policy Optimization that encourages the model to select the most efficient reasoning format.',
      'Achieved a token usage reduction of 50-90% while maintaining overall accuracy on various VQA benchmarks.',
    ],
    tags: ['Vision-Language Models', 'Visual Reasoning', 'Reinforcement Learning', 'Efficiency'],
  },
  {
    title: 'ACE: Self-Evolving LLM Coding Framework via Adversarial Unit Test Generation and Preference Optimization',
    institution: 'Fudan University',
    advisor: 'Prof. Zhongyu Wei',
    advisorUrl: 'http://www.fudan-disc.com/people/zywei',
    location: 'Shanghai, China',
    period: 'Dec. 2025 - March. 2026',
    status: 'ICLR 2026 Workshop RSI Spotlight (first author)',
    role: 'Research Assistant at Fudan University',
    bullets: [
      'Identified feedback saturation in solver-verifier self-improvement for code generation, where verifier-generated tests lose discriminative power as solvers improve, failing to expose remaining execution-level failure modes.',
      'Proposed ACE, a solver-adversary self-evolving framework that replaces output-based verification with execution-centric adversarial supervision. Designed adversarial unit test generation without oracle outputs or human annotation, and constructed execution-derived preference signals to jointly optimize the solver via SFT and the adversary via KTO in a stable multi-round loop.',
      'Achieved consistent gains in pass@k accuracy, out-of-distribution generalization, and inference efficiency across multiple code generation benchmarks, outperforming strong solver-verifier baselines.',
    ],
    tags: ['LLM', 'Code Generation', 'Preference Optimization', 'Self-Improvement'],
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
                  {project.status && (
                    <div className="mb-1 text-[#495057] italic">{project.status}</div>
                  )}
                  {project.role && (
                    <div className="mb-1 text-[#495057]">{project.role}</div>
                  )}
                  Advisor:{' '}
                  {project.advisorUrl ? (
                    <a
                      href={project.advisorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#495057] hover:text-black underline underline-offset-2"
                    >
                      {project.advisor}
                    </a>
                  ) : (
                    <span className="text-[#495057]">{project.advisor}</span>
                  )}
                </div>

                {/* Description */}
                {project.bullets ? (
                  <ul className="list-disc pl-5 space-y-2 text-[#495057] leading-relaxed">
                    {project.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#495057] leading-relaxed">
                    {project.description}
                  </p>
                )}

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
