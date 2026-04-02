# 🎨 Quick Reference - UI Enhancement Classes & Effects

## 📌 Quick Start

### 1. Import Required Files
```jsx
import '../../styles/image-effects.css';
import '../../styles/landing-page.css';
import '../../styles/advanced-animations.css';
import { initScrollAnimations } from '../../utils/scrollAnimations';
```

### 2. Initialize in useEffect
```jsx
useEffect(() => {
  const observer = initScrollAnimations();
  return () => observer.disconnect();
}, []);
```

### 3. Add Classes to Elements
```jsx
<Card className="scroll-fade-in glass-effect">...</Card>
```

---

## 🖼️ Image Effects Classes (25+)

### Zoom Effects
| Class | Effect | Usage |
|-------|--------|-------|
| `.img-zoom` | Scales 1.08x on hover | General zoom |
| `.img-slide-up` | Slides up 20px on hover | Upward movement |
| `.img-slide-down` | Slides down 20px on hover | Downward movement |
| `.img-slide-left` | Slides left 20px on hover | Leftward movement |
| `.img-slide-right` | Slides right 20px on hover | Rightward movement |
| `.img-flip-3d` | 3D perspective flip | Premium feel |
| `.img-rotate` | Rotates 5deg + scales 1.05 | Dynamic effect |
| `.img-skew` | Skews -5deg on hover | Playful feel |

### Color Effects
| Class | Effect | Usage |
|-------|--------|-------|
| `.img-grayscale-to-color` | B&W → Color transition | Eye-catching reveal |
| `.img-sepia` | Sepia tone effect | Vintage/warm feel |
| `.img-brightness` | Brightness + saturation | More vibrant |
| `.img-saturate` | Increases saturation 1.5x | Vibrant colors |
| `.img-hue-rotate` | Hue rotates 90deg | Creative effect |
| `.img-invert` | Inverts colors | Artistic effect |
| `.img-opacity` | Opacity to 0.7 | Subtle fade |

### Advanced Effects
| Class | Effect | Usage |
|-------|--------|-------|
| `.img-glow` | Glowing shadow effect | Highlight images |
| `.img-shadow` | Drop shadow effect | Depth |
| `.img-blur-on-hover` | Blurs 3px | Focus effect |
| `.img-radial-overlay` | Radial gradient appears | Interactive |
| `.img-gradient-overlay` | Linear sweep effect | Animated reveal |
| `.img-border-glow` | Glowing border | Premium styling |
| `.img-premium-effect` | Zoom + Brightness + Shadow | Hero images |
| `.img-vibrant-effect` | Grayscale + Zoom + Glow | Featured images |
| `.img-enhanced` | Brightness + Contrast + Saturate | Professional |

### Container Classes
| Class | Usage |
|-------|-------|
| `.img-container` | Rounded 12px border-radius |
| `.img-container-lg` | Rounded 16px border-radius |
| `.img-container-xl` | Rounded 20px border-radius |

---

## ✨ Scroll Animation Classes

| Class | Effect | Delay |
|-------|--------|-------|
| `.scroll-fade-in` | Fades in on scroll | 0.8s |
| `.scroll-slide-up` | Slides up with fade | 0.8s |
| `.scroll-slide-left` | Slides left with fade | 0.8s |
| `.scroll-zoom-in` | Zooms in with fade | 0.8s |

**Usage:**
```jsx
<Card className="scroll-fade-in">Primary Feature</Card>
<Row className="scroll-slide-left">Testimonials</Row>
<Col className="scroll-zoom-in">Course Card</Col>
```

---

## 🎭 Glass-Morphism Effects

| Class | Effect | Usage |
|-------|--------|-------|
| `.glass-effect` | Light frosted glass | Light backgrounds |
| `.glass-effect-dark` | Dark frosted glass | Dark backgrounds |

**Properties:**
- Backdrop filter blur: 10px
- Background: rgba with opacity
- Border: 1px with transparency
- Box shadow: Subtle depth

