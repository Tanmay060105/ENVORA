# 15 — Public-Facing Landing Page Specification

**Version:** 1.0  
**Status:** LOCKED SPECIFICATION FOR ANTIGRAVITY IMPLEMENTATION  
**Target:** `web/index.html` (or root `index.html`)  
**Design Reference:** Canopy & Commons Visual System  
**Relationship:** Public introduction to ENVORA (leads into the 6 application screens)

---

# 1. Page Objective

The objective of the **ENVORA Landing Page** is to serve as the public-facing editorial and narrative gateway to the Campus Environmental Intelligence System. 

It introduces campus visitors, students, faculty evaluators, and academic observers to:
- What ENVORA is and why continuous microclimate sensing matters on campus.
- The physical IoT sensing methodology (ESP32 edge architecture).
- The five monitored parameters (Temperature, Humidity, Pressure, MQ-135 Gas Response, Noise).
- The intelligence features: Live telemetry, Historical analysis, Explainable MQ-135 prediction ($y = mx + b$), Threshold alerts, and Academic reports.
- A frictionless entry point (Call-to-Action) directly into the live application workspace (`dashboard.html`).

**Crucial Distinction:**
- **Landing Page (`index.html`):** Public-facing narrative, system explanation, educational showcase, and feature previews.
- **Application Pages (`dashboard.html`, etc.):** The operational, real-time telemetry and analytical monitoring workspace.
- The Landing Page does *not* replicate the dashboard grid, nor do the application pages change their approved Stitch layouts.

---

# 2. Target Visitors & Reader Personas

1. **College Faculty & Project Evaluators:**
   - Need to quickly grasp project legitimacy, technical rigor, IoT data flow, explainable linear regression methodology, and academic relevance without getting lost in technical clutter.
2. **Campus Students & Observers:**
   - Seek immediate understanding of real campus environmental conditions, comfort metrics, and acoustic quiet zones.
3. **IoT & Web Reviewers:**
   - Interested in the clean architecture: edge microcontroller sensing, dual-cloud transmission (Blynk/ThingSpeak), and static client-side performance.

---

# 3. Information Architecture & Section Hierarchy

The Landing Page follows a structured, narrative-driven vertical flow:

```text
[Global Navigation Bar]
       ↓
[Section 1: Hero — Campus Environmental Intelligence Reimagined]
       ↓
[Section 2: The Problem — Unseen Campus Microclimates]
       ↓
[Section 3: The 5 Environmental Parameters (Sensor Spectrum)]
       ↓
[Section 4: System Architecture & Data Flow (Edge to Cloud)]
       ↓
[Section 5: Feature Previews (Interactive Specimen Showcases)]
       ├── 5.1 Live Monitoring Telemetry
       ├── 5.2 Historical Multi-Scale Trends
       ├── 5.3 Explainable MQ-135 Trend Prediction
       ├── 5.4 Environmental Alert Engine
       └── 5.5 Presentation-Ready Reports
       ↓
[Section 6: Explainable AI — How Linear Regression Prediction Works]
       ↓
[Section 7: Call to Action (Enter Live System)]
       ↓
[Global Footer — Academic Attribution & Metadata]
```

---

# 4. Navigation / Header

- **Positioning:** Sticky top navigation bar with subtle blur backdrop (`rgba(251, 249, 242, 0.85)` / `backdrop-blur-md`).
- **Borders:** 1px bottom border in Warm Beige (`#E9E0CC`).
- **Height:** 64px.
- **Brand Mark:**
  - Wordmark: **ENVORA** in `headline-sm` (Hanken Grotesk 700, `#293613`), accompanied by a delicate olive status dot (`#667A3E`).
  - Sub-tag: `CAMPUS ENVIRONMENTAL INTELLIGENCE` in `label-data-sm` (JetBrains Mono 10px, `#777866`).
- **Navigation Links (Smooth Scroll Anchor Links):**
  - Overview (`#overview`)
  - Parameters (`#parameters`)
  - Architecture (`#architecture`)
  - Features (`#features`)
  - Prediction (`#prediction-model`)
- **Primary Action (CTA):**
  - Text: **Launch Console →**
  - Style: Deep Olive fill (`#3F4D27`), Soft Ivory text (`#FBF9F2`), 4px border radius (`rounded-sm`), 13px Hanken Grotesk medium. Links directly to `dashboard.html`.

---

# 5. Hero Section

- **Atmosphere:** Archival field journal meets modern scientific computational exhibit.
- **Tagline / Badge:**
  - Text: `ACADEMIC PROTOTYPE • ESP32 + BLYNK + THINGSPEAK`
  - Style: Cream badge (`#F7F3E8`), Warm Beige border (`#E9E0CC`), Sage text (`#667A3E`), JetBrains Mono 11px uppercase.
