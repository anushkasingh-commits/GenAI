/**
 * Local Storage Manager for QRForge History
 * Privacy-first: all data resides strictly inside the user's browser localStorage.
 */

const HISTORY_KEY = 'qrforge_history_v1';
const MAX_HISTORY_ITEMS = 30;

/**
 * Retrieves all stored history items
 * @returns {Array<Object>}
 */
export function getStoredHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read history from localStorage:', e);
    return [];
  }
}

/**
 * Saves a newly generated QR item to history (deduplicating recent entries)
 * @param {Object} item 
 * @returns {Array<Object>} Updated history array
 */
export function saveHistoryItem(item) {
  try {
    const current = getStoredHistory();
    // Filter out identical existing URL to bring it to top
    const filtered = current.filter(h => h.url !== item.url);

    const newItem = {
      id: item.id || `qr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      url: item.url,
      domain: item.domain || extractDomain(item.url),
      timestamp: item.timestamp || Date.now(),
      protocol: item.url.startsWith('https://') ? 'HTTPS' : 'HTTP',
      options: item.options || {}
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save history item:', e);
    return [];
  }
}

/**
 * Removes a single history item by ID
 * @param {string} id 
 * @returns {Array<Object>} Updated history
 */
export function deleteHistoryItem(id) {
  try {
    const current = getStoredHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete history item:', e);
    return [];
  }
}

/**
 * Clears the entire local history
 */
export function clearAllHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'link';
  }
}
