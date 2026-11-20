# ENVORA Phase 3 Implementation Plan — Visualization & Intelligence

**Document Version:** 2.0.0  
**Phase:** Phase 3 — Visualization & Intelligence  
**Author:** Antigravity System Agent  
**Date:** 2026-11-21  
**Status:** REVISED DRAFT FOR APPROVAL  

---

## 1. Executive Summary & Core Invariants

Phase 3 implements the client-side intelligence and advanced visualization systems for the **Campus Environmental Intelligence System (ENVORA)**. All intelligence logic is encapsulated into a dedicated client-side module, `web/js/intelligence.js` (`EnvoraIntelligence`), maintaining strict architectural decoupling from data ingestion.

### Inviolable Invariants:
1. **Locked Five-Parameter Scope**: Exclusively Temperature, Relative Humidity, Atmospheric Pressure, MQ-135 Gas Response, and Environmental Noise. Zero PM1.0, PM2.5, PM10, or AQI calculations.
2. **Decoupled Architecture**: `web/js/data-layer.js` remains pure data fetching and normalization. Environmental state evaluation, regression math, and statistics live in `web/js/intelligence.js`.
3. **No Backend Services**: All math, threshold comparisons, and trendlines execute strictly client-side in browser JavaScript. No Node servers, Python/FastAPI, or external analytics APIs.
4. **Predictive Honesty**: MQ-135 prediction is strictly labeled as **MQ-135 Sensor-Response Prediction** via Ordinary Least Squares (OLS) linear regression ($y = mx + b$). Slope represents sensor-response change per observation interval. No claims of calibrated gas concentration, ppm, or AQI.
5. **Data Integrity & Null Safety**: Missing or null values render as `UNAVAILABLE`. Never fabricated as `0`. If historical samples $< 5$, prediction displays an explicit *insufficient data* state.

---

## 2. Environmental Severity & Data Availability Model

To maintain scientific integrity without conflating data transmission quality with physical environmental risk, the system separates **Environmental Severity** from **Data Availability**:

```text
Environmental Severity:
NORMAL / WARNING / CRITICAL

Data Availability:
COMPLETE / DEGRADED
```

### 2.1 Parameter Classification
- **Valid Numerical Observation**: Evaluated against canonical thresholds $\implies$ `NORMAL`, `WARNING`, or `CRITICAL`.
- **Null / Missing / NaN Observation**: Explicitly classified as `UNAVAILABLE`. Never converted to `0`.

### 2.2 Severity Arbitration Rule (BR-001 / BR-002)
Overall station environmental severity is governed strictly by the maximum severity among **available** parameters:
$$\text{Severity}_{\text{overall}} = \max(\{\text{Severity}_p \mid p \in \text{Available}\})$$
Where:
$$\text{NORMAL (0)} < \text{WARNING (1)} < \text{CRITICAL (2)}$$
- `UNAVAILABLE` is **never** treated as a severity state and cannot elevate an overall severity above `CRITICAL` or `WARNING`.
- If 4 sensors are `NORMAL` and 1 is `UNAVAILABLE`, `Severity_overall` is `NORMAL`.
- If 1 sensor is `CRITICAL` and 1 is `UNAVAILABLE`, `Severity_overall` is `CRITICAL`.
- If **all** 5 sensors are `UNAVAILABLE`, `Severity_overall` is reported as `UNKNOWN` (with fallback styling).

### 2.3 Data Availability Metadata
A separate status flag is computed and exposed alongside severity:
- `Data Availability: COMPLETE` — All 5 sensor streams are present and valid.
- `Data Availability: DEGRADED` — Exactly $K \in [1, 5]$ sensor channels are `UNAVAILABLE`. The UI displays a subtle indicator badge (e.g. `DEGRADED (4/5 active)`) in the station header without altering the environmental state color.

---

## 3. Alert Activation, Debounce, and Resolution FSM

To prevent threshold chatter and oscillation, alerts operate on a deterministic Finite State Machine (FSM) evaluated per parameter:

```text
SAFE
  ↓ threshold crossed (1st breach)
CANDIDATE
  ↓ confirmed breach (2nd consecutive reading)
ACTIVE
  ↓ safe reading (1st recovery)
RECOVERING
  ↓ confirmed recovery (2nd consecutive safe reading)
RESOLVED
```

