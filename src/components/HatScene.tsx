import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import HatModel from './HatModel';
import { Suspense, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface HatSceneProps {
  hatColor: string;
  text: string;
  backText?: string;
  textColor: string;
  autoRotate?: boolean;
  className?: string;
  showViewButtons?: boolean;
}

function Lights() {
  return (
    <>
      {/* Soft ambient fill */}
      <ambientLight intensity={0.3} />
      {/* Key light - bright, from front-right-above */}
      <directionalLight position={[3, 4, 3]} intensity={1.4} color="#ffffff" />
      {/* Fill light - softer, from left */}
      <directionalLight position={[-3, 2, 2]} intensity={0.6} color="#e8e8ff" />
      {/* Back/rim light - helps separate hat from background */}
      <directionalLight position={[0, 3, -3]} intensity={0.8} color="#ffffff" />
      {/* Bottom fill to show underside of brim */}
      <directionalLight position={[0, -1, 2]} intensity={0.2} color="#ffffff" />
    </>
  );
}

export default function HatScene({
  hatColor,
  text,
  backText,
  textColor,
  autoRotate = false,
  className,
  showViewButtons = false,
}: HatSceneProps) {
  const controlsRef = useRef<any>(null);

  const snapTo = useCallback((azimuth: number) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const dist = 3.2;
    const polar = Math.PI * 0.4;
    const x = dist * Math.sin(polar) * Math.sin(azimuth);
    const y = dist * Math.cos(polar);
    const z = dist * Math.sin(polar) * Math.cos(azimuth);
    controls.object.position.set(x, y, z);
    controls.target.set(0, 0.15, 0);
    controls.update();
  }, []);

  return (
    <div className={`relative ${className || ''}`}>
      <Canvas
        camera={{ position: [0, 0.8, 3.2], fov: 35 }}
        shadows
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ background: '#09090b' }}
      >
        <color attach="background" args={['#09090b']} />
        <Suspense fallback={null}>
          <Lights />
          <HatModel
            hatColor={hatColor}
            text={text}
            backText={backText}
            textColor={textColor}
            autoRotate={autoRotate}
          />
          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={4} blur={2} far={1.5} />
          <OrbitControls
            ref={controlsRef}
            target={[0, 0.15, 0]}
            enablePan={false}
            minDistance={2.2}
            maxDistance={6}
            enableDamping
            dampingFactor={0.08}
          />
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#0a0a0c" roughness={1} />
          </mesh>
        </Suspense>
      </Canvas>

      {showViewButtons && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {[
            { label: 'Front', angle: 0 },
            { label: 'Side', angle: Math.PI / 2 },
            { label: 'Back', angle: Math.PI },
          ].map(({ label, angle }) => (
            <button
              key={label}
              onClick={() => snapTo(angle)}
              className="px-3 py-1 text-[10px] font-medium text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded bg-zinc-950/80 backdrop-blur-sm transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
