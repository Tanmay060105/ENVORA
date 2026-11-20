# 06 — Operational Implementation Plan

This document breaks down the development roadmap into atomic, testable engineering tasks.

---

## PHASE 0: Project Setup & Baseline

### Task 0.1: Workspace Structure
- **Objective:** Create standardized directory structure (`firmware/`, `web/`, `docs/`, `hardware/`).
- **Inputs:** Development Plan specifications.
- **Files Affected:** File tree creation.
- **Verification:** Directory existence and permissions check.
- **DoD:** Clean tree with no lingering clutter.

### Task 0.2: Documentation Suite
- **Objective:** Establish documents `01_` to `14_` and `AGENTS.md`.
- **Inputs:** Approved PRD, SRS, Architecture, UI/UX specs.
- **Files Affected:** `docs/*.md`, `AGENTS.md`, `PROJECT_STATE.md`.
- **Verification:** Verify markdown links and completeness.
- **DoD:** All 14 docs and agent governance files checked in.

### Task 0.3: Design Token & Asset Setup
- **Objective:** Create `web/css/tokens.css` with exact *Canopy & Commons* CSS variables.
- **Inputs:** `04_UI_UX_SPECIFICATION.md`.
- **Files Affected:** `web/css/tokens.css`.
- **Verification:** Test CSS token imports in browser.
- **DoD:** All colors, font families, spacings, and borders defined as variables.

---

## PHASE 1: Hardware & Firmware Foundation

### Task 1.1: Sensor Hardware Wiring Specification
- **Objective:** Document exact pinout schematic and connection checklist for BME280, MQ-135, INMP441, LCD, LEDs, Buzzer.
- **Files Affected:** `hardware/WIRING.md`.
- **DoD:** Clear wiring diagram with resistor values and power rails.

### Task 1.2: Arduino Firmware Core (`firmware.ino`)
- **Objective:** Implement modular Arduino C++ firmware for ESP32.
- **Inputs:** Adafruit BME280 library, I2S driver for INMP441, ADC calibration for MQ-135, LiquidCrystal_I2C.
- **Files Affected:** `firmware/firmware.ino`, `firmware/README.md`.
- **Verification:** Verify compilation against ESP32 board definitions.
- **DoD:** Reads all 5 parameters every 2 seconds, updates LCD, drives LEDs, emits serial logs.

---

## PHASE 2 & 3: Cloud Integration (Blynk + ThingSpeak)

### Task 2.1: Blynk Live Connector
- **Objective:** Transmit live values (V1..V5) and device heartbeat to Blynk Cloud.
- **Files Affected:** `firmware/firmware.ino`.
- **DoD:** Blynk app or REST endpoint displays updated values without blocking sensor loop.

### Task 3.1: ThingSpeak Historical Pipeline
- **Objective:** Transmit timestamped 5-parameter payload to ThingSpeak every 15-20 seconds.
- **Files Affected:** `firmware/firmware.ino`.
- **DoD:** Feeds confirmed in ThingSpeak channel JSON output.

---

## PHASE 4 & 5: Frontend Shell & Real-Time Monitoring

### Task 4.1: Shared App Shell & Navigation
- **Objective:** Implement shared desktop/mobile navigation bar, header, and container shell matching Stitch.
- **Files Affected:** `web/js/app-shell.js`, `web/css/style.css`.
- **DoD:** Consistent 6-item navigation with active state indicator and responsive behavior.

### Task 4.2: Frontend Data Layer (`data-layer.js`)
- **Objective:** Create client-side service for fetching ThingSpeak & Blynk data, handling caching, error states, and providing realistic fallback DEMO data.
- **Files Affected:** `web/js/data-layer.js`.
- **DoD:** Exposes `getLatestTelemetry()`, `getHistoricalData(parameter, window)`, and `getDeviceStatus()`.

### Task 4.3: Public Landing Page (`web/index.html`)
- **Objective:** Implement public-facing gateway page introducing ENVORA, the 5 parameters, system architecture, explainable regression model, feature previews, and CTAs to the dashboard.
- **Inputs:** `15_LANDING_PAGE_SPECIFICATION.md`.
- **Files Affected:** `web/index.html`.
- **Verification:** Responsive testing across breakpoints; verify all anchor links and console launch CTAs.
- **DoD:** 100% adherence to *Canopy & Commons* aesthetic; zero PM2.5/AQI references; functional navigation to application console.

### Task 5.1: Dashboard Screen (`dashboard.html`)
- **Objective:** Refactor Stitch dashboard screen: remove all PM2.5/AQI, wire to 5 sensors, render Environmental Flow graph and overall state.
- **Files Affected:** `web/dashboard.html`, `web/js/dashboard.js`.
- **DoD:** Shows live state, 5 metric cards, organic flow graph, and last update timestamp.

### Task 5.2: Live Monitoring Screen (`live-monitoring.html`)
- **Objective:** Render real-time telemetry gauges and flowing live signal entering from right edge.
- **Files Affected:** `web/live-monitoring.html`, `web/js/live-monitoring.js`.
- **DoD:** Updates live every few seconds, shows device heartbeat (ONLINE/OFFLINE), zero PM references.

---

## PHASE 6, 7, 8, 9: Analysis, Prediction, Alerts & Reports

### Task 6.1: Historical Analysis Workspace (`historical-analysis.html`)
- **Objective:** Implement parameter selector, time range filter (24H, 7D, 30D, Custom), Avg/Min/Max/Current stats, and smooth Chart.js visualization.
- **Files Affected:** `web/historical-analysis.html`, `web/js/historical.js`.
- **DoD:** Interactively switches parameters and calculates accurate mathematical statistics.

### Task 7.1: MQ-135 Prediction Engine (`prediction.html` & `prediction.js`)
- **Objective:** Implement linear regression ($y = mx + b$), slope classification (RISING/FALLING/STABLE), forecast interval $t+1$, and Observed/Regression/Forecast chart.
- **Files Affected:** `web/prediction.html`, `web/js/prediction.js`.
- **DoD:** Visual distinction of past/regression/future; graceful insufficient data state if $<5$ points.

### Task 8.1: Alerts Engine (`alerts.html` & `alerts.js`)
- **Objective:** Implement threshold comparison, anti-oscillation debounce, active events table, and chronological history.
- **Files Affected:** `web/alerts.html`, `web/js/alerts.js`.
- **DoD:** Evaluates all 5 parameters; shows warning/critical badges; filters active vs resolved.

### Task 9.1: Presentation-Ready Reports (`reports.html` & `reports.js`)
- **Objective:** Build academic environmental summary report with date filter, summary metrics, alert count, prediction overview, and printable layout.
- **Files Affected:** `web/reports.html`, `web/js/reports.js`.
- **DoD:** Formatted for academic presentation and print-to-PDF (`@media print`).
