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

// Create realistic fabric texture for baseball cap
function createFabricTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Base fabric color (neutral)
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, size, size);
  
  // Add fabric weave pattern
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Create subtle weave pattern
      const weaveX = Math.sin(x * 0.2) * 15;
      const weaveY = Math.sin(y * 0.2) * 15;
      const weave = (weaveX + weaveY) * 0.3;
      
      // Add random fabric fiber texture
      const noise = (Math.random() - 0.5) * 20;
      
      // Combine effects
      const adjustment = weave + noise;
      
      data[i] = Math.max(0, Math.min(255, data[i] + adjustment));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment)); // B
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  
  return texture;
}

function makeTextTexture(
  lines: string[],
  textColor: string,
  renderer: THREE.WebGLRenderer,
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  // Ultra high resolution for crisp embroidery-like text
  c.width = 4096;
  c.height = 2048;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);

  // Enable high-quality text rendering
  ctx.textRenderingOptimization = 'optimizeQuality' as any;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const x = c.width * 0.5;
  const lineCount = lines.length;
  
  // Enhanced font size calculation for baseball cap proportions
  let fontSize;
  const maxTextLength = Math.max(...lines.map(line => line.length));
  
  if (lineCount === 1) {
    fontSize = maxTextLength > 15 ? 240 : maxTextLength > 10 ? 280 : 320;
  } else if (lineCount === 2) {
    fontSize = maxTextLength > 12 ? 220 : maxTextLength > 8 ? 260 : 300;
  } else {
    fontSize = maxTextLength > 10 ? 190 : maxTextLength > 6 ? 220 : 260;
  }
  
  // Ensure text fits within canvas bounds with padding
  const testText = lines.reduce((a, b) => a.length > b.length ? a : b);
  ctx.font = `900 ${fontSize}px "Arial Black", "Helvetica", sans-serif`;
  const textWidth = ctx.measureText(testText).width;
  
  if (textWidth > c.width * 0.9) {
    fontSize = Math.floor(fontSize * (c.width * 0.9) / textWidth);
  }
  
  const dy = fontSize * 1.15; // Optimized line spacing for baseball cap
  const y0 = c.height * 0.5 - ((lineCount - 1) * dy) / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontStr = `900 ${fontSize}px "Arial Black", "Helvetica", sans-serif`;

  // Create embossed effect with multiple shadows and highlights
  // Deep shadow for depth
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = fontStr;
  lines.forEach((t, i) => ctx.fillText(t, x + 6, y0 + i * dy + 6));

  // Medium shadow for transition
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  lines.forEach((t, i) => ctx.fillText(t, x + 3, y0 + i * dy + 3));

  // Strong outline for definition
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 6;
  lines.forEach((t, i) => ctx.strokeText(t, x, y0 + i * dy));

  // Subtle highlight for embossed look
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  lines.forEach((t, i) => ctx.fillText(t, x - 1, y0 + i * dy - 1));

  // Main text
  ctx.fillStyle = textColor;
  lines.forEach((t, i) => ctx.fillText(t, x, y0 + i * dy));

  // Enhanced embroidery texture with better randomization
  const img = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] > 0) {
      // Add fabric-like texture variation
      const n = (Math.random() - 0.5) * 8;
      const brightness = (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3;
      const textureStrength = brightness > 128 ? 0.6 : 0.3;
      
      img.data[i] = Math.min(255, Math.max(0, img.data[i] + n * textureStrength));
      img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n * textureStrength));
      img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n * textureStrength));
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
    tex.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  }
  tex.needsUpdate = true;
  return tex;
}

