import React, { useRef, useEffect } from 'react';
import { 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clipboard, 
  CornerDownLeft, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export function UrlInput({
  value,
  onChange,
  onGenerate,
  validation,
  normalizationSuggestion,
  onApplySuggestion,
  onClear,
  inputRef
}) {
  const localRef = useRef(null);
  const activeInputRef = inputRef || localRef;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
        if (activeInputRef.current) {
          activeInputRef.current.focus();
        }
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unavailable:', err);
    }
  };

  const hasValue = value.length > 0;
  const isInputValid = validation?.isValid;
  const hasError = hasValue && !isInputValid && validation?.error;

  return (
    <div className="url-input-card">
      <div className="input-card-header">
        <label htmlFor="qr-url-input" className="input-field-label">
          <Link2 size={16} aria-hidden="true" />
          <span>Destination URL</span>
        </label>
        <span className="shortcut-hint" title="Keyboard Shortcut">
          <kbd>⌘</kbd> + <kbd>K</kbd> to focus
        </span>
      </div>

      <div className={`input-field-wrapper ${hasError ? 'input-error' : isInputValid ? 'input-valid' : ''}`}>
        <div className="input-leading-icon" aria-hidden="true">
          {isInputValid ? (
            <CheckCircle2 size={20} className="icon-success" />
          ) : hasError ? (
            <AlertCircle size={20} className="icon-error" />
          ) : (
            <Link2 size={20} className="icon-muted" />
          )}
        </div>

        <input
          id="qr-url-input"
          ref={activeInputRef}
          type="text"
          className="url-text-input"
          placeholder="https://example.com/your-destination"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onGenerate();
            }
          }}
          autoComplete="off"
          spellCheck="false"
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? 'url-error-msg' : isInputValid ? 'url-valid-msg' : undefined}
        />

        <div className="input-trailing-actions">
          {hasValue ? (
            <button
              type="button"
              className="input-clear-btn"
              onClick={onClear}
              title="Clear input (Esc)"
              aria-label="Clear input text"
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="input-paste-btn"
              onClick={handlePaste}
              title="Paste from clipboard"
              aria-label="Paste URL from clipboard"
            >
              <Clipboard size={15} aria-hidden="true" />
              <span>Paste</span>
            </button>
          )}
        </div>
      </div>

      {/* Normalization / Auto-fix Suggestion Banner */}
      {normalizationSuggestion && normalizationSuggestion !== value && (
        <div className="suggestion-banner" role="status">
          <div className="suggestion-content">
            <Sparkles size={16} className="suggestion-icon" aria-hidden="true" />
            <span>
              Did you mean: <strong className="suggestion-url">{normalizationSuggestion}</strong>?
            </span>
          </div>
          <button
            type="button"
            className="suggestion-apply-btn"
            onClick={onApplySuggestion}
          >
            Apply Fix <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Error Message Box */}
      {hasError && (
        <div id="url-error-msg" className="url-message-box error-box" role="alert">
          <AlertCircle size={16} className="msg-icon" aria-hidden="true" />
          <div className="msg-body">
            <strong className="msg-title">Invalid Destination</strong>
            <p className="msg-text">{validation.error}</p>
          </div>
        </div>
      )}

      {/* Success Format State */}
      {isInputValid && (
        <div id="url-valid-msg" className="url-message-box success-box" role="status">
          <CheckCircle2 size={16} className="msg-icon" aria-hidden="true" />
          <div className="msg-body">
            <strong className="msg-title">Valid URL Format</strong>
            <p className="msg-text">
              Protocol: <code>{validation.details?.protocol}</code> &bull; Host: <code>{validation.details?.hostname}</code>
            </p>
          </div>
        </div>
      )}

      {/* Generate CTA Button */}
      <div className="generate-cta-wrapper">
        <button
          type="button"
          id="generate-qr-btn"
          className="btn-primary-generate"
          onClick={onGenerate}
          disabled={!hasValue || hasError}
        >
          <Sparkles size={18} aria-hidden="true" />
          <span>Generate QR Code</span>
          <span className="btn-shortcut-pill" aria-hidden="true">
            <kbd>⌘</kbd> + <kbd>↵</kbd>
          </span>
        </button>
      </div>
    </div>
  );
}
