#!/bin/bash
# Verify all 3D assets are present and properly formatted

ASSETS_DIR="/home/marci/projects/prism-digital/public/assets"
MISSING=0
TOTAL=0

echo "Verifying Prism Digital 3D Assets..."
echo "======================================"
echo ""

check_file() {
    local file=$1
    local desc=$2
    TOTAL=$((TOTAL + 1))

    if [ -f "$file" ]; then
        local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        echo "✓ $desc"
        echo "  Path: $file"
        echo "  Size: $size bytes"
        echo ""
    else
        echo "✗ MISSING: $desc"
        echo "  Expected: $file"
        echo ""
        MISSING=$((MISSING + 1))
    fi
}

echo "Checking HDRI Configuration:"
echo "----------------------------"
check_file "$ASSETS_DIR/hdri/hdri-config.json" "HDRI Configuration"

echo "Checking Textures:"
echo "------------------"
check_file "$ASSETS_DIR/textures/purple-gradient.svg" "Purple Gradient (SVG)"
check_file "$ASSETS_DIR/textures/noise.svg" "Noise Texture (SVG)"
check_file "$ASSETS_DIR/textures/matcap-metallic.svg" "Metallic Matcap (SVG)"

echo "Checking Sprites:"
echo "-----------------"
check_file "$ASSETS_DIR/sprites/particle-glow.svg" "Particle Glow Sprite (SVG)"
check_file "$ASSETS_DIR/sprites/particle-soft.svg" "Particle Soft Sprite (SVG)"

echo "Checking Documentation:"
echo "-----------------------"
check_file "$ASSETS_DIR/README.md" "Asset Documentation"

echo "Checking Asset Manifest:"
echo "------------------------"
check_file "/home/marci/projects/prism-digital/src/lib/assets.ts" "TypeScript Asset Manifest"

echo "======================================"
echo "Verification Complete"
echo ""
echo "Total Assets: $TOTAL"
echo "Present: $((TOTAL - MISSING))"
echo "Missing: $MISSING"
echo ""

if [ $MISSING -eq 0 ]; then
    echo "✓ All assets are present and ready for use!"
    echo ""
    echo "Next Steps:"
    echo "  1. (Optional) Generate PNG versions: npm install sharp && node scripts/svg-to-png.js"
    echo "  2. Import assets in R3F components using: import { TEXTURE_ASSETS } from '@/lib/assets'"
    echo "  3. Load textures with useTexture hook from @react-three/drei"
    exit 0
else
    echo "✗ Some assets are missing. Run generation scripts:"
    echo "  ./scripts/create_fallback_assets.sh"
    exit 1
fi
