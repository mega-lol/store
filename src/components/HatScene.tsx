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
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 3]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-3, 2, 2]} intensity={0.8} color="#e8e8ff" />
      <directionalLight position={[0, 3, -3]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[0, -1, 2]} intensity={0.4} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#ffffff" />
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
        camera={{ position: [0, 0.4, 2.8], fov: 38 }}
        shadows
        gl={{ 
          antialias: true, 
          alpha: false, 
          toneMapping: THREE.ACESFilmicToneMapping, 
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace
        }}
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
          <ContactShadows position={[0, -0.55, 0]} opacity={0.5} scale={5} blur={2.5} far={2} />
          <OrbitControls
            target={[0, 0.05, 0]}
            enablePan={false}
            minDistance={1.5}
            maxDistance={5}
            enableDamping
            dampingFactor={0.08}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#0a0a0c" roughness={1} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}
