#!/bin/bash
# Create fallback SVG-based assets that can be rendered by browsers
# These are vector-based and will work without PIL/Pillow

ASSETS_DIR="/home/marci/projects/prism-digital/public/assets"

# Create purple gradient SVG
cat > "$ASSETS_DIR/textures/purple-gradient.svg" <<'EOF'
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a0033;stop-opacity:1" />
      <stop offset="33%" style="stop-color:#4a0080;stop-opacity:1" />
      <stop offset="66%" style="stop-color:#8b00ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d580ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" fill="url(#purpleGrad)" />
</svg>
EOF

# Create noise pattern SVG
cat > "$ASSETS_DIR/textures/noise.svg" <<'EOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <filter id="noiseFilter">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
  </filter>
  <rect width="512" height="512" filter="url(#noiseFilter)" />
</svg>
EOF

# Create metallic matcap SVG
cat > "$ASSETS_DIR/textures/matcap-metallic.svg" <<'EOF'
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="metalGrad">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#ccccff;stop-opacity:1" />
      <stop offset="70%" style="stop-color:#6666cc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#222244;stop-opacity:1" />
    </radialGradient>
  </defs>
  <rect width="256" height="256" fill="url(#metalGrad)" />
</svg>
EOF

# Create particle glow sprite SVG
cat > "$ASSETS_DIR/sprites/particle-glow.svg" <<'EOF'
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glowGrad">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="20%" style="stop-color:#ffffff;stop-opacity:0.8" />
      <stop offset="50%" style="stop-color:#ffffff;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="32" fill="url(#glowGrad)" />
</svg>
EOF

# Create soft particle sprite SVG
cat > "$ASSETS_DIR/sprites/particle-soft.svg" <<'EOF'
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="softGrad">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.6" />
      <stop offset="30%" style="stop-color:#ffffff;stop-opacity:0.4" />
      <stop offset="70%" style="stop-color:#ffffff;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="32" fill="url(#softGrad)" />
</svg>
EOF

echo "✓ Created SVG-based assets:"
echo "  - textures/purple-gradient.svg"
echo "  - textures/noise.svg"
echo "  - textures/matcap-metallic.svg"
echo "  - sprites/particle-glow.svg"
echo "  - sprites/particle-soft.svg"
echo ""
echo "These SVG assets can be used directly in Three.js via TextureLoader."
echo "They are vector-based and will scale perfectly."
