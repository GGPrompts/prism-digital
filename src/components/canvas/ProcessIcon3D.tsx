"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, Suspense, memo } from "react";
import * as THREE from "three";

type IconType = "discovery" | "design" | "develop" | "deploy";

interface ProcessIcon3DProps {
  type: IconType;
  accentColor: string;
  fallbackIcon: string;
  isMobile?: boolean;
}

// Magnifying glass for Discovery step
function DiscoveryIcon({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Magnifying glass lens */}
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[0.28, 0.06, 16, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        {/* Glass center (semi-transparent) */}
        <mesh position={[0, 0.1, 0]}>
          <circleGeometry args={[0.22, 32]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.2}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Handle */}
        <mesh position={[0.28, -0.25, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.05, 0.04, 0.35, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Sparkle/star for Design step
function DesignIcon({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.6}>
      <group ref={groupRef}>
        {/* Central sparkle - octahedron */}
        <mesh>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        {/* Surrounding smaller sparkles */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 2) * 0.45,
              Math.sin((i * Math.PI) / 2) * 0.45,
              0,
            ]}
            scale={0.4}
          >
            <octahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Lightning bolt for Develop step
function DevelopIcon({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      // Subtle pulse effect
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Lightning bolt top */}
        <mesh position={[0.05, 0.15, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.18, 0.45, 4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        {/* Lightning bolt bottom */}
        <mesh position={[-0.05, -0.2, 0]} rotation={[Math.PI, 0, 0.3]}>
          <coneGeometry args={[0.14, 0.35, 4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Rocket for Deploy step
function DeployIcon({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      // Upward bobbing motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.03;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.3} floatIntensity={0.7}>
      <group ref={groupRef}>
        {/* Rocket nose cone */}
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.12, 0.25, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
        {/* Rocket body */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.4, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
        {/* Rocket base */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.14, 0.1, 0.15, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
        {/* Fins */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI * 2) / 3) * 0.14,
              -0.2,
              Math.sin((i * Math.PI * 2) / 3) * 0.14,
            ]}
            rotation={[0, (i * Math.PI * 2) / 3, 0]}
          >
            <boxGeometry args={[0.02, 0.12, 0.08]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.25}
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>
        ))}
        {/* Engine glow */}
        <mesh position={[0, -0.32, 0]}>
          <coneGeometry args={[0.08, 0.15, 8]} />
          <meshBasicMaterial color="#ff6b35" transparent opacity={0.8} />
        </mesh>
      </group>
    </Float>
  );
}

const IconComponents: Record<IconType, React.FC<{ color: string }>> = {
  discovery: DiscoveryIcon,
  design: DesignIcon,
  develop: DevelopIcon,
  deploy: DeployIcon,
};

// Extract a single color from Tailwind gradient class
function getColorFromGradient(gradientClass: string): string {
  if (gradientClass.includes("cyan")) return "#22d3ee";
  if (gradientClass.includes("pink")) return "#f472b6";
  if (gradientClass.includes("blue")) return "#3b82f6";
  if (gradientClass.includes("purple")) return "#a855f7";
  return "#8b5cf6"; // Default violet
}

// Memoized 3D icon component
export const ProcessIcon3D = memo(function ProcessIcon3D({
  type,
  accentColor,
  fallbackIcon,
  isMobile,
}: ProcessIcon3DProps) {
  const color = getColorFromGradient(accentColor);
  const IconComponent = IconComponents[type];

  // On mobile, use 2D fallback for performance
  if (isMobile) {
    return <span className="text-3xl">{fallbackIcon}</span>;
  }

  return (
    <div className="h-full w-full">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
        }}
        camera={{ position: [0, 0, 2], fov: 45 }}
        style={{ background: "transparent" }}
        frameloop="demand"
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Ambient light for base illumination */}
          <ambientLight intensity={0.4} />
          {/* Point light with icon color for glow effect */}
          <pointLight position={[1.5, 1.5, 2]} intensity={1.2} color={color} />
          <pointLight
            position={[-1.5, -1, 2]}
            intensity={0.6}
            color={color}
          />
          <IconComponent color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
});
