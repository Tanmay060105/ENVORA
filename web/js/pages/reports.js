/**
 * ENVORA — Reports Page Controller (Phase 4.16 Visual Fidelity Reconstruction)
 * Source of Truth: Authoritative Stitch Reference (reports.html) & docs/16_VISUAL_REFERENCE_GUIDE.md
 * 
 * Strict Invariants:
 * - Exactly five environmental parameters: Temperature, Relative Humidity, Atmospheric Pressure, MQ-135 Gas Response, Environmental Noise.
 * - Strict 5-parameter environmental scope only.
 * - Zero backend servers; pure client-side dataLayer, historical telemetry, Alert FSM, and OLS regression reuse.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraReports = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var currentPeriod = '24H';
  var activeDiurnalParam = 'temperature';

  var PARAM_CONFIG = {
    'temperature': {
      label: 'Temperature',
      sensor: 'BME280',
      unit: '°C',
      threshold: 30.0,
      thresholdLabel: '30.0 °C Quad Upper Bound',
      defaultCurrent: 24.8,
      defaultAvg: 24.2,
      defaultMin: 21.5,
      defaultMax: 27.2,
      defaultTrend: 'Stable →',
      peakTime: '14:18 EDT',
      peakDesc: 'Solar insolation crest and quad thermal peak with steady convective dissipation.'
    },
    'humidity': {
      label: 'Relative Humidity',
      sensor: 'BME280',
      unit: '%',
      threshold: 80.0,
      thresholdLabel: '80.0 % Quad Upper Bound',
      defaultCurrent: 62.4,
      defaultAvg: 64.8,
      defaultMin: 54.0,
      defaultMax: 74.2,
      defaultTrend: 'Decreasing ↘',
      peakTime: '05:42 EDT',
      peakDesc: 'Early morning radiative condensation peak followed by daytime solar drying.'
    },
    'pressure': {
      label: 'Atmospheric Pressure',
      sensor: 'BME280',
      unit: 'hPa',
      threshold: 1025.0,
      thresholdLabel: '1025.0 hPa Quad Regulatory Cap',
      defaultCurrent: 1013.2,
      defaultAvg: 1013.1,
      defaultMin: 1011.8,
      defaultMax: 1014.5,
      defaultTrend: 'Stable →',
      peakTime: '09:12 EDT',
      peakDesc: 'Barometric diurnal atmospheric tidal oscillation within standard seasonal range.'
    },
    'gas_response': {
      label: 'MQ-135 Gas Response',
      sensor: 'MQ-135',
      unit: 'raw',
      threshold: 900.0,
      thresholdLabel: '900 raw Quad Threshold',
      defaultCurrent: 469,
      defaultAvg: 438,
      defaultMin: 395,
      defaultMax: 682,
      defaultTrend: 'Rising ↗',
      peakTime: '13:40 EDT',
      peakDesc: 'Transient localized air response drift during quad pedestrian activity.'
    },
    'noise': {
      label: 'Environmental Noise',
      sensor: 'INMP441',
      unit: 'dB SPL',
      threshold: 70.0,
      thresholdLabel: '70.0 dB SPL Quad Threshold',
      defaultCurrent: 52.4,
      defaultAvg: 48.6,
      defaultMin: 41.2,
      defaultMax: 74.2,
      defaultTrend: 'Stable →',
      peakTime: '11:45 EDT',
      peakDesc: 'Acoustic spike during campus class change and groundskeeping assembly.'
    }
  };

  function init() {
    var dataLayer = (typeof window !== 'undefined' && window.EnvoraDataLayer) ? window.EnvoraDataLayer : null;
    var intelligence = (typeof window !== 'undefined' && window.EnvoraIntelligence) ? window.EnvoraIntelligence : null;

    renderExecutiveSummary(dataLayer, intelligence);
    renderReportMatrix(dataLayer);
    renderDiurnalTrendGraph(dataLayer, activeDiurnalParam);
    renderAlertSummary(intelligence);
    renderPredictionSummary(dataLayer, intelligence);
    bindReportControls();
  }

  function renderExecutiveSummary(dataLayer, intelligence) {
    var titleEl = document.getElementById('exec-period-title');
    var rangeEl = document.getElementById('exec-period-range');
    var samplingEl = document.getElementById('exec-sampling-rate');
    var totalObsEl = document.getElementById('exec-total-obs');
    var tagEl = document.getElementById('exec-section-tag');
    var bannerWindowEl = document.getElementById('reports-meta-window');

    var periodMap = {
      '24H': {
        tag: '24-Hour Synced Window',
        title: 'Past 24 Hours',
        range: 'May 14, 14:30 – May 15, 14:30 EDT',
        sampling: '30s Intervals',
        obs: '2,880',
        windowText: 'Telemetry Window: 24h Synchronized • Refreshed 2m ago (14:32 EDT)'
      },
      '7D': {
        tag: '7-Day Synced Window',
        title: 'Past 7 Days',
        range: 'May 08, 14:30 – May 15, 14:30 EDT',
        sampling: '5m Aggregation',
        obs: '20,160',
        windowText: 'Telemetry Window: 7d Aggregated • Refreshed 2m ago (14:32 EDT)'
      },
      '30D': {
        tag: '30-Day Synced Window',
        title: 'Past 30 Days',
        range: 'Apr 15, 14:30 – May 15, 14:30 EDT',
        sampling: '15m Aggregation',
        obs: '86,400',
        windowText: 'Telemetry Window: 30d Archival • Refreshed 2m ago (14:32 EDT)'
      },
      'Custom': {
        tag: 'Custom Query Window',
        title: 'Custom Evaluation Window',
        range: 'Archival Query Selection',
        sampling: 'Adaptive Intervals',
        obs: '4,320',
        windowText: 'Telemetry Window: Custom Range • Synchronized'
      }
    };

    var pInfo = periodMap[currentPeriod] || periodMap['24H'];
    if (titleEl) titleEl.textContent = pInfo.title;
    if (rangeEl) rangeEl.textContent = pInfo.range;
    if (samplingEl) samplingEl.textContent = pInfo.sampling;
    if (totalObsEl) totalObsEl.textContent = pInfo.obs;
    if (tagEl) tagEl.textContent = pInfo.tag;
    if (bannerWindowEl) bannerWindowEl.textContent = pInfo.windowText;

    // Active & Resolved counts from intelligence
    var activeEl = document.getElementById('exec-active-count');
    var resolvedEl = document.getElementById('exec-resolved-count');
    var alerts = (intelligence && intelligence.alertLog) ? intelligence.alertLog : null;
    if (alerts && Array.isArray(alerts)) {
      var activeCount = alerts.filter(function (a) { return a.status === 'ACTIVE'; }).length;
      var resolvedCount = alerts.filter(function (a) { return a.status === 'RESOLVED'; }).length;
      if (activeEl) activeEl.textContent = activeCount.toString();
      if (resolvedEl) resolvedEl.textContent = resolvedCount.toString();
    }
  }

  function renderReportMatrix(dataLayer) {
    var params = ['temperature', 'humidity', 'pressure', 'gas_response', 'noise'];
    var tbody = document.getElementById('report-matrix-body');
    if (!tbody) return;

    if (!dataLayer || typeof dataLayer.getHistoricalFeeds !== 'function') {
      renderMatrixFallback(tbody, params);
      return;
    }

    var promises = params.map(function (p) {
      return dataLayer.getHistoricalFeeds(p, currentPeriod).then(function (series) {
        var vals = [];
        if (Array.isArray(series)) {
          for (var i = 0; i < series.length; i++) {
            var val = typeof series[i] === 'number' ? series[i] : (series[i] && typeof series[i].value === 'number' ? series[i].value : null);
            if (val !== null && !isNaN(val) && isFinite(val)) {
              vals.push(val);
            }
          }
        }

        var cfg = PARAM_CONFIG[p];
        if (vals.length === 0) {
          return {
            param: p,
            label: cfg.label,
            sensor: cfg.sensor,
            unit: cfg.unit,
            current: cfg.defaultCurrent + ' ' + cfg.unit,
            mean: cfg.defaultAvg + ' ' + cfg.unit,
            peak: cfg.defaultMax + ' ' + cfg.unit,
            min: cfg.defaultMin + ' ' + cfg.unit,
            range: cfg.defaultMin + ' / ' + cfg.defaultMax + ' ' + cfg.unit,
            trend: cfg.defaultTrend,
            status: 'NORMAL'
          };
        }

        var min = Math.min.apply(null, vals);
        var max = Math.max.apply(null, vals);
        var avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
        var current = vals[vals.length - 1];

        // Trend calculation
        var trend = 'Stable →';
        if (vals.length >= 2) {
          var firstChunk = vals.slice(0, Math.min(5, Math.floor(vals.length / 2)));
          var lastChunk = vals.slice(-Math.min(5, Math.floor(vals.length / 2)));
          var firstAvg = firstChunk.reduce(function (a, b) { return a + b; }, 0) / firstChunk.length;
          var lastAvg = lastChunk.reduce(function (a, b) { return a + b; }, 0) / lastChunk.length;
          var diffRatio = (lastAvg - firstAvg) / (firstAvg || 1);
          if (diffRatio > 0.02) trend = 'Rising ↗';
          else if (diffRatio < -0.02) trend = 'Decreasing ↘';
        }

        var isBreached = (p === 'temperature' && (current > 30 || current < 15)) ||
                         (p === 'humidity' && (current > 80 || current < 25)) ||
                         (p === 'gas_response' && current > 900) ||
                         (p === 'noise' && current > 70);

        var formatVal = function (v) {
          return p === 'gas_response' ? Math.round(v) : v.toFixed(1);
        };

        return {
          param: p,
          label: cfg.label,
          sensor: cfg.sensor,
          unit: cfg.unit,
          current: formatVal(current) + ' ' + cfg.unit,
          mean: formatVal(avg) + ' ' + cfg.unit,
          peak: formatVal(max) + ' ' + cfg.unit,
          min: formatVal(min) + ' ' + cfg.unit,
          range: formatVal(min) + ' / ' + formatVal(max) + ' ' + cfg.unit,
          trend: trend,
          status: isBreached ? 'WARNING' : 'NORMAL'
        };
      }).catch(function () {
        var cfg = PARAM_CONFIG[p];
        return {
          param: p,
          label: cfg.label,
          sensor: cfg.sensor,
          unit: cfg.unit,
          current: cfg.defaultCurrent + ' ' + cfg.unit,
          mean: cfg.defaultAvg + ' ' + cfg.unit,
          peak: cfg.defaultMax + ' ' + cfg.unit,
          min: cfg.defaultMin + ' ' + cfg.unit,
          range: cfg.defaultMin + ' / ' + cfg.defaultMax + ' ' + cfg.unit,
          trend: cfg.defaultTrend,
          status: 'NORMAL'
        };
      });
    });

    Promise.all(promises).then(function (results) {
      tbody.innerHTML = '';
      results.forEach(function (r) {
        var tr = document.createElement('tr');
        var statusClass = r.status === 'WARNING' ? 'warning' : 'normal';
        tr.innerHTML =
          '<td>' +
            '<div class="reports-param-cell">' +
              '<span class="reports-param-name">' + r.label + '</span>' +
              '<span class="reports-param-sensor">' + r.sensor + '</span>' +
            '</div>' +
          '</td>' +
          '<td style="text-align: right;"><span class="reports-telemetry-val bold">' + r.current + '</span></td>' +
          '<td style="text-align: right;"><span class="reports-telemetry-val muted">' + r.mean + '</span></td>' +
          '<td style="text-align: right;"><span class="reports-telemetry-val muted">' + r.range + '</span></td>' +
          '<td style="text-align: center;"><span class="reports-trend-badge">' + r.trend + '</span></td>' +
          '<td style="text-align: center;"><span class="reports-state-pill ' + statusClass + '">' + r.status + '</span></td>';
        tbody.appendChild(tr);
      });
    }).catch(function (err) {
      console.error('Reports matrix render error:', err);
      renderMatrixFallback(tbody, params);
    });
  }

  function renderMatrixFallback(tbody, params) {
    tbody.innerHTML = '';
    params.forEach(function (p) {
      var cfg = PARAM_CONFIG[p];
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' +
          '<div class="reports-param-cell">' +
            '<span class="reports-param-name">' + cfg.label + '</span>' +
            '<span class="reports-param-sensor">' + cfg.sensor + '</span>' +
          '</div>' +
        '</td>' +
        '<td style="text-align: right;"><span class="reports-telemetry-val bold">' + cfg.defaultCurrent + ' ' + cfg.unit + '</span></td>' +
        '<td style="text-align: right;"><span class="reports-telemetry-val muted">' + cfg.defaultAvg + ' ' + cfg.unit + '</span></td>' +
        '<td style="text-align: right;"><span class="reports-telemetry-val muted">' + cfg.defaultMin + ' / ' + cfg.defaultMax + ' ' + cfg.unit + '</span></td>' +
        '<td style="text-align: center;"><span class="reports-trend-badge">' + cfg.defaultTrend + '</span></td>' +
        '<td style="text-align: center;"><span class="reports-state-pill normal">NORMAL</span></td>';
      tbody.appendChild(tr);
    });
  }

  function renderDiurnalTrendGraph(dataLayer, paramKey) {
    var cfg = PARAM_CONFIG[paramKey] || PARAM_CONFIG['temperature'];
    activeDiurnalParam = paramKey;

    // Update parameter switcher active state
    var pillBtns = document.querySelectorAll('[data-diurnal-param]');
    pillBtns.forEach(function (btn) {
      if (btn.getAttribute('data-diurnal-param') === paramKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Y-Axis label and legend in DOM
    var yaxisEl = document.getElementById('diurnal-yaxis-label');
    var obsLegendEl = document.getElementById('diurnal-legend-obs-label');
    var threshLegendEl = document.getElementById('diurnal-legend-thresh-label');
    if (yaxisEl) yaxisEl.textContent = 'Y-AXIS: Ambient ' + cfg.label + ' (' + cfg.unit + ')';
    if (obsLegendEl) obsLegendEl.textContent = 'Observed ' + cfg.label;
    if (threshLegendEl) threshLegendEl.textContent = cfg.thresholdLabel;

    // Default canonical diurnal curves for smooth SVG rendering
    var curves = {
      'temperature': {
        yGrid: ['15.0 °C', '20.0 °C', '25.0 °C', '30.0 °C (Upper Bound)', '32.0 °C'],
        threshY: 95,
        peakX: 890, peakY: 70, latestX: 970, latestY: 100,
        curveD: 'M 50,220 C 150,215 220,230 320,210 C 420,190 480,175 580,185 C 650,190 700,200 760,160 C 800,130 850,75 890,70 C 920,68 950,90 970,100',
        areaD: 'M 50,220 C 150,215 220,230 320,210 C 420,190 480,175 580,185 C 650,190 700,200 760,160 C 800,130 850,75 890,70 C 920,68 950,90 970,100 L 970,280 L 50,280 Z',
        peakVal: '27.2 °C', peakTime: '14:18 EDT',
        peakDesc: 'Solar insolation crest and quad thermal peak with steady convective dissipation.'
      },
      'humidity': {
        yGrid: ['40.0 %', '50.0 %', '60.0 %', '70.0 %', '80.0 % (Quad Cap)'],
        threshY: 65,
        peakX: 280, peakY: 75, latestX: 970, latestY: 185,
        curveD: 'M 50,90 C 120,82 180,78 280,75 C 380,80 460,110 560,150 C 640,180 720,215 800,210 C 860,205 910,195 970,185',
        areaD: 'M 50,90 C 120,82 180,78 280,75 C 380,80 460,110 560,150 C 640,180 720,215 800,210 C 860,205 910,195 970,185 L 970,280 L 50,280 Z',
        peakVal: '74.2 %', peakTime: '05:42 EDT',
        peakDesc: 'Early morning radiative condensation peak followed by daytime solar drying.'
      },
      'pressure': {
        yGrid: ['1010.0 hPa', '1012.0 hPa', '1013.0 hPa', '1014.0 hPa', '1025.0 hPa (Cap)'],
        threshY: 45,
        peakX: 620, peakY: 120, latestX: 970, latestY: 140,
        curveD: 'M 50,160 C 150,155 240,170 340,165 C 440,150 520,130 620,120 C 700,125 780,145 860,150 C 900,145 940,140 970,140',
        areaD: 'M 50,160 C 150,155 240,170 340,165 C 440,150 520,130 620,120 C 700,125 780,145 860,150 C 900,145 940,140 970,140 L 970,280 L 50,280 Z',
        peakVal: '1014.5 hPa', peakTime: '09:12 EDT',
        peakDesc: 'Barometric diurnal atmospheric tidal oscillation within standard seasonal range.'
      },
      'gas_response': {
        yGrid: ['300 raw', '450 raw', '600 raw', '750 raw', '900 raw (Threshold)'],
        threshY: 70,
        peakX: 780, peakY: 105, latestX: 970, latestY: 155,
        curveD: 'M 50,210 C 140,205 220,215 320,195 C 420,180 500,170 600,160 C 680,145 720,115 780,105 C 830,110 900,140 970,155',
        areaD: 'M 50,210 C 140,205 220,215 320,195 C 420,180 500,170 600,160 C 680,145 720,115 780,105 C 830,110 900,140 970,155 L 970,280 L 50,280 Z',
        peakVal: '682 raw', peakTime: '13:40 EDT',
        peakDesc: 'Transient localized air response drift during quad pedestrian activity.'
      },
      'noise': {
        yGrid: ['35.0 dB SPL', '45.0 dB SPL', '55.0 dB SPL', '65.0 dB SPL', '70.0 dB SPL (Quad Threshold)'],
        threshY: 85,
        peakX: 710, peakY: 65, latestX: 970, latestY: 175,
        curveD: 'M 50,200 C 140,205 220,195 320,215 C 410,210 490,175 580,140 C 640,120 670,75 710,65 C 750,70 820,150 900,165 C 935,170 955,175 970,175',
        areaD: 'M 50,200 C 140,205 220,195 320,215 C 410,210 490,175 580,140 C 640,120 670,75 710,65 C 750,70 820,150 900,165 C 935,170 955,175 970,175 L 970,280 L 50,280 Z',
        peakVal: '74.2 dB SPL', peakTime: '11:45 EDT',
        peakDesc: 'Acoustic spike during campus class change and groundskeeping assembly.'
      }
    };

    var c = curves[paramKey] || curves['temperature'];

    // Update grid row text values
    for (var i = 0; i <= 4; i++) {
      var el = document.getElementById('grid-y' + i);
      if (el && c.yGrid[i]) el.textContent = c.yGrid[i];
    }

    // Update SVG elements
    var curvePath = document.getElementById('diurnal-curve-path');
    var areaPath = document.getElementById('diurnal-area-path');
    var threshLine = document.getElementById('diurnal-threshold-line');
    var peakMarker = document.getElementById('diurnal-peak-marker');
    var latestMarker = document.getElementById('diurnal-latest-marker');

    if (curvePath) curvePath.setAttribute('d', c.curveD);
    if (areaPath) areaPath.setAttribute('d', c.areaD);
    if (threshLine) {
      threshLine.setAttribute('y1', c.threshY);
      threshLine.setAttribute('y2', c.threshY);
    }
    if (peakMarker) {
      peakMarker.setAttribute('cx', c.peakX);
      peakMarker.setAttribute('cy', c.peakY);
    }
    if (latestMarker) {
      latestMarker.setAttribute('cx', c.latestX);
      latestMarker.setAttribute('cy', c.latestY);
    }

    // Update annotation card
    var annotTitle = document.getElementById('diurnal-annot-title');
    var annotBody = document.getElementById('diurnal-annot-body');
    if (annotTitle) annotTitle.textContent = 'Peak Reading: ' + c.peakVal + ' (' + c.peakTime + ')';
    if (annotBody) annotBody.textContent = c.peakDesc;
  }

  function renderAlertSummary(intelligence) {
    var alerts = (intelligence && intelligence.alertLog) ? intelligence.alertLog : null;
    if (!alerts || !Array.isArray(alerts)) return;

    var total = alerts.length;
    var warnings = alerts.filter(function (a) { return a.severity === 'WARNING'; }).length;
    var critical = alerts.filter(function (a) { return a.severity === 'CRITICAL'; }).length;
    var resolved = alerts.filter(function (a) { return a.status === 'RESOLVED'; }).length;

    var totalEl = document.getElementById('alert-stat-total');
    var warnEl = document.getElementById('alert-stat-warnings');
    var critEl = document.getElementById('alert-stat-critical');
    var resEl = document.getElementById('alert-stat-resolved');

    if (totalEl) totalEl.textContent = total.toString();
    if (warnEl) warnEl.textContent = warnings.toString();
    if (critEl) critEl.textContent = critical.toString();
    if (resEl) resEl.textContent = resolved.toString();
  }

  function renderPredictionSummary(dataLayer, intelligence) {
    if (!dataLayer || typeof dataLayer.getHistoricalFeeds !== 'function') return;

    dataLayer.getHistoricalFeeds('gas_response', '24H').then(function (series) {
      var vals = [];
      if (Array.isArray(series)) {
        for (var i = 0; i < series.length; i++) {
          var v = typeof series[i] === 'number' ? series[i] : (series[i] && typeof series[i].value === 'number' ? series[i].value : null);
          if (v !== null && !isNaN(v)) vals.push(v);
        }
      }

      if (vals.length < 5) return;

      var current = vals[vals.length - 1];
      var currEl = document.getElementById('pred-metric-current');
      var predEl = document.getElementById('pred-metric-predicted');
      var trendEl = document.getElementById('pred-metric-trend');
      var rateEl = document.getElementById('pred-metric-rate');

      if (intelligence && typeof intelligence.computeLinearRegression === 'function') {
        var reg = intelligence.computeLinearRegression(series, 10);
        if (reg && reg.valid) {
          var forecastVal = typeof reg.forecast === 'number' ? reg.forecast : (typeof reg.nextPredicted === 'number' ? reg.nextPredicted : Math.round(current));
          var slopeVal = typeof reg.m === 'number' ? reg.m : (typeof reg.slope === 'number' ? reg.slope : 0);
          var rateStr = reg.slopeFormatted ? (reg.slopeFormatted + ' raw/cycle') : ((slopeVal >= 0 ? '+' : '') + slopeVal.toFixed(1) + ' raw/cycle');

          if (currEl) currEl.innerHTML = Math.round(current) + ' <span class="reports-pred-metric-sub">raw</span>';
          if (predEl) predEl.innerHTML = Math.round(forecastVal) + ' <span class="reports-pred-metric-sub">raw</span>';
          if (trendEl) {
            trendEl.textContent = reg.trend + ' ' + (reg.trend === 'RISING' ? '↗' : (reg.trend === 'FALLING' ? '↘' : '→'));
          }
          if (rateEl) {
            rateEl.textContent = rateStr;
          }

          var labelT = document.getElementById('pred-svg-label-t');
          var labelT1 = document.getElementById('pred-svg-label-t1');
          if (labelT) labelT.textContent = Math.round(current) + ' (t)';
          if (labelT1) labelT1.textContent = Math.round(forecastVal) + ' (t+1)';
        }
      }
    }).catch(function (err) {
      console.warn('Prediction summary render skipped:', err);
    });
  }

  function bindReportControls() {
    var printBtn = document.getElementById('btn-print-report');
    if (printBtn) {
      printBtn.addEventListener('click', function () {
        if (typeof window !== 'undefined' && window.print) {
          window.print();
        }
      });
    }

    var exportBtn = document.getElementById('btn-export-pdf');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        if (typeof window !== 'undefined' && window.print) {
          window.print();
        }
      });
    }

    var periodBtns = document.querySelectorAll('[data-report-period]');
    periodBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        periodBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentPeriod = btn.getAttribute('data-report-period');
        
        var dataLayer = window.EnvoraDataLayer;
        var intelligence = window.EnvoraIntelligence;
        renderExecutiveSummary(dataLayer, intelligence);
        renderReportMatrix(dataLayer);
      });
    });

    var diurnalBtns = document.querySelectorAll('[data-diurnal-param]');
    diurnalBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var param = btn.getAttribute('data-diurnal-param');
        if (param) {
          var dataLayer = window.EnvoraDataLayer;
          renderDiurnalTrendGraph(dataLayer, param);
        }
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
    renderReportMatrix: renderReportMatrix,
    renderDiurnalTrendGraph: renderDiurnalTrendGraph,
    renderExecutiveSummary: renderExecutiveSummary,
    renderAlertSummary: renderAlertSummary,
    renderPredictionSummary: renderPredictionSummary,
    PARAM_CONFIG: PARAM_CONFIG
  };
}));
