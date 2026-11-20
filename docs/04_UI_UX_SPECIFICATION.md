# Campus Environmental Intelligence System (ENVORA)
## 04 — UI/UX Design & Implementation Specification

**Version:** 1.0  
**Visual Reference:** Approved Stitch Screens  
**Design System Name:** Canopy & Commons  
**Implementation Target:** HTML5, Modern CSS, Vanilla JavaScript

---

## 1. Palette & Design Tokens

| Token Name | Hex Code | Usage |
|---|---|---|
| **Deep Olive** | `#3F4D27` | Brand primary, hero titles, main active buttons |
| **Olive** | `#667A3E` | Active nav, primary telemetry lines, NORMAL state |
| **Sage** | `#9AA77A` | Regression trendlines, secondary borders, hover accents |
| **Warm Beige** | `#E9E0CC` | Hairline borders (1px solid), metric card outlines |
| **Cream** | `#F7F3E8` | Card and panel containment surfaces |
| **Soft Ivory** | `#FBF9F2` | Root page canvas background |
| **Dark Ink** | `#292D22` | Primary headings, tabular sensor numbers |
| **Muted Earth** | `#777866` | Secondary labels, units, timestamps |
| **Warning Amber** | `#C88A2E` | Muted warning state badges and indicators |
| **Critical Red** | `#B84A39` | Muted critical alarm state badges and indicators |

---

## 2. Typography Rules
- **Narrative & Titles:** *Hanken Grotesk* (or fallback to clean humanist sans-serif).
- **Telemetry & Numbers:** *JetBrains Mono* with tabular figures enabled (`font-variant-numeric: tabular-nums`).

---

## 3. Motion & Animation Timings
- Live data entrance (from right): `500ms – 700ms`
- Parameter / Time-range switcher transition: `400ms – 600ms`
- Prediction projection reveal: `700ms – 1000ms`
- Interactive hover tooltips: `100ms – 200ms`

---

## 4. Navigation & Layout
The platform comprises a public-facing Landing Page plus six dedicated primary application destinations:
- `Landing Page (index.html)` — Public introduction, educational overview, architecture walkthrough, and Launch CTA.
- `01 Dashboard (dashboard.html)` — Main operational environmental overview.
- `02 Live Monitoring (live-monitoring.html)` — Real-time telemetry stream and station heartbeat.
- `03 Historical Analysis (historical-analysis.html)` — Multi-scale trend charts and statistics.
- `04 Prediction (prediction.html)` — MQ-135 linear regression forecasting engine.
- `05 Alerts (alerts.html)` — Threshold events, active alarms, and historical audit logs.
- `06 Reports (reports.html)` — Presentation-ready academic environmental summaries.
Desktop-first with persistent sidebar/top header, fluid card flow, and responsive collapse on mobile.
