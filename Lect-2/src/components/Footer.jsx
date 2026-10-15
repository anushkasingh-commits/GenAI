import React from 'react';
import { ShieldCheck, Lock, Command, Sparkles, ExternalLink } from 'lucide-react';

export function Footer({ onOpenSecurityInfo }) {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-brand-column">
            <div className="footer-logo">
              <span className="footer-logo-symbol">◈</span>
              <strong className="footer-logo-name">QRForge</strong>
            </div>
            <p className="footer-desc">
              Production-quality, privacy-first QR code generator. Generates clean, scannable QR codes directly in your browser with zero intermediate tracking.
            </p>
            <div className="footer-security-badge" onClick={onOpenSecurityInfo} role="button" tabIndex={0}>
              <ShieldCheck size={14} className="icon-success" aria-hidden="true" />
              <span>100% Client-Side &bull; Zero Server Logging</span>
            </div>
          </div>

          <div className="footer-shortcuts-column">
            <h4 className="footer-column-title">
              <Command size={14} aria-hidden="true" /> Keyboard Shortcuts
            </h4>
            <ul className="footer-shortcuts-list">
              <li>
                <span className="shortcut-keys"><kbd>⌘</kbd> + <kbd>↵</kbd></span>
                <span className="shortcut-desc">Generate QR Code</span>
              </li>
              <li>
                <span className="shortcut-keys"><kbd>⌘</kbd> + <kbd>K</kbd></span>
                <span className="shortcut-desc">Focus URL Input</span>
              </li>
              <li>
                <span className="shortcut-keys"><kbd>Esc</kbd></span>
                <span className="shortcut-desc">Clear / Close Modal</span>
              </li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4 className="footer-column-title">Security & Integrity</h4>
            <ul className="footer-links-list">
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={onOpenSecurityInfo}
                >
                  Protocol Whitelisting
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={onOpenSecurityInfo}
                >
                  Punycode & IDN Detection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={onOpenSecurityInfo}
                >
                  Anti-Misleading Architecture
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} QRForge &bull; Production Release v1.0.0
          </div>
          <div className="footer-author">
            Built with security & precision
          </div>
        </div>
      </div>
    </footer>
  );
}
