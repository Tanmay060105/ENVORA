# Campus Environmental Intelligence System (ENVORA)
## 05 — Development Plan

**Version:** 1.0  
**Strategy:** Dependency-driven, phase-by-phase delivery  
**Milestones:** M0 through M12

---

## 1. Roadmap Summary

```text
Phase 0: Project Setup, Documentation & Architecture Locking
Phase 1: Hardware & Firmware Foundation (ESP32 Sensor Loop)
Phase 2: Blynk Live Monitoring Integration
Phase 3: ThingSpeak Historical Time-Series Pipeline
Phase 4: Frontend Foundation, Component Shell & Public Landing Page (index.html)
Phase 5: Dashboard & Live Monitoring Implementation
Phase 6: Historical Analysis Workspace & Statistical Engine
Phase 7: MQ-135 Prediction Engine (Linear Regression)
Phase 8: Environmental Alert System & Event Log
Phase 9: Presentation-Ready Reports Engine
Phase 10: Full System Integration
Phase 11: Comprehensive Functional & Failure Testing
Phase 12: Deployment & Campus Demo Hardening
```

---

## 2. Strict Delivery Invariants
- Each phase must be verified and closed before dependent phases are built.
- Prediction ($y = mx + b$) is implemented only after ThingSpeak historical data is populated.
- No PM2.5 or AQI features will be permitted at any stage.
