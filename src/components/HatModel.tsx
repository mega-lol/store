import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface HatModelProps {
  hatColor: string;
  text: string;
  textColor: string;
  font?: string;
  autoRotate?: boolean;
}

export default function HatModel({ hatColor, text, textColor, autoRotate = false }: HatModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  const crownGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    return geo;
  }, []);

  const brimGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.absarc(0, 0, 1.3, -Math.PI * 0.15, Math.PI * 1.15, false);
    shape.lineTo(0, 0);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    return geo;
  }, []);

  const bandGeometry = useMemo(() => {
    return new THREE.TorusGeometry(0.98, 0.04, 8, 64, Math.PI * 2);
  }, []);

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Crown */}
      <mesh geometry={crownGeometry} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color={hatColor} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Band at base of crown */}
      <mesh geometry={bandGeometry} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={hatColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Brim */}
      <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2 + 0.15, 0, Math.PI * 0.5]}>
        <mesh geometry={brimGeometry} castShadow>
          <meshStandardMaterial color={hatColor} roughness={0.6} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Button on top */}
      <mesh position={[0, 0.97, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={hatColor} roughness={0.5} />
      </mesh>

      {/* Front panel seam line */}
      <mesh position={[0, 0.5, 0.99]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.01, 0.7, 0.01]} />
        <meshStandardMaterial color={hatColor} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Text on front */}
      <Text
        position={[0, 0.45, 1.01]}
        fontSize={0.15}
        maxWidth={1.4}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={textColor}
        outlineWidth={0.005}
        outlineColor={textColor}
        font={undefined}
      >
        {text || ' '}
      </Text>
    </group>
  );
}
