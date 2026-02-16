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
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-3, 2, 2]} intensity={0.6} color="#e8e8ff" />
      <directionalLight position={[0, 3, -3]} intensity={0.8} color="#ffffff" />
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
}: HatSceneProps) {
  return (
    <div className={`relative ${className || ''}`}>
      <Canvas
        camera={{ position: [0, 0.6, 3.0], fov: 35 }}
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
          <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={4} blur={2} far={1.5} />
          <OrbitControls
            target={[0, 0.1, 0]}
            enablePan={false}
            minDistance={2.0}
            maxDistance={6}
            enableDamping
            dampingFactor={0.08}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#0a0a0c" roughness={1} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}
