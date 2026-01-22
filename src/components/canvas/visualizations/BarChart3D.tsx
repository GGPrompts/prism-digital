"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChart3DProps {
  data?: DataPoint[];
  maxHeight?: number;
  barWidth?: number;
  barGap?: number;
  showLabels?: boolean;
}

const defaultData: DataPoint[] = [
  { label: "Q1 2024", value: 85 },
  { label: "Q2 2024", value: 120 },
  { label: "Q3 2024", value: 95 },
  { label: "Q4 2024", value: 150 },
  { label: "Q1 2025", value: 180 },
  { label: "Q2 2025", value: 145 },
  { label: "Q3 2025", value: 210 },
];

const colorPalette = [
  "#8b5cf6", // violet-500
  "#a78bfa", // violet-400
  "#7c3aed", // violet-600
  "#c4b5fd", // violet-300
  "#6d28d9", // violet-700
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
];

interface BarProps {
  position: [number, number, number];
  targetHeight: number;
  width: number;
  depth: number;
  color: string;
  label: string;
  value: number;
  index: number;
}

function Bar({ position, targetHeight, width, depth, color, label, value, index }: BarProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const [hovered, setHovered] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(0.01);

  // Pre-allocate color object
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const hoverColor = useMemo(() => new THREE.Color(color).multiplyScalar(1.4), [color]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const time = state.clock.getElapsedTime();

    // Animate height on mount with staggered delay
    const delay = index * 0.1;
    const elapsed = Math.max(0, time - delay);
    const progress = Math.min(1, elapsed / 0.8);
    const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
    const newHeight = 0.01 + (targetHeight - 0.01) * eased;
    setCurrentHeight(newHeight);

    // Update mesh scale
    meshRef.current.scale.y = newHeight / targetHeight;
    meshRef.current.position.y = newHeight / 2;

    // Subtle hover glow animation
    if (hovered) {
      const pulse = Math.sin(time * 4) * 0.1 + 1.1;
      materialRef.current.emissiveIntensity = 0.3 * pulse;
    } else {
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        materialRef.current.emissiveIntensity,
        0.1,
        0.1
      );
    }

    // Interpolate color
    const targetColor = hovered ? hoverColor : baseColor;
    materialRef.current.color.lerp(targetColor, 0.1);
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, targetHeight, depth]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.1}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html
          position={[0, currentHeight + 0.3, 0]}
          center
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div className="rounded-lg bg-black/80 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-xs font-medium text-white/70">{label}</p>
            <p className="text-lg font-bold text-white">{value.toLocaleString()}</p>
          </div>
        </Html>
      )}

      {/* Base glow effect */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 1.5, depth * 1.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.3 : 0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function BarChart3D({
  data = defaultData,
  maxHeight = 2.5,
  barWidth = 0.4,
  barGap = 0.2,
}: BarChart3DProps) {
  const groupRef = useRef<THREE.Group>(null!);

  // Calculate bar dimensions
  const maxValue = Math.max(...data.map((d) => d.value));
  const totalWidth = data.length * barWidth + (data.length - 1) * barGap;
  const startX = -totalWidth / 2 + barWidth / 2;

  // Subtle rotation animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Grid floor */}
      <gridHelper
        args={[6, 12, "#8b5cf6", "#3b3b5c"]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Bars */}
      {data.map((item, index) => {
        const height = (item.value / maxValue) * maxHeight;
        const x = startX + index * (barWidth + barGap);
        const color = item.color || colorPalette[index % colorPalette.length];

        return (
          <Bar
            key={item.label}
            position={[x, 0, 0]}
            targetHeight={height}
            width={barWidth}
            depth={barWidth}
            color={color}
            label={item.label}
            value={item.value}
            index={index}
          />
        );
      })}

      {/* Ambient lighting enhancement */}
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#a78bfa" />
    </group>
  );
}
