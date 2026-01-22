"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

interface DataPoint {
  lat: number;
  lng: number;
  label: string;
  value: number;
  color?: string;
}

interface GlobeVisualizationProps {
  data?: DataPoint[];
  radius?: number;
  showConnections?: boolean;
}

// Sample data points (major cities with fictional data values)
const defaultData: DataPoint[] = [
  { lat: 40.7128, lng: -74.006, label: "New York", value: 850 },
  { lat: 51.5074, lng: -0.1278, label: "London", value: 720 },
  { lat: 35.6762, lng: 139.6503, label: "Tokyo", value: 940 },
  { lat: -33.8688, lng: 151.2093, label: "Sydney", value: 580 },
  { lat: 48.8566, lng: 2.3522, label: "Paris", value: 650 },
  { lat: -23.5505, lng: -46.6333, label: "Sao Paulo", value: 490 },
  { lat: 55.7558, lng: 37.6173, label: "Moscow", value: 420 },
  { lat: 1.3521, lng: 103.8198, label: "Singapore", value: 780 },
  { lat: 37.7749, lng: -122.4194, label: "San Francisco", value: 920 },
  { lat: 31.2304, lng: 121.4737, label: "Shanghai", value: 880 },
];

// Convert lat/lng to 3D position on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

interface DataPointMarkerProps {
  position: THREE.Vector3;
  label: string;
  value: number;
  color: string;
  maxValue: number;
}

function DataPointMarker({ position, label, value, color, maxValue }: DataPointMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // Scale based on value
  const scale = 0.03 + (value / maxValue) * 0.05;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Pulsing effect
    const pulse = Math.sin(time * 3 + position.x) * 0.2 + 1;
    meshRef.current.scale.setScalar(scale * (hovered ? 1.5 : pulse));
  });

  return (
    <group position={position}>
      {/* Main point */}
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
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glow ring */}
      <mesh scale={scale * 2}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.5 : 0.2}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Tooltip */}
      {hovered && (
        <Html
          position={[0, 0.15, 0]}
          center
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div className="whitespace-nowrap rounded-lg bg-black/80 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-xs font-medium text-white/70">{label}</p>
            <p className="text-lg font-bold text-white">{value.toLocaleString()}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

interface ConnectionLineProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}

function ConnectionLine({ start, end, color }: ConnectionLineProps) {
  // Create curved path between points
  const points = useMemo(() => {
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    midPoint.normalize().multiplyScalar(1.2 + distance * 0.1); // Arc outward

    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    return curve.getPoints(32).map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [start, end]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}

export function GlobeVisualization({
  data = defaultData,
  radius = 1.2,
  showConnections = true,
}: GlobeVisualizationProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const globeRef = useRef<THREE.Mesh>(null!);

  // Calculate positions and max value
  const maxValue = Math.max(...data.map((d) => d.value));
  const positions = useMemo(
    () => data.map((d) => latLngToVector3(d.lat, d.lng, radius)),
    [data, radius]
  );

  // Generate connections (connect nearby points)
  const connections = useMemo(() => {
    if (!showConnections) return [];
    const conns: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        // Connect if within certain distance
        if (positions[i].distanceTo(positions[j]) < 2) {
          conns.push({ start: positions[i], end: positions[j] });
        }
      }
    }
    return conns;
  }, [positions, showConnections]);

  // Slow rotation
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Globe sphere with wireframe */}
      <Sphere ref={globeRef} args={[radius, 64, 64]}>
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.3}
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[radius * 1.002, 32, 32]}>
        <meshBasicMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* Latitude/Longitude lines */}
      <Sphere args={[radius * 1.001, 16, 8]}>
        <meshBasicMaterial
          color="#6d28d9"
          wireframe
          transparent
          opacity={0.1}
        />
      </Sphere>

      {/* Connection lines */}
      {connections.map((conn, i) => (
        <ConnectionLine
          key={`conn-${i}`}
          start={conn.start}
          end={conn.end}
          color="#a78bfa"
        />
      ))}

      {/* Data point markers */}
      {data.map((point, index) => (
        <DataPointMarker
          key={point.label}
          position={positions[index]}
          label={point.label}
          value={point.value}
          color={point.color || "#8b5cf6"}
          maxValue={maxValue}
        />
      ))}

      {/* Atmosphere glow */}
      <Sphere args={[radius * 1.15, 32, 32]}>
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      {/* Ambient point light */}
      <pointLight position={[2, 2, 2]} intensity={0.3} color="#a78bfa" />
    </group>
  );
}
