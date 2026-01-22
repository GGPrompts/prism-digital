"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

interface Node {
  id: string;
  label: string;
  group?: string;
  size?: number;
}

interface Edge {
  source: string;
  target: string;
  weight?: number;
}

interface NetworkGraphProps {
  nodes?: Node[];
  edges?: Edge[];
  spread?: number;
}

// Default network data - a simple interconnected graph
const defaultNodes: Node[] = [
  { id: "1", label: "API Gateway", group: "core", size: 1.2 },
  { id: "2", label: "Auth Service", group: "services" },
  { id: "3", label: "User DB", group: "data" },
  { id: "4", label: "Cache Layer", group: "data" },
  { id: "5", label: "Analytics", group: "services" },
  { id: "6", label: "Notifications", group: "services" },
  { id: "7", label: "Storage", group: "data" },
  { id: "8", label: "CDN", group: "core" },
  { id: "9", label: "Load Balancer", group: "core", size: 1.3 },
  { id: "10", label: "Message Queue", group: "services" },
];

const defaultEdges: Edge[] = [
  { source: "9", target: "1", weight: 3 },
  { source: "1", target: "2", weight: 2 },
  { source: "1", target: "5", weight: 2 },
  { source: "1", target: "6", weight: 1 },
  { source: "2", target: "3", weight: 2 },
  { source: "2", target: "4", weight: 1 },
  { source: "5", target: "3", weight: 1 },
  { source: "6", target: "10", weight: 2 },
  { source: "7", target: "8", weight: 2 },
  { source: "1", target: "7", weight: 1 },
  { source: "4", target: "3", weight: 1 },
  { source: "10", target: "5", weight: 1 },
];

const groupColors: Record<string, string> = {
  core: "#8b5cf6",    // Purple
  services: "#a78bfa", // Light purple
  data: "#6d28d9",    // Dark purple
};

interface NetworkNodeProps {
  position: THREE.Vector3;
  label: string;
  group: string;
  size: number;
  isConnected: boolean;
  index: number;
}

function NetworkNode({ position, label, group, size, index }: NetworkNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const color = groupColors[group] || "#8b5cf6";
  const baseColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Gentle floating motion
    const floatY = Math.sin(time * 0.5 + index) * 0.05;
    const floatX = Math.cos(time * 0.3 + index * 0.5) * 0.03;
    meshRef.current.position.x = position.x + floatX;
    meshRef.current.position.y = position.y + floatY;
    meshRef.current.position.z = position.z;

    // Pulsing scale on hover
    if (hovered) {
      const pulse = Math.sin(time * 4) * 0.05 + 1.15;
      meshRef.current.scale.setScalar(size * pulse);
    } else {
      meshRef.current.scale.setScalar(size);
    }
  });

  return (
    <group>
      {/* Main node sphere */}
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
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={hovered ? 0.6 : 0.3}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh position={position} scale={size * 1.5}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.4 : 0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Tooltip */}
      {hovered && (
        <Html
          position={[position.x, position.y + 0.25, position.z]}
          center
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div className="whitespace-nowrap rounded-lg bg-black/80 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-sm font-bold text-white">{label}</p>
            <p className="text-xs text-white/60">{group}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

interface NetworkEdgeProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  weight: number;
}

function NetworkEdge({ start, end, weight }: NetworkEdgeProps) {
  const points = useMemo(
    () => [
      [start.x, start.y, start.z] as [number, number, number],
      [end.x, end.y, end.z] as [number, number, number],
    ],
    [start, end]
  );

  return (
    <Line
      points={points}
      color="#a78bfa"
      lineWidth={weight}
      transparent
      opacity={0.4}
    />
  );
}

export function NetworkGraph({
  nodes = defaultNodes,
  edges = defaultEdges,
  spread = 1.5,
}: NetworkGraphProps) {
  const groupRef = useRef<THREE.Group>(null!);

  // Calculate node positions using a simple force-directed layout (pre-computed)
  const nodePositions = useMemo(() => {
    const positions: Record<string, THREE.Vector3> = {};
    const n = nodes.length;

    // Arrange nodes in a 3D spherical layout
    nodes.forEach((node, i) => {
      // Use golden angle for even distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = Math.sin(phi) * Math.cos(theta) * spread;
      const y = Math.sin(phi) * Math.sin(theta) * spread;
      const z = Math.cos(phi) * spread * 0.5;

      positions[node.id] = new THREE.Vector3(x, y, z);
    });

    return positions;
  }, [nodes, spread]);

  // Get connected nodes for each node
  const connectedNodes = useMemo(() => {
    const connected: Record<string, Set<string>> = {};
    nodes.forEach((node) => {
      connected[node.id] = new Set();
    });
    edges.forEach((edge) => {
      connected[edge.source]?.add(edge.target);
      connected[edge.target]?.add(edge.source);
    });
    return connected;
  }, [nodes, edges]);

  // Subtle rotation
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Edges */}
      {edges.map((edge, i) => {
        const startPos = nodePositions[edge.source];
        const endPos = nodePositions[edge.target];
        if (!startPos || !endPos) return null;

        return (
          <NetworkEdge
            key={`edge-${i}`}
            start={startPos}
            end={endPos}
            weight={edge.weight || 1}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, index) => {
        const position = nodePositions[node.id];
        if (!position) return null;

        return (
          <NetworkNode
            key={node.id}
            position={position}
            label={node.label}
            group={node.group || "default"}
            size={node.size || 1}
            isConnected={connectedNodes[node.id]?.size > 0}
            index={index}
          />
        );
      })}

      {/* Central point light */}
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#8b5cf6" distance={5} />
    </group>
  );
}