### 3.1 State Definitions & Transition Rules
1. **SAFE $\to$ CANDIDATE**: A single reading crosses the Warning or Critical threshold. The system flags a candidate breach at timestamp $t_1$. No public alert is emitted yet.
2. **CANDIDATE $\to$ ACTIVE**: The immediately following reading at timestamp $t_2$ remains above threshold. The alert transitions to `ACTIVE`, generating a single alert event in the log with timestamp $t_1$, parameter, initial value, and severity.
3. **CANDIDATE $\to$ SAFE**: If reading $t_2$ returns to safe limits, the candidate condition drops silently. Chatter is absorbed.
4. **Repeated Observations While ACTIVE**:
   - Subordinate readings that remain in breach do **not** generate new alerts.
   - The existing active alert record updates its `lastValue`, `lastTimestamp`, and cumulative `duration`.
   - If severity escalates (e.g. `WARNING` $\to$ `CRITICAL`), the active alert's severity elevates in-place with an escalation timestamp.
5. **ACTIVE $\to$ RECOVERING $\to$ RESOLVED**:
   - Transition to `RESOLVED` requires **two consecutive safe readings** ($K_{\text{resolve}} = 2$).
   - Upon the second safe reading, the alert status switches to `RESOLVED` with a resolution timestamp.
6. **Parameter Becomes UNAVAILABLE**:
   - If an active alert's sensor becomes null/unavailable, the alert enters a `HELD` state.
   - It is neither falsely resolved nor escalated until telemetry resumes.
7. **Deduplication Invariant**:
   - Keyed strictly by `(paramKey, status === 'ACTIVE')`. Exactly one active alert can exist per parameter at any time.

---

## 4. Two-Sided Threshold & Zone Visualizations

Canonical thresholds from `docs/07_DATA_CONTRACT.md` Section 2:

| Parameter | Normal Range | Warning Range | Critical Range | Type |
|---|---|---|---|---|
| **Temperature** | $\le 32.0^\circ\text{C}$ | $32.1 - 38.0^\circ\text{C}$ | $> 38.0^\circ\text{C}$ | One-sided (Upper) |
| **Relative Humidity** | $30.0 - 70.0\%$ | $20.0 - 29.9\%$ or $70.1 - 85.0\%$ | $< 20.0\%$ or $> 85.0\%$ | **Two-sided (Lower & Upper)** |
| **Atmospheric Pressure** | $990.0 - 1025.0\text{ hPa}$ | $975.0 - 989.9\text{ hPa}$ or $1025.1 - 1035.0\text{ hPa}$ | $< 975.0\text{ hPa}$ or $> 1035.0\text{ hPa}$ | **Two-sided (Lower & Upper)** |
| **MQ-135 Gas Response** | $\le 900\text{ raw}$ | $901 - 1500\text{ raw}$ | $> 1500\text{ raw}$ | One-sided (Upper) |
| **Environmental Noise** | $\le 65.0\text{ dB SPL}$ | $65.1 - 80.0\text{ dB SPL}$ | $> 80.0\text{ dB SPL}$ | One-sided (Upper) |

### Visual Implementation in Historical Analysis:
1. **Two-Sided Parameters (Humidity & Pressure)**:
   - Render two dashed horizontal reference lines: Lower Warning Limit and Upper Warning Limit (`stroke="#C88A2E"`, stroke-dasharray `4 4`).
   - SVG background includes soft translucent zone rectangles:
     - `NORMAL` zone: `#F7F3E8` with subtle green border.
     - `WARNING` zones: Upper and lower margins tinted `#FAF2E2`.
     - `CRITICAL` zones: Outer limits tinted `#FDF0ED`.
2. **One-Sided Parameters (Temp, Gas, Noise)**:
   - Render a single upper threshold line with contextual reference label (e.g. `Reference Limit: 32.0°C`).

---

## 5. Parameter-Specific Trend Tolerances ($\epsilon$)

Trend direction over an observation window cannot apply a uniform raw epsilon across mismatched units. Directional classification evaluates net change $\Delta = v_{\text{latest}} - v_{\text{initial}}$ against documented parameter tolerances:

