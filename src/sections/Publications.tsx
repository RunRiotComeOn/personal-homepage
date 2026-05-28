import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Users, BookOpen, ExternalLink, Code, Globe } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const publications = [
  {
    title: 'GUI Agents for Continual Game Generation',
    authors: 'Yixu Huang*, Bo Li*, Na Li*, Zhe Wang, et al.',
    venue: 'arXiv 2026',
    type: 'Preprint',
    abstract: 'We study how GUI agents can make game generation more interactive and reliable by acting as both objective evaluators and subjective playtesters. We introduce PlaytestArena, a browser-based evaluation environment with 200 game generation tasks across eight genres, and Play2Code, a sustained coding-and-playing loop where a game agent and GUI agent share memory and iteratively improve playable games. Experiments show that Play2Code substantially improves rubric pass rates over single-pass and agentic-coding baselines, positioning game playtesting as a rich testbed for interactive code generation.',
    image: import.meta.env.BASE_URL + 'play2code-overview.png',
    links: {
      pdf: 'https://arxiv.org/abs/2605.28258',
      project: 'https://continual-game-generation.vercel.app/',
    },
  },
  {
    title: 'Learning Adaptive Reasoning Paths for Efficient Visual Reasoning',
    authors: 'Yixu Huang, Tinghui Zhu, Muhao Chen',
    venue: 'arXiv 2026',
    type: 'Preprint',
    abstract: 'We propose AVR, an adaptive visual reasoning training framework that reduces reasoning path redundancy in Visual Reasoning Models. AVR decomposes visual reasoning into visual perception, logical reasoning, and answer application, then trains models with FS-GRPO to dynamically choose the most efficient response format while preserving correctness, reducing token usage by 50-90% across VQA benchmarks.',
    image: import.meta.env.BASE_URL + 'avr-figure1.png',
    links: {
      pdf: 'https://arxiv.org/abs/2604.14568',
      code: 'https://github.com/RunRiotComeOn/AVR',
    },
  },
  {
    title: 'ACE: Self-Evolving LLM Coding Framework via Adversarial Unit Test Generation and Preference Optimization',
    authors: 'Yixu Huang, Xinglei Yu, Zhongyu Wei',
    venue: 'ICLR 2026 Workshop RSI',
    type: 'Spotlight',
    abstract: 'We identify feedback saturation in solver–verifier self-improvement for code generation, where verifier-generated tests lose discriminative power as solvers improve. We propose ACE, a solver–adversary self-evolving framework that replaces output-based verification with execution-centric adversarial supervision, achieving consistent gains in pass@k accuracy, out-of-distribution generalization, and inference efficiency across multiple code generation benchmarks.',
    image: import.meta.env.BASE_URL + 'ace-pipeline.png',
    links: {
      pdf: 'https://arxiv.org/abs/2605.16299',
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

              {/* Main figure */}
              {pub.image && (
                <div className="my-4 rounded-lg overflow-hidden border border-[#dee2e6] bg-white">
                  <img
                    src={pub.image}
                    alt={`${pub.title} overview`}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Abstract - expands on hover */}
              <div className="pub-abstract">
                <p className="text-[#495057] leading-relaxed text-sm pt-2 border-t border-[#dee2e6]">
                  {pub.abstract}
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#dee2e6]">
                {pub.links.pdf && (
                  <a
                    href={pub.links.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#343a40] font-medium hover:text-black transition-colors"
                  >
                    <ExternalLink size={16} />
                    PDF
                  </a>
                )}
                {pub.links.project && (
                  <a
                    href={pub.links.project}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#343a40] font-medium hover:text-black transition-colors"
                  >
                    <Globe size={16} />
                    Project
                  </a>
                )}
                {pub.links.code && (
                  <a
                    href={pub.links.code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#343a40] font-medium hover:text-black transition-colors"
                  >
                    <Code size={16} />
                    Code
                  </a>
                )}
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
