import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({
  message,
  type = 'info', // 'success' | 'error' | 'info' | 'warning'
  onClose,
  duration = 3500
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-container toast-${type}`} role="status" aria-live="polite">
      <div className="toast-icon-wrap" aria-hidden="true">
        {type === 'success' && <CheckCircle2 size={16} />}
        {type === 'error' && <AlertCircle size={16} />}
        {type === 'warning' && <AlertCircle size={16} />}
        {type === 'info' && <Info size={16} />}
      </div>
      <div className="toast-message">{message}</div>
      <button
        type="button"
        className="toast-close-btn"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
