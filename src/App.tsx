import { useEffect, useRef, useState } from 'react';
// Force Update
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Box, Target, DollarSign, Zap,
  FlaskConical, Layers,
  Mail, Phone, MapPin,
  Wind, Cpu, Code, Hexagon, Component, Activity,
  Menu, X
} from 'lucide-react';
import './App.css';

// DOM components
import ProcessSection from './components/dom/ProcessSection';
import ServicesSection from './components/dom/ServicesSection';
import ContactForm from './components/dom/ContactForm';
import AIConsultant from './components/chat/AIConsultant';

// Canvas components
import {
  LenisProvider,
  useLenis, // Add useLenis import
  CrystalMesh,
  ParticleField,
  GridBackground,
} from './components/canvas';

// ... existing code ...

// Hooks
import { useReducedMotion } from './hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// DATA
// ============================================

const caseStudies = [
  {
    id: 1,
    category: 'CFD',
    title: 'Aerodynamic Optimization: F1 Rear Wing Assembly',
    description: 'Computational fluid dynamics study to maximize downforce while minimizing drag for a Formula 1 rear wing under race conditions (250+ km/h).',
    tech: ['OpenFOAM', 'Aerodynamics'],
    image: '/case_wing.jpg'
  },
  {
    id: 2,
    category: 'FEA',
    title: 'Modal Analysis: 3U CubeSAT Structural Integrity',
    description: 'Static and dynamic stress analysis for a 3U CubeSAT satellite to survive launch vibration profiles (NASA GEVS) and orbital thermal cycling.',
    tech: ['ANSYS', 'FEA', 'Aerospace'],
    image: '/case_satellite.jpg'
  },
  {
    id: 3,
    category: 'Thermal',
    title: 'Thermal Management: EV Battery Pack Cooling',
    description: 'Conjugate heat transfer simulation for liquid-cooled battery pack maintaining cell temperatures between 20-35°C under fast charging.',
    tech: ['COMSOL', 'Thermal', 'Automotive'],
    image: '/case_battery.jpg'
  },
  {
    id: 4,
    category: 'Mechanical Design',
    title: 'Structural Design: Industrial Robotic Arm',
    description: 'Lightweight manipulator design for 50kg payload with <0.5mm end-effector deflection under dynamic loading.',
    tech: ['SolidWorks', 'FEA', 'Robotics'],
    image: '/case_robot.jpg'
  }
];



const techStack = [
  { name: 'ANSYS', category: 'Simulation', icon: Activity },
  { name: 'SOLIDWORKS', category: 'CAD', icon: Box },
  { name: 'MATLAB', category: 'Computing', icon: Cpu },
  { name: 'COMSOL', category: 'Multiphysics', icon: Component },
  { name: 'CATIA', category: 'Design', icon: Hexagon },
  { name: 'FUSION', category: 'CAD', icon: Layers },
  { name: 'PYTHON', category: 'Scripting', icon: Code },
  { name: 'OPENFOAM', category: 'CFD', icon: Wind }
];

// ============================================
// COMPONENTS
// ============================================

