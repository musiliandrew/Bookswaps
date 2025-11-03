# 🎨 BookSwaps - Design System Guide

## Overview
This document outlines the professional, mobile-first design system for BookSwaps. The design system prioritizes **accessibility**, **performance**, and **user experience** across all devices.

---

## 📱 Design Philosophy

### Core Principles
1. **Mobile-First**: Design for mobile, enhance for desktop
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Performance**: Optimized for fast loading and smooth interactions
4. **Consistency**: Reusable components and patterns
5. **Simplicity**: Clean, modern, minimalist aesthetic

---

## 🎨 Color System

### Primary Colors
The primary color represents trust, professionalism, and the core brand identity.

```css
--primary-500: #456A76  /* Main primary color */
--primary-600: #375563  /* Hover state */
--primary-700: #29404a  /* Active state */
```

**Usage**: Primary actions, links, key UI elements

### Accent Colors
The accent color adds warmth and highlights important interactions.

```css
--accent-500: #D4A017  /* Main accent color */
--accent-600: #aa8012  /* Hover state */
```

**Usage**: Call-to-action buttons, highlights, badges

### Neutral Colors
Used for backgrounds, borders, and text to create hierarchy.

```css
--neutral-0: #ffffff    /* Pure white */
--neutral-50: #f9fafb   /* Lightest gray */
--neutral-100: #f3f4f6  /* Very light gray */
--neutral-500: #6b7280  /* Medium gray (text) */
--neutral-900: #111827  /* Almost black */
```

### Semantic Colors
Communicate status and feedback to users.

```css
--success-500: #10b981  /* Success states */
--warning-500: #f59e0b  /* Warning states */
--error-500: #ef4444    /* Error states */
--info-500: #3b82f6     /* Informational states */
```

---

## ✍️ Typography

### Font Families
```css
--font-primary: 'Inter'     /* Body text, UI elements */
--font-display: 'Cal Sans'  /* Headings, hero text */
--font-mono: 'SF Mono'      /* Code, technical content */
```

### Font Sizes (Mobile-First)
```css
--text-xs: 0.75rem      /* 12px - Small labels */
--text-sm: 0.875rem     /* 14px - Secondary text */
--text-base: 1rem       /* 16px - Body text */
--text-lg: 1.125rem     /* 18px - Large body */
--text-xl: 1.25rem      /* 20px - Subheadings */
--text-2xl: 1.5rem      /* 24px - Headings */
--text-3xl: 1.875rem    /* 30px - Large headings (mobile) */
--text-4xl: 2.25rem     /* 36px - Hero text (mobile) */
```

### Font Weights
```css
--font-light: 300
--font-normal: 400
--font-medium: 500      /* Recommended for buttons */
--font-semibold: 600    /* Recommended for headings */
--font-bold: 700
```

### Best Practices
- **Body Text**: Use `--text-base` with `--font-normal` (16px/400)
- **Headings**: Use `--font-semibold` or `--font-bold`
- **Buttons**: Use `--font-medium` (500)
- **Line Height**: Use `--leading-normal` (1.5) for readability

---

## 📏 Spacing System

Based on 4px increments for consistency.

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px - Base spacing */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
```

### Usage Guidelines
- **Padding**: Use `--space-4` to `--space-6` for components
- **Margins**: Use `--space-4` to `--space-8` between sections
- **Gaps**: Use `--space-2` to `--space-4` in flex/grid layouts

---

## 🔘 Border Radius

```css
--radius-sm: 0.25rem     /* 4px - Small elements */
--radius-md: 0.5rem      /* 8px - Inputs, badges */
--radius-lg: 0.75rem     /* 12px - Buttons (default) */
--radius-xl: 1rem        /* 16px - Cards */
--radius-2xl: 1.5rem     /* 24px - Modals, large cards */
--radius-full: 9999px    /* Full circle - Avatars, pills */
```

---

## 🌫️ Shadows

Subtle shadows create depth without overwhelming the design.

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1)
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25)
```

**Usage**:
- Cards: `--shadow-md`
- Hover states: `--shadow-lg`
- Modals/overlays: `--shadow-2xl`

---

## 🧩 Component Library

### Buttons

