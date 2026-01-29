import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Education from './sections/Education';
import Research from './sections/Research';
import Publications from './sections/Publications';
import PersonalLife from './sections/PersonalLife';
import Awards from './sections/Awards';
import Contact from './sections/Contact';
import VisitorMap from './sections/VisitorMap';
import Footer from './sections/Footer';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Initialize scroll-triggered animations
    const sections = document.querySelectorAll('.animate-section');
    
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0.9, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Education />
        <Research />
        <Publications />
        <PersonalLife />
        <Awards />
        <Contact />
        <VisitorMap />
      </main>
      <Footer />
    </div>
  );
}

export default App;
