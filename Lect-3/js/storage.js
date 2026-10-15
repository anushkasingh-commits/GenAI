/**
 * Storage Module
 * Handles local/session persistence for API keys, theme preference, and model settings.
 */

const STORAGE_KEYS = {
  API_KEY: 'anushka_tutor_api_key',
  MODEL: 'anushka_tutor_model',
  THEME: 'anushka_tutor_theme'
};

const StorageService = {
  /**
   * Retrieves the saved Gemini API key.
   * Checks sessionStorage first, then localStorage for convenience.
   * @returns {string|null}
   */
  getApiKey() {
    return sessionStorage.getItem(STORAGE_KEYS.API_KEY) || localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  /**
   * Saves the Gemini API key.
   * @param {string} key 
   * @param {boolean} persistAcrossSessions - If true, saves to localStorage; otherwise sessionStorage.
   */
  setApiKey(key, persistAcrossSessions = true) {
    if (!key) return;
    const cleanKey = key.trim();
    if (persistAcrossSessions) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, cleanKey);
    }
    sessionStorage.setItem(STORAGE_KEYS.API_KEY, cleanKey);
  },

  /**
   * Removes any saved API key from storage.
   */
  clearApiKey() {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    sessionStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  /**
   * Checks if an API key is currently configured.
   * @returns {boolean}
   */
  hasApiKey() {
    return Boolean(this.getApiKey());
  },

  /**
   * Retrieves selected Gemini model, defaulting to gemini-2.5-flash.
   * @returns {string}
   */
  getModel() {
    return localStorage.getItem(STORAGE_KEYS.MODEL) || 'gemini-2.5-flash';
  },

  /**
   * Saves selected Gemini model.
   * @param {string} model 
   */
  setModel(model) {
    localStorage.setItem(STORAGE_KEYS.MODEL, model);
  },

  /**
   * Retrieves saved UI theme ('dark-theme' or 'light-theme').
   * @returns {string}
   */
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark-theme';
  },

  /**
   * Saves UI theme.
   * @param {string} theme 
   */
  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }
};
