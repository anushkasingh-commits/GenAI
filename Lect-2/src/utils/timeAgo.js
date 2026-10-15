/**
 * Relative time formatter for history timestamps
 * @param {number | Date} timestamp 
 * @returns {string} e.g. "Just now", "2m ago", "1h ago", "Yesterday"
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return '';

  const now = Date.now();
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diffSeconds = Math.max(0, Math.floor((now - time) / 1000));

  if (diffSeconds < 30) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(time).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}
