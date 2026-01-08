#!/usr/bin/env node
/**
 * Generate procedural textures and sprites for Prism Digital
 * Creates purple-themed gradients, noise textures, and particle sprites
 */

const fs = require('fs');
const path = require('path');

// Use canvas if available, otherwise use a simple implementation
let Canvas, createCanvas;
try {
  const canvas = require('canvas');
  Canvas = canvas.Canvas;
  createCanvas = canvas.createCanvas;
} catch (e) {
  console.log('canvas module not available, using basic implementation');
  // Fallback: we'll just create the files and document what they should be
}

const OUTPUT_DIR = path.join(__dirname, '../public/assets');

// Ensure directories exist
['textures', 'sprites'].forEach(dir => {
  const fullPath = path.join(OUTPUT_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

/**
 * Generate a purple gradient texture (256x256)
 */
function generatePurpleGradient() {
  if (!createCanvas) {
    console.log('Skipping canvas generation (no canvas module)');
    return null;
  }

  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  // Create vertical gradient from deep purple to bright purple
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#1a0033');    // Deep purple
  gradient.addColorStop(0.3, '#4a0080');  // Medium purple
  gradient.addColorStop(0.7, '#8b00ff');  // Bright purple
  gradient.addColorStop(1, '#d580ff');    // Light purple

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  return canvas.toBuffer('image/png');
}

/**
 * Generate noise texture for displacement (512x512)
 */
function generateNoiseTexture() {
  if (!createCanvas) {
    console.log('Skipping canvas generation (no canvas module)');
    return null;
  }

  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(512, 512);

  // Generate perlin-style noise (simplified)
  for (let i = 0; i < imageData.data.length; i += 4) {
    const value = Math.random() * 255;
    imageData.data[i] = value;     // R
    imageData.data[i + 1] = value; // G
    imageData.data[i + 2] = value; // B
    imageData.data[i + 3] = 255;   // A
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toBuffer('image/png');
}

/**
 * Generate metallic matcap texture (256x256)
 */
function generateMatcapTexture() {
  if (!createCanvas) {
    console.log('Skipping canvas generation (no canvas module)');
    return null;
  }

  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  // Create radial gradient for metallic look
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.4, '#ccccff');
  gradient.addColorStop(0.7, '#6666cc');
  gradient.addColorStop(1, '#222244');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  return canvas.toBuffer('image/png');
}

/**
 * Generate soft circular particle sprite (64x64)
 */
function generateParticleSprite() {
  if (!createCanvas) {
    console.log('Skipping canvas generation (no canvas module)');
    return null;
  }

  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext('2d');

  // Create radial gradient for soft glow
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return canvas.toBuffer('image/png');
}

/**
 * Generate softer particle sprite with more falloff (64x64)
 */
function generateSoftParticleSprite() {
  if (!createCanvas) {
    console.log('Skipping canvas generation (no canvas module)');
    return null;
  }

  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext('2d');

  // Create radial gradient with more gradual falloff
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return canvas.toBuffer('image/png');
}

// Generate all assets
console.log('Generating Prism Digital assets...\n');

const assets = [
  {
    name: 'purple-gradient.png',
    path: 'textures',
    generator: generatePurpleGradient,
    description: 'Purple gradient texture for scene theming',
  },
  {
    name: 'noise.png',
    path: 'textures',
    generator: generateNoiseTexture,
    description: 'Noise texture for particle displacement',
  },
  {
    name: 'matcap-metallic.png',
    path: 'textures',
    generator: generateMatcapTexture,
    description: 'Metallic matcap for reflective surfaces',
  },
  {
    name: 'particle-glow.png',
    path: 'sprites',
    generator: generateParticleSprite,
    description: 'Soft circular particle sprite with glow',
  },
  {
    name: 'particle-soft.png',
    path: 'sprites',
    generator: generateSoftParticleSprite,
    description: 'Extra soft particle sprite for background',
  },
];

let generatedCount = 0;
let skippedCount = 0;

assets.forEach(asset => {
  const buffer = asset.generator();
  const outputPath = path.join(OUTPUT_DIR, asset.path, asset.name);

  if (buffer) {
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Generated: ${asset.path}/${asset.name}`);
    console.log(`  ${asset.description}\n`);
    generatedCount++;
  } else {
    console.log(`⊘ Skipped: ${asset.path}/${asset.name}`);
    console.log(`  ${asset.description}`);
    console.log(`  (canvas module not available)\n`);
    skippedCount++;
  }
});

console.log(`\nAsset generation complete!`);
console.log(`Generated: ${generatedCount}, Skipped: ${skippedCount}\n`);

if (skippedCount > 0) {
  console.log('To generate canvas-based assets, install the canvas module:');
  console.log('  npm install canvas\n');
  console.log('Or use ImageMagick to create them manually (see README).\n');
}
