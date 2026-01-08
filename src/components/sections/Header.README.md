# Header Component - Glass Navigation Overlay

A sophisticated floating navigation header with glass morphism effects, scroll-based auto-hide/show behavior, and mobile-responsive design for the Prism Digital 3D landing page.

## Features

### Design
- **Glass Morphism**: Semi-transparent background with backdrop blur overlay
- **Refined Typography**: Tight tracking and bold weights for futuristic feel
- **Purple Gradient Branding**: Dynamic gradient logo with hover animations
- **Elegant Hover States**: Smooth micro-interactions with glow effects
- **Dark Theme Optimized**: Light text on dark/transparent background

### Functionality
- **Scroll Detection**: Auto-hide on scroll down, show on scroll up
- **Smooth Scroll**: Anchor links with smooth scroll behavior to sections
- **Mobile Responsive**: Hamburger menu with slide-out drawer
- **Accessibility**: Keyboard navigation, ARIA labels, focus states
- **Performance**: RequestAnimationFrame for smooth scroll detection

### Interactions
- **Logo Animation**: Gradient transition + animated underline on hover
- **Nav Link Hover**: Background glow + bottom accent line animation
- **CTA Button**: Scale, glow, shine effect, gradient overlay
- **Mobile Menu**: Staggered animation delays for menu items
- **Escape Key**: Close mobile menu with ESC key

## Structure

```
Header
├── Desktop Navigation
│   ├── Logo (gradient text with animated underline)
│   ├── Nav Links (Features, About, Contact)
│   └── CTA Button (See Our Work)
└── Mobile Navigation
    ├── Hamburger Button (animated icon)
    ├── Overlay (backdrop)
    └── Drawer (slide-out menu)
        ├── Nav Links
        ├── CTA Button
        └── Tagline
```

## Technical Implementation

### Scroll Detection
```typescript
useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Add blur when scrolled past 50px
    setScrolled(currentScrollY > 50);

    // Hide on scroll down, show on scroll up
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setHidden(true);
    } else if (currentScrollY < lastScrollY) {
      setHidden(false);
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
}, [lastScrollY]);
```

### Glass Effect Classes
```css
bg-black/20 backdrop-blur-xl border-b border-white/10
```

### Animation Timing
- **Header slide**: 500ms ease-out-expo
- **Logo underline**: 500ms ease-out-expo
- **Nav links**: 300ms ease-out
- **CTA hover**: 300ms ease-out
- **Mobile menu items**: Staggered 100ms delays

## Navigation Structure

### Desktop Nav Links
- **Features** → `#features`
- **About** → `#about` (Testimonials section)
- **Contact** → `#contact` (CTA section)

### CTA Button
- **Desktop + Mobile** → `#contact`

## Styling Details

### Color Palette
- **Background**: `bg-black/20` (scrolled), `bg-transparent` (top)
- **Text**: `text-foreground-muted` → `text-foreground` (hover)
- **Accent**: Purple gradients (`primary`, `primary-hover`, `accent-pink`, `accent-cyan`)
- **Border**: `border-white/10` → `border-primary/50` (hover)

### Typography
- **Logo**: 2xl, bold, tracking-tighter
- **Nav Links**: sm, medium, tracking-wide, uppercase
- **CTA**: sm, semibold, tracking-wide
- **Mobile Nav**: lg, semibold, tracking-wide

### Layout
- **Height**: 80px (5rem)
- **Max Width**: 1400px (container-custom)
- **Padding**: 24px horizontal
- **Z-index**: 50 (above canvas, below modals)

## Mobile Behavior

### Breakpoint
- **Desktop**: `md:flex` (≥768px)
- **Mobile**: `md:hidden` (<768px)

### Mobile Menu States
- **Closed**: `translate-x-full opacity-0`
- **Open**: `translate-x-0 opacity-100`
- **Body Scroll**: Disabled when menu open

### Mobile Drawer
- **Width**: Full width with max-w-sm
- **Position**: Fixed right side
- **Background**: `bg-background-secondary/95` with blur
- **Animation**: 500ms slide with staggered item reveals

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate through links
- **Enter/Space**: Activate links/buttons
- **Escape**: Close mobile menu

### ARIA Attributes
- `aria-label`: Descriptive labels for buttons
- `aria-expanded`: Menu open/closed state
- `aria-hidden`: Hide elements from screen readers

### Focus States
- Visible focus rings with purple accent
- Skip to content support (inherited from layout)

## Performance Optimizations

1. **RequestAnimationFrame**: Throttle scroll events
2. **Passive Listeners**: Improve scroll performance
3. **CSS Transforms**: Hardware-accelerated animations
4. **Conditional Rendering**: Only render mobile menu when needed
5. **Debounced State**: Prevent excessive re-renders

## Integration

### Import
```tsx
import { Header } from '@/components/sections/Header'
```

### Usage
```tsx
<Header />
```

### Position in Layout
```tsx
<main>
  <Canvas3D />
  <Header />
  <div className="relative z-10">{children}</div>
</main>
```

## Customization

### Change Logo
Edit the logo Link component text spans in Header.tsx

### Update Nav Links
Modify the `navLinks` array:
```typescript
const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];
```

### Adjust Scroll Threshold
Change scroll detection values:
```typescript
setScrolled(currentScrollY > 50);  // Blur threshold
currentScrollY > 100               // Hide threshold
```

### Modify Colors
Update gradient values and color variables

## Browser Support

- Modern browsers with backdrop-filter support
- Fallback: Solid background for older browsers
- Mobile Safari: Tested with -webkit-backdrop-filter

## Dependencies

- Next.js 15+ (Link, useEffect, useState)
- Tailwind CSS v4
- No external libraries required

## Design Philosophy

This header embodies a **refined minimal maximalism** approach:
- **Bold typography** with tight tracking for futuristic feel
- **Sophisticated micro-interactions** that surprise and delight
- **Restrained color palette** with strategic purple accents
- **Glass morphism** for depth without visual weight
- **Smooth animations** with refined easing curves

The design avoids generic AI aesthetics by:
- Using distinctive Geist font family instead of Inter/Roboto
- Implementing custom gradient animations vs. static colors
- Adding unexpected hover effects (animated underlines, shine)
- Creating a unique brand voice through typography choices
- Balancing minimalism with high-impact moments

## Files

- **Component**: `/src/components/sections/Header.tsx`
- **Styles**: `/src/app/globals.css` (custom utilities)
- **Layout**: `/src/app/layout.tsx` (integration)

## Status

✅ Implemented
✅ Responsive
✅ Accessible
✅ Animated
✅ Glass morphism
✅ Scroll behavior
✅ Mobile menu
✅ Production-ready
