# Campus Environmental Intelligence System (ENVORA)
## 09 — UI Component Specification

This document details the visual attributes, HTML structure, CSS classes, typography, and states for all reusable UI components.

---

## 1. Component Catalog

### 1.1 AppShell & Navigation
- **HTML Container:** `<aside class="app-sidebar">` and `<header class="app-header">`
- **Styling:** Soft Ivory background (`#FBF9F2`), Warm Beige 1px border (`#E9E0CC`).
- **Items:** 6 nav links with icons and numbered tags (`01 Dashboard` .. `06 Reports`).
- **Active State:** Deep Olive background pill (`#3F4D27`) with Soft Ivory text (`#FBF9F2`) and 4px radius (`rounded-sm`).

### 1.2 EnvironmentalState (Hero Banner)
- **Used on:** Dashboard
- **Styling:** Large typography badge (`headline-xl`, Hanken Grotesk).
- **States:**
  - `NORMAL`: Olive stroke and badge (`#667A3E`), soft cream fill (`#F7F3E8`).
  - `WARNING`: Amber stroke (`#C88A2E`), tinted pale amber fill.
  - `CRITICAL`: Muted Red stroke (`#B84A39`), tinted pale red fill.
- **Includes:** Human-readable context sentence and last updated timestamp (`label-data-sm`, JetBrains Mono).

### 1.3 MetricCard
- **Used on:** Dashboard, Live Monitoring, Reports
- **Dimensions:** Min-width 220px, 1.25rem padding, 4px border radius (`rounded-sm`).
- **Border:** 1px solid Warm Beige (`#E9E0CC`).
- **Surface:** Cream (`#F7F3E8`).
- **Typography:**
  - Header: 13px Hanken Grotesk medium, uppercase, Muted Earth (`#777866`).
  - Value: 28px JetBrains Mono bold tabular, Dark Ink (`#292D22`).
  - Unit: 14px JetBrains Mono inline, Muted Earth.
  - Subtext/Trend: 12px with mini sparkline or delta arrow.

### 1.4 TrendChart Container
- **Used on:** Dashboard, Historical Analysis, Reports
- **Height:** 360px – 420px.
- **Background:** Cream surface (`#F7F3E8`), 1px solid Warm Beige border.
- **Chart Style:** Chart.js canvas with custom *Canopy & Commons* theme:
  - Line Color: Olive (`#667A3E`), width 2px.
  - Fill: Subtle olive gradient (`rgba(102, 122, 62, 0.08)` to transparent).
  - Gridlines: Very faint warm beige (`#E9E0CC` at 50% opacity).
  - Tooltip: Pure White card (`#FFFFFF`), 1px border (`#E9E0CC`), soft shadow.

### 1.5 PredictionCard & ForecastChart
- **Used on:** Prediction screen
- **Visual Distinction:**
  - Historical Points: Solid Olive curve (`#667A3E`).
  - Regression Fit: Thin Sage trendline (`#9AA77A`).
  - Forecast Point ($t+1$): Highlighted amber/olive pip with dashed projected continuation.
  - Shaded Future Region: Light cream backdrop indicating predicted territory.

### 1.6 StatusBadge
- **Border:** 1px solid matching severity color.
- **Radius:** 4px (no pill shapes).
- **Padding:** 2px 8px.
- **Typography:** 11px JetBrains Mono uppercase bold.
