"use client";

import {
  Circle,
  Square,
  Cylinder,
  RotateCcw,
  Magnet,
  ArrowUp,
  Dices,
  X,
} from "lucide-react";
import type { PhysicsObjectType, PresetType } from "./types";

interface PhysicsControlsProps {
  gravityEnabled: boolean;
  antiGravity: boolean;
  objectCount: number;
  maxObjects: number;
  fps: number;
  onSpawn: (type: PhysicsObjectType) => void;
  onReset: () => void;
  onToggleGravity: () => void;
  onToggleAntiGravity: () => void;
  onLoadPreset: (preset: PresetType) => void;
  isMobile: boolean;
}

export function PhysicsControls({
  gravityEnabled,
  antiGravity,
  objectCount,
  maxObjects,
  fps,
  onSpawn,
  onReset,
  onToggleGravity,
  onToggleAntiGravity,
  onLoadPreset,
  isMobile,
}: PhysicsControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex flex-col items-center gap-3">
        {/* Stats bar */}
        <div className="flex items-center gap-4 rounded-lg bg-black/40 px-4 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-foreground-muted">Objects:</span>
            <span
              className={`font-mono font-medium ${
                objectCount >= maxObjects ? "text-red-400" : "text-primary"
              }`}
            >
              {objectCount}/{maxObjects}
            </span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-foreground-muted">FPS:</span>
            <span
              className={`font-mono font-medium ${
                fps < 30 ? "text-red-400" : fps < 50 ? "text-yellow-400" : "text-green-400"
              }`}
            >
              {fps}
            </span>
          </div>
        </div>

        {/* Main controls */}
        <div className="flex items-center gap-2 rounded-xl bg-black/50 p-2 backdrop-blur-md">
          {/* Spawn buttons */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <button
              onClick={() => onSpawn("sphere")}
              className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition-all hover:bg-primary/20 hover:scale-105 active:scale-95"
              title="Spawn Sphere"
            >
              <Circle className="h-5 w-5 text-foreground-muted group-hover:text-primary" />
            </button>
            <button
              onClick={() => onSpawn("box")}
              className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition-all hover:bg-primary/20 hover:scale-105 active:scale-95"
              title="Spawn Box"
            >
              <Square className="h-5 w-5 text-foreground-muted group-hover:text-primary" />
            </button>
            <button
              onClick={() => onSpawn("cylinder")}
              className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition-all hover:bg-primary/20 hover:scale-105 active:scale-95"
              title="Spawn Cylinder"
            >
              <Cylinder className="h-5 w-5 text-foreground-muted group-hover:text-primary" />
            </button>
          </div>

          {/* Gravity controls */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <button
              onClick={onToggleGravity}
              className={`group flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:scale-105 active:scale-95 ${
                gravityEnabled
                  ? "bg-primary/30 text-primary"
                  : "bg-white/5 text-foreground-muted hover:bg-primary/20 hover:text-primary"
              }`}
              title={gravityEnabled ? "Disable Gravity" : "Enable Gravity"}
            >
              {gravityEnabled ? (
                <Magnet className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onToggleAntiGravity}
              className={`group flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:scale-105 active:scale-95 ${
                antiGravity
                  ? "bg-accent-cyan/30 text-accent-cyan"
                  : "bg-white/5 text-foreground-muted hover:bg-accent-cyan/20 hover:text-accent-cyan"
              }`}
              title="Anti-Gravity Mode"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>

          {/* Preset buttons */}
          {!isMobile && (
            <div className="flex items-center gap-1 border-r border-white/10 pr-2">
              <button
                onClick={() => onLoadPreset("bowling")}
                className="group flex h-10 items-center gap-1 rounded-lg bg-white/5 px-3 text-xs font-medium text-foreground-muted transition-all hover:bg-primary/20 hover:text-primary hover:scale-105 active:scale-95"
                title="Load Bowling Preset"
              >
                <Dices className="h-4 w-4" />
                <span className="hidden sm:inline">Bowling</span>
              </button>
              <button
                onClick={() => onLoadPreset("dominoes")}
                className="group flex h-10 items-center gap-1 rounded-lg bg-white/5 px-3 text-xs font-medium text-foreground-muted transition-all hover:bg-primary/20 hover:text-primary hover:scale-105 active:scale-95"
                title="Load Dominoes Preset"
              >
                <span className="hidden sm:inline">Dominoes</span>
              </button>
              <button
                onClick={() => onLoadPreset("jenga")}
                className="group flex h-10 items-center gap-1 rounded-lg bg-white/5 px-3 text-xs font-medium text-foreground-muted transition-all hover:bg-primary/20 hover:text-primary hover:scale-105 active:scale-95"
                title="Load Jenga Preset"
              >
                <span className="hidden sm:inline">Jenga</span>
              </button>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={onReset}
            className="group flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-all hover:bg-red-500/30 hover:scale-105 active:scale-95"
            title="Reset Scene"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions */}
        <p className="text-center text-xs text-foreground-muted/70">
          {isMobile
            ? "Tap to spawn \u2022 Drag objects to throw"
            : "Click & drag to throw objects \u2022 Double-click to spawn"}
        </p>
      </div>
    </div>
  );
}
