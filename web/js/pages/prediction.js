/**
 * ENVORA — Prediction Page Controller
 * Source of Truth: Approved Phase 3 Implementation Plan & docs/16_VISUAL_REFERENCE_GUIDE.md
 *
 * Scope: Explainable MQ-135 Sensor-Response Prediction via client-side OLS (y = mx + b).
 * Zero calibrated ppm claims, zero composite air index calculation.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraPrediction = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var activeWindow = 12; // number of readings

  function init() {
    var dataLayer = (typeof window !== 'undefined' && window.EnvoraDataLayer) ? window.EnvoraDataLayer : null;
    if (!dataLayer) return;

    loadAndRenderPrediction(dataLayer);
    bindWindowButtons(dataLayer);
  }

  function loadAndRenderPrediction(dataLayer) {
    dataLayer.getHistoricalFeeds('gas_response', '24H').then(function (series) {
      if (!series || !Array.isArray(series)) {
        showInsufficientData();
        return;
      }

      var intel = (typeof window !== 'undefined' && window.EnvoraIntelligence) ? window.EnvoraIntelligence : null;
      if (!intel) {
        showError('Intelligence module not loaded');
        return;
      }

      var reg = intel.computeLinearRegression(series, activeWindow);
      if (!reg.valid) {
        showInsufficientData();
        return;
      }

      renderPredictionReadouts(reg);
      renderPredictionChart(reg, intel);
    }).catch(function (err) {
      console.error('Prediction load error:', err);
      showInsufficientData();
    });
  }

  function renderPredictionReadouts(reg) {
    var curEl = document.getElementById('pred-cur-val');
    var predEl = document.getElementById('pred-forecast-val');
    var slopeEl = document.getElementById('pred-slope-val');
    var badgeEl = document.getElementById('pred-polarity-badge');
    var slopeDescEl = document.getElementById('pred-slope-desc');
    var trendPillEl = document.getElementById('pred-trend-pill');
    var horizonFooterEl = document.getElementById('pred-horizon-footer');
    var legendLabelEl = document.getElementById('forecast-legend-label');
    var zoneTextEl = document.getElementById('forecast-zone-text');

    if (curEl) curEl.textContent = Math.round(reg.current);
    if (predEl) predEl.textContent = reg.forecast;
    if (slopeEl) slopeEl.textContent = reg.slopeFormatted;

    if (badgeEl) {
      badgeEl.textContent = reg.trend + ' POLARITY';
      badgeEl.className = 'badge badge-' + (reg.trend === 'RISING' ? 'warning' : 'normal');
    }

    if (slopeDescEl) {
      if (reg.trend === 'RISING') {
        slopeDescEl.textContent = 'Sensor response drifting upward (+drift)';
      } else if (reg.trend === 'FALLING') {
        slopeDescEl.textContent = 'Sensor response recovering downward (-drift)';
      } else {
        slopeDescEl.textContent = 'Sensor response in baseline equilibrium';
      }
    }

    if (trendPillEl) trendPillEl.textContent = 'Next projection (' + reg.horizonLabel + ')';
    if (horizonFooterEl) horizonFooterEl.textContent = 'Target horizon: ' + reg.horizonLabel;
    if (legendLabelEl) legendLabelEl.textContent = '-- ' + reg.horizonLabel;
    if (zoneTextEl) zoneTextEl.textContent = reg.horizonLabel.toUpperCase();

    // Additional Stitch visual elements
    var targetLabelEl = document.getElementById('pred-legend-target-label');
    if (targetLabelEl) targetLabelEl.textContent = 'Target (' + reg.forecast + ')';

    var targetBadgeVal = document.getElementById('pred-target-badge-val');
    if (targetBadgeVal) targetBadgeVal.textContent = 'PREDICTED: ' + reg.forecast;

    var targetBadgeHorizon = document.getElementById('pred-target-badge-horizon');
    if (targetBadgeHorizon) targetBadgeHorizon.textContent = 'Target: ' + reg.horizonLabel;

    var obsCalloutVal = document.getElementById('pred-obs-callout-val');
    if (obsCalloutVal) obsCalloutVal.textContent = 'Obs: ' + Math.round(reg.current);

    var headerTargetChip = document.getElementById('pred-header-target-chip');
    if (headerTargetChip) headerTargetChip.textContent = 'TARGET: ' + reg.horizonLabel;

    var stepExtrap = document.getElementById('pred-step-extrap-text');
    if (stepExtrap) stepExtrap.textContent = 'The line projects ' + reg.horizonLabel.toLowerCase() + ' ahead to produce the next discrete target response value of ' + reg.forecast + '.';

    var specCadence = document.getElementById('pred-spec-cadence');
    if (specCadence) specCadence.textContent = '15 minutes (or 30s buffer)';

    var specTarget = document.getElementById('pred-spec-target');
    if (specTarget) specTarget.textContent = reg.horizonLabel;

    var specTrend = document.getElementById('pred-spec-trend');
    if (specTrend) specTrend.textContent = reg.trend + ' (' + reg.slopeFormatted + ' / interval)';

    var cadenceLabel = document.getElementById('pred-cadence-label');
    if (cadenceLabel) cadenceLabel.textContent = 'Forecast horizon: ' + reg.horizonLabel;

    var contextDelta = document.getElementById('pred-context-delta');
    if (contextDelta) {
      var delta = reg.forecast - 900;
      contextDelta.textContent = 'DELTA TO THRESHOLD: ' + (delta >= 0 ? '+' : '') + Math.round(delta) + ' raw';
    }
  }

  function renderPredictionChart(reg, intel) {
    var obsLine = document.getElementById('pred-observed-line');
    var regLine = document.getElementById('pred-regression-line');
    var forecastLine = document.getElementById('pred-forecast-line');
    var forecastNode = document.getElementById('pred-forecast-node');
    var svg = document.getElementById('pred-chart-svg');

    if (!obsLine || !regLine || !forecastLine || !svg) return;
    svg.style.display = 'block';

    var valuesToScale = reg.observedValues.concat([reg.forecastRaw]);
    var bounds = intel.computeDatasetBounds(valuesToScale, 'gas_response', 0.15);
    var yMin = bounds.min;
    var yMax = bounds.max;

    var chartHeight = 300;
    var xStart = 80;
    var xPresent = 740;
    var xForecast = 860;
    var N = reg.observedValues.length;
    var stepX = (xPresent - xStart) / (N - 1);

    function mapY(val) {
      var norm = (val - yMin) / (yMax - yMin);
      return chartHeight - (norm * (chartHeight - 60)) - 30;
    }

    // 1. Observed Points, Path, and Area Wash
    var obsPts = reg.observedValues.map(function (v, idx) {
      return { x: xStart + (idx * stepX), y: mapY(v) };
    });
    var dObs = 'M ' + obsPts.map(function (p) { return p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' L ');
    obsLine.setAttribute('d', dObs);

    var areaPath = document.getElementById('pred-area-path');
    if (areaPath) {
      var areaD = dObs + ' L ' + xPresent + ' 270 L ' + xStart + ' 270 Z';
      areaPath.setAttribute('d', areaD);
    }

    // 2. Linear Regression Trendline (across observation window)
    var regStartY = mapY(reg.b);
    var regEndY = mapY((reg.m * (N - 1)) + reg.b);
    regLine.setAttribute('x1', xStart);
    regLine.setAttribute('y1', regStartY.toFixed(1));
    regLine.setAttribute('x2', xPresent);
    regLine.setAttribute('y2', regEndY.toFixed(1));

    var regBadge = document.getElementById('pred-reg-badge');
    if (regBadge) {
      var midX = (xStart + xPresent) / 2 - 48;
      var midY = (regStartY + regEndY) / 2 - 25;
      regBadge.setAttribute('transform', 'translate(' + midX.toFixed(1) + ', ' + midY.toFixed(1) + ')');
      regBadge.style.display = 'block';
    }

    // 3. Forecast Line (into future zone with projection animation)
    var forecastY = mapY(reg.forecastRaw);
    forecastLine.setAttribute('x1', xPresent);
    forecastLine.setAttribute('y1', regEndY.toFixed(1));
    forecastLine.setAttribute('x2', xForecast);
    forecastLine.setAttribute('y2', forecastY.toFixed(1));

    forecastLine.classList.remove('forecast-projecting');
    void forecastLine.offsetWidth; // trigger reflow
    forecastLine.classList.add('forecast-projecting');

    if (forecastNode) {
      forecastNode.setAttribute('cx', xForecast);
      forecastNode.setAttribute('cy', forecastY.toFixed(1));
      forecastNode.style.display = 'block';
    }

    var halo = document.getElementById('pred-forecast-node-halo');
    if (halo) {
      halo.setAttribute('cx', xForecast);
      halo.setAttribute('cy', forecastY.toFixed(1));
    }

    var diamond = document.getElementById('pred-forecast-diamond');
    if (diamond) {
      var fy = Number(forecastY.toFixed(1));
      diamond.setAttribute('points', xForecast + ',' + (fy - 6) + ' ' + (xForecast + 6) + ',' + fy + ' ' + xForecast + ',' + (fy + 6) + ' ' + (xForecast - 6) + ',' + fy);
    }

    // Callout pills
    var obsCallout = document.getElementById('pred-obs-callout');
    if (obsCallout && obsPts.length > 0) {
      var lastObsY = obsPts[obsPts.length - 1].y;
      obsCallout.querySelector('rect').setAttribute('y', (lastObsY - 32).toFixed(1));
      document.getElementById('pred-obs-callout-val').setAttribute('y', (lastObsY - 17).toFixed(1));
      obsCallout.style.display = 'block';
    }

    var targetBadge = document.getElementById('pred-target-badge');
    if (targetBadge) {
      var badgeTop = Math.max(35, Math.min(220, forecastY - 20));
      targetBadge.setAttribute('transform', 'translate(752, ' + badgeTop.toFixed(1) + ')');
      targetBadge.style.display = 'block';
    }

    // Dynamic Y-axis numerical scale labels
    var ySpan = yMax - yMin;
    for (var s = 0; s <= 5; s++) {
      var sVal = Math.round(yMax - (s / 5) * ySpan);
      var scaleEl = document.getElementById('pred-scale-y' + s);
      if (scaleEl) scaleEl.textContent = sVal;
    }

    // 4. Interactive Nodes & Inspection
    var nodesContainer = document.getElementById('pred-observed-nodes');
    if (nodesContainer) {
      nodesContainer.innerHTML = '';
      obsPts.forEach(function (pt) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', pt.x.toFixed(1));
        c.setAttribute('cy', pt.y.toFixed(1));
        c.setAttribute('r', '3.5');
        c.setAttribute('fill', '#292D22');
        nodesContainer.appendChild(c);
      });
    }

    setupPredictionInspection(obsPts, reg);
  }

  function setupPredictionInspection(obsPts, reg) {
    var container = document.getElementById('pred-chart-viewport');
    var tooltip = document.getElementById('pred-chart-tooltip');
    if (!container || !tooltip) return;

    var rafId = null;

    container.addEventListener('mousemove', function (e) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () {
        var rect = container.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var relX = mouseX / rect.width;

        // Check if closer to forecast zone or observed points
        if (relX > 0.8) {
          // Hovering near forecast node
          tooltip.style.display = 'block';
          tooltip.style.left = (mouseX - 140) + 'px';
          tooltip.style.top = '40px';
          tooltip.innerHTML = '<strong>' + reg.horizonLabel + '</strong><br>Forecast: ' + reg.forecast + ' raw<br><span style="color:var(--color-primary);font-size:10px;">Linear Projection (y = mx + b)</span>';
        } else {
          var ptIdx = Math.round((relX / 0.8) * (obsPts.length - 1));
          if (ptIdx >= 0 && ptIdx < obsPts.length) {
            var val = reg.observedValues[ptIdx];
            tooltip.style.display = 'block';
            tooltip.style.left = Math.min(mouseX + 15, rect.width - 160) + 'px';
            tooltip.style.top = Math.max(e.clientY - rect.top - 35, 10) + 'px';
            tooltip.innerHTML = '<strong>Point t-' + (obsPts.length - 1 - ptIdx) + '</strong><br>Observed: ' + Math.round(val) + ' raw';
          }
        }
      });
    });

    container.addEventListener('mouseleave', function () {
      if (rafId) cancelAnimationFrame(rafId);
      tooltip.style.display = 'none';
    });
  }

  function showInsufficientData() {
    var box = document.getElementById('pred-chart-viewport');
    if (box) {
      box.innerHTML = '<div class="state-insufficient-data" style="padding: 40px; text-align: center; color: var(--color-text-muted); font-family: var(--font-telemetry);">' +
        'INSUFFICIENT HISTORICAL OBSERVATIONS FOR REGRESSION (N < 5)</div>';
    }
  }

  function showError(msg) {
    console.error('Prediction Engine Error:', msg);
  }

  function bindWindowButtons(dataLayer) {
    var buttons = document.querySelectorAll('[data-window-btn]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeWindow = parseInt(btn.getAttribute('data-window-btn'), 10) || 12;
        loadAndRenderPrediction(dataLayer);
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
    loadAndRenderPrediction: loadAndRenderPrediction
  };
}));
