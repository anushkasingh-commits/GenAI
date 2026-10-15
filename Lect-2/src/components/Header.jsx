import React from 'react';
import { 
  QrCode, 
  Sun, 
  Moon, 
  Layers, 
  Sparkles, 
  ScanLine, 
  ShieldCheck, 
  History,
  Command
} from 'lucide-react';

export function Header({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  onOpenTemplates,
  onOpenScanner,
  onOpenSecurityInfo,
  historyCount = 0,
  onToggleHistory,
  isHistoryOpen
}) {
  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="brand-wrapper">
          <div className="brand-logo" aria-hidden="true">
            <QrCode className="logo-icon" size={24} />
          </div>
          <div className="brand-info">
            <h1 className="brand-title">
              QR<span className="brand-gradient-text">Forge</span>
            </h1>
            <span className="brand-tagline">Secure & Scannable</span>
          </div>
        </div>

        {/* Navigation / Mode Tabs */}
        <nav className="header-nav" aria-label="Main Navigation">
          <div className="mode-toggle-pill" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'single'}
              className={`pill-tab ${activeTab === 'single' ? 'active' : ''}`}
              onClick={() => setActiveTab('single')}
            >
              <QrCode size={16} aria-hidden="true" />
              <span>Single URL</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'batch'}
              className={`pill-tab ${activeTab === 'batch' ? 'active' : ''}`}
              onClick={() => setActiveTab('batch')}
            >
              <Layers size={16} aria-hidden="true" />
              <span>Batch Mode</span>
            </button>
          </div>
        </nav>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Templates Button */}
          <button
            type="button"
            className="action-btn"
            onClick={onOpenTemplates}
            title="Choose a QR style preset"
            aria-label="Open QR Templates"
          >
            <Sparkles size={18} aria-hidden="true" />
            <span className="action-btn-text">Presets</span>
          </button>

          {/* Test Scanner Button */}
          <button
            type="button"
            className="action-btn"
            onClick={onOpenScanner}
            title="Test QR Code with Camera or Direct Decoder"
            aria-label="Open QR Code Scanner"
          >
            <ScanLine size={18} aria-hidden="true" />
            <span className="action-btn-text">Test Scanner</span>
          </button>

          {/* History Toggle Button */}
          <button
            type="button"
            className={`action-btn ${isHistoryOpen ? 'active-action' : ''}`}
            onClick={onToggleHistory}
            title="View recent QR codes"
            aria-label={`View history (${historyCount} saved)`}
          >
            <History size={18} aria-hidden="true" />
            <span className="action-btn-text">History</span>
            {historyCount > 0 && (
              <span className="history-badge" aria-hidden="true">
                {historyCount}
              </span>
            )}
          </button>

          {/* Security Info Button */}
          <button
            type="button"
            className="action-btn-icon"
            onClick={onOpenSecurityInfo}
            title="Privacy & Security Architecture"
            aria-label="Privacy and Security information"
          >
            <ShieldCheck size={19} aria-hidden="true" />
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            type="button"
            className="action-btn-icon theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={19} className="theme-icon-sun" aria-hidden="true" />
            ) : (
              <Moon size={19} className="theme-icon-moon" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
