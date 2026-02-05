import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SmallCrystal, OrbitalServices } from '../canvas';

// Data from user request image
const SERVICES = [
    { title: 'Thermal Simulation', id: 'thermal' },
    { title: 'High-Fidelity CAD', id: 'cad' },
    { title: 'Finite Element Analysis', id: 'fea' },
    { title: 'Rapid Prototyping', id: 'proto' },
    { title: 'Computational Fluid Dynamics', id: 'cfd' },
    { title: 'Design Validation', id: 'valid' },
];

export default function ServicesSection() {
    const sectionRef = useRef<HTMLDivElement>(null);

    // Initial animation for the title
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.services-title-anim', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="services" className="relative w-full py-24 z-20 overflow-visible min-h-[800px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,17,24,0),#07080B_80%)] pointer-events-none" />

            <div className="relative z-10 w-full h-full flex flex-col items-center">
                {/* Title Section */}
                <div className="text-center mb-10 max-w-3xl mx-auto px-6">
                    <div className="services-title-anim inline-block mb-6">
                        <span className="font-mono text-xs font-bold text-[#4F6DF5] uppercase tracking-widest bg-[#4F6DF5]/10 px-4 py-2 rounded-full border border-[#4F6DF5]/20">
                            Capabilities
                        </span>
                    </div>
                    <h2 className="services-title-anim text-[32px] sm:text-4xl md:text-6xl font-bold font-display text-white mb-6 leading-tight">
                        Integrated <span className="text-gradient">Engineering</span> Loop
                    </h2>
                    <p className="services-title-anim text-[#A6AFBF] text-lg leading-relaxed max-w-2xl mx-auto">
                        A connected ecosystem of simulation, design, and physical validation.
                    </p>
                </div>

                {/* 3D Orbit Visualization */}
                <div className="w-full h-[600px] relative">
                    {/* Only render 3D on desktop/tablet for better UX, list on mobile if needed, but R3F works fine on mobile too usually */}
                    <Canvas camera={{ position: [0, 8, 26], fov: 32, far: 1000 }}>
                        <ambientLight intensity={0.8} />
                        <pointLight position={[10, 10, 10]} intensity={1} color="#4F6DF5" />

                        {/* Central Core */}
                        <SmallCrystal />

                        {/* Orbital Cards */}
                        <OrbitalServices services={SERVICES} />

                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            minPolarAngle={Math.PI / 4}
                            maxPolarAngle={Math.PI / 2.5}
                            autoRotate
                            autoRotateSpeed={0.5}
                        />
                    </Canvas>

                    {/* Mobile overlay hint if needed */}
                    <div className="absolute bottom-4 left-0 right-0 text-center text-[#A6AFBF]/40 text-xs font-mono uppercase tracking-widest pointer-events-none">
                        Interactive System
                    </div>
                </div>
            </div>
        </section>
    );
}

