import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { evaluateQRQuality } from '../utils/contrastChecker';

export function QualityIndicator({ qrOptions, urlLength }) {
  const quality = evaluateQRQuality({
    fgColor: qrOptions.fgColor,
    bgColor: qrOptions.bgColor,
    errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    size: qrOptions.size,
    margin: qrOptions.margin,
    hasLogo: Boolean(qrOptions.logo?.src),
    urlLength
  });

  return (
    <div className="quality-indicator-card" aria-label="QR Code Quality and Scannability">
      <div className="quality-header">
        <div className="quality-title-group">
          <Sparkles size={16} className="quality-icon" aria-hidden="true" />
          <h3 className="quality-title">Scan Reliability & Quality</h3>
        </div>
        <div className="quality-badge" style={{ backgroundColor: `${quality.badgeColor}22`, color: quality.badgeColor, borderColor: quality.badgeColor }}>
          {quality.score >= 70 ? (
            <CheckCircle size={13} aria-hidden="true" />
          ) : (
            <AlertCircle size={13} aria-hidden="true" />
          )}
          <span>{quality.label} ({quality.score}%)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quality-meter-track" role="progressbar" aria-valuenow={quality.score} aria-valuemin="0" aria-valuemax="100">
        <div
          className="quality-meter-fill"
          style={{
            width: `${quality.score}%`,
            backgroundColor: quality.badgeColor
          }}
        />
      </div>

      {/* Metrics Row */}
      <div className="quality-metrics-row">
        <div className="metric-col">
          <span className="metric-label">Color Contrast:</span>
          <span className="metric-value font-mono">
            {quality.contrastRatio}:1 ({quality.contrastRating})
          </span>
        </div>
        <div className="metric-col">
          <span className="metric-label">Error Recovery:</span>
          <span className="metric-value font-mono">
            Level {qrOptions.errorCorrectionLevel} ({
              qrOptions.errorCorrectionLevel === 'L' ? '~7%' :
              qrOptions.errorCorrectionLevel === 'M' ? '~15%' :
              qrOptions.errorCorrectionLevel === 'Q' ? '~25%' : '~30%'
            })
          </span>
        </div>
      </div>

      {/* Suggestions / Warnings */}
      {quality.suggestions.length > 0 && (
        <div className="quality-suggestions-list">
          {quality.suggestions.map((sugg, idx) => (
            <div key={idx} className="quality-suggestion-item">
              <Info size={13} className="sugg-icon" aria-hidden="true" />
              <span>{sugg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
