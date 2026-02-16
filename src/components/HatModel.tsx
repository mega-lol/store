import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Decal } from '@/types/hat';
import DecalLayer from './DecalLayer';

interface HatModelProps {
  hatColor: string;
  texture?: string;
  text: string;
  backText?: string;
  textColor: string;
  decals?: Decal[];
  onDecalUpdate?: (id: string, updates: Partial<Decal>) => void;
  selectedDecalId?: string;
  onDecalSelect?: (id: string | null) => void;
  autoRotate?: boolean;
}

function makeTextTexture(
  lines: string[],
  textColor: string,
  renderer: THREE.WebGLRenderer,
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);

  const x = c.width * 0.5;
  const lineCount = lines.length;
  const maxLen = Math.max(...lines.map(l => l.length));

  let fontSize = lineCount === 1
    ? (maxLen > 15 ? 180 : maxLen > 10 ? 220 : 260)
    : lineCount === 2
      ? (maxLen > 12 ? 160 : maxLen > 8 ? 200 : 240)
      : (maxLen > 10 ? 140 : 180);

  const fontStr = `900 ${fontSize}px "Bodoni Moda", "Times New Roman", serif`;
  ctx.font = fontStr;

  const widest = lines.reduce((a, b) => a.length > b.length ? a : b);
  const measured = ctx.measureText(widest).width;
  if (measured > c.width * 0.85) {
    fontSize = Math.floor(fontSize * (c.width * 0.85) / measured);
  }

  const finalFont = `900 ${fontSize}px "Bodoni Moda", "Times New Roman", serif`;
  const dy = fontSize * 1.15;
  const y0 = c.height * 0.5 - ((lineCount - 1) * dy) / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  ctx.font = finalFont;
  lines.forEach((t, i) => ctx.fillText(t, x, y0 + i * dy));

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  if (renderer) {
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  }
  tex.needsUpdate = true;
  return tex;
}

function createCurvedPlane(
  width: number,
  height: number,
  radius: number,
  segsX = 48,
  segsY = 16,
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, segsX, segsY);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const angle = px / radius;

    const newX = Math.sin(angle) * radius;
    const newZ = Math.cos(angle) * radius - radius;

    const ny = py / (height * 0.5);
    const dome = 0.15 * radius * (1 - ny * ny * 0.3);

    pos.setXYZ(i, newX, py, newZ + dome);
  }

  geo.computeVertexNormals();
  return geo;
}

// Inside-lid branding texture: globe + Khmer script
function makeLidTexture(renderer: THREE.WebGLRenderer, globeImg: HTMLImageElement | null): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;

  // Dark background for inside lid
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, c.width, c.height);

  // Draw globe image centered
  if (globeImg) {
    const imgSize = 200;
    const ix = (c.width - imgSize) / 2;
    const iy = 80;
    ctx.globalAlpha = 0.7;
    ctx.drawImage(globeImg, ix, iy, imgSize, imgSize);
    ctx.globalAlpha = 1;
  }

  // Khmer script: "មេហ្គា" (MEGA) + tagline
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#666';
  ctx.font = '32px serif';
  ctx.fillText('មេហ្គា', c.width / 2, 320);

  // Small "MEGA" latin text
  ctx.fillStyle = '#444';
  ctx.font = '600 14px "Bodoni Moda", serif';
  ctx.fillText('MEGA', c.width / 2, 360);

  // Khmer tagline: "ធ្វើឱ្យផែនដីអស្ចារ្យម្ដងទៀត"
  ctx.fillStyle = '#333';
  ctx.font = '16px serif';
  ctx.fillText('ធ្វើឱ្យផែនដីអស្ចារ្យម្ដងទៀត', c.width / 2, 400);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  if (renderer) {
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  }
  tex.needsUpdate = true;
  return tex;
}

