import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import HatModel from './HatModel';
import { Suspense } from 'react';

interface HatSceneProps {
  hatColor: string;
  text: string;
  textColor: string;
  font?: string;
  autoRotate?: boolean;
  className?: string;
}

export default function HatScene({ hatColor, text, textColor, font, autoRotate = false, className }: HatSceneProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.8, 3], fov: 40 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-3, 3, -3]} intensity={0.3} />
          <pointLight position={[0, 3, 0]} intensity={0.5} />

          <HatModel
            hatColor={hatColor}
            text={text}
            textColor={textColor}
            font={font}
            autoRotate={autoRotate}
          />

          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.4}
            scale={5}
            blur={2.5}
          />

          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={6}
            minPolarAngle={Math.PI * 0.2}
            maxPolarAngle={Math.PI * 0.65}
          />

          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}
