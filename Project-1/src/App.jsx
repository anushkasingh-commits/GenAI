import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import GiftForm from './components/GiftForm';
import GiftResults from './components/GiftResults';
import SavedGiftsModal from './components/SavedGiftsModal';
import LoadingState from './components/LoadingState';
import ErrorBanner from './components/ErrorBanner';
import './App.css';

const STORAGE_KEY = 'giftgenie_saved_gifts_v1';

export default function App() {
  const [currentStep, setCurrentStep] = useState('form'); // 'form' | 'loading' | 'results' | 'error'
  const [formData, setFormData] = useState(null);
  const [results, setResults] = useState([]);
  const [recipientSummary, setRecipientSummary] = useState(null);
  const [error, setError] = useState(null);
  const [savedGifts, setSavedGifts] = useState([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load saved gifts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedGifts(parsed);
      }
    } catch (err) {
      console.warn('Could not load saved gifts from localStorage:', err);
    }
  }, []);

  // Save to localStorage whenever savedGifts changes
  const updateSavedGifts = (newList) => {
    setSavedGifts(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#fbbf24'],
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Generate recommendations
  const fetchRecommendations = async (params) => {
    setCurrentStep('loading');
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Oops! We couldn't generate gift ideas right now. Please try again.");
      }

      setResults(data.gifts || []);
      setRecipientSummary(data.recipientSummary || params);
      setCurrentStep('results');
      triggerConfetti();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Something went wrong while finding gifts.');
      setCurrentStep('error');
    }
  };

  const handleFormSubmit = (data) => {
    setFormData(data);
    fetchRecommendations(data);
  };

  const handleRegenerate = () => {
    if (formData) {
      fetchRecommendations(formData);
    }
  };

  const handleEditPreferences = () => {
    setCurrentStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = (gift) => {
    const exists = savedGifts.some((g) => g.name === gift.name);
    if (exists) {
      const updated = savedGifts.filter((g) => g.name !== gift.name);
      updateSavedGifts(updated);
      showToast(`Removed "${gift.name}" from saved list`);
    } else {
      const updated = [gift, ...savedGifts];
      updateSavedGifts(updated);
      showToast(`Saved "${gift.name}" to favorites! ❤️`);
    }
  };

  const handleRemoveSaved = (gift) => {
    const updated = savedGifts.filter((g) => g.name !== gift.name);
    updateSavedGifts(updated);
    showToast(`Removed "${gift.name}"`);
  };

  const handleClearAllSaved = () => {
    updateSavedGifts([]);
    showToast('Cleared all saved gifts');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        savedCount={savedGifts.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onLogoClick={() => setCurrentStep('form')}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {currentStep === 'form' && (
          <GiftForm
            onSubmit={handleFormSubmit}
            isLoading={false}
            initialValues={formData}
          />
        )}

        {currentStep === 'loading' && <LoadingState />}

        {currentStep === 'results' && (
          <GiftResults
            results={results}
            recipientSummary={recipientSummary}
            onRegenerate={handleRegenerate}
            onEditPreferences={handleEditPreferences}
            savedGifts={savedGifts}
            onToggleSave={handleToggleSave}
            onCopyToast={showToast}
            isLoading={false}
          />
        )}

        {currentStep === 'error' && (
          <ErrorBanner
            error={error}
            onRetry={handleRegenerate}
            onEditPreferences={handleEditPreferences}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          GiftGenie 🎁 — Personalized gift discovery powered by Gemini AI • Built with React & Express
        </p>
      </footer>

      {/* Saved Gifts Modal Drawer */}
      <SavedGiftsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedGifts={savedGifts}
        onRemoveGift={handleRemoveSaved}
        onClearAll={handleClearAllSaved}
        onCopyToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
