import { useRef, useEffect } from 'react';
import gsap from 'gsap';

const processSteps = [
    {
        n: '01',
        t: 'Scope & Requirements',
        d: 'Define engineering parameters, constraints, success criteria, and performance targets with mathematical precision.'
    },
    {
        n: '02',
        t: 'Model & Validate',
        d: 'Build computational models (CAD, FEA, CFD). Run parametric studies and sensitivity analyses. Validate against analytical benchmarks.'
    },
    {
        n: '03',
        t: 'Deliver & Support',
        d: 'Provide technical documentation, analysis reports, and manufacturing recommendations. Support prototyping and production scale-up.'
    },
];

export default function ProcessSection() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Ensure elements are visible initially to prevent "not loading" issues if JS fails or delays
            gsap.set('.process-card', { opacity: 0, y: 60 });

            gsap.to('.process-card', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%', // Trigger earlier
                    end: 'top 30%',
                    scrub: false, // Don't scrub, just play
                    toggleActions: 'play none none reverse'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="process" className="relative py-24 z-20">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-block mb-6">
                            <span className="font-mono text-xs font-bold text-[#4F6DF5] uppercase tracking-widest bg-[#4F6DF5]/10 px-4 py-2 rounded-full border border-[#4F6DF5]/20">
                                Process
                            </span>
                        </div>
                        <h2 className="text-[32px] sm:text-5xl md:text-6xl font-bold font-display leading-tight">
                            How We <span className="text-gradient">Engineer</span>
                        </h2>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const contactElement = document.getElementById('contact');
                            if (contactElement) {
                                contactElement.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="btn-primary w-full sm:w-auto px-10 py-4 text-center cursor-pointer"
                    >
                        Schedule Consultation
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {processSteps.map((step, i) => (
                        <div
                            key={i}
                            className="process-card glass-card p-8 group relative overflow-hidden transition-all duration-300 hover:border-[#4F6DF5]/40"
                        >
                            <div className="text-8xl font-black text-white/5 mb-6 leading-none group-hover:text-[#4F6DF5]/10 transition-colors duration-500">
                                {step.n}
                            </div>
                            <h4 className="text-2xl font-bold mb-4 group-hover:text-[#4F6DF5] transition-colors">
                                {step.t}
                            </h4>
                            <p className="text-[#A6AFBF] leading-relaxed">
                                {step.d}
                            </p>

                            <div className="absolute top-6 right-6 w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center font-bold group-hover:border-[#4F6DF5] group-hover:text-[#4F6DF5] transition-colors">
                                {step.n}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