**Usage:**
```jsx
<Card className="glass-effect">Content</Card>
<div className="glass-effect-dark">Dark content</div>
```

---

## 🎯 Hover Effect Classes (General)

### Card Hover Effects
```html
<Card className="scroll-fade-in">
  <!-- Hover: translateY(-15px) scale(1.02) -->
  <!-- Shadow: 0 25px 50px rgba(102, 126, 234, 0.2) -->
</Card>
```

### Button Effects
```html
<Button className="btn hover-lift">
  <!-- Hover: translateY(-8px) scale(1.03) -->
  <!-- Shadow: 0 15px 40px -->
</Button>
```

### Icon Effects
```html
<div className="feature-icon">
  <!-- Hover: scale(1.1) rotate(5deg) -->
</div>
```

---

## 🎬 Advanced Animation Classes

| Class | Animation | Duration |
|-------|-----------|----------|
| `.pulse-glow` | Glowing pulse | 2s infinite |
| `.float-element` | Floating motion | 6s infinite |
| `.neon-glow-text` | Neon flicker | 3s infinite |
| `.staggered-item` | Fade + Scale | 0.6s with delay |
| `.bounce` | Bounce effect | 2s infinite |
| `.heartbeat` | Heartbeat pulse | 1.3s infinite |
| `.swing` | Swinging motion | 1s ease-in-out |
| `.wiggle` | Wiggling motion | 0.3s infinite |
| `.shake-on-hover` | Shakes on hover | 0.5s |

---

## 🔧 Data Attributes for Advanced Effects

### Counter Animation
```html
<div data-counter="50000" data-duration="2000">Loading...</div>
<!-- Auto-counts from 0 to 50000 over 2 seconds -->
```

### Ripple Effect
```html
<button data-ripple>Click for Ripple</button>
<!-- Creates click ripple animation -->
```

### Parallax Background
```html
<div data-parallax="0.5">Content</div>
<!-- Background moves at 50% scroll speed -->
```

### Text Blur
```html
<p data-text-blur>Hover to unblur this text</p>
<!-- Starts blurred, unblurs on hover -->
```

### Lazy Animation
```html
<div data-lazy-animate="fadeInScale 0.6s ease-out both">
  <!-- Animates when scrolled into view -->
</div>
```

### Reveal on Scroll
```html
<div data-reveal>Reveals on scroll</div>
<!-- Fades + slides in when in viewport -->
```

### Gradient Text
```html
<h1 data-gradient-text>Animated Gradient Text</h1>
<!-- Gradient shifts continuously -->
```

---

## 🎨 Color Palette Reference

### Primary Colors
```css
Primary Purple: #667eea
Dark Purple: #764ba2
Light Gray: #f0f0f0
Dark Gray: #1a1a1a
```

### Gradients Used
```css
/* Primary "main" gradient */
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Secondary gradient */
linear-gradient(135deg, #f093fb 0%, #f5576c 100%)

/* Success gradient */
linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)
```

---

## 🎯 Common Component Patterns

### Featured Course Card
```jsx
<Card className="course-card scroll-zoom-in">
  <div className="course-image-wrapper image-effect-zoom-on-hover">
    <img src="course.jpg" className="image-effect-grayscale-to-color" />
  </div>
  <Card.Body>
    <h5>Course Title</h5>
  </Card.Body>
</Card>
```

### Feature Card with Hover
```jsx
<Card className="feature-card scroll-fade-in glass-effect">
  <Card.Body className="p-4">
    <div className="feature-icon">📚</div>
    <h5>Feature Title</h5>
    <p>Description</p>
  </Card.Body>
</Card>
```

### Testimonial Card
```jsx
<Card className="testimonial-card scroll-slide-left glass-effect bg-white">
  <Card.Body className="p-4">
    <div className="mb-3">⭐⭐⭐⭐⭐</div>
    <p>"Review text"</p>
    <h6>Name</h6>
    <small>Role</small>
  </Card.Body>
</Card>
```

