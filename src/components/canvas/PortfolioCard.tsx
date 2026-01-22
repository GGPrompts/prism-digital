"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { PortfolioProject } from "@/lib/portfolioData";

interface PortfolioCardProps {
  project: PortfolioProject;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

export function PortfolioCard({
  project,
  position,
  isSelected,
  onSelect,
  index,
}: PortfolioCardProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const [hovered, setHovered] = useState(false);

  // Pre-allocate vectors for performance
  const initialPosition = useMemo(
    () => new THREE.Vector3(...position),
    [position]
  );
  const currentPosition = useRef(new THREE.Vector3(...position));
  const currentScale = useRef(1);
  const currentRotation = useRef(new THREE.Euler(0, 0, 0));
  const glowIntensity = useRef(0.1);

  // Parse project color to THREE color
  const projectColor = useMemo(
    () => new THREE.Color(project.color),
    [project.color]
  );
  const accentColor = useMemo(
    () => new THREE.Color(project.accentColor),
    [project.accentColor]
  );

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current || !groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Target values based on state
    const targetScale = isSelected ? 1.3 : hovered ? 1.1 : 1;
    const targetGlow = isSelected ? 0.5 : hovered ? 0.3 : 0.1;

    // Smooth interpolation
    currentScale.current = THREE.MathUtils.lerp(
      currentScale.current,
      targetScale,
      0.1
    );
    glowIntensity.current = THREE.MathUtils.lerp(
      glowIntensity.current,
      targetGlow,
      0.1
    );

    // Apply scale
    groupRef.current.scale.setScalar(currentScale.current);

    // Floating animation
    const floatY = Math.sin(time * 0.8 + index * 0.5) * 0.1;
    const floatX = Math.cos(time * 0.6 + index * 0.3) * 0.05;

    // Position with floating
    currentPosition.current.x = THREE.MathUtils.lerp(
      currentPosition.current.x,
      initialPosition.x + floatX,
      0.05
    );
    currentPosition.current.y = THREE.MathUtils.lerp(
      currentPosition.current.y,
      initialPosition.y + floatY,
      0.05
    );
    currentPosition.current.z = THREE.MathUtils.lerp(
      currentPosition.current.z,
      initialPosition.z,
      0.05
    );

    groupRef.current.position.copy(currentPosition.current);

    // Rotation - rotate toward camera on hover
    const targetRotationY = hovered ? Math.sin(time * 2) * 0.05 : 0;
    const targetRotationX = hovered ? Math.cos(time * 2) * 0.03 : 0;
    currentRotation.current.y = THREE.MathUtils.lerp(
      currentRotation.current.y,
      targetRotationY,
      0.1
    );
    currentRotation.current.x = THREE.MathUtils.lerp(
      currentRotation.current.x,
      targetRotationX,
      0.1
    );

    // Subtle continuous rotation
    meshRef.current.rotation.y = time * 0.1 + currentRotation.current.y;
    meshRef.current.rotation.x = currentRotation.current.x;

    // Update material glow
    materialRef.current.emissiveIntensity = glowIntensity.current;
  });

  return (
    <group ref={groupRef} position={position}>
      <RoundedBox
        ref={meshRef}
        args={[1.8, 1.2, 0.1]}
        radius={0.05}
        smoothness={4}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <meshPhysicalMaterial
          ref={materialRef}
          color={projectColor}
          emissive={accentColor}
          emissiveIntensity={0.1}
          transparent
          opacity={0.85}
          roughness={0.15}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          transmission={0.2}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </RoundedBox>

      {/* HTML content overlay */}
      <Html
        transform
        distanceFactor={3}
        position={[0, 0, 0.06]}
        style={{
          width: "160px",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-2 text-3xl font-bold opacity-60"
            style={{ color: project.color }}
          >
            {project.title.charAt(0)}
          </div>
          <div className="text-xs font-semibold text-white/90 drop-shadow-lg">
            {project.title}
          </div>
          <div className="mt-1 line-clamp-2 text-[10px] text-white/60">
            {project.shortDescription}
          </div>
        </div>
      </Html>

      {/* Glow effect ring */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, -0.02]}>
        <ringGeometry args={[0.95, 1.0, 32]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={hovered || isSelected ? 0.4 : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
