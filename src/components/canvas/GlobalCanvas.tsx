import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import PostProcessing from './PostProcessing';
import PerformanceTier from './PerformanceTier';

interface GlobalCanvasProps {
    children: ReactNode;
    enablePostProcessing?: boolean;
}

/**
 * Global persistent canvas that spans the entire page.
 * This is the single WebGL context for the entire site,
 * positioned as a fixed background layer.
 */
export default function GlobalCanvas({
    children,
    enablePostProcessing = true
}: GlobalCanvasProps) {
    return (
        <div
            className="fixed inset-0 z-[-1]"
            style={{
                pointerEvents: 'none',
                width: '100%',
                height: '100%',
            }}
        >
            <Canvas
                camera={{
                    position: [0, 0, 10],
                    fov: 50,
                    near: 0.1,
                    far: 1000,
                }}
                dpr={[1, 2]} // Limit DPR for performance
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            >
                <PerformanceTier>
                    <Suspense fallback={null}>
                        {children}
                        {enablePostProcessing && <PostProcessing />}
                        <Preload all />
                    </Suspense>
                </PerformanceTier>
            </Canvas>
        </div>
    );
}