### Stat Box
```jsx
<div className="stat-box glass-effect" data-counter="50000">
  <h5 className="fw-bold">50K+</h5>
  <small>Active Learners</small>
</div>
```

### Hero Button
```jsx
<Button className="btn-primary hero-btn" data-ripple>
  Get Started Free
</Button>
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Adjustments |
|------------|------------|
| **1920px+** | Full effects enabled |
| **1024px-1920px** | All effects, optimized |
| **768px-1024px** | Reduced animation complexity |
| **320px-768px** | Mobile optimizations |

---

## 🚀 Performance Tips

### ✅ Do This
```jsx
// Use transform properties (GPU accelerated)
transform: translateY(-10px);
transform: scale(1.05);

// Use opacity for fade effects
opacity: 0.5;

// Use will-change sparingly
will-change: transform;
```

### ❌ Avoid This
```jsx
// Avoid frequent repaints
position: absolute; // Moves
width: 100%; // Changes dimensions

// Avoid expensive filters
filter: blur(10px); // Heavy computation
```

---

## 🎟️ Implementation Checklist

- [ ] Import all CSS files
- [ ] Initialize scroll animations
- [ ] Add scroll animation classes to visible elements
- [ ] Apply image effects to course thumbnails
- [ ] Use glass-effect on cards
- [ ] Test on mobile (>= 768px responsive design)
- [ ] Check accessibility (prefers-reduced-motion)
- [ ] Verify 60fps performance
- [ ] Test cross-browser compatibility

---

## 📞 Common Issues & Solutions

### Animations not showing
**Solution:** Ensure CSS files imported before component renders

### Images blur too much
**Solution:** Use `.img-blur-on-hover` instead of custom filter

### Performance lag on mobile
**Solution:** Reduce animations at breakpoint `< 768px`

### Effects too subtle
**Solution:** Increase scale/translate values in CSS

### Flickering on load
**Solution:** Add `opacity: 0` initial state

---

## 🎓 Class Combinations Examples

### Premium Image Effect
```html
<img class="img-premium-effect img-container-xl" src="hero.jpg" />
```

### Animated Card
```html
<Card class="scroll-zoom-in glass-effect" data-hover-effect="lift">
  <img class="img-grayscale-to-color" />
</Card>
```

### Interactive Stat
```html
<div class="stat-box glass-effect pulse-glow" data-counter="1000" data-duration="2000">
  <h5>1000+</h5>
  <small>Courses</small>
</div>
```

### Full Feature Section
```html
<section class="scroll-fade-in">
  <Row>
    {features.map(f => (
      <Col key={f.id} class="scroll-slide-left">
        <Card class="feature-card glass-effect">
          <img class="img-premium-effect" />
          <h5>{f.title}</h5>
        </Card>
      </Col>
    ))}
  </Row>
</section>
```

---

## 📚 File Reference

| File | Purpose | Classes/Functions |
|------|---------|------------------|
| `image-effects.css` | Image hover effects | `.img-*` |
| `landing-page.css` | Landing page styles | `.hero-*`, `.scroll-*`, `.glass-effect` |
| `home-page.css` | Home page styles | Course cards, progress cards |
| `advanced-animations.css` | Advanced effects | `.bounce`, `.heartbeat`, `.pulse-glow` |
| `scrollAnimations.js` | Scroll utilities | `initScrollAnimations()`, `animateCounter()` |
| `advancedAnimations.js` | Advanced utilities | `initRippleEffect()`, `initCounterAnimation()` |

---

## ✨ Final Tips

1. **Consistency**: Use the same animation duration across similar elements
2. **Accessibility**: Always include `prefers-reduced-motion` media query support
3. **Performance**: Test frame rate with DevTools (should stay at 60fps)
4. **Mobile**: Reduce animation count and duration on small screens
5. **Testing**: Test on real devices, not just browser DevTools

---

Created March 2026 | Version 1.0
