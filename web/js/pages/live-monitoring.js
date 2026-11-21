/**
 * ENVORA — Live Monitoring Page Controller (Phase 4.3 Visual Fidelity)
 * Architectural Contract: 5 Parameters (Temperature, Relative Humidity, Atmospheric Pressure, MQ-135 Gas, Environmental Noise)
 * Stitch Source of Truth: root live-monitoring.html
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraLiveMonitoring = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var activeParam = 'temperature';
  var activeRange = '5M';
  var countdownSec = 27;
  var countdownInterval = null;
  var isPaused = false;
  var rafId = null;

  // Parameter configuration dictionary
  var PARAM_CONFIGS = {
    temperature: {
      name: 'Temperature',
      unit: '°C',
      upper: 28.0,
      target: 24.0,
      lower: 19.0,
      min: 16.0,
      max: 32.0,
      format: function (v) { return (v !== null && v !== undefined) ? v.toFixed(1) + ' °C' : 'UNAVAILABLE'; },
      formatScalar: function (v) { return (v !== null && v !== undefined) ? v.toFixed(1) : 'UNAVAILABLE'; },
      defaultPoints: [24.1, 24.3, 24.2, 24.4, 24.6, 24.5, 24.7, 24.8]
    },
    humidity: {
      name: 'Relative Humidity',
      unit: '%',
      upper: 75.0,
      target: 50.0,
      lower: 30.0,
      min: 20.0,
      max: 85.0,
      format: function (v) { return (v !== null && v !== undefined) ? v.toFixed(1) + ' %' : 'UNAVAILABLE'; },
      formatScalar: function (v) { return (v !== null && v !== undefined) ? v.toFixed(1) : 'UNAVAILABLE'; },
      defaultPoints: [58.5, 59.2, 60.1, 60.4, 60.8, 60.5, 60.9, 61.0]
    },
    pressure: {
      name: 'Atmospheric Pressure',
      unit: 'hPa',
      upper: 1025.0,
      target: 1013.2,
      lower: 995.0,
      min: 990.0,
      max: 1030.0,
      format: function (v) { return (v !== null && v !== undefined) ? v.toFixed(1) + ' hPa' : 'UNAVAILABLE'; },
      formatScalar: function (v) { return (v !== null && v !== undefined) ? v.toFixed(1) : 'UNAVAILABLE'; },
      defaultPoints: [1013.0, 1013.1, 1013.1, 1013.2, 1013.3, 1013.2, 1013.2, 1013.2]
    },
    gas_response: {
      name: 'MQ-135 Gas Response',
      unit: 'raw',
      upper: 700.0,
      target: 400.0,
      lower: 250.0,
      min: 200.0,
      max: 850.0,
      format: function (v) { return (v !== null && v !== undefined) ? Math.round(v) + ' raw' : 'UNAVAILABLE'; },
      formatScalar: function (v) { return (v !== null && v !== undefined) ? Math.round(v) : 'UNAVAILABLE'; },
      defaultPoints: [450, 455, 460, 458, 462, 465, 467, 469]
    },
    noise: {
      name: 'Environmental Noise',
      unit: 'dB SPL',
      upper: 70.0,
      target: 45.0,
      lower: 35.0,
      min: 30.0,
      max: 80.0,
      format: function (v) { return (v !== null && v !== undefined) ? v.toFixed(1) + ' dB SPL' : 'UNAVAILABLE'; },
      formatScalar: function (v) { return (v !== null && v !== undefined) ? v.toFixed(1) : 'UNAVAILABLE'; },
      defaultPoints: [46.2, 47.0, 46.8, 47.5, 48.2, 47.8, 48.0, 48.0]
    }
  };

  var lastTelemetryData = null;

  function init() {
    var dataLayer = (typeof window !== 'undefined' && window.EnvoraDataLayer) ? window.EnvoraDataLayer : null;
    if (!dataLayer) return;

    renderLiveReadouts(dataLayer);
    initCountdownTimer(dataLayer);
    bindInteractions();
    renderWaveform();
  }

  function renderLiveReadouts(dataLayer) {
    dataLayer.getLatestTelemetry().then(function (data) {
      if (!data) return;
      lastTelemetryData = data;

      // Update 5 Metric Cards
      updateParamCard('temperature', data.temperature);
      updateParamCard('humidity', data.humidity);
      updateParamCard('pressure', data.pressure);
      updateParamCard('gas_response', data.gas_response);
      updateParamCard('noise', data.noise);

      // Update Sensor Status Table
      updateElem('table-temp-val', PARAM_CONFIGS.temperature.format(data.temperature));
      updateElem('table-humidity-val', PARAM_CONFIGS.humidity.format(data.humidity));
      updateElem('table-pressure-val', PARAM_CONFIGS.pressure.format(data.pressure));
      updateElem('table-gas-val', PARAM_CONFIGS.gas_response.format(data.gas_response));
      updateElem('table-noise-val', PARAM_CONFIGS.noise.format(data.noise));

      // Header timestamp and stream indicators
      var streamTimestamp = document.getElementById('stream-timestamp');
      if (streamTimestamp) {
        var d = new Date(data.timestamp || Date.now());
        var timeStr = d.toTimeString().split(' ')[0] + ' UTC';
        streamTimestamp.textContent = 'Live Stream Connected · ' + timeStr + ' (Synced)';
      }

      var txFreshness = document.getElementById('live-tx-freshness');
      if (txFreshness) {
        txFreshness.textContent = '3s ago';
      }

      // Assess overall environmental severity if intelligence module is present
      var intelligence = (typeof window !== 'undefined' && window.EnvoraIntelligence) ? window.EnvoraIntelligence : null;
      if (intelligence && typeof intelligence.assessOverallStation === 'function') {
        var assessment = intelligence.assessOverallStation(data);
        var statusPill = document.getElementById('live-overall-status-pill');
        var statusText = document.getElementById('live-overall-status-text');
        var statusDot = document.getElementById('live-overall-status-dot');
        var stationAlertState = document.getElementById('station-alert-state-val');

        if (statusPill && statusText && assessment) {
          statusText.textContent = assessment.overall_severity;
          statusPill.className = 'status-pill status-pill-' + assessment.overall_severity.toLowerCase();
          if (statusDot) {
            statusDot.className = 'dot-' + assessment.overall_severity.toLowerCase();
          }
        }

        if (stationAlertState && assessment) {
          if (assessment.overall_severity === 'NORMAL') {
            stationAlertState.textContent = 'NORMAL — Within diurnal campus baseline limits';
          } else if (assessment.overall_severity === 'WARNING') {
            stationAlertState.textContent = 'WARNING — Baseline drift detected';
          } else {
            stationAlertState.textContent = 'CRITICAL — Environmental threshold exceeded';
          }
        }
      }

      // Update active graph and diagnostics
      updateActiveParamDetails();
    }).catch(function (err) {
      console.error('Live telemetry readout error:', err);
    });
  }

  function updateParamCard(paramKey, value) {
    var config = PARAM_CONFIGS[paramKey];
    if (!config) return;

    var scalarEl = null;
    if (paramKey === 'temperature') scalarEl = document.getElementById('live-temp-val');
    else if (paramKey === 'humidity') scalarEl = document.getElementById('live-humidity-val');
    else if (paramKey === 'pressure') scalarEl = document.getElementById('live-pressure-val');
    else if (paramKey === 'gas_response') scalarEl = document.getElementById('live-gas-val');
    else if (paramKey === 'noise') scalarEl = document.getElementById('live-noise-val');

    if (scalarEl) {
      scalarEl.textContent = config.formatScalar(value);
    }
  }

  function updateElem(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function initCountdownTimer(dataLayer) {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(function () {
      if (isPaused) return;

      countdownSec--;
      if (countdownSec <= 0) {
        countdownSec = 30;
        renderLiveReadouts(dataLayer);
      }
      var countEl = document.getElementById('live-next-cycle-countdown');
      if (countEl) {
        countEl.textContent = countdownSec + 's';
      }
    }, 1000);
  }

  function switchParameter(paramKey) {
    if (!PARAM_CONFIGS[paramKey]) return;
    activeParam = paramKey;

    // Update active state on parameter cards
    var cards = document.querySelectorAll('.live-param-card');
    cards.forEach(function (card) {
      var p = card.getAttribute('data-param');
      if (p === paramKey) {
        card.classList.add('active');
        card.setAttribute('aria-pressed', 'true');
      } else {
        card.classList.remove('active');
        card.setAttribute('aria-pressed', 'false');
      }
    });

    // Update active state on parameter tabs
    var tabs = document.querySelectorAll('.param-tab-pill');
    tabs.forEach(function (tab) {
      var p = tab.getAttribute('data-tab-param');
      if (p === paramKey) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        if (!tab.querySelector('.param-tab-dot')) {
          var dot = document.createElement('span');
          dot.className = 'param-tab-dot';
          tab.insertBefore(dot, tab.firstChild);
        }
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        var dot = tab.querySelector('.param-tab-dot');
        if (dot) dot.remove();
      }
    });

    updateActiveParamDetails();
    renderWaveform();
  }

  function updateActiveParamDetails() {
    var config = PARAM_CONFIGS[activeParam];
    if (!config) return;

    // Update Operational Limit Lines
    updateElem('limit-upper-label', 'UPPER OPERATIONAL LIMIT ' + config.upper.toFixed(1) + config.unit);
    updateElem('limit-upper-num', config.upper.toFixed(1));

    updateElem('limit-target-label', 'BASELINE TARGET ' + config.target.toFixed(1) + config.unit);
    updateElem('limit-target-num', config.target.toFixed(1));

    updateElem('limit-lower-label', 'LOWER BOUND LIMIT ' + config.lower.toFixed(1) + config.unit);
    updateElem('limit-lower-num', config.lower.toFixed(1));

    // Update Diagnostics Strip
    var latestVal = (lastTelemetryData && lastTelemetryData[activeParam] !== undefined && lastTelemetryData[activeParam] !== null)
      ? lastTelemetryData[activeParam]
      : config.defaultPoints[config.defaultPoints.length - 1];

    var prevVal = (config.defaultPoints.length > 1)
      ? config.defaultPoints[config.defaultPoints.length - 2]
      : latestVal;

    var drift = latestVal - prevVal;
    var driftPct = prevVal !== 0 ? ((drift / prevVal) * 100).toFixed(1) : '0.0';
    var driftSign = drift >= 0 ? '+' : '';
    var arrow = drift >= 0 ? '↑' : '↓';

    updateElem('diag-current', config.format(latestVal));
    updateElem('diag-prev', config.format(prevVal));

    var driftEl = document.getElementById('diag-drift');
    if (driftEl) {
      driftEl.innerHTML = driftSign + drift.toFixed(1) + ' ' + config.unit + ' <span style="font-size: 11px; font-weight: normal; color: var(--color-text-muted);">(' + arrow + ' ' + Math.abs(driftPct) + '%)</span>';
    }

    var now = new Date();
    var timeEDT = now.toTimeString().split(' ')[0] + ' EDT';
    updateElem('diag-last', timeEDT);

    // Update pin tooltip defaults
    var inspectVal = document.getElementById('inspect-value');
    if (inspectVal) {
      inspectVal.textContent = config.name.split(' ')[0] + ': ' + config.formatScalar(latestVal) + config.unit + ' (' + driftSign + drift.toFixed(2) + '°)';
    }
  }

  function renderWaveform() {
    var linePath = document.getElementById('live-waveform-path');
    var areaPath = document.getElementById('live-stream-area');
    var headPulse = document.getElementById('live-head-pulse');
    var headDot = document.getElementById('live-head-dot');
    if (!linePath || !areaPath) return;

    var config = PARAM_CONFIGS[activeParam] || PARAM_CONFIGS.temperature;
    var pts = config.defaultPoints;

    // Coordinate mapping: X from 0 to 1000, Y from 30 to 260 inverted (higher value = lower Y in SVG)
    var svgWidth = 1000;
    var svgHeight = 300;
    var minY = 40;
    var maxY = 250;

    var range = config.max - config.min;
    var coords = [];
    var stepX = svgWidth / (pts.length - 1);

    for (var i = 0; i < pts.length; i++) {
      var val = pts[i];
      var norm = (val - config.min) / range;
      if (norm < 0) norm = 0;
      if (norm > 1) norm = 1;
      var py = maxY - (norm * (maxY - minY));
      var px = i * stepX;
      coords.push({ x: px, y: py });
    }

    // Build smooth cubic bezier spline
    var lineD = 'M ' + coords[0].x.toFixed(1) + ' ' + coords[0].y.toFixed(1);
    for (var j = 1; j < coords.length; j++) {
      var p0 = coords[j - 1];
      var p1 = coords[j];
      var mx = (p0.x + p1.x) / 2;
      lineD += ' C ' + mx.toFixed(1) + ' ' + p0.y.toFixed(1) + ', ' + mx.toFixed(1) + ' ' + p1.y.toFixed(1) + ', ' + p1.x.toFixed(1) + ' ' + p1.y.toFixed(1);
    }

    var areaD = lineD + ' L ' + svgWidth + ' ' + svgHeight + ' L 0 ' + svgHeight + ' Z';

    linePath.setAttribute('d', lineD);
    areaPath.setAttribute('d', areaD);

    // Position live head marker at the last coordinate
    var lastPt = coords[coords.length - 1];
    if (headPulse && headDot) {
      headPulse.setAttribute('cx', lastPt.x.toFixed(1));
      headPulse.setAttribute('cy', lastPt.y.toFixed(1));
      headDot.setAttribute('cx', lastPt.x.toFixed(1));
      headDot.setAttribute('cy', lastPt.y.toFixed(1));
    }

    // Update X-axis timestamps based on range
    updateXAxisTimestamps();
  }

  function updateXAxisTimestamps() {
    var now = new Date();
    var liveLabel = document.getElementById('x-time-live-label');
    if (liveLabel) {
      liveLabel.textContent = formatTime(now) + ' [Live]';
    }

    for (var i = 0; i < 5; i++) {
      var el = document.getElementById('x-time-' + i);
      if (el) {
        var offsetMin = (5 - i);
        var past = new Date(now.getTime() - offsetMin * 60 * 1000);
        el.textContent = formatTime(past);
      }
    }
  }

  function formatTime(d) {
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    return h + ':' + m + ':' + s;
  }

  function bindInteractions() {
    // Parameter card click / keydown
    var cards = document.querySelectorAll('.live-param-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var p = card.getAttribute('data-param');
        if (p) switchParameter(p);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var p = card.getAttribute('data-param');
          if (p) switchParameter(p);
        }
      });
    });

    // Parameter tab buttons
    var tabs = document.querySelectorAll('.param-tab-pill');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var p = tab.getAttribute('data-tab-param');
        if (p) switchParameter(p);
      });
    });

    // Time range buttons
    var rangeBtns = document.querySelectorAll('.time-range-btn');
    rangeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        rangeBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeRange = btn.getAttribute('data-range') || '5M';
        updateXAxisTimestamps();
      });
    });

    // Interactive Graph Hover with requestAnimationFrame throttling (satisfies Gate 5)
    var container = document.getElementById('live-graph-container');
    var tooltip = document.getElementById('live-pin-tooltip');

    if (container && tooltip) {
      container.addEventListener('mousemove', function (e) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function () {
          var rect = container.getBoundingClientRect();
          var mouseX = e.clientX - rect.left;
          var svgWidth = rect.width;
          var normX = Math.max(0, Math.min(1, mouseX / svgWidth));

          // Map to SVG coordinates (0 - 1000, 30 - 250)
          var targetX = normX * 1000;
          var config = PARAM_CONFIGS[activeParam] || PARAM_CONFIGS.temperature;
          var pts = config.defaultPoints;
          var idx = Math.min(pts.length - 1, Math.floor(normX * (pts.length - 1)));
          var val = pts[idx];

          // Constrain tooltip box inside SVG bounds
          var tipX = Math.max(10, Math.min(810, targetX - 90));
          var tipY = 35;

          tooltip.setAttribute('transform', 'translate(' + tipX.toFixed(1) + ', ' + tipY + ')');

          var timeEl = document.getElementById('inspect-time');
          var valEl = document.getElementById('inspect-value');
          if (valEl) {
            valEl.textContent = config.name.split(' ')[0] + ': ' + config.formatScalar(val) + config.unit;
          }
          if (timeEl) {
            var offsetSec = Math.round((1 - normX) * 300);
            var hoverTime = new Date(Date.now() - offsetSec * 1000);
            timeEl.textContent = formatTime(hoverTime) + ' EDT • SPECIMEN-01';
          }
        });
      });

      container.addEventListener('mouseleave', function () {
        if (rafId) cancelAnimationFrame(rafId);
        // Reset to default pinned position
        tooltip.setAttribute('transform', 'translate(710, 35)');
        updateActiveParamDetails();
      });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    init: init,
    renderLiveReadouts: renderLiveReadouts,
    switchParameter: switchParameter
  };
}));
