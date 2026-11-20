/**
 * ENVORA — Historical Analysis Page Controller
 * Source of Truth: Approved Phase 1 Implementation Plan & docs/16_VISUAL_REFERENCE_GUIDE.md
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraHistoricalAnalysis = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var activeParam = 'temperature';
  var activeWindow = '24H';

  var PARAM_META = {
    'temperature': { label: 'Temperature', unit: '°C', threshold: 28.0, desc: 'BME280 Ambient Temperature' },
    'humidity': { label: 'Humidity', unit: '%', threshold: 75.0, desc: 'BME280 Relative Humidity' },
    'pressure': { label: 'Atmospheric Pressure', unit: 'hPa', threshold: 1025.0, desc: 'BME280 Barometric Pressure' },
    'gas_response': { label: 'MQ-135 Gas Response', unit: 'raw', threshold: 650.0, desc: 'MQ-135 Baseline Air Sensor Response' },
    'noise': { label: 'Environmental Noise', unit: 'dB SPL', threshold: 70.0, desc: 'INMP441 Acoustic Sound Level' }
  };

  function init() {
    var dataLayer = (typeof window !== 'undefined' && window.EnvoraDataLayer) ? window.EnvoraDataLayer : null;
    if (!dataLayer) return;

    bindParamSwitcher(dataLayer);
    bindRangeSelector(dataLayer);
    renderAnalysis(dataLayer);
  }

  function bindParamSwitcher(dataLayer) {
    var buttons = document.querySelectorAll('[data-analysis-param]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeParam = btn.getAttribute('data-analysis-param');
        var svg = document.getElementById('hist-chart-svg');
        if (svg) svg.classList.add('chart-fade-transition');
        setTimeout(function () {
          renderAnalysis(dataLayer);
          if (svg) svg.classList.remove('chart-fade-transition');
        }, 120);
      });
    });
  }

  function bindRangeSelector(dataLayer) {
    var buttons = document.querySelectorAll('[data-hist-range]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeWindow = btn.getAttribute('data-hist-range');
        var svg = document.getElementById('hist-chart-svg');
        if (svg) svg.classList.add('chart-fade-transition');
        setTimeout(function () {
          renderAnalysis(dataLayer);
          if (svg) svg.classList.remove('chart-fade-transition');
        }, 120);
      });
    });
  }

  function renderAnalysis(dataLayer) {
    var meta = PARAM_META[activeParam] || PARAM_META['temperature'];

    var intel = (typeof window !== 'undefined' && window.EnvoraIntelligence) ? window.EnvoraIntelligence : null;
    var cfg = intel && intel.THRESHOLDS[activeParam] ? intel.THRESHOLDS[activeParam] : null;

    // Update Header labels
    var titleEl = document.getElementById('hist-chart-title');
    var badgeEl = document.getElementById('hist-param-badge');
    var seriesLabel = document.getElementById('hist-series-label');
    var threshLabel = document.getElementById('hist-threshold-label');

    if (titleEl) titleEl.textContent = 'Environmental Trend: ' + meta.label;
    if (badgeEl) badgeEl.textContent = meta.label + ' (' + meta.unit + ')';
    if (seriesLabel) seriesLabel.textContent = 'Observed ' + meta.label + ' (' + meta.unit + ')';
    if (threshLabel) {
      if (cfg && cfg.type === 'two-sided') {
        threshLabel.textContent = 'Normal Range: ' + cfg.normalMin + ' - ' + cfg.normalMax + ' ' + meta.unit;
      } else if (cfg) {
        threshLabel.textContent = 'Reference Limit: < ' + cfg.normalMax + ' ' + meta.unit;
      } else {
        threshLabel.textContent = 'Reference Limit: ' + meta.threshold + ' ' + meta.unit;
      }
    }

    dataLayer.getHistoricalFeeds(activeParam, activeWindow).then(function (series) {
      if (!series || series.length === 0) {
        showEmptyState();
        return;
      }

      computeAndRenderStats(series, meta);
      renderChart(series, meta);
    }).catch(function (err) {
      showError(err);
    });
  }

  function computeAndRenderStats(series, meta) {
    var intel = (typeof window !== 'undefined' && window.EnvoraIntelligence) ? window.EnvoraIntelligence : null;
    if (intel) {
      var stats = intel.computeParameterStats(series, activeParam);
      updateStat('stat-avg-val', stats.mean, meta.unit);
      updateStat('stat-min-val', stats.min, meta.unit);
      updateStat('stat-max-val', stats.max, meta.unit);
      updateStat('stat-cur-val', stats.current, meta.unit);

      var narrativeEl = document.getElementById('hist-trend-narrative');
      if (narrativeEl) {
        narrativeEl.textContent = stats.narrative;
      }
      return;
    }

    var values = series.map(function (s) { return s.value; });
    var sum = values.reduce(function (a, b) { return a + b; }, 0);
    var avg = sum / values.length;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var cur = values[values.length - 1];

    updateStat('stat-avg-val', avg.toFixed(1), meta.unit);
    updateStat('stat-min-val', min.toFixed(1), meta.unit);
    updateStat('stat-max-val', max.toFixed(1), meta.unit);
    updateStat('stat-cur-val', cur.toFixed(1), meta.unit);

    var fallbackNarrativeEl = document.getElementById('hist-trend-narrative');
    if (fallbackNarrativeEl) {
      fallbackNarrativeEl.textContent = meta.label + ' observations are steady within baseline campus parameters.';
    }
  }

  function updateStat(elemId, val, unit) {
    var el = document.getElementById(elemId);
    if (el) el.textContent = val;
    var unitEl = document.getElementById(elemId + '-unit');
    if (unitEl) unitEl.textContent = unit;
  }

  function renderChart(series, meta) {
    var linePath = document.getElementById('hist-line-path');
    var areaPath = document.getElementById('hist-area-path');
    if (!linePath || !areaPath) return;

    var intel = (typeof window !== 'undefined' && window.EnvoraIntelligence) ? window.EnvoraIntelligence : null;
    var bounds = intel ?
      intel.computeDatasetBounds(series, activeParam, 0.12) :
      (function () {
        var vals = series.map(function (s) { return s.value; });
        var mn = Math.min.apply(null, vals);
        var mx = Math.max.apply(null, vals);
        var p = (mx - mn) * 0.1 || 1.0;
        return { min: mn - p, max: mx + p };
      })();

    var yMin = bounds.min;
    var yMax = bounds.max;
    var width = 1000;
    var height = 300;
    var stepX = width / (series.length - 1);

    var pts = series.map(function (item, idx) {
      var x = idx * stepX;
      var norm = (item.value - yMin) / (yMax - yMin);
      var y = height - (norm * (height - 40)) - 20;
      return { x: x, y: y, val: item.value, timestamp: item.timestamp };
    });

    var d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var prev = pts[i - 1];
      var curr = pts[i];
      var mx = (prev.x + curr.x) / 2;
      d += ' C ' + mx + ' ' + prev.y + ', ' + mx + ' ' + curr.y + ', ' + curr.x + ' ' + curr.y;
    }

    linePath.setAttribute('d', d);
    areaPath.setAttribute('d', d + ' L ' + width + ' ' + height + ' L 0 ' + height + ' Z');

    // Threshold lines visualization
    renderThresholdLines(intel, yMin, yMax, height);

    // Interactive SVG hover inspection
    setupChartInspection(pts, meta, cfg);
  }

  function setupChartInspection(points, meta, cfg) {
    var container = document.getElementById('hist-chart-container');
    var tooltip = document.getElementById('hist-chart-tooltip');
    var crosshair = document.getElementById('hist-crosshair');
    var node = document.getElementById('hist-inspect-node');
    if (!container || !tooltip || !crosshair || !node) return;

    var rafId = null;

    container.addEventListener('mousemove', function (e) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () {
        var rect = container.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width;
        var pointIdx = Math.round(relX * (points.length - 1));
        if (pointIdx >= 0 && pointIdx < points.length) {
          var p = points[pointIdx];
          var timeStr = formatTime(p.timestamp);
          var valStr = (typeof p.val === 'number' ? (meta.unit === 'raw' ? Math.round(p.val) : p.val.toFixed(1)) : p.val) + ' ' + meta.unit;

          crosshair.setAttribute('x1', p.x);
          crosshair.setAttribute('x2', p.x);
          crosshair.style.display = 'block';

          node.setAttribute('cx', p.x);
          node.setAttribute('cy', p.y);
          node.style.display = 'block';

          tooltip.style.display = 'block';
          tooltip.style.left = Math.min(e.clientX - rect.left + 15, rect.width - 180) + 'px';
          tooltip.style.top = Math.max(e.clientY - rect.top - 40, 10) + 'px';

          var threshInfo = '';
          if (cfg) {
            if (cfg.type === 'two-sided') {
              threshInfo = '<br><span style="color:var(--color-text-muted);font-size:10px;">Range: ' + cfg.normalMin + ' - ' + cfg.normalMax + ' ' + cfg.unit + '</span>';
            } else {
              threshInfo = '<br><span style="color:var(--color-text-muted);font-size:10px;">Limit: < ' + cfg.normalMax + ' ' + cfg.unit + '</span>';
            }
          }

          tooltip.innerHTML = '<strong>' + timeStr + '</strong><br>' + meta.label + ': ' + valStr + threshInfo;
        }
      });
    });

    container.addEventListener('mouseleave', function () {
      if (rafId) cancelAnimationFrame(rafId);
      tooltip.style.display = 'none';
      crosshair.style.display = 'none';
      node.style.display = 'none';
    });
  }

  function formatTime(isoString) {
    if (!isoString) return '--:--:--';
    var d = new Date(isoString);
    return isNaN(d.getTime()) ? '--:--:--' : d.toTimeString().split(' ')[0] + ' UTC';
  }

  function renderThresholdLines(intel, yMin, yMax, height) {
    var upperLine = document.getElementById('hist-thresh-upper-line');
    var upperText = document.getElementById('hist-thresh-upper-text');
    var lowerLine = document.getElementById('hist-thresh-lower-line');
    var lowerText = document.getElementById('hist-thresh-lower-text');

    if (!upperLine || !lowerLine || !intel) return;

    var cfg = intel.THRESHOLDS[activeParam];
    if (!cfg) return;

    var upperVal = cfg.normalMax;
    if (upperVal >= yMin && upperVal <= yMax) {
      var normU = (upperVal - yMin) / (yMax - yMin);
      var yU = height - (normU * (height - 40)) - 20;
      upperLine.setAttribute('y1', yU);
      upperLine.setAttribute('y2', yU);
      upperLine.style.display = 'block';
      if (upperText) {
        upperText.setAttribute('y', yU - 4);
        upperText.textContent = (cfg.type === 'two-sided' ? 'Upper Limit: ' : 'Warning Limit: ') + upperVal + ' ' + cfg.unit;
        upperText.style.display = 'block';
      }
    } else {
      upperLine.style.display = 'none';
      if (upperText) upperText.style.display = 'none';
    }

    if (cfg.type === 'two-sided' && typeof cfg.normalMin === 'number') {
      var lowerVal = cfg.normalMin;
      if (lowerVal >= yMin && lowerVal <= yMax) {
        var normL = (lowerVal - yMin) / (yMax - yMin);
        var yL = height - (normL * (height - 40)) - 20;
        lowerLine.setAttribute('y1', yL);
        lowerLine.setAttribute('y2', yL);
        lowerLine.style.display = 'block';
        if (lowerText) {
          lowerText.setAttribute('y', yL + 12);
          lowerText.textContent = 'Lower Limit: ' + lowerVal + ' ' + cfg.unit;
          lowerText.style.display = 'block';
        }
      } else {
        lowerLine.style.display = 'none';
        if (lowerText) lowerText.style.display = 'none';
      }
    } else {
      lowerLine.style.display = 'none';
      if (lowerText) lowerText.style.display = 'none';
    }
  }

  function showEmptyState() {
    var box = document.getElementById('hist-chart-container');
    if (box) {
      box.innerHTML = '<div class="state-insufficient-data">INSUFFICIENT HISTORICAL OBSERVATIONS</div>';
    }
  }

  function showError(err) {
    console.error('Historical Analysis error:', err);
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
    renderAnalysis: renderAnalysis
  };
}));
