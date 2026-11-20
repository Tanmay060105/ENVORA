# Antigravity Operational Contract & System Invariants

This document establishes the inviolable rules of engagement for Antigravity when working on the **Campus Environmental Intelligence System (ENVORA)**.

---

## 1. Architectural Invariants (DO NOT VIOLATE)

1. **Never Change the Locked Architecture**:
   - The architecture is strictly: `Sensors (BME280, MQ-135, INMP441) → ESP32 DevKit V1 → Wi-Fi → Blynk / ThingSpeak → Custom Web App (HTML/CSS/JS)`.
   - Never introduce backend servers, microservices, or databases (NO FastAPI, Flask, Express, Node.js backend, PostgreSQL, MongoDB, Redis, Celery, MQTT, Mosquitto, Docker).

2. **Strict Sensor Scope — NO PM SENSORS**:
   - Exactly five parameters are monitored: Temperature, Humidity, Atmospheric Pressure, MQ-135 Gas Response, Environmental Noise.
   - NEVER introduce PMS5003, PM1.0, PM2.5, PM4, PM10, or AQI calculations/claims.
   - Remove any PM/AQI placeholder text or components originating from initial Stitch mockups.

3. **Stitch Screenshots & Designs are the Visual Source of Truth**:
   - Reproduce the approved Stitch visual language: *Canopy & Commons* (Soft Ivory `#FBF9F2`, Cream `#F7F3E8`, Warm Beige `#E9E0CC`, Olive `#667A3E`, Deep Olive `#3F4D27`, Sage `#9AA77A`, Dark Ink `#292D22`, Muted `#777866`).
   - Do not independently redesign the UI, change color schemes, add gradients, glassmorphism, or modern dark-mode gaming aesthetics.

4. **Prediction Scope & Honesty**:
   - Prediction is strictly JavaScript Linear Regression ($y = mx + b$) on recent historical MQ-135 readings.
   - Never claim the prediction is an AQI forecast or calibrated gas concentration. Label it strictly as **MQ-135 Sensor-Response Prediction**.
   - Show an explicit *insufficient data* state if $< 5$ points exist.

5. **Security & Secrets**:
   - NEVER commit or hardcode private API keys, Wi-Fi passwords, or Blynk tokens in public source code.
   - Use configurable `localStorage` or `.env.example` templates.

---

## 2. Antigravity Workflow & Execution Protocol

1. **Plan First**:
   - Before writing code for any phase, present an explicit, numbered implementation plan.
   - Do not modify multiple unrelated phases at once.

2. **Preserve Existing Functionality**:
   - Never remove or break working features. Refactor surgical slices only.
   - Do not replace working code with temporary placeholder mocks in production files.

3. **Verify Every Step**:
   - Run verification checks, syntax tests, or file audits immediately after edits.
   - Update `PROJECT_STATE.md` upon completing every phase or task.

4. **Handle Missing / Edge Cases Gracefully**:
   - Never fabricate data or silently display `0` when sensor data is missing. Display explicit `UNAVAILABLE`, `STALE`, or `OFFLINE` indicators.
   - Maintain a controlled `DEMO` fallback mode so that demonstrations never fail if campus Wi-Fi drops.

---

## 3. Agent Reporting & Response Length Rules

1. **Mandatory Hard Response Limits**:
   - **Implementation plans**: **800–1,500 words maximum**
   - **Implementation reports**: **500–1,000 words maximum**
   - **Verification reports**: **500–1,000 words maximum**
   - **Blocker, security, or critical-failure reports**: No artificial length limit when additional detail is genuinely required.
   - These are hard targets for the chat response. Never split a single report into multiple chat messages unless explicitly requested.

2. **Protocol When Information Exceeds the Limit**:
   Do NOT exceed the limit simply because the report contains more detail:
   1. Summarize the result concisely.
   2. Keep only decision-relevant technical details in the chat response.
   3. Offload extensive technical details into the appropriate Markdown document under `docs/`.
   4. Reference the document in the concise chat response.
   5. Never split one report into multiple chat messages unless explicitly requested.

3. **Required Concise Report Structure (Implementation & Verification)**:
   Prioritize:
   1. Status
   2. What was implemented
   3. Files changed
   4. Verification performed
   5. Failures and fixes
   6. Important deviations, if any
   7. Next action

4. **Reporting Constraints (What NOT to Do)**:
   - Do not reproduce the implementation plan in the final report.
   - Do not paste source code.
   - Do not repeat information already present in `docs/`, `PROJECT_STATE.md`, or `AGENTS.md`.
   - Do not provide long explanations of unchanged architecture.
   - Do not write unnecessary narrative or conversational filler.
   - Do not repeat verification results.
   - Do not make reports longer merely to appear comprehensive.

5. **Preservation of Full Engineering Rigor**:
   - Reporting limits apply **ONLY to the agent's written report in the chat response**.
   - They must **NEVER** reduce or compromise:
     - Repository inspection depth
     - Complete implementation work
     - Full testing and verification
     - Debugging and investigation depth
     - Documentation updates
     - Source-code changes
   - Antigravity must perform the complete task even when the final report is short.
   - Antigravity must continue to:
     - Inspect all relevant project files and documentation.
     - Follow the complete approved implementation plan.
     - Perform all required verification.
     - Fix discovered failures.
     - Re-run verification after fixes.
     - Report failures honestly.
     - Update `PROJECT_STATE.md` only after successful verification.

6. **Pre-Send Self-Enforcement**:
   - Before sending an implementation plan or report, internally check that the response is within the required word count range.
   - If the report is too long, compress it before sending.
   - Do not send an oversized report and expect the user to divide it manually.

7. **Mandatory Engineering Workflow**:
   ```
   Implement → Verify → Fix → Verify Again → All Checks Pass → Update PROJECT_STATE.md → Report Status
   ```

8. **Mandatory Status Markers**:
   Every final report must end with exactly one applicable status marker:
   - `STATUS: PLAN_READY`
   - `STATUS: IMPLEMENTATION_COMPLETE`
   - `STATUS: VERIFICATION_PASSED`
   - `STATUS: BLOCKED`
