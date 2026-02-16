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

// Canvas texture for embroidery-style text
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

// Create a curved geometry that follows the hat crown shape
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
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Curve forward based on distance from center (cylindrical wrap)
    const normalizedX = x / (width * 0.5);
    const z = curveAmount * (1 - normalizedX * normalizedX);
    // Slight vertical curve too (dome shape)
    const normalizedY = y / (height * 0.5);
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

  // Clone the scene so we can modify materials independently
  const capMesh = useMemo(() => {
    return gltfScene.clone(true);
  }, [gltfScene]);

  // Front text texture
  const frontTexture = useMemo(() => {
    const lines = (text || '').split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return makeTextTexture(lines, textColor, gl);
  }, [text, textColor, gl]);

  // Back text texture
  const backTexture = useMemo(() => {
    const lines = (backText || '').split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return makeTextTexture(lines, textColor, gl);
  }, [backText, textColor, gl]);

  // Curved geometry for front text
  const frontGeo = useMemo(() => createCurvedPlane(1.5, 0.9, 0.15), []);
  // Curved geometry for back text
  const backGeo = useMemo(() => createCurvedPlane(1.2, 0.7, 0.12), []);

  // Apply hat color to all cap materials
  useEffect(() => {
    capMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => {
            const cloned = m.clone() as THREE.MeshStandardMaterial;
            cloned.color.set(hatColor);
            cloned.roughness = 0.88;
            cloned.metalness = 0.0;
            cloned.needsUpdate = true;
            return cloned;
          });
        } else {
          const mat = mesh.material.clone() as THREE.MeshStandardMaterial;
          mat.color.set(hatColor);
          mat.roughness = 0.88;
          mat.metalness = 0.0;
          mat.needsUpdate = true;
          mesh.material = mat;
        }
      }
    });
  }, [capMesh, hatColor]);

  // Show only the black hat mesh, hide others
  useEffect(() => {
    capMesh.traverse((child) => {
      if (child.name === 'brownhat_0' || child.name === 'pinkhat_2') {
        child.visible = false;
      }
      if (child.name === 'blackhat_1') {
        child.visible = true;
      }
    });
  }, [capMesh]);

  // Compute bounding box to center the hat
  const capBounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(capMesh);
    return {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
    };
  }, [capMesh]);

  return (
    <group ref={groupRef}>
      {/* GLB Cap Model */}
      <primitive
        object={capMesh}
        scale={3.0}
        position={[0, -capBounds.center.y * 3 + 0.1, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Front text - curved to match hat crown */}
      {frontTexture && (
        <mesh geometry={frontGeo} position={[0, 0.35, 0.9]} rotation={[-0.12, 0, 0]}>
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

      {/* Back text - curved to match hat crown */}
      {backTexture && (
        <mesh geometry={backGeo} position={[0, 0.35, -0.9]} rotation={[0.12, Math.PI, 0]}>
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
    <mesh position={[1.05, 0.4, 0.1]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[0.4, 0.4]} />
      <meshStandardMaterial map={texture} transparent roughness={0.8} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

useGLTF.preload('/models/cap.glb');
