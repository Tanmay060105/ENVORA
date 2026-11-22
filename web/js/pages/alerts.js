/**
 * ENVORA — Alerts Page Controller
 * Source of Truth: Approved Phase 3 & Phase 4.15 Implementation Specifications
 * 
 * Scope: 5-parameter environmental event intelligence, deterministic FSM anti-oscillation
 * event processing (K=2 debounce), active environmental events rendering, chronological
 * audit logging, and threshold breach analysis visualization.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraAlerts = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var currentStatusFilter = 'ALL';
  var currentSeverityFilter = 'ALL';
  var currentParamFilter = 'ALL';
  var alertFsm = null;
  var alertLogData = [];

  function init() {
    var dataLayer = (typeof window !== 'undefined' && window.EnvoraDataLayer) ? window.EnvoraDataLayer : null;
    var intel = (typeof window !== 'undefined' && window.EnvoraIntelligence) ? window.EnvoraIntelligence : null;
    if (!dataLayer) return;

    if (intel) {
      alertFsm = intel.createAlertFSM();
    }

    renderThresholdGrid(dataLayer, intel);
    loadEventHistory(dataLayer, intel);
    bindFilterButtons();
    bindAckButtons();
  }

  function renderThresholdGrid(dataLayer, intel) {
    dataLayer.getLatestTelemetry().then(function (data) {
      if (!data) return;

      var evalRes = intel ? intel.evaluateEnvironmentalState(data) : null;

      function getStatus(paramKey) {
        if (!evalRes || !evalRes.parameterStates[paramKey]) return 'NORMAL';
        return evalRes.parameterStates[paramKey].state;
      }

      setThresholdCard('thresh-temp',
        data.temperature !== undefined && data.temperature !== null ? data.temperature.toFixed(1) + '°C' : 'UNAVAILABLE',
        '< 32.0°C', getStatus('temperature'));

      setThresholdCard('thresh-humidity',
        data.humidity !== undefined && data.humidity !== null ? data.humidity.toFixed(1) + '%' : 'UNAVAILABLE',
        '30.0 - 70.0%', getStatus('humidity'));

      setThresholdCard('thresh-pressure',
        data.pressure !== undefined && data.pressure !== null ? data.pressure.toFixed(1) + ' hPa' : 'UNAVAILABLE',
        '990 - 1025 hPa', getStatus('pressure'));

      setThresholdCard('thresh-gas',
        data.gas_response !== undefined && data.gas_response !== null ? Math.round(data.gas_response) + ' raw' : 'UNAVAILABLE',
        '< 900 raw', getStatus('gas_response'));

      setThresholdCard('thresh-noise',
        data.noise !== undefined && data.noise !== null ? data.noise.toFixed(1) + ' dB' : 'UNAVAILABLE',
        '< 65.0 dB', getStatus('noise'));
    }).catch(function (err) {
      console.error('Threshold grid error:', err);
    });
  }

  function setThresholdCard(prefix, reading, threshold, status) {
    var valEl = document.getElementById(prefix + '-val');
    var limitEl = document.getElementById(prefix + '-limit');
    var statusEl = document.getElementById(prefix + '-status');

    if (valEl) valEl.textContent = reading;
    if (limitEl) limitEl.textContent = 'Threshold: ' + threshold;
    if (statusEl) {
      statusEl.textContent = status;
      statusEl.className = 'badge badge-' + status.toLowerCase();
    }
  }

  function loadEventHistory(dataLayer, intel) {
    if (!alertFsm) {
      renderActiveEvents([]);
      renderAuditTable([]);
      return;
    }

    // Seed canonical audit baseline events with complete 5-parameter historical representation
    var seedEvents = [
      { paramKey: 'pressure', param: 'Atmospheric Pressure', val: 978.2, time: '02:10:00 UTC', desc: 'Barometric low pressure dip', zone: 'North Quad Central', resolve: true, safeVal: 1013.2 },
      { paramKey: 'humidity', param: 'Humidity', val: 78.5, time: '04:12:00 UTC', desc: 'Relative humidity nocturnal crest', zone: 'East Garden Canopy', resolve: true, safeVal: 61.0 },
      { paramKey: 'gas_response', param: 'MQ-135 Gas', val: 980.0, time: '11:42:00 UTC', desc: 'Volatile gas sensor response drift', zone: 'Quad Walkway South', resolve: true, safeVal: 450.0 },
      { paramKey: 'temperature', param: 'Temperature', val: 33.5, time: '14:18:00 UTC', desc: 'Diurnal thermal boundary excursion', zone: 'Sensor Hub North', resolve: false },
      { paramKey: 'noise', param: 'Environmental Noise', val: 74.2, time: '14:26:00 UTC', desc: 'Sustained acoustic perimeter threshold breach', zone: 'West Arch Gate', resolve: false }
    ];

    seedEvents.forEach(function (e) {
      // 2 consecutive readings to activate via FSM (K=2)
      alertFsm.processObservation(e.paramKey, e.val, e.time);
      alertFsm.processObservation(e.paramKey, e.val, e.time);

      // Resolve completed historical events with 2 consecutive safe readings (K=2)
      if (e.resolve) {
        alertFsm.processObservation(e.paramKey, e.safeVal, e.time);
        alertFsm.processObservation(e.paramKey, e.safeVal, e.time);
      }
    });

    alertLogData = alertFsm.getAlerts();
    updateSummaryCounts();
    renderActiveEvents(alertLogData);
    renderAuditTable(alertLogData);
    updateAnalysisVisualization(alertLogData);
  }

  function updateSummaryCounts() {
    var activeCount = 0;
    var resolvedCount = 0;

    alertLogData.forEach(function (a) {
      if (a.status === 'ACTIVE') activeCount++;
      else resolvedCount++;
    });

    var countActiveEl = document.getElementById('alerts-count-active');
    var countResolvedEl = document.getElementById('alerts-count-resolved');
    var countTotalEl = document.getElementById('alerts-count-total');
    var filterActiveCountEl = document.getElementById('filter-active-count');
    var activeTitleEl = document.getElementById('active-events-title');
    var tickerEl = document.getElementById('header-ticker-text');

    if (countActiveEl) countActiveEl.textContent = activeCount + ' Active';
    if (countResolvedEl) countResolvedEl.textContent = resolvedCount + ' Resolved';
    if (countTotalEl) countTotalEl.textContent = alertLogData.length + ' Events (24H)';
    if (filterActiveCountEl) filterActiveCountEl.textContent = activeCount;
    if (activeTitleEl) activeTitleEl.textContent = 'Active Environmental Events (' + activeCount + ')';
    if (tickerEl) tickerEl.textContent = 'Threshold Monitor · ' + activeCount + ' Active Breach' + (activeCount === 1 ? '' : 'es');
  }

  function renderActiveEvents(alerts) {
    var container = document.getElementById('alerts-active-grid');
    if (!container) return;

    var activeAlerts = alerts.filter(function (a) { return a.status === 'ACTIVE'; });
    container.innerHTML = '';

    if (activeAlerts.length === 0) {
      var emptyEl = document.createElement('div');
      emptyEl.className = 'alerts-empty-card';
      emptyEl.innerHTML = '<span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 22px;">verified</span>' +
        '<div><strong style="color: var(--color-primary);">All Parameters Nominal:</strong> Zero active environmental breaches detected across campus monitoring nodes.</div>';
      container.appendChild(emptyEl);
      return;
    }

    activeAlerts.forEach(function (alert) {
      var card = document.createElement('div');
      var isCritical = alert.severity === 'CRITICAL';
      card.className = 'alerts-event-card ' + (isCritical ? 'event-critical' : 'event-warning');

      var zoneStr = alert.paramKey === 'noise' ? 'West Arch Gate' :
                    alert.paramKey === 'gas_response' ? 'Quad Walkway South' :
                    alert.paramKey === 'temperature' ? 'Sensor Hub North' :
                    alert.paramKey === 'humidity' ? 'East Garden Canopy' : 'North Quad Central';

      var descStr = alert.paramKey === 'noise' ? 'Sustained acoustic perimeter threshold breach detected adjacent to west delivery gateway.' :
                    alert.paramKey === 'gas_response' ? 'Elevated volatile gas sensor response detected during localized activity.' :
                    alert.paramKey === 'temperature' ? 'Diurnal thermal boundary excursion exceeding nominal baseline threshold.' :
                    alert.paramKey === 'humidity' ? 'Relative humidity nocturnal crest exceeding nominal baseline threshold.' :
                    'Barometric pressure depression detected below nominal calibrated threshold.';

      var deltaStr = '';
      if (alert.paramKey === 'noise') {
        deltaStr = '+' + (alert.rawVal - 65.0).toFixed(1) + ' dBA above baseline';
      } else if (alert.paramKey === 'temperature') {
        deltaStr = '+' + (alert.rawVal - 32.0).toFixed(1) + '°C above baseline';
      } else if (alert.paramKey === 'gas_response') {
        deltaStr = '+' + Math.round(alert.rawVal - 900) + ' raw above baseline';
      } else if (alert.paramKey === 'humidity') {
        deltaStr = '+' + (alert.rawVal - 70.0).toFixed(1) + '% above baseline';
      } else if (alert.paramKey === 'pressure') {
        deltaStr = (alert.rawVal < 990 ? '-' + (990 - alert.rawVal).toFixed(1) : '+' + (alert.rawVal - 1025).toFixed(1)) + ' hPa delta';
      }

      card.innerHTML = 
        '<div class="alerts-event-top">' +
          '<div class="alerts-event-tag-wrap">' +
            '<span class="badge badge-' + alert.severity.toLowerCase() + '">' + alert.severity + '</span>' +
            '<span class="alerts-event-zone">Zone: ' + zoneStr + '</span>' +
          '</div>' +
          '<div class="alerts-event-duration">' +
            '<span class="pulse-dot"></span>' +
            '<span>Active ' + (alert.paramKey === 'noise' ? '18m' : '14m') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="alerts-event-reading-wrap">' +
          '<div>' +
            '<div class="alerts-event-param">' + alert.param + '</div>' +
            '<div class="alerts-event-scalar">' + alert.value + '</div>' +
          '</div>' +
          '<div class="alerts-event-delta-wrap">' +
            '<span class="alerts-event-delta ' + (isCritical ? 'delta-critical' : 'delta-warning') + '">' + deltaStr + '</span>' +
            '<span class="alerts-event-limit">Threshold: ' + alert.thresh + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="alerts-event-desc">' + descStr + '</p>' +
        '<div class="alerts-event-footer">' +
          '<span>Triggered Today at ' + alert.time + '</span>' +
          '<button class="btn-secondary btn-ack" data-id="' + alert.id + '">Acknowledge</button>' +
        '</div>';

      container.appendChild(card);
    });
  }

  function renderAuditTable(alerts) {
    var tbody = document.getElementById('alerts-table-body');
    var countEl = document.getElementById('alerts-history-count');
    if (!tbody) return;

    var filtered = alerts.filter(function (item) {
      if (currentStatusFilter !== 'ALL' && item.status !== currentStatusFilter) return false;
      if (currentSeverityFilter !== 'ALL' && item.severity !== currentSeverityFilter) return false;
      if (currentParamFilter !== 'ALL') {
        var pKey = item.param.toLowerCase();
        if (currentParamFilter === 'temperature' && !pKey.includes('temp')) return false;
        if (currentParamFilter === 'humidity' && !pKey.includes('humid')) return false;
        if (currentParamFilter === 'pressure' && !pKey.includes('press')) return false;
        if (currentParamFilter === 'gas_response' && !pKey.includes('gas')) return false;
        if (currentParamFilter === 'noise' && !pKey.includes('noise')) return false;
      }
      return true;
    });

    if (countEl) {
      countEl.textContent = 'Displaying ' + filtered.length + ' Event' + (filtered.length === 1 ? '' : 's');
    }

    tbody.innerHTML = '';
    if (filtered.length === 0) {
      var trEmpty = document.createElement('tr');
      trEmpty.innerHTML = '<td colspan="8" style="text-align: center; color: var(--color-text-muted); padding: 1.5rem;">No historical alerts match the active filters.</td>';
      tbody.appendChild(trEmpty);
      return;
    }

    filtered.forEach(function (row) {
      var tr = document.createElement('tr');
      var descStr = row.param.includes('Noise') ? 'Sustained acoustic perimeter threshold breach' :
                    row.param.includes('Gas') ? 'Volatile gas sensor response drift' :
                    row.param.includes('Pressure') ? 'Barometric low pressure dip' :
                    row.param.includes('Humidity') ? 'Relative humidity nocturnal crest' :
                    'Diurnal thermal boundary excursion';

      var isAct = row.status === 'ACTIVE';

      tr.innerHTML = 
        '<td class="font-telemetry" style="font-size: 11px;">' + row.time + '</td>' +
        '<td><strong>' + row.param + '</strong></td>' +
        '<td style="color: var(--color-text-muted); font-size: 12px;">' + descStr + '</td>' +
        '<td class="font-telemetry" style="font-weight: 600; color: ' + (isAct ? '#B84A39' : 'var(--color-primary)') + ';">' + row.value + '</td>' +
        '<td class="font-telemetry" style="color: var(--color-text-muted); font-size: 11px;">Limit ' + row.thresh + '</td>' +
        '<td><span class="badge badge-' + row.severity.toLowerCase() + '">' + row.severity + '</span></td>' +
        '<td><span class="badge ' + (isAct ? 'badge-critical' : 'badge-normal') + '">' +
          (isAct ? '<span class="pulse-dot"></span> Active' : 'Resolved') +
        '</span></td>' +
        '<td style="text-align: right;">' +
          '<button class="btn-secondary btn-ack" data-id="' + row.id + '"' + (!isAct ? ' disabled style="opacity: 0.6; cursor: default;"' : '') + '>' +
            (isAct ? 'Acknowledge' : 'Cleared') +
          '</button>' +
        '</td>';
      tbody.appendChild(tr);
    });
  }

  function updateAnalysisVisualization(alerts) {
    var activeAlert = alerts.find(function (a) { return a.status === 'ACTIVE'; });
    var titleEl = document.getElementById('analysis-title');
    var badgeEl = document.getElementById('analysis-breach-badge');
    var curValEl = document.getElementById('analysis-cur-val');
    var baseValEl = document.getElementById('analysis-base-val');
    var durValEl = document.getElementById('analysis-duration-val');

    if (activeAlert) {
      if (titleEl) titleEl.textContent = activeAlert.param + ' Threshold Exceeded // Breach Progression';
      if (badgeEl) {
        badgeEl.textContent = 'ACTIVE BREACH';
        badgeEl.className = 'badge badge-warning';
      }
      if (curValEl) curValEl.textContent = activeAlert.value;
      if (baseValEl) baseValEl.textContent = activeAlert.thresh.indexOf('Limit') !== -1 ? activeAlert.thresh : 'Limit ' + activeAlert.thresh;
      if (durValEl) durValEl.textContent = '18m';
    } else {
      if (titleEl) titleEl.textContent = 'Environmental Baseline Stability // Nominal Range';
      if (badgeEl) {
        badgeEl.textContent = 'ALL NOMINAL';
        badgeEl.className = 'badge badge-normal';
      }
      if (curValEl) curValEl.textContent = 'Nominal';
      if (baseValEl) baseValEl.textContent = 'Active';
      if (durValEl) durValEl.textContent = '0m';
    }
  }

  function bindFilterButtons() {
    // Status filters
    var statusButtons = document.querySelectorAll('[data-alert-filter]');
    statusButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        statusButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentStatusFilter = btn.getAttribute('data-alert-filter');
        applyFiltersWithCrossfade();
      });
    });

    // Severity filters
    var sevButtons = document.querySelectorAll('[data-severity-filter]');
    sevButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sevButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentSeverityFilter = btn.getAttribute('data-severity-filter');
        applyFiltersWithCrossfade();
      });
    });

    // Parameter filters
    var paramButtons = document.querySelectorAll('[data-param-filter]');
    paramButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        paramButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentParamFilter = btn.getAttribute('data-param-filter');
        applyFiltersWithCrossfade();
      });
    });
  }

  function applyFiltersWithCrossfade() {
    var tbody = document.getElementById('alerts-table-body');
    if (tbody) {
      tbody.style.transition = 'opacity 0.15s ease';
      tbody.style.opacity = '0.35';
      setTimeout(function () {
        renderAuditTable(alertLogData);
        tbody.style.opacity = '1';
      }, 90);
    } else {
      renderAuditTable(alertLogData);
    }
  }

  function bindAckButtons() {
    document.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('btn-ack') && !e.target.disabled) {
        var id = parseInt(e.target.getAttribute('data-id'), 10);
        for (var i = 0; i < alertLogData.length; i++) {
          if (alertLogData[i].id === id) {
            alertLogData[i].status = 'RESOLVED';
            break;
          }
        }
        updateSummaryCounts();
        renderActiveEvents(alertLogData);
        renderAuditTable(alertLogData);
        updateAnalysisVisualization(alertLogData);
      }
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
    renderThresholdGrid: renderThresholdGrid
  };
}));
