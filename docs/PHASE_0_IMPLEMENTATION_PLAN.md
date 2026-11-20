# Phase 0 Foundation Implementation Plan: Campus Environmental Intelligence System (ENVORA)

---

## 1. Executive Summary

This document defines the revised **Phase 0 Foundation Implementation Plan** for the **Campus Environmental Intelligence System (ENVORA)**.

The objective of Phase 0 is to establish the baseline engineering scaffolding, file structure, global design tokens, shared application shell, and client-side data contract required for the project. Phase 0 creates a clean, reusable foundation so that subsequent feature phases (Dashboard, Live Monitoring, Historical Analysis, Prediction, Alerts, and Reports) integrate into a unified visual and technical harness.

**Phase 0 strictly avoids premature feature development.** No firmware, live cloud network calls, machine learning prediction algorithms, complex telemetry simulators, or page-specific analytical charts will be built during this phase.

---

## 2. Repository & Documentation Findings

An audit of the canonical documentation suite (`AGENTS.md`, `PROJECT_STATE.md`, `docs/01_` through `docs/16_`) and current repository state confirms:

1. **Documented Scope vs. Raw Stitch Templates:**
   - **Canonical Scope:** Exactly 5 environmental parameters are monitored: Temperature (BME280), Humidity (BME280), Atmospheric Pressure (BME280), MQ-135 Gas Response, and Environmental Noise (INMP441). All particulate matter parameters (PM1.0, PM2.5, PM4, PM10) and AQI calculations are strictly excluded per `docs/01_PRD.md` and `docs/07_DATA_CONTRACT.md`.
   - **Current Raw HTML Files:** The 6 exported HTML files in the repository root (`dashboard.html`, etc.) contain early prototype placeholders (7 cards including PM1.0, PM2.5, PM10, missing Atmospheric Pressure, and AQI text).
   - **Finding:** These raw files must remain untouched during Phase 0. They will be migrated to `web/` and refactored during their respective feature phases (Phases 5–9) to strictly match the 5-parameter data contract.

2. **Repository Hierarchy:**
   - Standardized target directories (`hardware/`, `firmware/`, `web/css/`, `web/js/`) defined in `docs/06_IMPLEMENTATION_PLAN.md` must be initialized.

3. **Stitch Design Source of Truth:**
   - The Stitch screenshots and `docs/16_VISUAL_REFERENCE_GUIDE.md` represent the locked visual source of truth. Phase 0 translates these visual specifications into global tokens and shared shell elements without independent reinterpretation.

---

## 3. Phase 0 Scope

Phase 0 establishes the **structural, technical, and visual foundation**:

1. **Standardized Directory Architecture:**
   - Initialize `hardware/`, `firmware/`, `web/`, `web/css/`, `web/js/`, and `web/assets/`.
2. **Global Design System Tokens (`web/css/tokens.css`):**
   - Translate all locked *Canopy & Commons* color tokens (`#3F4D27`, `#667A3E`, `#9AA77A`, `#E9E0CC`, `#F7F3E8`, `#FBF9F2`, `#292D22`, `#777866`, `#C88A2E`, `#B84A39`), typography families (*Hanken Grotesk* and *JetBrains Mono*), spacing rhythm, and border radii into standard CSS custom properties.
3. **Global Layout & Styling Primitives (`web/css/style.css`):**
   - Establish CSS resets, baseline layout utilities, card containers, typography utilities, and standard interaction states derived directly from Stitch.
4. **Reusable Application Shell (`web/js/app-shell.js`):**
   - Implement the shared navigation and layout wrapper providing consistent header structure, brand mark, 6-destination navigation links (`01 Dashboard` through `06 Reports`), and active link state handling.
5. **Data Layer Contract & Simplified DEMO Mode (`web/js/data-layer.js` Scaffold):**
   - Establish the client-side data interface, deterministic normalized sample/fixture datasets for the 5 parameters, and the LIVE/DEMO switching interface.
6. **Project Root Infrastructure:**
   - Create `.env.example`, `.gitignore`, and master `README.md`.

---

## 4. Phase 0 Non-Goals

To maintain strict phase boundaries, the following are **explicitly excluded from Phase 0**:

