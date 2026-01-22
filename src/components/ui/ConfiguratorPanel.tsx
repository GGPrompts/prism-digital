"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Palette, Shapes, Sun } from "lucide-react";
import { COLORS, MATERIALS, ENVIRONMENTS } from "@/lib/configurator-data";

interface ConfiguratorPanelProps {
  colorId: string;
  materialId: string;
  environmentId: string;
  onColorChange: (id: string) => void;
  onMaterialChange: (id: string) => void;
  onEnvironmentChange: (id: string) => void;
}

export function ConfiguratorPanel({
  colorId,
  materialId,
  environmentId,
  onColorChange,
  onMaterialChange,
  onEnvironmentChange,
}: ConfiguratorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="pointer-events-auto absolute bottom-6 right-6 w-72 max-w-[calc(100vw-3rem)]">
      {/* Panel container */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/80 backdrop-blur-xl">
        {/* Header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
        >
          <span className="text-sm font-semibold">Customize</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-foreground-muted" />
          ) : (
            <ChevronUp className="h-4 w-4 text-foreground-muted" />
          )}
        </button>

        {/* Expandable content */}
        <div
          className={`transition-all duration-300 ease-out ${
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="space-y-4 px-4 pb-4">
            {/* Colors section */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground-muted">
                  Color
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onColorChange(color.id)}
                    className={`group relative h-8 w-8 rounded-full transition-all ${
                      colorId === color.id
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={`Select ${color.name} color`}
                    aria-pressed={colorId === color.id}
                  >
                    {colorId === color.id && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Materials section */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Shapes className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground-muted">
                  Material
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => onMaterialChange(mat.id)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      materialId === mat.id
                        ? "bg-primary text-white"
                        : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-foreground"
                    }`}
                    aria-pressed={materialId === mat.id}
                  >
                    {mat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Environment section */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sun className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground-muted">
                  Lighting
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => onEnvironmentChange(env.id)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      environmentId === env.id
                        ? "bg-primary text-white"
                        : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-foreground"
                    }`}
                    aria-pressed={environmentId === env.id}
                  >
                    {env.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
