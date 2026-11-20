/**
 * ENVORA — Safe Client-Side Configuration Template
 * 
 * Source of Truth: Approved Phase 2 Implementation Plan & docs/12_ENVIRONMENT_CONFIGURATION.md
 * Copy to web/js/config.js for optional local cloud configuration.
 * IMPORTANT: NEVER commit private credentials, Wi-Fi passwords, or auth tokens to version control.
 */

window.ENVORA_CONFIG = {
  // Safe Public Configuration (Public channels require NO API keys for read access)
  thingspeakChannelId: '',

  // Optional Read Key (Only required if channel is private)
  thingspeakReadKey: '',

  // Blynk REST Auth Token (In-memory runtime session parameter only)
  blynkAuthToken: '',

  // Application Mode: 'DEMO' (default) or 'LIVE'
  mode: 'DEMO'
};
