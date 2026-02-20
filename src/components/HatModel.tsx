import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree, useLoader, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Decal as ProjectedDecal } from '@react-three/drei';
import * as THREE from 'three';
import { Canvas as FabricCanvas } from 'fabric';
import { Decal as HatDecal, TextStyle } from '@/types/hat';
import { toFontStack } from '@/lib/fonts';
import DecalLayer from './DecalLayer';
import FabricTextureLayer from './FabricTextureLayer';
import useUvPointerBridge from '@/hooks/useUvPointerBridge';

interface HatModelProps {
  hatColor: string;
  bandColor?: string;
  texture?: string;
  text: string;
  backText?: string;
  brimText?: string;
  textColor: string;
  textStyle?: TextStyle;
  fontFamily?: string;
  flagCode?: string;
  decals?: HatDecal[];
  onDecalUpdate?: (id: string, updates: Partial<HatDecal>) => void;
  selectedDecalId?: string;
  onDecalSelect?: (id: string | null) => void;
  placementMode?: boolean;
  onPlacementComplete?: () => void;
  autoRotate?: boolean;
  fabricCanvas?: FabricCanvas | null;
  onEditingSurface?: (editing: boolean) => void;
}

const MODEL_PATH = `${import.meta.env.BASE_URL}models/baseball_cap.glb`;
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const FABRIC_MATERIALS = new Set(['baseballCap', 'baseballcap', 'cap', 'hat', 'fabric']);

function drawEmbroideryStitch(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string,
) {
  const offsets = [
    { dx: 0, dy: -1.5, alpha: 0.3 },
    { dx: -1, dy: -1, alpha: 0.2 },
    { dx: 1, dy: -1, alpha: 0.2 },
    { dx: 0, dy: 1.5, alpha: 0.15 },
  ];

  for (const { dx, dy, alpha } of offsets) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x + dx, y + dy);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawGoldEmbroidery(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
) {
  const goldGrad = ctx.createLinearGradient(0, y - fontSize * 0.6, 0, y + fontSize * 0.6);
  goldGrad.addColorStop(0, '#FFE850');
  goldGrad.addColorStop(0.15, '#FFD000');
  goldGrad.addColorStop(0.35, '#E8A000');
  goldGrad.addColorStop(0.5, '#FFD000');
  goldGrad.addColorStop(0.65, '#CC8800');
  goldGrad.addColorStop(0.85, '#FFD000');
  goldGrad.addColorStop(1, '#FFE850');

  for (let i = 5; i >= 1; i--) {
    ctx.globalAlpha = 0.3 + (5 - i) * 0.06;
    ctx.fillStyle = '#1A0E00';
    ctx.fillText(text, x + i * 0.5, y + i * 1.4);
  }

  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#3D2200';
  ctx.fillText(text, x + 1.5, y + fontSize * 0.05);
  ctx.fillText(text, x + 1, y + fontSize * 0.07);

  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#000000';
  for (let sdy = -2; sdy <= 2; sdy += 2) {
    for (let sdx = -2; sdx <= 2; sdx += 2) {
      if (sdx === 0 && sdy === 0) continue;
      ctx.fillText(text, x + sdx, y + sdy);
    }
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = goldGrad;
  ctx.fillText(text, x, y);
  ctx.fillText(text, x, y);

  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#FFD700';
  ctx.fillText(text, x, y);

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#FFF8C0';
  ctx.fillText(text, x, y - fontSize * 0.025);

  ctx.save();
  ctx.globalAlpha = 0.3;
  const shineGrad = ctx.createLinearGradient(0, y - fontSize * 0.2, 0, y + fontSize * 0.1);
  shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
  shineGrad.addColorStop(0.35, 'rgba(255,255,220,0.9)');
  shineGrad.addColorStop(0.55, 'rgba(255,240,160,0.6)');
  shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shineGrad;
  ctx.fillText(text, x, y);
  ctx.restore();

  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = '#9B7018';
  ctx.lineWidth = Math.max(2.5, fontSize * 0.018);
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y);
  ctx.globalAlpha = 1;
}

function draw3DPuff(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string,
) {
  for (let i = 6; i >= 1; i--) {
    ctx.globalAlpha = 0.15 + (6 - i) * 0.05;
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x, y + i * 1.5);
  }

  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#222222';
  for (let i = 3; i >= 1; i--) {
    ctx.fillText(text, x + i * 0.5, y + i * 1.2);
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y - fontSize * 0.02);
  ctx.globalAlpha = 1;
}

