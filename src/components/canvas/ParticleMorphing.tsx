"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface ParticleMorphingProps {
  device: DeviceCapabilities;
  isPaused?: boolean;
}

// Text formations to morph between
const WORDS = ["PRISM", "DIGITAL", "CREATE"];
const TRANSITION_DURATION = 3; // seconds per transition
const HOLD_DURATION = 2; // seconds to hold each formation

/**
 * Generate point cloud positions from text geometry
 */
function getTextPoints(
  text: string,
  font: Font,
  count: number,
  scale: number = 1
): Float32Array {
  const positions = new Float32Array(count * 3);

  const geometry = new TextGeometry(text, {
    font,
    size: 2 * scale,
    depth: 0.4,
    curveSegments: 4,
    bevelEnabled: false,
  });

  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox!;
  const centerX = (boundingBox.max.x + boundingBox.min.x) / 2;
  const centerY = (boundingBox.max.y + boundingBox.min.y) / 2;
  const centerZ = (boundingBox.max.z + boundingBox.min.z) / 2;

  // Get position attribute
  const positionAttr = geometry.getAttribute("position");
  const vertices: THREE.Vector3[] = [];

  // Collect unique vertices
  const uniqueSet = new Set<string>();
  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i) - centerX;
    const y = positionAttr.getY(i) - centerY;
    const z = positionAttr.getZ(i) - centerZ;
    const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
    if (!uniqueSet.has(key)) {
      uniqueSet.add(key);
      vertices.push(new THREE.Vector3(x, y, z));
    }
  }

  // Fill positions array by sampling from vertices
  for (let i = 0; i < count; i++) {
    const vertex = vertices[i % vertices.length];
    // Add slight randomness to spread particles
    const jitter = 0.1;
    positions[i * 3] = vertex.x + (Math.random() - 0.5) * jitter;
    positions[i * 3 + 1] = vertex.y + (Math.random() - 0.5) * jitter;
    positions[i * 3 + 2] = vertex.z + (Math.random() - 0.5) * jitter;
  }

  geometry.dispose();
  return positions;
}

/**
 * Generate scattered/random positions
 */
function getScatteredPositions(count: number, radius: number = 8): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random()); // Uniform distribution in sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  return positions;
}

/**
 * Particle Morphing Text Demo
 * GPU-accelerated particles that morph between text formations
 */
