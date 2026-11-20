/**
 * ENVORA — Live Monitoring Page Controller
 * Source of Truth: Approved Phase 1 Implementation Plan & docs/16_VISUAL_REFERENCE_GUIDE.md
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraLiveMonitoring = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var isPaused = false;
  var currentCadence = 10; // seconds

  function init() {
    var dataLayer = (typeof window !== 'undefined' && window.EnvoraDataLayer) ? window.EnvoraDataLayer : null;
    if (!dataLayer) return;

    renderLiveReadouts(dataLayer);
    renderWaveform();
    bindControls();
  }

  function renderLiveReadouts(dataLayer) {
    dataLayer.getLatestTelemetry().then(function (data) {
      if (!data) return;

      updateElem('live-temp-val', data.temperature !== undefined && data.temperature !== null ? data.temperature.toFixed(1) : 'UNAVAILABLE');
      updateElem('live-humidity-val', data.humidity !== undefined && data.humidity !== null ? data.humidity.toFixed(1) : 'UNAVAILABLE');
      updateElem('live-pressure-val', data.pressure !== undefined && data.pressure !== null ? data.pressure.toFixed(1) : 'UNAVAILABLE');
      updateElem('live-gas-val', data.gas_response !== undefined && data.gas_response !== null ? Math.round(data.gas_response) : 'UNAVAILABLE');
      updateElem('live-noise-val', data.noise !== undefined && data.noise !== null ? data.noise.toFixed(1) : 'UNAVAILABLE');

      var streamTimestamp = document.getElementById('stream-timestamp');
      if (streamTimestamp) {
        var d = new Date(data.timestamp);
        streamTimestamp.textContent = d.toTimeString().split(' ')[0] + ' UTC (Synced)';
      }
    }).catch(function (err) {
      console.error('Live telemetry readout error:', err);
    });
  }

  function updateElem(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderWaveform() {
    var pathEl = document.getElementById('live-waveform-path');
    if (!pathEl) return;

    // Deterministic incoming telemetry waveform entering from right margin
    var pts = [
      {x: 0, y: 150}, {x: 80, y: 145}, {x: 160, y: 160}, {x: 240, y: 130},
      {x: 320, y: 140}, {x: 400, y: 110}, {x: 480, y: 125}, {x: 560, y: 95},
      {x: 640, y: 115}, {x: 720, y: 80}, {x: 800, y: 100}, {x: 880, y: 70},
      {x: 960, y: 85}, {x: 1000, y: 65}
    ];

    var d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var prev = pts[i - 1];
      var curr = pts[i];
      var mx = (prev.x + curr.x) / 2;
      d += ' C ' + mx + ' ' + prev.y + ', ' + mx + ' ' + curr.y + ', ' + curr.x + ' ' + curr.y;
    }
    pathEl.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    pathEl.setAttribute('d', d);
  }

  function bindControls() {
    var pauseBtn = document.getElementById('btn-stream-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Resume Stream' : 'Pause Stream';
        var indicator = document.getElementById('stream-status-pill');
        if (indicator) {
          indicator.textContent = isPaused ? 'PAUSED' : 'ACTIVE STREAM';
        }
      });
    }

    var cadenceBtns = document.querySelectorAll('[data-cadence-btn]');
    cadenceBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        cadenceBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentCadence = parseInt(btn.getAttribute('data-cadence-btn'), 10) || 10;
        var label = document.getElementById('stream-cadence-label');
        if (label) label.textContent = currentCadence + 's Sampling';
      });
    });
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
    renderLiveReadouts: renderLiveReadouts
  };
}));
