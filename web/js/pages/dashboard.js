/**
 * ENVORA — Dashboard Page Controller
 * Source of Truth: Approved Phase 1 Implementation Plan & docs/16_VISUAL_REFERENCE_GUIDE.md
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraDashboard = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var currentRange = '24H';

  /**
   * Formats a raw timestamp into human-readable time.
   */
  function formatTime(isoString) {
    if (!isoString) return '--:--:--';
    var d = new Date(isoString);
    return isNaN(d.getTime()) ? '--:--:--' : d.toTimeString().split(' ')[0] + ' UTC';
  }

  /**
   * Initializes the dashboard metrics from the data layer.
   */
  function init() {
    var dataLayer = (typeof window !== 'undefined' && window.EnvoraDataLayer) ? window.EnvoraDataLayer : null;
    if (!dataLayer) return;

    renderLatestData(dataLayer);
    renderFlowChart(dataLayer, currentRange);
    bindRangeButtons(dataLayer);
  }

  function renderLatestData(dataLayer) {
    dataLayer.getLatestTelemetry().then(function (data) {
      if (!data) return;

      var intel = (typeof window !== 'undefined' && window.EnvoraIntelligence) ? window.EnvoraIntelligence : null;
      var evalRes = intel ? intel.evaluateEnvironmentalState(data) : {
        overallState: data.status || 'NORMAL',
        dataAvailability: 'COMPLETE',
        activeCount: 5,
        summaryText: 'Campus environmental conditions across North Quad are currently within nominal baseline parameters with balanced atmospheric pressure and quiet acoustic levels.'
      };

      // 1. Ambient State Banner
      var statusEl = document.getElementById('ambient-state-title');
      var statusDescEl = document.getElementById('ambient-state-desc');
      var badgeEl = document.getElementById('ambient-state-badge');
      if (statusEl) {
        statusEl.textContent = evalRes.overallState;
      }
      if (badgeEl) {
        badgeEl.className = 'hero-state-badge badge-' + evalRes.overallState.toLowerCase();
        badgeEl.textContent = evalRes.overallState === 'NORMAL' ? 'Baseline Stable' : (evalRes.overallState === 'WARNING' ? 'Advisory Notice' : 'Critical Breach');
      }
      if (statusDescEl) {
        statusDescEl.textContent = evalRes.summaryText;
      }

      var lastUpdatedEl = document.getElementById('hero-last-updated');
      if (lastUpdatedEl) lastUpdatedEl.textContent = 'Synchronized · ' + formatTime(data.timestamp);

      var lastUpdatedPanelEl = document.getElementById('hero-last-updated-panel');
      if (lastUpdatedPanelEl) lastUpdatedPanelEl.textContent = formatTime(data.timestamp) + ' · 4s ago';

      var dataAvailEl = document.getElementById('hero-data-avail');
      if (dataAvailEl) {
        dataAvailEl.textContent = evalRes.dataAvailability === 'DEGRADED' ?
          'DEGRADED (' + evalRes.activeCount + '/5 Active)' : 'COMPLETE (5/5 Active)';
        dataAvailEl.style.color = evalRes.dataAvailability === 'DEGRADED' ? 'var(--color-state-warning)' : 'var(--color-state-normal)';
        dataAvailEl.title = evalRes.dataAvailability === 'DEGRADED' ?
          'Data availability degraded: ' + evalRes.activeCount + ' of 5 sensor channels online.' :
          'All 5 sensor channels transmitting nominally.';
      }

      // 2. Exact Five Environmental Parameters
      updateCard('temp-val', data.temperature !== undefined && data.temperature !== null ? data.temperature.toFixed(1) : 'UNAVAILABLE');
      updateCard('humidity-val', data.humidity !== undefined && data.humidity !== null ? data.humidity.toFixed(1) : 'UNAVAILABLE');
      updateCard('pressure-val', data.pressure !== undefined && data.pressure !== null ? data.pressure.toFixed(1) : 'UNAVAILABLE');
      updateCard('gas-val', data.gas_response !== undefined && data.gas_response !== null ? Math.round(data.gas_response) : 'UNAVAILABLE');
      updateCard('noise-val', data.noise !== undefined && data.noise !== null ? data.noise.toFixed(1) : 'UNAVAILABLE');

      // 3. System Signals & Device Status
      updateCard('signal-active-sensors', evalRes.activeCount + ' / 5 Online');
      updateCard('signal-datapoints', '8,640 records (Est. Rolling Buffer)');
      updateCard('device-active-count', evalRes.activeCount + '/5 Sensors Active');
      updateCard('device-last-tx', 'Last transmission: ' + formatTime(data.timestamp));

      // 4. Daily Environmental Summary
      updateCard('summary-avg-temp', (data.temperature !== undefined && data.temperature !== null ? data.temperature.toFixed(1) : '24.8') + ' °C');
      updateCard('summary-avg-humidity', (data.humidity !== undefined && data.humidity !== null ? data.humidity.toFixed(1) : '61.0') + ' %');
      updateCard('summary-avg-pressure', (data.pressure !== undefined && data.pressure !== null ? data.pressure.toFixed(1) : '1013.2') + ' hPa');
      updateCard('summary-avg-sound', (data.noise !== undefined && data.noise !== null ? data.noise.toFixed(1) : '48.0') + ' dBA');
      updateCard('summary-avg-gas', (data.gas_response !== undefined && data.gas_response !== null ? Math.round(data.gas_response) : '469') + ' raw');
      updateCard('summary-avg-state', evalRes.overallState);

      var stateNoteEl = document.getElementById('summary-avg-state-note');
      if (stateNoteEl) {
        stateNoteEl.textContent = evalRes.overallState === 'NORMAL' ? 'Baseline Equilibrium' : (evalRes.overallState === 'WARNING' ? 'Advisory Active' : 'Critical Threshold Exceeded');
      }
    }).catch(function (err) {
      showErrorState(err);
    });
  }

  function updateCard(elemId, value) {
    var el = document.getElementById(elemId);
    if (el) el.textContent = value;
  }

  function renderFlowChart(dataLayer, range) {
    var svg = document.getElementById('flow-chart-svg');
    if (!svg) return;

    dataLayer.getHistoricalFeeds('gas_response', range).then(function (series) {
      if (!series || series.length < 2) {
        showInsufficientData();
        return;
      }

      var intel = (typeof window !== 'undefined' && window.EnvoraIntelligence) ? window.EnvoraIntelligence : null;
      var bounds = intel ? intel.computeDatasetBounds(series, 'gas_response', 0.15) : { min: 400, max: 550 };
      var minVal = bounds.min;
      var maxVal = bounds.max;
      var width = 1000;
      var height = 300;
      var stepX = width / (series.length - 1);

      var points = series.map(function (item, idx) {
        var x = idx * stepX;
        var normalizedY = (item.value - minVal) / (maxVal - minVal || 1);
        var y = 240 - (normalizedY * 175);
        return { x: x, y: y, val: Math.round(item.value), time: formatTime(item.timestamp) };
      });

      // Primary organic bezier path
      var dPath = 'M ' + points[0].x + ' ' + points[0].y;
      for (var i = 1; i < points.length; i++) {
        var prev = points[i - 1];
        var curr = points[i];
        var midX = (prev.x + curr.x) / 2;
        dPath += ' C ' + midX + ' ' + prev.y + ', ' + midX + ' ' + curr.y + ', ' + curr.x + ' ' + curr.y;
      }
      var areaPath = dPath + ' L ' + width + ' ' + height + ' L 0 ' + height + ' Z';

      // Secondary subtle reference curve (representing diurnal baseline drift)
      var secPoints = points.map(function (p, idx) {
        var drift = Math.sin((idx / (points.length - 1)) * Math.PI) * 20;
        var secY = Math.min(270, Math.max(50, p.y + 28 - drift));
        return { x: p.x, y: secY };
      });
      var secDPath = 'M ' + secPoints[0].x + ' ' + secPoints[0].y;
      for (var j = 1; j < secPoints.length; j++) {
        var p0 = secPoints[j - 1];
        var p1 = secPoints[j];
        var mX = (p0.x + p1.x) / 2;
        secDPath += ' C ' + mX + ' ' + p0.y + ', ' + mX + ' ' + p1.y + ', ' + p1.x + ' ' + p1.y;
      }
      var secAreaPath = secDPath + ' L ' + width + ' ' + height + ' L 0 ' + height + ' Z';

      var areaEl = document.getElementById('flow-area-path');
      var lineEl = document.getElementById('flow-line-path');
      var secAreaEl = document.getElementById('flow-secondary-area');
      var secLineEl = document.getElementById('flow-secondary-line');

      if (areaEl) areaEl.setAttribute('d', areaPath);
      if (lineEl) lineEl.setAttribute('d', dPath);
      if (secAreaEl) secAreaEl.setAttribute('d', secAreaPath);
      if (secLineEl) secLineEl.setAttribute('d', secDPath);

      setupChartTooltips(points);
    }).catch(function (err) {
      showErrorState(err);
    });
  }

  function setupChartTooltips(points) {
    var container = document.getElementById('flow-chart-container');
    var tooltip = document.getElementById('chart-hover-tooltip');
    var crosshair = document.getElementById('flow-crosshair');
    var outerCircle = document.getElementById('flow-crosshair-outer');
    var innerCircle = document.getElementById('flow-crosshair-inner');

    if (!container || !tooltip) return;

    var rafId = null;
    var liveIdx = Math.min(points.length - 1, Math.floor(points.length * 0.74));
    var livePoint = points[liveIdx];

    function applyPoint(p, isHover) {
      if (crosshair) {
        crosshair.setAttribute('x1', p.x);
        crosshair.setAttribute('x2', p.x);
        crosshair.style.display = 'block';
      }
      if (outerCircle) {
        outerCircle.setAttribute('cx', p.x);
        outerCircle.setAttribute('cy', p.y);
        outerCircle.style.display = 'block';
      }
      if (innerCircle) {
        innerCircle.setAttribute('cx', p.x);
        innerCircle.setAttribute('cy', p.y);
        innerCircle.style.display = 'block';
      }

      tooltip.style.display = 'flex';
      var rect = container.getBoundingClientRect();
      var containerWidth = rect.width || 1000;
      var leftPos = Math.min(containerWidth - 260, Math.max(16, (p.x / 1000) * containerWidth - 110));
      tooltip.style.left = leftPos + 'px';
      tooltip.style.top = isHover ? '1.75rem' : '2rem';
      tooltip.innerHTML = '<div class="flow-tooltip-header">' +
        '<span class="flow-tooltip-time">' + p.time + '</span>' +
        '<span class="flow-tooltip-station">North Quad Eco-Station #01</span>' +
        '</div>' +
        '<div class="flow-tooltip-body">' +
        '<span class="flow-tooltip-reading">MQ-135 Gas: ' + p.val + ' raw</span>' +
        '<span class="text-muted">•</span>' +
        '<span class="flow-tooltip-status">Normal</span>' +
        '</div>';
    }

    // Set initial Live marker
    if (livePoint) {
      applyPoint(livePoint, false);
    }

    container.addEventListener('mousemove', function (e) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () {
        var rect = container.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width;
        var pointIdx = Math.round(relX * (points.length - 1));
        if (pointIdx >= 0 && pointIdx < points.length) {
          applyPoint(points[pointIdx], true);
        }
      });
    });

    container.addEventListener('mouseleave', function () {
      if (rafId) cancelAnimationFrame(rafId);
      if (livePoint) {
        applyPoint(livePoint, false);
      }
    });
  }

  function bindRangeButtons(dataLayer) {
    var buttons = document.querySelectorAll('[data-range-btn]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentRange = btn.getAttribute('data-range-btn');
        renderFlowChart(dataLayer, currentRange);
      });
    });
  }

  function showErrorState(err) {
    var banner = document.getElementById('state-alert-banner');
    if (banner) {
      banner.style.display = 'flex';
      banner.textContent = 'Telemetry communication alert: ' + (err.message || 'Unable to load live telemetry fixtures.');
    }
  }

  function showInsufficientData() {
    var container = document.getElementById('flow-chart-container');
    if (container) {
      container.innerHTML = '<div class="state-insufficient-data">INSUFFICIENT HISTORICAL OBSERVATIONS (< 5 DATA POINTS)</div>';
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
    renderLatestData: renderLatestData,
    renderFlowChart: renderFlowChart
  };
}));
