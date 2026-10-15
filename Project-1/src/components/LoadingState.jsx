import React, { useState, useEffect } from 'react';

const LOADING_TIPS = [
  '🎁 Finding the perfect gifts...',
  '✨ Analyzing recipient personality and interests...',
  '💰 Evaluating best value within your INR budget...',
  '🎀 Curating thoughtful, non-generic gift recommendations...',
  '🪄 Polishing suitability scores and smart alternatives...',
];

export default function LoadingState() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-wrapper animate-fade-in">
      <div className="gift-box-anim">
        <span>🎁</span>
      </div>
      <h3 className="loading-title gradient-text">GiftGenie is Working Its Magic</h3>
      <p className="loading-tip">{LOADING_TIPS[tipIndex]}</p>

      {/* Skeleton Card Grid */}
      <div className="skeleton-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    </div>
  );
}
