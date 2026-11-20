/**
 * ENVORA — Environmental Intelligence Engine
 * Source of Truth: docs/07_DATA_CONTRACT.md, docs/08_INTEGRATION_SPECIFICATION.md,
 * and Approved Phase 3 Implementation Plan.
 *
 * Provides:
 * 1. Canonical 5-parameter environmental state evaluation & severity arbitration
 * 2. Data availability tracking (COMPLETE vs DEGRADED)
 * 3. Parameter-specific trend tolerance & grounded narrative generation
 * 4. Explainable MQ-135 OLS linear regression (y = mx + b)
 * 5. Dynamic graph bounds calculation with span clamping & padding
 * 6. Alert state transition FSM with anti-oscillation debounce (K=2)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraIntelligence = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 1. CANONICAL THRESHOLD DEFINITIONS (docs/07_DATA_CONTRACT.md Section 2)
  var THRESHOLDS = {
    temperature: {
      label: 'Temperature',
      unit: '°C',
      type: 'upper',
      normalMax: 32.0,
      warningMax: 38.0,
      minSpan: 2.0,
      epsilon: 0.3
    },
    humidity: {
      label: 'Relative Humidity',
      unit: '%',
      type: 'two-sided',
      normalMin: 30.0,
      normalMax: 70.0,
      warningLowerMin: 20.0,
      warningLowerMax: 29.9,
      warningUpperMin: 70.1,
      warningUpperMax: 85.0,
      criticalLowerMax: 20.0,
      criticalUpperMin: 85.0,
      minSpan: 5.0,
      epsilon: 1.0
    },
    pressure: {
      label: 'Atmospheric Pressure',
      unit: 'hPa',
      type: 'two-sided',
      normalMin: 990.0,
      normalMax: 1025.0,
      warningLowerMin: 975.0,
      warningLowerMax: 989.9,
      warningUpperMin: 1025.1,
      warningUpperMax: 1035.0,
      criticalLowerMax: 975.0,
      criticalUpperMin: 1035.0,
      minSpan: 4.0,
      epsilon: 0.5
    },
    gas_response: {
      label: 'MQ-135 Gas Response',
      unit: 'raw',
      type: 'upper',
      normalMax: 900.0,
      warningMax: 1500.0,
      minSpan: 40.0,
      epsilon: 10.0
    },
    noise: {
      label: 'Environmental Noise',
      unit: 'dB SPL',
      type: 'upper',
      normalMax: 65.0,
      warningMax: 80.0,
      minSpan: 5.0,
      epsilon: 1.5
    }
  };

  var SEVERITY_WEIGHT = {
    'NORMAL': 0,
    'WARNING': 1,
    'CRITICAL': 2
  };

  /**
   * Evaluates a single numeric value against parameter thresholds.
   * Returns 'NORMAL', 'WARNING', 'CRITICAL', or 'UNAVAILABLE'.
   */
  function evaluateParameterState(paramKey, val) {
    if (val === null || val === undefined || isNaN(val) || typeof val !== 'number') {
      return 'UNAVAILABLE';
    }

    var cfg = THRESHOLDS[paramKey];
    if (!cfg) return 'NORMAL';

    if (cfg.type === 'upper') {
      if (val > cfg.warningMax) return 'CRITICAL';
      if (val > cfg.normalMax) return 'WARNING';
      return 'NORMAL';
    }

    if (cfg.type === 'two-sided') {
      // Critical check (outermost limits)
      if (val < cfg.criticalLowerMax || val > cfg.criticalUpperMin) {
        return 'CRITICAL';
      }
      // Warning check (between normal and critical)
      if ((val >= cfg.warningLowerMin && val <= cfg.warningLowerMax) ||
          (val >= cfg.warningUpperMin && val <= cfg.warningUpperMax)) {
        return 'WARNING';
      }
      // Normal range
      if (val >= cfg.normalMin && val <= cfg.normalMax) {
        return 'NORMAL';
      }
      // Out-of-bounds boundary fallback
      if (val < cfg.normalMin) return 'WARNING';
      if (val > cfg.normalMax) return 'WARNING';
      return 'NORMAL';
    }

    return 'NORMAL';
  }

  /**
   * Evaluates the complete 5-parameter telemetry object.
   * Decouples Environmental Severity (NORMAL/WARNING/CRITICAL)
   * from Data Availability (COMPLETE/DEGRADED).
   */
  function evaluateEnvironmentalState(telemetry) {
    var params = ['temperature', 'humidity', 'pressure', 'gas_response', 'noise'];
    var paramStates = {};
    var activeCount = 0;
    var maxSeverityWeight = -1;
    var highestState = 'NORMAL';

    if (!telemetry || typeof telemetry !== 'object') {
      params.forEach(function (p) {
        paramStates[p] = { state: 'UNAVAILABLE', value: null, isAvailable: false };
      });
      return {
        overallState: 'UNKNOWN',
        dataAvailability: 'DEGRADED',
        activeCount: 0,
        parameterStates: paramStates,
        summaryText: 'Station telemetry is offline or unreadable.'
      };
    }

    params.forEach(function (p) {
      var val = telemetry[p];
      var state = evaluateParameterState(p, val);
      var isAvail = state !== 'UNAVAILABLE';

      if (isAvail) {
        activeCount++;
        var weight = SEVERITY_WEIGHT[state] !== undefined ? SEVERITY_WEIGHT[state] : 0;
        if (weight > maxSeverityWeight) {
          maxSeverityWeight = weight;
          highestState = state;
        }
      }

      paramStates[p] = {
        state: state,
        value: isAvail ? val : null,
        unit: THRESHOLDS[p].unit,
        label: THRESHOLDS[p].label,
        isAvailable: isAvail
      };
    });

    var overallState = activeCount === 0 ? 'UNKNOWN' : highestState;
    var dataAvailability = activeCount === 5 ? 'COMPLETE' : 'DEGRADED';

    var summaryText = '';
    if (activeCount === 0) {
      summaryText = 'Zero active sensor streams detected. Telemetry is unavailable.';
    } else if (overallState === 'CRITICAL') {
      summaryText = 'Critical threshold breach detected across active sensors. Immediate operator review required.';
    } else if (overallState === 'WARNING') {
      summaryText = 'Environmental parameters are slightly elevated beyond baseline advisory boundaries.';
    } else {
      summaryText = 'All monitored parameters are within nominal campus baseline thresholds with stable conditions.';
    }

    return {
      overallState: overallState,
      dataAvailability: dataAvailability,
      activeCount: activeCount,
      parameterStates: paramStates,
      summaryText: summaryText
    };
  }

  /**
   * Computes dataset-derived graph bounds with minimum span clamping and padding.
   * Resolves the static graph issue while preventing micro-fluctuation jitter.
   */
  function computeDatasetBounds(values, paramKey, paddingRatio) {
    var pad = typeof paddingRatio === 'number' ? paddingRatio : 0.12;
    var cfg = THRESHOLDS[paramKey] || { minSpan: 1.0 };
    var minSpan = cfg.minSpan || 1.0;

    var valid = [];
    if (Array.isArray(values)) {
      for (var i = 0; i < values.length; i++) {
        var v = typeof values[i] === 'number' ? values[i] : (values[i] && typeof values[i].value === 'number' ? values[i].value : null);
        if (v !== null && !isNaN(v) && isFinite(v)) {
          valid.push(v);
        }
      }
    }

    if (valid.length === 0) {
      return { min: 0, max: 100, dataMin: 0, dataMax: 100, span: 100 };
    }

    var dataMin = Math.min.apply(null, valid);
    var dataMax = Math.max.apply(null, valid);
    var rawSpan = dataMax - dataMin;
    var span = Math.max(rawSpan, minSpan);
    var mid = (dataMin + dataMax) / 2;

    var baseMin = mid - (span / 2);
    var baseMax = mid + (span / 2);

    var yMin = baseMin - (span * pad);
    var yMax = baseMax + (span * pad);

    // Safeguard for non-negative sensors
    if (paramKey === 'gas_response' || paramKey === 'noise' || paramKey === 'humidity') {
      if (yMin < 0) {
        yMax += Math.abs(yMin);
        yMin = 0;
      }
    }

    return {
      min: yMin,
      max: yMax,
      dataMin: dataMin,
      dataMax: dataMax,
      span: yMax - yMin
    };
  }

  /**
   * Ordinary Least Squares Linear Regression (y = mx + b)
   * Strictly framed as MQ-135 sensor-response drift per observation interval.
   */
  function computeLinearRegression(series, maxPoints) {
    if (!Array.isArray(series)) {
      return { valid: false, reason: 'INSUFFICIENT_DATA' };
    }

    var validPoints = [];
    for (var i = 0; i < series.length; i++) {
      var item = series[i];
      var val = typeof item === 'number' ? item : (item && typeof item.value === 'number' ? item.value : null);
      var ts = item && item.timestamp ? new Date(item.timestamp).getTime() : null;
      if (val !== null && !isNaN(val) && isFinite(val)) {
        validPoints.push({ val: val, ts: ts });
      }
    }

    var limit = typeof maxPoints === 'number' ? maxPoints : 12;
    if (validPoints.length > limit) {
      validPoints = validPoints.slice(validPoints.length - limit);
    }

    var N = validPoints.length;
    if (N < 5) {
      return { valid: false, reason: 'INSUFFICIENT_DATA', sampleCount: N };
    }

    var sumX = 0;
    var sumY = 0;
    var sumXY = 0;
    var sumXX = 0;

    for (var x = 0; x < N; x++) {
      var y = validPoints[x].val;
      sumX += x;
      sumY += y;
      sumXY += (x * y);
      sumXX += (x * x);
    }

    var denominator = (N * sumXX) - (sumX * sumX);
    if (denominator === 0 || !isFinite(denominator)) {
      return { valid: false, reason: 'CALCULATION_ERROR' };
    }

    var m = ((N * sumXY) - (sumX * sumY)) / denominator;
    var b = (sumY - (m * sumX)) / N;

    if (!isFinite(m) || !isFinite(b)) {
      return { valid: false, reason: 'CALCULATION_ERROR' };
    }

    // Extrapolate to next discrete observation interval (x = N)
    var nextY = (m * N) + b;
    var curY = validPoints[N - 1].val;

    // Trend Polarity Classification: RISING / FALLING / STABLE
    var trend = 'STABLE';
    if (m > 0.5) {
      trend = 'RISING';
    } else if (m < -0.5) {
      trend = 'FALLING';
    }

    // Compute average interval for dynamic horizon label
    var horizonLabel = 'Next Interval (t+1)';
    var firstTs = validPoints[0].ts;
    var lastTs = validPoints[N - 1].ts;
    if (firstTs && lastTs && N > 1 && !isNaN(firstTs) && !isNaN(lastTs)) {
      var deltaSec = Math.round((lastTs - firstTs) / ((N - 1) * 1000));
      if (deltaSec > 0 && deltaSec < 3600) {
        horizonLabel = 'Forecast (t+1, +' + deltaSec + 's)';
      }
    }

    var regressionLine = [];
    for (var k = 0; k < N; k++) {
      regressionLine.push({ x: k, y: (m * k) + b });
    }

    return {
      valid: true,
      sampleCount: N,
      m: m,
      b: b,
      slopeFormatted: (m >= 0 ? '+' : '') + m.toFixed(2),
      trend: trend,
      current: curY,
      forecast: Math.round(nextY),
      forecastRaw: nextY,
      horizonLabel: horizonLabel,
      observedValues: validPoints.map(function (p) { return p.val; }),
      regressionPoints: regressionLine
    };
  }

  /**
   * Computes statistical aggregates & grounded interpretation for Historical Analysis.
   */
  function computeParameterStats(series, paramKey) {
    var cfg = THRESHOLDS[paramKey] || { unit: '', label: paramKey, epsilon: 1.0 };
    var valid = [];

    if (Array.isArray(series)) {
      for (var i = 0; i < series.length; i++) {
        var v = typeof series[i] === 'number' ? series[i] : (series[i] && typeof series[i].value === 'number' ? series[i].value : null);
        if (v !== null && !isNaN(v) && isFinite(v)) {
          valid.push(v);
        }
      }
    }

    if (valid.length === 0) {
      return {
        mean: '--',
        min: '--',
        max: '--',
        current: '--',
        trend: 'UNKNOWN',
        narrative: 'No valid historical telemetry available for this parameter in the selected window.'
      };
    }

    var sum = 0;
    var min = valid[0];
    var max = valid[0];

    for (var j = 0; j < valid.length; j++) {
      var val = valid[j];
      sum += val;
      if (val < min) min = val;
      if (val > max) max = val;
    }

    var mean = sum / valid.length;
    var current = valid[valid.length - 1];
    var initial = valid[0];
    var diff = current - initial;

    var trend = 'STABLE';
    if (diff > cfg.epsilon) {
      trend = 'RISING';
    } else if (diff < -cfg.epsilon) {
      trend = 'FALLING';
    }

    var state = evaluateParameterState(paramKey, current);
    var narrative = generateInterpretation(paramKey, current, state, trend, cfg);

    return {
      mean: mean.toFixed(1),
      min: min.toFixed(1),
      max: max.toFixed(1),
      current: current.toFixed(1),
      trend: trend,
      state: state,
      narrative: narrative
    };
  }

  /**
   * Generates strictly grounded analytical interpretation narrative.
   * Prohibits unmeasured macro-meteorological or composite index claims.
   */
  function generateInterpretation(paramKey, currentVal, state, trend, cfg) {
    var valStr = currentVal.toFixed(1) + ' ' + cfg.unit;

    if (paramKey === 'temperature') {
      return 'Ambient temperature observed at North Quad station is currently ' + state +
        ' (' + valStr + ') with a ' + trend + ' trend over the selected window.';
    }
    if (paramKey === 'humidity') {
      return 'Relative humidity is ' + valStr + ', currently within the configured ' + state +
        ' boundary and exhibiting ' + trend + ' equilibrium.';
    }
    if (paramKey === 'pressure') {
      return 'Atmospheric pressure is ' + state + ' at ' + valStr +
        ' and has remained ' + trend + ' across recent station observations.';
    }
    if (paramKey === 'gas_response') {
      return 'MQ-135 relative sensor response is ' + Math.round(currentVal) + ' raw units, within the ' + state +
        ' baseline band with ' + trend + ' sensor-response drift.';
    }
    if (paramKey === 'noise') {
      return 'Acoustic level measured by INMP441 is ' + valStr +
        ', currently ' + state + ' relative to the campus quiet threshold.';
    }

    return cfg.label + ' reading is ' + valStr + ' (' + state + ') with ' + trend + ' trajectory.';
  }

  /**
   * Deterministic Alert FSM Engine with anti-oscillation debounce (K=2)
   */
  function createAlertFSM() {
    var stateByParam = {};
    var alertIdCounter = 1;
    var alertLog = [];

    var params = ['temperature', 'humidity', 'pressure', 'gas_response', 'noise'];
    params.forEach(function (p) {
      stateByParam[p] = {
        fsmState: 'SAFE', // SAFE, CANDIDATE, ACTIVE, RECOVERING, HELD
        consecutiveBreaches: 0,
        consecutiveSafe: 0,
        candidateTimestamp: null,
        activeAlertId: null
      };
    });

    function processObservation(paramKey, val, timestamp) {
      var rec = stateByParam[paramKey];
      if (!rec) return;

      var severity = evaluateParameterState(paramKey, val);
      var timeStr = timestamp || new Date().toISOString();

      if (severity === 'UNAVAILABLE') {
        if (rec.fsmState === 'ACTIVE') {
          rec.fsmState = 'HELD';
        }
        return;
      }

      var isBreach = (severity === 'WARNING' || severity === 'CRITICAL');

      if (isBreach) {
        rec.consecutiveSafe = 0;
        rec.consecutiveBreaches++;

        if (rec.fsmState === 'SAFE') {
          rec.fsmState = 'CANDIDATE';
          rec.candidateTimestamp = timeStr;
        } else if (rec.fsmState === 'CANDIDATE' && rec.consecutiveBreaches >= 2) {
          rec.fsmState = 'ACTIVE';
          var alertId = alertIdCounter++;
          rec.activeAlertId = alertId;
          alertLog.unshift({
            id: alertId,
            param: THRESHOLDS[paramKey].label,
            paramKey: paramKey,
            value: (typeof val === 'number' ? val.toFixed(1) : val) + ' ' + THRESHOLDS[paramKey].unit,
            rawVal: val,
            thresh: THRESHOLDS[paramKey].type === 'upper' ? '> ' + THRESHOLDS[paramKey].normalMax : '< ' + THRESHOLDS[paramKey].normalMin + ' or > ' + THRESHOLDS[paramKey].normalMax,
            severity: severity,
            status: 'ACTIVE',
            time: timeStr,
            duration: '0s'
          });
        } else if (rec.fsmState === 'ACTIVE' || rec.fsmState === 'HELD') {
          rec.fsmState = 'ACTIVE';
          // Update in-place without generating duplicates
          for (var i = 0; i < alertLog.length; i++) {
            if (alertLog[i].id === rec.activeAlertId) {
              alertLog[i].value = (typeof val === 'number' ? val.toFixed(1) : val) + ' ' + THRESHOLDS[paramKey].unit;
              alertLog[i].rawVal = val;
              if (SEVERITY_WEIGHT[severity] > SEVERITY_WEIGHT[alertLog[i].severity]) {
                alertLog[i].severity = severity;
              }
              break;
            }
          }
        }
      } else {
        // Safe observation
        rec.consecutiveBreaches = 0;
        rec.consecutiveSafe++;

        if (rec.fsmState === 'CANDIDATE') {
          rec.fsmState = 'SAFE';
          rec.candidateTimestamp = null;
        } else if (rec.fsmState === 'ACTIVE' || rec.fsmState === 'HELD') {
          rec.fsmState = 'RECOVERING';
        } else if (rec.fsmState === 'RECOVERING' && rec.consecutiveSafe >= 2) {
          rec.fsmState = 'SAFE';
          // Resolve alert
          if (rec.activeAlertId) {
            for (var j = 0; j < alertLog.length; j++) {
              if (alertLog[j].id === rec.activeAlertId) {
                alertLog[j].status = 'RESOLVED';
                break;
              }
            }
            rec.activeAlertId = null;
          }
        }
      }
    }

    return {
      processObservation: processObservation,
      getAlerts: function (filter) {
        if (!filter || filter === 'ALL') return alertLog;
        return alertLog.filter(function (a) { return a.severity === filter || a.status === filter; });
      },
      getState: function () { return stateByParam; }
    };
  }

  return {
    THRESHOLDS: THRESHOLDS,
    evaluateParameterState: evaluateParameterState,
    evaluateEnvironmentalState: evaluateEnvironmentalState,
    computeDatasetBounds: computeDatasetBounds,
    computeLinearRegression: computeLinearRegression,
    computeParameterStats: computeParameterStats,
    generateInterpretation: generateInterpretation,
    createAlertFSM: createAlertFSM
  };
}));
