import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import HatModel from './HatModel';
import { Suspense } from 'react';
import * as THREE from 'three';

interface HatSceneProps {
  hatColor: string;
  text: string;
  backText?: string;
  textColor: string;
  autoRotate?: boolean;
  className?: string;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 4]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-3, 3, 2]} intensity={0.5} color="#e8e8ff" />
      <directionalLight position={[0, 3, -4]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[0, -1, 3]} intensity={0.2} color="#ffffff" />
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
}: HatSceneProps) {
  return (
    <div className={`relative ${className || ''}`}>
      <Canvas
        camera={{ position: [0, 0.3, 2.5], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Lights />
          <HatModel
            hatColor={hatColor}
            text={text}
            backText={backText}
            textColor={textColor}
            autoRotate={autoRotate}
          />
          <ContactShadows
            position={[0, -0.52, 0]}
            opacity={0.3}
            scale={5}
            blur={2.5}
            far={3}
          />
          <OrbitControls
            target={[0, 0.08, 0]}
            enablePan={false}
            minDistance={1.8}
            maxDistance={5}
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI * 0.75}
            minPolarAngle={Math.PI * 0.15}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
