import React from 'react';
import { 
  History, 
  RotateCw, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  ShieldCheck,
  Globe,
  X
} from 'lucide-react';
import { formatTimeAgo } from '../utils/timeAgo';

export function HistoryList({
  history = [],
  onSelectUrl,
  onDeleteHistoryItem,
  onClearHistory,
  onClose,
  onShowToast
}) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    onShowToast?.('URL copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="history-panel" role="region" aria-label="QR Code History">
      <div className="history-header">
        <div className="history-title-group">
          <History size={18} className="history-header-icon" aria-hidden="true" />
          <h2 className="history-heading">Recent QR Codes</h2>
          <span className="history-count-tag">{history.length}</span>
        </div>
        <div className="history-header-actions">
          {history.length > 0 && (
            <button
              type="button"
              className="btn-clear-history"
              onClick={onClearHistory}
              title="Clear all local history"
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>Clear All</span>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className="btn-close-history"
              onClick={onClose}
              aria-label="Close history panel"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="history-privacy-banner">
        <ShieldCheck size={14} className="privacy-icon" aria-hidden="true" />
        <span>Stored 100% locally in your browser. URLs are never sent to external servers.</span>
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="history-empty-state">
          <Clock size={32} className="empty-clock-icon" aria-hidden="true" />
          <p className="empty-history-text">No recent QR codes yet.</p>
          <span className="empty-history-sub">Your generated URLs will be safely remembered here.</span>
        </div>
      ) : (
        <div className="history-list-items">
          {history.map((item) => (
            <div key={item.id} className="history-item-card">
              <div className="history-item-left">
                <div className="history-item-domain-row">
                  <Globe size={14} className="domain-icon" aria-hidden="true" />
                  <strong className="history-domain">{item.domain}</strong>
                  <span className={`history-protocol-badge ${item.protocol === 'HTTPS' ? 'badge-https' : 'badge-http'}`}>
                    {item.protocol}
                  </span>
                </div>
                <div className="history-url-text font-mono" title={item.url}>
                  {item.url}
                </div>
                <div className="history-time-row">
                  <Clock size={12} aria-hidden="true" />
                  <span>{formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>

              <div className="history-item-actions">
                <button
                  type="button"
                  className="btn-history-action btn-regenerate"
                  onClick={() => onSelectUrl(item.url)}
                  title="Generate this QR Code again"
                  aria-label={`Regenerate QR Code for ${item.domain}`}
                >
                  <RotateCw size={14} aria-hidden="true" />
                  <span>Generate</span>
                </button>

                <button
                  type="button"
                  className="btn-history-action btn-copy"
                  onClick={() => handleCopy(item)}
                  title="Copy URL"
                  aria-label="Copy URL"
                >
                  {copiedId === item.id ? <Check size={14} className="icon-success" /> : <Copy size={14} />}
                </button>

                <button
                  type="button"
                  className="btn-history-action btn-delete"
                  onClick={() => onDeleteHistoryItem(item.id)}
                  title="Delete from history"
                  aria-label="Delete entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
