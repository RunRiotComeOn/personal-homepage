import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Gamepad2,
  Gem,
  Github,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Trophy,
  X,
} from 'lucide-react';
import './App.css';

const navLinks = [
  { label: 'ABOUT', href: '#about' },
  { label: 'PRINCIPLES', href: '#principles' },
  { label: 'RESEARCH', href: '#research' },
  { label: 'PUBLICATIONS', href: '#publications' },
  { label: 'EXPERIENCE', href: '#experience' },
  { label: 'LIFE', href: '#life' },
  { label: 'CONTACT', href: '#contact' },
];

const researchExperiences = [
  {
    institution: 'UIUC',
    lab: 'TRAIS Lab',
    year: '2026',
    logo: `${import.meta.env.BASE_URL}uiuc-logo.svg`,
    details: (
      <>
        Advised by{' '}
        <a href="https://jiaqima.github.io/" target="_blank" rel="noreferrer">
          Prof. Jiaqi W. Ma
        </a>
      </>
    ),
  },
  {
    institution: 'UC Davis',
    lab: 'LUKA Lab',
    year: '2026',
    logo: `${import.meta.env.BASE_URL}uc-davis-logo.svg`,
    details: (
      <>
        Advised by{' '}
        <a href="https://muhaochen.github.io/" target="_blank" rel="noreferrer">
          Prof. Muhao Chen
        </a>
        ; working closely with{' '}
        <a href="https://darthzhu.github.io/" target="_blank" rel="noreferrer">
          Tinghui Zhu
        </a>
      </>
    ),
  },
  {
    institution: 'Fudan University',
    lab: 'DISC Lab',
    year: '2025',
    logo: `${import.meta.env.BASE_URL}fudan-logo.svg`,
    details: (
      <>
        Advised by{' '}
        <a
          href="http://www.fudan-disc.com/people/zywei"
          target="_blank"
          rel="noreferrer"
        >
          Prof. Zhongyu Wei
        </a>
      </>
    ),
  },
];

const publications = [
  {
    title: 'GUI Agents for Continual Game Generation',
    authors: 'Yixu Huang*, Bo Li*, Na Li*, Zhe Wang, et al.',
    venue: 'arXiv 2026',
    type: 'Preprint',
    image: `${import.meta.env.BASE_URL}play2code-overview.png`,
    description:
      'PlaytestArena and Play2Code turn game playtesting into a sustained coding-and-playing loop, enabling GUI agents to evaluate and improve playable games.',
    links: [
      { label: 'Paper', href: 'https://arxiv.org/abs/2605.28258' },
      {
        label: 'Project',
        href: 'https://continual-game-generation.vercel.app/',
      },
    ],
  },
  {
    title: 'Learning Adaptive Reasoning Paths for Efficient Visual Reasoning',
    authors: 'Yixu Huang, Tinghui Zhu, Muhao Chen',
    venue: 'arXiv 2026',
    type: 'Preprint',
    image: `${import.meta.env.BASE_URL}avr-figure1.png`,
    description:
      'AVR dynamically selects efficient visual reasoning paths while preserving correctness, reducing token usage by 50–90% across VQA benchmarks.',
    links: [
      { label: 'Paper', href: 'https://arxiv.org/abs/2604.14568' },
      { label: 'Code', href: 'https://github.com/RunRiotComeOn/AVR' },
    ],
  },
  {
    title:
      'ACE: Self-Evolving LLM Coding Framework via Adversarial Unit Test Generation and Preference Optimization',
    authors: 'Yixu Huang, Xinglei Yu, Zhongyu Wei',
    venue: 'ICLR 2026 Workshop RSI',
    type: 'Spotlight',
    image: `${import.meta.env.BASE_URL}ace-pipeline.png`,
    description:
      'ACE replaces saturated output-based verification with execution-centric adversarial supervision for stronger code generation and generalization.',
    links: [
      { label: 'Paper', href: 'https://arxiv.org/abs/2605.16299' },
      { label: 'Code', href: 'https://github.com/RunRiotComeOn' },
    ],
  },
];

const education = [
  {
    period: '2025 · Fall',
    school: 'University of California, Davis',
    degree: 'Exchange Student in Computer Science',
    place: 'Davis, California',
  },
  {
    period: '2023 — Present',
    school: 'Fudan University',
    degree: 'B.S. in Data Science and Big Data Technology',
    place: 'Shanghai, China',
  },
];

