# Campus Environmental Intelligence System (ENVORA)

**Version:** 1.0  
**Project Type:** College Major Project / Academic Prototype  
**Architecture:** Physical Sensors (BME280, MQ-135, INMP441) → ESP32 DevKit V1 → Wi-Fi → Blynk / ThingSpeak → Custom Web Application (HTML/CSS/JS)

---

## 1. Project Overview

**ENVORA** is an IoT-based environmental monitoring and analytical platform designed to observe, analyze, and present campus microclimate conditions.

The system focuses strictly on **five physical environmental parameters**:
1. **Temperature** (°C) — *BME280*
2. **Humidity** (%) — *BME280*
3. **Atmospheric Pressure** (hPa) — *BME280*
4. **Gas Response** (Relative Index) — *MQ-135*
5. **Environmental Noise** (dB SPL) — *INMP441*

*Explicit Non-Goals:* No particulate matter sensors (PM1.0, PM2.5, PM4, PM10) and no uncalibrated AQI claims are implemented. The architecture avoids heavyweight backend servers (no FastAPI, PostgreSQL, Redis, Celery, or MQTT), operating as a high-performance, client-side web application connected to cloud REST APIs.

---

## 2. Directory Structure

```text
ENVORA/
│
├── hardware/              # Hardware pinout specifications and wiring guides
├── firmware/              # Modular Arduino C++ ESP32 firmware source code
├── web/                   # Web application root
│   ├── css/               # Canopy & Commons tokens and styling
│   │   ├── tokens.css     # CSS custom properties
│   │   └── style.css      # Layout utilities and card primitives
│   ├── js/                # Client-side data layer and shell infrastructure
│   │   ├── app-shell.js   # Shared navigation and routing shell
│   │   └── data-layer.js  # Data contract, fixtures, and API interface
│   └── assets/            # Static assets and media
│
├── docs/                  # Authoritative 16-document project specification suite
├── .env.example           # Environment template (zero committed secrets)
├── .gitignore             # Standard Git ignore rules
├── AGENTS.md              # Antigravity operational contract and invariants
├── PROJECT_STATE.md       # Living milestone and phase tracker
└── README.md              # Master project overview
```

---

## 3. Technology Stack

- **Edge Controller:** ESP32 DevKit V1 (30-pin, 2.4 GHz Wi-Fi)
- **Firmware Environment:** Arduino IDE (C/C++)
- **Live Monitoring Cloud:** Blynk REST API / Virtual Pins
- **Historical Storage Cloud:** ThingSpeak REST API / Time-Series Feeds
- **Web Platform:** Pure HTML5, Modern CSS, Vanilla JavaScript
- **Visual Design System:** *Canopy & Commons* (Beige + Olive Green aesthetic)

---

## 4. Documentation Suite

Full technical specifications are maintained in `docs/`:
- `01_PRD.md` — Product Requirements Document
- `02_SRS.md` — Software Requirements Specification
- `03_SYSTEM_ARCHITECTURE.md` — System Architecture & Pin Mapping
- `04_UI_UX_SPECIFICATION.md` — UI/UX Specification
- `05_DEVELOPMENT_PLAN.md` — 13-Phase Roadmap
- `06_IMPLEMENTATION_PLAN.md` — Operational Implementation Plan
- `07_DATA_CONTRACT.md` — Authoritative Field Mapping
- `08_INTEGRATION_SPECIFICATION.md` — Cloud REST Protocols
- `09_UI_COMPONENT_SPECIFICATION.md` — Component Catalog
- `10_ERROR_HANDLING.md` — Error Matrix & DEMO Mode
- `11_ACCEPTANCE_TEST_PLAN.md` — Test Scenarios
- `12_ENVIRONMENT_CONFIGURATION.md` — Credential Policy
- `13_DEPLOYMENT_HANDOVER.md` — Hardware & Flashing Guide
- `14_DEMO_SCENARIO.md` — Presentation Script
- `15_LANDING_PAGE_SPECIFICATION.md` — Public Landing Page
- `16_VISUAL_REFERENCE_GUIDE.md` — Locked Visual Reference Guide
