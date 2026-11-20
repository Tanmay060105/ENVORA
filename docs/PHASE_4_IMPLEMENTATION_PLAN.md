# ENVORA Phase 4 Implementation Plan — UX, Interaction & Polish

**Document Version:** 1.0.0  
**Phase:** Phase 4 — UX, Interaction & Polish  
**Author:** Antigravity System Agent  
**Date:** 2026-11-21  
**Status:** DRAFT FOR APPROVAL  

---

## 1. Phase Objective
Phase 4 refines the user experience, motion design, interactive tactile feedback, responsive behavior, accessibility, and rendering performance of the completed ENVORA application across all six production pages. All improvements preserve the approved *Canopy & Commons* design tokens, Stitch visual language, and the strict five-parameter contract without introducing backend services, third-party frameworks, or altering verified Phase 3 intelligence logic.

---

## 2. Current UX Observations
- **Visual Foundation**: Strong, verified *Canopy & Commons* color palette and typography.
- **Transitions**: Page loading, parameter selection, and range changes occur abruptly without smooth communicative transitions.
- **Chart Feedback**: SVG charts render statically; hover tooltips are either basic or missing on several pages (Historical Analysis and Prediction).
- **Interactive Feedback**: Buttons and segmented controls lack active/pressed tactile depression states; focus rings rely on default browser outlines.
- **Waveform Animation**: Live Monitoring waveform lacks fluid incoming telemetry animation from the right edge.
- **Prediction Reveal**: Prediction projection renders all line segments simultaneously rather than revealing the forecast progression in a staged, explainable sequence.
- **Print Layout**: Reports page print layout requires pagination safeguards and print-specific high-contrast styling.

---

## 3. UX Problems to Solve
1. **Abrupt Parameter & Range Swapping**: When changing parameters in Historical Analysis or time ranges on the Dashboard, data paths snap instantaneously.
2. **Missing Chart Tooltips**: Historical Analysis and Prediction lack precise tooltip pips showing exact timestamp, parameter value, and unit on hover.
3. **Accessibility & Focus Visibility**: Insufficient visual affordances for keyboard navigators (`:focus-visible`), missing ARIA live regions for streaming data.
4. **Motion Restraint**: Ensure animations adhere strictly to documented timings and respect `prefers-reduced-motion`.
5. **DOM Thrashing on Hover**: Mousemove event listeners on SVG charts lack frame throttling via `requestAnimationFrame`.

---

## 4. Proposed Interaction Improvements
- **Tactile Button Press States**: Subtle transform `translateY(1px)` and box-shadow reduction on `:active` for buttons and segmented controls.
- **Accessible Focus Rings**: 2px solid `var(--color-primary)` focus outline with 2px offset (`outline-offset: 2px`) for keyboard tab navigation.
- **Unified SVG Interactive Tooltip System**: Shared, lightweight hover inspector rendering a crosshair guideline, highlighted data pip, and floating tooltip pill (`font-telemetry`, 100–200ms ease-out).
- **Degraded Status Indicator Tooltip**: Explains missing sensors (e.g., `4/5 Active — Pressure sensor stream offline`) on hover over `DEGRADED` badge.
- **Alert Row Interactive States**: Subtle background tint on table row hover; tactile state transition when acknowledging alerts.

---

## 5. Motion Strategy & Timings
Strictly aligned with `docs/04_UI_UX_SPECIFICATION.md` Section 3:
- **Telemetry Entrance**: `500ms – 700ms` cubic-bezier(0.16, 1, 0.3, 1) for live waveform shift from right.
- **Parameter & Range Switching**: `400ms – 600ms` opacity/path transition for historical graphs.
- **Interactive Tooltip Reveal**: `100ms – 200ms` ease-out.
- **Prediction Projection Reveal**: `700ms – 1000ms` staggered dash-offset draw for the forecast line entering the shaded zone.
- **Graph Entrance**: `400ms – 600ms` subtle fade-and-rise entrance on initial page mount.
- **Accessibility Safeguard**: `@media (prefers-reduced-motion: reduce)` immediately clamps all transition/animation durations to `0ms`.

---

## 6. Page-by-Page Changes

### 6.1 Dashboard (`dashboard.html` / `dashboard.js`)
- Add smooth entrance transition to the Environmental Flow curve (`400–600ms`).
- Throttle mousemove tooltip tracking via `requestAnimationFrame`.
- Enhance the `COMPLETE` / `DEGRADED` indicator with contextual tooltip explaining active sensor count.
- Add hover elevation (`translateY(-2px)`) to metric cards with subtle shadow.