- ❌ **No ESP32 Firmware Development:** Belongs to Phase 1.
- ❌ **No Hardware Schematics:** Wiring documentation belongs to Phase 1.
- ❌ **No Live Cloud Network Requests:** Live Blynk and ThingSpeak API calls belong to Phases 2, 3, and 5.
- ❌ **No Sophisticated Environmental Physics Simulator:** Phase 0 uses deterministic, static sample fixture data only. Richer simulation can be added later if needed.
- ❌ **No Credential Storage in Browser:** No Blynk auth tokens or private write keys will be stored in `localStorage` or browser persistence. No settings credential modal will be implemented.
- ❌ **No Page-Specific Feature Implementation:**
  - No Environmental Flow or Composite Status calculations (Phase 5: Dashboard).
  - No Live Telemetry stream entering from the right edge (Phase 5: Live Monitoring).
  - No Multi-scale time-series charts or statistical calculations (Phase 6: Historical Analysis).
  - No Linear regression ($y = mx + b$) prediction engine (Phase 7: Prediction).
  - No Threshold comparison logic, alert tables, or buzzer triggers (Phase 8: Alerts).
  - No Document report compilation or print styling (Phase 9: Reports).
- ❌ **No Public Landing Page Implementation:** `web/index.html` is deferred to Phase 4 (Task 4.3).
- ❌ **No Particulate Matter / AQI Code:** Zero references to PM1.0, PM2.5, PM10, or AQI.
- ❌ **No Backend Services:** No FastAPI, Flask, Node.js backend, PostgreSQL, Redis, Celery, MQTT, or Docker.

---

## 5. Architecture Alignment

The Phase 0 plan strictly conforms to the locked architecture:

