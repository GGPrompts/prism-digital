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

  // Temporarily disabled useFrame for debugging
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Just rotate slowly
    meshRef.current.rotation.x += delta * 0.1;
    meshRef.current.rotation.y += delta * 0.15;
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
    <mesh
      ref={meshRef}
      position={config.position}
      scale={config.scale}
      frustumCulled={false}
    >
      {geometry}
      <meshStandardMaterial
        color={config.color}
        emissive={config.emissive}
        emissiveIntensity={0.3}
        transparent
        opacity={0.85}
        roughness={0.3}
        metalness={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
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
    position: [0, 0, 0],  // TEST: center position
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
