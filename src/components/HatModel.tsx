import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { useGLTF, Decal as ProjectedDecal } from '@react-three/drei';
import * as THREE from 'three';
import { Decal as HatDecal } from '@/types/hat';
import { toFontStack } from '@/lib/fonts';
import DecalLayer from './DecalLayer';

interface HatModelProps {
  hatColor: string;
  bandColor?: string;
  texture?: string;
  text: string;
  backText?: string;
  textColor: string;
  fontFamily?: string;
  flagCode?: string;
  decals?: HatDecal[];
  onDecalUpdate?: (id: string, updates: Partial<HatDecal>) => void;
  selectedDecalId?: string;
  onDecalSelect?: (id: string | null) => void;
  autoRotate?: boolean;
}

const MODEL_PATH = `${import.meta.env.BASE_URL}models/baseball_cap.glb`;
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const FABRIC_MATERIALS = new Set(['baseballCap']);

function makeTextTexture(
  lines: string[],
  textColor: string,
  renderer: THREE.WebGLRenderer,
  fontFamily?: string,
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);

  const x = c.width * 0.5;
  const lineCount = lines.length;
  const maxLen = Math.max(...lines.map((l) => l.length));

  let fontSize =
    lineCount === 1
      ? maxLen > 15
        ? 180
        : maxLen > 10
          ? 220
          : 260
      : lineCount === 2
        ? maxLen > 12
          ? 160
          : maxLen > 8
            ? 200
            : 240
        : maxLen > 10
          ? 140
          : 180;

  const fontStack = toFontStack(fontFamily);

  const fontStr = `900 ${fontSize}px ${fontStack}`;
  ctx.font = fontStr;

  const widest = lines.reduce((a, b) => (a.length > b.length ? a : b));
  const measured = ctx.measureText(widest).width;
  if (measured > c.width * 0.85) {
    fontSize = Math.floor((fontSize * (c.width * 0.85)) / measured);
  }

  const finalFont = `900 ${fontSize}px ${fontStack}`;
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
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  tex.needsUpdate = true;
  return tex;
}

