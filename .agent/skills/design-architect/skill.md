# ANTIGRAVITY/UX Skill — UI/UX Design Excellence for Agents

## Overview

This skill enables agents to create beautiful, consistent, and user-centered interfaces following industry-leading design principles. From microscopic interactions to full-page compositions, agents will understand how to build elegant, accessible, and cohesive user experiences.

**Version:** 1.0
**Last Updated:** February 2026

---

## The ANTIGRAVITY Philosophy

> _"Design is not just what it looks like and feels like. Design is how it works."_ — Steve Jobs

ANTIGRAVITY represents the pursuit of effortless, intuitive interfaces — designs so natural they feel weightless. The "anti-gravity" metaphor signifies creating experiences that transcend friction, making complex tasks feel simple and delightful.

---

## Section 1: Design Philosophy & Principles

### 1.1 Dieter Rams' 10 Principles of Good Design

The foundation of modern UI/UX. Apply these to every component:

1. **Good design is innovative** — Always seek new solutions that technology makes possible
2. **Good design makes a product useful** — Omit anything that detracts from usefulness
3. **Good design is aesthetic** — Beauty enhances usefulness
4. **Good design makes a product understandable** — At best, self-explanatory
5. **Good design is unobtrusive** — Design should never be pompous or boring
6. **Good design is honest** — Never fake or manipulate
7. **Good design is long-lasting** — Avoid fashionable; aim for timeless
8. **Good design is thorough** — Care down to the last detail
9. **Good design is environmentally friendly** — Conserves resources
10. **Good design is as little design as possible** — **Concentration on essential aspects**

> _"Less, but better."_ — Dieter Rams

---

### 1.2 Apple Human Interface Guidelines (HIG) — Core Tenets

**Clarity:**
- Text is legible at every size
- Icons are precise and lucid
- Decorative elements are subtle
- Adequate negative space exists

**Deference:**
- Content fills the screen
- Non-essential UI recedes
- Translucency and blur add depth
- Colors come from the content

**Depth:**
- Visual layers hint at hierarchy
- Motion provides meaning
- Touchability feels natural
- Immersion feels inevitable

---

### 1.3 "Less, But Better" Philosophy

**Jonathan Ive (Jony) & Apple Design Philosophy:**

- **Remove until nothing can be taken away** — Not until nothing can be added
- **True simplicity** is more than minimalism — it's about understanding complexity
- **Invisible design**: Best design is invisible, the user forgets they're using technology
- **Material honesty**: Use materials and patterns authentically
- **One-handed thinking**: Apple often designs for one-handed use
- **Touch first**: Design for touch, then adapt for other input methods

---

## Section 2: Visual Hierarchy & Layout

### 2.1 The F-Pattern & Z-Pattern

**F-Pattern** (reading-heavy content):
- Users scan in F-shape after initial attention
- Top-left to right (horizontal)
- Down slightly, then left to right (horizontal)
- Down the left side (vertical)

**Z-Pattern** (visual-heavy content):
- Top-left → Top-right → Diagonal → Bottom-left → Bottom-right
- Natural eye movement for landing pages
- Storytelling flow

---

### 2.2 Grid Systems & The Golden Ratio

**Golden Ratio: 1:1.618**

Use this proportion for:
- Layout divisions (e.g., 593px + 367px = 960px container)
- Card sizes in relation to each other
- Typography scale (see Section 4)
- Spacing systems

**8-Point Grid System:**

| Token | Value | Use Case |
|-------|-------|----------|
| `xs` | 4px | Tight gaps, micro-spacing |
| `sm` | 8px | Default spacing, component gaps |
| `md` | 16px | Section padding, component margins |
| `lg` | 24px | Larger section padding |
| `xl` | 32px | Major section dividers |
| `2xl` | 48px | Page-level spacing |
| `3xl` | 64px | Major layout breaks |

**Grid Best Practices:**
- Max content width: 1200px (center aligned)
- 12-column grid for complex layouts
- 60–80px horizontal padding on desktop
- 20–40px on mobile

---

## Section 3: Atomic Design Methodology

**Structure:** `Atoms → Molecules → Organisms → Templates → Pages`

### 3.1 Atoms (Foundation)

**Smallest indivisible UI units:**
- Colors, fonts, spacing tokens
- Buttons (base state)
- Text inputs
- Icons
- Avatar placeholders

