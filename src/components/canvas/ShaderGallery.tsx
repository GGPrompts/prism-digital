"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface ShaderInfo {
  id: string;
  name: string;
  description: string;
  tags: string[];
  audioReactive: boolean;
}

interface ShaderGalleryProps {
  shaderId: string;
  speed: number;
  baseColor: string;
  mousePosition: { x: number; y: number };
  audioLevel: number;
  isPreview?: boolean;
}

// Pre-allocated vectors for performance (no object creation in useFrame)
const tempColor = new THREE.Color();

// Common vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Shader implementations
const shaderFragments: Record<string, string> = {
  plasma: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform float uSpeed;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv * 8.0;
      float t = uTime * uSpeed * 0.5;

      float v = sin(uv.x + t * 0.7);
      v += sin(uv.y + t * 0.8);
      v += sin(uv.x + uv.y + t);
      v += sin(sqrt(uv.x * uv.x + uv.y * uv.y) + t);

      // Mouse influence
      vec2 mouse = uMouse * 8.0;
      float mouseInfluence = sin(length(uv - mouse) * 2.0 - t * 2.0) * 0.5;
      v += mouseInfluence;

      // Color cycling
      vec3 col1 = uColor;
      vec3 col2 = vec3(uColor.z, uColor.x, uColor.y);
      vec3 col3 = vec3(uColor.y, uColor.z, uColor.x);

      float wave = v * 0.25;
      vec3 finalColor = mix(col1, col2, 0.5 + 0.5 * sin(wave * 3.14159));
      finalColor = mix(finalColor, col3, 0.5 + 0.5 * cos(wave * 3.14159 + 1.0));

      // Brightness variation
      finalColor *= 0.7 + 0.3 * sin(v * 0.5);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,

  raymarching: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform float uSpeed;
    varying vec2 vUv;

    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }

    float sdBox(vec3 p, vec3 b) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }

    float map(vec3 p) {
      float t = uTime * uSpeed * 0.3;

      // Animated sphere
      vec3 spherePos = vec3(sin(t) * 0.5, cos(t * 0.7) * 0.3, 0.0);
      float sphere = sdSphere(p - spherePos, 0.5 + sin(t * 2.0) * 0.1);

      // Morphing between sphere and box
      float box = sdBox(p, vec3(0.4));
      float morph = mix(sphere, box, 0.5 + 0.5 * sin(t * 0.5));

      return morph;
    }

    vec3 getNormal(vec3 p) {
      vec2 e = vec2(0.001, 0.0);
      return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
      ));
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= 1.0; // Aspect correction could go here

      // Camera setup with mouse orbit
      vec3 ro = vec3(
        sin(uMouse.x * 6.28) * 3.0,
        uMouse.y * 2.0 - 1.0,
        cos(uMouse.x * 6.28) * 3.0
      );
      vec3 target = vec3(0.0);
      vec3 forward = normalize(target - ro);
      vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
      vec3 up = cross(forward, right);
      vec3 rd = normalize(uv.x * right + uv.y * up + 1.5 * forward);

      // Ray march
      float t = 0.0;
      vec3 col = vec3(0.02, 0.02, 0.05);

      for(int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if(d < 0.001) {
          vec3 n = getNormal(p);

          // Lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
          float diff = max(dot(n, lightDir), 0.0);
          float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 32.0);

          // Fresnel rim
          float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);

          col = uColor * diff * 0.8;
          col += vec3(1.0) * spec * 0.5;
          col += uColor * fresnel * 0.3;
          col += vec3(0.1, 0.05, 0.15) * 0.2; // Ambient

          break;
        }
        if(t > 10.0) break;
        t += d;
      }

      // Vignette
      float vignette = 1.0 - length(vUv - 0.5) * 0.8;
      col *= vignette;

      gl_FragColor = vec4(col, 1.0);
    }
  `,

  voronoi: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform float uSpeed;
    varying vec2 vUv;

    vec2 random2(vec2 p) {
      return fract(sin(vec2(
        dot(p, vec2(127.1, 311.7)),
        dot(p, vec2(269.5, 183.3))
      )) * 43758.5453);
    }

    void main() {
      float t = uTime * uSpeed * 0.3;
      vec2 uv = vUv * 6.0;

      // Add mouse influence to UV
      uv += (uMouse - 0.5) * 0.5;

      vec2 i = floor(uv);
      vec2 f = fract(uv);

      float minDist = 1.0;
      float secondMinDist = 1.0;
      vec2 minPoint = vec2(0.0);

      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = random2(i + neighbor);

          // Animate points
          point = 0.5 + 0.5 * sin(t + 6.28318 * point);

          vec2 diff = neighbor + point - f;
          float d = length(diff);

          if(d < minDist) {
            secondMinDist = minDist;
            minDist = d;
            minPoint = point;
          } else if(d < secondMinDist) {
            secondMinDist = d;
          }
        }
      }

      // Cell coloring
      vec3 col = uColor * (1.0 - minDist);

      // Edge detection
      float edge = secondMinDist - minDist;
      edge = smoothstep(0.0, 0.1, edge);

      // Gradient based on point position
      vec3 col2 = vec3(uColor.z, uColor.y, uColor.x);
      col = mix(col, col2, minPoint.x);

      // Add bright edges
      col = mix(vec3(1.0), col, edge);

      // Pulsing glow
      col += uColor * (1.0 - minDist) * (0.5 + 0.5 * sin(t * 2.0)) * 0.3;

      gl_FragColor = vec4(col, 1.0);
    }
  `,

  fractal: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform float uSpeed;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for(int i = 0; i < 6; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }

      return value;
    }

    void main() {
      float t = uTime * uSpeed * 0.15;
      vec2 uv = vUv * 3.0;

      // Mouse influence on position
      uv += (uMouse - 0.5) * 0.3;

      // Animated FBM
      float n1 = fbm(uv + t);
      float n2 = fbm(uv + n1 + t * 0.5);
      float n3 = fbm(uv + n2 + t * 0.3);

      // Color layers
      vec3 col1 = uColor;
      vec3 col2 = vec3(uColor.z * 1.2, uColor.x * 0.8, uColor.y);
      vec3 col3 = vec3(uColor.y, uColor.z * 1.1, uColor.x * 0.9);

      vec3 col = mix(col1, col2, n1);
      col = mix(col, col3, n2 * 0.5);

      // Add brightness variations
      col *= 0.6 + 0.4 * n3;

      // Subtle glow in bright areas
      col += uColor * pow(n3, 3.0) * 0.5;

      gl_FragColor = vec4(col, 1.0);
    }
  `,

  warp: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform float uSpeed;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for(int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      float t = uTime * uSpeed * 0.1;
      vec2 uv = vUv;

      // Mouse-influenced warping center
      vec2 warpCenter = mix(vec2(0.5), uMouse, 0.3);

      // Domain warping
      vec2 q = vec2(
        fbm(uv + t * 0.3),
        fbm(uv + vec2(1.0))
      );

      vec2 r = vec2(
        fbm(uv + q * 2.0 + vec2(1.7, 9.2) + t * 0.2),
        fbm(uv + q * 2.0 + vec2(8.3, 2.8) + t * 0.15)
      );

      // Distance from warp center
      float dist = length(uv - warpCenter);
      r *= 1.0 + dist * 0.5;

      float f = fbm(uv + r * 2.0);

      // Color mapping
      vec3 col1 = vec3(0.05, 0.02, 0.1);
      vec3 col2 = uColor * 0.6;
      vec3 col3 = uColor;
      vec3 col4 = vec3(1.0, 0.9, 0.95);

      vec3 col = mix(col1, col2, clamp(f * f * 2.0, 0.0, 1.0));
      col = mix(col, col3, clamp(length(q) * 0.5, 0.0, 1.0));
      col = mix(col, col4, clamp(pow(length(r), 2.0) * 0.3, 0.0, 1.0));

      // Add subtle glow
      col += uColor * pow(f, 4.0) * 0.4;

      gl_FragColor = vec4(col, 1.0);
    }
  `,

  audio: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform float uSpeed;
    uniform float uAudioLevel;
    varying vec2 vUv;

    float hash(float n) {
      return fract(sin(n) * 43758.5453);
    }

    void main() {
      float t = uTime * uSpeed * 0.5;
      vec2 uv = vUv * 2.0 - 1.0;

      // Audio-reactive parameters
      float audio = uAudioLevel;
      float bassBoost = audio * audio;

      // Multiple expanding rings
      float d = length(uv);
      float rings = 0.0;

      for(int i = 0; i < 5; i++) {
        float offset = float(i) * 0.2;
        float radius = 0.2 + offset + bassBoost * 0.5;
        float ringWidth = 0.02 + audio * 0.08;
        float ring = smoothstep(radius, radius + ringWidth, d) -
                     smoothstep(radius + ringWidth, radius + ringWidth * 2.0, d);
        ring *= 1.0 - float(i) * 0.15;
        rings += ring;
      }

      // Radial bars (frequency visualization simulation)
      float angle = atan(uv.y, uv.x);
      float bars = sin(angle * 16.0 + t * 2.0) * 0.5 + 0.5;
      bars *= smoothstep(0.1, 0.3 + audio * 0.4, d);
      bars *= smoothstep(0.9, 0.5, d);
      bars *= audio;

      // Center glow
      float centerGlow = exp(-d * (3.0 - audio * 2.0)) * (0.5 + audio * 0.5);

      // Color mixing
      vec3 col1 = uColor;
      vec3 col2 = vec3(uColor.z, uColor.y * 1.2, uColor.x);

      vec3 col = col1 * rings;
      col += col2 * bars * 0.8;
      col += mix(col1, col2, audio) * centerGlow;

      // Pulsing background
      vec3 bg = uColor * 0.1 * (0.5 + 0.5 * sin(t + d * 3.0));
      col += bg * (1.0 - d);

      // Audio-reactive brightness
      col *= 0.7 + audio * 0.6;

      gl_FragColor = vec4(col, 1.0);
    }
  `,

  galaxy: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform float uSpeed;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      float t = uTime * uSpeed * 0.1;
      vec2 uv = vUv * 2.0 - 1.0;

      // Mouse influence on galaxy center
      vec2 center = (uMouse - 0.5) * 0.3;
      uv -= center;

      float dist = length(uv);
      float angle = atan(uv.y, uv.x);

      // Spiral arms
      float arms = 2.0;
      float twist = dist * 4.0 - t * 2.0;
      float spiral = sin(angle * arms + twist) * 0.5 + 0.5;
      spiral = pow(spiral, 2.0);

      // Arm density falloff
      spiral *= exp(-dist * 1.5);

      // Core glow
      float core = exp(-dist * 4.0);

      // Star field
      vec2 starUv = vUv * 80.0;
      float stars = hash(floor(starUv));
      stars = step(0.97, stars);
      stars *= (0.5 + 0.5 * sin(t * 10.0 + hash(floor(starUv)) * 100.0));

      // Larger stars
      vec2 bigStarUv = vUv * 30.0;
      float bigStars = hash(floor(bigStarUv));
      bigStars = step(0.985, bigStars);
      bigStars *= (0.7 + 0.3 * sin(t * 5.0 + hash(floor(bigStarUv)) * 50.0));

      // Color composition
      vec3 coreColor = vec3(1.0, 0.95, 0.8);
      vec3 armColor = uColor;
      vec3 outerColor = vec3(uColor.z * 0.5, uColor.x * 0.3, uColor.y * 0.8);

      vec3 col = vec3(0.0);
      col += coreColor * core * 0.8;
      col += armColor * spiral * 0.9;
      col += outerColor * (1.0 - exp(-dist * 0.5)) * 0.3;
      col += vec3(1.0) * stars * 0.6;
      col += vec3(1.0, 0.9, 0.8) * bigStars * 0.8;

      // Dust lanes (dark regions)
      float dust = noise(uv * 5.0 + t * 0.1);
      dust = smoothstep(0.3, 0.7, dust);
      col *= 0.7 + 0.3 * dust;

      // Vignette
      float vignette = 1.0 - dist * 0.3;
      col *= vignette;

      gl_FragColor = vec4(col, 1.0);
    }
  `,

  liquid: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform float uSpeed;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      float t = uTime * uSpeed * 0.3;
      vec2 uv = vUv;

      // Mouse ripple effect
      float mouseDist = length(uv - uMouse);
      float ripple = sin(mouseDist * 30.0 - t * 5.0) * exp(-mouseDist * 4.0);

      // Flowing distortion
      vec2 distort = vec2(
        noise(uv * 3.0 + t * 0.5),
        noise(uv * 3.0 + vec2(100.0) + t * 0.5)
      );
      distort = (distort - 0.5) * 0.15;

      vec2 finalUv = uv + distort + vec2(ripple) * 0.05;

      // Liquid metal normals (fake)
      float nx = noise(finalUv * 8.0 + t) - noise(finalUv * 8.0 + vec2(0.01, 0.0) + t);
      float ny = noise(finalUv * 8.0 + t) - noise(finalUv * 8.0 + vec2(0.0, 0.01) + t);
      vec3 normal = normalize(vec3(nx * 5.0, ny * 5.0, 1.0));

      // Environment reflection (fake)
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      vec3 reflectDir = reflect(-viewDir, normal);

      // Iridescent color based on viewing angle and position
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

      vec3 iridescence = 0.5 + 0.5 * cos(
        t * 0.5 + finalUv.xyx * 6.0 + vec3(0.0, 2.094, 4.188)
      );

      // Base metallic color
      vec3 metalBase = uColor * 0.4;

      // Combine
      vec3 col = metalBase;
      col += iridescence * fresnel * 0.7;
      col += uColor * pow(max(reflectDir.z, 0.0), 8.0) * 0.5;

      // Highlight from "light"
      vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
      float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 32.0);
      col += vec3(1.0) * spec * 0.6;

      // Ripple highlight
      col += uColor * ripple * 0.5;

      // Ambient occlusion in crevices
      float ao = 0.8 + 0.2 * noise(finalUv * 15.0);
      col *= ao;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export function ShaderGallery({
  shaderId,
  speed,
  baseColor,
  mousePosition,
  audioLevel,
  isPreview = false,
}: ShaderGalleryProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Parse color once
  tempColor.set(baseColor);

  // Create uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uColor: { value: new THREE.Color(baseColor) },
      uSpeed: { value: speed },
      uAudioLevel: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shaderId] // Only recreate when shader changes
  );

  // Update uniform values without recreating
  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uColor.value.set(baseColor);
  }, [baseColor]);

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uSpeed.value = speed;
  }, [speed]);

  // Animation loop
  useFrame((state) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    materialRef.current.uniforms.uMouse.value.set(mousePosition.x, mousePosition.y);
    materialRef.current.uniforms.uAudioLevel.value = audioLevel;
  });

  // Cleanup on unmount (capture refs to avoid stale access)
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

  const fragmentShader = shaderFragments[shaderId] || shaderFragments.plasma;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        key={shaderId} // Force recreation when shader changes
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
