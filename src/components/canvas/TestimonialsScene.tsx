'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const HELIX_PARTICLE_COUNT = 600;

/**
 * DNA Helix particle system for visual interest
 */
function DNAHelix({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Pre-allocate reusable objects
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Initialize helix particle positions
  const particles = useMemo(() => {
    // 7 floats per particle: x, y, z, phase, speed, size, colorIdx
    const data = new Float32Array(HELIX_PARTICLE_COUNT * 7);

    const helixHeight = 10;
    const helixRadius = 2.5;
    const helixTurns = 3;

    for (let i = 0; i < HELIX_PARTICLE_COUNT; i++) {
      const idx = i * 7;
      const t = i / HELIX_PARTICLE_COUNT; // normalized index 0-1

      // Double helix spiral (DNA-like)
      const strand = i % 2; // Alternate between two strands
      const helixT = t * helixTurns * Math.PI * 2;
      const helixOffset = strand * Math.PI; // Second strand offset by 180 degrees

      // Add slight randomness to make it more organic
      const radiusVariation = helixRadius + (Math.random() - 0.5) * 0.4;

      data[idx + 0] = Math.cos(helixT + helixOffset) * radiusVariation;
      data[idx + 1] = (t - 0.5) * helixHeight;
      data[idx + 2] = Math.sin(helixT + helixOffset) * radiusVariation;

      // Animation properties
      data[idx + 3] = Math.random() * Math.PI * 2; // phase
      data[idx + 4] = 0.3 + Math.random() * 0.4; // speed
      data[idx + 5] = 0.025 + Math.random() * 0.03; // size (increased)
      data[idx + 6] = Math.floor(Math.random() * 4); // colorIdx
    }

    return data;
  }, []);

  // Color palette - purple/cyan/pink theme
  const colorPalette = useMemo(
    () => [
      new THREE.Color('#a855f7'), // purple-500
      new THREE.Color('#c084fc'), // purple-400
      new THREE.Color('#22d3ee'), // cyan-400
      new THREE.Color('#f472b6'), // pink-400
    ],
    []
  );

  // Smoothed scroll value for buttery transitions
  const smoothScrollRef = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const safeScroll = Number.isFinite(scrollProgress)
      ? THREE.MathUtils.clamp(scrollProgress, 0, 1)
      : 0;

    // Smooth scroll interpolation
    smoothScrollRef.current = THREE.MathUtils.lerp(
      smoothScrollRef.current,
      safeScroll,
      0.08
    );
    const scroll = smoothScrollRef.current;

    // Testimonials section visibility: fade in from ~60% scroll, peak at ~75%, fade out after 90%
    const testimonialsStart = 0.55;
    const testimonialsPeak = 0.75;
    const testimonialsEnd = 0.95;
    let visibility = 0;
    if (scroll >= testimonialsStart && scroll <= testimonialsPeak) {
      visibility = (scroll - testimonialsStart) / (testimonialsPeak - testimonialsStart);
    } else if (scroll > testimonialsPeak && scroll <= testimonialsEnd) {
      visibility = 1 - (scroll - testimonialsPeak) / (testimonialsEnd - testimonialsPeak);
    }
    visibility = THREE.MathUtils.clamp(visibility, 0, 1);

    for (let i = 0; i < HELIX_PARTICLE_COUNT; i++) {
      const idx = i * 7;

      const x = particles[idx + 0];
      const y = particles[idx + 1];
      const z = particles[idx + 2];
      const phase = particles[idx + 3];
      const speed = particles[idx + 4];
      const size = particles[idx + 5];
      const colorIdx = particles[idx + 6];

      // Subtle pulsing motion
      const pulse = Math.sin(time * speed + phase) * 0.1;

      tempObject.position.set(
        x * (1 + pulse * 0.2),
        y,
        z * (1 + pulse * 0.2)
      );

      // Scale with pulsing and visibility
      const baseScale = size * (0.8 + Math.sin(time * 2 + phase) * 0.2) * visibility;
      tempObject.scale.setScalar(baseScale);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color with brightness modulation (pulsing glow)
      tempColor.copy(colorPalette[Math.floor(colorIdx) % colorPalette.length]);
      const brightness = (0.7 + Math.sin(time * 1.5 + phase) * 0.3) * visibility;
      tempColor.multiplyScalar(brightness);

      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // Rotate entire helix based on scroll
    meshRef.current.rotation.y = time * 0.1 + scroll * Math.PI * 0.3;
  });

  // Resource cleanup on unmount
  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((mat) => mat.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }
    };
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, HELIX_PARTICLE_COUNT]} position={[3, 0, -3]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.35}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/**
 * 3D background scene for Testimonials section
 * Subtle floating geometric shapes that respond to scroll
 */
export default function TestimonialsScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const sphere1Ref = useRef<THREE.Mesh>(null);
  const sphere2Ref = useRef<THREE.Mesh>(null);
  const sphere3Ref = useRef<THREE.Mesh>(null);

  // Resource cleanup on unmount
  useEffect(() => {
    return () => {
      [sphere1Ref, sphere2Ref, sphere3Ref].forEach((ref) => {
        if (ref.current) {
          ref.current.geometry.dispose();
          if (Array.isArray(ref.current.material)) {
            ref.current.material.forEach((mat) => mat.dispose());
          } else {
            (ref.current.material as THREE.Material).dispose();
          }
        }
      });
    };
  }, []);

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

      {/* DNA Helix particle system */}
      <DNAHelix scrollProgress={scrollProgress} />

      {/* Ambient lighting for subtle glow */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#a855f7" />
    </group>
  );
}