- **Main Headline (`headline-xl`):**
  - *"Observing, Explaining, and Projecting Campus Microclimates."*
  - Font: Hanken Grotesk 600, 48px desktop / 32px mobile, Dark Ink (`#292D22`), line height 1.15.
- **Supporting Narrative (`body-lg`):**
  - *"An IoT-driven environmental monitoring platform combining physical multi-sensor acquisition, dual-cloud telemetry, and explainable linear regression forecasting into a calm, human-centric intelligence interface."*
  - Color: `#45483E`, font size 18px, max-width 680px.
- **Action Buttons:**
  - **Primary:** `Open Monitoring Dashboard` (Deep Olive `#3F4D27`, 4px radius, hover shifts to `#667A3E`).
  - **Secondary / Documentation:** `Inspect System Architecture` (Soft Ivory `#FBF9F2`, 1px border `#E9E0CC`, text `#292D22`).
- **Visual Specimen Card (Hero Preview):**
  - Floating high-fidelity card mockup featuring the **Canopy & Commons** Environmental Flow wave, real-time campus baseline readout (`24.8°C`, `61% RH`, `1013 hPa`, `469 Gas Response`, `48 dB`), and a live `NORMAL` status badge.

---

# 6. ENVORA Value Proposition (The Problem & Vision)

- **Layout:** 3-column structured exhibit grid.
- **Card 1: Microclimate Fragmentation**
  - Heading: *Unobserved Microclimates*
  - Narrative: Campus spaces experience dramatic swings in thermal load, acoustic disturbance, and ventilation response throughout lecture cycles that traditional HVAC cannot capture.
- **Card 2: Transparent Sensing**
  - Heading: *Zero Black-Box Metrics*
  - Narrative: Rejects fabricated AQI indices and uncalibrated claims. Provides raw, honest sensor metrics from verified solid-state sensors.
- **Card 3: Actionable Intelligence**
  - Heading: *Explainable Projections*
  - Narrative: Transforms raw analog voltages into mathematical trends ($y = mx + b$) so students and evaluators understand short-term environmental trajectories.

---

# 7. Sensor & Parameter Spectrum

Showcases the **strictly approved 5 parameters** across 5 archival specimen cards:

| Card | Parameter | Sensor Module | Measurement Range | Role in Campus Well-being |
|---|---|---|---|---|
| **01** | **Temperature** | BME280 | -10°C to +60°C ($\pm 0.5^\circ\text{C}$) | Thermal comfort and building envelope insulation monitoring. |
| **02** | **Humidity** | BME280 | 0% to 100% RH ($\pm 3\%$) | Indoor air dryness and respiratory comfort assessment. |
| **03** | **Atmospheric Pressure**| BME280 | 800 to 1100 hPa ($\pm 1\text{ hPa}$) | Synoptic barometric tracking and micro-weather front detection. |
| **04** | **Gas Response** | MQ-135 | 0 to 4095 ADC (Relative Index) | Real-time relative air/gas response and ventilation turnover rate. |
| **05** | **Environmental Noise** | INMP441 | 30 to 110 dB SPL | Acoustic study zone classification and disturbance tracking. |

*Explicit note on card section:* Clearly emphasizes that particulate matter sensors (PM2.5/PM10) are intentionally excluded in favor of calibrated physical solid-state parameters.

---

# 8. System Workflow (Edge to Cloud to Web)

An architectural sequence showing clean separation of concerns:

```text
Step 01: Physical Sensing
BME280 (I2C) + MQ-135 (ADC) + INMP441 (I2S) sample environment every 2 seconds.
       ↓
Step 02: Edge Processing (ESP32)
ESP32 DevKit V1 applies moving average filters, updates local LCD, and drives state LEDs.
       ↓
Step 03: Dual-Cloud Transmission
Wi-Fi publishes live telemetry to Blynk (V1..V5) and timestamped feeds to ThingSpeak.
       ↓
Step 04: Client-Side Web Intelligence
Custom web application fetches cloud feeds, computes linear regression, and renders 6 screens.
```

---

# 9. Application Feature Previews

A tabbed or sequential showcase highlighting each of the 6 application screens:

1. **Dashboard:** High-level status overview (`NORMAL / WARNING / CRITICAL`), 5 metric cards, and Environmental Flow graph.
2. **Live Monitoring:** Real-time incoming signal arriving from right edge (500–700 ms) with station online heartbeat.
3. **Historical Analysis:** Parameter switching across 24H, 7D, 30D, with dynamically computed Average, Min, Max, and Current metrics.
4. **Prediction:** Explainable linear regression ($y = mx + b$) estimating next-interval MQ-135 response with RISING / FALLING / STABLE trend.
5. **Alerts:** Configurable threshold monitoring with anti-oscillation debounce and active vs. resolved audit trails.
6. **Reports:** Presentation-ready document summarizing reporting periods, statistics, alert history, and academic conclusions.

---

# 10. Deep Dive: Explainable MQ-135 Prediction

