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
  // Higher resolution for crisp text on baseball cap
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);

  const x = c.width * 0.5;
  const lineCount = lines.length;
  
  // Improved font size calculation for baseball cap proportions
  let fontSize;
  const maxTextLength = Math.max(...lines.map(line => line.length));
  
  if (lineCount === 1) {
    fontSize = maxTextLength > 15 ? 120 : maxTextLength > 10 ? 140 : 160;
  } else if (lineCount === 2) {
    fontSize = maxTextLength > 12 ? 110 : maxTextLength > 8 ? 130 : 150;
  } else {
    fontSize = maxTextLength > 10 ? 95 : maxTextLength > 6 ? 110 : 130;
  }
  
  // Ensure text fits within canvas bounds with padding
  const testText = lines.reduce((a, b) => a.length > b.length ? a : b);
  ctx.font = `900 ${fontSize}px "Arial Black", "Helvetica", sans-serif`;
  const textWidth = ctx.measureText(testText).width;
  
  if (textWidth > c.width * 0.85) {
    fontSize = Math.floor(fontSize * (c.width * 0.85) / textWidth);
  }
  
  const dy = fontSize * 1.1; // Tighter line spacing for baseball cap
  const y0 = c.height * 0.5 - ((lineCount - 1) * dy) / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontStr = `900 ${fontSize}px "Arial Black", "Helvetica", sans-serif`;

  // Strong shadow for embossed effect
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.font = fontStr;
  lines.forEach((t, i) => ctx.fillText(t, x + 4, y0 + i * dy + 4));

  // Outline for better definition
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 3;
  ctx.font = fontStr;
  lines.forEach((t, i) => ctx.strokeText(t, x, y0 + i * dy));

  // Main text
  ctx.fillStyle = textColor;
  ctx.font = fontStr;
  lines.forEach((t, i) => ctx.fillText(t, x, y0 + i * dy));

  // Subtle embroidery texture
  const img = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] > 0) {
      const n = Math.random() * 6 - 3; // Subtle texture noise
      img.data[i] = Math.min(255, Math.max(0, img.data[i] + n));
      img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n));
      img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n));
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false; // Better alignment with 3D mesh
  if (renderer) tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate = true;
  return tex;
}

// Enhanced curved plane for baseball cap crown fitting
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
    
    // Create cylindrical wrap for cap crown
    const newX = Math.sin(angle) * radius;
    const newZ = Math.cos(angle) * radius - radius;
    
    // Enhanced dome curvature for baseball cap crown shape
    const ny = py / (height * 0.5);
    const domeZ = 0.18 * radius * (1 - ny * ny * 0.6); // Better dome for baseball cap
    
    // Add slight forward tilt mimicking natural cap position
    const tiltFactor = py / height * 0.08;
    
    pos.setXYZ(i, newX, py, newZ + domeZ + tiltFactor);
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

  // Compute ACTUAL rendered bounding box (includes all node transforms like 0.0254 scale)
  const { center, size } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(capMesh);
    return {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
    };
  }, [capMesh]);

  // Scale so hat fills ~1.6 units wide
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

  // Text planes sized for optimal baseball cap text placement
  // Front text covers proper crown area
  const frontW = size.x * 0.7; // Optimized width for baseball cap crown
  const frontH = size.y * 0.5; // Better height proportions
  const frontGeo = useMemo(() => createCurvedPlane(frontW, frontH, size.x * 0.52), [frontW, frontH, size.x]);

  const backW = size.x * 0.55; // Appropriately sized back text
  const backH = size.y * 0.4;
  const backGeo = useMemo(() => createCurvedPlane(backW, backH, size.x * 0.48), [backW, backH, size.x]);

  // Apply baseball cap material properties
  useEffect(() => {
    capMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => {
            const cloned = m.clone() as THREE.MeshStandardMaterial;
            cloned.color.set(hatColor);
            cloned.roughness = 0.85; // Slightly more matte for baseball cap fabric
            cloned.metalness = 0.0;
            cloned.bumpScale = 0.02; // Subtle fabric texture
            cloned.needsUpdate = true;
            return cloned;
          });
        } else {
          const mat = mesh.material.clone() as THREE.MeshStandardMaterial;
          mat.color.set(hatColor);
          mat.roughness = 0.85; // Matte finish for baseball cap
          mat.metalness = 0.0;
          mat.bumpScale = 0.02; // Fabric texture
          mat.needsUpdate = true;
          mesh.material = mat;
        }
      }
    });
  }, [capMesh, hatColor]);

  // Optimized text positioning for baseball cap crown
  const textY = center.y + size.y * 0.1; // Perfect crown positioning
  // Front Z: positioned to follow baseball cap crown curve
  const frontZ = center.z + size.z * 0.35; // Closer to hat surface for better adhesion
  // Back Z: positioned for back crown
  const backZ = center.z - size.z * 0.35;

  return (
    <group ref={groupRef} scale={displayScale}>
      {/* Offset so center of hat is at origin */}
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={capMesh} />

        {/* Front text - curved on baseball cap crown */}
        {frontTexture && (
          <mesh
            geometry={frontGeo}
            position={[center.x, textY, frontZ]}
            rotation={[-0.12, 0, 0]} // Reduced rotation for better baseball cap fit
          >
            <meshStandardMaterial
              map={frontTexture}
              transparent
              roughness={0.75}
              metalness={0.05}
              depthWrite={false}
              side={THREE.DoubleSide}
              polygonOffset
              polygonOffsetFactor={-2}
            />
          </mesh>
        )}

        {/* Back text - positioned on back of baseball cap */}
        {backTexture && (
          <mesh
            geometry={backGeo}
            position={[center.x, textY - size.y * 0.03, backZ]}
            rotation={[0.12, Math.PI, 0]} // Better back positioning
          >
            <meshStandardMaterial
              map={backTexture}
              transparent
              roughness={0.75}
              metalness={0.05}
              depthWrite={false}
              side={THREE.DoubleSide}
              polygonOffset
              polygonOffsetFactor={-2}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

useGLTF.preload('/models/cap.glb');
