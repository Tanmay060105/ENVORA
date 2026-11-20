# Campus Environmental Intelligence System (ENVORA)
## 16 — Finalized UI/UX Design & Visual Reference Guide

**Source:** Final Stitch UI/UX Reference & Visual Specification  
**Status:** LOCKED VISUAL THEME & GRAPH SYSTEM FOR ANTIGRAVITY IMPLEMENTATION  
**Core Principle:** Stitch Design → Review → Antigravity Exact Implementation

---

## 1. Locked Visual Theme — Beige + Olive Green

The platform uses a warm, calm, premium environmental-intelligence identity based on **Beige + Olive Green**.

| Role | Color Name | Hex Code | Visual Application |
|---|---|---|---|
| **Primary Identity** | Deep Olive | `#3F4D27` | Brand identity, primary headings, primary CTA buttons |
| **Active Controls** | Olive | `#667A3E` | Active navigation pills, primary telemetry lines, NORMAL state |
| **Supporting Visuals** | Sage | `#9AA77A` | Forecast regression lines, secondary borders, hover accents |
| **Dividing Tone** | Warm Beige | `#E9E0CC` | Hairline card borders (1px), subtle divisional rules, accents |
| **Surfaces** | Cream | `#F7F3E8` | Card background containment, panel surfaces |
| **Root Canvas** | Soft Ivory | `#FBF9F2` | Main page background canvas |
| **Typography (Dark)** | Dark Text | `#292D22` | Primary headings, tabular sensor numbers, critical values |
| **Typography (Muted)**| Muted Text | `#777866` | Secondary labels, units, timestamps, metadata |
| **Warning State** | Muted Amber | `#C88A2E` | Purposeful warning badges and indicators |
| **Critical State** | Muted Red | `#B84A39` | Purposeful critical alert badges and indicators |

---

## 2. Locked Navigation Hierarchy

Navigation is locked to six focused primary sections:
- `01 Dashboard`
- `02 Live Monitoring`
- `03 Historical Analysis`
- `04 Prediction`
- `05 Alerts`
- `06 Reports`

*Strict Rule:* Keep navigation intentionally focused. Do not add modules or AI assistant sidebars without explicit approval.

---

## 3. Screen Design Principles

### 3.1 Dashboard — Environmental Intelligence Overview
- **Core Question:** *What is the campus environment like right now?*
- **Hero:** Large `ENVIRONMENTAL STATE` banner displaying `NORMAL`, `WARNING`, or `CRITICAL` with concise context.
- **Metadata:** Last updated timestamp and data freshness indicator (`LIVE / STALE / OFFLINE`).
- **Sensor Cards:** Metric cards with parameter name, current value, unit, trend arrow, and timestamp.
- **Centerpiece:** **Environmental Flow** visualization — smooth organic line/area in Olive (`#667A3E`) with subtle wash (`rgba(102, 122, 62, 0.08)`), minimal grid, data points hidden until hover.

### 3.2 Live Monitoring — Living Data / Telemetry
- **Core Concept:** Continuous telemetry feeling.
- **Data Arrival:** New data visually enters from the **right edge**.
- **Interpolation:** Fluid interpolation (~500–700 ms) rather than abruptly replacing the graph.
- **Hardware Telemetry:** Station presence indicates ONLINE / OFFLINE, active sensors, and last transmission.

### 3.3 Historical Analysis — Analytical Workspace
- **Core Concept:** Single analytical workspace rather than disconnected chart pages.
- **Parameter Selector:** Switches between the 5 approved parameters (Temperature, Humidity, Atmospheric Pressure, MQ-135 Gas Response, Noise).
- **Time Range Selector:** `24H`, `7D`, `30D`, `Custom`.
- **Transitions:** Smooth morph transition (~400–600 ms) when switching parameters.
- **Aggregates:** Dynamic calculation of `Average`, `Minimum`, `Maximum`, and `Current` values.