**CSS/Tailwind Implementation:**
```css
/* Design Tokens */
--color-primary: #007AFF;       /* iOS Blue */
--color-background: #FFFFFF;
--color-text-primary: #000000;
--color-text-secondary: #8E8E93;
--font-family: -apple-system, BlinkMacSystemFont, sans-serif;
--spacing-base: 8px;
--border-radius-sm: 8px;
--border-radius-md: 12px;
--border-radius-lg: 16px;
--border-radius-xl: 24px;
```

---

### 3.2 Molecules (Combinations)

**Simple groups of atoms:**
- Search bar (input + icon + button atoms)
- Card with image + text
- Form field (label + input + error message)
- Navigation link (icon + text)

**Example: Search Molecule**
```jsx
<div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
  <SearchIcon className="w-5 h-5 text-gray-500" />
  <input
    className="ml-3 bg-transparent outline-none flex-1"
    placeholder="Search..."
  />
</div>
```

---

### 3.3 Organisms (Complex Components)

**Distinct interfaces formed from molecules:**
- Navigation bars (logo + menu items + search + user action)
- Product cards (image + title + price + rating + CTA)
- Hero sections (headline + subtext + image + buttons)
- Footer (multiple link columns + newsletter + socials)

---

### 3.4 Templates (Layouts)

**Content-free layouts at organism level:**
- Homepage template
- Product detail template
- Settings template
- Checkout flow template

---

### 3.5 Pages (Instances)

**Templates with real content:**
- Specific user profile pages
- Shopping cart with real items
- Dashboard with user data

---

## Section 4: Typography

### 4.1 Type Scale (Golden Ratio)

Start with base: **16px (1rem)**

| Size | Scale | Font Size | Line Height | Weight | Use Case |
|------|-------|-----------|-------------|--------|----------|
| Hero | 3.5× | 56px | 1.1 | 700 | Hero headlines |
| H1 | 2.5× | 40px | 1.2 | 700 | Page titles |
| H2 | 2× | 32px | 1.25 | 600 | Section headers |
| H3 | 1.5× | 24px | 1.3 | 600 | Subsections |
| H4 | 1.25× | 20px | 1.4 | 600 | Card titles |
| Body | 1× | 16px | 1.6 | 400 | Body text |
| Small | 0.875× | 14px | 1.5 | 400 | Labels, captions |
| Tiny | 0.75× | 12px | 1.4 | 400 | Metadata, badges |

**Activity (Tabular):**
|   | Font Size | Line Height | Weight | Use Case |
|---|-----------|-------------|--------|----------|
| Hero | 56px | 1.1 | 700 | Hero headlines |
| H1 | 40px | 1.2 | 700 | Page titles |
| H2 | 32px | 1.25 | 600 | Section headers |
| H3 | 24px | 1.3 | 600 | Subsections |
| H4 | 20px | 1.4 | 600 | Card titles |
| Body | 16px | 1.6 | 400 | Body text |
| Small | 14px | 1.5 | 400 | Labels, captions |
| Tiny | 12px | 1.4 | 400 | Metadata, badges |

---

