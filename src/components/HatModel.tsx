import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface HatModelProps {
  hatColor: string;
  text: string;
  backText?: string;
  textColor: string;
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

  // Size text to fit canvas with generous padding
  let fontSize = lineCount === 1
    ? (maxLen > 15 ? 180 : maxLen > 10 ? 220 : 260)
    : lineCount === 2
      ? (maxLen > 12 ? 160 : maxLen > 8 ? 200 : 240)
      : (maxLen > 10 ? 140 : 180);

  const fontStr = `900 ${fontSize}px "Bodoni Moda", "Times New Roman", serif`;
  ctx.font = fontStr;

  // Measure and scale down if needed
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

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.font = finalFont;
  lines.forEach((t, i) => ctx.fillText(t, x + 4, y0 + i * dy + 4));

  // Main text
  ctx.fillStyle = textColor;
  ctx.font = finalFont;
  lines.forEach((t, i) => ctx.fillText(t, x, y0 + i * dy));

  // Subtle embroidery noise
  const img = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] > 0) {
      const n = (Math.random() - 0.5) * 10;
      img.data[i] = Math.min(255, Math.max(0, img.data[i] + n));
      img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n));
      img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n));
    }
  }
  ctx.putImageData(img, 0, 0);

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

// Create a plane that wraps around a cylinder (front of cap)
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

    // Cylindrical wrap
    const newX = Math.sin(angle) * radius;
    const newZ = Math.cos(angle) * radius - radius;

    // Slight dome bulge for cap crown
    const ny = py / (height * 0.5);
    const dome = 0.15 * radius * (1 - ny * ny * 0.3);

    pos.setXYZ(i, newX, py, newZ + dome);
  }

  geo.computeVertexNormals();
  return geo;
}

export default function HatModel({ hatColor, text, backText, textColor, autoRotate = false }: HatModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const { scene: gltfScene } = useGLTF('/models/cap.glb');

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  const capMesh = useMemo(() => gltfScene.clone(true), [gltfScene]);

  // Bounding box of the loaded model
  const { center, size } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(capMesh);
    return {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
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

  // Text planes sized relative to hat
  const frontW = size.x * 0.72;
  const frontH = size.y * 0.42;
  const frontGeo = useMemo(() => createCurvedPlane(frontW, frontH, size.x * 0.48), [frontW, frontH, size.x]);

  const backW = size.x * 0.55;
  const backH = size.y * 0.32;
  const backGeo = useMemo(() => createCurvedPlane(backW, backH, size.x * 0.44), [backW, backH, size.x]);

  // Apply hat color to all meshes in the model
  useEffect(() => {
    capMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const applyColor = (m: THREE.Material) => {
          const mat = m.clone() as THREE.MeshStandardMaterial;
          mat.color.set(hatColor);
          mat.roughness = 0.8;
          mat.metalness = 0.0;
          mat.needsUpdate = true;
          return mat;
        };
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(applyColor);
        } else {
          mesh.material = applyColor(mesh.material);
        }
      }
    });
  }, [capMesh, hatColor]);

  const textY = center.y + size.y * 0.06;
  const frontZ = center.z + size.z * 0.38;
  const backZ = center.z - size.z * 0.38;

  const textMaterialProps = {
    transparent: true,
    alphaTest: 0.05,
    roughness: 0.65,
    metalness: 0.05,
    depthWrite: false,
    side: THREE.FrontSide as THREE.Side,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -1,
  };

  return (
    <group ref={groupRef} scale={displayScale}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={capMesh} />

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
      </group>
    </group>
  );
}

useGLTF.preload('/models/cap.glb');