```text
[ Physical Sensors ] ──► [ ESP32 DevKit V1 ] ──► [ Wi-Fi ] ──► [ Blynk + ThingSpeak ]
                                                                      │
                                                              REST API Feeds
                                                                      │
                                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CUSTOM WEB APPLICATION                             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                SHARED APPLICATION SHELL (app-shell.js)                │  │
│  │     Navigation · Brand Mark · Header Structure · Active Route State    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │   DESIGN SYSTEM TOKENS  │  │       CLIENT-SIDE DATA LAYER (SCAFFOLD)  │  │
│  │   tokens.css · style.css│  │       data-layer.js (LIVE / DEMO mode)   │  │
│  └─────────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │               6 APPLICATION FEATURE SCREENS (Phases 5–9)              │  │
│  │   01 Dashboard · 02 Live Monitoring · 03 Historical · 04 Prediction   │  │
│  │   05 Alerts · 06 Reports                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

The web application connects **only** to cloud REST APIs (or uses the local DEMO fixture fallback) via `data-layer.js`. The browser never connects directly to the ESP32.

---

## 6. Stitch Visual Fidelity & Desktop Adaptation Strategy

### Stitch Is the Absolute Visual Source of Truth
The Stitch references and `docs/16_VISUAL_REFERENCE_GUIDE.md` are the visual source of truth. 

- **Preservation Over Invention:** Desktop adaptation must strictly preserve the Stitch composition, hierarchy, typography, spacing relationships, components, graphs, colors, surface treatment, and interaction concepts.
- **Viewport Constraints Only:** Desktop-specific layout changes are permitted **only** where strictly required by viewport constraints (e.g. accommodating wider screens without stretching cards or breaking proportions).
- **No Independent Redesign:** Antigravity will not independently redesign Stitch into a generic desktop dashboard, administrative panel, or gaming dark-mode theme.

### The 12-Column Grid Is Subordinate to Stitch
A 12-column grid may be used as an underlying CSS layout utility, but:
> **The grid is an underlying layout mechanism only. Final page composition, proportions, spacing, and component placement must follow the Stitch references.**

---

## 7. Design System Foundation

Phase 0 centralizes the design tokens in `web/css/tokens.css` directly derived from Stitch:

### 7.1 Color Tokens
```css
:root {
  /* Canopy & Commons Core Palette */
  --color-canvas: #FBF9F2;             /* Soft Ivory root ground */
  --color-surface: #F7F3E8;            /* Cream card containment */
  --color-surface-dim: #EFEFD9;        /* Muted surface tier */
  --color-border: #E9E0CC;             /* Warm Beige 1px structural dividing lines */
  --color-border-hover: #9AA77A;       /* Sage interactive hover outline */
  
  /* Brand Accents */
  --color-primary: #3F4D27;            /* Deep Olive - primary identity & headings */
  --color-primary-hover: #667A3E;      /* Olive - interactive controls */
  --color-secondary: #667A3E;          /* Olive - primary telemetry curves */
  --color-accent-sage: #9AA77A;        /* Sage - regression & supporting visual elements */
  
  /* Typography */
  --color-text-primary: #292D22;       /* Dark Ink - titles & tabular numbers */
  --color-text-muted: #777866;         /* Muted Earth - labels, units, timestamps */
  
  /* Semantic Telemetry States */
  --color-state-normal: #667A3E;       /* Olive */
  --color-state-warning: #C88A2E;      /* Muted Amber */
  --color-state-critical: #B84A39;     /* Muted Red */
}
```

### 7.2 Typography & Spacing
- **Font Stacks:**
  - `--font-narrative: 'Hanken Grotesk', -apple-system, sans-serif;`
  - `--font-telemetry: 'JetBrains Mono', monospace;` (with `font-variant-numeric: tabular-nums;`)
- **Spacing Rhythm:** 8px base grid matching Stitch (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Motion Timings:** Locked to `docs/16_VISUAL_REFERENCE_GUIDE.md` (`500–700ms` data enter, `400–600ms` switch, `100–200ms` tooltip, `700–1000ms` prediction projection).

---

## 8. Application Shell Plan

### Removal of Unsupported / Invented Shell Decisions
No arbitrary shell features (such as hardcoded 64px bar heights, telemetry status dots, subtitles, custom navigation pills, ESP32 ONLINE indicators, LIVE/STALE/DEMO badges, settings gear icons, settings credential modals, or mobile drawer behaviors) will be locked as design requirements unless explicitly present in the Stitch designs or canonical documentation.

### Shell Requirements:
- Shared shell components must be **derived directly** from the documented UI specification and Stitch references.
- Where a behavior or element is not specified in Stitch, use the **minimum implementation necessary** to support clean navigation across the six application pages.
- Provide consistent top header structure, brand mark, navigation links (`01 Dashboard` through `06 Reports`), and active link highlighting based on current URL path.

---

## 9. Data Layer Boundary & Simplified DEMO Mode

The Data Layer (`web/js/data-layer.js`) acts as the single integration boundary for application data:

1. **Data Contract & Interface:**
   - Defines standard method signatures: `getLatest()`, `getHistorical(parameter, window)`, and `getStatus()`.
   - Restricts parameter models strictly to the 5 approved parameters (`temperature`, `humidity`, `pressure`, `gas_response`, `noise`). Zero PM or AQI properties.
2. **Simplified DEMO Implementation (No Complex Physics Simulator):**
   - Phase 0 establishes:
     - The DEMO mode contract.
     - Normalized, static sample fixture datasets representing nominal campus conditions.
     - Deterministic test data for unit verification.
     - A simple LIVE/DEMO switching interface.
   - Complex environmental physics modeling or dynamic drift simulation will **not** be built in Phase 0.
3. **No Sensitive Credentials in Browser Persistence:**
   - Sensitive credentials (e.g. Blynk auth tokens, ThingSpeak write keys) will **not** be stored in `localStorage` or browser persistence.
   - Public read configurations (e.g. Public Channel ID) may be configured via environment placeholders or static config constants, but no credential settings modal will be created in Phase 0.

---

## 10. File-Level Implementation Plan

| File Path | Operation | Responsibility & Purpose | Dependencies |
|---|---|---|---|
| `hardware/` | New Directory | Target folder for hardware pinout documentation (Phase 1). | None |
| `firmware/` | New Directory | Target folder for Arduino ESP32 C++ source files (Phase 1). | None |
| `web/` | New Directory | Root directory for web application assets. | None |
| `web/css/tokens.css` | New File | Canonical CSS variables for *Canopy & Commons* theme. | `docs/16_VISUAL_REFERENCE_GUIDE.md` |
| `web/css/style.css` | New File | Baseline resets, grid layout utilities, card containers, typography. | `tokens.css` |
| `web/js/data-layer.js` | New File | Data layer scaffold (API signatures, normalized sample fixtures). | `docs/07_DATA_CONTRACT.md` |
| `web/js/app-shell.js` | New File | Reusable navigation header and active route state handler. | `tokens.css`, `style.css` |
| `.env.example` | New File | Template for cloud credentials and API placeholders. | `docs/12_ENVIRONMENT_CONFIGURATION.md` |
| `.gitignore` | New File | Standard Git ignore for secrets, logs, `.env`, OS artifacts. | None |
| `README.md` | New File | Master project overview, architecture diagram, setup guide. | `docs/01_PRD.md` |
| `PROJECT_STATE.md` | Modify | Updated only after Phase 0 passes all verification checks. | None |

*Note:* The 6 raw HTML screens in the root directory remain untouched during Phase 0.

---

## 11. Dependency & Execution Order

Phase 0 execution follows this sequence:

```text
Step 1: Workspace Scaffolding
├── Create directories: hardware/, firmware/, web/, web/css/, web/js/, web/assets/
└── Create repository hygiene files: .gitignore, .env.example, README.md

