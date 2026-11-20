# 14 — Demonstration Scenario & Evaluator Script

This document provides the chronological demonstration procedure and verbal speaking points for college major project evaluation.

---

## 1. Demonstration Flowchart

```text
1. Station Power-On ──► 2. Sensor & LCD Inspection ──► 3. Blynk Live Verification
                                                                │
                                                                ▼
6. Reports Generation ◄── 5. Alert Trigger Demo ◄── 4. Web Application Walkthrough
                                                          (Dash → Live → Hist → Pred)
```

---

## 2. Step-by-Step Presentation Script

### Stage 1: Physical Station & Sensor Walkthrough (2 minutes)
- **Action:** Power the ESP32. Show LCD initial boot screen.
- **Speaking Point:** *"Good morning faculty members. This is ENVORA, our Campus Environmental Intelligence System. We are sensing five environmental parameters: Temperature, Humidity, and Pressure via the BME280 sensor; ambient Gas Response via the MQ-135; and Environmental Acoustic Noise in decibels via the INMP441 I2S microphone."*
- **Visuals:** Point to LCD displaying live numbers and Green LED (Normal state).

### Stage 2: Cloud Telemetry (1 minute)
- **Action:** Open Blynk app/dashboard and ThingSpeak channel on a tablet/laptop.
- **Speaking Point:** *"The ESP32 processes sensor samples and pushes real-time telemetry to Blynk every 2 seconds, while transmitting timestamped time-series records to ThingSpeak for historical storage."*

### Stage 3: Web Dashboard & Live Monitoring (3 minutes)
- **Action:** Open `dashboard.html`.
- **Speaking Point:** *"Our custom web application is built on the Canopy & Commons design system, using calm, academic visual hierarchy. Notice our overall Environmental State is NORMAL, and all five parameters are shown with their live status. When we navigate to Live Monitoring, we observe live telemetry arriving smoothly, alongside station connectivity status."*

### Stage 4: Historical Analysis Workspace (2 minutes)
- **Action:** Open `historical-analysis.html`. Switch from Temperature to Gas Response, and change window to 7 Days.
- **Speaking Point:** *"Here we inspect environmental trends across selectable time windows. The system dynamically computes the Average, Minimum, Maximum, and Current readings directly from cloud time-series feeds."*

### Stage 5: Explainable MQ-135 Prediction (3 minutes)
- **Action:** Open `prediction.html`.
- **Speaking Point:** *"A key highlight of our project is explainable trend prediction for the MQ-135 sensor response. We apply ordinary least squares linear regression over recent historical intervals. The algorithm computes the mathematical slope and projects the next interval forecast. The slope classifies whether sensor response is RISING, FALLING, or STABLE. Notice we explicitly treat this as sensor-response trend prediction rather than claiming uncalibrated AQI."*

### Stage 6: Environmental Alert Trigger (2 minutes)
- **Action:** Generate brief loud sound (clap/whistle) near INMP441, or gently introduce gas near MQ-135.
- **Speaking Point:** *"Notice the reading crossed the configured threshold. Immediately, the hardware Red LED triggers, the buzzer alerts, and on the Alerts screen, an active event is logged with severity, timestamp, and threshold value. Once conditions normalize, the event transitions to the resolved audit history."*

### Stage 7: Presentation-Ready Environmental Report (1 minute)
- **Action:** Open `reports.html` and click **Export Report / Print**.
- **Speaking Point:** *"Finally, the system compiles a complete academic environmental summary report combining metrics, historical graphs, alert records, and prediction findings into a presentation-ready format."*