const Navbar = () => {
  const { lenis } = useLenis();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[999] px-6 sm:px-8 py-4 sm:py-6 flex items-center justify-between nav-glass transition-all duration-300">
      <a href="#" className="flex items-center gap-2 group" onClick={(e) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        lenis?.scrollTo(0, { duration: 1.5 });
      }}>
        <div className="w-8 h-8 border-2 border-[#4F6DF5] rounded flex items-center justify-center
                        group-hover:bg-[#4F6DF5]/20 transition-colors">
          <span className="text-[#4F6DF5] font-bold font-display text-sm">V</span>
        </div>
        <span className="font-semibold font-display text-lg tracking-tight">VERTEX.LABS</span>
      </a>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#services" onClick={(e) => handleScroll(e, '#services')} className="text-sm font-medium text-[#A6AFBF] hover:text-white transition-colors font-display tracking-wide">Services</a>
        <a href="#process" onClick={(e) => handleScroll(e, '#process')} className="text-sm font-medium text-[#A6AFBF] hover:text-white transition-colors font-display tracking-wide">Process</a>
        <a href="#archive" onClick={(e) => handleScroll(e, '#archive')} className="text-sm font-medium text-[#A6AFBF] hover:text-white transition-colors font-display tracking-wide">Archive</a>
        <a href="#contact" onClick={(e) => handleScroll(e, '#contact')} className="text-sm font-medium text-[#A6AFBF] hover:text-white transition-colors font-display tracking-wide">Contact</a>
      </div>

      {/* Desktop CTA */}
      <a
        href="#contact"
        onClick={(e) => handleScroll(e, '#contact')}
        className="hidden md:inline-block btn-outline text-sm py-2 px-4 cursor-pointer font-display tracking-wide"
      >
        Start Project
      </a>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden p-2 text-white"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#07080B] border-b border-[#A6AFBF]/10 md:hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[1001] pointer-events-auto">
          <div className="flex flex-col p-8 gap-8 pointer-events-auto">
            <a href="#services" onClick={(e) => { handleScroll(e, '#services'); setMobileMenuOpen(false); }} className="flex items-center gap-6 text-xl font-medium text-[#A6AFBF] hover:text-[#4F6DF5] transition-colors font-display border-b border-[#A6AFBF]/10 pb-6">
              <Layers size={24} className="text-[#4F6DF5]" />
              Services
            </a>
            <a href="#process" onClick={(e) => { handleScroll(e, '#process'); setMobileMenuOpen(false); }} className="flex items-center gap-6 text-xl font-medium text-[#A6AFBF] hover:text-[#4F6DF5] transition-colors font-display border-b border-[#A6AFBF]/10 pb-6">
              <Activity size={24} className="text-[#4F6DF5]" />
              Process
            </a>
            <a href="#archive" onClick={(e) => { handleScroll(e, '#archive'); setMobileMenuOpen(false); }} className="flex items-center gap-6 text-xl font-medium text-[#A6AFBF] hover:text-[#4F6DF5] transition-colors font-display border-b border-[#A6AFBF]/10 pb-6">
              <Box size={24} className="text-[#4F6DF5]" />
              Archive
            </a>
            <a href="#contact" onClick={(e) => { handleScroll(e, '#contact'); setMobileMenuOpen(false); }} className="flex items-center gap-6 text-xl font-medium text-[#A6AFBF] hover:text-[#4F6DF5] transition-colors font-display border-b border-[#A6AFBF]/10 pb-6">
              <Mail size={24} className="text-[#4F6DF5]" />
              Contact
            </a>
            <a
              href="#contact"
              onClick={(e) => { handleScroll(e, '#contact'); setMobileMenuOpen(false); }}
              className="btn-primary flex items-center justify-center gap-3 py-4 mt-4 text-lg"
            >
              <Zap size={20} />
              Start Project
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  const [activeFilter, setActiveFilter] = useState('All');
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  // const servicesRef = useRef<HTMLDivElement>(null); // Removed - handled internally
  const archiveRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion();

  // Initialize GSAP animations
  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero entrance animation (auto-play on load)
      const heroTl = gsap.timeline();

      heroTl.from('.hero-headline', {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.04
      })
        .from('.hero-sub', {
          y: 18,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        }, '-=0.4')
        .from('.stat-card-item', {
          y: 40,
          opacity: 0,
          scale: 0.98,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out'
        }, '-=0.3');

      // Hero scroll-driven exit animation
      gsap.to('.hero-content', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        opacity: 0,
        y: -50,
        ease: 'none'
      });

      gsap.to('.hero-canvas', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        opacity: 0,
        scale: 0.9,
        ease: 'none'
      });

      gsap.to('.hero-stats', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        opacity: 0,
        y: 50,
        ease: 'none'
      });

      // Services section animations moved to ServicesSection component

      // Archive section - Simple fade in to avoid "stuck invisible" issues
      gsap.fromTo('.archive-header',
        { opacity: 0, y: -20 },
        {
          scrollTrigger: {
            trigger: archiveRef.current,
            start: 'top 90%', // Trigger earlier 
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out'
        }
      );

      gsap.fromTo('.archive-card',
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: archiveRef.current,
            start: 'top 80%',
          },
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out'
        }
      );

      // Metrics section
      gsap.from('.metrics-title', {
        scrollTrigger: {
          trigger: metricsRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1,
        },
        x: window.innerWidth < 768 ? -20 : -100,
        opacity: 0,
        ease: 'power2.out'
      });

      gsap.from('.metrics-panel', {
        scrollTrigger: {
          trigger: metricsRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1,
        },
        x: window.innerWidth < 768 ? 20 : 100,
        opacity: 0,
        scale: 0.98,
        ease: 'power2.out'
      });

      gsap.from('.metrics-strip', {
        scrollTrigger: {
          trigger: metricsRef.current,
          start: 'top 60%',
          end: 'top 20%',
          scrub: 1,
        },
        y: 50,
        opacity: 0,
        ease: 'power2.out'
      });

      // Stack section
      gsap.from('.stack-title', {
        scrollTrigger: {
          trigger: stackRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1,
        },
        y: -50,
        opacity: 0,
        ease: 'power2.out'
      });

      gsap.from('.stack-card', {
        scrollTrigger: {
          trigger: stackRef.current,
          start: 'top 70%',
          end: 'top 20%',
          scrub: 1,
        },
        y: 40,
        opacity: 0,
        scale: 0.94,
        stagger: 0.05,
        ease: 'power2.out'
      });

      // Flowing sections reveal animations
      gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
        gsap.from(section.querySelectorAll('.reveal-item'), {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 45%',
            scrub: true
          },
          y: 20,
          opacity: 0,
          stagger: 0.05
        });
      });

    }, mainRef);

    // Refresh ScrollTrigger after a small delay to ensure all elements are rendered
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [prefersReducedMotion]);

  // Refresh GSAP on filter change to ensure layout recalculations
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [activeFilter]);

  const filteredCases = activeFilter === 'All'
    ? caseStudies
    : caseStudies.filter(c => c.category === activeFilter);

  return (
    <LenisProvider>
      <div ref={mainRef} className="relative bg-[#07080B] min-h-screen">
        {/* Global overlays */}
        <div className="fixed inset-0 vignette-overlay z-[900] pointer-events-none" />
        <div className="fixed inset-0 scanline-overlay z-[900] pointer-events-none" />
        <div className="fixed inset-0 noise-overlay z-[900] pointer-events-none" />

        {/* Global Background Canvas with Grid */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <ambientLight intensity={0.2} />
            <GridBackground
              size={40}
              divisions={80}
              amplitude={0.2}
              frequency={1.5}
              position={[0, -3, -8]}
            />
          </Canvas>
        </div>

        <Navbar />



        {/* Section 1: Hero */}
        <section ref={heroRef} className="relative min-h-screen z-10 pt-24 pb-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(79,109,245,0.10),transparent_55%)]" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-10rem)]">
              {/* Hero Content */}
              <div className="hero-content relative z-10 overflow-hidden">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#A6AFBF] mb-4">
                  Solution Lab • Operational Since 2019
                </p>

                <h1 className="hero-headline text-[32px] sm:text-[48px] md:text-[64px] lg:text-[80px] font-bold leading-[1.1] mb-6 break-words">
                  Engineering <span className="text-gradient">Solvency</span> at Scale.
                </h1>

                <p className="hero-sub text-[#A6AFBF] text-sm sm:text-base lg:text-lg leading-relaxed max-w-md mb-8">
                  We don't "make things pretty." We <span className="text-white font-medium">engineer outcomes</span>.
                  High-fidelity CAD, computational validation, and rapid prototyping for B2B manufacturers who need to ship.
                </p>

                {/* Buttons removed - non-functional */}
              </div>

              {/* 3D Canvas */}
              <div className="hero-canvas relative w-full aspect-square max-w-[320px] sm:max-w-[400px] lg:max-w-[520px] mx-auto lg:ml-auto mt-8 lg:mt-0 pointer-events-none lg:pointer-events-auto">
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[10, 10, 10]} intensity={1} color="#4F6DF5" />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7B8FF7" />
                  <CrystalMesh />
                  <ParticleField />
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
                </Canvas>
              </div>
            </div>

            {/* Stats Row */}
            <div className="hero-stats grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-12 lg:mt-8">
              {[
                { icon: Box, value: '247+', label: 'Projects Shipped' },
                { icon: Target, value: '99.70%', label: 'Analysis Precision' },
                { icon: DollarSign, value: '$2.4M+', label: 'Cost Avoided' },
                { icon: Zap, value: '24/7', label: 'Lab Access' }
              ].map((stat, i) => (
                <div key={i} className="stat-card-item stat-card p-3 sm:p-4">
                  <stat.icon className="w-5 h-5 text-[#4F6DF5]" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-xs text-[#A6AFBF] font-mono uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A6AFBF] bg-[#0E1118]/60 px-3 py-1 rounded-full border border-[#A6AFBF]/15">
                ISO 9001:2015
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A6AFBF] bg-[#0E1118]/60 px-3 py-1 rounded-full border border-[#A6AFBF]/15">
                ON-PREMISE LAB
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A6AFBF] bg-[#0E1118]/60 px-3 py-1 rounded-full border border-[#A6AFBF]/15">
                HPC CLUSTER READY
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Services (using new Orbital component) */}
        <ServicesSection />

        {/* Section 2.5: Process (New) */}
        <ProcessSection />

        {/* Section 3: Trusted By */}
        <section className="section-flowing z-30 reveal-section">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
            <p className="reveal-item font-mono text-xs uppercase tracking-[0.12em] text-[#A6AFBF] text-center mb-10">
              Trusted By Engineers At
            </p>

            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-16 mb-10">
              {['MIT', 'SIEMENS', 'Stanford', 'P&G', 'Caltech', 'HITACHI'].map((org, i) => (
                <div key={i} className="reveal-item text-2xl lg:text-3xl font-bold text-[#A6AFBF]/40 hover:text-[#A6AFBF]/70 transition-colors">
                  {org}
                </div>
              ))}
            </div>

            <div className="reveal-item flex justify-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A6AFBF]/60 px-3 py-1 rounded-full border border-[#A6AFBF]/10">
                ISO 9001:2015
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A6AFBF]/60 px-3 py-1 rounded-full border border-[#A6AFBF]/10">
                ON-PREMISE LAB
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A6AFBF]/60 px-3 py-1 rounded-full border border-[#A6AFBF]/10">
                HPC CLUSTER READY
              </span>
            </div>
          </div>
        </section>

        {/* Section 4: Archive */}
        <section ref={archiveRef} id="archive" className="relative py-24 z-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,109,245,0.06),transparent_50%)]" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            {/* Header */}
            <div className="archive-header mb-12">
              <span className="font-mono text-xs font-bold text-[#4F6DF5] uppercase tracking-widest bg-[#4F6DF5]/10 px-4 py-2 rounded-full border border-[#4F6DF5]/20 inline-block mb-6">
                Portfolio
              </span>
              <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-bold mb-4">Laboratory Archive</h2>
              <p className="text-[#A6AFBF] text-lg mb-2">Validated Case Studies</p>
              <p className="text-sm text-[#A6AFBF]/70 max-w-xl">
                STAR-format technical documentation. Situation, Task, Action, Result—backed by data.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="archive-header flex flex-wrap gap-2 mb-8">
              {['All', 'CFD', 'FEA', 'Thermal', 'Mechanical Design'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Case Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCases.map((study, i) => (
                <div
                  key={study.id}
                  className="archive-card case-card"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="tag">{study.category}</span>
                        <span className="font-mono text-[10px] text-[#A6AFBF]">REF: P{study.id}</span>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 leading-tight">{study.title}</h3>
                      <p className="text-sm text-[#A6AFBF] leading-relaxed mb-4 flex-1">{study.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {study.tech.map((t, j) => (
                          <span key={j} className="tag">{t}</span>
                        ))}
                      </div>

                      {/* Removed View Details Button as per user request */}
                    </div>

                    <div className="w-full md:w-[160px] h-[120px] md:h-auto relative overflow-hidden">
                      <img
                        src={study.image}
                        alt={study.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0E1118]/80" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Metrics */}
        <section ref={metricsRef} className="relative py-24 z-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(79,109,245,0.08),transparent_55%)]" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Title */}
              <div className="metrics-title">
                <span className="font-mono text-xs font-bold text-[#4F6DF5] uppercase tracking-widest bg-[#4F6DF5]/10 px-4 py-2 rounded-full border border-[#4F6DF5]/20 inline-block mb-6">
                  Performance
                </span>
                <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-bold mb-4">Laboratory Metrics</h2>
                <p className="text-[#A6AFBF] text-lg">Engineering at Scale</p>
                <p className="text-sm text-[#A6AFBF]/70 mt-2">Real-time data from our solution engineering operations</p>
              </div>

              {/* Big Metric Panel */}
              <div className="metrics-panel glass-card p-8">
                <div className="text-[60px] lg:text-[80px] font-bold text-gradient leading-none">98.2%</div>
                <div className="text-xl font-semibold mt-2">Real-World Correlation</div>
                <p className="text-sm text-[#A6AFBF] mt-3 leading-relaxed">
                  Our simulations achieve 98.2% correlation with physical testing and real-world performance.
                  Validated across 1,000+ production runs with rigorous mesh independence studies.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="tag">VALIDATION CONFIDENCE</span>
                  <span className="tag">PRODUCTION-READY</span>
                </div>
              </div>
            </div>

            {/* Status Strip */}
            <div className="metrics-strip grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Projects Completed', value: '18+' },
                { label: 'Client Satisfaction', value: '97%' },
                { label: 'Response SLA', value: '<24 Hours', sub: '⚡ Priority Support' },
                { label: 'Active Projects', value: '1', sub: '🌍 LIVE STATUS' }
              ].map((item, i) => (
                <div key={i} className="glass-card px-5 py-4">
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-xs text-[#A6AFBF] font-mono uppercase tracking-wider">{item.label}</div>
                  {item.sub && <div className="text-[10px] text-[#4F6DF5] mt-1">{item.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Validation + Testimonial */}
        <section className="section-flowing z-[60] reveal-section">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Quote */}
              <div className="reveal-item">
                <div className="text-6xl text-[#4F6DF5]/30 font-serif mb-4">"</div>
                <blockquote className="text-2xl lg:text-3xl font-medium leading-relaxed mb-6">
                  Vertex Labs engineered a thermal management solution that reduced our satellite payload temperature variance by <span className="text-gradient">40%</span>. Mission-critical precision.
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#4F6DF5]/20 flex items-center justify-center">
                    <span className="text-[#4F6DF5] font-semibold">SC</span>
                  </div>
                  <div>
                    <div className="font-semibold">Dr. Sarah Chen</div>
                    <div className="text-sm text-[#A6AFBF]">CTO, AeroSpace Dynamics</div>
                  </div>
                </div>
              </div>

              {/* Tech Stack Badges */}
              <div className="reveal-item">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#A6AFBF] mb-4">Engineering Stack</p>
                <div className="flex flex-wrap gap-3">
                  {['ANSYS', 'MATLAB', 'SOLIDWORKS', 'PYTHON', 'COMSOL', 'OPENFOAM'].map((tech, i) => (
                    <div key={i} className="glass-card px-4 py-2 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-[#4F6DF5]" />
                      <span className="font-mono text-sm">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Engineering Stack */}
        <section ref={stackRef} className="relative py-24 z-[70]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,109,245,0.06),transparent_60%)]" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            {/* Title */}
            <div className="stack-title text-center mb-16">
              <span className="font-mono text-xs font-bold text-[#4F6DF5] uppercase tracking-widest bg-[#4F6DF5]/10 px-4 py-2 rounded-full border border-[#4F6DF5]/20 inline-block mb-6">
                Tech Stack
              </span>
              <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-bold mb-4">Engineering Arsenal</h2>
              <p className="text-[#A6AFBF] text-lg max-w-2xl mx-auto">
                Enterprise-grade solvers and CAD platforms selected for accuracy, performance, and industry validation
              </p>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {techStack.map((tech, i) => (
                <div
                  key={i}
                  className="stack-card tech-card flex flex-col items-center justify-center py-8"
                >
                  <tech.icon className="w-8 h-8 text-[#4F6DF5] mb-3" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">{tech.name}</div>
                    <div className="text-xs text-[#A6AFBF] font-mono uppercase tracking-wider mt-1">{tech.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 8: Contact */}
        <section id="contact" className="section-flowing z-[80] reveal-section">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Info */}
              <div className="reveal-item">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#4F6DF5] mb-4">Contact Interface</p>
                <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-bold mb-4">Initialize<br />Technical Brief</h2>
                <p className="text-[#A6AFBF] mb-8">
                  Submit project parameters for computational feasibility analysis
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#A6AFBF]">
                    <Mail className="w-5 h-5 text-[#4F6DF5]" />
                    <span>xheikhtalha.yasin2004@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#A6AFBF]">
                    <Phone className="w-5 h-5 text-[#4F6DF5]" />
                    <span>+92 313 5229867</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#A6AFBF]">
                    <MapPin className="w-5 h-5 text-[#4F6DF5]" />
                    <span>Pakistan</span>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="reveal-item glass-card p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: Footer */}
        <footer className="section-flowing z-[90] border-t border-[#A6AFBF]/10">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 border-2 border-[#4F6DF5] rounded flex items-center justify-center">
                  <span className="text-[#4F6DF5] font-bold text-xl">V</span>
                </div>
                <span className="text-2xl font-bold">VERTEX.LABS</span>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mb-6">
                <a href="#services" className="text-sm text-[#A6AFBF] hover:text-white transition-colors">Services</a>
                <a href="#archive" className="text-sm text-[#A6AFBF] hover:text-white transition-colors">Portfolio</a>
                <a href="#contact" className="text-sm text-[#A6AFBF] hover:text-white transition-colors">Contact</a>
              </div>

              <p className="text-sm text-[#A6AFBF]/60">
                © 2025 Vertex Engineering Labs. Engineering solvency at scale.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A6AFBF]/40 px-3 py-1 rounded-full border border-[#A6AFBF]/10">
                ISO 9001:2015
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A6AFBF]/40 px-3 py-1 rounded-full border border-[#A6AFBF]/10">
                GDPR COMPLIANT
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A6AFBF]/40 px-3 py-1 rounded-full border border-[#A6AFBF]/10">
                CARBON NEUTRAL LAB
              </span>
            </div>
          </div>
        </footer>

        {/* AI Chatbot */}
        <AIConsultant />
      </div>
    </LenisProvider>
  );
}

export default App;
