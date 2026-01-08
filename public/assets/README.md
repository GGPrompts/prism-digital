# Prism Digital 3D Assets

This directory contains all textures, sprites, and environment maps for the React Three Fiber particle scene.

## Directory Structure

```
assets/
├── hdri/              # Environment maps and HDRIs
├── textures/          # Surface textures and gradients
├── sprites/           # Particle sprites
└── README.md          # This file
```

## Asset Inventory

### HDRI / Environment Maps

Located in `hdri/hdri-config.json`:

| Name | Resolution | Description | Source |
|------|------------|-------------|--------|
| **Studio Night** | 1k | Dark studio lighting, minimal reflections | Poly Haven (CC0) |
| **Moonless Golf** | 1k | Dark night sky, minimal ambient | Poly Haven (CC0) |
| **Dark Studio** | 1k | Moody studio setup, controlled lighting | Poly Haven (CC0) |

**Usage in R3F:**
```tsx
import { Environment } from '@react-three/drei'

// Option 1: Use URL directly
<Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr" />

// Option 2: Use preset
<Environment preset="night" />
```

### Textures

Located in `textures/`:

#### Purple Gradient (`purple-gradient.svg/png`)
- **Size:** 256x256
- **Format:** SVG (vector) + PNG (raster)
- **Colors:** Deep purple (#1a0033) → Light purple (#d580ff)
- **Use Case:** Scene theming, background gradients, color ramps

#### Noise Texture (`noise.svg/png`)
- **Size:** 512x512
- **Format:** SVG (procedural) + PNG (raster)
- **Type:** Perlin noise, seamless tileable
- **Use Case:** Particle displacement mapping, roughness maps

#### Metallic Matcap (`matcap-metallic.svg/png`)
- **Size:** 256x256
- **Format:** SVG (gradient) + PNG (raster)
- **Type:** Spherical gradient, material capture
- **Use Case:** Metallic/reflective material shading without lighting

**Usage in R3F:**
```tsx
import { useTexture } from '@react-three/drei'

function MyMaterial() {
  const [gradient, noise, matcap] = useTexture([
    '/assets/textures/purple-gradient.png',
    '/assets/textures/noise.png',
    '/assets/textures/matcap-metallic.png',
  ])

  return (
    <meshMatcapMaterial matcap={matcap} />
  )
}
```

### Sprites

Located in `sprites/`:

#### Particle Glow (`particle-glow.svg/png`)
- **Size:** 64x64
- **Format:** SVG + PNG with alpha
- **Type:** Radial gradient, sharp center falloff
- **Colors:** White → Transparent
- **Use Case:** Primary particle sprites, bright focal points

#### Particle Soft (`particle-soft.svg/png`)
- **Size:** 64x64
- **Format:** SVG + PNG with alpha
- **Type:** Radial gradient, gentle falloff
- **Colors:** White → Transparent
- **Use Case:** Background particles, atmospheric effects

**Usage in R3F (Points):**
```tsx
import { useTexture } from '@react-three/drei'
import { PointsMaterial } from 'three'

function Particles() {
  const sprite = useTexture('/assets/sprites/particle-glow.png')

  return (
    <points>
      <bufferGeometry />
      <pointsMaterial
        map={sprite}
        transparent
        size={0.1}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
```

## Asset Formats

### SVG Assets
- **Pros:** Vector-based, infinite scaling, small file size
- **Cons:** May require rasterization for some Three.js materials
- **Best For:** Development, prototyping, web previews

### PNG Assets
- **Pros:** Native Three.js support, GPU-optimized
- **Cons:** Fixed resolution, larger file size
- **Best For:** Production builds, performance-critical rendering

## Performance Tips

1. **Use Mipmaps**: Three.js generates mipmaps automatically for power-of-2 textures
2. **Texture Compression**: Consider using compressed texture formats (KTX2, Basis)
3. **Lazy Loading**: Load textures on-demand using `useTexture` from drei
4. **Texture Atlasing**: Combine small sprites into texture atlas
5. **Resolution**: Use smallest resolution that looks good (64px often sufficient for particles)

## Generating PNG from SVG

To convert SVG assets to PNG:

```bash
# Using Node.js script (requires sharp)
npm install sharp
node scripts/svg-to-png.js

# Or using ImageMagick
convert assets/textures/purple-gradient.svg -resize 256x256 assets/textures/purple-gradient.png

# Or using Inkscape
inkscape --export-type=png --export-width=256 assets/textures/purple-gradient.svg
```

## Regenerating Assets

### From Scratch (Python)
```bash
pip install Pillow numpy
python3 scripts/generate_assets.py
```

### Fallback (SVG only)
```bash
./scripts/create_fallback_assets.sh
```

## Asset Manifest

Import paths are defined in `src/lib/assets.ts`:

```typescript
export const TEXTURE_ASSETS = {
  purpleGradient: '/assets/textures/purple-gradient.png',
  noise: '/assets/textures/noise.png',
  matcap: '/assets/textures/matcap-metallic.png',
}

export const SPRITE_ASSETS = {
  particle: '/assets/sprites/particle-glow.png',
  particleSoft: '/assets/sprites/particle-soft.png',
}
```

## License

- **HDRI Environments**: CC0 (Public Domain) from Poly Haven
- **Generated Textures/Sprites**: CC0 (Public Domain), created for this project

## Resources

- [Poly Haven](https://polyhaven.com/) - Free HDRIs, textures, models
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) - R3F documentation
- [@react-three/drei](https://github.com/pmndrs/drei) - Useful helpers (useTexture, Environment)
- [Three.js Texture](https://threejs.org/docs/#api/en/textures/Texture) - Texture API reference
