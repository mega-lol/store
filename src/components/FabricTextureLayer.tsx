import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Canvas as FabricCanvas } from 'fabric';
import * as THREE from 'three';

interface FabricTextureLayerProps {
  fabricCanvas: FabricCanvas | null;
  targetMesh: THREE.Mesh | null;
}

/**
 * R3F component that creates a THREE.CanvasTexture from a Fabric.js canvas
 * and applies it to the target mesh's material map.
 * Listens to Fabric's after:render to flag texture updates.
 */
export default function FabricTextureLayer({ fabricCanvas, targetMesh }: FabricTextureLayerProps) {
  const { gl } = useThree();
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const needsUpdateRef = useRef(true);

  // Create texture and wire Fabric render callback
  useEffect(() => {
    if (!fabricCanvas) return;

    const el = fabricCanvas.getElement() as HTMLCanvasElement;
    if (!el) return;

    const tex = new THREE.CanvasTexture(el);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    tex.needsUpdate = true;
    textureRef.current = tex;

    // Mark for update whenever Fabric re-renders
    const onAfterRender = () => {
      needsUpdateRef.current = true;
    };
    fabricCanvas.on('after:render', onAfterRender);

    return () => {
      fabricCanvas.off('after:render', onAfterRender);
      tex.dispose();
      textureRef.current = null;
    };
  }, [fabricCanvas, gl]);

  // Apply texture to target mesh material
  useEffect(() => {
    if (!targetMesh || !textureRef.current) return;

    const applyToMaterial = (mat: THREE.Material) => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.map = textureRef.current;
        mat.color.set('#ffffff'); // Let texture provide color
        mat.needsUpdate = true;
      }
    };

    if (Array.isArray(targetMesh.material)) {
      targetMesh.material.forEach(applyToMaterial);
    } else {
      applyToMaterial(targetMesh.material);
    }

    return () => {
      // Restore on cleanup (remove map)
      const restoreMaterial = (mat: THREE.Material) => {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.map = null;
          mat.needsUpdate = true;
        }
      };
      if (Array.isArray(targetMesh.material)) {
        targetMesh.material.forEach(restoreMaterial);
      } else {
        restoreMaterial(targetMesh.material);
      }
    };
  }, [targetMesh, fabricCanvas]);

  // On each frame, flag texture update if Fabric rendered
  useFrame(() => {
    if (needsUpdateRef.current && textureRef.current) {
      textureRef.current.needsUpdate = true;
      needsUpdateRef.current = false;
    }
  });

  return null; // This component renders nothing visually - it just manages the texture
}
