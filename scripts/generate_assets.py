#!/usr/bin/env python3
"""
Generate procedural textures and sprites for Prism Digital
Creates purple-themed gradients, noise textures, and particle sprites
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter
    import numpy as np
except ImportError:
    print("Error: PIL/Pillow not installed")
    print("Install with: pip install Pillow numpy")
    sys.exit(1)

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "assets"

def ensure_directories():
    """Create output directories if they don't exist"""
    (OUTPUT_DIR / "textures").mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "sprites").mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "hdri").mkdir(parents=True, exist_ok=True)

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def generate_purple_gradient():
    """Generate a purple gradient texture (256x256)"""
    width, height = 256, 256
    img = Image.new('RGB', (width, height))

    # Define gradient colors (deep purple to light purple)
    colors = [
        hex_to_rgb('#1a0033'),  # Deep purple
        hex_to_rgb('#4a0080'),  # Medium purple
        hex_to_rgb('#8b00ff'),  # Bright purple
        hex_to_rgb('#d580ff'),  # Light purple
    ]

    # Create vertical gradient
    for y in range(height):
        # Determine which color segment we're in
        segment = (y / height) * (len(colors) - 1)
        idx = int(segment)

        if idx >= len(colors) - 1:
            color = colors[-1]
        else:
            # Interpolate between two colors
            t = segment - idx
            c1, c2 = colors[idx], colors[idx + 1]
            color = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

        for x in range(width):
            img.putpixel((x, y), color)

    return img

def generate_noise_texture():
    """Generate noise texture for displacement (512x512)"""
    width, height = 512, 512

    # Generate random noise
    noise = np.random.randint(0, 256, (height, width), dtype=np.uint8)
    img = Image.fromarray(noise, mode='L')

    # Apply slight blur for smoother noise
    img = img.filter(ImageFilter.GaussianBlur(radius=1))

    return img

def generate_matcap_texture():
    """Generate metallic matcap texture (256x256)"""
    width, height = 256, 256
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)

    center_x, center_y = width // 2, height // 2

    # Create radial gradient for metallic look
    for y in range(height):
        for x in range(width):
            # Calculate distance from center
            dx = x - center_x
            dy = y - center_y
            distance = (dx*dx + dy*dy) ** 0.5

            # Normalize distance (0 to 1)
            max_distance = (center_x**2 + center_y**2) ** 0.5
            norm_dist = min(distance / max_distance, 1.0)

            # Create metallic gradient (white center to dark blue edge)
            r = int(255 * (1 - norm_dist * 0.8))
            g = int(255 * (1 - norm_dist * 0.8))
            b = int(255 * (1 - norm_dist * 0.5))

            img.putpixel((x, y), (r, g, b))

    return img

def generate_particle_sprite():
    """Generate soft circular particle sprite (64x64)"""
    size = 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    center = size // 2

    # Create radial gradient with alpha
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            distance = (dx*dx + dy*dy) ** 0.5

            # Normalize distance
            max_distance = center
            norm_dist = min(distance / max_distance, 1.0)

            # Create soft falloff
            if norm_dist < 0.2:
                alpha = 255
            elif norm_dist < 0.5:
                alpha = int(255 * (1 - (norm_dist - 0.2) / 0.3 * 0.2))
            elif norm_dist < 1.0:
                alpha = int(255 * (1 - (norm_dist - 0.5) / 0.5) * 0.8)
            else:
                alpha = 0

            img.putpixel((x, y), (255, 255, 255, alpha))

    return img

def generate_soft_particle_sprite():
    """Generate softer particle sprite with more falloff (64x64)"""
    size = 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    center = size // 2

    # Create radial gradient with alpha and softer falloff
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            distance = (dx*dx + dy*dy) ** 0.5

            # Normalize distance
            max_distance = center
            norm_dist = min(distance / max_distance, 1.0)

            # Create very soft falloff
            if norm_dist < 0.3:
                alpha = int(255 * 0.6)
            elif norm_dist < 0.7:
                alpha = int(255 * 0.6 * (1 - (norm_dist - 0.3) / 0.4))
            elif norm_dist < 1.0:
                alpha = int(255 * 0.6 * (1 - (norm_dist - 0.7) / 0.3) * 0.3)
            else:
                alpha = 0

            img.putpixel((x, y), (255, 255, 255, alpha))

    return img

def main():
    """Generate all assets"""
    print("Generating Prism Digital assets...\n")

    ensure_directories()

    assets = [
        {
            'name': 'purple-gradient.png',
            'path': 'textures',
            'generator': generate_purple_gradient,
            'description': 'Purple gradient texture for scene theming',
        },
        {
            'name': 'noise.png',
            'path': 'textures',
            'generator': generate_noise_texture,
            'description': 'Noise texture for particle displacement',
        },
        {
            'name': 'matcap-metallic.png',
            'path': 'textures',
            'generator': generate_matcap_texture,
            'description': 'Metallic matcap for reflective surfaces',
        },
        {
            'name': 'particle-glow.png',
            'path': 'sprites',
            'generator': generate_particle_sprite,
            'description': 'Soft circular particle sprite with glow',
        },
        {
            'name': 'particle-soft.png',
            'path': 'sprites',
            'generator': generate_soft_particle_sprite,
            'description': 'Extra soft particle sprite for background',
        },
    ]

    for asset in assets:
        try:
            img = asset['generator']()
            output_path = OUTPUT_DIR / asset['path'] / asset['name']
            img.save(output_path)
            print(f"✓ Generated: {asset['path']}/{asset['name']}")
            print(f"  {asset['description']}\n")
        except Exception as e:
            print(f"✗ Failed: {asset['path']}/{asset['name']}")
            print(f"  Error: {e}\n")

    print("Asset generation complete!\n")

if __name__ == '__main__':
    main()