### 4.2 Font Stack (Apple-Style)

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
```

**For Monospace (Code):**
```css
font-family: "SF Mono", Monaco, "Inconsolata", "Ubuntu Mono", monospace;
```

---

### 4.3 Typography Rules

1. **Max line length:** 75 characters (50–75 optimal)
2. **Minimum line height:** 1.5× font size for body text
3. **Letter spacing:** Tighter for headlines, wider for all-caps
4. **Contrast ratio:** Minimum 4.5:1 for body text (WCAG AA)
5. **Never stretch type:** Always use appropriate font weight

---

## Section 5: Color Theory

### 5.1 Color Harmony Schemes

**Monochromatic:**
- One hue, varying saturation/lightness
- Safe, cohesive, elegant
- Good for minimalist apps

**Analogous:**
- Colors adjacent on color wheel (e.g., blue → blue-violet → violet)
- Harmonious, pleasing to the eye
- Good for nature/organic themes

**Complementary:**
- Opposite colors on wheel (e.g., blue ↔ orange)
- High contrast, vibrant, energetic
- Use for CTAs, alerts, emphasis

**Triadic:**
- Triangle formation on wheel (3 colors evenly spaced)
- Balanced and vibrant
- Requires one dominant + two accent colors

**Split-Complementary:**
- One base + two adjacent to its complement
- High contrast with less tension
- Good balance of harmony and contrast

---

### 5.2 Color Roles in UI

| Role | Purpose | Example | Usage |
|------|---------|---------|-------|
| **Primary** | Main brand color, key actions | Blue #007AFF | Buttons, links, active states |
| **Secondary** | Supporting actions, differentiation | Purple #5856D6 | Alternative actions |
| **Success** | Positive feedback, completion | Green #34C759 | Success messages, confirms |
| **Warning** | Caution, attention needed | Yellow/orange #FF9500 | Alerts, important notices |
| **Error** | Errors, failures, critical | Red #FF3B30 | Error messages, destructive |
| **Info** | Neutral information | Blue-tinted | Tooltips, info banners |

---

### 5.3 The 60-30-10 Rule

Distribute colors proportionally for visual balance:

- **60%** — Dominant (backgrounds, large areas)
- **30%** — Secondary (sections, cards, navigation)
- **10%** — Accent (CTAs, highlights, interactive elements)

**Example:**
- 60% White/light gray backgrounds
- 30% Dark text and UI elements
- 10% Brand accent color for buttons/links

---

### 5.4 Dark Mode Colors

**Light Mode → Dark Mode Mapping:**

| Light | Dark | Reason |
|-------|------|--------|
| #FFFFFF | #121212 | Pure white → near black |
| #F5F5F5 | #1E1E1E | Light gray → dark charcoal |
| #E0E0E0 | #2D2D2D | Borders → slightly lighter |
| #333333 | #E0E0E0 | Dark text → light text |
| Primary | Lighten 10-15% | Brand colors need adjustment |

**Dark Mode Best Practices:**
- Don't use pure black (#000000) — causes eye strain
- Desaturate colors — pure colors vibrate on dark
- Increase contrast slightly (accessibility)
- Use "elevation" through lighter grays, not shadows

---

## Section 6: Glassmorphism & Frosted Glass

### 6.1 Principles

**The Effect:** Semi-transparent surfaces with backdrop blur creating "frosted glass" appearance

**Key Characteristics:**
1. **Transparency** — Background shows through
2. **Backdrop blur** — Lowers opacity of background
3. **Subtle border** — 1px semi-transparent edge
4. **Depth through layer** — Creates hierarchy
5. **Vibrant backgrounds** — Works best with colorful backgrounds

**Inspiration:** macOS Big Sur, iOS Control Center, Microsoft Fluent Design

---

### 6.2 CSS/Tailwind Implementation

**Basic Glass Card:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}
```

**Tailwind Classes:**
```jsx
<div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl shadow-lg">
```

**Variants:**

| Effect | Opacity | Blur | Border | Use Case |
|--------|---------|------|--------|----------|
| **Subtle** | 0.15 | blur-sm | 0.1 | Navigation bars |
| **Standard** | 0.25 | blur-md | 0.18 | Cards |
| **Heavy** | 0.35 | blur-lg | 0.25 | Modals |
| **Crystal** | 0.5 | blur-xl | 0.3 | Overlays |

---

### 6.3 Glassmorphism Best Practices

**DO:**
- Use on vibrant/colored backgrounds
- Keep content legible (opacity affects contrast)
- Stack glass layers with decreasing opacity
- Combine with subtle shadows for depth
- Use round corners (12px+)

**DON'T:**
- Use on white/light backgrounds (defeats the effect)
- Over-blur (content becomes illegible)
- Stack too many layers
- Use purely decorative (must enhance usability)

---

## Section 7: Motion & Animation

### 7.1 The 12 Principles of UX Animation

Based on Disney's animation principles adapted for UI:

1. **Timing** — Speed communicates meaning (150–300ms for UI actions)
2. **Easing** — Natural acceleration/deceleration
3. **Staging** — Draw attention to important elements
4. **Follow-through** — Elements continue after main action
5. **Anticipation** — Prepare user for upcoming action
6. **Exaggeration** — Emphasize through slight exaggeration
7. **Squash & stretch** — Appropriate for playful UIs; subtle for professional
8. **Secondary action** — Supporting animations
9. **Appeal** — Make it pleasant and memorable
10. **Solid drawing** — Maintain consistency
11. **Straight ahead vs pose-to-pose** — Use sparingly in UI
12. **Arcs** — Natural movement paths

