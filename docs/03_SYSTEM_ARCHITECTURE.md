# Campus Environmental Intelligence System (ENVORA)
## 03 — System Architecture Document

**Version:** 1.0  
**Status:** Locked MVP Architecture  
**Hardware Controller:** ESP32 DevKit V1  
**Cloud Layers:** Blynk (Live Monitoring), ThingSpeak (Historical Storage)  
**Frontend Layer:** Custom HTML / CSS / JavaScript Web Application

---

## 1. System Architecture Diagram

```text
┌───────────────────────────────────────────────┐
│              CAMPUS ENVIRONMENT               │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│               SENSING MODULES                 │
│  - BME280   : Temperature, Humidity, Pressure │
│  - MQ-135   : Gas Response (Analog / Ratio)   │
│  - INMP441  : Noise / Sound Level (I2S dB)    │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│               ESP32 DEVKIT V1                 │
│  - Sensor Acquisition & Moving Average        │
│  - I2C 16x2 / 20x4 LCD Output                 │
│  - Green LED (Normal), Red LED (Alert)        │
│  - Active Buzzer (Alarm)                      │
│  - Wi-Fi Station Mode & Auto-Reconnect        │
└───────────────┬───────────────────────────────┘
                │
                ▼ Wi-Fi (HTTPS/TLS)
        ┌───────┴───────┐
        ▼               ▼
┌───────────────┐ ┌───────────────────────────┐
│     BLYNK     │ │        THINGSPEAK         │
│ Live Readings │ │ Time-Series Database      │
│ Device Heart  │ │ Field 1: Temp             │
│ Beat Status   │ │ Field 2: Humidity         │
│               │ │ Field 3: Pressure         │
│               │ │ Field 4: MQ-135 Response  │
│               │ │ Field 5: Noise (dB)       │
└───────┬───────┘ └─────────────┬─────────────┘
        │                       │
        └───────────┬───────────┘
                    │ REST APIs / JSON
                    ▼
┌───────────────────────────────────────────────┐
│            CUSTOM WEB APPLICATION             │
│  - Client-side Data Access Layer              │
│  - Real-time Blynk Poller                     │
│  - ThingSpeak Historical Time-Series Feeds    │
│  - Linear Regression Engine (y = mx + b)      │
│  - Threshold Alert & Anti-Bounce Engine       │
│  - Offline / Demo Fallback Simulation Engine  │
│                                               │
│  6 Screens (Canopy & Commons Aesthetic):      │
│   1. Dashboard                                │
│   2. Live Monitoring                          │
│   3. Historical Analysis                      │
│   4. Prediction                               │
│   5. Alerts                                   │
│   6. Reports                                  │
└───────────────────────────────────────────────┘
```

---

## 2. Hardware Pinout & Bus Mapping

| Sensor / Module | Interface | ESP32 Pin Mapping | Notes |
|---|---|---|---|
| **BME280** | I2C | SDA → GPIO 21, SCL → GPIO 22 | Address 0x76 or 0x77 (3.3V) |
| **I2C LCD** | I2C | SDA → GPIO 21, SCL → GPIO 22 | Address 0x27 or 0x3F (5V or 3.3V) |
| **MQ-135** | Analog ADC | AOUT → GPIO 34 (ADC1_CH6) | Requires 5V VCC, 3.3V ADC safe |
| **INMP441** | I2S Digital | SCK → GPIO 14, WS → GPIO 15, SD → GPIO 32 | L/R to GND (Left channel) |
| **Green LED** | Digital Out | GPIO 25 (via 220Ω resistor) | Normal status indicator |
| **Red LED** | Digital Out | GPIO 26 (via 220Ω resistor) | Warning/Critical indicator |
| **Buzzer** | Digital Out | GPIO 27 | Active 5V/3.3V Buzzer |
