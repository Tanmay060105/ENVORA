# Campus Environmental Intelligence System (ENVORA)
## 10 — Error Handling & Resilience Specification

This document details error states, degradation policies, and recovery actions across hardware, network, cloud, and frontend layers.

---

## 1. System Failure Matrix

| Failure Mode | Trigger / Condition | System Impact | UI Representation | Recovery Action |
|---|---|---|---|---|
| **ESP32 Offline** | No data received for $> 5$ minutes | Live telemetry stops | Freshness badge shifts to `OFFLINE` (Muted Amber). Last valid time displayed. | Device auto-retries Wi-Fi loop; UI polls Blynk heartbeat. |
| **Wi-Fi Drop at College** | ESP32 loses AP connection | Cloud updates paused | Web app displays `STALE` or offers seamless switch to `DEMO MODE`. | ESP32 executes non-blocking reconnection loop. |
| **ThingSpeak API Down / Rate-Limited** | HTTP 429 or 5xx from ThingSpeak | Historical charts cannot fetch new points | Chart container displays: *"Cloud storage temporarily unreachable. Showing cached records."* | Exponential backoff (15s, 30s, 60s). Existing cached points preserved. |
| **Partial Sensor Failure (e.g. BME280 disconnected)** | I2C read error on BME280 | Temp, Humidity, Pressure missing | Affected cards show `UNAVAILABLE` (`--.-`). MQ-135 and Noise cards continue updating! | Firmware isolates bus error without crashing sensor loop. |
| **Insufficient Prediction Data** | $< 5$ historical MQ-135 records | Linear regression mathematically invalid | Prediction panel displays: *"Insufficient historical data to compute regression slope. Minimum 5 readings required."* | Automatically resolves once 5 timestamped records accumulate. |
| **Threshold Rapid Oscillation** | Sensor reading fluctuates around boundary | Potential alert spam | Debounce rule: Sensor must remain in new threshold zone for $\ge 3$ consecutive readings before firing new event. | Prevents buzzer oscillation and alert table spamming. |

---

## 2. Controlled DEMO Mode (Campus Resilience)
- **Toggle Location:** Subtle toggle in navigation footer: `[Mode: LIVE / DEMO]`.
- **Purpose:** Protects students during academic project demonstrations if college Wi-Fi is disabled, secured behind a captive portal, or drops.
- **Behavior:** Generates authentic, physics-constrained environmental data matching the exact 5 parameters and triggers genuine linear regression calculations.
- **Honesty Rule:** Whenever DEMO mode is active, a clear tag `DEMO MODE ACTIVE` is shown in the footer so evaluators understand the simulation context.
