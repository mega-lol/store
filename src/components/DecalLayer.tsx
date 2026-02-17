import { useEffect, useMemo, useRef } from 'react';
import { Decal as ProjectedDecal, useTexture } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Decal } from '@/types/hat';
import { toFontStack } from '@/lib/fonts';

interface DecalLayerProps {
  decal: Decal;
  targetMesh: THREE.Mesh | null;
  isSelected?: boolean;
  onClick?: (e: ThreeEvent<PointerEvent>) => void;
}

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

function useTextTexture(text: string, color: string, font: string) {
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const texture = useMemo(() => new THREE.CanvasTexture(canvasRef.current), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 2048;
    canvas.height = 1024;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lines = text.split('\n').filter(Boolean);
    const maxLen = Math.max(...lines.map((line) => line.length), 8);
    let fontSize = maxLen > 16 ? 150 : maxLen > 10 ? 190 : 240;

    const stack = toFontStack(font);
    ctx.font = `900 ${fontSize}px ${stack}`;
    const widest = lines.reduce((best, line) => (line.length > best.length ? line : best), lines[0] || '');
    const measured = ctx.measureText(widest).width || 1;

    if (measured > canvas.width * 0.88) {
      fontSize = Math.floor((fontSize * canvas.width * 0.88) / measured);
    }

    const lineHeight = fontSize * 1.15;
    const startY = canvas.height * 0.5 - ((lines.length - 1) * lineHeight) / 2;

    ctx.font = `900 ${fontSize}px ${stack}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color || '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = Math.max(4, fontSize * 0.05);

    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.strokeText(line, canvas.width * 0.5, y);
      ctx.fillText(line, canvas.width * 0.5, y);
    });

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.needsUpdate = true;
  }, [text, color, font, texture]);

  return texture;
}

export default function DecalLayer({ decal, targetMesh, isSelected, onClick }: DecalLayerProps) {
  const targetMeshRef = useRef<THREE.Mesh>(null!);
  const imageTexture = useTexture(decal.type === 'image' && decal.url ? decal.url : TRANSPARENT_PIXEL);
  const textTexture = useTextTexture(decal.text || '', decal.color || '#ffffff', decal.font || 'Vinegar');

  useEffect(() => {
    imageTexture.colorSpace = THREE.SRGBColorSpace;
    imageTexture.wrapS = THREE.ClampToEdgeWrapping;
    imageTexture.wrapT = THREE.ClampToEdgeWrapping;
    imageTexture.needsUpdate = true;
  }, [imageTexture]);

  const spin = decal.spin ?? decal.rotation?.[2] ?? 0;
  const decalRotation = useMemo((): [number, number, number] => {
    const normal = new THREE.Vector3(...(decal.normal || [0, 0, 1]));
    if (normal.lengthSq() < 1e-8) normal.set(0, 0, 1);
    normal.normalize();

    const basis = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal,
    );
    const spinQ = new THREE.Quaternion().setFromAxisAngle(normal, spin);
    const finalQ = basis.multiply(spinQ);
    const euler = new THREE.Euler().setFromQuaternion(finalQ);
    return [euler.x, euler.y, euler.z];
  }, [decal.normal, spin]);

  const size = Math.max(0.03, decal.scale?.[0] ?? 0.15);
  const projectionDepth = Math.max(0.06, size * 1.3);
  const decalScale: [number, number, number] = [size, size, projectionDepth];

  if (!targetMesh) return null;
  targetMeshRef.current = targetMesh;

  return (
    <ProjectedDecal
      mesh={targetMeshRef}
      position={decal.position}
      rotation={decalRotation}
      scale={decalScale}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <meshStandardMaterial
        map={decal.type === 'image' ? imageTexture : textTexture}
        transparent
        alphaTest={0.06}
        depthTest
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={isSelected ? -3 : -2}
        polygonOffsetUnits={isSelected ? -3 : -2}
        roughness={0.6}
        metalness={0.02}
        emissive={isSelected ? '#1f1f1f' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </ProjectedDecal>
  );
}
