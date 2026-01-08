# Performance Testing Guide

This guide explains how to test and verify the performance optimizations.

## Quick Verification

### 1. Chrome DevTools Performance

```bash
npm run dev
```

1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Start recording
4. Interact with the page (scroll, mouse movement)
5. Stop recording after 10 seconds

**What to look for:**
- FPS should be consistently 60fps
- No long tasks (>50ms)
- Smooth frame rendering (green bars)
- No layout thrashing

### 2. Chrome DevTools Rendering

1. Open DevTools (F12)
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
3. Type "Show Rendering"
4. Enable "FPS Meter"
5. Enable "Frame Rendering Stats"

**Target metrics:**
- FPS: 60 (consistent)
- GPU Memory: <500MB on high-end, <200MB on mobile
- No dropped frames during scroll

### 3. Lighthouse Performance Audit

1. Open DevTools > Lighthouse tab
2. Select "Performance" category
3. Choose "Desktop" or "Mobile"
4. Run audit

**Target scores:**
- Performance: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Total Blocking Time: <200ms

## Device Testing

### Desktop Testing

**High-end (e.g., M1 Mac, RTX 3000+)**
```
Expected: 60fps constant
Particle count: 3000
Effects: Full quality
DPR: Up to 2.0
```

**Mid-range (e.g., Intel integrated graphics)**
```
Expected: 55-60fps
Particle count: 1500-2000
Effects: Medium quality
DPR: 1.0-1.5
```

**Low-end (e.g., older laptops)**
```
Expected: 45-55fps
Particle count: 800-1000
Effects: Disabled or low quality
DPR: 1.0
```

### Mobile Testing

**High-end (e.g., iPhone 14 Pro, Pixel 7)**
```
Expected: 60fps
Particle count: 1200
Effects: Medium quality
DPR: Up to 1.5
```

**Mid-range (e.g., iPhone 11, mid-tier Android)**
```
Expected: 45-55fps
Particle count: 600
Effects: Disabled
DPR: 1.0
```

**Low-end (e.g., budget Android)**
```
Expected: 30-45fps
Particle count: 300
Effects: Disabled
DPR: 0.5-1.0
```

## Testing Checklist

### Visual Tests

- [ ] Smooth scroll animations
- [ ] No jank during mouse interaction
- [ ] Particle systems animate smoothly
- [ ] No visual artifacts or glitches
- [ ] Bloom effect renders correctly (if enabled)
- [ ] No flickering or tearing

### Performance Tests

- [ ] Consistent 60fps on desktop
- [ ] No dropped frames during scroll
- [ ] Smooth camera movements
- [ ] No stuttering during transitions
- [ ] Memory usage stable (no leaks)
- [ ] GPU usage reasonable (<80%)

### Adaptive Quality Tests

- [ ] Particle count reduces on low-end devices
- [ ] Effects disable on mobile/low-end
- [ ] DPR adjusts based on performance
- [ ] Quality degrades gracefully under load
- [ ] Recovery to high quality when performance improves

### Edge Cases

- [ ] Works with browser at 50% zoom
- [ ] Works with browser at 200% zoom
- [ ] Handles window resize
- [ ] Handles orientation change (mobile)
- [ ] Works in incognito/private mode
- [ ] Works with hardware acceleration disabled

## Automated Performance Tests

### Using Playwright

Create `tests/performance.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('maintains 60fps during scroll', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Start performance monitoring
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      let frames = 0;
      let start = performance.now();

      const measureFPS = () => {
        frames++;
        const elapsed = performance.now() - start;

        if (elapsed >= 5000) { // Measure for 5 seconds
          resolve(frames / (elapsed / 1000));
        } else {
          requestAnimationFrame(measureFPS);
        }
      };

      requestAnimationFrame(measureFPS);
    });
  });

  expect(metrics).toBeGreaterThan(55); // At least 55fps
});
```

### Using WebPageTest

1. Go to [webpagetest.org](https://www.webpagetest.org/)
2. Enter your deployment URL
3. Choose location and browser
4. Run test
5. Analyze results

**Target metrics:**
- Start Render: <1.5s
- Speed Index: <2.5s
- Largest Contentful Paint: <2.5s
- Total Blocking Time: <200ms

## Performance Profiling

### Memory Leaks

```javascript
// In browser console
performance.memory.usedJSHeapSize // Check before
// Interact with page for 2 minutes
performance.memory.usedJSHeapSize // Check after

// Memory should be relatively stable
// No continuous growth
```

### GPU Performance

1. Chrome: `chrome://gpu`
2. Check "Graphics Feature Status"
3. Ensure "WebGL" and "WebGL2" are "Hardware accelerated"

### Frame Analysis

```javascript
// In useFrame hook (dev mode only)
useFrame((state, delta) => {
  if (delta > 1/50) { // Frame took longer than 20ms
    console.warn('Slow frame detected:', delta * 1000, 'ms');
  }
});
```

## Optimization Verification

### Before vs After Comparison

Run these tests before and after optimizations:

```bash
# 1. Measure bundle size
npm run build
ls -lh .next/static/chunks # Check chunk sizes

# 2. Run Lighthouse (headless)
npm install -g lighthouse
lighthouse http://localhost:3000 --view

# 3. Monitor performance
# Open DevTools > Performance Monitor
# Watch FPS, CPU usage, JS heap size
```

### Key Metrics to Compare

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| FPS (desktop) | ? | 60 | 60 |
| FPS (mobile) | ? | 50-60 | 45+ |
| Particle count (auto) | Fixed | Adaptive | ✓ |
| Memory usage | ? | Stable | No leaks |
| Bundle size | ? | Smaller | <500KB |
| Effects on mobile | Always | Conditional | ✓ |

## Debugging Performance Issues

### Low FPS

1. **Check particle count**
   ```javascript
   console.log('Particles:', particleCount);
   ```

2. **Check effect quality**
   ```javascript
   console.log('Effects enabled:', enableEffects);
   ```

3. **Monitor object allocation**
   - Look for object creation in useFrame
   - Check for missing useMemo/useRef

4. **Verify DPR settings**
   ```javascript
   console.log('DPR:', gl.getPixelRatio());
   ```

### Memory Leaks

1. **Check resource disposal**
   - Verify geometry.dispose()
   - Verify material.dispose()
   - Check for event listener cleanup

2. **Monitor memory growth**
   ```javascript
   setInterval(() => {
     console.log('Memory:', performance.memory.usedJSHeapSize);
   }, 5000);
   ```

### Jank/Stuttering

1. **Check for layout thrashing**
   - Avoid DOM reads after writes
   - Batch DOM operations
   - Use requestAnimationFrame

2. **Verify smooth scrolling**
   - Check scroll damping value
   - Ensure no blocking operations in scroll handler

3. **Check for synchronous operations**
   - No synchronous XHR
   - No long-running calculations
   - Use Web Workers if needed

## Performance Budget

Set and enforce performance budgets:

```javascript
// next.config.js
module.exports = {
  experimental: {
    performanceBudget: {
      maxInitialLoadTime: 3000, // ms
      maxRevalidateTime: 2000,
      maxFCP: 1500,
      maxLCP: 2500,
    },
  },
};
```

## Continuous Monitoring

### Production Monitoring

1. **Web Vitals**
   ```typescript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

2. **Performance Observer**
   ```javascript
   const observer = new PerformanceObserver((list) => {
     for (const entry of list.getEntries()) {
       // Send to analytics
       console.log(entry.name, entry.duration);
     }
   });
   observer.observe({ entryTypes: ['measure', 'navigation'] });
   ```

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
