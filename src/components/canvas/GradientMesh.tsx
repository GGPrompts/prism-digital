"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import * as THREE from "three";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface GradientMeshProps {
  scrollProgress?: number;
  device?: DeviceCapabilities;
}

/**
 * Animated Gradient Mesh Background
 *
 * Creates a subtle aurora/gradient mesh effect positioned behind particles
 * for additional visual depth. Uses custom shader for smooth color transitions.
 *
 * Colors: deep purple, blue, subtle pink accents (matching globals.css)
 */
export function GradientMesh({
  scrollProgress = 0,
  device,
}: GradientMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Pre-allocated target colors for lerping (avoid GC in useFrame)
  const targetColors = useMemo(
    () => ({
      dark: {
        color1: new THREE.Color("#4c1d95"),
        color2: new THREE.Color("#1e3a5f"),
        color3: new THREE.Color("#831843"),
        color4: new THREE.Color("#2e1065"),
      },
      light: {
        color1: new THREE.Color("#7c3aed"),
        color2: new THREE.Color("#3b82f6"),
        color3: new THREE.Color("#db2777"),
        color4: new THREE.Color("#6d28d9"),
      },
    }),
    []
  );

  // Shader uniforms for animation - theme-aware colors
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      // Project color palette - adjusted based on theme
      uColor1: { value: new THREE.Color(isDark ? "#4c1d95" : "#7c3aed") }, // purple
      uColor2: { value: new THREE.Color(isDark ? "#1e3a5f" : "#3b82f6") }, // blue
      uColor3: { value: new THREE.Color(isDark ? "#831843" : "#db2777") }, // pink
      uColor4: { value: new THREE.Color(isDark ? "#2e1065" : "#6d28d9") }, // deep purple
      uOpacity: { value: device?.isMobile ? 0.15 : (isDark ? 0.18 : 0.15) }, // more balanced between themes
    }),
    [device?.isMobile, isDark]
  );

  // Vertex shader - subtle wave deformation
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uScrollProgress;

    void main() {
      vUv = uv;
      vPosition = position;

      // Subtle wave displacement for organic feel
      vec3 pos = position;
      float waveSpeed = 0.15;
      float waveAmplitude = 0.5 + uScrollProgress * 0.3;

      pos.z += sin(pos.x * 0.3 + uTime * waveSpeed) * waveAmplitude;
      pos.z += cos(pos.y * 0.3 + uTime * waveSpeed * 0.7) * waveAmplitude * 0.5;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // Fragment shader - animated gradient blobs
  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uScrollProgress;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform float uOpacity;

    // Simplex-like noise for smooth blobs
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f); // smoothstep

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Fractal brownian motion for organic look
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }

      return value;
    }

    void main() {
      vec2 uv = vUv;

      // Slow morphing animation
      float morphSpeed = 0.08;
      float t = uTime * morphSpeed;

      // Create multiple blob centers that move over time
      vec2 center1 = vec2(0.3 + sin(t * 0.7) * 0.3, 0.3 + cos(t * 0.5) * 0.3);
      vec2 center2 = vec2(0.7 + cos(t * 0.6) * 0.2, 0.6 + sin(t * 0.4) * 0.3);
      vec2 center3 = vec2(0.5 + sin(t * 0.8) * 0.25, 0.7 + cos(t * 0.9) * 0.2);
      vec2 center4 = vec2(0.2 + cos(t * 0.5) * 0.15, 0.5 + sin(t * 0.6) * 0.25);

      // Distance-based gradient blobs with noise displacement
      float noiseOffset = fbm(uv * 2.0 + t * 0.5) * 0.3;

      float d1 = smoothstep(0.6, 0.0, distance(uv + noiseOffset, center1));
      float d2 = smoothstep(0.5, 0.0, distance(uv + noiseOffset * 0.8, center2));
      float d3 = smoothstep(0.55, 0.0, distance(uv + noiseOffset * 1.2, center3));
      float d4 = smoothstep(0.45, 0.0, distance(uv + noiseOffset * 0.6, center4));

      // Mix colors based on blob distances
      vec3 color = vec3(0.0);
      color = mix(color, uColor1, d1 * 0.8);
      color = mix(color, uColor2, d2 * 0.6);
      color = mix(color, uColor3, d3 * 0.4);
      color = mix(color, uColor4, d4 * 0.5);

      // Add subtle noise texture overlay
      float noiseTexture = fbm(uv * 10.0 + t * 0.2) * 0.08;
      color += vec3(noiseTexture * 0.5);

      // Scroll-based intensity modulation
      float scrollIntensity = 1.0 + uScrollProgress * 0.2;
      color *= scrollIntensity;

      // Vignette for depth
      float vignette = smoothstep(0.8, 0.2, distance(uv, vec2(0.5)));

      // Final opacity with edge fade
      float alpha = max(max(d1, d2), max(d3, d4)) * uOpacity * vignette;

      // Ensure minimum visibility in blob areas
      alpha = max(alpha, (d1 + d2 + d3 + d4) * 0.1 * uOpacity);

      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (!materialRef.current) return;

    const time = state.clock.getElapsedTime();

    // Update uniforms
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uScrollProgress.value = Number.isFinite(scrollProgress)
      ? scrollProgress
      : 0;

    // Smoothly update colors based on theme (using pre-allocated targets)
    const colors = isDark ? targetColors.dark : targetColors.light;
    materialRef.current.uniforms.uColor1.value.lerp(colors.color1, 0.05);
    materialRef.current.uniforms.uColor2.value.lerp(colors.color2, 0.05);
    materialRef.current.uniforms.uColor3.value.lerp(colors.color3, 0.05);
    materialRef.current.uniforms.uColor4.value.lerp(colors.color4, 0.05);
    materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uOpacity.value,
      device?.isMobile ? 0.15 : (isDark ? 0.18 : 0.15),
      0.05
    );
  });

  // Resource cleanup on unmount (capture refs to avoid stale access)
  useEffect(() => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    return () => {
      if (mesh) {
        mesh.geometry.dispose();
      }
      if (material) {
        material.dispose();
      }
    };
  }, []);

  // Reduce plane segments on mobile for performance
  const segments = device?.isMobile ? 16 : 32;

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, -20]} // Position far behind particles
      rotation={[0, 0, 0]}
    >
      <planeGeometry args={[60, 40, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
