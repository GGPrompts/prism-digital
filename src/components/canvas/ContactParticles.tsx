"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface ContactParticlesProps {
  device: DeviceCapabilities;
  isTyping: boolean;
  isSending: boolean;
  isSent: boolean;
}

/**
 * Particle system for contact form
 * - Emits particles when typing (flowing upward from center)
 * - Burst of confetti on send success
 */
export function ContactParticles({
  device,
  isTyping,
  isSending,
  isSent,
}: ContactParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Reduce particle count on mobile
  const count = device.isMobile ? 50 : 100;

  // Pre-allocate reusable objects
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Particle data: position, velocity, life, color
  const particles = useMemo(() => {
    const data = {
      positions: new Float32Array(count * 3),
      velocities: new Float32Array(count * 3),
      lives: new Float32Array(count),
      maxLives: new Float32Array(count),
      colors: new Float32Array(count),
      active: new Float32Array(count), // 0 = inactive, 1 = active
    };

    // Initialize all particles as inactive
    for (let i = 0; i < count; i++) {
      data.lives[i] = 0;
      data.active[i] = 0;
      data.maxLives[i] = 1.5 + Math.random() * 1;
      data.colors[i] = Math.floor(Math.random() * 4);
    }

    return data;
  }, [count]);

  // Color palette
  const colorPalette = useMemo(
    () => [
      new THREE.Color("#a855f7"), // purple
      new THREE.Color("#c084fc"), // lighter purple
      new THREE.Color("#22d3ee"), // cyan
      new THREE.Color("#f472b6"), // pink
    ],
    []
  );

  // Track typing state to spawn particles
  const spawnTimerRef = useRef(0);
  const nextSpawnIdxRef = useRef(0);
  const burstTriggeredRef = useRef(false);

  // Reset burst trigger when not sent
  useEffect(() => {
    if (!isSent) {
      burstTriggeredRef.current = false;
    }
  }, [isSent]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Spawn particles while typing
    if (isTyping && !isSending) {
      spawnTimerRef.current += delta;
      if (spawnTimerRef.current > 0.08) {
        spawnTimerRef.current = 0;
        spawnParticle(nextSpawnIdxRef.current, false);
        nextSpawnIdxRef.current = (nextSpawnIdxRef.current + 1) % count;
      }
    }

    // Burst on send success
    if (isSent && !burstTriggeredRef.current) {
      burstTriggeredRef.current = true;
      // Spawn many particles in a burst
      for (let i = 0; i < Math.min(30, count); i++) {
        spawnParticle(i, true);
      }
    }

    // Update all particles
    for (let i = 0; i < count; i++) {
      if (particles.active[i] === 0) {
        // Hide inactive particles
        tempObject.scale.setScalar(0);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
        continue;
      }

      const idx3 = i * 3;

      // Update life
      particles.lives[i] += delta;
      if (particles.lives[i] >= particles.maxLives[i]) {
        particles.active[i] = 0;
        continue;
      }

      const lifeRatio = particles.lives[i] / particles.maxLives[i];

      // Apply gravity and update position
      particles.velocities[idx3 + 1] -= delta * 0.5; // gravity
      particles.positions[idx3] += particles.velocities[idx3] * delta;
      particles.positions[idx3 + 1] += particles.velocities[idx3 + 1] * delta;
      particles.positions[idx3 + 2] += particles.velocities[idx3 + 2] * delta;

      // Set position
      tempObject.position.set(
        particles.positions[idx3],
        particles.positions[idx3 + 1],
        particles.positions[idx3 + 2]
      );

      // Scale fades out
      const scale = (1 - lifeRatio) * 0.08 * (device.isMobile ? 0.7 : 1);
      tempObject.scale.setScalar(Math.max(0.001, scale));

      // Rotation for visual interest
      tempObject.rotation.set(
        time * 2 + i,
        time * 3 + i * 0.5,
        time + i * 0.3
      );

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color with alpha fade
      const colorIdx = Math.floor(particles.colors[i]) % colorPalette.length;
      tempColor.copy(colorPalette[colorIdx]);
      tempColor.multiplyScalar(1 - lifeRatio * 0.5);
      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  function spawnParticle(idx: number, burst: boolean) {
    const idx3 = idx * 3;

    // Reset particle
    particles.active[idx] = 1;
    particles.lives[idx] = 0;
    particles.maxLives[idx] = burst ? 1 + Math.random() * 0.5 : 1.5 + Math.random() * 1;
    particles.colors[idx] = Math.floor(Math.random() * 4);

    // Start position (near center/envelope)
    particles.positions[idx3] = (Math.random() - 0.5) * 0.5;
    particles.positions[idx3 + 1] = (Math.random() - 0.5) * 0.3;
    particles.positions[idx3 + 2] = 0.1;

    // Velocity
    if (burst) {
      // Confetti burst - spread in all directions
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      particles.velocities[idx3] = Math.cos(angle) * speed;
      particles.velocities[idx3 + 1] = 1 + Math.random() * 3;
      particles.velocities[idx3 + 2] = Math.sin(angle) * speed * 0.5;
    } else {
      // Typing particles - flow upward
      particles.velocities[idx3] = (Math.random() - 0.5) * 0.8;
      particles.velocities[idx3 + 1] = 1 + Math.random() * 1.5;
      particles.velocities[idx3 + 2] = (Math.random() - 0.5) * 0.3;
    }
  }

  // Cleanup on unmount
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.8}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
