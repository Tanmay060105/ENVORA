/**
 * ENVORA — Application Shell Foundation
 * Source of Truth: Stitch References & docs/16_VISUAL_REFERENCE_GUIDE.md
 * 
 * Responsibilities:
 * - Provides consistent shared navigation across the 6 application pages.
 * - Handles active page route highlighting derived directly from Stitch.
 * - Adheres strictly to the minimum implementation necessary without unsupported additions.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EnvoraAppShell = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // The 6 canonical application destinations
  var NAV_ITEMS = [
    { id: 'dashboard', label: '01 Dashboard', url: 'dashboard.html' },
    { id: 'live-monitoring', label: '02 Live Monitoring', url: 'live-monitoring.html' },
    { id: 'historical-analysis', label: '03 Historical Analysis', url: 'historical-analysis.html' },
    { id: 'prediction', label: '04 Prediction', url: 'prediction.html' },
    { id: 'alerts', label: '05 Alerts', url: 'alerts.html' },
    { id: 'reports', label: '06 Reports', url: 'reports.html' }
  ];

  /**
   * Identifies the current active navigation item based on current location.
   * @returns {string} The active navigation route URL.
   */
  function getActiveRoute() {
    var path = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
    for (var i = 0; i < NAV_ITEMS.length; i++) {
      if (path.indexOf(NAV_ITEMS[i].url) !== -1) {
        return NAV_ITEMS[i].url;
      }
    }
    return 'dashboard.html'; // default fallback
  }

  /**
   * Renders the shared navigation markup into a target container element.
   * @param {HTMLElement|string} target - Container element or selector string.
   */
  function renderNav(target) {
    var container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) return;

    var activeUrl = getActiveRoute();

    var navHtml = '<nav class="envora-nav" aria-label="Main Navigation">' +
      '<div class="envora-nav-brand">' +
        '<a href="dashboard.html" class="brand-link">ENVORA</a>' +
      '</div>' +
      '<ul class="envora-nav-list" role="menubar">';

    for (var i = 0; i < NAV_ITEMS.length; i++) {
      var item = NAV_ITEMS[i];
      var isActive = (item.url === activeUrl);
      var ariaAttr = isActive ? ' aria-current="page"' : '';
      var activeClass = isActive ? ' nav-item-active' : '';

      navHtml += '<li class="nav-item' + activeClass + '" role="none">' +
        '<a href="' + item.url + '" class="nav-link" role="menuitem"' + ariaAttr + '>' +
          item.label +
        '</a>' +
      '</li>';
    }

    navHtml += '</ul></nav>';
    container.innerHTML = navHtml;
  }

  /**
   * Initializes the application shell on DOMContentLoaded.
   */
  function init() {
    var navContainer = document.querySelector('[data-envora-shell-nav]');
    if (navContainer) {
      renderNav(navContainer);
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
    NAV_ITEMS: NAV_ITEMS,
    getActiveRoute: getActiveRoute,
    renderNav: renderNav,
    init: init
  };
}));
