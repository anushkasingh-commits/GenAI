import React, { useState } from 'react';
import { 
  Globe, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Info,
  Server,
  Hash,
  FileCode
} from 'lucide-react';

export function DestinationPreview({ validation, onCopyUrl }) {
  const [copied, setCopied] = useState(false);

  if (!validation || !validation.isValid || !validation.details) {
    return null;
  }

  const { details, normalizedUrl } = validation;

  const handleCopy = () => {
    onCopyUrl(normalizedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="destination-preview-card" aria-labelledby="preview-title">
      <div className="preview-card-header">
        <div className="preview-header-left">
          <Globe size={18} className="preview-header-icon" aria-hidden="true" />
          <h2 id="preview-title" className="preview-card-title">Destination Verification</h2>
        </div>
        <div className="preview-header-badges">
          {details.isHttps ? (
            <span className="badge badge-success" title="Secure encrypted HTTPS connection">
              <Lock size={12} aria-hidden="true" />
              <span>HTTPS ✓</span>
            </span>
          ) : (
            <span className="badge badge-warning" title="Unencrypted HTTP connection">
              <Unlock size={12} aria-hidden="true" />
              <span>HTTP ⚠️</span>
            </span>
          )}
          <span className="badge badge-info">
            <CheckCircle2 size={12} aria-hidden="true" />
            <span>Format Valid ✓</span>
          </span>
        </div>
      </div>

      {/* Primary Full URL Display */}
      <div className="preview-url-container">
        <div className="preview-url-label">Encoded Destination URL:</div>
        <div className="preview-url-box">
          <span className="preview-protocol-highlight">{details.protocol}//</span>
          <strong className="preview-domain-highlight">{details.hostname}</strong>
          {details.port && (details.port !== '80' && details.port !== '443') && (
            <span className="preview-port-highlight">:{details.port}</span>
          )}
          <span className="preview-path-highlight">
            {details.pathname !== '/' ? details.pathname : ''}
            {details.search}
            {details.hash}
          </span>
        </div>
        <button
          type="button"
          className="preview-copy-btn"
          onClick={handleCopy}
          title="Copy exact destination URL"
          aria-label="Copy destination URL"
        >
          {copied ? <Check size={14} className="icon-success" /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Detailed URL Breakdown Grid */}
      <div className="preview-breakdown-grid">
        <div className="breakdown-item">
          <span className="breakdown-label">
            <Server size={13} aria-hidden="true" /> Hostname / Domain
          </span>
          <span className="breakdown-value domain-val">{details.hostname}</span>
        </div>

        <div className="breakdown-item">
          <span className="breakdown-label">
            <FileCode size={13} aria-hidden="true" /> Path
          </span>
          <span className="breakdown-value mono-val">
            {details.pathname || '/'}
          </span>
        </div>

        {details.queryParamsCount > 0 && (
          <div className="breakdown-item">
            <span className="breakdown-label">
              <Hash size={13} aria-hidden="true" /> Query Params
            </span>
            <span className="breakdown-value param-val">
              {details.queryParamsCount} active {details.queryParamsCount === 1 ? 'param' : 'params'}
            </span>
          </div>
        )}

        <div className="breakdown-item">
          <span className="breakdown-label">
            <Info size={13} aria-hidden="true" /> Payload Size
          </span>
          <span className="breakdown-value length-val">
            {normalizedUrl.length} characters
          </span>
        </div>
      </div>

      {/* Anti-Misleading Direct Encoding Guarantee */}
      <div className="anti-misleading-notice">
        <Info size={14} className="notice-icon" aria-hidden="true" />
        <p className="notice-text">
          <strong>Direct Destination Guarantee:</strong> When scanned, this QR code will open{' '}
          <span className="font-mono">{details.hostname}</span> directly. No intermediate tracking redirects or third-party gateways are added.
        </p>
      </div>
    </div>
  );
}
