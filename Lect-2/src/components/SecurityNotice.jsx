import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';

export function SecurityNotice({ warnings = [], onDismissWarnings, onEditUrl }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div className="security-notice-card" role="region" aria-label="Security Warnings">
      <div className="security-notice-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="notice-header-title">
          <AlertTriangle size={18} className="warning-icon-pulse" aria-hidden="true" />
          <div className="title-text-group">
            <h3 className="notice-heading">
              Security Notice ({warnings.length} {warnings.length === 1 ? 'advisory' : 'advisories'})
            </h3>
            <span className="notice-sub">Potential risk factors detected in this destination</span>
          </div>
        </div>
        <button
          type="button"
          className="expand-btn"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse security warnings' : 'Expand security warnings'}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="security-notice-body">
          <div className="warning-items-list">
            {warnings.map((warn) => (
              <div key={warn.id} className={`warning-item-row warning-severity-${warn.severity}`}>
                <div className="warning-item-icon" aria-hidden="true">
                  <ShieldAlert size={16} />
                </div>
                <div className="warning-item-content">
                  <strong className="warning-item-title">{warn.title}</strong>
                  <p className="warning-item-msg">{warn.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mandatory Transparent Security Disclaimer */}
          <div className="security-disclaimer-box">
            <Info size={15} className="disclaimer-icon" aria-hidden="true" />
            <p className="disclaimer-text">
              <strong>Important Security Clarification:</strong> This URL has a valid syntax format, but format validation does not guarantee that the destination is safe or trustworthy. Always verify the authenticity of destination domains before distributing QR codes.
            </p>
          </div>

          <div className="warning-actions-row">
            <button
              type="button"
              className="btn-warning-continue"
              onClick={onDismissWarnings}
            >
              Continue With Generation
            </button>
            <button
              type="button"
              className="btn-warning-edit"
              onClick={onEditUrl}
            >
              Edit URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
