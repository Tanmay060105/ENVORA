# Canopy & Commons — Campus Environmental Intelligence Dashboard Design System

## Design Tokens & Spec

```yaml
name: Canopy & Commons
colors:
  surface: '#fbfbe4'
  surface-dim: '#dbdbc6'
  surface-bright: '#fbfbe4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f5df'
  surface-container: '#efefd9'
  surface-container-high: '#eae9d4'
  surface-container-highest: '#e4e4ce'
  on-surface: '#1b1d0f'
  on-surface-variant: '#45483e'
  inverse-surface: '#303223'
  inverse-on-surface: '#f2f2dc'
  outline: '#76786d'
  outline-variant: '#c6c8ba'
  surface-tint: '#55633b'
  primary: '#293613'
  on-primary: '#ffffff'
  primary-container: '#3f4d27'
  on-primary-container: '#adbe8d'
  inverse-primary: '#bccd9c'
  secondary: '#52652b'
  on-secondary: '#ffffff'
  secondary-container: '#d1e9a1'
  on-secondary-container: '#56692f'
  tertiary: '#2b3513'
  on-tertiary: '#ffffff'
  tertiary-container: '#414c27'
  on-tertiary-container: '#afbc8e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e9b6'
  primary-fixed-dim: '#bccd9c'
  on-primary-fixed: '#131f01'
  on-primary-fixed-variant: '#3d4b26'
  secondary-fixed: '#d4eba3'
  secondary-fixed-dim: '#b8cf8a'
  on-secondary-fixed: '#141f00'
  on-secondary-fixed-variant: '#3b4d16'
  tertiary-fixed: '#dbe8b7'
  tertiary-fixed-dim: '#bfcc9c'
  on-tertiary-fixed: '#151f02'
  on-tertiary-fixed-variant: '#404b26'
  background: '#fbfbe4'
  on-background: '#1b1d0f'
  surface-variant: '#e4e4ce'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-data-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.02em
  label-data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
  label-data-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
```

## Brand & Style Guidelines

This design system embodies the intersection of field ecology and deliberate academic research. It rejects sterile, high-gloss blues and neon accents ubiquitous in commercial telemetry platforms, establishing instead an atmosphere of patient observation, organic precision, and intellectual calm.

The visual direction draws from botanical lithographs, archival specimen registries, and field journals, paired with modern computational data displays. Interfaces feel like curated physical exhibits: quiet, warm ivory surfaces with structured olive accents and unhurried typography. It communicates profound environmental literacy, institutional permanence, and high-fidelity sensory intelligence.

### Base Tones
- **Primary Canvas (Soft Ivory):** `#FBF9F2` serves as the primary canvas background, softening contrast against analytical charts.
- **Card & Surface Layers (Cream):** `#F7F3E8` provides containment for metric widgets, maps, and temporal logs.
- **Structural Dividing Tone (Warm Beige):** `#E9E0CC` defines fine hair-width borders and subtle divisional boundaries.

### Editorial & Functional Accents
- **Primary Ink:** `#292D22` anchors titles, tabular entries, and critical data points without harsh contrast.
- **Secondary Reading Tone:** `#777866` supports supporting labels, timestamps, metadata keys, and secondary states.
- **Botanical Spectrum:** Primary deep canopy accents (`#3F4D27`), mid-tier vegetation accents (`#667A3E`), and delicate understory tints (`#9AA77A`).

### Telemetry Status Rules
- **Baseline / Normal:** `#667A3E` (Olive)
- **Attention / Warning:** `#C88A2E` (Muted Amber)
- **Action Required / Critical:** `#B84A39` (Muted Red)
