"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface ShapeConfig {
  geometry: "octahedron" | "box" | "icosahedron";
  position: [number, number, number];
  scale: number;
  color: string;
  emissive: string;
  floatSpeed: number;
  floatIntensity: number;
  rotationSpeed: number;
}

interface FloatingShapeProps {
  config: ShapeConfig;
  mouse: THREE.Vector2;
  scrollOffset: number;
  index: number;
}

function FloatingShape({ config, mouse, scrollOffset, index }: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const initialPos = useMemo(() => new THREE.Vector3(...config.position), [config.position]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Some browsers can report tiny non-zero scroll offsets on initial load.
    // Treat very small values as 0 so shapes don't "disappear" immediately.
    const effectiveScroll = scrollOffset < 0.02 ? 0 : scrollOffset;

    // Smooth rotation
    meshRef.current.rotation.x += delta * config.rotationSpeed * 0.3;
    meshRef.current.rotation.y += delta * config.rotationSpeed * 0.5;

    // Mouse parallax - shapes move opposite to mouse for depth effect
    const parallaxStrength = 0.3 + index * 0.1;
    const targetX = initialPos.x - mouse.x * parallaxStrength;
    const targetY = initialPos.y - mouse.y * parallaxStrength * 0.5;

    // Lerp position for smooth movement
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.05
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      0.05
    );

    // Scroll-based z movement - shapes recede as user scrolls
    const scrollZ = initialPos.z - effectiveScroll * 1.25;
    meshRef.current.position.z = THREE.MathUtils.lerp(
      meshRef.current.position.z,
      scrollZ,
      0.1
    );

    // Fade out shapes as user scrolls
    const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
    material.opacity = THREE.MathUtils.lerp(0.65, 0.35, effectiveScroll);
    material.emissiveIntensity = THREE.MathUtils.lerp(0.9, 0.45, effectiveScroll);
  });

  const geometry = useMemo(() => {
    switch (config.geometry) {
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "box":
        return <boxGeometry args={[1, 1, 1]} />;
      case "icosahedron":
        return <icosahedronGeometry args={[1, 0]} />;
    }
  }, [config.geometry]);

  return (
    <Float
      speed={config.floatSpeed}
      rotationIntensity={0.2}
      floatIntensity={config.floatIntensity}
    >
      <mesh
        ref={meshRef}
        position={config.position}
        scale={config.scale}
      >
        {geometry}
        <meshPhysicalMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
          depthWrite={false}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

interface FloatingShapesProps {
  mouse: THREE.Vector2;
  scrollOffset: number;
  device: DeviceCapabilities;
}

// Shape configurations - positioned to not obstruct hero text (center area)
const shapeConfigs: ShapeConfig[] = [
  {
    geometry: "octahedron",
    position: [-4, 2, -2],
    scale: 0.8,
    color: "#8b5cf6",
    emissive: "#a855f7",
    floatSpeed: 1.5,
    floatIntensity: 0.5,
    rotationSpeed: 0.5,
  },
  {
    geometry: "icosahedron",
    position: [4.5, 1.5, -3],
    scale: 0.6,
    color: "#6366f1",
    emissive: "#818cf8",
    floatSpeed: 2,
    floatIntensity: 0.4,
    rotationSpeed: 0.7,
  },
  {
    geometry: "box",
    position: [-3.5, -1.8, -1.5],
    scale: 0.5,
    color: "#7c3aed",
    emissive: "#a78bfa",
    floatSpeed: 1.8,
    floatIntensity: 0.6,
    rotationSpeed: 0.4,
  },
  {
    geometry: "octahedron",
    position: [3.8, -1.2, -2.5],
    scale: 0.55,
    color: "#8b5cf6",
    emissive: "#c084fc",
    floatSpeed: 1.2,
    floatIntensity: 0.45,
    rotationSpeed: 0.6,
  },
  {
    geometry: "icosahedron",
    position: [0.5, 3, -4],
    scale: 0.4,
    color: "#6366f1",
    emissive: "#a5b4fc",
    floatSpeed: 2.2,
    floatIntensity: 0.3,
    rotationSpeed: 0.8,
  },
];

export function FloatingShapes({ mouse, scrollOffset, device }: FloatingShapesProps) {
  // Reduce shape count on mobile devices
  const visibleShapes = useMemo(() => {
    if (device.isMobile) {
      // Only show 2 shapes on mobile
      return shapeConfigs.slice(0, 2);
    }
    if (device.isTablet || device.gpu === "low") {
      // Show 3 shapes on tablet or low-end devices
      return shapeConfigs.slice(0, 3);
    }
    // Show all shapes on desktop
    return shapeConfigs;
  }, [device.isMobile, device.isTablet, device.gpu]);

  // Don't render shapes if WebGL is not available
  if (!device.hasWebGL) return null;

  return (
    <group>
      {visibleShapes.map((config, index) => (
        <FloatingShape
          key={`shape-${index}`}
          config={config}
          mouse={mouse}
          scrollOffset={scrollOffset}
          index={index}
        />
      ))}
    </group>
  );
}