---

### 7.2 Easing Curves

| Type | CSS | Use Case | Feel |
|------|-----|----------|------|
| **Linear** | `linear` | Continuous motion | Robotic, constant |
| **Ease** | `ease` | Default | Natural |
| **Ease-in** | `ease-in` | Exiting elements | Accelerates out |
| **Ease-out** | `ease-out` | Entering elements | Decelerates in |
| **Ease-in-out** | `ease-in-out` | Both directions | Smooth both ways |
| **Spring** | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Bouncy interactions | Playful, energetic |

**Recommended for UI:**
- **Input:** 200ms ease-out (snappy feel)
- **Modal/Card:** 300ms ease-out
- **Page transition:** 400ms ease-in-out
- **Micro-interaction:** 150ms ease

---

### 7.3 Micro-Interactions

**Definition:** Small, functional animations that communicate state changes

**Common Patterns:**

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| **Button press** | Scale 0.95 + color shift | 100ms |
| **Loading** | Spinner or skeleton | Continuous |
| **Success** | Checkmark draws + fade green | 300ms |
| **Error** | Shake + red flash | 300ms |
| **Toggle** | Slide with bounce | 200ms |
| **Hover** | Lift + shadow increase | 150ms |

---

## Section 8: Accessibility (WCAG 2.2)

### 8.1 Contrast Ratios

**Minimum Requirements:**

| Level | Normal Text | Large Text (18pt+) | UI Components |
|-------|-------------|------------------- |---------------|
| **AA** | 4.5:1 | 3:1 | 3:1 |
| **AAA** | 7:1 | 4.5:1 | 3:1 |

**Tools to check:**
- WebAIM Contrast Checker
- Figma plugins (Stark, Contrast)
- DevTools accessibility panel

---

### 8.2 Color Blindness Considerations

**Never rely on color alone:**
- Use icons + color (✓ icon + green)
- Use text + color ("Success" + green)
- Use patterns + color for charts

**Problematic combinations:**
- Red/green (most common deficiency)
- Green/blue
- Light green/yellow

**Safe alternatives:**
- Blue/orange
- Blue/brown
- Purple/yellow

---

### 8.3 Focus States

**Keyboard navigation requires visible focus:**
```css
/* Focus indicator */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default only if replacing */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

### 8.4 Minimum Touch Targets

**Mobile accessibility:**
- Minimum size: **44×44px** (Apple HIG)
- Minimum spacing: **8px** between targets
- Optimal: **48×48px** (Material Design)

---

## Section 9: Component Patterns

### 9.1 Button System

**Hierarchy:**
| Type | Style | Use |
|------|-------|-----|
| **Primary** | Filled, brand color | Main CTAs |
| **Secondary** | Outlined | Alternative actions |
| **Tertiary** | Text only | Low-priority |
| **Ghost** | Transparent + border | On colored backgrounds |
| **Destructive** | Red/alert color | Delete, remove |

**States:**
- Default → Hover → Active → Disabled → Loading

---

### 9.2 Form Patterns

**Input Field Anatomy:**
```
[Label]                    ← Top-aligned (better UX than inline)
[Input field with placeholder] ← Border or filled style
[Helper text / Error message]    ← 12px gray or red
```

**Best Practices:**
- Top-aligned labels (fastest scanning)
- Placeholder ≠ label (accessibility)
- Clear error states (red + icon + text)
- Password: toggle visibility
- Required fields: marked with *

---

### 9.3 Card Patterns

**Standard Card:**
```jsx
<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
  {/* Image */}
  {/* Title + Subtitle */}
  {/* Content */}
  {/* Actions */}