| Parameter | Unit | Stability Tolerance ($\epsilon$) | Condition for STABLE |
|---|---|---|---|
| **Temperature** | °C | $\mathbf{0.3^\circ\text{C}}$ | $|\Delta| \le 0.3^\circ\text{C}$ |
| **Relative Humidity** | % | $\mathbf{1.0\%}$ | $|\Delta| \le 1.0\%$ |
| **Atmospheric Pressure** | hPa | $\mathbf{0.5\text{ hPa}}$ | $|\Delta| \le 0.5\text{ hPa}$ |
| **MQ-135 Gas Response** | raw | $\mathbf{10\text{ raw}}$ | $|\Delta| \le 10\text{ raw}$ |
| **Environmental Noise** | dB SPL | $\mathbf{1.5\text{ dB SPL}}$ | $|\Delta| \le 1.5\text{ dB SPL}$ |

If $\Delta > +\epsilon \implies \mathbf{RISING}$; if $\Delta < -\epsilon \implies \mathbf{FALLING}$; otherwise $\mathbf{STABLE}$.

---

## 6. Contextual Analytical Narrative Boundaries

All narrative text generated dynamically by `EnvoraIntelligence.generateInterpretation()` must remain strictly grounded in observed numbers and configured thresholds. Speculative claims regarding weather systems, health impacts, regional air quality, or unmeasured phenomena are strictly prohibited.

### Standardized Template Formulas:
- **Temperature**: *"Ambient temperature observed at North Quad station is currently within [NORMAL/WARNING/CRITICAL] limits ([value]°C) with a [RISING/FALLING/STABLE] trend over the selected window."*
- **Relative Humidity**: *"Relative humidity is [value]%, currently within the configured [NORMAL/WARNING/CRITICAL] boundary ([threshold range]) and exhibiting [RISING/FALLING/STABLE] equilibrium."*
- **Atmospheric Pressure**: *"Atmospheric pressure is [NORMAL/WARNING/CRITICAL] at [value] hPa and has remained [RISING/FALLING/STABLE] across recent station observations."*
- **MQ-135 Gas Response**: *"MQ-135 relative sensor response is [value] raw units, within the [NORMAL/WARNING/CRITICAL] baseline band with [RISING/FALLING/STABLE] sensor-response drift."*
- **Environmental Noise**: *"Acoustic level measured by INMP441 is [value] dB SPL, currently [NORMAL/WARNING/CRITICAL] relative to the campus quiet threshold."*

---

## 7. Explainable MQ-135 Linear Regression Semantics

### 7.1 Mathematical Formulation
For sample index sequence $x_i = 0, 1, \dots, N-1$ with sensor readings $y_i$:
$$m = \frac{N \sum_{i=0}^{N-1} (x_i y_i) - \left(\sum_{i=0}^{N-1} x_i\right)\left(\sum_{i=0}^{N-1} y_i\right)}{N \sum_{i=0}^{N-1} x_i^2 - \left(\sum_{i=0}^{N-1} x_i\right)^2}, \quad b = \frac{\sum_{i=0}^{N-1} y_i - m \sum_{i=0}^{N-1} x_i}{N}$$

- **Slope Semantic**: $m$ represents **MQ-135 sensor-response drift per observation interval** (raw unitless / sample). Never ppm, never calibrated concentration.
- **Classification**:
  - $m > +0.5 \implies \mathbf{RISING}$
  - $m < -0.5 \implies \mathbf{FALLING}$
  - $|m| \le 0.5 \implies \mathbf{STABLE}$

### 7.2 Mathematical Edge Case Guardrails
- **Identical $x$ values**: Impossible by definition ($x_i = i$).
- **Constant $y$ values ($y_i = C$)**: $m = 0$, $b = C$, classified as `STABLE`.
- **Zero / Near-zero slope**: Safely classified as `STABLE`.
- **Null / Non-numeric samples**: Filtered prior to regression. If valid points $N < 5$, return `{ valid: false, reason: "INSUFFICIENT_DATA" }`.
- **Non-finite outputs (NaN/Infinity)**: Explicit check `isFinite(m) && isFinite(b)`. If false, returns `{ valid: false, reason: "CALCULATION_ERROR" }`. No fabricated projections are rendered.