Step 2: Design System Tokens & Base Styling
├── Create web/css/tokens.css (Canopy & Commons CSS variables derived from Stitch)
└── Create web/css/style.css (Resets, Stitch-subordinate layout utilities, card surfaces)

Step 3: Application Shell Foundation
└── Create web/js/app-shell.js (Navigation structure, active route highlighting)

Step 4: Data Layer Contract & Simplified DEMO Fixtures
└── Create web/js/data-layer.js (API signatures, deterministic sample fixtures, LIVE/DEMO switch)

Step 5: Verification & Remediation Loop
├── Execute structural, visual, syntax, and data contract checks
├── If any failure occurs: Fix failure → Re-verify
└── Once ALL checks pass: Update PROJECT_STATE.md → Mark Phase 0 COMPLETE
```

---

## 12. Verification Plan

Before Phase 0 can be completed, the following verification gates must pass:

1. **Structural Verification:**
   - Assert `hardware/`, `firmware/`, `web/css/`, and `web/js/` exist and are accessible.
2. **Visual Fidelity Verification Gate (Mandatory):**
   - **Stitch Fidelity:** Compare rendered shell and layout containers against Stitch screenshots.
   - **Colors:** Verify exact hex values from `docs/16_VISUAL_REFERENCE_GUIDE.md` (`#3F4D27`, `#667A3E`, `#9AA77A`, `#E9E0CC`, `#F7F3E8`, `#FBF9F2`, `#292D22`, `#777866`, `#C88A2E`, `#B84A39`).
   - **Typography:** Verify Hanken Grotesk and JetBrains Mono rendering and weights.
   - **Spacing & Surfaces:** Verify cream card containment, soft ivory ground, and 1px warm beige borders.
   - **Absence of Invented Language:** Confirm no neon, cyberpunk, or generic blue dashboard styling has been introduced.
3. **Shell Routing Verification:**
   - Verify navigation links point exactly to the 6 canonical routes (`dashboard.html`, `live-monitoring.html`, `historical-analysis.html`, `prediction.html`, `alerts.html`, `reports.html`).
   - Verify active route highlighting reflects the current page.
4. **Data Contract & Parameter Verification:**
   - Verify `data-layer.js` models exactly the 5 parameters (`temperature`, `humidity`, `pressure`, `gas_response`, `noise`).
   - Confirm **zero** occurrences or properties for `pm10`, `pm25`, `pm10`, or `aqi`.
5. **Security & Secrets Verification:**
   - Confirm zero API keys, Wi-Fi passwords, or Blynk tokens are hardcoded or stored in `localStorage`.
   - Confirm `.gitignore` ignores `.env`.

---

## 13. Risks & Open Questions

- **Ambiguity Check:** None. All visual tokens, layout rules, and sensor contracts are locked by `docs/01_` through `docs/16_`.
- **Stitch Visual Source of Truth:** Re-confirmed. In any case of tension between generic desktop layouts and Stitch mockups, Stitch composition takes precedence.

---

## 14. Phase 0 Completion Criteria & Verification Sequence

Phase 0 will be marked complete **only** through this strict verification sequence:

```text
Implement Phase 0 Components
             ↓
Run Verification Gates (Visual, Structural, Security, Contract)
             ↓
Did any failure occur?
     ├── Yes ──► Fix Failures ──► Verify Again (Loop until clean)
     └── No
             ↓
All Checks Pass Cleanly
             ↓
Update PROJECT_STATE.md
             ↓
Mark Phase 0 COMPLETE
```

`PROJECT_STATE.md` must **not** be updated to COMPLETE before all verification checks pass.

---

**IMPLEMENTATION STATUS: NOT STARTED**