### 6.2 Live Monitoring (`live-monitoring.html` / `live-monitoring.js`)
- Animate telemetry waveform SVG entering from the right margin (`500–700ms` cycle).
- Provide immediate tactile feedback when pausing/resuming stream (`Pause Stream` vs `Resume Stream`).
- Add visual pulse effect to active sensor node cards in the diagnostics grid.

### 6.3 Historical Analysis (`historical-analysis.html` / `historical-analysis.js`)
- Add smooth morph/crossfade transition (`400–600ms`) when switching between the 5 parameters.
- Implement interactive SVG crosshair and tooltip showing timestamp, exact value, unit, and threshold status.
- Highlight active threshold boundary zones on hover.

### 6.4 Prediction (`prediction.html` / `prediction.js`)
- Staggered animation: Observed points fade in, regression trendline draws (`400ms`), and dashed forecast projects into shaded target zone (`700–1000ms`).
- Interactive hover tooltips on historical pips and forecast target pip.
- Refined *Insufficient Data* empty-state card with clear diagnostic explanation.

### 6.5 Alerts (`alerts.html` / `alerts.js`)
- Enhanced row hover states in the event audit table.
- Smooth filter transitions (`ALL`, `WARNING`, `CRITICAL`) using opacity crossfades.
- Clear visual transition when acknowledging active alarms (`Cleared` state with disabled styling).

### 6.6 Reports (`reports.html` / `reports.js`)
- Professional print stylesheet (`@media print`) enhancements: forced monochrome high-contrast borders, page-break avoidance (`page-break-inside: avoid`), and clean academic evaluation header.
- Interactive table row highlight for presentation review.

---

## 7. Accessibility Improvements
- Ensure all interactive elements have visible `:focus-visible` outlines matching *Canopy & Commons* tokens.
- Add `aria-live="polite"` on real-time telemetry regions.
- Ensure minimum contrast ratio of 4.5:1 across all typography and state badges.
- Provide comprehensive `@media (prefers-reduced-motion: reduce)` rules.

---

## 8. Performance Improvements
- Wrap all chart mousemove tracking in `requestAnimationFrame` to eliminate layout thrashing.
- Debounce window resize recalculations for SVG viewports (150ms).
- Avoid unnecessary DOM rewrites during polling cycles; only update changed text nodes.

---

## 9. Responsive Behavior
- Maintain Stitch desktop-first layout with clean collapsing behavior at `1024px` and `768px`.
- Metric grids transition from 5-column layout to fluid multi-column grid (`repeat(auto-fit, minmax(200px, 1fr))`).
- Persistent navigation collapses cleanly to responsive mobile drawer/header while preserving route access.

---

## 10. File Inventory
- **Files to Modify**:
  - `web/css/style.css` (interactions, motion timings, focus styles, tooltips, print rules)
  - `web/js/app-shell.js` (navigation focus, active states)
  - `web/js/pages/dashboard.js` (chart entrance, tooltip throttling)
  - `web/js/pages/live-monitoring.js` (waveform animation, pause/resume feedback)
  - `web/js/pages/historical-analysis.js` (chart transition, crosshair tooltips)
  - `web/js/pages/prediction.js` (staggered forecast projection, tooltips)
  - `web/js/pages/alerts.js` (button feedback, row states)
  - `web/js/pages/reports.js` (print layout styling hooks)
- **Files Created**:
  - `scratch/verify_phase4.ps1` (Phase 4 automated verification suite)
- **Protected Files**:
  - Root prototypes (`dashboard.html`, etc.)
  - `web/js/data-layer.js`
  - `web/js/intelligence.js`
  - `web/css/tokens.css`

---

## 11. Regression Risks & Verification Strategy
- **Risk**: Animation causing sluggishness on lower-end devices $\implies$ *Mitigation*: CSS hardware-accelerated transforms (`transform`, `opacity`) only.
- **Risk**: Chart transitions interfering with data accuracy $\implies$ *Mitigation*: Transitions animate presentation layers only; underlying calculations remain pure.
- **Verification**: Syntax checks, automated test suites (Phase 1, 2, 2.1, 3, 4), HTTP 200 route probes, zero PM/AQI regex scans, and print CSS audits.