// Enhanced curved plane for better baseball cap crown fitting
function createCurvedPlane(
  width: number,
  height: number,
  radius: number,
  segsX = 64,
  segsY = 24,
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, segsX, segsY);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const angle = px / radius;
    
    // Create cylindrical wrap for cap crown with improved curvature
    const newX = Math.sin(angle) * radius;
    const newZ = Math.cos(angle) * radius - radius;
    
    // Enhanced dome curvature for realistic baseball cap crown shape
    const ny = py / (height * 0.5);
    const domeZ = 0.22 * radius * (1 - ny * ny * 0.4); // More pronounced dome
    
    // Add natural forward tilt and slight crown rounding
    const tiltFactor = py / height * 0.12;
    const crownRounding = Math.cos(angle) * 0.02 * radius;
    
    pos.setXYZ(i, newX, py, newZ + domeZ + tiltFactor + crownRounding);
  }

  // Compute high-quality normals for better lighting
  geo.computeVertexNormals();
  
  // Ensure UV coordinates are properly mapped
  const uvs = geo.attributes.uv;
  for (let i = 0; i < uvs.count; i++) {
    const u = uvs.getX(i);
    const v = uvs.getY(i);
    // Adjust UV mapping to account for curvature
    const adjustedU = u + Math.sin(u * Math.PI) * 0.05;
    uvs.setXY(i, adjustedU, v);
  }
  
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
  
  // Create fabric texture once
  const fabricTexture = useMemo(() => createFabricTexture(), []);

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

  // Text planes optimized for baseball cap crown dimensions
  // Front text covers the optimal crown area with perfect proportions
  const frontW = size.x * 0.75; // Wider coverage for better text visibility
  const frontH = size.y * 0.45; // Optimized height for crown curve
  const frontGeo = useMemo(() => createCurvedPlane(frontW, frontH, size.x * 0.5), [frontW, frontH, size.x]);

  // Back text sized appropriately for baseball cap back panel
  const backW = size.x * 0.6; // Proper back text width
  const backH = size.y * 0.35; // Suitable height for back placement
  const backGeo = useMemo(() => createCurvedPlane(backW, backH, size.x * 0.46), [backW, backH, size.x]);

  // Apply realistic baseball cap material properties with fabric texture
  useEffect(() => {
    capMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => {
            const cloned = m.clone() as THREE.MeshStandardMaterial;
            cloned.color.set(hatColor);
            cloned.roughness = 0.75;
            cloned.metalness = 0.0;
            cloned.bumpMap = fabricTexture;
            cloned.bumpScale = 0.02;
            cloned.normalScale = new THREE.Vector2(0.5, 0.5);
            cloned.envMapIntensity = 0.1;
            cloned.needsUpdate = true;
            return cloned;
          });
        } else {
          const mat = mesh.material.clone() as THREE.MeshStandardMaterial;
          mat.color.set(hatColor);
          mat.roughness = 0.75;
          mat.metalness = 0.0;
          mat.bumpMap = fabricTexture;
          mat.bumpScale = 0.02;
          mat.normalScale = new THREE.Vector2(0.5, 0.5);
          mat.envMapIntensity = 0.1;
          mat.needsUpdate = true;
          mesh.material = mat;
        }
      }
    });
  }, [capMesh, hatColor, fabricTexture]);

  // Optimized text positioning for perfect baseball cap crown placement
  const textY = center.y + size.y * 0.08; // Refined crown positioning
  // Front Z: positioned for optimal crown curve adhesion
  const frontZ = center.z + size.z * 0.38; // Closer to surface for better visual integration
  // Back Z: positioned for back crown visibility
  const backZ = center.z - size.z * 0.38;

  return (
    <group ref={groupRef} scale={displayScale}>
      {/* Offset so center of hat is at origin */}
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={capMesh} />

        {/* Front text - curved perfectly on baseball cap crown */}
        {frontTexture && (
          <mesh
            geometry={frontGeo}
            position={[center.x, textY, frontZ]}
            rotation={[-0.08, 0, 0]} // Optimized rotation for baseball cap crown
          >
            <meshStandardMaterial
              map={frontTexture}
              transparent
              alphaTest={0.1}
              roughness={0.6}
              metalness={0.1}
              depthWrite={false}
              side={THREE.DoubleSide}
              polygonOffset
              polygonOffsetFactor={-4}
              polygonOffsetUnits={-1}
              // Enhanced material properties for embroidered look
              emissiveIntensity={0.05}
              normalScale={new THREE.Vector2(0.3, 0.3)}
            />
          </mesh>
        )}

        {/* Back text - positioned for optimal back crown visibility */}
        {backTexture && (
          <mesh
            geometry={backGeo}
            position={[center.x, textY - size.y * 0.02, backZ]}
            rotation={[0.08, Math.PI, 0]} // Improved back positioning
          >
            <meshStandardMaterial
              map={backTexture}
              transparent
              alphaTest={0.1}
              roughness={0.6}
              metalness={0.1}
              depthWrite={false}
              side={THREE.DoubleSide}
              polygonOffset
              polygonOffsetFactor={-4}
              polygonOffsetUnits={-1}
              emissiveIntensity={0.05}
              normalScale={new THREE.Vector2(0.3, 0.3)}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

useGLTF.preload('/models/cap.glb');
