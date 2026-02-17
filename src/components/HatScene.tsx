import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { Canvas as FabricCanvas } from 'fabric';
import HatModel from './HatModel';
import { Suspense } from 'react';
import * as THREE from 'three';

import { Decal, TextStyle } from '@/types/hat';

interface HatSceneProps {
  hatColor: string;
  bandColor?: string;
  texture?: string;
  text: string;
  backText?: string;
  textColor: string;
  textStyle?: TextStyle;
  font?: string;
  flagCode?: string;
  decals?: Decal[];
  onDecalUpdate?: (id: string, updates: Partial<Decal>) => void;
  selectedDecalId?: string;
  onDecalSelect?: (id: string | null) => void;
  placementMode?: boolean;
  onPlacementComplete?: () => void;
  autoRotate?: boolean;
  className?: string;
  fabricCanvas?: FabricCanvas | null;
  editingOnSurface?: boolean;
  onEditingSurface?: (editing: boolean) => void;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1.8}
        castShadow
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#f0f0ff" />
      <Environment preset="city" />
    </>
  );
}

export default function HatScene({
  hatColor,
  bandColor,
  texture,
  text,
  backText,
  textColor,
  textStyle,
  font,
  flagCode,
  decals,
  onDecalUpdate,
  selectedDecalId,
  onDecalSelect,
  placementMode = false,
  onPlacementComplete,
  autoRotate = false,
  className,
  fabricCanvas,
  editingOnSurface = false,
  onEditingSurface,
}: HatSceneProps) {
  return (
    <div className={`relative ${className || ''}`}>
      <Canvas
        camera={{ position: [0, 0.2, 2.8], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
        onPointerMissed={() => onDecalSelect?.(null)}
      >
        <Suspense fallback={null}>
          <Lights />
          <HatModel
            hatColor={hatColor}
            bandColor={bandColor}
            texture={texture}
            text={text}
            backText={backText}
            textColor={textColor}
            textStyle={textStyle}
            fontFamily={font}
            flagCode={flagCode}
            decals={decals}
            onDecalUpdate={onDecalUpdate}
            selectedDecalId={selectedDecalId}
            onDecalSelect={onDecalSelect}
            placementMode={placementMode}
            onPlacementComplete={onPlacementComplete}
            autoRotate={autoRotate}
            fabricCanvas={fabricCanvas}
            onEditingSurface={onEditingSurface}
          />
          <ContactShadows
            position={[0, -0.52, 0]}
            opacity={0.25}
            scale={5}
            blur={2.5}
            far={3}
          />
          <OrbitControls
            target={[0, 0.08, 0]}
            enabled={!placementMode && !editingOnSurface}
            enablePan={false}
            enableZoom={!autoRotate}
            minDistance={1.8}
            maxDistance={5}
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI * 0.75}
            minPolarAngle={Math.PI * 0.15}
            makeDefault
          />
        </Suspense>
      </Canvas>
      {placementMode && (
        <div className="absolute left-4 bottom-4 z-10 rounded border border-white/20 bg-black/70 px-3 py-2 text-[10px] tracking-wide uppercase text-white/80">
          Placement mode: click surface to stamp layer
        </div>
      )}
      {editingOnSurface && (
        <div className="absolute left-4 bottom-4 z-10 rounded border border-yellow-400/30 bg-black/70 px-3 py-2 text-[10px] tracking-wide uppercase text-yellow-300/80">
          Editing text on surface — drag to move, handles to resize
        </div>
      )}
    </div>
  );
}
