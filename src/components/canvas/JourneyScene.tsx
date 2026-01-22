"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSplinePath, JOURNEY_WAYPOINTS, JOURNEY_LOOK_TARGETS } from "@/hooks/useSplinePath";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface JourneySceneProps {
  scrollProgress: number;
  device: DeviceCapabilities;
}

// Pre-allocate objects to avoid GC pressure in animation loops
const tempColor = new THREE.Color();
const tempObject = new THREE.Object3D();

// Seeded random for deterministic generation
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Main 3D scene for the scroll journey experience.
 * Camera flies through 4 distinct scenes as user scrolls.
 */
export function JourneyScene({ scrollProgress, device }: JourneySceneProps) {
  const { camera } = useThree();
  const smoothProgressRef = useRef(0);
  const [renderProgress, setRenderProgress] = useState(0);

  // Spline path for camera movement
  const cameraPath = useSplinePath({
    points: JOURNEY_WAYPOINTS,
    tension: 0.3,
  });

  // Spline path for look-at targets
  const lookAtPath = useSplinePath({
    points: JOURNEY_LOOK_TARGETS,
    tension: 0.3,
  });

  // Smoothly interpolate camera position and update render state
  useFrame((state) => {
    // Smooth scroll progress (lerp for buttery movement)
    const lerpSpeed = device.isMobile ? 0.03 : 0.05;
    smoothProgressRef.current = THREE.MathUtils.lerp(
      smoothProgressRef.current,
      scrollProgress,
      lerpSpeed
    );

    // Update state for child components (throttled to prevent excessive re-renders)
    const newProgress = Math.round(smoothProgressRef.current * 1000) / 1000;
    if (Math.abs(newProgress - renderProgress) > 0.005) {
      setRenderProgress(newProgress);
    }

    // Get camera position and look-at target from splines
    const cameraPos = cameraPath.getPoint(smoothProgressRef.current);
    const lookAtTarget = lookAtPath.getPoint(smoothProgressRef.current);

    // Apply position with subtle breathing motion
    const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    camera.position.set(cameraPos.x, cameraPos.y + breathe, cameraPos.z);

    // Smooth look-at
    camera.lookAt(lookAtTarget);
  });

  return (
    <>
      {/* Dynamic fog based on scroll progress */}
      <JourneyFog progress={renderProgress} />

      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />

      {/* Scene 1: Void Opening (0-0.25) */}
      <VoidScene progress={renderProgress} device={device} />

      {/* Scene 2: Geometric Structures (0.2-0.5) */}
      <GeometricScene progress={renderProgress} device={device} />

      {/* Scene 3: Portal (0.45-0.75) */}
      <PortalScene progress={renderProgress} device={device} />

      {/* Scene 4: Crystalline Vista (0.7-1.0) */}
      <CrystallineScene progress={renderProgress} device={device} />

      {/* Star field background */}
      <StarField device={device} />
    </>
  );
}

/**
 * Dynamic fog that changes color and density based on scroll progress
 */
function JourneyFog({ progress }: { progress: number }) {
  const fogRef = useRef<THREE.Fog>(null);

  // Color transitions for each scene
  const fogColors = useMemo(
    () => [
      new THREE.Color("#0a0a0f"), // Void - deep dark
      new THREE.Color("#1a1025"), // Geometric - purple tint
      new THREE.Color("#0f1520"), // Portal - blue tint
      new THREE.Color("#15101a"), // Crystal - violet tint
    ],
    []
  );

  useFrame(() => {
    if (!fogRef.current) return;

    // Determine which colors to blend
    const segment = progress * 3;
    const index = Math.floor(segment);
    const blend = segment - index;

    const fromColor = fogColors[Math.min(index, fogColors.length - 1)];
    const toColor = fogColors[Math.min(index + 1, fogColors.length - 1)];

    tempColor.copy(fromColor).lerp(toColor, blend);
    fogRef.current.color.copy(tempColor);

    // Adjust fog density based on scene
    const nearBase = 5;
    const farBase = 40;
    const densityMultiplier = progress < 0.5 ? 1 : 1.2; // Denser in later scenes
    fogRef.current.near = nearBase * densityMultiplier;
    fogRef.current.far = farBase * densityMultiplier;
  });

  return <fog ref={fogRef} attach="fog" args={["#0a0a0f", 5, 40]} />;
}

/**
 * Scene 1: Void Opening - Floating in empty space with distant particles
 */
