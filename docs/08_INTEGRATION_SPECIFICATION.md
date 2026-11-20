# Campus Environmental Intelligence System (ENVORA)
## 08 — Integration Specification (ThingSpeak & Blynk)

This document specifies the exact protocols, REST API endpoints, rate limits, query parameters, and error handling for ThingSpeak and Blynk.

---

## 1. ThingSpeak REST API Integration

### 1.1 Read Channel Feeds (Historical Data)
- **Base URL:** `https://api.thingspeak.com/channels/{CHANNEL_ID}/feeds.json`
- **HTTP Method:** `GET`
- **Query Parameters:**
  - `api_key`: ThingSpeak Read API Key (optional for public channels).
  - `results`: Number of entries to retrieve (e.g. `results=60` for fast charts, max `8000`).
  - `minutes`: Historical time window in minutes (e.g. `minutes=1440` for 24 hours).
  - `round`: Decimal places to round numbers (default `2`).
- **Example Call:**
  `https://api.thingspeak.com/channels/1234567/feeds.json?results=100`

### 1.2 Rate Limits & Constraints
- ThingSpeak free tier: **15-second update interval** per channel.
- Frontend queries: Cache results in memory for **15 seconds** to prevent hitting client-side rate limits or throttling.

---

## 2. Blynk REST API Integration

### 2.1 Get Live Pin Values
- **Base URL:** `https://blynk.cloud/external/api/get`
- **HTTP Method:** `GET`
- **Query Parameters:**
  - `token`: Blynk Auth Token.
  - `v1`, `v2`, `v3`, `v4`, `v5`: Virtual pins.
- **Example Call:**
  `https://blynk.cloud/external/api/get?token=YOUR_TOKEN&v1&v2&v3&v4&v5`

### 2.2 Device Online Status
- **Endpoint:** `https://blynk.cloud/external/api/isHardwareConnected?token=YOUR_TOKEN`
- **Returns:** `true` (ONLINE) or `false` (OFFLINE).

---

## 3. Client-Side Data Layer Architecture (`web/js/data-layer.js`)

```text
       UI Request (e.g. getHistoricalData)
                       │
                       ▼
          Data Layer Cache Valid (<15s)?
               ├── Yes ──► Return In-Memory Cache
               └── No
                       │
                       ▼
          Is LIVE Mode & Keys Configured?
               ├── Yes ──► Fetch ThingSpeak / Blynk REST API
               │                │
               │         Success?
               │           ├── Yes ──► Normalize & Cache Feeds
               │           └── No  ──► Fallback to Cached / DEMO + Warning
               │
               └── No  ──► Generate Realistic DEMO Telemetry Stream
```

---

## 4. Normalization Rules
1. Strip non-numeric artifacts: `parseFloat(feed.field1)` with `isNaN` check.
2. If a specific field is `null`, mark that parameter as `UNAVAILABLE` rather than replacing with `0`.
3. ISO 8601 timestamps parsed via `new Date(feed.created_at)`.
