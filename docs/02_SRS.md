# Campus Environmental Intelligence System (ENVORA)
## 02 — Software Requirements Specification (SRS)

**Version:** 1.0  
**Status:** Locked Specification  
**System Boundary:** BME280, MQ-135, INMP441 → ESP32 → Wi-Fi → Blynk / ThingSpeak → Custom Web App

---

## 1. Actors & Roles
- **Viewer:** Accesses 6 screens (Dashboard, Live Monitoring, Historical Analysis, Prediction, Alerts, Reports). Read-only.
- **System Operator:** Manages physical hardware, Wi-Fi credentials, and cloud channel keys.
- **Automated System:** Acquires sensor data, publishes to cloud, calculates linear regression, and monitors alert thresholds.

---

## 2. Core Functional Requirements
- **FR-SENSOR-001..005:** Measure Temperature, Humidity, Pressure, Gas Response, Noise.
- **FR-DASH-001..006:** Render overall state (`NORMAL`, `WARNING`, `CRITICAL`), 5 parameter cards, environmental flow trend, and freshness state (`LIVE`, `STALE`, `OFFLINE`).
- **FR-LIVE-001..005:** Telemetry entry from right edge (500–700 ms), device online heartbeat, last updated timestamp.
- **FR-HIST-001..007:** Parameter switcher, time ranges (24H, 7D, 30D, Custom), Avg/Min/Max/Current stats. No PM parameters.
- **FR-PRED-001..010:** Client-side linear regression on MQ-135, forecast $t_{n+1}$, slope classification (RISING/FALLING/STABLE), insufficient-data fallback when $<5$ points.
- **FR-ALERT-001..008:** Configurable thresholds, warning/critical severity, active/resolved logs, anti-oscillation debounce.
- **FR-REPORT-001..005:** Presentation-ready academic report with print/export support.

---

## 3. Business Rules
- **BR-001 / BR-002:** Highest active severity determines overall campus environmental state.
- **BR-003 / BR-004:** Never fabricate missing data or replace missing sensor values with 0. Explicitly show `UNAVAILABLE`.
- **BR-005:** MQ-135 is strictly described as relative sensor response.