- **Purpose:** Highlights the academic rigor of the regression engine for project evaluators.
- **Mathematical Formula Display:**
  $$\hat{y} = mx + b$$
  where $m = \frac{n\sum xy - \sum x \sum y}{n\sum x^2 - (\sum x)^2}$ and $b = \bar{y} - m\bar{x}$.
- **Trend Classification Thresholds:**
  - $m > +1.5$: **RISING** (Ambient gas response elevating)
  - $m < -1.5$: **FALLING** (Ventilation clearing / recovery)
  - $|m| \le 1.5$: **STABLE** (Equilibrium state)
- **Visual Sample:** Side-by-side comparison showing *Observed historical points*, *Regression slope*, and *Forecast point ($t_{n+1}$)* in shaded future region.

---

# 11. Call to Action (CTA) Section

- **Headline:** *"Ready to Explore Campus Environmental Conditions?"*
- **Description:** *"Access the live telemetry console, examine multi-day sensor trends, or review the predictive microclimate forecast."*
- **Primary Button:** `Launch Monitoring Console` (Deep Olive `#3F4D27`, links to `dashboard.html`).
- **Secondary Links:**
  - `View Live Telemetry` (`live-monitoring.html`)
  - `Inspect Historical Analysis` (`historical-analysis.html`)
  - `Review Prediction Engine` (`prediction.html`)

---

# 12. Footer Section

- **Design:** Warm Cream background (`#F7F3E8`), top 1px border in Warm Beige (`#E9E0CC`).
- **Brand Column:** ENVORA logo, academic prototype description, college major project context.
- **Navigation Columns:**
  - *Console Screens:* Dashboard, Live Monitoring, Historical Analysis, Prediction, Alerts, Reports.
  - *Hardware & Sensors:* BME280 Sensor, MQ-135 Gas Module, INMP441 I2S Mic, ESP32 DevKit V1.
  - *Cloud & Infrastructure:* Blynk Live Gateway, ThingSpeak Time-Series, Static Web Client.
- **Copyright & Academic Notice:**
  - *"Designed and developed for College Major Project Evaluation. Architectural Invariants locked. Canopy & Commons Design System."*

---

# 13. Visual Identity, Spacing & Motion Rules

- **Color Palette:**
  - Soft Ivory canvas: `#FBF9F2`
  - Cream surfaces: `#F7F3E8`
  - Warm Beige borders: `#E9E0CC`
  - Deep Olive brand: `#3F4D27`
  - Olive primary controls: `#667A3E`
  - Sage accents: `#9AA77A`
  - Dark Ink typography: `#292D22`
  - Muted Earth text: `#777866`
- **Typography:**
  - Headings & Prose: *Hanken Grotesk*
  - Telemetry & Technical Specs: *JetBrains Mono* with `tabular-nums`
- **Animation & Transitions:**
  - Entrance transitions: `400ms – 600ms` ease-out.
  - Button hover: `150ms – 200ms` background tint shift (`#3F4D27` → `#667A3E`).
  - Strict rule: **Zero continuous spin loops, zero distracting neon pulses, zero particle backgrounds.**

---

# 14. Responsive Behavior

- **Desktop (1024px+):** Full 12-column layout, max-width 1280px, generous 48px-64px vertical section padding.
- **Tablet (768px - 1023px):** 2-column parameter and value proposition grids, condensed sticky header.
- **Mobile (< 768px):** Single-column flow, horizontally scrollable parameter cards or stacked cards, mobile burger drawer or compact nav for header.

---

# 15. Accessibility & Semantic Standards

- WCAG AA contrast ratio maintained across all ivory/cream surfaces (`#292D22` on `#FBF9F2` provides > 12:1 contrast).
- Accessible keyboard navigation (`tabindex`, focus rings with `#3F4D27` outline).
- Proper semantic tags (`<header>`, `<main>`, `<section>`, `<article>`, `<figure>`, `<footer>`).
- Screen-reader friendly aria-labels on interactive elements.

---

# 16. Visual Acceptance Criteria for Landing Page

- [ ] **Canopy & Commons Fidelity:** 100% adherence to ivory/cream/olive palette with no blues, purples, or neon accents.
- [ ] **Parameter Strictness:** Mentions exactly the 5 approved parameters (Temp, Humidity, Pressure, Gas Response, Noise). **Zero PM2.5/PM10/AQI references.**
- [ ] **CTA Functionality:** All CTAs cleanly route to `dashboard.html` or designated sub-pages.
- [ ] **Architecture Explanation:** Accurately depicts ESP32 → Blynk / ThingSpeak → Custom Web App.
- [ ] **Linear Regression Rigor:** Clearly articulates $y = mx + b$ as sensor-response prediction, avoiding false air quality index claims.
- [ ] **Responsive Integrity:** Tested and verified across desktop, tablet, and mobile breakpoints without layout breaks or horizontal overflow.