function VoidScene({ progress, device }: { progress: number; device: DeviceCapabilities }) {
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = device.isMobile ? 50 : 100;

  // Create distant glowing orbs with seeded random for deterministic results
  const particles = useMemo(() => {
    const random = seededRandom(12345);
    const data = new Float32Array(particleCount * 4); // x, y, z, size
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 4;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const radius = 15 + random() * 25;

      data[idx] = Math.sin(phi) * Math.cos(theta) * radius;
      data[idx + 1] = Math.sin(phi) * Math.sin(theta) * radius;
      data[idx + 2] = Math.cos(phi) * radius - 20; // Offset to be ahead of camera
      data[idx + 3] = 0.1 + random() * 0.3;
    }
    return data;
  }, [particleCount]);

  // Visibility fades out as we leave this scene
  const opacity = useMemo(() => {
    if (progress > 0.3) return Math.max(0, 1 - (progress - 0.3) / 0.15);
    return 1;
  }, [progress]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef}>
      {Array.from({ length: particleCount }).map((_, i) => {
        const idx = i * 4;
        return (
          <mesh
            key={i}
            position={[particles[idx], particles[idx + 1], particles[idx + 2]]}
          >
            <sphereGeometry args={[particles[idx + 3], 8, 8]} />
            <meshBasicMaterial
              color="#8b5cf6"
              transparent
              opacity={opacity * 0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Scene 2: Geometric Structures - Rotating polyhedrons
 */
function GeometricScene({ progress, device }: { progress: number; device: DeviceCapabilities }) {
  const groupRef = useRef<THREE.Group>(null);

  // Shape configurations - static data, no random
  const shapes = useMemo(() => {
    const configs = [
      { pos: [5, 2, 5] as [number, number, number], scale: 1.2, geometry: "octahedron", color: "#a78bfa" },
      { pos: [-4, -1, 3] as [number, number, number], scale: 0.8, geometry: "tetrahedron", color: "#c4b5fd" },
      { pos: [3, -2, -2] as [number, number, number], scale: 1.0, geometry: "dodecahedron", color: "#8b5cf6" },
      { pos: [-3, 3, 0] as [number, number, number], scale: 0.6, geometry: "icosahedron", color: "#ddd6fe" },
      { pos: [0, 0, 2] as [number, number, number], scale: 1.5, geometry: "octahedron", color: "#7c3aed" },
    ];
    return device.isMobile ? configs.slice(0, 3) : configs;
  }, [device.isMobile]);

  // Visibility: fade in around 0.15, full at 0.25-0.45, fade out after 0.5
  const opacity = useMemo(() => {
    if (progress < 0.15) return 0;
    if (progress < 0.25) return (progress - 0.15) / 0.1;
    if (progress > 0.55) return Math.max(0, 1 - (progress - 0.55) / 0.1);
    return 1;
  }, [progress]);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle rotation
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <RotatingShape
          key={i}
          position={shape.pos}
          scale={shape.scale}
          geometryType={shape.geometry}
          color={shape.color}
          opacity={opacity}
          rotationOffset={i * 0.5}
        />
      ))}
    </group>
  );
}

interface RotatingShapeProps {
  position: [number, number, number];
  scale: number;
  geometryType: string;
  color: string;
  opacity: number;
  rotationOffset: number;
}

function RotatingShape({
  position,
  scale,
  geometryType,
  color,
  opacity,
  rotationOffset,
}: RotatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 + rotationOffset;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 + rotationOffset;
  });

  const geometry = useMemo(() => {
    switch (geometryType) {
      case "tetrahedron":
        return <tetrahedronGeometry args={[1, 0]} />;
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "dodecahedron":
        return <dodecahedronGeometry args={[1, 0]} />;
      case "icosahedron":
        return <icosahedronGeometry args={[1, 0]} />;
      default:
        return <octahedronGeometry args={[1, 0]} />;
    }
  }, [geometryType]);

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {geometry}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={opacity * 0.8}
        wireframe
      />
    </mesh>
  );
}

/**
 * Scene 3: Portal - A glowing ring/torus that camera flies through
 */
