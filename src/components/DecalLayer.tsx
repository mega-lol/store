import { useRef, useEffect, useMemo, useState } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Decal } from '@/types/hat';
import { PivotControls } from '@react-three/drei';

interface DecalLayerProps {
    decal: Decal;
    isSelected?: boolean;
    onUpdate?: (id: string, updates: Partial<Decal>) => void;
    onClick?: (e: any) => void;
}

function TextDecalTexture({ text, color, font }: { text: string; color: string; font: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    const texture = useMemo(() => new THREE.CanvasTexture(canvasRef.current), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // High resolution for crisp text
        canvas.width = 1024;
        canvas.height = 512;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Config
        const fontSize = 100;
        ctx.font = `bold ${fontSize}px "${font || 'Arial'}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;

        // Draw
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.2;
        const startY = (canvas.height - (lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
        });

        texture.needsUpdate = true;
    }, [text, color, font, texture]);

    return <meshStandardMaterial
        map={texture}
        transparent
        polygonOffset
        polygonOffsetFactor={-1}
        depthTest={true}
        depthWrite={false}
    />;
}

export default function DecalLayer({ decal, isSelected, onUpdate, onClick }: DecalLayerProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Load image texture if applicable
    const texture = decal.type === 'image' && decal.url ? useTexture(decal.url) : null;

    const handleDrag = (l: THREE.Matrix4) => {
        if (!onUpdate) return;

        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        l.decompose(position, quaternion, scale);

        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        onUpdate(decal.id, {
            position: [position.x, position.y, position.z],
            rotation: [euler.x, euler.y, euler.z],
            scale: [scale.x, scale.y, scale.z]
        });
    };

    return (
        <group>
            {isSelected ? (
                <PivotControls
                    anchor={[0, 0, 0]}
                    depthTest={false}
                    lineWidth={2}
                    scale={0.5}
                    onDrag={handleDrag}
                    visible={isSelected}
                >
                    <mesh
                        ref={meshRef}
                        position={new THREE.Vector3(...decal.position)}
                        rotation={new THREE.Euler(...decal.rotation)}
                        scale={new THREE.Vector3(...decal.scale)}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.(e);
                        }}
                        onPointerOver={() => setHovered(true)}
                        onPointerOut={() => setHovered(false)}
                    >
                        <planeGeometry args={[1, 1]} />
                        {decal.type === 'image' && texture ? (
                            <meshStandardMaterial
                                map={texture}
                                transparent
                                polygonOffset
                                polygonOffsetFactor={-1}
                                depthTest={true}
                                depthWrite={false}
                            />
                        ) : decal.type === 'text' && decal.text ? (
                            <TextDecalTexture text={decal.text} color={decal.color || '#ffffff'} font={decal.font || 'Arial'} />
                        ) : (
                            <meshBasicMaterial color="red" wireframe /> // Fallback
                        )}

                        {/* Selection highlight */}
                        {(isSelected || hovered) && (
                            <lineSegments>
                                <edgesGeometry args={[new THREE.PlaneGeometry(1, 1)]} />
                                <lineBasicMaterial color={isSelected ? "#ffff00" : "#ffffff"} />
                            </lineSegments>
                        )}
                    </mesh>
                </PivotControls>
            ) : (
                <mesh
                    ref={meshRef}
                    position={new THREE.Vector3(...decal.position)}
                    rotation={new THREE.Euler(...decal.rotation)}
                    scale={new THREE.Vector3(...decal.scale)}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.(e);
                    }}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                >
                    <planeGeometry args={[1, 1]} />
                    {decal.type === 'image' && texture ? (
                        <meshStandardMaterial
                            map={texture}
                            transparent
                            polygonOffset
                            polygonOffsetFactor={-1}
                            depthTest={true}
                            depthWrite={false}
                        />
                    ) : decal.type === 'text' && decal.text ? (
                        <TextDecalTexture text={decal.text} color={decal.color || '#ffffff'} font={decal.font || 'Arial'} />
                    ) : (
                        <meshBasicMaterial color="red" wireframe />
                    )}
                    {(hovered) && (
                        <lineSegments>
                            <edgesGeometry args={[new THREE.PlaneGeometry(1, 1)]} />
                            <lineBasicMaterial color="#ffffff" />
                        </lineSegments>
                    )}
                </mesh>
            )}
        </group>
    );
}
