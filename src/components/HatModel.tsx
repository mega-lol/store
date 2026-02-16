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

const MODEL_PATH = '/models/baseball_cap.glb';

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

// Curved plane that wraps around the front of the cap
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
    const dome = 0.12 * radius * (1 - ny * ny * 0.3);

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

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, c.width, c.height);

  if (globeImg) {
    const imgSize = 180;
    const ix = (c.width - imgSize) / 2;
    ctx.globalAlpha = 0.6;
    ctx.drawImage(globeImg, ix, 80, imgSize, imgSize);
    ctx.globalAlpha = 1;
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#555';
  ctx.font = '28px serif';
  ctx.fillText('មេហ្គា', c.width / 2, 310);

  ctx.fillStyle = '#444';
  ctx.font = '600 12px "Bodoni Moda", serif';
  ctx.fillText('MEGA', c.width / 2, 345);

  ctx.fillStyle = '#333';
  ctx.font = '14px serif';
  ctx.fillText('ធ្វើឱ្យផែនដីអស្ចារ្យម្ដងទៀត', c.width / 2, 385);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  if (renderer) {
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  }
  tex.needsUpdate = true;
  return tex;
}

// Fabric material names from the GLB that should be recolored
const FABRIC_MATERIALS = new Set(['baseballCap']);

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
  const { scene: gltfScene } = useGLTF(MODEL_PATH);

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
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const capMesh = useMemo(() => gltfScene.clone(true), [gltfScene]);

  const { center, size, mcCenter, mcSize, mcFrontZ, mcBackZ } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(capMesh);
    // Find mainCap group node for precise text placement (excludes bill, straps)
    let mc: THREE.Box3 = box;
    capMesh.traverse((child) => {
      if (child.name === 'mainCap') {
        mc = new THREE.Box3().setFromObject(child);
      }
    });
    const mcc = mc.getCenter(new THREE.Vector3());
    const mcs = mc.getSize(new THREE.Vector3());
    return {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
      mcCenter: mcc,
      mcSize: mcs,
      mcFrontZ: mc.max.z,
      mcBackZ: mc.min.z,
    };
  }, [capMesh]);

  // Normalize so hat fills ~1.6 units
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

  // Text planes sized relative to mainCap bounding box
  const frontW = mcSize.x * 0.62;
  const frontH = mcSize.y * 0.34;
  const frontR = mcSize.x * 0.48;
  const frontGeo = useMemo(() => createCurvedPlane(frontW, frontH, frontR), [frontW, frontH, frontR]);

  const backW = mcSize.x * 0.48;
  const backH = mcSize.y * 0.26;
  const backR = mcSize.x * 0.40;
  const backGeo = useMemo(() => createCurvedPlane(backW, backH, backR), [backW, backH, backR]);

  // Apply hat color to fabric meshes, keep hardware parts (plastic, metal) original
  useEffect(() => {
    capMesh.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      const remat = (m: THREE.Material) => {
        const orig = m as THREE.MeshStandardMaterial;
        const isFabric = FABRIC_MATERIALS.has(orig.name || m.name || '');

        if (isFabric) {
          const mat = new THREE.MeshStandardMaterial();
          mat.color.set(hatColor);
          if (hatTexture) {
            mat.map = hatTexture;
            mat.color.set('#ffffff');
          }
          mat.roughness = 0.75;
          mat.metalness = 0.05;
          mat.transparent = false;
          mat.opacity = 1;
          mat.depthWrite = true;
          mat.side = THREE.FrontSide;
          mat.needsUpdate = true;
          return mat;
        }

        // Non-fabric: keep original but ensure opaque
        const mat = orig.clone();
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
        mat.needsUpdate = true;
        return mat;
      };

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(remat);
      } else {
        mesh.material = remat(mesh.material);
      }
    });
  }, [capMesh, hatColor, hatTexture]);

  // Text positioning from mainCap bounding box (not the full scene with bill/straps)
  const textY = mcCenter.y + mcSize.y * 0.12;
  const frontZ = mcFrontZ + mcSize.z * 0.01;  // just in front of cap surface
  const backZ = mcBackZ - mcSize.z * 0.01;    // just behind back surface

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
            position={[mcCenter.x, textY, frontZ]}
            rotation={[-0.08, 0, 0]}
          >
            <meshStandardMaterial map={frontTexture} {...textMaterialProps} />
          </mesh>
        )}

        {/* Back text */}
        {backTexture && (
          <mesh
            geometry={backGeo}
            position={[mcCenter.x, textY - mcSize.y * 0.03, backZ]}
            rotation={[0.08, Math.PI, 0]}
          >
            <meshStandardMaterial map={backTexture} {...textMaterialProps} />
          </mesh>
        )}

        {/* Inside lid branding - only visible from underneath */}
        <mesh
          position={[mcCenter.x, mcCenter.y - mcSize.y * 0.15, mcCenter.z]}
          rotation={[-Math.PI * 0.5, 0, 0]}
        >
          <circleGeometry args={[mcSize.x * 0.15, 32]} />
          <meshBasicMaterial
            map={lidTexture}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