function PortalScene({ progress, device }: { progress: number; device: DeviceCapabilities }) {
  const portalRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  // Visibility: fade in at 0.4, full 0.5-0.65, fade out after 0.75
  const opacity = useMemo(() => {
    if (progress < 0.4) return 0;
    if (progress < 0.5) return (progress - 0.4) / 0.1;
    if (progress > 0.75) return Math.max(0, 1 - (progress - 0.75) / 0.1);
    return 1;
  }, [progress]);

  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      ringsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  if (opacity <= 0) return null;

  const ringSegments = device.isMobile ? 32 : 64;

  return (
    <group position={[0, 0, -3]}>
      {/* Main portal torus */}
      <mesh ref={portalRef}>
        <torusGeometry args={[4, 0.15, 16, ringSegments]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.8}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Inner glow ring */}
      <mesh>
        <torusGeometry args={[3.5, 0.08, 16, ringSegments]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={opacity * 0.6}
        />
      </mesh>

      {/* Outer decorative rings */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[5, 0.05, 8, ringSegments]} />
          <meshBasicMaterial
            color="#a78bfa"
            transparent
            opacity={opacity * 0.3}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[5.5, 0.05, 8, ringSegments]} />
          <meshBasicMaterial
            color="#c4b5fd"
            transparent
            opacity={opacity * 0.2}
          />
        </mesh>
      </group>

      {/* Portal glow point light */}
      <pointLight
        color="#06b6d4"
        intensity={opacity * 3}
        distance={15}
        decay={2}
      />
    </group>
  );
}

/**
 * Scene 4: Crystalline Vista - Cluster of crystal formations
 */
function CrystallineScene({ progress, device }: { progress: number; device: DeviceCapabilities }) {
  const groupRef = useRef<THREE.Group>(null);

  // Crystal configurations with seeded random
  const crystals = useMemo(() => {
    const random = seededRandom(67890);
    const count = device.isMobile ? 12 : 24;
    const configs = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3 + random() * 5;
      const height = -12 + random() * 4;

      configs.push({
        position: [
          Math.cos(angle) * radius,
          height + random() * 2 - 1,
          Math.sin(angle) * radius - 15,
        ] as [number, number, number],
        scale: 0.3 + random() * 0.5,
        rotation: random() * Math.PI,
        color: i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#a78bfa" : "#c4b5fd",
      });
    }

    return configs;
  }, [device.isMobile]);

  // Visibility: fade in at 0.65, full after 0.75
  const opacity = useMemo(() => {
    if (progress < 0.65) return 0;
    if (progress < 0.75) return (progress - 0.65) / 0.1;
    return 1;
  }, [progress]);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Subtle sway
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef}>
      {crystals.map((crystal, i) => (
        <Crystal
          key={i}
          position={crystal.position}
          scale={crystal.scale}
          rotation={crystal.rotation}
          color={crystal.color}
          opacity={opacity}
        />
      ))}

      {/* Central large crystal */}
      <Crystal
        position={[0, -10, -18]}
        scale={1.5}
        rotation={0}
        color="#7c3aed"
        opacity={opacity}
      />

      {/* Ambient crystal glow */}
      <pointLight
        position={[0, -8, -15]}
        color="#8b5cf6"
        intensity={opacity * 2}
        distance={20}
        decay={2}
      />
    </group>
  );
}

interface CrystalProps {
  position: [number, number, number];
  scale: number;
  rotation: number;
  color: string;
  opacity: number;
}

function Crystal({ position, scale, rotation, color, opacity }: CrystalProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Hexagonal prism geometry for crystal
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = 0.5;

    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }

    const extrudeSettings = {
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Gentle pulsing
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + rotation) * 0.05;
    meshRef.current.scale.setScalar(scale * pulse);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[Math.PI / 2, rotation, 0]}
      scale={scale}
      geometry={geometry}
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={opacity * 0.7}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

/**
 * Background star field that persists throughout the journey
 */
function StarField({ device }: { device: DeviceCapabilities }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const starCount = device.isMobile ? 200 : 500;

  // Generate star positions with seeded random
  const starData = useMemo(() => {
    const random = seededRandom(11111);
    const positions = new Float32Array(starCount * 3);
    const scales = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      // Spread stars in a large sphere around the scene
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const radius = 50 + random() * 50;

      positions[idx] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[idx + 1] = Math.sin(phi) * Math.sin(theta) * radius;
      positions[idx + 2] = Math.cos(phi) * radius;
      scales[i] = 0.02 + random() * 0.05;
    }

    return { positions, scales };
  }, [starCount]);

  // Set up instanced mesh transforms
  useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      tempObject.position.set(
        starData.positions[idx],
        starData.positions[idx + 1],
        starData.positions[idx + 2]
      );
      tempObject.scale.setScalar(starData.scales[i]);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [starCount, starData]);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Very slow rotation for parallax effect
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.005;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, starCount]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  );
}
