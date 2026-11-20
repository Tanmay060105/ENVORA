# 01 — Product Requirements Document (PRD)

**Version:** 1.0  
**Project:** Campus Environmental Intelligence System (ENVORA)  
**Type:** Academic Major Project / Prototype  
**Target Platform:** Web Application (HTML/CSS/JS)  
**Edge Hardware:** ESP32 DevKit V1  
**Cloud:** Blynk + ThingSpeak

---

## 1. Product Overview & Vision
An IoT-based environmental monitoring platform designed to observe, analyze, and present campus environmental conditions without requiring manual interpretation of raw sensor telemetry.
**Core Principle:** Visible → Understandable → Comparable → Actionable.

---

## 2. The 5 Environmental Parameters

| Parameter | Sensor | Unit | Description |
|---|---|---|---|
| **Temperature** | BME280 | °C | Ambient thermal state |
| **Humidity** | BME280 | % | Relative atmospheric moisture |
| **Atmospheric Pressure** | BME280 | hPa | Barometric pressure |
| **Gas Response** | MQ-135 | Raw / Index | Relative sensor response to ambient air / gases |
| **Environmental Noise** | INMP441 | dB SPL | Acoustic sound pressure level |

---

## 3. Explicit Non-Goals
- NO particulate matter monitoring (PMS5003, PM1.0, PM2.5, PM4, PM10).
- NO calibrated pollutant concentration or scientific AQI calculations.
- NO medical or regulatory claims.
- NO complex backend infrastructure (FastAPI, PostgreSQL, Redis, Celery, MQTT).

---

## 4. Core Features
1. **Live Monitoring:** Real-time values, sensor availability, and device heartbeat via Blynk REST API.
2. **Historical Analysis:** Parameter switcher, time frames (24H, 7D, 30D, Custom), trend visualization, and aggregates (Avg, Min, Max, Current).
3. **MQ-135 Prediction:** Linear regression ($y = mx + b$) on historical MQ-135 sensor response, next-interval forecast, and RISING / FALLING / STABLE classification.
4. **Environmental Alerts:** Threshold monitoring with Normal, Warning, and Critical classifications. Active and resolved event logs.
5. **Academic Reports:** Presentation-ready summary combining metrics, historical trends, alerts, predictions, and conclusion.
