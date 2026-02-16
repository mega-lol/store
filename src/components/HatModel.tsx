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
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);

  const x = c.width * 0.5;
  const lineCount = lines.length;
  const fontSize = lineCount <= 2 ? 84 : 68;
  const dy = fontSize * 1.25;
  const y0 = c.height * 0.5 - ((lineCount - 1) * dy) / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontStr = `900 ${fontSize}px "Times New Roman", "Georgia", serif`;

  // Shadow stitch
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.font = fontStr;
  lines.forEach((t, i) => ctx.fillText(t, x + 1.5, y0 + i * dy + 1.5));

  // Main stitch
  ctx.fillStyle = textColor;
  ctx.font = fontStr;
  lines.forEach((t, i) => ctx.fillText(t, x, y0 + i * dy));

  // Thread noise for embroidery effect
  const img = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] > 0) {
      const n = Math.random() * 14 - 7;
      img.data[i] = Math.min(255, Math.max(0, img.data[i] + n));
      img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n));
      img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n));
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (renderer) {
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  tex.needsUpdate = true;
  return tex;
}

function createCurvedPlane(
  width: number,
  height: number,
  curveAmount: number,
  segmentsX = 32,
  segmentsY = 16,
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const normalizedX = px / (width * 0.5);
    const z = curveAmount * (1 - normalizedX * normalizedX);
    const normalizedY = py / (height * 0.5);
    const zY = curveAmount * 0.3 * (1 - normalizedY * normalizedY);
    pos.setZ(i, z + zY);
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
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const capMesh = useMemo(() => gltfScene.clone(true), [gltfScene]);

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

  const frontGeo = useMemo(() => createCurvedPlane(1.4, 0.85, 0.18), []);
  const backGeo = useMemo(() => createCurvedPlane(1.1, 0.65, 0.14), []);

  // Apply hat color to the cap material
  useEffect(() => {
    capMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => {
            const cloned = m.clone() as THREE.MeshStandardMaterial;
            cloned.color.set(hatColor);
            cloned.roughness = 0.85;
            cloned.metalness = 0.0;
            cloned.needsUpdate = true;
            return cloned;
          });
        } else {
          const mat = mesh.material.clone() as THREE.MeshStandardMaterial;
          mat.color.set(hatColor);
          mat.roughness = 0.85;
          mat.metalness = 0.0;
          mat.needsUpdate = true;
          mesh.material = mat;
        }
      }
    });
  }, [capMesh, hatColor]);

  // Compute bounding box to center
  const capBounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(capMesh);
    return {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
    };
  }, [capMesh]);

  // Scale to normalize the model size - fit within a ~2 unit sphere
  const scale = useMemo(() => {
    const maxDim = Math.max(capBounds.size.x, capBounds.size.y, capBounds.size.z);
    return maxDim > 0 ? 2.0 / maxDim : 1;
  }, [capBounds]);

  return (
    <group ref={groupRef}>
      <primitive
        object={capMesh}
        scale={scale}
        position={[
          -capBounds.center.x * scale,
          -capBounds.center.y * scale - 0.1,
          -capBounds.center.z * scale,
        ]}
      />

      {/* Front text - curved */}
      {frontTexture && (
        <mesh geometry={frontGeo} position={[0, 0.25, 0.85]} rotation={[-0.1, 0, 0]}>
          <meshStandardMaterial
            map={frontTexture}
            transparent
            roughness={0.75}
            metalness={0.0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Back text - curved */}
      {backTexture && (
        <mesh geometry={backGeo} position={[0, 0.25, -0.85]} rotation={[0.1, Math.PI, 0]}>
          <meshStandardMaterial
            map={backTexture}
            transparent
            roughness={0.75}
            metalness={0.0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Side emblem */}
      <SideEmblem />
    </group>
  );
}

function SideEmblem() {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/images/planet7.png');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <mesh position={[0.9, 0.3, 0.1]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[0.35, 0.35]} />
      <meshStandardMaterial map={texture} transparent roughness={0.8} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

useGLTF.preload('/models/cap.glb');
