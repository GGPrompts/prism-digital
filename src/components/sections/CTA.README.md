# CTA Section Component

A climactic, conversion-focused call-to-action section designed for the Prism Digital 3D landing page.

## Overview

The CTA section serves as the final conversion moment before the footer. It features:
- **Dramatic gradient background** with animated purple glow
- **Large, commanding headline** with gradient text effect
- **Oversized CTA button** as the most prominent element on the page
- **Email capture form** for newsletter signups
- **Floating particle effect** for visual depth
- **Scroll-triggered animations** with staggered reveals

## Design Decisions

### Aesthetic Direction: MAXIMALIST DIGITAL LUXURY

This component embraces a bold, high-impact aesthetic that matches the 3D visualization theme:

1. **Typography**
   - Display: 5xl to 8xl (80px-96px) ultra-bold headline
   - Gradient text from white → purple → pink
   - Tight tracking (-0.02em) for modern feel
   - Large supporting text (xl to 2xl) for readability

2. **Color & Effects**
   - Animated radial gradient background (purple → pink fade)
   - Pulsing glow effect on background layer
   - Multiple shadow layers for depth
   - Semi-transparent glass card for email form

3. **Motion & Interaction**
   - Scroll-triggered fade-in with staggered delays (100ms, 300ms, 500ms, 700ms)
   - 30 floating particles with randomized animation
   - CTA button hover: scale(1.05) + enhanced shadow
   - Animated shine effect on button hover
   - 8s infinite pulse on background glow

4. **Spatial Composition**
   - Full-width section with generous vertical padding (py-32 to py-40)
   - Centered content with max-width constraint (max-w-5xl)
   - Oversized CTA button (px-12 py-6 on mobile, px-16 py-8 on desktop)
   - Floating particles scattered across entire viewport

## Technical Implementation

### Component Structure

```tsx
<section> (outer container with gradient background)
  ├── Animated gradient glow overlay (pulsing radial gradient)
  ├── Floating particles (30 divs with randomized positions/animations)
  └── Content wrapper (z-10, centered)
      ├── Headline (staggered fade-in, delay: 100ms)
      ├── Decorative divider (gradient line with glow)
      ├── Supporting copy (staggered fade-in, delay: 300ms)
      ├── Primary CTA button (staggered fade-in, delay: 500ms)
      └── Email form (staggered fade-in, delay: 700ms)
```

### Animations

**Scroll-triggered reveal:**
- Uses IntersectionObserver API
- Triggers at 30% viewport intersection
- Applies opacity 0→1 and translateY(10px)→0 transitions
- Each element has custom delay for stagger effect

**Background pulse:**
```css
@keyframes pulse-glow {
  0%, 100% { scale: 1; opacity: 0.3; }
  50% { scale: 1.1; opacity: 0.4; }
}
```

**Floating particles:**
```css
@keyframes float {
  0% { translateY(0) translateX(0) }
  25% { translateY(-20px) translateX(10px) }
  50% { translateY(-40px) translateX(-5px) }
  75% { translateY(-20px) translateX(-10px) }
  100% { translateY(0) translateX(0) }
}
```

**Button shine:**
- Gradient overlay from -translateX(100%) to translateX(100%)
- 1s duration on hover

### Responsive Design

**Mobile (default):**
- Headline: text-5xl (48px)
- Supporting text: text-xl (20px)
- CTA button: px-12 py-6, text-xl
- Padding: py-32 (128px vertical)

**Tablet (md: 768px+):**
- Headline: text-7xl (72px)
- Supporting text: text-2xl (24px)
- CTA button: px-16 py-8, text-2xl
- Padding: py-40 (160px vertical)

**Desktop (lg: 1024px+):**
- Headline: text-8xl (96px)
- All other sizes inherited from tablet

### Accessibility

- **Semantic HTML**: Uses `<section>` with proper heading hierarchy
- **Focus states**: Form inputs have visible focus rings (border-primary, shadow-primary/20)
- **Button states**: Disabled state shows reduced opacity (0.5)
- **Color contrast**: White text on purple gradients meets WCAG AA
- **Keyboard navigation**: All interactive elements are keyboard-accessible
- **Form validation**: Email input uses HTML5 validation (type="email", required)

## Usage

```tsx
import { CTA } from '@/components/sections/CTA'

export default function Page() {
  return (
    <main>
      {/* Other sections */}
      <CTA />
      {/* Footer */}
    </main>
  )
}
```

## Customization

### Change CTA Button Text/Link

```tsx
// Edit line ~135 in CTA.tsx
<button ... >
  <span className="relative z-10 flex items-center gap-3">
    Your Custom Text
    {/* Icon */}
  </span>
</button>
```

To add a link, replace `<button>` with `<a href="/your-link">` and adjust styling.

### Change Headline

```tsx
// Edit lines ~109-112 in CTA.tsx
<h2 ...>
  Your Custom
  <br />
  Headline
</h2>
```

### Disable Email Form

Remove or comment out the email form section (lines ~165-199).

### Adjust Particle Count

Change `{[...Array(30)].map(...)}` on line ~78 to desired count (e.g., `{[...Array(50)].map(...)}` for more particles).

### Modify Colors

All colors reference CSS variables from `globals.css`:
- `--primary`: Main purple (#a855f7)
- `--primary-hover`: Lighter purple (#c084fc)
- `--accent-pink`: Pink accent (#f472b6)
- `--foreground`: Text color (#f4f4f5)
- `--foreground-muted`: Secondary text (#a1a1aa)

## Performance Considerations

### Optimizations Applied

1. **CSS-only particles**: Uses pure CSS animations (no JS overhead)
2. **IntersectionObserver**: Efficient scroll detection (doesn't poll)
3. **Cleanup**: Observer disconnects on unmount
4. **No external dependencies**: Pure React + CSS
5. **Backdrop-filter**: Uses hardware-accelerated blur

### Bundle Impact

- Component size: ~6KB (including JSX + styles)
- No external libraries added
- Minimal runtime overhead (single observer, form state)

### Accessibility Performance

- No layout shift (CLS): Fixed dimensions prevent reflow
- No blocking animations: All animations use transform/opacity
- Respects prefers-reduced-motion (could be added):

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

## Browser Support

- **Modern browsers**: Full support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Backdrop-filter**: Fallback to solid background (IE11, older browsers)
- **IntersectionObserver**: Polyfill recommended for IE11 support
- **CSS Grid/Flexbox**: Widely supported

## Future Enhancements

Potential additions:
- [ ] Connect email form to actual API endpoint (Mailchimp, ConvertKit, etc.)
- [ ] Add success/error toast notifications
- [ ] Implement `prefers-reduced-motion` support
- [ ] Add analytics tracking for CTA button clicks
- [ ] A/B test different headlines/copy
- [ ] Add social proof (customer logos, testimonials)
- [ ] Animate particle count based on scroll position

## Files

- **Component**: `/src/components/sections/CTA.tsx` (main component)
- **Styles**: Inline styles + references to `/src/app/globals.css` (design system)
- **Usage**: `/src/app/page.tsx` (integrated into home page)

## Credits

- **Design System**: Prism Digital purple theme (see `globals.css`)
- **Inspiration**: Modern 3D landing pages, maximalist digital luxury aesthetics
- **Typography**: Geist Sans (Next.js default font)
