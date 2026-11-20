# 11 — Acceptance Test Plan (ATP)

This document establishes the test scenarios, preconditions, execution steps, and verification assertions required to sign off the project.

---

## 1. Test Scenarios

### TEST SENS-001: 5-Parameter Sensor Loop
- **Given:** ESP32 is wired to BME280, MQ-135, and INMP441 and powered via 5V 2A.
- **When:** Firmware executes its periodic sensor sampling loop.
- **Then:**
  - Temperature (°C), Humidity (%), and Pressure (hPa) are read via I2C.
  - MQ-135 returns an analog reading between 0 and 4095.
  - INMP441 returns computed dB SPL over I2S audio samples.
  - Values update on the physical I2C LCD.
  - Green LED illuminates when all readings are within Normal thresholds.

### TEST LAND-001: Public Landing Page Verification
- **Given:** Public visitor accesses root URL (`index.html`).
- **When:** Page loads in browser.
- **Then:**
  - Sticky header displays brand mark, navigation anchors, and "Launch Console" CTA.
  - Hero introduces ENVORA's mission with calm *Canopy & Commons* styling.
  - 5 parameter cards display BME280, MQ-135, and INMP441 capabilities (zero PM/AQI references).
  - Architecture section visually illustrates ESP32 → Blynk / ThingSpeak → Custom Web App.
  - Linear regression ($y = mx + b$) explanation card details trend classification logic.
  - Primary CTA button successfully routes to `dashboard.html`.
  - Layout is fully responsive across desktop, tablet, and mobile without horizontal overflow.

### TEST DASH-001: Dashboard Screen Verification
- **Given:** Web application is launched in a standard browser.
- **When:** User visits `dashboard.html`.
- **Then:**
  - Environmental State banner shows `NORMAL`, `WARNING`, or `CRITICAL` based on highest active severity.
  - 5 metric cards are displayed: Temperature, Humidity, Atmospheric Pressure, Gas Response, Noise.
  - Zero PM1.0, PM2.5, PM10, or AQI cards appear.
  - Environmental Flow graph renders smooth organic signal in Olive (`#667A3E`).
  - Freshness badge displays `LIVE` (or `STALE` / `DEMO`).

### TEST HIST-001: Historical Analysis Workspace
- **Given:** Historical feeds exist in ThingSpeak (or local buffer).
- **When:** User selects parameter **Temperature** and time window **24H**.
- **Then:**
  - Time-series chart renders temperature curve with tooltips.
  - Statistics block accurately calculates:
    - `Average` = sum(readings) / count
    - `Minimum` = min(readings)
    - `Maximum` = max(readings)
    - `Current` = latest reading
  - Parameter switching updates the chart within 400–600 ms without page reload.

### TEST PRED-001: MQ-135 Linear Regression Prediction
- **Given:** At least 5 historical MQ-135 sensor-response readings are available.
- **When:** User navigates to `prediction.html`.
- **Then:**
  - Linear regression ($y = mx + b$) computes slope $m$ and intercept $b$.
  - Forecast point ($t_{n+1}$) is estimated: $y_{pred} = m(n+1) + b$.
  - Trend classified accurately:
    - $m > +1.5 \implies$ **RISING** (Amber badge)
    - $m < -1.5 \implies$ **FALLING** (Olive badge)
    - $|m| \le 1.5 \implies$ **STABLE** (Neutral badge)
  - Chart visually separates **Observed** (solid line), **Regression Line** (sage), and **Forecast Point** (highlighted dot in shaded future area).
  - Explicit section: *"How the Prediction Works"* is visible.

### TEST ALRT-001: Threshold Evaluation & Event Logging
- **Given:** Noise reading spikes to 85 dB (exceeding 80 dB Critical threshold).
- **When:** Data layer evaluates incoming reading against thresholds.
- **Then:**
  - An alert event is generated with parameter, reading, threshold, severity (`CRITICAL`), timestamp, and status (`ACTIVE`).
  - Red LED illuminates on hardware; buzzer sounds if active.
  - Alerts screen highlights the active event at the top of the timeline.
  - Resolved alerts move to historical audit log once readings return to normal.

### TEST REPT-001: Presentation-Ready Reports
- **Given:** Sensor and alert history is populated.
- **When:** User views `reports.html` and triggers Print / PDF Export.
- **Then:**
  - Document-style summary displays period, metrics, alert audit, and prediction overview.
  - Clean page break formatting without sidebar clutter (`@media print`).
