import React, { useEffect } from 'react';
import { X, Trash2, ExternalLink, Copy, Bookmark, ShoppingBag } from 'lucide-react';

export default function SavedGiftsModal({
  isOpen,
  onClose,
  savedGifts,
  onRemoveGift,
  onClearAll,
  onCopyToast,
}) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyItem = (gift) => {
    const text = `🎁 ${gift.name} (${gift.estimatedPrice})\n- Category: ${gift.category}\n- ${gift.whySuitable}`;
    navigator.clipboard.writeText(text);
    if (onCopyToast) onCopyToast(`Copied "${gift.name}" details!`);
  };

  const getSearchUrl = (query) => {
    return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query + ' India price')}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3>
            <Bookmark size={20} className="text-pink-400" />
            <span>Saved Gift Ideas ({savedGifts.length})</span>
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {savedGifts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎁</div>
              <h4 style={{ color: 'var(--text-main)', marginBottom: '6px' }}>No saved gifts yet</h4>
              <p style={{ fontSize: '0.88rem' }}>
                Click the "Save" heart icon on any gift recommendation card to keep track of your favorites!
              </p>
            </div>
          ) : (
            <div className="saved-items-list">
              {savedGifts.map((gift) => (
                <div key={gift.id || gift.name} className="saved-item-row">
                  <div className="saved-item-info">
                    <h4>{gift.name}</h4>
                    <div className="saved-item-meta">
                      <span style={{ color: '#34d399', fontWeight: '700' }}>{gift.estimatedPrice}</span>
                      <span>•</span>
                      <span>{gift.category}</span>
                      <span>•</span>
                      <span style={{ color: '#fbbf24' }}>⭐ {gift.suitabilityScore}/10</span>
                    </div>
                  </div>

                  <div className="saved-item-actions">
                    <button
                      type="button"
                      className="card-action-btn"
                      onClick={() => handleCopyItem(gift)}
                      title="Copy gift info"
                    >
                      <Copy size={14} />
                    </button>

                    <a
                      href={getSearchUrl(gift.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-action-btn buy-search-btn"
                      title="Find online"
                    >
                      <ExternalLink size={14} />
                    </a>

                    <button
                      type="button"
                      className="card-action-btn"
                      style={{ color: '#f87171' }}
                      onClick={() => onRemoveGift(gift)}
                      title="Remove from saved"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {savedGifts.length > 0 && (
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              onClick={onClearAll}
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>

            <button
              type="button"
              className="btn-primary-sm"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