export default function HatModel({
  hatColor,
  texture,
  text,
  backText,
  textColor,
  decals = [],
  onDecalUpdate,
  selectedDecalId,
  onDecalSelect,
  autoRotate = false
}: HatModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const { scene: gltfScene } = useGLTF('/models/cap.glb');

  const hatTexture = texture ? useLoader(THREE.TextureLoader, texture) : null;
  if (hatTexture) {
    hatTexture.wrapS = hatTexture.wrapT = THREE.RepeatWrapping;
    hatTexture.repeat.set(2, 2);
  }

  // Load globe image for inside lid
  const globeImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = import.meta.env.BASE_URL + 'images/planet7.png';
    img.onload = () => { globeImgRef.current = img; };
  }, []);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  const capMesh = useMemo(() => gltfScene.clone(true), [gltfScene]);

  const { center, size } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(capMesh);
    return {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
    };
  }, [capMesh]);

  const displayScale = useMemo(() => {
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? 1.6 / maxDim : 1;
  }, [size]);

  const frontTexture = useMemo(() => {
    const lines = (text || '').split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return makeTextTexture(lines, textColor, gl);
  }, [text, textColor, gl]);

  const backTexture = useMemo(() => {
    const lines = (backText || '').split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return makeTextTexture(lines, textColor, gl);
  }, [backText, textColor, gl]);

  const lidTexture = useMemo(() => {
    return makeLidTexture(gl, globeImgRef.current);
  }, [gl]);

  // Text planes sized relative to hat
  const frontW = size.x * 0.72;
  const frontH = size.y * 0.42;
  const frontGeo = useMemo(() => createCurvedPlane(frontW, frontH, size.x * 0.48), [frontW, frontH, size.x]);

  const backW = size.x * 0.55;
  const backH = size.y * 0.32;
  const backGeo = useMemo(() => createCurvedPlane(backW, backH, size.x * 0.44), [backW, backH, size.x]);

  // Apply hat color/texture to all meshes - force opaque
  useEffect(() => {
    capMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const applyMaterial = (m: THREE.Material) => {
          const mat = new THREE.MeshStandardMaterial();
          mat.color.set(hatColor);
          if (hatTexture) {
            mat.map = hatTexture;
            mat.color.set('#ffffff');
          }
          mat.roughness = 0.7;
          mat.metalness = 0.1;
          mat.transparent = false;
          mat.opacity = 1;
          mat.depthWrite = true;
          mat.side = THREE.FrontSide;
          mat.needsUpdate = true;
          return mat;
        };
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(applyMaterial);
        } else {
          mesh.material = applyMaterial(mesh.material);
        }
      }
    });
  }, [capMesh, hatColor, hatTexture]);

  const textY = center.y + size.y * 0.06;
  const frontZ = center.z + size.z * 0.38;
  const backZ = center.z - size.z * 0.38;

  const textMaterialProps = {
    transparent: true,
    alphaTest: 0.1,
    roughness: 0.65,
    metalness: 0.05,
    depthWrite: true,
    side: THREE.FrontSide as THREE.Side,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  };

  return (
    <group ref={groupRef} scale={displayScale}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={capMesh} onPointerMissed={() => onDecalSelect?.(null)} />

        {/* User decals */}
        {decals.map((decal) => (
          <DecalLayer
            key={decal.id}
            decal={decal}
            isSelected={selectedDecalId === decal.id}
            onUpdate={onDecalUpdate}
            onClick={() => {
              onDecalSelect?.(decal.id);
            }}
          />
        ))}

        {/* Front text */}
        {frontTexture && (
          <mesh
            geometry={frontGeo}
            position={[center.x, textY, frontZ]}
            rotation={[-0.06, 0, 0]}
          >
            <meshStandardMaterial map={frontTexture} {...textMaterialProps} />
          </mesh>
        )}

        {/* Back text */}
        {backTexture && (
          <mesh
            geometry={backGeo}
            position={[center.x, textY - size.y * 0.02, backZ]}
            rotation={[0.06, Math.PI, 0]}
          >
            <meshStandardMaterial map={backTexture} {...textMaterialProps} />
          </mesh>
        )}

        {/* Inside lid branding - globe + Khmer text, only visible from underneath */}
        <mesh
          position={[center.x, center.y - size.y * 0.18, center.z + size.z * 0.08]}
          rotation={[-Math.PI * 0.5, 0, 0]}
        >
          <circleGeometry args={[size.x * 0.18, 32]} />
          <meshBasicMaterial
            map={lidTexture}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload('/models/cap.glb');
