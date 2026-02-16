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
      {/* Enhanced ambient lighting for better material visibility */}
      <ambientLight intensity={0.3} />
      
      {/* Primary key light with realistic hat lighting */}
      <directionalLight 
        position={[4, 6, 4]} 
        intensity={2.2} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={10}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      
      {/* Fill light to reduce harsh shadows */}
      <directionalLight 
        position={[-2, 3, 3]} 
        intensity={0.6} 
        color="#e8e8ff" 
      />
      
      {/* Back rim light for depth */}
      <directionalLight 
        position={[0, 4, -4]} 
        intensity={0.8} 
        color="#ffffff" 
      />
      
      {/* Bottom fill light to illuminate text better */}
      <directionalLight 
        position={[0, -2, 3]} 
        intensity={0.3} 
        color="#ffffff" 
      />
      
      {/* Accent light for fabric texture */}
      <pointLight 
        position={[2, 3, 2]} 
        intensity={0.4} 
        color="#ffffff" 
        distance={6}
        decay={2}
      />
      
      {/* Environment light for realistic reflections */}
      <pointLight 
        position={[-2, 1, -2]} 
        intensity={0.2} 
        color="#f0f0f0" 
        distance={8}
        decay={2}
      />
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
        shadows="soft"
        gl={{ 
          antialias: true, 
          alpha: false, 
          toneMapping: THREE.ACESFilmicToneMapping, 
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
          shadowMap: true,
          shadowMapType: THREE.PCFSoftShadowMap,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
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
          <ContactShadows 
            position={[0, -0.52, 0]} 
            opacity={0.4} 
            scale={6} 
            blur={2.8} 
            far={3}
            resolution={1024}
            color="#000000"
          />
          <OrbitControls
            target={[0, 0.08, 0]}
            enablePan={false}
            minDistance={1.8}
            maxDistance={6}
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI * 0.75}
            minPolarAngle={Math.PI * 0.15}
          />
          {/* Enhanced ground plane with realistic material */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial 
              color="#080808" 
              roughness={0.9}
              metalness={0.1}
              transparent
              opacity={0.95}
            />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}
