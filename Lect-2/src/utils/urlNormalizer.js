/**
 * URL Normalizer & Helper Utilities
 */

/**
 * Normalizes a URL and provides clear feedback on what changed
 * @param {string} input 
 * @returns {Object} { normalized: string, wasModified: boolean, changes: string[] }
 */
export function normalizeUrlDetails(input) {
  if (!input) return { normalized: '', wasModified: false, changes: [] };

  const trimmed = input.trim();
  const changes = [];

  if (trimmed !== input) {
    changes.push('Trimmed leading/trailing whitespace');
  }

  // Suggest HTTPS if scheme is missing entirely
  let target = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    // If it looks like a domain (e.g. github.com, example.org/page)
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      target = `https://${trimmed}`;
      changes.push('Added missing https:// protocol prefix');
    }
  }

  try {
    const url = new URL(target);
    const originalHost = target.includes(url.hostname) ? '' : 'Normalized domain casing to lowercase';
    if (originalHost) changes.push(originalHost);

    // If input had no path and target has only trailing slash, strip trailing slash for clean suggestion
    let normalized = url.toString();
    if (url.pathname === '/' && !trimmed.endsWith('/') && !trimmed.includes('/')) {
      normalized = `${url.protocol}//${url.host}`;
    }

    return {
      normalized,
      wasModified: changes.length > 0,
      changes
    };
  } catch {
    return {
      normalized: target,
      wasModified: changes.length > 0,
      changes
    };
  }
}

/**
 * Formats a long URL for display with intelligent truncation in the middle
 * @param {string} url 
 * @param {number} maxLen 
 * @returns {string}
 */
export function formatDisplayUrl(url, maxLen = 60) {
  if (!url) return '';
  if (url.length <= maxLen) return url;

  const half = Math.floor((maxLen - 3) / 2);
  return `${url.substring(0, half)}...${url.substring(url.length - half)}`;
}