function makeTextTexture(
  lines: string[],
  textColor: string,
  renderer: THREE.WebGLRenderer,
  fontFamily?: string,
  textStyle: TextStyle = 'flat',
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
        ? 260
        : maxLen > 10
          ? 310
          : 380
      : lineCount === 2
        ? maxLen > 12
          ? 235
          : maxLen > 8
            ? 290
            : 340
        : maxLen > 10
          ? 210
          : 265;

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
  ctx.font = finalFont;

  lines.forEach((t, i) => {
    const y = y0 + i * dy;

    if (textStyle === 'gold-embroidery') {
      drawGoldEmbroidery(ctx, t, x, y, fontSize);
    } else if (textStyle === 'embroidery') {
      drawEmbroideryStitch(ctx, t, x, y, fontSize, textColor);
    } else if (textStyle === 'puff-3d') {
      draw3DPuff(ctx, t, x, y, fontSize, textColor);
    } else {
      ctx.fillStyle = textColor;
      ctx.strokeStyle = textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === '#fff'
        ? 'rgba(0,0,0,0.35)'
        : 'rgba(255,255,255,0.22)';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(6, fontSize * 0.08);
      ctx.strokeText(t, x, y);
      ctx.fillText(t, x, y);
    }
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  tex.needsUpdate = true;
  return tex;
}

function drawLaurelBranch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  branchLen: number,
  leafSize: number,
  mirror: boolean,
  color: string,
) {
  ctx.save();
  const dir = mirror ? -1 : 1;

  // Rich gold gradient for leaves
  const leafGrad = ctx.createLinearGradient(cx - leafSize, cy - leafSize, cx + leafSize, cy + leafSize);
  leafGrad.addColorStop(0, '#FFE850');
  leafGrad.addColorStop(0.2, '#E8A000');
  leafGrad.addColorStop(0.5, '#D4960A');
  leafGrad.addColorStop(0.8, '#E8A000');
  leafGrad.addColorStop(1, '#FFE850');

  // Draw thick curved stem
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(
    cx + dir * branchLen * 0.5, cy - branchLen * 0.12,
    cx + dir * branchLen, cy - branchLen * 0.06,
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(4, leafSize * 0.15);
  ctx.globalAlpha = 0.9;
  ctx.stroke();

  // Draw many large leaves along the branch
  const leafCount = 9;
  for (let i = 0; i < leafCount; i++) {
    const t = (i + 0.5) / leafCount;
    // Position along branch curve
    const bx = cx + dir * branchLen * t;
    const by = cy - branchLen * 0.12 * Math.sin(t * Math.PI * 0.8);

    // Alternating up/down leaves
    const upDown = i % 2 === 0 ? -1 : 1;
    const angle = dir * (-0.2 + t * 0.4) + upDown * 0.55;
    const lSize = leafSize * (0.85 + (1 - t) * 0.4);

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(angle);

    // Large pointed leaf shape
    ctx.beginPath();
    ctx.ellipse(0, 0, lSize * 0.4, lSize * 1.0, 0, 0, Math.PI * 2);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = leafGrad;
    ctx.fill();

    // Bold leaf outline
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#9B7018';
    ctx.lineWidth = Math.max(2, lSize * 0.08);
    ctx.stroke();

    // Center vein
    ctx.beginPath();
    ctx.moveTo(0, -lSize * 0.8);
    ctx.lineTo(0, lSize * 0.8);
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#9B7018';
    ctx.lineWidth = Math.max(1.5, lSize * 0.06);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

function drawTextOnArc(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  fontSize: number,
  textColor: string,
  textStyle: TextStyle,
  fontStack: string,
) {
  ctx.font = `900 ${fontSize}px ${fontStack}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Measure total text width to compute angular span
  const totalWidth = ctx.measureText(text).width;
  const totalAngle = totalWidth / radius;
  const startAngle = Math.PI / 2 + totalAngle / 2; // start from left, centered

  // Draw each character along the arc
  let currentAngle = startAngle;
  for (const char of text) {
    const charWidth = ctx.measureText(char).width;
    currentAngle -= charWidth / (2 * radius);

    const x = cx + radius * Math.cos(currentAngle);
    const y = cy - radius * Math.sin(currentAngle);
    const rotation = -(currentAngle - Math.PI / 2);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    if (textStyle === 'gold-embroidery') {
      drawGoldEmbroidery(ctx, char, 0, 0, fontSize);
    } else if (textStyle === 'embroidery') {
      drawEmbroideryStitch(ctx, char, 0, 0, fontSize, textColor);
    } else if (textStyle === 'puff-3d') {
      draw3DPuff(ctx, char, 0, 0, fontSize, textColor);
    } else {
      ctx.fillStyle = textColor;
      ctx.fillText(char, 0, 0);
    }

    ctx.restore();
    currentAngle -= charWidth / (2 * radius);
  }

  return { totalAngle, startAngle };
}

function makeLaurelTexture(
  renderer: THREE.WebGLRenderer,
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);

  const cx = c.width * 0.5;
  const cy = c.height * 0.48;
  // Very large prominent branches spanning most of the brim width
  const branchLen = c.width * 0.42;
  const leafSize = 85;

  // Left laurel branch - starts from center, extends to far left
  drawLaurelBranch(ctx, cx, cy, branchLen, leafSize, true, '#B8860B');
  // Right laurel branch - starts from center, extends to far right
  drawLaurelBranch(ctx, cx, cy, branchLen, leafSize, false, '#B8860B');

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
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
  brimText,
  textColor,
  textStyle = 'flat',
  fontFamily,
  flagCode,
  decals = [],
  onDecalUpdate,
  selectedDecalId,
  onDecalSelect,
  placementMode = false,
  onPlacementComplete,
  autoRotate = false,
  fabricCanvas,
  onEditingSurface,
}: HatModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const mainCapMeshRef = useRef<THREE.Mesh>(null!);
  const mainCapDecalTargetRef = useRef<THREE.Mesh>(null!);
  const billDecalTargetRef = useRef<THREE.Mesh>(null!);
  const { gl } = useThree();
  const { scene: gltfScene } = useGLTF(MODEL_PATH);

  // Font readiness: re-trigger texture creation once fonts are loaded
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // Load Khmer brim text image for direct projection onto bill
  const khmerBrimUrl = `${import.meta.env.BASE_URL}images/khmer_brim_text.png`;
  const khmerBrimTex = useLoader(THREE.TextureLoader, brimText ? khmerBrimUrl : TRANSPARENT_PIXEL);
  useEffect(() => {
    if (!brimText) return;
    khmerBrimTex.colorSpace = THREE.SRGBColorSpace;
    khmerBrimTex.wrapS = THREE.ClampToEdgeWrapping;
    khmerBrimTex.wrapT = THREE.ClampToEdgeWrapping;
    khmerBrimTex.generateMipmaps = true;
    khmerBrimTex.minFilter = THREE.LinearMipmapLinearFilter;
    khmerBrimTex.magFilter = THREE.LinearFilter;
    khmerBrimTex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    khmerBrimTex.needsUpdate = true;
  }, [khmerBrimTex, gl, brimText]);

  const useFabricTexture = Boolean(fabricCanvas);
  const hasCustomTexture = Boolean(texture);
  const hatTexture = useLoader(THREE.TextureLoader, texture || TRANSPARENT_PIXEL);
  if (hasCustomTexture) {
    hatTexture.wrapS = hatTexture.wrapT = THREE.RepeatWrapping;
    hatTexture.repeat.set(2, 2);
    hatTexture.colorSpace = THREE.SRGBColorSpace;
  }

  const flagTextureUrl = flagCode ? `https://flagcdn.com/w160/${flagCode.toLowerCase()}.png` : TRANSPARENT_PIXEL;
  const flagTexture = useLoader(THREE.TextureLoader, flagTextureUrl);

  useEffect(() => {
    flagTexture.colorSpace = THREE.SRGBColorSpace;
    flagTexture.wrapS = THREE.ClampToEdgeWrapping;
    flagTexture.wrapT = THREE.ClampToEdgeWrapping;
    flagTexture.generateMipmaps = true;
    flagTexture.minFilter = THREE.LinearMipmapLinearFilter;
    flagTexture.magFilter = THREE.LinearFilter;
    flagTexture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    flagTexture.needsUpdate = true;
  }, [flagTexture, gl]);

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

  // Find the bill/visor mesh for brim text
  const billMesh = useMemo(() => {
    let target: THREE.Mesh | null = null;
    capMesh.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      if (!target && mesh.parent?.name === 'bill') {
        target = mesh;
      }
    });
    return target;
  }, [capMesh]);

  const billDecalTarget = useMemo(() => {
    if (!billMesh) return null;
    return (
      decalTargetMeshMap.get(meshKey(billMesh.name, billMesh.parent?.name)) ||
      decalTargetMeshMap.get(meshKey(billMesh.name, undefined)) ||
      null
    );
  }, [billMesh, decalTargetMeshMap]);

  if (billDecalTarget) {
    billDecalTargetRef.current = billDecalTarget;
  }

  const { center, size, mcCenter, mcSize, mcFrontZ, mcBackZ, billCenter, billSize } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(capMesh);
    let mc: THREE.Box3 = box;
    let bl: THREE.Box3 | null = null;

    capMesh.traverse((child) => {
      if (child.name === 'mainCap') {
        mc = new THREE.Box3().setFromObject(child);
      }
      if (child.name === 'bill') {
        bl = new THREE.Box3().setFromObject(child);
      }
    });

    const mcc = mc.getCenter(new THREE.Vector3());
    const mcs = mc.getSize(new THREE.Vector3());
    const blc = bl ? (bl as THREE.Box3).getCenter(new THREE.Vector3()) : mcc;
    const bls = bl ? (bl as THREE.Box3).getSize(new THREE.Vector3()) : mcs;

    const result = {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
      mcCenter: mcc,
      mcSize: mcs,
      mcFrontZ: mc.max.z,
      mcBackZ: mc.min.z,
      billCenter: blc,
      billSize: bls,
    };

    return result;
  }, [capMesh]);

  const displayScale = useMemo(() => {
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? 1.6 / maxDim : 1;
  }, [size]);

  // Front text projected decal - only when NOT using Fabric
  const frontTexture = useMemo(() => {
    if (useFabricTexture) return null;
    const lines = (text || '').split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return makeTextTexture(lines, textColor, gl, fontFamily, textStyle);
  }, [text, textColor, gl, fontFamily, textStyle, useFabricTexture, fontsReady]);

  // Back text still uses projected decal
  const backTexture = useMemo(() => {
    const lines = (backText || '').split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return makeTextTexture(lines, textColor, gl, fontFamily, textStyle);
  }, [backText, textColor, gl, fontFamily, textStyle, fontsReady]);

  // Brim laurel leaves overlay (Khmer text is a separate image decal)
  const brimTexture = useMemo(() => {
    if (!brimText) return null;
    return makeLaurelTexture(gl);
  }, [brimText, gl]);

  // Dispose textures on change/unmount
  useEffect(() => {
    return () => { frontTexture?.dispose(); };
  }, [frontTexture]);

  useEffect(() => {
    return () => { backTexture?.dispose(); };
  }, [backTexture]);

  useEffect(() => {
    return () => { brimTexture?.dispose(); };
  }, [brimTexture]);

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
          const isMainCap = mesh.parent?.name === 'mainCap' || mesh === mainCapMesh;

          // When Fabric texture is active on mainCap, don't set hat color -
          // the Fabric canvas background provides it
          if (useFabricTexture && isMainCap && !isBand) {
            mat.color.set('#ffffff');
          } else {
            mat.color.set(isBand ? (bandColor || hatColor) : hatColor);
          }

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
  }, [capMesh, hatColor, bandColor, hatTexture, hasCustomTexture, useFabricTexture, mainCapMesh]);

  // UV pointer bridge for Fabric interaction
  const uvBridge = useUvPointerBridge({
    fabricCanvas: fabricCanvas || null,
    onFabricHit: onEditingSurface,
  });

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
    // Try Fabric UV bridge first
    if (useFabricTexture && event.uv) {
      uvBridge.onPointerDown(event);
      if (event.stopped) return;
    }

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

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (useFabricTexture) {
      uvBridge.onPointerMove(event);
    }
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (useFabricTexture) {
      uvBridge.onPointerUp(event);
    }
  };

  const textY = mcCenter.y + mcSize.y * 0.08;
  const frontTextPos: [number, number, number] = [mcCenter.x, textY, mcFrontZ + mcSize.z * 0.012];
  const backTextPos: [number, number, number] = [mcCenter.x, textY - mcSize.y * 0.03, mcBackZ - mcSize.z * 0.008];
  const rightFlagPos: [number, number, number] = [
    mcCenter.x + mcSize.x * 0.29,
    mcCenter.y + mcSize.y * 0.03,
    mcCenter.z + mcSize.z * 0.04,
  ];

  const frontTextScale: [number, number, number] = [mcSize.x * 0.9, mcSize.y * 0.55, Math.max(mcSize.z * 0.8, 80)];
  const backTextScale: [number, number, number] = [mcSize.x * 0.58, mcSize.y * 0.32, Math.max(mcSize.z * 0.5, 40)];
  const flagWidth = mcSize.x * 0.22;
  const flagImage = flagTexture?.image as { width?: number; height?: number } | undefined;
  const flagAspect =
    flagImage &&
    typeof flagImage.width === 'number' &&
    typeof flagImage.height === 'number' &&
    flagImage.width > 0
      ? flagImage.height / flagImage.width
      : 0.75;
  const flagHeight = flagWidth * flagAspect;
  const flagScale: [number, number, number] = [flagWidth, flagHeight, Math.max(mcSize.z * 0.25, 25)];

  // Brim laurel positioning - projected DOWNWARD onto the bill/visor top surface
  // Position at bill center; projection depth must fully encompass bill thickness
  const brimTextPos: [number, number, number] = [
    billCenter.x,
    billCenter.y,
    billCenter.z + billSize.z * 0.08,
  ];
  // Full brim coverage for prominent laurels (matching spec)
  const brimW = billSize.x * 1.1;
  const brimH = brimW * 0.5;
  const brimTextScale: [number, number, number] = [brimW, brimH, Math.max(billSize.y * 2.5, 150)];

  return (
    <group ref={groupRef} scale={displayScale}>
      <group ref={modelRef} position={[-center.x, -center.y, -center.z]}>
        <primitive
          object={capMesh}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerMissed={() => onDecalSelect?.(null)}
        />

        {/* Fabric.js texture layer - applied to mainCap mesh */}
        {useFabricTexture && mainCapMesh && fabricCanvas && (
          <FabricTextureLayer
            fabricCanvas={fabricCanvas}
            targetMesh={mainCapMesh}
          />
        )}

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

        {/* Front text - only when NOT using Fabric texture */}
        {!useFabricTexture && mainCapDecalTarget && frontTexture && (
          <ProjectedDecal mesh={mainCapDecalTargetRef} position={frontTextPos} rotation={[-0.18, 0, 0]} scale={frontTextScale}>
            <meshStandardMaterial
              map={frontTexture}
              transparent
              alphaTest={0.08}
              depthTest
              depthWrite={false}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
              roughness={textStyle === 'gold-embroidery' ? 0.18 : textStyle === 'puff-3d' ? 0.45 : 0.65}
              metalness={textStyle === 'gold-embroidery' ? 0.85 : textStyle === 'puff-3d' ? 0.15 : 0.05}
              emissive={textStyle === 'gold-embroidery' ? '#6B4500' : '#000000'}
              emissiveIntensity={textStyle === 'gold-embroidery' ? 0.35 : 0}
            />
          </ProjectedDecal>
        )}

        {/* Back text - always projected decal */}
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
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
              roughness={textStyle === 'gold-embroidery' ? 0.18 : textStyle === 'puff-3d' ? 0.45 : 0.65}
              metalness={textStyle === 'gold-embroidery' ? 0.85 : textStyle === 'puff-3d' ? 0.15 : 0.05}
              emissive={textStyle === 'gold-embroidery' ? '#6B4500' : '#000000'}
              emissiveIntensity={textStyle === 'gold-embroidery' ? 0.35 : 0}
            />
          </ProjectedDecal>
        )}

        {/* Gold laurel leaves on brim - project DOWNWARD onto bill top surface */}
        {billDecalTarget && brimTexture && (
          <ProjectedDecal
            mesh={billDecalTargetRef}
            position={brimTextPos}
            rotation={[Math.PI / 2, 0, 0]}
            scale={brimTextScale}
          >
            <meshStandardMaterial
              map={brimTexture}
              transparent
              alphaTest={0.06}
              depthTest
              depthWrite={false}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={-2.5}
              polygonOffsetUnits={-2.5}
              roughness={0.18}
              metalness={0.85}
              emissive="#6B4500"
              emissiveIntensity={0.35}
            />
          </ProjectedDecal>
        )}

        {/* Khmer brim text image - project DOWNWARD onto front of bill */}
        {billDecalTarget && brimText && (
          <ProjectedDecal
            mesh={billDecalTargetRef}
            position={[billCenter.x, billCenter.y, billCenter.z + billSize.z * 0.18]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[billSize.x * 0.75, billSize.x * 0.2, Math.max(billSize.y * 3, 200)]}
          >
            <meshStandardMaterial
              map={khmerBrimTex}
              transparent
              alphaTest={0.06}
              depthTest
              depthWrite={false}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={-3}
              polygonOffsetUnits={-3}
              roughness={0.18}
              metalness={0.85}
              emissive="#6B4500"
              emissiveIntensity={0.35}
            />
          </ProjectedDecal>
        )}

        {/* Flag - always projected decal */}
        {mainCapDecalTarget && flagCode && (
          <ProjectedDecal mesh={mainCapDecalTargetRef} position={rightFlagPos} rotation={[0, Math.PI * 0.5, 0]} scale={flagScale}>
            <meshStandardMaterial
              map={flagTexture}
              transparent
              alphaTest={0.03}
              depthTest
              depthWrite={false}
              side={THREE.FrontSide}
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
