/**
 * ENVORA — Client-Side Data Layer Boundary (Phase 2 Data Integration)
 * Source of Truth: Approved Phase 2 Implementation Plan, docs/07_DATA_CONTRACT.md,
 * and docs/08_INTEGRATION_SPECIFICATION.md
 * 
 * Responsibilities:
 * - Single point of access for application telemetry and historical data.
 * - Connects to ThingSpeak (historical feeds) and Blynk (live telemetry polling).
 * - Enforces the strict 5-parameter data contract (zero PM / AQI).
 * - Implements 15-second in-memory response caching adhering to API rate limits.
 * - Standardizes data normalization and null-safety without calculating environmental status.
 * - Provides graceful fallback to cached observations or deterministic DEMO fixtures.
 * - Strict zero-credential storage in browser persistence.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraDataLayer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Strict 5-parameter schema identifiers
  var PARAMETERS = Object.freeze({
    TEMPERATURE: 'temperature',
    HUMIDITY: 'humidity',
    PRESSURE: 'pressure',
    GAS_RESPONSE: 'gas_response',
    NOISE: 'noise'
  });

  // Locked cache time-to-live: exactly 15 seconds (docs/08 §1.2 & §3)
  var CACHE_TTL_MS = 15000;

  // Runtime In-Memory Configuration (Never stored in browser persistent storage)
  var _config = {
    thingspeakChannelId: '',
    thingspeakReadKey: '',
    blynkAuthToken: '',
    mode: 'DEMO'
  };

  // Check for safe global config if loaded in browser
  if (typeof window !== 'undefined' && window.ENVORA_CONFIG) {
    _config.thingspeakChannelId = window.ENVORA_CONFIG.thingspeakChannelId || '';
    _config.thingspeakReadKey = window.ENVORA_CONFIG.thingspeakReadKey || '';
    _config.blynkAuthToken = window.ENVORA_CONFIG.blynkAuthToken || '';
    _config.mode = window.ENVORA_CONFIG.mode === 'LIVE' ? 'LIVE' : 'DEMO';
  }

  // In-Memory Cache Store
  var _cache = {};

  // Deterministic sample fixtures representing nominal campus conditions
  var NOMINAL_LATEST_FIXTURE = Object.freeze({
    timestamp: '2026-11-20T14:32:00Z',
    temperature: 24.8,       // °C (BME280)
    humidity: 61.0,          // % RH (BME280)
    pressure: 1013.2,        // hPa (BME280)
    gas_response: 469,       // Raw Index (MQ-135)
    noise: 48.0,             // dB SPL (INMP441)
    availability: {
      temperature: true,
      humidity: true,
      pressure: true,
      gas_response: true,
      noise: true
    },
    freshness: 'LIVE',
    online: true,
    mode: 'DEMO',
    source: 'DEMO',
    error: null
  });

  // Deterministic historical fixtures (15 sequential records for testing charts)
  var DETERMINISTIC_HISTORICAL_FIXTURE = [
    { timestamp: '2026-11-20T11:00:00Z', temperature: 23.5, humidity: 64.0, pressure: 1012.8, gas_response: 420, noise: 46.2 },
    { timestamp: '2026-11-20T11:15:00Z', temperature: 23.7, humidity: 63.5, pressure: 1012.9, gas_response: 428, noise: 47.1 },
    { timestamp: '2026-11-20T11:30:00Z', temperature: 23.9, humidity: 63.0, pressure: 1013.0, gas_response: 435, noise: 45.8 },
    { timestamp: '2026-11-20T11:45:00Z', temperature: 24.1, humidity: 62.5, pressure: 1013.0, gas_response: 447, noise: 48.0 },
    { timestamp: '2026-11-20T12:00:00Z', temperature: 24.3, humidity: 62.0, pressure: 1013.1, gas_response: 456, noise: 52.4 },
    { timestamp: '2026-11-20T12:15:00Z', temperature: 24.5, humidity: 61.8, pressure: 1013.1, gas_response: 469, noise: 49.3 },
    { timestamp: '2026-11-20T12:30:00Z', temperature: 24.6, humidity: 61.5, pressure: 1013.2, gas_response: 471, noise: 50.1 },
    { timestamp: '2026-11-20T12:45:00Z', temperature: 24.7, humidity: 61.2, pressure: 1013.2, gas_response: 478, noise: 47.8 },
    { timestamp: '2026-11-20T13:00:00Z', temperature: 24.8, humidity: 61.0, pressure: 1013.2, gas_response: 486, noise: 48.5 },
    { timestamp: '2026-11-20T13:15:00Z', temperature: 24.8, humidity: 61.0, pressure: 1013.3, gas_response: 493, noise: 47.2 },
    { timestamp: '2026-11-20T13:30:00Z', temperature: 24.9, humidity: 60.8, pressure: 1013.3, gas_response: 501, noise: 51.0 },
    { timestamp: '2026-11-20T13:45:00Z', temperature: 25.0, humidity: 60.5, pressure: 1013.2, gas_response: 508, noise: 49.6 },
    { timestamp: '2026-11-20T14:00:00Z', temperature: 25.0, humidity: 60.4, pressure: 1013.2, gas_response: 512, noise: 48.8 },
    { timestamp: '2026-11-20T14:15:00Z', temperature: 24.9, humidity: 60.7, pressure: 1013.2, gas_response: 519, noise: 47.9 },
    { timestamp: '2026-11-20T14:30:00Z', temperature: 24.8, humidity: 61.0, pressure: 1013.2, gas_response: 524, noise: 48.0 }
  ];

  /**
   * Helper: Cache accessor
   */
  function getCached(key) {
    var entry = _cache[key];
    if (entry && (Date.now() - entry.time < CACHE_TTL_MS)) {
      return entry.data;
    }
    return null;
  }

  /**
   * Helper: Cache writer
   */
  function setCached(key, data) {
    _cache[key] = {
      time: Date.now(),
      data: data
    };
  }

  /**
   * Helper: Clears the in-memory cache
   */
  function clearCache() {
    _cache = {};
  }

  /**
   * Helper: Converts input to safe number or null
   */
  function parseSensorNumber(val) {
    if (val === null || val === undefined || val === '') return null;
    var num = parseFloat(val);
    return isNaN(num) ? null : num;
  }

  /**
   * Normalizes a raw ThingSpeak feed record into the authoritative 5-parameter contract.
   * Field Mapping (docs/07 §1):
   * field1 -> temperature, field2 -> humidity, field3 -> pressure, field4 -> gas_response, field5 -> noise
   */
  function normalizeThingSpeakRecord(feed) {
    if (!feed) return null;

    var temp = parseSensorNumber(feed.field1);
    var hum = parseSensorNumber(feed.field2);
    var press = parseSensorNumber(feed.field3);
    var gas = parseSensorNumber(feed.field4);
    var noise = parseSensorNumber(feed.field5);

    var timestamp = feed.created_at || new Date().toISOString();
    try {
      var d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        timestamp = d.toISOString();
      }
    } catch (e) {
      timestamp = new Date().toISOString();
    }

    return {
      timestamp: timestamp,
      temperature: temp,
      humidity: hum,
      pressure: press,
      gas_response: gas,
      noise: noise,
      availability: {
        temperature: temp !== null,
        humidity: hum !== null,
        pressure: press !== null,
        gas_response: gas !== null,
        noise: noise !== null
      },
      freshness: 'LIVE',
      online: true,
      mode: 'LIVE',
      source: 'THINGSPEAK',
      error: null
    };
  }

  /**
   * Normalizes a raw Blynk payload into the authoritative 5-parameter contract.
   * Virtual Pin Mapping (docs/07 §1):
   * v1 -> temperature, v2 -> humidity, v3 -> pressure, v4 -> gas_response, v5 -> noise
   */
  function normalizeBlynkPayload(raw, isConnected) {
    var temp = parseSensorNumber(raw.v1 || raw.V1);
    var hum = parseSensorNumber(raw.v2 || raw.V2);
    var press = parseSensorNumber(raw.v3 || raw.V3);
    var gas = parseSensorNumber(raw.v4 || raw.V4);
    var noise = parseSensorNumber(raw.v5 || raw.V5);

    var online = (isConnected === true || isConnected === 'true');

    return {
      timestamp: new Date().toISOString(),
      temperature: temp,
      humidity: hum,
      pressure: press,
      gas_response: gas,
      noise: noise,
      availability: {
        temperature: temp !== null,
        humidity: hum !== null,
        pressure: press !== null,
        gas_response: gas !== null,
        noise: noise !== null
      },
      freshness: online ? 'LIVE' : 'OFFLINE',
      online: online,
      mode: 'LIVE',
      source: 'BLYNK',
      error: null
    };
  }

  /**
   * Safe fetch abstraction supporting browser and node test environments.
   */
  function safeFetch(url, options) {
    var fetchFn = null;
    if (typeof fetch === 'function') {
      fetchFn = fetch;
    } else if (typeof global !== 'undefined' && typeof global.fetch === 'function') {
      fetchFn = global.fetch;
    }

    if (!fetchFn) {
      return Promise.reject(new Error('Fetch API is unavailable in current runtime environment.'));
    }

    return fetchFn(url, options || {});
  }

  /**
   * Fetches latest telemetry from Blynk via periodic REST polling.
   */
  function pollBlynkTelemetry() {
    if (!_config.blynkAuthToken) {
      return Promise.reject(new Error('Blynk Auth Token is not configured.'));
    }

    var token = encodeURIComponent(_config.blynkAuthToken);
    var dataUrl = 'https://blynk.cloud/external/api/get?token=' + token + '&v1&v2&v3&v4&v5';
    var statusUrl = 'https://blynk.cloud/external/api/isHardwareConnected?token=' + token;

    var statusPromise = safeFetch(statusUrl)
      .then(function (res) { return res.text(); })
      .then(function (text) { return text.trim() === 'true'; })
      .catch(function () { return false; });

    var dataPromise = safeFetch(dataUrl)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Blynk HTTP error ' + res.status);
        }
        return res.json();
      });

    return Promise.all([dataPromise, statusPromise]).then(function (results) {
      var rawData = results[0];
      var isConnected = results[1];
      return normalizeBlynkPayload(rawData, isConnected);
    });
  }

  /**
   * Fetches historical feeds from ThingSpeak.
   */
  function fetchThingSpeakHistorical(parameter, windowKey) {
    if (!_config.thingspeakChannelId) {
      return Promise.reject(new Error('ThingSpeak Channel ID is not configured.'));
    }

    var channelId = encodeURIComponent(_config.thingspeakChannelId);
    var resultsCount = 96; // default 24h window
    if (windowKey === '7D') resultsCount = 672;
    if (windowKey === '30D') resultsCount = 2880;

    var url = 'https://api.thingspeak.com/channels/' + channelId + '/feeds.json?results=' + resultsCount;
    if (_config.thingspeakReadKey) {
      url += '&api_key=' + encodeURIComponent(_config.thingspeakReadKey);
    }

    return safeFetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('ThingSpeak HTTP error ' + res.status);
        }
        return res.json();
      })
      .then(function (json) {
        if (!json || !json.feeds || !Array.isArray(json.feeds)) {
          throw new Error('Malformed ThingSpeak feeds payload.');
        }

        var normalizedList = [];
        for (var i = 0; i < json.feeds.length; i++) {
          var rec = normalizeThingSpeakRecord(json.feeds[i]);
          if (rec && rec[parameter] !== null) {
            normalizedList.push({
              timestamp: rec.timestamp,
              value: rec[parameter]
            });
          }
        }
        return normalizedList;
      });
  }

  /**
   * Public: Retrieves current telemetry readings.
   * In LIVE mode, polls Blynk (or cached). Falls back to cached data with STALE flag or DEMO fixture.
   */
  function getLatestTelemetry() {
    var cacheKey = 'telemetry_latest';

    // 1. In DEMO mode or missing credentials: return deterministic fixture immediately
    if (_config.mode !== 'LIVE' || !_config.blynkAuthToken) {
      return Promise.resolve(Object.assign({}, NOMINAL_LATEST_FIXTURE));
    }

    // 2. Check 15-second in-memory cache
    var cached = getCached(cacheKey);
    if (cached) {
      return Promise.resolve(Object.assign({}, cached));
    }

    // 3. Poll Blynk REST API
    return pollBlynkTelemetry().then(function (normalized) {
      setCached(cacheKey, normalized);
      return Object.assign({}, normalized);
    }).catch(function (err) {
      // 4. Fallback on network or cloud error
      if (_cache[cacheKey] && _cache[cacheKey].data) {
        var staleRecord = Object.assign({}, _cache[cacheKey].data);
        staleRecord.freshness = 'STALE';
        staleRecord.error = err.message;
        return staleRecord;
      }

      var fallback = Object.assign({}, NOMINAL_LATEST_FIXTURE);
      fallback.freshness = 'STALE';
      fallback.error = err.message;
      return fallback;
    });
  }

  /**
   * Public: Retrieves historical time-series records for a specific parameter.
   * Strictly enforces the 5-parameter contract. Rejects unapproved metrics.
   */
  function getHistoricalFeeds(parameter, windowKey) {
    var validParams = Object.values(PARAMETERS);
    if (validParams.indexOf(parameter) === -1) {
      return Promise.reject(new Error('Invalid parameter: ' + parameter + '. Only the 5 approved parameters are supported.'));
    }

    var winKey = windowKey || '24H';
    var cacheKey = 'hist_' + parameter + '_' + winKey;

    // 1. In DEMO mode or missing channel ID: return deterministic fixture immediately
    if (_config.mode !== 'LIVE' || !_config.thingspeakChannelId) {
      var demoSeries = DETERMINISTIC_HISTORICAL_FIXTURE.map(function (item) {
        return {
          timestamp: item.timestamp,
          value: item[parameter]
        };
      });
      return Promise.resolve(demoSeries);
    }

    // 2. Check 15-second in-memory cache
    var cached = getCached(cacheKey);
    if (cached) {
      return Promise.resolve(cached.slice());
    }

    // 3. Fetch from ThingSpeak REST API
    return fetchThingSpeakHistorical(parameter, winKey).then(function (series) {
      setCached(cacheKey, series);
      return series.slice();
    }).catch(function (err) {
      // 4. Fallback on network or cloud error
      if (_cache[cacheKey] && _cache[cacheKey].data) {
        return _cache[cacheKey].data.slice();
      }

      var fallbackSeries = DETERMINISTIC_HISTORICAL_FIXTURE.map(function (item) {
        return {
          timestamp: item.timestamp,
          value: item[parameter]
        };
      });
      return fallbackSeries;
    });
  }

  /**
   * Public: Retrieves current hardware status.
   */
  function getDeviceStatus() {
    if (_config.mode !== 'LIVE' || !_config.blynkAuthToken) {
      return Promise.resolve({
        online: true,
        lastTransmission: NOMINAL_LATEST_FIXTURE.timestamp,
        mode: 'DEMO',
        freshness: 'LIVE'
      });
    }

    return getLatestTelemetry().then(function (latest) {
      return {
        online: latest.online,
        lastTransmission: latest.timestamp,
        mode: 'LIVE',
        freshness: latest.freshness
      };
    });
  }

  /**
   * Public: Toggles operational mode between 'LIVE' and 'DEMO'.
   */
  function setMode(mode) {
    _config.mode = (mode === 'LIVE') ? 'LIVE' : 'DEMO';
    clearCache();
    return _config.mode;
  }

  /**
   * Public: Retrieves current operational mode.
   */
  function getMode() {
    return _config.mode;
  }

  /**
   * Public: Sets in-memory runtime credentials for session testing without storage persistence.
   */
  function setRuntimeCredentials(creds) {
    if (!creds || typeof creds !== 'object') return;
    if (creds.thingspeakChannelId !== undefined) _config.thingspeakChannelId = String(creds.thingspeakChannelId);
    if (creds.thingspeakReadKey !== undefined) _config.thingspeakReadKey = String(creds.thingspeakReadKey);
    if (creds.blynkAuthToken !== undefined) _config.blynkAuthToken = String(creds.blynkAuthToken);
    if (creds.mode !== undefined) _config.mode = creds.mode === 'LIVE' ? 'LIVE' : 'DEMO';
    clearCache();
  }

  return {
    PARAMETERS: PARAMETERS,
    CACHE_TTL_MS: CACHE_TTL_MS,
    getLatestTelemetry: getLatestTelemetry,
    getHistoricalFeeds: getHistoricalFeeds,
    getDeviceStatus: getDeviceStatus,
    setMode: setMode,
    getMode: getMode,
    setRuntimeCredentials: setRuntimeCredentials,
    clearCache: clearCache,
    normalizeThingSpeakRecord: normalizeThingSpeakRecord,
    normalizeBlynkPayload: normalizeBlynkPayload
  };
}));
