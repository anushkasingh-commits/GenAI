import React, { useState } from 'react';
import { Heart, Copy, Check, ExternalLink, Lightbulb, RefreshCw, Tag, Sparkles } from 'lucide-react';

// Category emoji dictionary for visual delight
const CATEGORY_EMOJIS = {
  'Tech & Gadgets': '⚡',
  'Tech': '⚡',
  'Electronics': '📱',
  'Fashion & Style': '👗',
  'Fashion': '✨',
  'Home & Living': '🏡',
  'Home Decor': '🛋️',
  'Books & Stationery': '📚',
  'Books': '📖',
  'Wellness & Self-Care': '🧘',
  'Self-care': '💆',
  'Gourmet & Food': '☕',
  'Food': '🍫',
  'Experiences & Activities': '🎟️',
  'Experience': '🎡',
  'Creative & Hobby': '🎨',
  'Art & Craft': '🖌️',
  'Fitness & Sports': '🏃',
  'Jewelry & Accessories': '💎',
};

export default function GiftCard({ gift, isSaved, onToggleSave, onCopyToast }) {
  const [copied, setCopied] = useState(false);

  const categoryEmoji = CATEGORY_EMOJIS[gift.category] || '🎁';
  const scorePercent = Math.min(100, Math.max(10, ((gift.suitabilityScore || 9) / 10) * 100));

  const handleCopy = () => {
    const text = `🎁 ${gift.name}\n💰 Price: ${gift.estimatedPrice}\n⭐ Suitability: ${gift.suitabilityScore}/10\n🏷️ Category: ${gift.category}\n📝 ${gift.description}\n💡 Why this gift: ${gift.whySuitable}\n🔄 Alternative: ${gift.alternative}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (onCopyToast) onCopyToast(`Copied "${gift.name}" to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getSearchUrl = (query) => {
    return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query + ' India price')}`;
  };

  return (
    <div className="gift-card animate-fade-in">
      <div>
        {/* Top Header: Category & Price */}
        <div className="gift-card-top">
          <span className="category-pill">
            <span>{categoryEmoji}</span>
            <span>{gift.category}</span>
          </span>
          <span className="price-badge">{gift.estimatedPrice}</span>
        </div>

        {/* Gift Title */}
        <h3 className="gift-title">{gift.name}</h3>

        {/* Description */}
        <p className="gift-description">{gift.description}</p>

        {/* Suitability Score Bar */}
        <div className="suitability-box">
          <div className="suitability-header">
            <span>Suitability Score</span>
            <span className="suitability-score-val">
              <span>⭐</span>
              <span>{gift.suitabilityScore} / 10</span>
            </span>
          </div>
          <div className="suitability-bar-track">
            <div 
              className="suitability-bar-fill" 
              style={{ width: `${scorePercent}%` }}
              title={`Score: ${gift.suitabilityScore} / 10`}
            />
          </div>
        </div>

        {/* Why this gift is a good choice */}
        <div className="reason-box">
          <div className="reason-title">
            <Lightbulb size={14} />
            <span>Why this is a great choice</span>
          </div>
          <p className="reason-text">{gift.whySuitable}</p>
        </div>

        {/* Alternative Gift */}
        {gift.alternative && (
          <div className="alt-gift-box">
            <span className="alt-label">🔄 Alternative:</span>
            <span>{gift.alternative}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="card-actions">
        <button
          type="button"
          className={`card-action-btn favorite-btn ${isSaved ? 'active' : ''}`}
          onClick={() => onToggleSave(gift)}
          title={isSaved ? 'Remove from Saved' : 'Save to Favorites'}
          aria-label="Save gift"
        >
          <Heart size={15} fill={isSaved ? '#f43f5e' : 'none'} color={isSaved ? '#f43f5e' : 'currentColor'} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          type="button"
          className="card-action-btn copy-btn"
          onClick={handleCopy}
          title="Copy gift details"
          aria-label="Copy gift details"
        >
          {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <a
          href={getSearchUrl(gift.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="card-action-btn buy-search-btn"
          title="Find online shopping options"
        >
          <span>Find Online</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
