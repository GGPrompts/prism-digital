'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D background scene for Testimonials section
 * Subtle floating geometric shapes that respond to scroll
 */
export default function TestimonialsScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const sphere1Ref = useRef<THREE.Mesh>(null);
  const sphere2Ref = useRef<THREE.Mesh>(null);
  const sphere3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Slow group rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05 + scrollProgress * Math.PI * 0.2;
    }

    // Individual sphere animations with organic movement
    if (sphere1Ref.current) {
      sphere1Ref.current.position.y = Math.sin(time * 0.3) * 0.3;
      sphere1Ref.current.rotation.z = time * 0.2;
    }

    if (sphere2Ref.current) {
      sphere2Ref.current.position.y = Math.cos(time * 0.4) * 0.4;
      sphere2Ref.current.rotation.x = time * 0.15;
    }

    if (sphere3Ref.current) {
      sphere3Ref.current.position.y = Math.sin(time * 0.5 + 1) * 0.2;
      sphere3Ref.current.rotation.y = time * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main distorted sphere - left side */}
      <Sphere
        ref={sphere1Ref}
        args={[1.2, 64, 64]}
        position={[-3, 0, -5]}
      >
        <MeshDistortMaterial
          color="#a855f7"
          transparent
          opacity={0.15}
          distort={0.4}
          speed={1.5}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>

      {/* Secondary sphere - right side */}
      <Sphere
        ref={sphere2Ref}
        args={[0.8, 64, 64]}
        position={[4, 1, -6]}
      >
        <MeshDistortMaterial
          color="#22d3ee"
          transparent
          opacity={0.12}
          distort={0.3}
          speed={2}
          roughness={0.7}
          metalness={0.2}
        />
      </Sphere>

      {/* Accent sphere - center back */}
      <Sphere
        ref={sphere3Ref}
        args={[0.6, 64, 64]}
        position={[0, -1, -7]}
      >
        <MeshDistortMaterial
          color="#f472b6"
          transparent
          opacity={0.1}
          distort={0.5}
          speed={1.8}
          roughness={0.6}
          metalness={0.15}
        />
      </Sphere>

      {/* Ambient lighting for subtle glow */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#a855f7" />
    </group>
  );
}
