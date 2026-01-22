"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

interface DataPoint {
  x: number;
  y: number;
  z: number;
  label?: string;
  value?: number;
  category?: string;
}

interface ScatterPlot3DProps {
  data?: DataPoint[];
  size?: number;
  showAxes?: boolean;
}

// Generate sample data clusters
const generateClusterData = (): DataPoint[] => {
  const points: DataPoint[] = [];
  const categories = ["Cluster A", "Cluster B", "Cluster C"];

  // Cluster centers
  const centers = [
    { x: -0.6, y: 0.5, z: -0.3 },
    { x: 0.5, y: -0.4, z: 0.4 },
    { x: 0.1, y: 0.3, z: -0.5 },
  ];

  centers.forEach((center, clusterIndex) => {
    const numPoints = 25 + Math.floor(Math.random() * 15);
    for (let i = 0; i < numPoints; i++) {
      // Random offset from cluster center
      const spread = 0.3;
      points.push({
        x: center.x + (Math.random() - 0.5) * spread,
        y: center.y + (Math.random() - 0.5) * spread,
        z: center.z + (Math.random() - 0.5) * spread,
        label: `Point ${points.length + 1}`,
        value: Math.floor(Math.random() * 100) + 50,
        category: categories[clusterIndex],
      });
    }
  });

  return points;
};

const categoryColors: Record<string, string> = {
  "Cluster A": "#8b5cf6",
  "Cluster B": "#a78bfa",
  "Cluster C": "#c4b5fd",
};

interface ScatterPointProps {
  position: [number, number, number];
  label: string;
  value: number;
  category: string;
  index: number;
}

function ScatterPoint({ position, label, value, category, index }: ScatterPointProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const color = categoryColors[category] || "#8b5cf6";

  // Staggered appearance animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 20);
    return () => clearTimeout(timer);
  }, [index]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Subtle floating animation
    const floatY = Math.sin(time * 0.8 + index * 0.3) * 0.01;
    meshRef.current.position.y = position[1] + floatY;

    // Scale animation on appear
    if (visible) {
      const targetScale = hovered ? 0.035 : 0.025;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
      );
    } else {
      meshRef.current.scale.setScalar(0.001);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Tooltip */}
      {hovered && (
        <Html
          position={position}
          center
          style={{
            pointerEvents: "none",
            userSelect: "none",
            transform: "translateY(-30px)",
          }}
        >
          <div className="whitespace-nowrap rounded-lg bg-black/80 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-xs text-white/60">{category}</p>
            <p className="text-sm font-bold text-white">{label}</p>
            <p className="text-sm text-white/80">Value: {value}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Axes({ size }: { size: number }) {
  const axisLength = size * 0.6;

  return (
    <group>
      {/* X Axis */}
      <Line
        points={[[-axisLength, 0, 0], [axisLength, 0, 0]]}
        color="#8b5cf6"
        lineWidth={1}
        transparent
        opacity={0.5}
      />

      {/* Y Axis */}
      <Line
        points={[[0, -axisLength, 0], [0, axisLength, 0]]}
        color="#a78bfa"
        lineWidth={1}
        transparent
        opacity={0.5}
      />

      {/* Z Axis */}
      <Line
        points={[[0, 0, -axisLength], [0, 0, axisLength]]}
        color="#c4b5fd"
        lineWidth={1}
        transparent
        opacity={0.5}
      />

      {/* Axis labels */}
      <Html position={[axisLength + 0.1, 0, 0]} center>
        <span className="text-xs font-medium text-purple-400">X</span>
      </Html>
      <Html position={[0, axisLength + 0.1, 0]} center>
        <span className="text-xs font-medium text-purple-300">Y</span>
      </Html>
      <Html position={[0, 0, axisLength + 0.1]} center>
        <span className="text-xs font-medium text-purple-200">Z</span>
      </Html>
    </group>
  );
}

export function ScatterPlot3D({
  data,
  size = 1.5,
  showAxes = true,
}: ScatterPlot3DProps) {
  const groupRef = useRef<THREE.Group>(null!);

  // Use provided data or generate default
  const plotData = useMemo(() => data || generateClusterData(), [data]);

  // Normalize data to fit within size bounds
  const normalizedData = useMemo(() => {
    const xValues = plotData.map((d) => d.x);
    const yValues = plotData.map((d) => d.y);
    const zValues = plotData.map((d) => d.z);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);

    const normalize = (val: number, min: number, max: number) =>
      max === min ? 0 : ((val - min) / (max - min) - 0.5) * size;

    return plotData.map((point) => ({
      ...point,
      normalizedX: normalize(point.x, xMin, xMax),
      normalizedY: normalize(point.y, yMin, yMax),
      normalizedZ: normalize(point.z, zMin, zMax),
    }));
  }, [plotData, size]);

  // Subtle rotation
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Grid planes */}
      <gridHelper
        args={[size * 1.2, 10, "#3b3b5c", "#2a2a4a"]}
        position={[0, -size / 2, 0]}
      />

      {/* Axes */}
      {showAxes && <Axes size={size} />}

      {/* Data points */}
      {normalizedData.map((point, index) => (
        <ScatterPoint
          key={`point-${index}`}
          position={[point.normalizedX, point.normalizedY, point.normalizedZ]}
          label={point.label || `Point ${index + 1}`}
          value={point.value || 0}
          category={point.category || "Default"}
          index={index}
        />
      ))}

      {/* Bounding box wireframe */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 1.1, size * 1.1, size * 1.1]} />
        <meshBasicMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Ambient lighting */}
      <pointLight position={[1, 2, 1]} intensity={0.4} color="#a78bfa" />
    </group>
  );
}
