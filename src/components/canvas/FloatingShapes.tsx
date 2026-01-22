"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface ShapeConfig {
  geometry: "octahedron" | "tetrahedron" | "dodecahedron";
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

function FloatingShape({ config, scrollOffset, index }: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  const initialPos = useMemo(() => new THREE.Vector3(...config.position), [config.position]);
  const smoothScroll = useRef(0);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    // Smooth scroll interpolation
    smoothScroll.current = THREE.MathUtils.lerp(smoothScroll.current, scrollOffset, 0.1);
    const scroll = smoothScroll.current;

    // Elegant slow rotation
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * config.rotationSpeed * 0.3;
    meshRef.current.rotation.y = time * config.rotationSpeed * 0.4;

    // Subtle floating motion
    const floatY = Math.sin(time * config.floatSpeed + index) * config.floatIntensity * 0.3;
    const floatX = Math.cos(time * config.floatSpeed * 0.7 + index) * config.floatIntensity * 0.2;

    // Position with floating
    meshRef.current.position.x = initialPos.x + floatX;
    meshRef.current.position.y = initialPos.y + floatY;
    meshRef.current.position.z = initialPos.z;

    // Fade out and drift away on scroll (start fading at 15% scroll, fully gone by 50%)
    const fadeStart = 0.15;
    const fadeEnd = 0.5;
    const fadeProgress = THREE.MathUtils.clamp((scroll - fadeStart) / (fadeEnd - fadeStart), 0, 1);

    // Opacity fade
    materialRef.current.opacity = THREE.MathUtils.lerp(0.6, 0, fadeProgress);

    // Scale down slightly as fading
    const targetScale = config.scale * (1 - fadeProgress * 0.3);
    meshRef.current.scale.setScalar(targetScale);

    // Drift outward as scrolling
    const driftMultiplier = fadeProgress * 2;
    meshRef.current.position.x = initialPos.x + floatX + (initialPos.x * driftMultiplier * 0.5);
    meshRef.current.position.y = initialPos.y + floatY + (fadeProgress * 1.5);
    meshRef.current.position.z = initialPos.z - (fadeProgress * 3);
  });

  // Use higher detail geometries for smoother shapes
  const geometry = useMemo(() => {
    switch (config.geometry) {
      case "octahedron":
        return <octahedronGeometry args={[1, 1]} />; // detail=1 for smoother
      case "tetrahedron":
        return <tetrahedronGeometry args={[1, 1]} />; // matches prism aesthetic
      case "dodecahedron":
        return <dodecahedronGeometry args={[1, 1]} />; // elegant 12-sided shape
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
      {/* Use MeshPhysicalMaterial for glass-like appearance matching prism */}
      <meshPhysicalMaterial
        ref={materialRef}
        color={config.color}
        emissive={config.emissive}
        emissiveIntensity={0.15}
        transparent
        opacity={0.6}
        roughness={0.15}
        metalness={0.1}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
        transmission={0.3}
        thickness={0.5}
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

// Shape configurations - positioned around edges, not blocking center prism or text
const shapeConfigs: ShapeConfig[] = [
  // Top-right - elegant tetrahedron
  {
    geometry: "tetrahedron",
    position: [4.2, 2.2, -2],
    scale: 0.45,
    color: "#c4b5fd",
    emissive: "#a855f7",
    floatSpeed: 1.2,
    floatIntensity: 0.4,
    rotationSpeed: 0.5,
  },
  // Bottom-left - small octahedron
  {
    geometry: "octahedron",
    position: [-4.0, -2.0, -1.5],
    scale: 0.5,
    color: "#a78bfa",
    emissive: "#8b5cf6",
    floatSpeed: 1.5,
    floatIntensity: 0.5,
    rotationSpeed: 0.4,
  },
  // Top-left corner - dodecahedron
  {
    geometry: "dodecahedron",
    position: [-3.8, 2.5, -3],
    scale: 0.35,
    color: "#ddd6fe",
    emissive: "#c084fc",
    floatSpeed: 1.8,
    floatIntensity: 0.35,
    rotationSpeed: 0.6,
  },
  // Bottom-right - tetrahedron
  {
    geometry: "tetrahedron",
    position: [3.5, -1.8, -2.5],
    scale: 0.4,
    color: "#e9d5ff",
    emissive: "#a855f7",
    floatSpeed: 1.3,
    floatIntensity: 0.45,
    rotationSpeed: 0.55,
  },
  // Far back center-top - small accent
  {
    geometry: "octahedron",
    position: [0.5, 3.2, -5],
    scale: 0.3,
    color: "#f5d0fe",
    emissive: "#d946ef",
    floatSpeed: 2.0,
    floatIntensity: 0.3,
    rotationSpeed: 0.7,
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
