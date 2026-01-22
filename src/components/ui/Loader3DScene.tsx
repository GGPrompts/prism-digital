"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

interface LoaderPrismProps {
  progress: number;
}

/**
 * Rotating prism mesh for loader
 * Uses simple materials for fast loading
 */
function LoaderPrism({ progress }: LoaderPrismProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  // Pre-allocate rotation values to avoid GC in useFrame
  const smoothRotation = useRef({ y: 0, x: 0, z: 0 });

  // Create triangular prism geometry
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const size = 1;

    // Equilateral triangle
    shape.moveTo(0, size);
    shape.lineTo(-size * 0.866, -size * 0.5);
    shape.lineTo(size * 0.866, -size * 0.5);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 1.2,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Rotation speed increases slightly with progress (0.3 -> 0.5 rad/s)
    const rotationSpeed = 0.3 + (progress / 100) * 0.2;

    // Target rotation based on time
    const targetY = time * rotationSpeed;
    const targetX = Math.sin(time * 0.3) * 0.15;
    const targetZ = Math.cos(time * 0.2) * 0.08;

    // Smooth lerp to target
    smoothRotation.current.y = THREE.MathUtils.lerp(
      smoothRotation.current.y,
      targetY,
      0.1
    );
    smoothRotation.current.x = THREE.MathUtils.lerp(
      smoothRotation.current.x,
      targetX,
      0.05
    );
    smoothRotation.current.z = THREE.MathUtils.lerp(
      smoothRotation.current.z,
      targetZ,
      0.05
    );

    meshRef.current.rotation.set(
      smoothRotation.current.x,
      smoothRotation.current.y,
      smoothRotation.current.z
    );

    // Pulse scale effect (1.0 -> 1.1)
    const pulse = 1 + Math.sin(time * 2) * 0.05;
    meshRef.current.scale.setScalar(pulse);

    // Sync glow mesh
    if (glowRef.current) {
      glowRef.current.rotation.copy(meshRef.current.rotation);
      glowRef.current.scale.setScalar(pulse * 1.15);
    }
  });

  return (
    <group position={[0, 0, -0.6]}>
      {/* Point lights for purple glow */}
      <pointLight position={[2, 1, 2]} intensity={1.5} color="#a855f7" />
      <pointLight position={[-2, -1, 1]} intensity={1} color="#6366f1" />

      {/* Main prism mesh */}
      <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#e9d5ff"
          emissive="#a855f7"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.7}
          clearcoat={1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer glow mesh */}
      <mesh ref={glowRef} geometry={geometry} frustumCulled={false}>
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Post-processing effects for loader
 * Simplified bloom for glow effect
 */
function LoaderEffects() {
  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        mipmapBlur={false}
        radius={0.4}
        blendFunction={BlendFunction.ADD}
      />
    </EffectComposer>
  );
}

interface Loader3DSceneProps {
  progress: number;
}

/**
 * 3D Loader Scene
 *
 * Renders a rotating prism with bloom glow effect.
 * Uses simple materials for fast initial load.
 */
export function Loader3DScene({ progress }: Loader3DSceneProps) {
  return (
    <Canvas
      className="!w-32 !h-32"
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3], fov: 50 }}
      frameloop="always"
    >
      <ambientLight intensity={0.3} />
      <LoaderPrism progress={progress} />
      <LoaderEffects />
    </Canvas>
  );
}
