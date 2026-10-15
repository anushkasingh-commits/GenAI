import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UrlInput } from './components/UrlInput';
import { DestinationPreview } from './components/DestinationPreview';
import { SecurityNotice } from './components/SecurityNotice';
import { QRPreview } from './components/QRPreview';
import { QRControls } from './components/QRControls';
import { QualityIndicator } from './components/QualityIndicator';
import { HistoryList } from './components/HistoryList';
import { BatchGenerator } from './components/BatchGenerator';
import { TemplatesModal } from './components/TemplatesModal';
import { ScannerModal } from './components/ScannerModal';
import { PrintView } from './components/PrintView';
import { SecurityInfoModal } from './components/SecurityInfoModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { validateUrl } from './utils/urlValidator';
import { normalizeUrlDetails } from './utils/urlNormalizer';
import { getStoredHistory, saveHistoryItem, deleteHistoryItem, clearAllHistory } from './utils/storage';

const DEFAULT_QR_OPTIONS = {
  fgColor: '#090d16',
  bgColor: '#ffffff',
  errorCorrectionLevel: 'M',
  size: 512,
  margin: 2,
  logo: null
};

export function App() {
  const { theme, toggleTheme } = useTheme();

  // Input & Validation State
  const [urlInput, setUrlInput] = useState('https://github.com/anushkasingh-commits');
  const [validation, setValidation] = useState(() => validateUrl('https://github.com/anushkasingh-commits'));
  const [activeUrl, setActiveUrl] = useState('https://github.com/anushkasingh-commits');
  const [normalizationSuggestion, setNormalizationSuggestion] = useState('');
  const [warningsDismissed, setWarningsDismissed] = useState(false);

  // QR Customization Options
  const [qrOptions, setQrOptions] = useState(DEFAULT_QR_OPTIONS);

  // View & Modal States
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch'
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState(() => getStoredHistory());

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isSecurityInfoOpen, setIsSecurityInfoOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null);

  const inputRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // Update validation on input change
  useEffect(() => {
    if (!urlInput.trim()) {
      setValidation(validateUrl(''));
      setNormalizationSuggestion('');
      setWarningsDismissed(false);
      return;
    }

    const valResult = validateUrl(urlInput);
    setValidation(valResult);
    setWarningsDismissed(false);

    // Check normalization suggestion (e.g. if user typed 'github.com/user' without https://)
    if (!valResult.isValid) {
      const norm = normalizeUrlDetails(urlInput);
      if (norm.wasModified && norm.normalized && validateUrl(norm.normalized).isValid) {
        setNormalizationSuggestion(norm.normalized);
      } else {
        setNormalizationSuggestion('');
      }
    } else {
      setNormalizationSuggestion('');
    }
  }, [urlInput]);

  // Handle explicit QR Generation CTA
  const handleGenerate = useCallback(() => {
    if (!urlInput.trim()) {
      showToast('Please enter a URL first', 'warning');
      inputRef.current?.focus();
      return;
    }

    const valResult = validateUrl(urlInput);
    if (!valResult.isValid) {
      showToast(valResult.error || 'Invalid URL format', 'error');
      inputRef.current?.focus();
      return;
    }

    const targetUrl = valResult.normalizedUrl;
    setActiveUrl(targetUrl);

    // Save to local history
    const updatedHistory = saveHistoryItem({
      url: targetUrl,
      domain: valResult.details?.hostname,
      options: qrOptions
    });
    setHistory(updatedHistory);

    showToast('✓ QR Code generated successfully', 'success');
  }, [urlInput, qrOptions, showToast]);

  // Apply auto-fix suggestion
  const handleApplySuggestion = () => {
    if (normalizationSuggestion) {
      setUrlInput(normalizationSuggestion);
      showToast('Applied protocol fix', 'info');
      inputRef.current?.focus();
    }
  };

  // Sample URL quick loader
  const handleSelectSampleUrl = (sample) => {
    setUrlInput(sample);
    const valResult = validateUrl(sample);
    if (valResult.isValid) {
      setActiveUrl(valResult.normalizedUrl);
      const updated = saveHistoryItem({
        url: valResult.normalizedUrl,
        domain: valResult.details?.hostname,
        options: qrOptions
      });
      setHistory(updated);
      showToast(`Loaded "${valResult.details?.hostname}"`, 'info');
    }
  };

  // Keyboard Shortcuts Hook
  useKeyboardShortcut({
    onGenerate: handleGenerate,
    onFocusInput: () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    },
    onEscape: () => {
      if (isTemplatesOpen) setIsTemplatesOpen(false);
      else if (isScannerOpen) setIsScannerOpen(false);
      else if (isPrintOpen) setIsPrintOpen(false);
      else if (isSecurityInfoOpen) setIsSecurityInfoOpen(false);
      else if (isHistoryOpen) setIsHistoryOpen(false);
      else setUrlInput('');
    }
  });

  // History Actions
  const handleDeleteHistory = (id) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
    showToast('Removed from history', 'info');
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all stored QR code history from your browser?')) {
      clearAllHistory();
      setHistory([]);
      showToast('History cleared', 'info');
    }
  };

  const handleResetControls = () => {
    setQrOptions(DEFAULT_QR_OPTIONS);
    showToast('Customization reset to defaults', 'info');
  };

  const handleApplyTemplate = (templateOptions) => {
    setQrOptions(prev => ({
      ...prev,
      ...templateOptions
    }));
    showToast('QR Style Preset applied', 'success');
  };

  return (
    <div className="app-container" data-theme={theme}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenSecurityInfo={() => setIsSecurityInfoOpen(true)}
        historyCount={history.length}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        isHistoryOpen={isHistoryOpen}
      />

      <main className="main-content" id="main-content" role="main">
        {/* Hero Banner with Quick Samples */}
        <Hero onSelectSampleUrl={handleSelectSampleUrl} />

        {activeTab === 'single' ? (
          <div className="generator-grid">
            {/* Left Column: Input, Notices, Destination Preview, Customization, Quality */}
            <div className="generator-left-col">
              <UrlInput
                inputRef={inputRef}
                value={urlInput}
                onChange={setUrlInput}
                onGenerate={handleGenerate}
                validation={validation}
                normalizationSuggestion={normalizationSuggestion}
                onApplySuggestion={handleApplySuggestion}
                onClear={() => setUrlInput('')}
              />

              {/* Security Advisory Warning (if any) */}
              {!warningsDismissed && validation.isValid && validation.warnings?.length > 0 && (
                <SecurityNotice
                  warnings={validation.warnings}
                  onDismissWarnings={() => setWarningsDismissed(true)}
                  onEditUrl={() => inputRef.current?.focus()}
                />
              )}

              {/* Anti-Misleading Destination Preview */}
              {validation.isValid && (
                <DestinationPreview
                  validation={validation}
                  onCopyUrl={(url) => showToast('URL copied to clipboard', 'success')}
                />
              )}

              {/* Quality & Scan Reliability Card */}
              {validation.isValid && (
                <QualityIndicator
                  qrOptions={qrOptions}
                  urlLength={validation.normalizedUrl?.length || 30}
                />
              )}

              {/* QR Customization Controls */}
              <QRControls
                options={qrOptions}
                onChange={setQrOptions}
                onReset={handleResetControls}
              />
            </div>

            {/* Right Column: QR Preview Card & History Drawer */}
            <div className="generator-right-col">
              <QRPreview
                url={validation.isValid ? activeUrl : ''}
                validation={validation}
                options={qrOptions}
                onOpenScanner={() => setIsScannerOpen(true)}
                onOpenPrint={() => setIsPrintOpen(true)}
                onShowToast={showToast}
              />

              {isHistoryOpen && (
                <HistoryList
                  history={history}
                  onSelectUrl={(url) => {
                    setUrlInput(url);
                    handleSelectSampleUrl(url);
                  }}
                  onDeleteHistoryItem={handleDeleteHistory}
                  onClearHistory={handleClearHistory}
                  onClose={() => setIsHistoryOpen(false)}
                  onShowToast={showToast}
                />
              )}
            </div>
          </div>
        ) : (
          /* Batch Generator Mode */
          <BatchGenerator
            options={qrOptions}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Modals */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onApplyTemplate={handleApplyTemplate}
        currentOptions={qrOptions}
      />

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        currentUrl={validation.isValid ? activeUrl : ''}
        qrOptions={qrOptions}
        onShowToast={showToast}
      />

      <PrintView
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        url={validation.isValid ? activeUrl : ''}
        validation={validation}
        options={qrOptions}
      />

      <SecurityInfoModal
        isOpen={isSecurityInfoOpen}
        onClose={() => setIsSecurityInfoOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Footer onOpenSecurityInfo={() => setIsSecurityInfoOpen(true)} />
    </div>
  );
}

export default App;
