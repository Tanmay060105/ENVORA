# Campus Environmental Intelligence System (ENVORA)
## 12 — Environment & Configuration Specification

This document specifies credential security, environment configurations, and configuration storage rules.

---

## 1. Secrets & Credential Policy
- **ZERO Hardcoded Secrets:** Wi-Fi SSID, Wi-Fi password, Blynk Auth Tokens, and ThingSpeak Write Keys must NEVER be committed to Git.
- **Configuration Templates:** Store placeholders in `.env.example` and `config.example.h`.

---

## 2. Configuration Storage Layers

### 2.1 Hardware / Firmware Layer (`firmware/config.h`)
```cpp
// Example firmware config template
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASS "YOUR_WIFI_PASS"

#define BLYNK_TEMPLATE_ID "TMPLxxxxxx"
#define BLYNK_DEVICE_NAME "Campus Environmental Station"
#define BLYNK_AUTH_TOKEN  "YOUR_BLYNK_TOKEN"

#define THINGSPEAK_CHANNEL_ID 0000000
#define THINGSPEAK_WRITE_API_KEY "YOUR_WRITE_KEY"
```

### 2.2 Web Application Layer (`localStorage`)
The frontend provides a lightweight **Settings Modal** (accessible via a subtle gear icon in navigation footer) allowing students/evaluators to configure credentials directly in browser storage:
- `thingspeak_channel_id`: ThingSpeak Channel ID (e.g. `1234567`)
- `thingspeak_read_key`: ThingSpeak Read API Key (optional for public channels)
- `blynk_auth_token`: Blynk REST Auth Token
- `telemetry_poll_interval_sec`: Polling rate (default: `15s`)
- `prediction_window_size`: Number of points for linear regression (default: `20`)
- `demo_mode`: Boolean flag (`true` / `false`)
