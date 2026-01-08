#!/usr/bin/env node
/**
 * Convert SVG assets to PNG using sharp or canvas
 * Provides raster versions of textures for better Three.js performance
 */

const fs = require('fs');
const path = require('path');

async function convertSVGtoPNG() {
  try {
    // Try to use sharp (best quality)
    const sharp = require('sharp');
    console.log('Using sharp for SVG to PNG conversion...\n');

    const conversions = [
      { input: 'textures/purple-gradient.svg', output: 'textures/purple-gradient.png', size: 256 },
      { input: 'textures/noise.svg', output: 'textures/noise.png', size: 512 },
      { input: 'textures/matcap-metallic.svg', output: 'textures/matcap-metallic.png', size: 256 },
      { input: 'sprites/particle-glow.svg', output: 'sprites/particle-glow.png', size: 64 },
      { input: 'sprites/particle-soft.svg', output: 'sprites/particle-soft.png', size: 64 },
    ];

    for (const { input, output, size } of conversions) {
      const inputPath = path.join(__dirname, '../public/assets', input);
      const outputPath = path.join(__dirname, '../public/assets', output);

      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Converted: ${output}`);
    }

    console.log('\nPNG conversion complete!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('sharp not installed. Install with:');
      console.log('  npm install sharp\n');
      console.log('For now, the SVG versions will work fine with Three.js TextureLoader.');
    } else {
      console.error('Error:', error.message);
    }
  }
}

convertSVGtoPNG();
