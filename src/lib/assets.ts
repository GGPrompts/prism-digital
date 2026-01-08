/**
 * Asset manifest for Prism Digital 3D scene
 * Lists all textures, HDRIs, and sprites used in the R3F canvas
 */

export const HDRI_ASSETS = {
  // Free HDRIs from Poly Haven (https://polyhaven.com/hdris)
  studioNight: {
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr',
    description: 'Dark studio lighting, perfect for particles',
    resolution: '1k',
  },
  moonlessGolf: {
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonless_golf_1k.hdr',
    description: 'Night sky environment',
    resolution: '1k',
  },
  darkStudio: {
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',
    description: 'Moody studio setup',
    resolution: '1k',
  },
} as const;

export const TEXTURE_ASSETS = {
  // Local textures in public/assets/textures/
  // SVG versions available, PNG versions can be generated via scripts/svg-to-png.js
  purpleGradient: '/assets/textures/purple-gradient.svg',
  purpleGradientPng: '/assets/textures/purple-gradient.png',
  noise: '/assets/textures/noise.svg',
  noisePng: '/assets/textures/noise.png',
  matcap: '/assets/textures/matcap-metallic.svg',
  matcapPng: '/assets/textures/matcap-metallic.png',
} as const;

export const SPRITE_ASSETS = {
  // Local sprites in public/assets/sprites/
  // SVG versions available, PNG versions can be generated via scripts/svg-to-png.js
  particle: '/assets/sprites/particle-glow.svg',
  particlePng: '/assets/sprites/particle-glow.png',
  particleSoft: '/assets/sprites/particle-soft.svg',
  particleSoftPng: '/assets/sprites/particle-soft.png',
} as const;

// Helper to get asset path
export const getAssetUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return path;
};

// Preload function for Three.js
export const preloadAssets = async () => {
  const texturePaths = Object.values(TEXTURE_ASSETS);
  const spritePaths = Object.values(SPRITE_ASSETS);

  return [...texturePaths, ...spritePaths];
};
