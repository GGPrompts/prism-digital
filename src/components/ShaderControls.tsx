"use client";

import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface ShaderControlsProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  baseColor: string;
  onColorChange: (color: string) => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  audioEnabled: boolean;
  onAudioToggle: () => void;
  showAudioControl: boolean;
  audioLevel: number;
}

const COLOR_PRESETS = [
  { name: "Purple", color: "#a855f7" },
  { name: "Cyan", color: "#22d3ee" },
  { name: "Pink", color: "#f472b6" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Green", color: "#22c55e" },
  { name: "Orange", color: "#f97316" },
];

export function ShaderControls({
  speed,
  onSpeedChange,
  baseColor,
  onColorChange,
  isPlaying,
  onPlayingChange,
  audioEnabled,
  onAudioToggle,
  showAudioControl,
  audioLevel,
}: ShaderControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
      {/* Play/Pause Button */}
      <button
        onClick={() => onPlayingChange(!isPlaying)}
        className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
        <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
      </button>

      {/* Speed Control */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-white/70">Speed</label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="h-2 w-24 cursor-pointer appearance-none rounded-full bg-white/20 accent-primary md:w-32"
        />
        <span className="min-w-[2.5rem] text-sm text-white/70">
          {speed.toFixed(1)}x
        </span>
      </div>

      {/* Color Presets */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-white/70">Color</label>
        <div className="flex gap-1">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onColorChange(preset.color)}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                baseColor === preset.color
                  ? "border-white scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            />
          ))}
          {/* Custom color picker */}
          <div className="relative">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="absolute inset-0 h-6 w-6 cursor-pointer opacity-0"
              title="Custom Color"
            />
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-white/40"
              style={{
                background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)`,
              }}
            >
              <span className="text-[8px] font-bold text-white drop-shadow-md">
                +
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Control (only for audio-reactive shaders) */}
      {showAudioControl && (
        <div className="flex items-center gap-2">
          <button
            onClick={onAudioToggle}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 backdrop-blur-sm transition-colors ${
              audioEnabled
                ? "bg-primary text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={audioEnabled ? "Disable Microphone" : "Enable Microphone"}
          >
            {audioEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">
              {audioEnabled ? "Mic On" : "Mic Off"}
            </span>
          </button>

          {/* Audio Level Indicator */}
          {audioEnabled && (
            <div className="flex h-6 items-end gap-0.5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary transition-all"
                  style={{
                    height: `${Math.max(4, audioLevel * 100 * ((i + 1) / 8))}%`,
                    opacity: audioLevel > i / 10 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="hidden text-xs text-white/40 lg:block">
        <span className="rounded bg-white/10 px-1.5 py-0.5">Space</span> Play/Pause
        {" · "}
        <span className="rounded bg-white/10 px-1.5 py-0.5">←→</span> Navigate
        {" · "}
        <span className="rounded bg-white/10 px-1.5 py-0.5">Esc</span> Close
      </div>
    </div>
  );
}
