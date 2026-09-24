import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { Canvas as FabricCanvas } from 'fabric';
import HatModel from './HatModel';
import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import * as THREE from 'three';

import { Decal, TextStyle } from '@/types/hat';

// Camera presets: spherical positions around target [0, 0.08, 0] at distance 2.8
const R = 2.8;
const TARGET: [number, number, number] = [0, 0.08, 0];

export interface CameraPreset {
  label: string;
  shortLabel: string;
  position: [number, number, number];
}

export const CAMERA_PRESETS: CameraPreset[] = [
  { label: 'Front', shortLabel: 'F', position: [0, 0.2, R] },
  { label: 'Back', shortLabel: 'B', position: [0, 0.2, -R] },
  { label: 'Right', shortLabel: 'R', position: [-R, 0.2, 0] },
  { label: '3/4 Right', shortLabel: '¾R', position: [-R * 0.707, 0.2, -R * 0.707] },
  { label: '3/4 Left', shortLabel: '¾L', position: [R * 0.707, 0.2, R * 0.707] },
  { label: 'Left', shortLabel: 'L', position: [R, 0.2, 0] },
  { label: 'Under Brim', shortLabel: 'UB', position: [0, -R * 0.5, R * 0.866] },
  { label: 'Top Down', shortLabel: 'TD', position: [0, R * 0.866, R * 0.5] },
];

export interface HatSceneRef {
  setCameraPreset: (index: number) => void;
}

function CameraController({ presetIndex, trigger }: { presetIndex: number; trigger: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if (presetIndex < 0 || trigger === 0) return;

    const preset = CAMERA_PRESETS[presetIndex];
    if (!preset) return;

    const start = camera.position.clone();
    const end = new THREE.Vector3(...preset.position);
    const duration = 500;
    const startTime = performance.now();

    let raf: number;
    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(start, end, ease);
      camera.lookAt(...TARGET);

      if (t < 1) {
        raf = requestAnimationFrame(animate);
      }
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, [presetIndex, trigger, camera]);

  return null;
}

interface HatSceneProps {
  hatColor: string;
  bandColor?: string;
  texture?: string;
  text: string;
  backText?: string;
  brimText?: string;
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
  cameraPreset?: number;
  cameraPresetTrigger?: number;
}

/**
 * Whether this browser can give three.js a hardware WebGL context. Checked BEFORE
 * the Canvas mounts, for two reasons:
 *
 * - With no context at all, the renderer throws from inside react-three-fiber's
 *   mount effect, and with nothing to catch it React unmounts the whole app: the
 *   store renders blank, not just the preview.
 * - A SOFTWARE context (SwiftShader) does render, but this scene — a 3 MB model,
 *   an environment map and contact shadows, twice on the home page — takes the
 *   main thread for tens of seconds per frame there, and the page stops answering
 *   clicks. `failIfMajorPerformanceCaveat` is the browser's own word for that case.
 *
 * Either way the visitor gets the flat hat instead.
 */
function canRenderWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const opts = { failIfMajorPerformanceCaveat: true };
    const gl = (probe.getContext('webgl2', opts) ||
      probe.getContext('webgl', opts)) as WebGLRenderingContext | null;
    // Browsers cap live contexts per page; release the probe's at once.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/** Catches a renderer that fails after the probe passed (context lost, driver refusal). */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** The hat without WebGL: its colour and the front embroidery, flat. */
function FlatHat({ hatColor, textColor }: { hatColor: string; textColor: string }) {
  const art = `url(${import.meta.env.BASE_URL}images/front_text.webp)`;
  return (
    <div className="flex h-full w-full items-center justify-center p-6" role="img" aria-label="MEGA hat, front">
      <div
        className="flex aspect-[5/2] w-full max-w-md items-center justify-center rounded-t-[45%] rounded-b-[12%] shadow-2xl"
        style={{ backgroundColor: hatColor }}
      >
        <div
          className="h-3/5 w-4/5"
          style={{
            backgroundColor: textColor,
            WebkitMaskImage: art,
            maskImage: art,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </div>
    </div>
  );
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
  brimText,
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
  cameraPreset = -1,
  cameraPresetTrigger = 0,
}: HatSceneProps) {
  const [webgl] = useState(canRenderWebGL);
  const flat = <FlatHat hatColor={hatColor} textColor={textColor} />;
  if (!webgl) {
    return <div className={`relative ${className || ''}`}>{flat}</div>;
  }
  return (
    <div className={`relative ${className || ''}`}>
      <SceneBoundary fallback={flat}>
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
              brimText={brimText}
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
            <CameraController presetIndex={cameraPreset} trigger={cameraPresetTrigger} />
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
      </SceneBoundary>
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
