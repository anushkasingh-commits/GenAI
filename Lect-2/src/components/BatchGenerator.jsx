import React, { useState } from 'react';
import { 
  Layers, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileArchive, 
  Copy, 
  Check, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { validateUrl } from '../utils/urlValidator';
import { generateQrDataUrl } from '../utils/qrGenerator';

const SAMPLE_BATCH = `https://github.com/anushkasingh-commits
https://developer.mozilla.org/en-US/docs/Web
https://react.dev
https://vitejs.dev/guide/
https://en.wikipedia.org/wiki/QR_code`;

export function BatchGenerator({ options, onShowToast }) {
  const [inputText, setInputText] = useState(SAMPLE_BATCH);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Parse lines and validate
  const lines = inputText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const batchItems = lines.map((line, index) => {
    const validation = validateUrl(line);
    return {
      id: index,
      raw: line,
      validation
    };
  });

  const validCount = batchItems.filter(item => item.validation.isValid).length;
  const invalidCount = batchItems.length - validCount;

  // Single item PNG download
  const handleDownloadSingle = async (item) => {
    if (!item.validation.isValid) return;
    try {
      const dataUrl = await generateQrDataUrl(item.validation.normalizedUrl, {
        ...options,
        size: 512
      });
      const hostname = item.validation.details?.hostname || `qr_${item.id}`;
      const link = document.createElement('a');
      link.download = `qrforge-${hostname.replace(/[^a-zA-Z0-9.-]/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast?.(`Downloaded QR for ${hostname}`, 'success');
    } catch (err) {
      console.error('Batch single download error:', err);
    }
  };

  // Download All as ZIP archive
  const handleDownloadZip = async () => {
    const validItems = batchItems.filter(item => item.validation.isValid);
    if (validItems.length === 0) {
      onShowToast?.('No valid URLs to generate QR codes for.', 'error');
      return;
    }

    setIsProcessing(true);
    onShowToast?.('Compiling QR code archive...', 'info');

    try {
      const zip = new JSZip();
      const folder = zip.folder('qrforge-batch-qrcodes');

      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        const dataUrl = await generateQrDataUrl(item.validation.normalizedUrl, {
          ...options,
          size: 1024
        });
        // Convert base64 dataUrl to blob
        const base64Data = dataUrl.split(',')[1];
        const hostname = item.validation.details?.hostname || `qr-${i + 1}`;
        const cleanName = `${i + 1}_${hostname.replace(/[^a-zA-Z0-9.-]/g, '_')}.png`;
        folder.file(cleanName, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `qrforge-batch-${validItems.length}-qrcodes.zip`);
      onShowToast?.(`Successfully exported ${validItems.length} QR codes as ZIP!`, 'success');
    } catch (err) {
      console.error('Batch ZIP generation failed:', err);
      onShowToast?.('Failed to create ZIP package', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (item, idx) => {
    navigator.clipboard.writeText(item.validation.normalizedUrl);
    setCopiedIndex(idx);
    onShowToast?.('URL copied to clipboard', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="batch-generator-container" aria-label="Batch QR Code Generator">
      <div className="batch-hero-card">
        <div className="batch-hero-header">
          <div className="batch-title-group">
            <Layers size={22} className="batch-icon" aria-hidden="true" />
            <div>
              <h2 className="batch-heading">Batch QR Code Generator</h2>
              <p className="batch-sub">Enter multiple URLs (one per line) to batch-generate and download all at once.</p>
            </div>
          </div>
          <div className="batch-header-actions">
            <button
              type="button"
              className="btn-batch-sample"
              onClick={() => setInputText(SAMPLE_BATCH)}
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>Load Sample List</span>
            </button>
            <button
              type="button"
              className="btn-batch-clear"
              onClick={() => setInputText('')}
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Multi-line textarea */}
        <div className="batch-textarea-wrapper">
          <textarea
            className="batch-textarea font-mono"
            rows={6}
            placeholder="https://example.com/link1&#10;https://example.com/link2&#10;https://example.com/link3"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Batch Stats & Download All Bar */}
        <div className="batch-stats-bar">
          <div className="batch-stat-chips">
            <span className="stat-chip chip-total">
              <strong>{batchItems.length}</strong> Total URLs
            </span>
            <span className="stat-chip chip-valid">
              <CheckCircle2 size={13} aria-hidden="true" />
              <strong>{validCount}</strong> Valid
            </span>
            {invalidCount > 0 && (
              <span className="stat-chip chip-invalid">
                <AlertCircle size={13} aria-hidden="true" />
                <strong>{invalidCount}</strong> Invalid
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn-download-all-zip"
            onClick={handleDownloadZip}
            disabled={validCount === 0 || isProcessing}
          >
            <FileArchive size={17} aria-hidden="true" />
            <span>{isProcessing ? 'Packaging ZIP...' : `Download All (${validCount}) as ZIP`}</span>
          </button>
        </div>
      </div>

      {/* Batch Results Grid */}
      {batchItems.length > 0 && (
        <div className="batch-results-grid">
          {batchItems.map((item, idx) => (
            <div
              key={idx}
              className={`batch-result-card ${item.validation.isValid ? 'card-valid' : 'card-invalid'}`}
            >
              <div className="batch-card-header">
                <span className="batch-card-num">#{idx + 1}</span>
                {item.validation.isValid ? (
                  <span className="badge badge-success">
                    <CheckCircle2 size={12} aria-hidden="true" /> Valid
                  </span>
                ) : (
                  <span className="badge badge-error">
                    <AlertCircle size={12} aria-hidden="true" /> Invalid
                  </span>
                )}
              </div>

              {item.validation.isValid ? (
                <div className="batch-valid-content">
                  <div className="batch-domain-text">
                    <ExternalLink size={13} aria-hidden="true" />
                    <strong>{item.validation.details?.hostname}</strong>
                  </div>
                  <div className="batch-url-preview font-mono" title={item.validation.normalizedUrl}>
                    {item.validation.normalizedUrl}
                  </div>
                  <div className="batch-card-actions">
                    <button
                      type="button"
                      className="btn-batch-action"
                      onClick={() => handleDownloadSingle(item)}
                      title="Download PNG (512px)"
                    >
                      <Download size={14} /> Download
                    </button>
                    <button
                      type="button"
                      className="btn-batch-action"
                      onClick={() => handleCopy(item, idx)}
                      title="Copy URL"
                    >
                      {copiedIndex === idx ? <Check size={14} className="icon-success" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="batch-invalid-content">
                  <div className="batch-raw-text font-mono">{item.raw}</div>
                  <p className="batch-error-msg">{item.validation.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
