"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, PerformanceMonitor, AdaptiveDpr } from "@react-three/drei";
import Link from "next/link";
import {
  ArrowLeft,
  X,
  Volume2,
  Maximize2,
  Code,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { ShaderGallery, type ShaderInfo } from "@/components/canvas/ShaderGallery";
import { ShaderControls } from "@/components/ShaderControls";
import { useDeviceDetection, getOptimalDPR } from "@/hooks/useDeviceDetection";

// Shader definitions
const SHADERS: ShaderInfo[] = [
  {
    id: "plasma",
    name: "Plasma Wave",
    description: "Classic plasma effect with flowing organic patterns",
    tags: ["classic", "organic", "colorful"],
    audioReactive: false,
  },
  {
    id: "raymarching",
    name: "Ray Marching Sphere",
    description: "Real-time ray marching with soft shadows and reflections",
    tags: ["3d", "raymarching", "shadows"],
    audioReactive: false,
  },
  {
    id: "voronoi",
    name: "Voronoi Cells",
    description: "Dynamic Voronoi diagram with animated cell boundaries",
    tags: ["geometric", "procedural", "cells"],
    audioReactive: false,
  },
  {
    id: "fractal",
    name: "Fractal Noise",
    description: "Multi-octave fractal Brownian motion turbulence",
    tags: ["noise", "fractal", "organic"],
    audioReactive: false,
  },
  {
    id: "warp",
    name: "Domain Warping",
    description: "Recursive domain warping creating marble-like patterns",
    tags: ["warp", "marble", "procedural"],
    audioReactive: false,
  },
  {
    id: "audio",
    name: "Audio Visualizer",
    description: "Real-time audio-reactive shader using microphone input",
    tags: ["audio", "reactive", "visualizer"],
    audioReactive: true,
  },
  {
    id: "galaxy",
    name: "Cosmic Galaxy",
    description: "Procedural galaxy with spiral arms and star particles",
    tags: ["space", "stars", "cosmic"],
    audioReactive: false,
  },
  {
    id: "liquid",
    name: "Liquid Metal",
    description: "Smooth liquid metal simulation with iridescent reflections",
    tags: ["metallic", "liquid", "iridescent"],
    audioReactive: false,
  },
];

export default function ShadersPage() {
  const device = useDeviceDetection();
  const optimalDPR = getOptimalDPR(device);
  const [dpr, setDpr] = useState(optimalDPR[0]);

  // Gallery state
  const [selectedShader, setSelectedShader] = useState<ShaderInfo | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Control state
  const [speed, setSpeed] = useState(1.0);
  const [baseColor, setBaseColor] = useState("#a855f7");
  const [isPlaying, setIsPlaying] = useState(true);

  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Mouse position for shader uniforms
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isFullscreen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height,
    });
  }, [isFullscreen]);

  // Audio setup for audio-reactive shader
  const toggleAudio = useCallback(async () => {
    if (audioEnabled) {
      // Disable audio
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioEnabled(false);
      setAudioLevel(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setAudioEnabled(true);

      // Start analyzing audio
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
    } catch (err) {
      console.error("Failed to access microphone:", err);
    }
  }, [audioEnabled]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const openShader = (shader: ShaderInfo) => {
    setSelectedShader(shader);
    setIsFullscreen(true);
    setShowCode(false);
    // Auto-enable audio for audio-reactive shader
    if (shader.audioReactive && !audioEnabled) {
      // Don't auto-enable, let user click
    }
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setSelectedShader(null);
    setShowCode(false);
  };

  const navigateShader = useCallback((direction: "prev" | "next") => {
    if (!selectedShader) return;
    const currentIndex = SHADERS.findIndex((s) => s.id === selectedShader.id);
    const newIndex =
      direction === "prev"
        ? (currentIndex - 1 + SHADERS.length) % SHADERS.length
        : (currentIndex + 1) % SHADERS.length;
    setSelectedShader(SHADERS[newIndex]);
  }, [selectedShader]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeFullscreen();
          break;
        case " ":
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case "ArrowLeft":
          navigateShader("prev");
          break;
        case "ArrowRight":
          navigateShader("next");
          break;
        case "c":
        case "C":
          setShowCode((s) => !s);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, navigateShader]);

  return (
    <>
      <Header />

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div
          className="absolute left-1/2 top-1/3 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />
      </div>

      <main className="min-h-screen pt-24">
        <section className="relative overflow-hidden py-12">
          <div className="mx-auto max-w-7xl px-6">
            {/* Back link */}
            <Link
              href="/demos"
              className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-foreground-muted transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Demos
            </Link>

            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 bg-gradient-to-r from-primary via-primary-hover to-accent-cyan bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl lg:text-6xl">
                Shader Art Gallery
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-foreground-muted">
                Interactive GLSL shader effects with real-time controls. Click
                any shader to view fullscreen with mouse interaction.
              </p>
            </div>

            {/* Shader Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {SHADERS.map((shader) => (
                <button
                  key={shader.id}
                  onClick={() => openShader(shader)}
                  className="group glass-card relative aspect-square cursor-pointer overflow-hidden p-0 text-left transition-all hover:scale-[1.02]"
                >
                  {/* Shader Preview Canvas */}
                  <div className="absolute inset-0">
                    <Canvas
                      gl={{
                        antialias: false,
                        alpha: true,
                        powerPreference: "low-power",
                      }}
                      dpr={1}
                      frameloop={isPlaying ? "always" : "demand"}
                    >
                      <ShaderGallery
                        shaderId={shader.id}
                        speed={speed * 0.5}
                        baseColor={baseColor}
                        mousePosition={{ x: 0.5, y: 0.5 }}
                        audioLevel={0}
                        isPreview
                      />
                    </Canvas>
                  </div>

                  {/* Overlay Info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                    <h3 className="mb-1 text-lg font-bold text-white transition-colors group-hover:text-primary">
                      {shader.name}
                    </h3>
                    <p className="line-clamp-2 text-sm text-white/70">
                      {shader.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {shader.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Audio badge */}
                    {shader.audioReactive && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                        <Volume2 className="h-3 w-3" />
                        Audio Reactive
                      </div>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <div className="scale-0 rounded-full bg-primary/90 p-4 shadow-lg transition-transform group-hover:scale-100">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Fullscreen Shader View */}
      {isFullscreen && selectedShader && (
        <div
          className="fixed inset-0 z-50 bg-black"
          onMouseMove={handleMouseMove}
        >
          {/* Fullscreen Canvas */}
          <Canvas
            gl={{
              antialias: !device.isMobile,
              alpha: true,
              powerPreference: "high-performance",
            }}
            dpr={dpr}
            frameloop={isPlaying ? "always" : "demand"}
          >
            <PerformanceMonitor
              onIncline={() => setDpr(Math.min(dpr + 0.5, optimalDPR[1]))}
              onDecline={() => setDpr(Math.max(dpr - 0.5, optimalDPR[0]))}
            >
              <AdaptiveDpr pixelated />
              <ShaderGallery
                shaderId={selectedShader.id}
                speed={speed}
                baseColor={baseColor}
                mousePosition={mousePosition}
                audioLevel={audioLevel}
                isPreview={false}
              />
              <Preload all />
            </PerformanceMonitor>
          </Canvas>

          {/* Top Bar */}
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {selectedShader.name}
              </h2>
              <p className="text-sm text-white/70">
                {selectedShader.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Code toggle */}
              <button
                onClick={() => setShowCode(!showCode)}
                className={`rounded-lg p-2 transition-colors ${
                  showCode
                    ? "bg-primary text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title="View Code"
              >
                <Code className="h-5 w-5" />
              </button>

              {/* Close button */}
              <button
                onClick={closeFullscreen}
                className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => navigateShader("prev")}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            title="Previous Shader"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={() => navigateShader("next")}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            title="Next Shader"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
            <ShaderControls
              speed={speed}
              onSpeedChange={setSpeed}
              baseColor={baseColor}
              onColorChange={setBaseColor}
              isPlaying={isPlaying}
              onPlayingChange={setIsPlaying}
              audioEnabled={audioEnabled}
              onAudioToggle={toggleAudio}
              showAudioControl={selectedShader.audioReactive}
              audioLevel={audioLevel}
            />
          </div>

          {/* Code Panel */}
          {showCode && (
            <div className="absolute bottom-20 left-4 right-4 z-10 max-h-[50vh] overflow-auto rounded-lg bg-black/90 p-4 backdrop-blur-sm md:left-auto md:max-w-xl">
              <h3 className="mb-2 text-sm font-semibold text-primary">
                Fragment Shader
              </h3>
              <pre className="overflow-x-auto font-mono text-xs text-white/80">
                {getShaderCode(selectedShader.id)}
              </pre>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Helper to get shader code for display (simplified version)
function getShaderCode(shaderId: string): string {
  const codes: Record<string, string> = {
    plasma: `// Plasma Wave Shader
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uColor;

void main() {
  vec2 uv = vUv * 10.0;
  float t = uTime * 0.5;

  float v = sin(uv.x + t);
  v += sin(uv.y + t);
  v += sin(uv.x + uv.y + t);
  v += sin(sqrt(uv.x*uv.x + uv.y*uv.y) + t);

  vec3 col = uColor * (0.5 + 0.5 * sin(v * 3.14159));
  gl_FragColor = vec4(col, 1.0);
}`,
    raymarching: `// Ray Marching Sphere
uniform float uTime;
uniform vec2 uMouse;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  vec3 ro = vec3(0, 0, -3);
  vec3 rd = normalize(vec3(uv, 1.0));

  float t = 0.0;
  for(int i = 0; i < 64; i++) {
    vec3 p = ro + rd * t;
    float d = sdSphere(p, 1.0);
    if(d < 0.001) break;
    t += d;
  }

  gl_FragColor = vec4(vec3(1.0 - t * 0.1), 1.0);
}`,
    voronoi: `// Voronoi Cells
uniform float uTime;

vec2 random2(vec2 p) {
  return fract(sin(vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  )) * 43758.5453);
}

void main() {
  vec2 uv = vUv * 5.0;
  vec2 i = floor(uv);
  vec2 f = fract(uv);

  float minDist = 1.0;
  for(int y = -1; y <= 1; y++) {
    for(int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(x, y);
      vec2 point = random2(i + neighbor);
      point = 0.5 + 0.5 * sin(uTime + 6.28 * point);
      float d = length(neighbor + point - f);
      minDist = min(minDist, d);
    }
  }

  gl_FragColor = vec4(vec3(minDist), 1.0);
}`,
    fractal: `// Fractal Noise (FBM)
uniform float uTime;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for(int i = 0; i < 6; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv * 3.0;
  float n = fbm(uv + uTime * 0.2);
  gl_FragColor = vec4(vec3(n), 1.0);
}`,
    warp: `// Domain Warping
uniform float uTime;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  vec2 q = vec2(noise(uv + uTime * 0.1), noise(uv + 1.0));
  vec2 r = vec2(noise(uv + q + uTime * 0.2), noise(uv + q + 2.0));
  float f = noise(uv + r);

  vec3 col = mix(vec3(0.1, 0.0, 0.2), vec3(0.8, 0.3, 0.9), f);
  gl_FragColor = vec4(col, 1.0);
}`,
    audio: `// Audio Visualizer
uniform float uTime;
uniform float uAudioLevel;
uniform vec2 uMouse;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float d = length(uv);

  // Audio-reactive radius
  float r = 0.3 + uAudioLevel * 0.5;
  float ring = smoothstep(r, r + 0.02, d) - smoothstep(r + 0.05, r + 0.07, d);

  // Color based on audio
  vec3 col = mix(vec3(0.6, 0.2, 0.9), vec3(0.2, 0.9, 0.9), uAudioLevel);

  gl_FragColor = vec4(col * ring, 1.0);
}`,
    galaxy: `// Cosmic Galaxy
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float angle = atan(uv.y, uv.x);
  float dist = length(uv);

  // Spiral arms
  float arm = sin(angle * 2.0 + dist * 5.0 - uTime);
  float stars = hash(floor(vUv * 100.0));

  vec3 col = vec3(0.3, 0.1, 0.5) * arm + vec3(stars) * step(0.98, stars);
  gl_FragColor = vec4(col, 1.0);
}`,
    liquid: `// Liquid Metal
uniform float uTime;
uniform vec2 uMouse;

void main() {
  vec2 uv = vUv;
  vec2 mouse = uMouse;

  // Ripples from mouse
  float d = length(uv - mouse);
  float ripple = sin(d * 20.0 - uTime * 3.0) * exp(-d * 3.0);

  // Iridescent color
  vec3 col = 0.5 + 0.5 * cos(uTime + uv.xyx * 3.0 + vec3(0, 2, 4));
  col += ripple * 0.3;

  gl_FragColor = vec4(col, 1.0);
}`,
  };
  return codes[shaderId] || "// Shader code not available";
}