</div>
```

**Card Hierarchy:**
1. **Image** — Full-width, 16:9 or 4:3 ratio
2. **Header** — Title (bold) + Subtitle (muted)
3. **Body** — Truncated content
4. **Footer** — Actions, timestamps, metadata

**Spacing:** 16–24px padding

---

### 9.4 Hero Sections

**Hero Design Rules:**
- Let typography and white space breathe.
- **Do NOT use "pills" or "badges"** (e.g. `inline-flex items-center rounded-full bg-blue-50 text-blue-600`) at the top of hero sections. They clutter the visual hierarchy and detract from the primary "Less, but better" aesthetic.
- Rely on high-contrast headings and sub-headings to establish context instead of relying on metadata tags in the hero.

---

## Section 10: Practical Implementation Guide

### 10.1 When Creating New Components

**Step-by-Step:**
1. **Identify atomic structure** — What atoms are needed?
2. **Check existing system** — Don't reinvent
3. **Design all states** — Default, hover, active, disabled, error
4. **Test accessibility** — Contrast, keyboard, screen reader
5. **Document usage** — Where and when to use
6. **Create variants** — Sizes, styles, themes

---

### 10.2 Component Checklist

Before declaring a component complete:

- [ ] All states designed (default, hover, active, focus, disabled)
- [ ] Responsive behavior defined
- [ ] Accessibility verified (WCAG 2.1 AA minimum)
- [ ] Dark mode support added
- [ ] Micro-interactions specified
- [ ] Usage documentation written
- [ ] Figma component created with variants
- [ ] Code component implemented (React, Vue, etc.)
- [ ] Tests written

---

### 10.3 Extending Existing Design

**How to add new components that match:**
1. **Study existing patterns** — Spacing, colors, typography
2. **Follow atomic hierarchy** — Atoms → Molecules → Organisms
3. **Maintain 8-point grid** — Align to existing spacing
4. **Use design tokens** — Reference variables, not hard values
5. **Get spacing 80% right** — Most problems are spacing issues
6. **Ask:** Would Jony Ive approve this?

---

## Section 11: Q&A Patterns

### Q: How do I choose colors for a new project?
**A:**
1. Start with primary brand color
2. Create monochromatic scale (tints/shades)
3. Add neutral grays for text/UI
4. Choose semantic colors (success, warning, error)
5. Apply 60-30-10 rule
6. Test accessibility compliance

### Q: When should I use glassmorphism?
**A:**
- Background images/videos are present
- Creating depth layers
- Navigation bars on scroll
- Modal overlays
- *Not* on plain white backgrounds

### Q: What's the most important design principle?
**A:** Timeliness for context, but "Less, but better" covers 80% of decisions. Remove anything that doesn't serve the user.

### Q: How do I know if my typography is good?
**A:**
- Line length 50–75 characters
- Line height 1.5× for body
- Enough contrast (4.5:1 minimum)
- Consistent scale
- Readable at actual size on screen

### Q: Mobile-first or desktop-first?
**A:** Design mobile-first, then expand. Constraints breed creativity. Touch targets → hover interactions.

---

## Quick Reference Tables

### Tailwind Glass Classes
```
backdrop-blur-sm    (4px)
backdrop-blur-md    (12px)
backdrop-blur-lg    (16px)
backdrop-blur-xl    (24px)
backdrop-blur-2xl   (40px)
backdrop-blur-3xl   (64px)

bg-white/10  → 10% opacity
bg-white/20  → 20% opacity
bg-white/30  → 30% opacity
bg-white/50  → 50% opacity

border-white/10  → subtle border
border-white/20  → visible border
```

### Animation Timing
```
fast:     150ms
normal:   200ms
smooth:   300ms
slow:     500ms
```

---

## Conclusion

**The ANTIGRAVITY/UX skill is about:**
- Creating seemingly effortless experiences
- Following tested principles, not trends
- Components that compose logically
- Accessibility as foundation, not afterthought
- Motion that communicates meaning
- "Less, but better" in every decision

**Remember:**
> _"You have to be burned out by something in order to create simplicity."_ — Jony Ive

Good design takes effort but feels inevitable. The user should never notice how hard you worked to make something feel simple.

---

## Resources

**Learn More:**
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [Material Design 3](https://m3.material.io/)
- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [Refactoring UI](https://refactoringui.com/)
- [Don't Make Me Think (Steve Krug)](https://sensible.com/dmmt.html)

**Tools:**
- Figma — Design system creation
- Tailwind CSS — Utility-first styling
- Framer Motion — React animations
- Google Fonts — Typography
- Coolors.co — Palette generation
- WebAIM Contrast Checker — Accessibility

---

*Built with ANTIGRAVITY principles — Design that defies friction.*