import React, { useState, useMemo } from 'react';
import GiftCard from './GiftCard';
import { RefreshCw, Edit3, Copy, Filter, ArrowUpDown, Sparkles, Check } from 'lucide-react';

export default function GiftResults({
  results,
  recipientSummary,
  onRegenerate,
  onEditPreferences,
  savedGifts,
  onToggleSave,
  onCopyToast,
  isLoading,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('score-desc');
  const [copiedAll, setCopiedAll] = useState(false);

  // Extract unique categories from results
  const categories = useMemo(() => {
    if (!results || !Array.isArray(results)) return ['All'];
    const cats = new Set(results.map((g) => g.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [results]);

  // Numeric helper for price sorting
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const num = String(priceStr).replace(/[^\d.]/g, '');
    return parseFloat(num) || 0;
  };

  // Filtered and sorted results
  const filteredResults = useMemo(() => {
    if (!results || !Array.isArray(results)) return [];

    return results
      .filter((gift) => {
        const matchesCat = selectedCategory === 'All' || gift.category === selectedCategory;
        const matchesScore = (gift.suitabilityScore || 0) >= minScore;
        return matchesCat && matchesScore;
      })
      .sort((a, b) => {
        if (sortBy === 'score-desc') {
          return (b.suitabilityScore || 0) - (a.suitabilityScore || 0);
        }
        if (sortBy === 'price-asc') {
          return parsePrice(a.estimatedPrice) - parsePrice(b.estimatedPrice);
        }
        if (sortBy === 'price-desc') {
          return parsePrice(b.estimatedPrice) - parsePrice(a.estimatedPrice);
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [results, selectedCategory, minScore, sortBy]);

  const handleCopyAll = () => {
    if (!results || !results.length) return;
    const allText = results
      .map(
        (g, idx) =>
          `Gift #${idx + 1}: ${g.name} (${g.estimatedPrice})\n- Category: ${g.category}\n- Suitability: ${g.suitabilityScore}/10\n- Description: ${g.description}\n- Why suitable: ${g.whySuitable}\n- Alternative: ${g.alternative}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(allText).then(() => {
      setCopiedAll(true);
      if (onCopyToast) onCopyToast('Copied all 6 gift recommendations to clipboard!');
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  return (
    <div className="results-container animate-fade-in">
      {/* Results Header Card */}
      <div className="results-header-card">
        <div className="results-meta">
          <h2>
            <span>✨</span>
            <span>Personalized Gift Recommendations</span>
          </h2>
          {recipientSummary && (
            <div className="results-summary-tags">
              <span className="summary-pill">👤 {recipientSummary.relationship}</span>
              <span className="summary-pill">🎂 Age {recipientSummary.age}</span>
              <span className="summary-pill">🎉 {recipientSummary.occasion}</span>
              <span className="summary-pill">💰 {recipientSummary.budget}</span>
            </div>
          )}
        </div>

        <div className="results-actions-top">
          <button
            type="button"
            className="btn-secondary"
            onClick={onEditPreferences}
            disabled={isLoading}
          >
            <Edit3 size={15} />
            <span>Edit Preferences</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopyAll}
          >
            {copiedAll ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            <span>{copiedAll ? 'Copied All' : 'Copy All'}</span>
          </button>

          <button
            type="button"
            className="btn-primary-sm"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Regenerate Ideas</span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Toolbar */}
      <div className="filter-toolbar">
        <div className="category-filter-list">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sort-group">
          <label htmlFor="sort-select" className="sort-label">Sort by:</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="score-desc">⭐ Highest Suitability</option>
            <option value="price-asc">💰 Price: Low to High</option>
            <option value="price-desc">💰 Price: High to Low</option>
            <option value="name-asc">🔤 Name (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Gift Cards Grid */}
      {filteredResults.length > 0 ? (
        <div className="gifts-grid">
          {filteredResults.map((gift) => (
            <GiftCard
              key={gift.id || gift.name}
              gift={gift}
              isSaved={savedGifts.some((s) => s.name === gift.name)}
              onToggleSave={onToggleSave}
              onCopyToast={onCopyToast}
            />
          ))}
        </div>
      ) : (
        <div className="error-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
          <div className="error-icon">🔍</div>
          <h3 className="error-title" style={{ color: 'var(--text-main)' }}>No gifts match your filter</h3>
          <p className="error-desc" style={{ color: 'var(--text-muted)' }}>Try resetting the category filter to "All" to view all 6 suggestions.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setSelectedCategory('All')}
          >
            Reset Category Filter
          </button>
        </div>
      )}
    </div>
  );
}
