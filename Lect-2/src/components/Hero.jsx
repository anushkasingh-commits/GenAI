import React from 'react';
import { Shield, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export function Hero({ onSelectSampleUrl }) {
  const SAMPLE_URLS = [
    { label: 'GitHub Profile', url: 'https://github.com/anushkasingh-commits', type: 'https' },
    { label: 'Deep Target', url: 'https://example.com/docs/api?version=v2&token=abc123xyz#pricing', type: 'params' },
    { label: 'HTTP Warning Test', url: 'http://insecure-example.org/download', type: 'warning' },
    { label: 'Punycode Test', url: 'https://xn--e1afmkfd.xn--p1ai/test', type: 'warning' },
    { label: 'IP Address Test', url: 'http://192.168.1.100:8080/dashboard', type: 'warning' }
  ];

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-badge-pill">
        <Shield size={14} className="hero-badge-icon" aria-hidden="true" />
        <span>Strict Protocol Validation & Zero Server-Side Logging</span>
      </div>

      <h1 id="hero-title" className="hero-title">
        Generate QR Codes <span className="hero-gradient-text">Instantly.</span>
      </h1>

      <p className="hero-subtitle">
        Turn any valid URL into a high-contrast, scannable QR code. Built with rigorous client-side validation, 
        security warning heuristics, and direct encoding.
      </p>

      {/* Quick Test Samples */}
      <div className="sample-pills-container">
        <span className="sample-pills-label">Quick Test Presets:</span>
        <div className="sample-pills-list">
          {SAMPLE_URLS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className={`sample-pill ${sample.type === 'warning' ? 'sample-pill-warning' : ''}`}
              onClick={() => onSelectSampleUrl(sample.url)}
              title={`Load "${sample.url}"`}
            >
              {sample.type === 'warning' ? (
                <AlertTriangle size={13} className="pill-icon" aria-hidden="true" />
              ) : (
                <CheckCircle2 size={13} className="pill-icon" aria-hidden="true" />
              )}
              <span>{sample.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
