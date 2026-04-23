---
name: Horological Excellence
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#cecece'
  on-tertiary: '#2f3131'
  tertiary-container: '#b2b3b3'
  on-tertiary-container: '#444546'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-display:
    fontFamily: Noto Serif
    fontSize: 64px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.15em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.02em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-edge: 64px
  section-gap: 128px
---

## Brand & Style

The design system is engineered to evoke the precision, heritage, and exclusivity of haute horlogerie. It targets a discerning clientele that values craftsmanship over trends. The brand personality is authoritative yet understated, mirroring the quiet luxury of a high-end timepiece.

The visual style is a sophisticated blend of **Minimalism** and **High-Contrast Modernism**. It utilizes expansive whitespace to allow product photography to serve as the primary visual anchor. The aesthetic relies on structural integrity, razor-sharp alignment, and a "black-tie" color palette to create an immersive, premium digital boutique experience.

## Colors

The palette is anchored in a deep, "True Black" (`#0A0A0A`) to provide a sense of infinite depth. This is complemented by "Charcoal Gray" (`#1A1A1A`) for surface layering and structural elements. 

The primary accent is "Metallic Gold" (`#D4AF37`), used sparingly for high-value interactions, iconography, and luxury call-outs. "Silver Mist" (`#E5E5E5`) acts as a secondary accent for subtle borders and secondary text, ensuring a high-contrast environment that remains legible and refined. This color mode is strictly dark to emulate a dimly lit, exclusive showroom.

## Typography

This design system utilizes **Noto Serif** for all editorial and heading elements. The serif’s high-contrast strokes and elegant terminals reflect the traditional engravings found on watch movements. 

**Inter** is employed for functional UI and body copy to provide maximum readability and a modern, technical counterpoint to the serif headlines. Large display headings should use a lighter weight with tight tracking to appear more sophisticated. All labels and metadata (such as reference numbers or material specs) should use the `label-caps` style to mimic technical documentation.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop, centered within a 1440px container to maintain a controlled, gallery-like feel. It utilizes a 12-column system with generous 24px gutters. 

Spacing is intentionally aggressive; the "section-gap" of 128px ensures that product categories and featured collections are given ample breathing room. Negative space is not just a gap but a design tool to focus the user’s eye on the watch photography. Elements should be aligned to a strict 8px baseline rhythm to maintain architectural precision.

## Elevation & Depth

Hierarchy in this design system is achieved through **Tonal Layers** and **Refined Outlines** rather than heavy shadows. 

1. **Base:** True Black (`#0A0A0A`) for the main background.
2. **Surface:** Charcoal Gray (`#1A1A1A`) for cards and hover states.
3. **Depth:** Soft, ultra-diffused shadows (`rgba(0,0,0,0.5)`) are used only for top-level floating elements like dropdown menus or modals.
4. **Accents:** 1px borders in "Silver Mist" at 10% opacity create "ghost borders" that define structure without cluttering the visual field. 

The goal is a flat, architectural depth that feels like a polished granite surface.

## Shapes

The design system employs a **Sharp** shape language (0px radius). Every element—from buttons to product cards to input fields—features crisp 90-degree angles. This choice reinforces a sense of technical precision, engineering, and masculinity. It differentiates the product from more consumer-grade, "soft" e-commerce platforms, leaning into a more bespoke, architectural aesthetic.

## Components

### Buttons
Primary buttons are solid Metallic Gold with Black text, using the `label-caps` typography. Secondary buttons are transparent with a 1px Silver border. All buttons use a sharp-edged, rectangular form.

### Input Fields & Search
The search bar is ultra-sleek: a single bottom border (1px Silver) that expands or brightens on focus. Icons are thin-stroke (1px) and minimalist, rendered in Silver or Gold.

### Cards
Product cards feature a "No Border" look on the base, with a subtle Charcoal background appearing only on hover to elevate the item. Details are aligned to the bottom-left of the image.

### Chips & Tags
Used for "Limited Edition" or "New Arrival" labels. These are small, sharp-edged boxes with high-contrast text and a 1px border; they should never have a solid background unless it is the Primary Gold.

### Navigation
The main navigation is minimalist, utilizing `label-caps` for a professional, organized look. A "sticky" header with a 5% opacity backdrop blur ensures the luxury context is never lost during scroll.