### 3.4 Prediction — AI/ML Visual Centerpiece
- **Core Concept:** Explainable trend prediction for **MQ-135 Gas Response**.
- **Readout:** Current response, predicted next response ($t_{n+1}$), and `RISING` / `FALLING` / `STABLE` badge.
- **Graph Structure:** **Observed → Regression → Forecast**:
  - *Observed:* Solid Olive line (`#3F4D27` / `#667A3E`) with historical data pips.
  - *Regression:* Thin Sage/Olive line (`#9AA77A`) fitted via $y = mx + b$.
  - *Forecast:* Dashed projected line into shaded future region with highlighted predicted point ($t_{n+1}$).
- **Educational Component:** Concise *"How the prediction works"* panel explaining the linear regression algorithm.
- **Honesty Rule:** Labeled strictly as *MQ-135 sensor-response prediction*, never uncalibrated AQI or exact gas concentration.

### 3.5 Alerts — Calm Environmental Event Workspace
- **Core Concept:** Clean chronological event log distinguishing Active and Resolved alerts.
- **Parameters:** Severity, timestamp, parameter, current reading, threshold, and status.
- **Styling:** Warning (Muted Amber) and Critical (Muted Red) remain purposeful. Avoid thick aggressive red threshold lines or flashing alarms.

### 3.6 Reports — Presentation-Ready Document
- **Core Concept:** Document-style layout suitable for academic evaluation and PDF printing (`@media print`).
- **Contents:** Reporting period, environmental summary, latest/statistical readings, historical trend graphs, alert summary, prediction overview, and academic conclusion.

---

## 4. Locked Graph System Catalog

1. **Environmental Flow (Dashboard):**
   - Premium smooth organic curve with subtle olive wash fill and minimal grid. Data points reveal on hover with 100–200 ms tooltip response.
2. **Living Data / Telemetry (Live Monitoring):**
   - Flowing real-time line entering from right edge with a highlighted current-value dot.
3. **Smooth Organic Line (Temperature & Humidity):**
   - Calm, organic sine-like curve capturing diurnal temperature and humidity cycles.
4. **Calm Time-Series (Atmospheric Pressure):**
   - Stable, high-precision barometric curve in hPa.
5. **Environmental Waveform (Noise):**
   - Preserves acoustic fluctuations and sound level peaks in dB SPL without over-smoothing.
6. **Observed → Regression → Forecast (MQ-135 Prediction):**
   - Three-part visual hierarchy: Solid observed history, thin regression fit, dashed future projection with shaded future box.
7. **Environmental Zones:**
   - Subtle horizontal threshold reference bands (Normal, Warning, Critical) providing spatial context without visual clutter.
8. **Environmental Pulse:**
   - Subtle pulse on the hero state indicator (calm for Normal, moderate for Warning, distinct for Critical). Never a distracting gaming gauge.

---

## 5. Motion & Interaction Rules

| Interaction Event | Target Timing | Purpose / Characteristic |
|---|---|---|
| **Data Entering** | `500ms – 700ms` | Smooth right-to-left interpolation of incoming telemetry |
| **Parameter Switching** | `400ms – 600ms` | Controlled morph between parameter curves |
| **Interactive Tooltip** | `100ms – 200ms` | Follows cursor smoothly without obstructing data points |
| **Prediction Projection**| `700ms – 1000ms` | Smooth draw-in of forecast line into future region |
| **Graph Entrance** | `400ms – 600ms` | Subtle upward fade on initial page render |

*Strict Motion Rule:* No continuous decorative loops or distracting animations. Motion exists solely to communicate data arrival, state changes, or user interaction.

---

## 6. The Stitch Rule & Scope Reconciliation

> **STITCH RULE:** Stitch is for visual design and prototyping. Antigravity is for the actual implementation. If Stitch mockups generate unapproved features (e.g. JARVIS assistant, campus maps, or particulate matter cards), ignore them unless explicitly approved.

### Reconciliation with Hardware Invariants:
While initial Stitch prototype screenshots illustrated generic PM curves ("Layered Atmosphere"), the approved physical hardware scope locks the system strictly to **5 solid-state parameters**:
1. Temperature (BME280)
2. Humidity (BME280)
3. Atmospheric Pressure (BME280)
4. MQ-135 Gas Response (MQ-135)
5. Environmental Noise (INMP441)

The "Layered Atmosphere" aesthetic styling is repurposed for multi-scale historical comparisons, while **zero PM sensors or AQI claims** are implemented in the production application.
