# Campus Environmental Intelligence System (ENVORA)
## 13 — Deployment & Hardware Handover Guide

This document provides a step-by-step setup guide for college project teams, demonstrators, and lab evaluators.

---

## 1. Hardware Assembly Checklist
1. Mount ESP32 DevKit V1 onto central breadboard.
2. Wire **BME280** to I2C bus:
   - VCC → 3.3V, GND → GND, SDA → GPIO 21, SCL → GPIO 22.
3. Wire **I2C LCD Display**:
   - VCC → 5V (or 3.3V), GND → GND, SDA → GPIO 21, SCL → GPIO 22.
4. Wire **MQ-135**:
   - VCC → 5V (heater requires 5V), GND → GND, AOUT → GPIO 34 (ADC1).
5. Wire **INMP441**:
   - VDD → 3.3V, GND → GND, L/R → GND, SCK → GPIO 14, WS → GPIO 15, SD → GPIO 32.
6. Wire **LEDs & Buzzer**:
   - Green LED → GPIO 25 (via 220Ω resistor).
   - Red LED → GPIO 26 (via 220Ω resistor).
   - Buzzer → GPIO 27.
7. Connect 5V 2A DC power supply via Micro-USB or Vin pin.

---

## 2. Firmware Flashing Procedure
1. Open **Arduino IDE**.
2. Install ESP32 Board Support:
   - *Boards Manager* → Search `esp32` by Espressif Systems → Install.
3. Install Required Libraries:
   - `Adafruit BME280 Library` & `Adafruit Unified Sensor`
   - `LiquidCrystal_I2C`
   - `Blynk` (by Volodymyr Shymanskyy)
   - `ThingSpeak` (by MathWorks)
4. Open `firmware/firmware.ino`.
5. Enter Wi-Fi credentials and Cloud tokens in `config.h`.
6. Select Board: **DOIT ESP32 DEVKIT V1**, Port: COMx.
7. Click **Upload** and verify serial monitor output at 115200 baud.

---

## 3. Web Application Deployment
1. The custom web application is 100% static (HTML/CSS/JS).
2. It can be hosted on **GitHub Pages**, **Netlify**, **Vercel**, or served locally via Python HTTP server or direct file browser opening.
3. No database, Docker, or Node.js runtime is required on the host server.
