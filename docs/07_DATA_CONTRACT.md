# Campus Environmental Intelligence System (ENVORA)
## 07 — Authoritative Data Contract & Field Mapping

This document locks the cross-layer field names, data types, units, and ranges across Firmware, Cloud, and Frontend.

---

## 1. Master Mapping Table

| Parameter Key | Hardware Sensor | Firmware Var | ESP32 Type | Blynk Pin | ThingSpeak Field | Web Key | Display Unit | Valid Range | Nominal Range |
|---|---|---|---|---|---|---|---|---|---|
| **temperature** | BME280 | `tempVal` | `float` | `V1` | `field1` | `temperature` | °C | -10.0 to 60.0 | 20.0 to 32.0 |
| **humidity** | BME280 | `humVal` | `float` | `V2` | `field2` | `humidity` | % | 0.0 to 100.0 | 35.0 to 70.0 |
| **pressure** | BME280 | `pressVal` | `float` | `V3` | `field3` | `pressure` | hPa | 800.0 to 1100.0 | 990.0 to 1030.0 |
| **gas_response** | MQ-135 | `mq135Val` | `int` / `float` | `V4` | `field4` | `gas_response` | Raw / Index | 0 to 4095 | 300 to 1200 |
| **noise** | INMP441 | `noiseVal` | `float` | `V5` | `field5` | `noise` | dB SPL | 30.0 to 110.0 | 40.0 to 75.0 |

---

## 2. Default Alert Thresholds

| Parameter | Normal Max | Warning Max | Critical Range | Notes |
|---|---|---|---|---|
| **Temperature** | $\le 32.0\text{ }^\circ\text{C}$ | $32.1 - 38.0\text{ }^\circ\text{C}$ | $> 38.0\text{ }^\circ\text{C}$ | Campus outdoor/indoor thermal threshold |
| **Humidity** | $30.0 - 70.0\%$ | $70.1 - 85.0\%$ | $> 85.0\%$ or $< 20.0\%$ | Comfort and mold risk boundary |
| **Atmospheric Pressure** | $990 - 1025\text{ hPa}$ | $975 - 989\text{ hPa}$ | $< 975\text{ hPa}$ or $> 1035\text{ hPa}$ | Sudden weather shift / storm indicator |
| **MQ-135 Gas Response** | $\le 900$ | $901 - 1500$ | $> 1500$ | Relative index (uncalibrated air response) |
| **Noise** | $\le 65.0\text{ dB}$ | $65.1 - 80.0\text{ dB}$ | $> 80.0\text{ dB}$ | High acoustic disturbance / alarm zone |

---

## 3. JSON Wire Format

### ThingSpeak Feed Record Schema
```json
{
  "created_at": "2026-11-20T10:30:00Z",
  "entry_id": 1420,
  "field1": "26.4",
  "field2": "54.2",
  "field3": "1012.8",
  "field4": "640",
  "field5": "48.5"
}
```

### Internal Frontend Telemetry Record
```json
{
  "timestamp": "2026-11-20T10:30:00Z",
  "temperature": 26.4,
  "humidity": 54.2,
  "pressure": 1012.8,
  "gas_response": 640,
  "noise": 48.5,
  "status": "NORMAL",
  "freshness": "LIVE"
}
```