---

## 8. Prediction Horizon & Transmission Cadence Verification

### 8.1 Cadence Verification
- `docs/08_INTEGRATION_SPECIFICATION.md`: ThingSpeak free tier update rate is 15 seconds. Frontend cache TTL is 15 seconds.
- `docs/06_IMPLEMENTATION_PLAN.md`: ESP32 transmission to ThingSpeak operates every 15–20 seconds.
- `web/live-monitoring.html`: Cadence selector supports 5s, 10s, 30s.

### 8.2 Dynamic Horizon Semantics
The prediction target is strictly **one discrete observation interval ahead ($t+1$)**.
- The horizon interval $\Delta t$ is computed dynamically from sample timestamps:
  $$\Delta t = \frac{\text{timestamp}_{N-1} - \text{timestamp}_0}{N - 1}$$
- If timestamps indicate a 15-second interval, the UI displays `Forecast (t+1, +15s)`. If 30-second cadence, it displays `Forecast (t+1, +30s)`.
- If timestamps are missing or invalid, the UI labels the target conservatively as `Next Interval (t+1)`.
- Hardcoding a rigid `+30s` string is replaced with this dynamically verified horizon label.

---

## 9. Dashboard Flow Stabilization (Dynamic Bounds)

1. Compute $v_{\min} = \min(V)$ and $v_{\max} = \max(V)$ from current series.
2. Parameter minimum span clamp: $\Delta_{\min}$ = Temperature 2.0°C; Humidity 5.0%; Pressure 4.0 hPa; Gas 40 raw; Noise 5.0 dB.
3. Compute visual span: $\Delta = \max(v_{\max} - v_{\min}, \Delta_{\min})$.
4. Apply 12% padding: $y_{\min} = v_{\min} - 0.12\Delta$, $y_{\max} = v_{\max} + 0.12\Delta$.
5. Results in visually stable, non-jumping Bezier curves.

---

## 10. Step-by-Step Implementation Sequence

1. **Step 1: Module Implementation (`web/js/intelligence.js`)**:
   - Implement `EnvoraIntelligence` with UMD pattern.
   - Implement state classification with `UNAVAILABLE` handling and `COMPLETE`/`DEGRADED` availability metadata.
   - Implement FSM alert debounce engine ($K=2$) and deduplication.
   - Implement OLS regression with parameter-specific $\epsilon$, dynamic horizon formatting, and edge-case guards.
   - Implement dynamic dataset bounds calculator.
2. **Step 2: Automated Unit Testing (`scratch/test_intelligence_phase3.js`)**:
   - Validate regression with control datasets, constant lines, insufficient data, and NaN guards.
   - Validate two-sided threshold evaluation and severity arbitration with partial null inputs.
   - Validate alert debounce FSM transitions.
3. **Step 3: Dashboard Integration (`web/dashboard.html` & `web/js/pages/dashboard.js`)**:
   - Bind `EnvoraIntelligence.evaluateEnvironmentalState()`; update hero banner and data availability indicator.
   - Replace static (400–550) Y-bounds with dynamic bounds.
4. **Step 4: Historical Analysis Integration (`web/historical-analysis.html` & `web/js/pages/historical-analysis.js`)**:
   - Render two-sided threshold lines for Humidity and Pressure; one-sided for others.
   - Apply parameter-specific $\epsilon$ and grounded analytical narratives.
5. **Step 5: Prediction Page Integration (`web/prediction.html` & `web/js/pages/prediction.js`)**:
   - Compute live regression lines; dynamically format horizon label ($t+1, +\Delta t$).
   - Render `<div class="state-insufficient-data">` when $N < 5$.
6. **Step 6: Alerts & Reports Integration (`web/js/pages/alerts.js` & `web/js/pages/reports.js`)**:
   - Connect FSM alert engine to live/historical feeds.
   - Calculate real statistical matrices for academic reports.
7. **Step 7: Verification & State Update**:
   - Run full regression suite, HTTP probes, and contract audits. Update `PROJECT_STATE.md`.
