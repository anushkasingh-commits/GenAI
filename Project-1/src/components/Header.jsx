import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';

export default function Header({ savedCount, onOpenSaved, onLogoClick }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-logo" onClick={onLogoClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onLogoClick()}>
          <div className="logo-icon-wrapper">
            <span>🎁</span>
          </div>
          <div className="brand-text">
            <h1 className="gradient-text">GiftGenie</h1>
            <p>AI Personalized Gift Advisor</p>
          </div>
        </div>

        <div className="header-actions">
          <button 
            type="button"
            className="saved-gifts-btn" 
            onClick={onOpenSaved}
            aria-label={`View Saved Gifts (${savedCount})`}
          >
            <Bookmark size={17} className="text-pink-400" />
            <span>Saved Gifts</span>
            <span className="saved-count-badge">{savedCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
