"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";
import type { EnvelopeAnimationState } from "@/hooks/useEnvelopeAnimation";
import { ContactParticles } from "./ContactParticles";

interface EnvelopeSceneProps {
  device: DeviceCapabilities;
  animationState: EnvelopeAnimationState;
}

/**
 * 3D Envelope scene for contact page
 * Responds to form interactions with wobble, send, and error animations
 */
export function EnvelopeScene({
  device,
  animationState,
}: EnvelopeSceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const envelopeRef = useRef<THREE.Group>(null!);
  const { pointer } = useThree();

  // Animation state tracking
  const animationRef = useRef({
    wobble: 0,
    wobbleTarget: 0,
    sendProgress: 0,
    sendActive: false,
    errorShake: 0,
    floatOffset: 0,
    rotationY: 0,
    scale: 1,
    position: new THREE.Vector3(0, 0, 0),
  });

  // Colors for envelope
  const colors = useMemo(
    () => ({
      body: new THREE.Color("#1a1a2e"),
      flap: new THREE.Color("#12121a"),
      edge: new THREE.Color("#a855f7"),
      glow: new THREE.Color("#a855f7"),
    }),
    []
  );

  // Track previous animation state for transitions
  const prevStateRef = useRef({
    isFocused: false,
    isSending: false,
    hasError: false,
  });

  useFrame((state, delta) => {
    if (!groupRef.current || !envelopeRef.current) return;

    const time = state.clock.getElapsedTime();
    const anim = animationRef.current;
    const prev = prevStateRef.current;

    // Detect state changes and trigger animations
    if (animationState.isFocused && !prev.isFocused) {
      anim.wobbleTarget = 1;
    }
    if (!animationState.isFocused && prev.isFocused) {
      anim.wobbleTarget = 0;
    }
    if (animationState.isSending && !prev.isSending) {
      anim.sendActive = true;
    }
    if (animationState.hasError && !prev.hasError) {
      anim.errorShake = 1;
    }

    // Update previous state
    prev.isFocused = animationState.isFocused;
    prev.isSending = animationState.isSending;
    prev.hasError = animationState.hasError;

    // Wobble animation (elastic bounce on focus)
    anim.wobble = THREE.MathUtils.lerp(anim.wobble, anim.wobbleTarget, 0.15);
    if (anim.wobbleTarget === 1 && anim.wobble > 0.95) {
      anim.wobbleTarget = 0;
    }

    // Error shake animation (rapid oscillation)
    if (anim.errorShake > 0) {
      anim.errorShake -= delta * 3;
      if (anim.errorShake < 0) anim.errorShake = 0;
    }

    // Send animation (fly away)
    if (anim.sendActive) {
      anim.sendProgress += delta * 1.2;
      if (anim.sendProgress >= 1) {
        anim.sendActive = false;
      }
    }

    // Reset after sent
    if (animationState.isSent && anim.sendProgress >= 1) {
      anim.sendProgress = 0;
    }

    // Floating animation - gentle bob
    anim.floatOffset = Math.sin(time * 1.2) * 0.15;

    // Mouse parallax (reduced on mobile)
    const mouseInfluence = device.isMobile ? 0.1 : 0.3;
    const targetRotY = pointer.x * mouseInfluence * Math.PI * 0.1;
    const targetRotX = -pointer.y * mouseInfluence * Math.PI * 0.05;
    anim.rotationY = THREE.MathUtils.lerp(anim.rotationY, targetRotY, 0.05);

    // Apply transformations
    const wobbleRot = Math.sin(anim.wobble * Math.PI * 4) * 0.15 * anim.wobble;
    const errorShakeX = Math.sin(time * 60) * 0.1 * anim.errorShake;

    // Send animation - fly up and away
    const sendEase = easeOutExpo(anim.sendProgress);
    const sendY = sendEase * 5;
    const sendZ = sendEase * -3;
    const sendScale = 1 - sendEase * 0.5;
    const sendRotX = sendEase * Math.PI * 0.3;

    // Apply to envelope group
    envelopeRef.current.position.set(
      errorShakeX,
      anim.floatOffset + sendY,
      sendZ
    );
    envelopeRef.current.rotation.set(
      targetRotX + sendRotX,
      anim.rotationY + wobbleRot,
      0
    );
    envelopeRef.current.scale.setScalar(sendScale);

    // Rotate entire scene slowly
    groupRef.current.rotation.y = time * 0.1;
  });

  // Easing function
  function easeOutExpo(x: number): number {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#a855f7" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#22d3ee" />

      {/* Main envelope group */}
      <group ref={envelopeRef}>
        {/* Envelope body */}
        <mesh castShadow>
          <boxGeometry args={[2, 1.2, 0.15]} />
          <meshStandardMaterial
            color={colors.body}
            metalness={0.3}
            roughness={0.4}
            emissive={colors.edge}
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Envelope flap (top) - using cone as simplified triangle */}
        <mesh position={[0, 0.6, 0.05]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1, 0.8, 3]} />
          <meshStandardMaterial
            color={colors.flap}
            metalness={0.2}
            roughness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Glowing edge lines */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(2, 1.2, 0.15)]} />
          <lineBasicMaterial color={colors.edge} transparent opacity={0.6} />
        </lineSegments>

        {/* Center seal/icon */}
        <mesh position={[0, 0, 0.09]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial
            color={colors.glow}
            emissive={colors.glow}
            emissiveIntensity={0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Glow plane behind envelope */}
        <mesh position={[0, 0, -0.2]}>
          <planeGeometry args={[3, 2]} />
          <meshBasicMaterial
            color={colors.glow}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Particles that emit during typing */}
      <ContactParticles
        device={device}
        isTyping={animationState.isTyping}
        isSending={animationState.isSending}
        isSent={animationState.isSent}
      />
    </group>
  );
}
