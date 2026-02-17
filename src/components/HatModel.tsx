import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, useLoader, ThreeEvent } from '@react-three/fiber';
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
  placementMode?: boolean;
  onPlacementComplete?: () => void;
  autoRotate?: boolean;
}

const MODEL_PATH = `${import.meta.env.BASE_URL}models/baseball_cap.glb`;
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const FABRIC_MATERIALS = new Set(['baseballCap', 'baseballcap', 'cap', 'hat', 'fabric']);

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
        ? 210
        : maxLen > 10
          ? 250
          : 300
      : lineCount === 2
        ? maxLen > 12
          ? 185
          : maxLen > 8
            ? 230
            : 270
        : maxLen > 10
          ? 165
          : 210;

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
  ctx.strokeStyle = textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === '#fff'
    ? 'rgba(0,0,0,0.35)'
    : 'rgba(255,255,255,0.22)';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(6, fontSize * 0.08);
  ctx.font = finalFont;
  lines.forEach((t, i) => {
    const y = y0 + i * dy;
    ctx.strokeText(t, x, y);
    ctx.fillText(t, x, y);
  });

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

function meshKey(name?: string, parentName?: string): string {
  return `${parentName || ''}::${name || ''}`;
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
  placementMode = false,
  onPlacementComplete,
  autoRotate = false,
}: HatModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const mainCapMeshRef = useRef<THREE.Mesh>(null!);
  const mainCapDecalTargetRef = useRef<THREE.Mesh>(null!);
  const { gl } = useThree();
  const { scene: gltfScene } = useGLTF(MODEL_PATH);

  const hasCustomTexture = Boolean(texture);
  const hatTexture = useLoader(THREE.TextureLoader, texture || TRANSPARENT_PIXEL);
  if (hasCustomTexture) {
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

  const meshList = useMemo(() => {
    const list: THREE.Mesh[] = [];
    capMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        list.push(child as THREE.Mesh);
      }
    });
    return list;
  }, [capMesh]);

  const decalTargetMeshMap = useMemo(() => {
    const map = new Map<string, THREE.Mesh>();

    for (const mesh of meshList) {
      const bakedGeometry = mesh.geometry.clone();
      const localToModel = new THREE.Matrix4();
      let cursor: THREE.Object3D | null = mesh;

      while (cursor && cursor !== capMesh) {
        localToModel.premultiply(cursor.matrix);
        cursor = cursor.parent;
      }

      bakedGeometry.applyMatrix4(localToModel);
      bakedGeometry.computeVertexNormals();

      const decalTarget = new THREE.Mesh(bakedGeometry, new THREE.MeshBasicMaterial());
      decalTarget.name = mesh.name;
      map.set(meshKey(mesh.name, mesh.parent?.name), decalTarget);
    }

    return map;
  }, [meshList, capMesh]);

  useEffect(() => {
    return () => {
      for (const mesh of decalTargetMeshMap.values()) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    };
  }, [decalTargetMeshMap]);

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

  const mainCapDecalTarget = useMemo(() => {
    if (!mainCapMesh) return null;
    return (
      decalTargetMeshMap.get(meshKey(mainCapMesh.name, mainCapMesh.parent?.name)) ||
      decalTargetMeshMap.get(meshKey(mainCapMesh.name, undefined)) ||
      null
    );
  }, [mainCapMesh, decalTargetMeshMap]);

  if (mainCapDecalTarget) {
    mainCapDecalTargetRef.current = mainCapDecalTarget;
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
        const fabricHint = `${materialName} ${mesh.name} ${mesh.parent?.name || ''}`.toLowerCase();
        const isFabric =
          FABRIC_MATERIALS.has(materialName) ||
          FABRIC_MATERIALS.has(materialName.toLowerCase()) ||
          fabricHint.includes('cap') ||
          fabricHint.includes('visor') ||
          fabricHint.includes('liner') ||
          fabricHint.includes('fabric');

        if (isFabric) {
          const mat = original.clone();
          mat.name = materialName;

          const isBand = mesh.parent?.name === 'innerLiner';
          mat.color.set(isBand ? (bandColor || hatColor) : hatColor);

          if (hasCustomTexture && !isBand) {
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
  }, [capMesh, hatColor, bandColor, hatTexture, hasCustomTexture]);

  const getTargetMesh = (decal: HatDecal): THREE.Mesh | null => {
    if (decal.targetMeshName) {
      const exact = decalTargetMeshMap.get(meshKey(decal.targetMeshName, decal.targetParentName));
      if (exact) return exact;

      for (const [key, targetMesh] of decalTargetMeshMap.entries()) {
        if (key.endsWith(`::${decal.targetMeshName}`)) return targetMesh;
      }
    }
    return mainCapDecalTarget;
  };

  const getHitPlacement = (event: ThreeEvent<PointerEvent>) => {
    if (!modelRef.current || !event.face || !(event.object as THREE.Mesh).isMesh) return null;

    const hitMesh = event.object as THREE.Mesh;
    const worldPoint = event.point.clone();

    const localPoint = modelRef.current.worldToLocal(worldPoint.clone());
    const worldNormal = event.face.normal.clone().transformDirection(hitMesh.matrixWorld).normalize();
    const localPointAlongNormal = modelRef.current.worldToLocal(worldPoint.clone().add(worldNormal));
    const localNormal = localPointAlongNormal.sub(localPoint).normalize();

    if (localNormal.lengthSq() < 1e-8) localNormal.set(0, 0, 1);
    const surfaceOffset = 0.0025;
    const offsetLocalPoint = localPoint.clone().addScaledVector(localNormal, surfaceOffset);

    return {
      position: [offsetLocalPoint.x, offsetLocalPoint.y, offsetLocalPoint.z] as [number, number, number],
      normal: [localNormal.x, localNormal.y, localNormal.z] as [number, number, number],
      targetMeshName: hitMesh.name || undefined,
      targetParentName: hitMesh.parent?.name || undefined,
    };
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!selectedDecalId || !onDecalUpdate) return;
    if (!placementMode) return;
    if (event.button !== 0) return;

    const placement = getHitPlacement(event);
    if (!placement) return;

    event.stopPropagation();
    onDecalSelect?.(selectedDecalId);
    onDecalUpdate(selectedDecalId, placement);
    onPlacementComplete?.();
  };

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
      <group ref={modelRef} position={[-center.x, -center.y, -center.z]}>
        <primitive
          object={capMesh}
          onPointerDown={handlePointerDown}
          onPointerMissed={() => onDecalSelect?.(null)}
        />

        {decals.map((decal) => (
          <DecalLayer
            key={decal.id}
            decal={decal}
            targetMesh={getTargetMesh(decal)}
            isSelected={selectedDecalId === decal.id}
            onClick={() => {
              onDecalSelect?.(decal.id);
            }}
          />
        ))}

        {mainCapDecalTarget && frontTexture && (
          <ProjectedDecal mesh={mainCapDecalTargetRef} position={frontTextPos} rotation={[-0.08, 0, 0]} scale={frontTextScale}>
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

        {mainCapDecalTarget && backTexture && (
          <ProjectedDecal
            mesh={mainCapDecalTargetRef}
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

        {mainCapDecalTarget && flagCode && (
          <ProjectedDecal mesh={mainCapDecalTargetRef} position={rightFlagPos} rotation={[0, Math.PI * 0.5, 0]} scale={flagScale}>
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
