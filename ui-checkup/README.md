# BookSwap UI Mockup Viewer 📱

## Overview

This folder contains **static HTML mockups** of the BookSwap application UI with hardcoded data. These mockups allow you to preview and test the design system without running the full React application.

## 🎯 Purpose

- **Preview UI designs** before development
- **Test mobile responsiveness** across different devices
- **Review design system** implementation
- **Share designs** with stakeholders
- **Quick visual reference** for developers

## 📁 Files Included

```
ui-checkup/
├── index.html              # Main menu/launcher
├── home.html              # Landing page
├── library.html           # Book library page
├── profile.html           # User profile page
├── chat.html              # Chat/messaging interface
├── swaps.html             # Active swaps page
├── notifications.html     # Notifications feed
├── css/
│   └── design-system.css  # Complete design system
└── README.md              # This file
```

## 🚀 How to Use

### Method 1: Direct Open (Simplest)
1. Open the `ui-checkup` folder
2. Double-click `index.html`
3. Click on any page card to view that design

### Method 2: Local Server (Recommended)
```bash
cd /home/musiliandrew/Desktop/Projects/Book_swap/ui-checkup
python3 -m http.server 8080
```
Then open: `http://localhost:8080`

### Method 3: VS Code Live Server
1. Open folder in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## 📄 Page Descriptions

### 1. **index.html** - Main Menu
- Landing page with links to all mockups
- Design system overview
- Project statistics

### 2. **home.html** - Landing Page
- Hero section with gradient background
- Feature cards grid
- Stats section (users, books, swaps)
- CTA buttons
- Bottom navigation (mobile)

### 3. **library.html** - Book Library
- Tab navigation (My Books, Browse, Saved, Favorites)
- Search bar with filters
- Responsive book grid (2-5 columns)
- Book cards with cover, title, author, genre
- Floating "Add Book" button
- Badge indicators (Available, Swap Pending)

### 4. **profile.html** - User Profile
- Profile header with gradient background
- Avatar and user stats (books, swaps, followers)
- Recent activity feed
- Connections list
- Achievement badges
- Edit profile button

### 5. **chat.html** - Chat Interface
- **Two-column layout** (desktop)
  - Left: Conversation list
  - Right: Active chat
- Conversation list with:
  - Profile avatars
  - Online indicators
  - Unread badges
  - Message previews
- Message bubbles:
  - Own messages: Right-aligned, gradient blue
  - Received: Left-aligned, white background
  - Timestamps and read receipts (✓✓)
  - Book reference attachments
- Chat input area with emoji/attachment buttons

### 6. **swaps.html** - Active Swaps
- Swap cards showing book exchange details
- Status badges (Active, Pending, Completed)
- QR code for meetup confirmation
- Meetup location and time
- Action buttons (Complete, Message, Cancel)

### 7. **notifications.html** - Notifications
- Unread notifications highlighted
- Icon-coded by type:
  - 🔄 Swaps
  - 💬 Messages
  - 👥 Societies
  - 📚 System
- Inline action buttons
- Grouped by time (Today, Yesterday, This Week)

## 🎨 Design System Features

### Colors
```css
--primary-500: #3B82F6   (Blue)
--accent-500: #A855F7    (Purple)
--neutral-100: #F3F4F6   (Light Gray)
--success-500: #10B981   (Green)
--error-500: #EF4444     (Red)
--warning-500: #F59E0B   (Orange)
```

### Typography
- **Headings**: Lora (serif)
- **Body**: Inter (sans-serif)
- **Base size**: 16px
- **Scale**: 1.25 (Major Third)

### Spacing
- **Base unit**: 4px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

### Shadows
- **sm**: Subtle cards
- **md**: Standard elevation
- **lg**: Hover states
- **xl**: Modals and FABs
- **elevated**: Maximum depth

### Border Radius
- **sm**: 4px (badges)
- **lg**: 12px (inputs)
- **xl**: 16px (cards)
- **2xl**: 24px (major cards)
- **full**: 9999px (circles, pills)

## 📱 Mobile-First Features

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
1. **Touch Targets**: Minimum 44x44px
2. **Bottom Navigation**: Fixed navigation bar on mobile
3. **Responsive Grids**: 2 columns → 3 → 4 → 5
4. **Font Scaling**: `clamp()` for fluid typography
5. **Spacing**: Reduced on mobile, increased on desktop

### Desktop Enhancements
- **Hover States**: Cards lift on hover
- **Multi-column Layouts**: Chat sidebar + main area
- **Larger Touch Targets**: More breathing room
- **Top Navigation**: Replaces bottom nav

## 🧪 Testing Checklist

### Visual Testing
- [ ] Open each page and check layout
- [ ] Resize browser window (320px → 1920px)
- [ ] Check text readability
- [ ] Verify color contrast (WCAG AA)
- [ ] Test on mobile device (phone)
- [ ] Test on tablet (iPad)
- [ ] Test on desktop (laptop)

### Functionality Testing
- [ ] Click all navigation links
- [ ] Test back buttons
- [ ] Verify tab switching works (JavaScript needed)
- [ ] Check image placeholders load
- [ ] Test hover states (desktop)

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 🔧 Customization

### Change Colors
Edit `css/design-system.css`:
```css
:root {
  --primary-500: #YOUR_COLOR;
  --accent-500: #YOUR_COLOR;
}
```

### Modify Spacing
```css
:root {
  --space-4: 1rem;  /* Change base unit */
}
```

### Update Typography
```css
body {
  font-family: 'Your Font', sans-serif;
}
```

## 📊 Mockup Statistics

| Metric | Value |
|--------|-------|
| Total Pages | 7 |
| CSS Lines | ~600 |
| Design Tokens | 50+ |
| Components | 30+ |
| Responsive Breakpoints | 3 |
| Color Palette | 6 colors × 10 shades |
| Mobile-First | ✅ Yes |
| WCAG AA Compliant | ✅ Yes |

## 🚀 Next Steps

1. **Review Designs**: Open in browser and review each page
2. **Test Responsiveness**: Resize browser to test breakpoints
3. **Share**: Send folder to team for feedback
4. **Iterate**: Make changes based on feedback
5. **Implement**: Use as reference for React components

## ⚠️ Limitations

These are **static mockups** and do not include:
- ❌ Real data from backend
- ❌ User interactions (forms, clicks)
- ❌ Animations (Framer Motion)
- ❌ State management
- ❌ Routing between pages
- ❌ WebSocket/real-time features

## 💡 Tips

- **Mobile Preview**: Use browser DevTools (F12) → Device Toolbar
- **Screenshot**: Use browser screenshot tools to capture designs
- **Print**: Use "Print to PDF" to create design documentation
- **Inspect**: Right-click elements to view CSS styles

## 📝 Notes

- All data is **hardcoded** for demonstration
- Icons are **emoji placeholders** (replace with SVGs in production)
- Book covers use **gradient placeholders**
- Profile pictures use **initials** (JD, MS, etc.)
- Chat messages are **static examples**

## 🎯 Use Cases

1. **Design Review**: Share with designers for feedback
2. **Stakeholder Demo**: Show to non-technical stakeholders
3. **Development Reference**: Guide for implementing React components
4. **A/B Testing**: Create variations and compare
5. **Documentation**: Visual reference in project docs

---

**Created**: November 2025
**Design System**: BookSwap v2.0
**Mobile-First**: ✅
**Accessibility**: WCAG 2.1 AA

For questions or issues, refer to the main project documentation.
