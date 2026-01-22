"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Preload,
  PerformanceMonitor,
  AdaptiveDpr,
  Environment,
} from "@react-three/drei";
import Link from "next/link";
import { ArrowLeft, BarChart3, Globe, Network, ScatterChart, Info } from "lucide-react";
import { gsap } from "gsap";

import {
  BarChart3D,
  GlobeVisualization,
  NetworkGraph,
  ScatterPlot3D,
} from "@/components/canvas/visualizations";
import { useDeviceDetection, getOptimalDPR } from "@/hooks/useDeviceDetection";
import { Header } from "@/components/sections/Header";

type VisualizationType = "bar" | "globe" | "network" | "scatter";

interface VisualizationConfig {
  id: VisualizationType;
  title: string;
  description: string;
  icon: typeof BarChart3;
}

const visualizations: VisualizationConfig[] = [
  {
    id: "bar",
    title: "3D Bar Chart",
    description: "Interactive quarterly revenue data with hover tooltips",
    icon: BarChart3,
  },
  {
    id: "globe",
    title: "Data Globe",
    description: "Global data points with connection visualization",
    icon: Globe,
  },
  {
    id: "network",
    title: "Network Graph",
    description: "System architecture visualization with nodes and edges",
    icon: Network,
  },
  {
    id: "scatter",
    title: "3D Scatter Plot",
    description: "Multi-dimensional data clustering visualization",
    icon: ScatterChart,
  },
];

function VisualizationScene({ type }: { type: VisualizationType }) {
  switch (type) {
    case "bar":
      return <BarChart3D />;
    case "globe":
      return <GlobeVisualization />;
    case "network":
      return <NetworkGraph />;
    case "scatter":
      return <ScatterPlot3D />;
    default:
      return <BarChart3D />;
  }
}

function VisualizationCanvas({ type }: { type: VisualizationType }) {
  const device = useDeviceDetection();
  const optimalDPR = getOptimalDPR(device);
  const [dpr, setDpr] = useState(optimalDPR[0]);

  return (
    <Canvas
      className="!absolute inset-0"
      gl={{
        antialias: !device.isMobile,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      dpr={dpr}
    >
      <Suspense fallback={null}>
        <PerformanceMonitor
          onIncline={() => setDpr(Math.min(dpr + 0.5, optimalDPR[1]))}
          onDecline={() => setDpr(Math.max(dpr - 0.5, optimalDPR[0]))}
        >
          <AdaptiveDpr pixelated />

          <PerspectiveCamera makeDefault position={[3, 2, 4]} fov={45} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            autoRotate={false}
            dampingFactor={0.05}
            enableDamping
          />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#a78bfa" />

          {/* Environment for reflections */}
          <Environment preset="night" />

          {/* Visualization */}
          <VisualizationScene type={type} />

          <Preload all />
        </PerformanceMonitor>
      </Suspense>
    </Canvas>
  );
}

function TabButton({
  config,
  isActive,
  onClick,
}: {
  config: VisualizationConfig;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
        isActive
          ? "bg-primary/20 text-primary shadow-lg shadow-primary/20"
          : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-foreground"
      }`}
    >
      <Icon
        className={`h-5 w-5 transition-all duration-300 ${
          isActive ? "text-primary" : "text-foreground-muted group-hover:text-primary"
        }`}
        strokeWidth={1.5}
      />
      <div className="text-left">
        <p className="text-sm font-medium">{config.title}</p>
        <p className="hidden text-xs text-foreground-muted sm:block">
          {config.description}
        </p>
      </div>
    </button>
  );
}

export default function DataVizDemoPage() {
  const [activeViz, setActiveViz] = useState<VisualizationType>("bar");
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Header />

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div
          className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />
      </div>

      <main ref={containerRef} className="min-h-screen pt-24">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/demos"
              className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-foreground-muted transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Demos
            </Link>

            <h1
              ref={titleRef}
              className="mb-4 bg-gradient-to-r from-primary via-primary-hover to-accent-cyan bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl"
            >
              3D Data Visualization
            </h1>

            <p className="max-w-2xl text-lg text-foreground-muted">
              Interactive 3D visualizations for complex data representation. Rotate, zoom,
              and hover over elements to explore the data.
            </p>
          </div>

          {/* Visualization Tabs */}
          <div className="mb-6 flex flex-wrap gap-3">
            {visualizations.map((viz) => (
              <TabButton
                key={viz.id}
                config={viz}
                isActive={activeViz === viz.id}
                onClick={() => setActiveViz(viz.id)}
              />
            ))}
          </div>

          {/* Canvas Container */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm">
            {/* Aspect ratio container */}
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <VisualizationCanvas type={activeViz} />
            </div>

            {/* Instructions overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 text-xs text-white/60 backdrop-blur-sm">
              <Info className="h-3.5 w-3.5" />
              <span>Drag to rotate • Scroll to zoom • Hover for details</span>
            </div>
          </div>

          {/* Legend / Info Section */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {visualizations.map((viz) => {
              const Icon = viz.icon;
              const isActive = activeViz === viz.id;

              return (
                <div
                  key={viz.id}
                  className={`rounded-xl border p-4 transition-all duration-300 ${
                    isActive
                      ? "border-primary/30 bg-primary/5"
                      : "border-white/5 bg-white/5"
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                        isActive ? "bg-primary/20" : "bg-white/10"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? "text-primary" : "text-foreground-muted"
                        }`}
                      />
                    </div>
                    <h3
                      className={`font-semibold ${
                        isActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {viz.title}
                    </h3>
                  </div>
                  <p className="text-sm text-foreground-muted">{viz.description}</p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-foreground-muted">
              Need custom data visualization for your project?
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-gradient-to-r from-primary to-primary-muted px-6 py-2.5 font-semibold text-white shadow-lg shadow-glow-primary/30 transition-all duration-300 hover:scale-105 hover:border-primary hover:from-primary-hover hover:to-primary hover:shadow-glow-primary/60"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
