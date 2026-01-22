/**
 * Configuration data for the Product Configurator demo
 */

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface MaterialOption {
  id: string;
  name: string;
  roughness: number;
  metalness: number;
  transmission?: number;
  thickness?: number;
  ior?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
}

export interface EnvironmentOption {
  id: string;
  name: string;
  preset: "apartment" | "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse";
}

// Available colors for the product
export const COLORS: ColorOption[] = [
  { id: "purple", name: "Prism Purple", hex: "#a855f7" },
  { id: "cyan", name: "Electric Cyan", hex: "#22d3ee" },
  { id: "pink", name: "Hot Pink", hex: "#ec4899" },
  { id: "emerald", name: "Emerald", hex: "#10b981" },
  { id: "amber", name: "Amber Gold", hex: "#f59e0b" },
  { id: "slate", name: "Slate", hex: "#64748b" },
];

// Material presets
export const MATERIALS: MaterialOption[] = [
  {
    id: "matte",
    name: "Matte",
    roughness: 0.8,
    metalness: 0,
  },
  {
    id: "glossy",
    name: "Glossy",
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  },
  {
    id: "metallic",
    name: "Metallic",
    roughness: 0.2,
    metalness: 1,
  },
  {
    id: "glass",
    name: "Glass",
    roughness: 0.05,
    metalness: 0,
    transmission: 0.9,
    thickness: 1.5,
    ior: 1.5,
  },
];

// Environment presets
export const ENVIRONMENTS: EnvironmentOption[] = [
  { id: "studio", name: "Studio", preset: "studio" },
  { id: "sunset", name: "Sunset", preset: "sunset" },
  { id: "night", name: "Night", preset: "night" },
];

// Default configuration
export const DEFAULT_CONFIG = {
  colorId: "purple",
  materialId: "glossy",
  environmentId: "studio",
};

// Get color by ID
export function getColorById(id: string): ColorOption {
  return COLORS.find((c) => c.id === id) ?? COLORS[0];
}

// Get material by ID
export function getMaterialById(id: string): MaterialOption {
  return MATERIALS.find((m) => m.id === id) ?? MATERIALS[0];
}

// Get environment by ID
export function getEnvironmentById(id: string): EnvironmentOption {
  return ENVIRONMENTS.find((e) => e.id === id) ?? ENVIRONMENTS[0];
}