export default function HatModel({
  hatColor,
  bandColor,
  texture,
  text,
  backText,
  textColor,
  fontFamily,
  flagCode,
  decals = [],
  onDecalUpdate,
  selectedDecalId,
  onDecalSelect,
  autoRotate = false,
}: HatModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mainCapMeshRef = useRef<THREE.Mesh>(null!);
  const { gl } = useThree();
  const { scene: gltfScene } = useGLTF(MODEL_PATH);

  const hatTexture = texture ? useLoader(THREE.TextureLoader, texture) : null;
  if (hatTexture) {
    hatTexture.wrapS = hatTexture.wrapT = THREE.RepeatWrapping;
    hatTexture.repeat.set(2, 2);
    hatTexture.colorSpace = THREE.SRGBColorSpace;
  }

  const flagTextureUrl = flagCode ? `https://flagcdn.com/w80/${flagCode.toLowerCase()}.png` : TRANSPARENT_PIXEL;
  const flagTexture = useLoader(THREE.TextureLoader, flagTextureUrl);

  useEffect(() => {
    flagTexture.colorSpace = THREE.SRGBColorSpace;
    flagTexture.wrapS = THREE.ClampToEdgeWrapping;
    flagTexture.wrapT = THREE.ClampToEdgeWrapping;
    flagTexture.needsUpdate = true;
  }, [flagTexture]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const capMesh = useMemo(() => gltfScene.clone(true), [gltfScene]);
  const mainCapMesh = useMemo(() => {
    let target: THREE.Mesh | null = null;
    let fallback: THREE.Mesh | null = null;

    capMesh.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      if (!fallback) fallback = mesh;

      if (!target && mesh.parent?.name === 'mainCap') {
        target = mesh;
      }
    });

    return target || fallback;
  }, [capMesh]);

  if (mainCapMesh) {
    mainCapMeshRef.current = mainCapMesh;
  }

  const { center, size, mcCenter, mcSize, mcFrontZ, mcBackZ } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(capMesh);
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

  const displayScale = useMemo(() => {
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? 1.6 / maxDim : 1;
  }, [size]);

  const frontTexture = useMemo(() => {
    const lines = (text || '').split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return makeTextTexture(lines, textColor, gl, fontFamily);
  }, [text, textColor, gl, fontFamily]);

  const backTexture = useMemo(() => {
    const lines = (backText || '').split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return makeTextTexture(lines, textColor, gl, fontFamily);
  }, [backText, textColor, gl, fontFamily]);

  useEffect(() => {
    capMesh.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      const remat = (material: THREE.Material) => {
        const original = material as THREE.MeshStandardMaterial;
        const materialName = original.name || material.name || '';
        const isFabric = FABRIC_MATERIALS.has(materialName);

        if (isFabric) {
          const mat = original.clone();
          mat.name = materialName;

          const isBand = mesh.parent?.name === 'innerLiner';
          mat.color.set(isBand ? (bandColor || hatColor) : hatColor);

          if (hatTexture && !isBand) {
            mat.map = hatTexture;
            mat.color.set('#ffffff');
          }

          mat.roughness = 0.78;
          mat.metalness = 0.05;
          mat.transparent = false;
          mat.opacity = 1;
          mat.depthWrite = true;
          mat.side = THREE.FrontSide;
          mat.needsUpdate = true;
          return mat;
        }

        const mat = original.clone();
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
  }, [capMesh, hatColor, bandColor, hatTexture]);

  const textY = mcCenter.y + mcSize.y * 0.12;
  const frontTextPos: [number, number, number] = [mcCenter.x, textY, mcFrontZ + mcSize.z * 0.008];
  const backTextPos: [number, number, number] = [mcCenter.x, textY - mcSize.y * 0.03, mcBackZ - mcSize.z * 0.008];
  const rightFlagPos: [number, number, number] = [
    mcCenter.x + mcSize.x * 0.29,
    mcCenter.y + mcSize.y * 0.03,
    mcCenter.z + mcSize.z * 0.04,
  ];

  const frontTextScale: [number, number, number] = [mcSize.x * 0.62, mcSize.y * 0.34, Math.max(mcSize.z * 0.42, 0.08)];
  const backTextScale: [number, number, number] = [mcSize.x * 0.48, mcSize.y * 0.26, Math.max(mcSize.z * 0.34, 0.07)];
  const flagScale: [number, number, number] = [mcSize.x * 0.22, mcSize.y * 0.14, Math.max(mcSize.z * 0.25, 0.06)];

  return (
    <group ref={groupRef} scale={displayScale}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={capMesh} onPointerMissed={() => onDecalSelect?.(null)} />

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

        {mainCapMesh && frontTexture && (
          <ProjectedDecal mesh={mainCapMeshRef} position={frontTextPos} rotation={[-0.08, 0, 0]} scale={frontTextScale}>
            <meshStandardMaterial
              map={frontTexture}
              transparent
              alphaTest={0.08}
              depthTest
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
              roughness={0.65}
              metalness={0.05}
            />
          </ProjectedDecal>
        )}

        {mainCapMesh && backTexture && (
          <ProjectedDecal
            mesh={mainCapMeshRef}
            position={backTextPos}
            rotation={[0.08, Math.PI, 0]}
            scale={backTextScale}
          >
            <meshStandardMaterial
              map={backTexture}
              transparent
              alphaTest={0.08}
              depthTest
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
              roughness={0.65}
              metalness={0.05}
            />
          </ProjectedDecal>
        )}

        {mainCapMesh && flagCode && (
          <ProjectedDecal mesh={mainCapMeshRef} position={rightFlagPos} rotation={[0, Math.PI * 0.5, 0]} scale={flagScale}>
            <meshStandardMaterial
              map={flagTexture}
              transparent
              alphaTest={0.03}
              depthTest
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
              roughness={0.7}
              metalness={0.03}
            />
          </ProjectedDecal>
        )}
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
