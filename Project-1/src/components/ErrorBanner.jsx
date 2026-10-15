import React from 'react';
import { AlertCircle, RefreshCw, Edit3 } from 'lucide-react';

export default function ErrorBanner({ error, onRetry, onEditPreferences }) {
  const errorMessage = error?.message || error || "Oops! We couldn't generate gift ideas right now. Please try again.";

  return (
    <div className="error-card animate-fade-in">
      <div className="error-icon">
        <AlertCircle size={44} color="#f87171" style={{ margin: '0 auto' }} />
      </div>
      <h3 className="error-title">Recommendation Hiccup</h3>
      <p className="error-desc">{errorMessage}</p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {onEditPreferences && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onEditPreferences}
          >
            <Edit3 size={15} />
            <span>Adjust Details</span>
          </button>
        )}

        {onRetry && (
          <button
            type="button"
            className="btn-primary-sm"
            onClick={onRetry}
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}