const awards = [
  ['2025', "Dean's Honor List", 'UC Davis College of Engineering · Top 8%'],
  [
    '2025',
    'Second Prize',
    'China Undergraduate Mathematical Contest in Modeling',
  ],
  ['2024', 'First-class Scholarship', 'Fudan University · Top 5%'],
  ['2024', 'Outstanding Student Award', 'Fudan University · Top 5%'],
];

const lifeImages = [
  {
    src: `${import.meta.env.BASE_URL}life-hiking.jpg`,
    label: 'Hiking',
    alt: 'Hiking in the mountains',
  },
  {
    src: `${import.meta.env.BASE_URL}life-photography.jpg`,
    label: 'Photography',
    alt: 'Photography',
  },
  {
    src: `${import.meta.env.BASE_URL}life-travel.jpg`,
    label: 'Travel',
    alt: 'Traveling',
  },
  {
    src: `${import.meta.env.BASE_URL}life-reading.jpg`,
    label: 'Reading',
    alt: 'Reading',
  },
];

function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <span>{eyebrow}</span>
      <h2>{children}</h2>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="site-shell">
      <header
        className={isScrolled ? 'site-header is-scrolled' : 'site-header'}
      >
        <a className="wordmark" href="#top" aria-label="Back to top">
          <span>Yixu</span>
          <span>Huang</span>
        </a>

        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={menuOpen ? 'site-nav is-open' : 'site-nav'}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="top">
        <section className="hero-section" id="about">
          <div className="hero-copy">
            <p className="hero-kicker">Hi there!</p>
            <h1>
              I&apos;m <span>Yixu Huang</span>
            </h1>
            <p className="hero-contact">
              Contact: yixuhuang23 <span>[at]</span> m.fudan.edu.cn
            </p>

            <div className="hero-bio">
              <p>
                I am an undergraduate student at{' '}
                <strong className="blue-underline">Fudan University</strong>,
                studying Data Science and Big Data Technology. My research sits
                at the intersection of{' '}
                <span className="blue-underline">large language models</span>,{' '}
                <span className="blue-underline">multimodal intelligence</span>,
                and <span className="blue-underline">agentic systems</span>.
              </p>
              <p>
                I am currently working with{' '}
                <a href="https://jiaqima.github.io/" target="_blank" rel="noreferrer">
                  Prof. Jiaqi W. Ma
                </a>{' '}
                at UIUC on{' '}
                <span className="blue-underline">
                  continual learning methods
                </span>{' '}
                that help agents adapt over time and develop capabilities{' '}
                <span className="blue-underline">
                  beyond those of their underlying foundation models
                </span>
                .
              </p>
              <p>
                Beyond research, I build games, take photos, hike, read, and
                keep looking for new places to explore.
              </p>
            </div>

            <div className="hero-actions" aria-label="Profile links">
              <a className="button button-primary" href="mailto:yixuhuang23@m.fudan.edu.cn">
                <Mail size={17} />
                Email
              </a>
              <a
                className="button"
                href="https://scholar.google.com/citations?user=ZBJHQB0AAAAJ&hl=en&oi=sra"
                target="_blank"
                rel="noreferrer"
              >
                <GraduationCap size={17} />
                Scholar
              </a>
              <a
                className="button"
                href="https://github.com/RunRiotComeOn"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={19} />
                GitHub
              </a>
              <a
                className="button"
                href="https://yxsophie.itch.io"
                target="_blank"
                rel="noreferrer"
              >
                <Gamepad2 size={19} />
                Itch.io
              </a>
            </div>
          </div>

          <div className="hero-portrait-wrap">
            <div className="portrait-accent" aria-hidden="true" />
            <img
              className="hero-portrait"
              src={`${import.meta.env.BASE_URL}hero-portrait.jpg`}
              alt="Yixu Huang"
            />
          </div>
        </section>

        <section className="principles-section" id="principles">
          <p className="principles-label">RESEARCH IDEAL</p>
          <blockquote>
            <span>The simpler, the better.</span>
            Make the problem simple, until it can&apos;t be simpler.
          </blockquote>
          <p className="principles-note">
            Clarity is not a shortcut. It is the result of understanding a
            problem well enough to remove everything that does not matter.
          </p>
        </section>

        <section className="content-section" id="research">
          <SectionHeading eyebrow="01 / RESEARCH">
            Research experience
          </SectionHeading>

          <div className="research-list">
            {researchExperiences.map((experience) => (
              <article className="research-row" key={experience.institution}>
                <time>{experience.year}</time>
                <div className="research-logo">
                  <img
                    src={experience.logo}
                    alt={`${experience.institution} logo`}
                  />
                </div>
                <div>
                  <p className="row-label">{experience.institution}</p>
                  <h3>{experience.lab}</h3>
                  <p>{experience.details}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section publications-section" id="publications">
          <SectionHeading eyebrow="02 / SELECTED WORK">
            Publications
          </SectionHeading>

          <div className="publication-list">
            {publications.map((publication, index) => (
              <article className="publication-row" key={publication.title}>
                <div className="publication-index">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <a
                  className="publication-image"
                  href={publication.links[0].href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${publication.title}`}
                >
                  <img
                    src={publication.image}
                    alt={`${publication.title} overview`}
                  />
                </a>
                <div className="publication-copy">
                  <div className="publication-meta">
                    <span>{publication.venue}</span>
                    <span>{publication.type}</span>
                  </div>
                  <h3>{publication.title}</h3>
                  <p className="authors">{publication.authors}</p>
                  <p className="publication-description">
                    {publication.description}
                  </p>
                  <div className="text-links">
                    {publication.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                        <ArrowUpRight size={14} />
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section" id="experience">
          <SectionHeading eyebrow="03 / BACKGROUND">
            Education & honors
          </SectionHeading>

          <div className="split-section">
            <div>
              <h3 className="subsection-title">
                <BookOpen size={20} />
                Education
              </h3>
              <div className="timeline">
                {education.map((item) => (
                  <article key={item.school}>
                    <time>{item.period}</time>
                    <h4>{item.school}</h4>
                    <p>{item.degree}</p>
                    <span>
                      <MapPin size={13} />
                      {item.place}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h3 className="subsection-title">
                <Trophy size={20} />
                Honors
              </h3>
              <div className="honors-list">
                {awards.map(([year, title, detail]) => (
                  <article key={`${year}-${title}`}>
                    <time>{year}</time>
                    <div>
                      <h4>{title}</h4>
                      <p>{detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="life-section" id="life">
          <div className="life-heading">
            <SectionHeading eyebrow="04 / OFF THE CLOCK">
              Personal life
            </SectionHeading>
            <p>
              Diverse experiences fuel the way I think and make. I have visited
              nearly 20 countries—and I am always ready to explore one more.
            </p>
          </div>

          <div className="life-grid">
            {lifeImages.map((image) => (
              <figure key={image.label}>
                <img src={image.src} alt={image.alt} />
                <figcaption>{image.label}</figcaption>
              </figure>
            ))}
          </div>

          <div className="interest-links">
            <a
              className="interest-link"
              href="https://yxsophie.itch.io/one-button-boss"
              target="_blank"
              rel="noreferrer"
            >
              <Gamepad2 size={20} />
              <span>
                I build games for fun—play <strong>One Button Boss</strong>.
              </span>
              <ExternalLink size={17} />
            </a>

            <a
              className="interest-link"
              href="https://runriotcomeon.github.io/Global_Gemstone_Map/"
              target="_blank"
              rel="noreferrer"
            >
              <Gem size={20} />
              <span>
                I&apos;m also fascinated by gemstones—explore the{' '}
                <strong>Global Gemstone Map</strong>.
              </span>
              <ExternalLink size={17} />
            </a>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <p className="contact-eyebrow">LET&apos;S TALK</p>
          <h2>Interested in ideas that are simple, useful, and built to last.</h2>
          <p>
            I am always happy to discuss research collaborations, new projects,
            or opportunities in AI and machine learning.
          </p>
          <a href="mailto:yixuhuang23@m.fudan.edu.cn">
            yixuhuang23@m.fudan.edu.cn
            <ArrowUpRight size={19} />
          </a>
        </section>
      </main>

      <footer>
        <span>© {new Date().getFullYear()} Yixu Huang</span>
        <span>
          <CalendarDays size={14} />
          Last updated July 2026
        </span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  );
}

export default App;