#### Variants
```html
<!-- Primary Button -->
<button class="btn btn-primary">Primary</button>

<!-- Accent Button (Gradient) -->
<button class="btn btn-accent">Get Started</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Cancel</button>

<!-- Outline Button -->
<button class="btn btn-outline">Learn More</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">Skip</button>

<!-- Danger Button -->
<button class="btn btn-danger">Delete</button>
```

#### Sizes
```html
<button class="btn btn-sm">Small</button>
<button class="btn btn-md">Medium (Default)</button>
<button class="btn btn-lg">Large</button>
```

#### Full Width
```html
<button class="btn btn-primary btn-block">Full Width</button>
```

#### Icon Buttons
```html
<button class="btn-icon btn-primary">
  <IconHeart />
</button>
```

---

### Inputs & Forms

#### Text Input
```html
<div class="form-group">
  <label class="label">Email Address</label>
  <input type="email" class="input" placeholder="you@example.com" />
  <p class="helper-text">We'll never share your email.</p>
</div>
```

#### Textarea
```html
<textarea class="input textarea" placeholder="Your message..."></textarea>
```

#### Select Dropdown
```html
<select class="input select">
  <option>Choose an option</option>
  <option>Option 1</option>
</select>
```

#### Checkbox & Radio
```html
<input type="checkbox" class="checkbox" id="agree" />
<label for="agree">I agree to the terms</label>

<input type="radio" class="radio" name="choice" id="choice1" />
<label for="choice1">Option 1</label>
```

#### Error State
```html
<div class="form-group">
  <label class="label">Username</label>
  <input type="text" class="input input-error" />
  <p class="error-text">Username is required</p>
</div>
```

---

### Cards

#### Basic Card
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here...</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

#### Book Card
```html
<div class="book-card">
  <img src="cover.jpg" alt="Book" class="book-card-image" />
  <div class="book-card-content">
    <h4 class="book-card-title">The Great Gatsby</h4>
    <p class="book-card-author">F. Scott Fitzgerald</p>
  </div>
  <div class="book-card-footer">
    <button class="btn btn-sm btn-primary">View Details</button>
  </div>
</div>
```

#### User Card
```html
<div class="user-card">
  <img src="avatar.jpg" class="user-card-avatar" alt="User" />
  <div class="user-card-info">
    <h5 class="user-card-name">Jane Doe</h5>
    <p class="user-card-username">@janedoe</p>
  </div>
  <button class="btn btn-sm btn-outline">Follow</button>
</div>
```

---

### Badges

```html
<span class="badge badge-primary">New</span>
<span class="badge badge-success">Available</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Sold Out</span>
<span class="badge badge-neutral">Neutral</span>
```

---

### Avatars

```html
<div class="avatar avatar-sm">
  <img src="avatar.jpg" class="avatar-img" alt="User" />
</div>

<div class="avatar avatar-md">
  <img src="avatar.jpg" class="avatar-img" alt="User" />
  <span class="avatar-status"></span> <!-- Online indicator -->
</div>

<div class="avatar avatar-lg">
  <img src="avatar.jpg" class="avatar-img" alt="User" />
</div>
```

---

### Navigation

#### Mobile Bottom Navigation
```html
<nav class="bottom-nav">
  <a href="/library" class="bottom-nav-item bottom-nav-item-active">
    <IconBook class="bottom-nav-icon" />
    <span class="bottom-nav-label">Library</span>
  </a>
  <a href="/socials" class="bottom-nav-item">
    <IconUsers class="bottom-nav-icon" />
    <span class="bottom-nav-label">Socials</span>
  </a>
  <a href="/profile" class="bottom-nav-item">
    <IconUser class="bottom-nav-icon" />
    <span class="bottom-nav-label">Profile</span>
  </a>
</nav>
```

#### Desktop Top Navigation
```html
<nav class="top-nav">
  <div class="flex items-center gap-4">
    <img src="logo.svg" alt="BookSwaps" />
    <h1>BookSwaps</h1>
  </div>
  <div class="flex items-center gap-6">
    <a href="/library">Library</a>
    <a href="/socials">Socials</a>
    <button class="btn btn-primary">Sign Up</button>
  </div>
</nav>
```