export function ParticleMorphing({
  device,
  isPaused = false,
}: ParticleMorphingProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const [font, setFont] = useState<Font | null>(null);
  const [formations, setFormations] = useState<Float32Array[]>([]);
  const { size, camera } = useThree();

  // Determine particle count based on device capabilities
  // Keep counts reasonable for CPU-side calculations
  const count = useMemo(() => {
    if (device.isMobile) {
      switch (device.gpu) {
        case "high":
          return 8000;
        case "medium":
          return 5000;
        default:
          return 3000;
      }
    }
    switch (device.gpu) {
      case "high":
        return 15000;
      case "medium":
        return 10000;
      default:
        return 6000;
    }
  }, [device.isMobile, device.gpu]);

  // Pre-allocate reusable objects
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempVec2 = useMemo(() => new THREE.Vector3(), []);

  // Animation state
  const animationRef = useRef({
    currentFormation: 0,
    progress: 0,
    phase: "hold" as "hold" | "morphing",
    holdTime: 0,
    morphTime: 0,
  });

  // Mouse position for interaction
  const mouseRef = useRef(new THREE.Vector2());
  const mouse3DRef = useRef(new THREE.Vector3());

  // Particle animation properties
  const particleProps = useMemo(() => {
    const data = new Float32Array(count * 4); // phase, speed, size, colorIdx

    for (let i = 0; i < count; i++) {
      const idx = i * 4;
      data[idx] = Math.random() * Math.PI * 2; // phase
      data[idx + 1] = 0.3 + Math.random() * 0.7; // speed
      data[idx + 2] = 0.02 + Math.random() * 0.03; // size
      data[idx + 3] = Math.floor(Math.random() * 5); // colorIdx
    }

    return data;
  }, [count]);

  // Displaced positions for mouse interaction
  const displacedPositions = useMemo(() => {
    return new Float32Array(count * 3);
  }, [count]);

  // Color palette (purple to cyan gradient)
  const colorPalette = useMemo(
    () => [
      new THREE.Color("#8b5cf6"), // violet-500
      new THREE.Color("#a78bfa"), // violet-400
      new THREE.Color("#c4b5fd"), // violet-300
      new THREE.Color("#22d3ee"), // cyan-400
      new THREE.Color("#f472b6"), // pink-400
    ],
    []
  );

  // Pre-allocated cyan color for lerping (avoid GC in render loop)
  const cyanColor = useMemo(() => new THREE.Color("#22d3ee"), []);

  // Load font and generate text formations
  useEffect(() => {
    const loader = new FontLoader();
    // Use a CDN-hosted font (Roboto Bold)
    loader.load(
      "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json",
      (loadedFont) => {
        setFont(loadedFont);

        // Generate formations for each word plus scattered state
        const scale = device.isMobile ? 0.7 : 1;
        const newFormations = [
          getScatteredPositions(count, 8), // Initial scattered state
          ...WORDS.map((word) => getTextPoints(word, loadedFont, count, scale)),
        ];
        setFormations(newFormations);

        // Initialize displaced positions to scattered
        displacedPositions.set(newFormations[0]);
      }
    );
  }, [count, device.isMobile, displacedPositions]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to -1 to 1
      mouseRef.current.x = (e.clientX / size.width) * 2 - 1;
      mouseRef.current.y = -(e.clientY / size.height) * 2 + 1;

      // Project mouse to 3D space at z=0
      mouse3DRef.current.set(mouseRef.current.x, mouseRef.current.y, 0.5);
      mouse3DRef.current.unproject(camera);

      // Get direction from camera
      const dir = mouse3DRef.current.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      mouse3DRef.current
        .copy(camera.position)
        .add(dir.multiplyScalar(distance));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [size, camera]);

  // Main animation loop
  useFrame((state, delta) => {
    if (!meshRef.current || formations.length === 0 || isPaused) return;

    const time = state.clock.getElapsedTime();
    const anim = animationRef.current;

    // Update animation state
    if (anim.phase === "hold") {
      anim.holdTime += delta;
      if (anim.holdTime >= HOLD_DURATION) {
        anim.phase = "morphing";
        anim.holdTime = 0;
        anim.morphTime = 0;
      }
    } else {
      anim.morphTime += delta;
      anim.progress = Math.min(anim.morphTime / TRANSITION_DURATION, 1);

      if (anim.progress >= 1) {
        anim.currentFormation =
          (anim.currentFormation + 1) % formations.length;
        anim.phase = "hold";
        anim.progress = 0;
        anim.morphTime = 0;
      }
    }

    // Get current and next formations
    const fromIdx = anim.currentFormation;
    const toIdx = (anim.currentFormation + 1) % formations.length;
    const fromPositions = formations[fromIdx];
    const toPositions = formations[toIdx];

    // Easing function
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const easedProgress =
      anim.phase === "morphing" ? easeInOut(anim.progress) : 0;

    // Mouse interaction settings
    const mouseInfluence = device.isMobile ? 1.5 : 2.5;
    const interactionRadius = device.isMobile ? 2 : 3;
    const returnSpeed = 0.08;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const propIdx = i * 4;

      // Interpolate between formations
      const targetX =
        fromPositions[i3] * (1 - easedProgress) +
        toPositions[i3] * easedProgress;
      const targetY =
        fromPositions[i3 + 1] * (1 - easedProgress) +
        toPositions[i3 + 1] * easedProgress;
      const targetZ =
        fromPositions[i3 + 2] * (1 - easedProgress) +
        toPositions[i3 + 2] * easedProgress;

      // Get particle properties
      const phase = particleProps[propIdx];
      const speed = particleProps[propIdx + 1];
      const size = particleProps[propIdx + 2];
      const colorIdx = particleProps[propIdx + 3];

      // Add wave motion during transitions
      const transitionAmount = anim.phase === "morphing" ? anim.progress * (1 - anim.progress) * 4 : 0;
      const wave =
        Math.sin(time * speed * 2 + phase + targetX * 0.3) *
        transitionAmount *
        0.5;

      // Smoothly lerp displaced position toward target
      let x = displacedPositions[i3];
      let y = displacedPositions[i3 + 1];
      let z = displacedPositions[i3 + 2];

      x = THREE.MathUtils.lerp(x, targetX, returnSpeed);
      y = THREE.MathUtils.lerp(y, targetY + wave, returnSpeed);
      z = THREE.MathUtils.lerp(z, targetZ, returnSpeed);

      // Mouse interaction - repulsion
      tempVec.set(x, y, z);
      const distanceToMouse = tempVec.distanceTo(mouse3DRef.current);

      if (distanceToMouse < interactionRadius) {
        const repulsion =
          ((interactionRadius - distanceToMouse) / interactionRadius) *
          mouseInfluence;
        tempVec2.copy(tempVec).sub(mouse3DRef.current).normalize();
        x += tempVec2.x * repulsion * 0.15;
        y += tempVec2.y * repulsion * 0.15;
        z += tempVec2.z * repulsion * 0.1;
      }

      // Store displaced positions for next frame
      displacedPositions[i3] = x;
      displacedPositions[i3 + 1] = y;
      displacedPositions[i3 + 2] = z;

      // Set instance transform
      tempObject.position.set(x, y, z);

      // Scale: larger during transitions and near mouse
      const mobileScale = device.isMobile ? 0.8 : 1;
      const mouseBoost =
        distanceToMouse < interactionRadius
          ? 1 + (1 - distanceToMouse / interactionRadius) * 0.5
          : 1;
      const transitionScale = 1 + transitionAmount * 0.3;
      tempObject.scale.setScalar(
        size * mobileScale * mouseBoost * transitionScale
      );

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color with brightness pulsing
      tempColor.copy(
        colorPalette[Math.floor(colorIdx) % colorPalette.length]
      );
      const brightness = 0.7 + Math.sin(time * 2 + phase) * 0.2;
      tempColor.multiplyScalar(brightness);

      // Add cyan tint during transition to DIGITAL
      if (anim.currentFormation === 2 || toIdx === 2) {
        tempColor.lerp(cyanColor, transitionAmount * 0.3);
      }

      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // Subtle rotation of entire system
    meshRef.current.rotation.y = Math.sin(time * 0.1) * 0.1;
  });

  // Resource cleanup
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

  // Geometry detail level
  const geometrySegments = device.isMobile ? 6 : 8;

  // Show loading state while font loads
  if (!font || formations.length === 0) {
    return null;
  }

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, geometrySegments, geometrySegments]} />
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
