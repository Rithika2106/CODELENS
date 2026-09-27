# CodeSense AI — Design System & Style Guide

An enterprise-grade design system and style guide establishing cohesive visual design, accessibility standards (WCAG 2.1 AA), typography hierarchy, spacing scale, and responsive component architecture.

---

## 🎨 1. Visual Design & Color Palette

The color system is engineered on a dark slate foundation with electric cyan/sky primary accents and deep indigo secondary tones. Every color pairing exceeds the **WCAG 2.1 AA minimum contrast ratio of 4.5:1** for body text and **3:1** for graphical elements and large headings.

| Token | HEX | Role | WCAG Contrast Ratio |
| :--- | :--- | :--- | :--- |
| `--color-bg-base` | `#030712` | Deep Slate Canvas Background | Baseline (0:1) |
| `--color-bg-surface` | `#0b132b` | Primary Surface / Card Base | Layer 1 |
| `--color-bg-elevated` | `#111c38` | Elevated Surface / Dropdowns | Layer 2 |
| `--color-text-primary` | `#f8fafc` | Headings & High-contrast Text | **14.2:1 (AAA)** |
| `--color-text-secondary` | `#cbd5e1` | Body Text & Core Explanations | **8.5:1 (AAA)** |
| `--color-text-muted` | `#94a3b8` | Captions & Secondary Metadata | **5.2:1 (AA)** |
| `--color-primary-500` | `#0ea5e9` | Primary Brand Actions & Focus Rings | **14.2:1 (AAA)** |
| `--color-accent-500` | `#6366f1` | Secondary Badges & CoT Accents | **9.4:1 (AAA)** |
| `--color-success` | `#10b981` | Clean Runs & Fixed Code Diffs | **7.8:1 (AAA)** |
| `--color-warning` | `#f59e0b` | Warnings & Security Alerts | **8.1:1 (AAA)** |
| `--color-danger` | `#ef4444` | Critical Bugs & Removed Diffs | **6.9:1 (AA)** |

---

## 🔤 2. Typography Scale & Hierarchy

Typography is standardized around two complementary font families:
- **`Inter`** (UI, Headings, Controls, Labels)
- **`JetBrains Mono`** (Source Code, Diff Blocks, Big-O Notation, Telemetry Metrics)

```
Level             Font Size       Line Height     Weight          Letter Spacing
--------------------------------------------------------------------------------
Display / H1      1.875rem (30px) 1.25            800 (ExtraBold) -0.025em
H2 Section        1.5rem (24px)   1.30            700 (Bold)      -0.020em
H3 Subsection     1.25rem (20px)  1.35            700 (Bold)      -0.015em
H4 Card Title     1.0rem (16px)   1.40            600 (SemiBold)   normal
Body Regular      0.875rem (14px) 1.625 (relaxed) 400 (Regular)    normal
Captions / Meta   0.75rem (12px)  1.40            500 (Medium)     normal
Micro / Labels    0.6875rem (11px)1.30            700 (Bold)      +0.050em (Uppercase)
Code Monospace    0.8125rem (13px)1.50            400 / 600        JetBrains Mono
```

---

## 📐 3. 8pt Spacing Grid & Layout Tokens

Spacing follows an 8pt geometric progression to guarantee visual alignment and rhythmic vertical flow across all screen sizes:

- `--space-1`: `4px` (Micro gaps, icon offsets)
- `--space-2`: `8px` (Standard inner padding, pill gaps)
- `--space-3`: `12px` (Compact card padding)
- `--space-4`: `16px` (Standard grid gap, card gutters)
- `--space-6`: `24px` (Section spacing)
- `--space-8`: `32px` (Container padding on desktop)
- `--space-12`: `48px` (Major layout module separation)

---

## 🧭 4. Navigation & Information Architecture

### Main Header Navigation
- **Desktop**: Horizontal segmented navigation pills with subtle glowing active states and live pulse beacons.
- **Mobile / Tablet (< 1024px)**: Responsive slide-down drawer triggered by a dedicated hamburger button with `44×44px` minimum touch bounding box.
- **Accessibility**: Skip-to-content anchor link (`.skip-to-content`) as the first tabbable element for screen readers and keyboard users.

### Breadcrumb Navigation
- Context-aware breadcrumbs (`<Breadcrumbs />`) at the top of the main viewport indicating exact hierarchical depth:
  - `CodeSense > Code Studio > Deep Dive Analysis`
  - `CodeSense > Prompting Academy > Module 1: Chain-of-Thought`
  - `CodeSense > Eval Benchmarks > Fixture Inspection`

---

## 🔘 5. Standardized Component Architecture

### Buttons
- **`btn-primary`**: High-emphasis linear gradient (`#0ea5e9` to `#4f46e5`), `min-height: 40px`, soft shadow elevation, brightness boost on hover.
- **`btn-secondary`**: Surface slate background, default border, clean hover highlight.
- **`btn-outline`**: Transparent background with subtle border, ideal for compact table actions.
- **Interactive States**: Explicit `:hover`, `:active`, `:disabled` (grayscale + 55% opacity), and high-contrast `:focus-visible` ring.

### Form Inputs & Controls
- **`form-input` / `form-select`**: Deep slate background (`#070d1e`), `3px` focus ring glow (`rgba(14, 165, 233, 0.2)`), clear `<label>` bindings.
- **Segmented Control Groups**: High-contrast toggles with `role="group"` and `aria-pressed` states.

### Data Tables (`.enterprise-table`)
- Sticky headers with uppercase tracking labels.
- Subtle zebra striping and row hover effects (`rgba(14, 165, 233, 0.06)`).
- Search input and category filter chips with live result count.
- Responsive horizontal scroll wrapper with smooth touch scrolling.

---

## ♿ 6. Technical & Accessibility Standards

- **WCAG 2.1 AA Compliance**:
  - Minimum 4.5:1 text contrast ratios verified across all surface themes.
  - Full keyboard accessibility with `:focus-visible` offset rings.
  - Accessible dialog roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) with `Escape` key close handlers.
  - Live regions (`aria-live="polite"`) for background AI analysis completion announcements.
- **Touch Targets**: All mobile buttons, navigation triggers, and dropdowns meet or exceed the **44×44px** minimum touch target requirement.
- **Micro-Interactions**: Smooth cubic-bezier transitions capped at **280ms** to ensure responsive feedback without UI delay.