---

### Modals & Drawers

#### Modal (Desktop)
```html
<div class="modal-backdrop" onclick="closeModal()">
  <div class="modal" onclick="event.stopPropagation()">
    <div class="card-header">
      <h3>Modal Title</h3>
    </div>
    <div class="card-body">
      <p>Modal content...</p>
    </div>
    <div class="card-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

#### Bottom Drawer (Mobile)
```html
<div class="modal-backdrop">
  <div class="drawer">
    <div class="drawer-handle"></div>
    <div class="card-body">
      <h3>Drawer Content</h3>
      <p>Swipe down to close...</p>
    </div>
  </div>
</div>
```

---

### Loading States

#### Spinner
```html
<div class="spinner"></div>
<div class="spinner spinner-lg"></div>
```

#### Skeleton Loaders
```html
<div class="skeleton-text"></div>
<div class="skeleton-avatar"></div>
<div class="skeleton-card"></div>
```

---

## 📱 Mobile-First Best Practices

### Touch Targets
- Minimum size: 44x44px (iOS guideline)
- Use `min-width` and `min-height` on buttons

### Font Sizes
- Never use font sizes smaller than 16px on mobile
- Prevents iOS auto-zoom on input focus

### Spacing
- Use more generous padding on mobile (16-24px)
- Ensure tappable elements have enough spacing

### Navigation
- Use bottom navigation for mobile (max 5 items)
- Use top navigation for desktop

### Modals
- Use full-screen or bottom drawers on mobile
- Use centered modals on desktop

---

## ♿ Accessibility

### Focus States
All interactive elements have visible focus indicators:
```css
*:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- Use `--text-primary` on `--bg-primary` for best contrast

### Screen Readers
Use `.sr-only` class to hide elements visually while keeping them accessible:
```html
<span class="sr-only">Close modal</span>
```

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order
- Escape key closes modals

---

## 🚀 Performance

### CSS Optimization
- Use CSS variables for theming
- Minimize reflows with `will-change`
- Use `content-visibility` for long lists

### Image Optimization
- Use `.img-loading` class for placeholders
- Lazy load images below the fold
- Use appropriate formats (WebP, AVIF)

### Animation Performance
- Prefer `transform` and `opacity` for animations
- Use `will-change` sparingly
- Support `prefers-reduced-motion`

---

## 📦 File Structure

```
frontend/src/
├── styles/
│   ├── design-system.css    # Core design tokens
│   ├── components.css        # Component styles
│   └── mobile-responsive.css # (Legacy, being phased out)
├── index.css                 # Main entry point
└── App.css                   # (Legacy, being phased out)
```

---

## 🔄 Migration Guide

### From Legacy to New System

#### Buttons
**Old**: `<button className="bookish-button-enhanced">`
**New**: `<button className="btn btn-accent">`

#### Inputs
**Old**: `<input className="bookish-input" />`
**New**: `<input className="input" />`

#### Cards
**Old**: `<div className="bookish-glass">`
**New**: `<div className="card">` or `<div className="glass">`

#### Colors
**Old**: `var(--primary)` (single shade)
**New**: `var(--primary-500)` (full scale)

---

## 🎯 Quick Start Checklist

When creating a new component:
- [ ] Use mobile-first approach
- [ ] Use design system colors (`--primary-500`, etc.)
- [ ] Use spacing system (`--space-4`, etc.)
- [ ] Use component classes (`.btn`, `.card`, `.input`)
- [ ] Test on mobile (min width 320px)
- [ ] Test keyboard navigation
- [ ] Test with screen reader (if applicable)
- [ ] Verify color contrast
- [ ] Add loading/error states

---

## 📚 Resources

- **Design System**: `/frontend/src/styles/design-system.css`
- **Components**: `/frontend/src/styles/components.css`
- **Tailwind Config**: `/frontend/tailwind.config.js`

---

## 🔮 Future Enhancements

- [ ] Dark mode support
- [ ] Animation library
- [ ] Advanced data visualization components
- [ ] Accessibility testing suite
- [ ] Storybook integration

---

**Last Updated**: 2025-01-03
**Version**: 1.0.0
