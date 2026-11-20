/**
 * ENVORA — Reports Page Controller
 * Source of Truth: Approved Phase 1 Implementation Plan & docs/16_VISUAL_REFERENCE_GUIDE.md
 * 
 * Scope: 5-parameter statistical variance table, qualitative environmental summary,
 * and academic sign-off area. Zero composite scores, zero weather data.
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

  function init() {
    var dataLayer = (typeof window !== 'undefined' && window.EnvoraDataLayer) ? window.EnvoraDataLayer : null;
    if (!dataLayer) return;

    renderReportMatrix(dataLayer);
    bindReportControls();
  }

  function renderReportMatrix(dataLayer) {
    // Exact 5 environmental parameters
    var params = ['temperature', 'humidity', 'pressure', 'gas_response', 'noise'];
    var meta = {
      'temperature': { label: 'Temperature (BME280)', unit: '°C' },
      'humidity': { label: 'Relative Humidity (BME280)', unit: '%' },
      'pressure': { label: 'Atmospheric Pressure (BME280)', unit: 'hPa' },
      'gas_response': { label: 'MQ-135 Gas Response', unit: 'raw' },
      'noise': { label: 'Environmental Noise (INMP441)', unit: 'dB SPL' }
    };

    var tbody = document.getElementById('report-matrix-body');
    if (!tbody) return;

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

        if (vals.length === 0) {
          return {
            param: p,
            label: meta[p].label,
            unit: meta[p].unit,
            mean: 'UNAVAILABLE',
            peak: '--',
            min: '--',
            stdDev: '--'
          };
        }

        var min = Math.min.apply(null, vals);
        var max = Math.max.apply(null, vals);
        var avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
        var variance = vals.reduce(function (a, b) { return a + Math.pow(b - avg, 2); }, 0) / vals.length;
        var stdDev = Math.sqrt(variance);

        return {
          param: p,
          label: meta[p].label,
          unit: meta[p].unit,
          mean: (p === 'gas_response' ? Math.round(avg) : avg.toFixed(1)) + ' ' + meta[p].unit,
          peak: (p === 'gas_response' ? Math.round(max) : max.toFixed(1)) + ' ' + meta[p].unit,
          min: (p === 'gas_response' ? Math.round(min) : min.toFixed(1)) + ' ' + meta[p].unit,
          stdDev: '± ' + stdDev.toFixed(2) + ' ' + meta[p].unit
        };
      });
    });

    Promise.all(promises).then(function (results) {
      tbody.innerHTML = '';
      results.forEach(function (r) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + r.label + '</strong></td>' +
          '<td>' + r.mean + '</td>' +
          '<td>' + r.peak + '</td>' +
          '<td>' + r.min + '</td>' +
          '<td>' + r.stdDev + '</td>';
        tbody.appendChild(tr);
      });
    }).catch(function (err) {
      console.error('Reports table generation error:', err);
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

    var periodBtns = document.querySelectorAll('[data-report-period]');
    var tbody = document.getElementById('report-matrix-body');
    periodBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        periodBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentPeriod = btn.getAttribute('data-report-period');
        if (tbody) {
          tbody.style.transition = 'opacity 0.2s ease';
          tbody.style.opacity = '0.4';
        }
        var dataLayer = window.EnvoraDataLayer;
        if (dataLayer) {
          renderReportMatrix(dataLayer);
          if (tbody) {
            setTimeout(function () { tbody.style.opacity = '1'; }, 150);
          }
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
    renderReportMatrix: renderReportMatrix
  };
}));
