import React, { useRef, useEffect, useState } from 'react';
import { 
  Download, 
  Share2, 
  Copy, 
  Check, 
  ScanLine, 
  Printer, 
  ExternalLink, 
  FileCode2, 
  Sparkles,
  QrCode as QrIcon,
  ZoomIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { renderQrToCanvas, generateQrSvg, generateQrDataUrl } from '../utils/qrGenerator';

export function QRPreview({
  url,
  validation,
  options,
  onOpenScanner,
  onOpenPrint,
  onShowToast
}) {
  const canvasRef = useRef(null);
  const [svgString, setSvgString] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadRes, setDownloadRes] = useState('1024'); // 512, 1024, 2048
  const [showResMenu, setShowResMenu] = useState(false);

  // Render QR Code whenever URL or options change
  useEffect(() => {
    if (!url || !validation?.isValid) {
      setSvgString('');
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    const generateAll = async () => {
      try {
        if (canvasRef.current) {
          await renderQrToCanvas(canvasRef.current, url, {
            ...options,
            size: 400
          });
        }

        const svg = await generateQrSvg(url, {
          errorCorrectionLevel: options.logo?.src ? (options.errorCorrectionLevel === 'L' || options.errorCorrectionLevel === 'M' ? 'Q' : options.errorCorrectionLevel) : options.errorCorrectionLevel,
          margin: options.margin,
          color: {
            dark: options.fgColor,
            light: options.bgColor
          },
          width: 600
        });

        if (isMounted) {
          setSvgString(svg);
        }
      } catch (err) {
        console.error('QR rendering error:', err);
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [url, validation, options]);

  // Download high-resolution PNG
  const handleDownloadPng = async (resolution = downloadRes) => {
    if (!url) return;
    try {
      const sizePx = parseInt(resolution, 10);
      const dataUrl = await generateQrDataUrl(url, {
        ...options,
        size: sizePx
      });

      const domain = validation?.details?.hostname || 'qrcode';
      const cleanDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `qrforge-${cleanDomain}-${sizePx}px.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Trigger delightful micro-confetti
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.75 }
        });
      } catch {}

      onShowToast?.(`Downloaded PNG (${sizePx}×${sizePx}px)`, 'success');
      setShowResMenu(false);
    } catch (err) {
      console.error('PNG download error:', err);
      onShowToast?.('Failed to download PNG', 'error');
    }
  };

  // Download SVG
  const handleDownloadSvg = async () => {
    if (!url || !svgString) return;
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const domain = validation?.details?.hostname || 'qrcode';
      const cleanDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `qrforge-${cleanDomain}.svg`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      onShowToast?.('Downloaded Scalable Vector SVG', 'success');
    } catch (err) {
      console.error('SVG download error:', err);
      onShowToast?.('Failed to download SVG', 'error');
    }
  };

  // Copy destination URL
  const handleCopyUrl = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      onShowToast?.('Destination URL copied to clipboard', 'success');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      onShowToast?.('Failed to copy URL', 'error');
    }
  };

  // Native Web Share API
  const handleShare = async () => {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code for ${validation?.details?.hostname || 'Destination'}`,
          text: `Scan or visit: ${url}`,
          url: url
        });
        onShowToast?.('Shared successfully', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyUrl();
        }
      }
    } else {
      handleCopyUrl();
    }
  };

  // If no URL or invalid format, render polished empty state
  if (!url || !validation?.isValid) {
    return (
      <div className="qr-preview-card empty-state-card" aria-label="QR Code Preview Placeholder">
        <div className="empty-state-inner">
          <div className="empty-state-icon-wrap" aria-hidden="true">
            <QrIcon size={56} className="empty-icon-pulse" />
          </div>
          <h3 className="empty-state-title">Your QR code will appear here</h3>
          <p className="empty-state-subtitle">
            Enter any valid web URL above to generate a scannable, customized QR code with zero intermediaries.
          </p>
          <div className="empty-state-features">
            <span className="feature-pill">✓ Direct Destination</span>
            <span className="feature-pill">✓ SVG & High-Res PNG</span>
            <span className="feature-pill">✓ Camera Scannable</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-preview-card" aria-label="Generated QR Code Preview">
      <div className="preview-card-top">
        <div className="card-top-title-group">
          <QrIcon size={18} className="preview-top-icon" aria-hidden="true" />
          <span className="preview-top-heading">Live QR Preview</span>
        </div>
        <div className="preview-top-badge">
          <span className="pulse-dot" aria-hidden="true" />
          <span>Active</span>
        </div>
      </div>

      {/* QR Code Canvas Frame */}
      <div className="qr-canvas-container" style={{ backgroundColor: options.bgColor }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="qr-canvas-element"
          aria-label={`QR Code encoding ${url}`}
        />
        {isGenerating && (
          <div className="qr-generating-overlay">
            <div className="spinner" />
            <span>Rendering QR...</span>
          </div>
        )}
      </div>

      {/* Destination Subtext */}
      <div className="qr-destination-summary">
        <span className="summary-label">Scans directly to:</span>
        <div className="summary-domain-pill font-mono">
          <ExternalLink size={13} aria-hidden="true" />
          <span className="domain-truncate">{validation?.details?.hostname || url}</span>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="qr-actions-grid">
        {/* Download PNG with resolution selector */}
        <div className="btn-split-group">
          <button
            type="button"
            className="btn-action-primary"
            onClick={() => handleDownloadPng(downloadRes)}
            title={`Download PNG image (${downloadRes}px)`}
          >
            <Download size={16} aria-hidden="true" />
            <span>Download PNG ({downloadRes}px)</span>
          </button>
          <div className="resolution-selector-wrapper">
            <button
              type="button"
              className="btn-res-toggle"
              onClick={() => setShowResMenu(!showResMenu)}
              aria-label="Select PNG download resolution"
              aria-expanded={showResMenu}
            >
              ▾
            </button>
            {showResMenu && (
              <div className="resolution-dropdown-menu" role="menu">
                {[
                  { label: '512 × 512px (Standard)', val: '512' },
                  { label: '1024 × 1024px (High-Res)', val: '1024' },
                  { label: '2048 × 2048px (Ultra Print)', val: '2048' }
                ].map((res) => (
                  <button
                    key={res.val}
                    type="button"
                    role="menuitem"
                    className={`dropdown-menu-item ${downloadRes === res.val ? 'active' : ''}`}
                    onClick={() => {
                      setDownloadRes(res.val);
                      handleDownloadPng(res.val);
                    }}
                  >
                    <span>{res.label}</span>
                    {downloadRes === res.val && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Download SVG */}
        <button
          type="button"
          className="btn-action-secondary"
          onClick={handleDownloadSvg}
          title="Download crisp Vector SVG format for printing"
        >
          <FileCode2 size={16} aria-hidden="true" />
          <span>Download SVG</span>
        </button>

        {/* Copy URL */}
        <button
          type="button"
          className="btn-action-secondary"
          onClick={handleCopyUrl}
          title="Copy destination URL to clipboard"
        >
          {copiedUrl ? <Check size={16} className="icon-success" /> : <Copy size={16} />}
          <span>{copiedUrl ? 'Copied URL!' : 'Copy URL'}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          className="btn-action-secondary"
          onClick={handleShare}
          title="Share destination URL or QR Code"
        >
          <Share2 size={16} aria-hidden="true" />
          <span>Share</span>
        </button>

        {/* Test QR Code */}
        <button
          type="button"
          className="btn-action-secondary"
          onClick={onOpenScanner}
          title="Test scan with camera or decoder"
        >
          <ScanLine size={16} aria-hidden="true" />
          <span>Test Scanner</span>
        </button>

        {/* Print Card */}
        <button
          type="button"
          className="btn-action-secondary"
          onClick={onOpenPrint}
          title="Open printable card layout"
        >
          <Printer size={16} aria-hidden="true" />
          <span>Print Card</span>
        </button>
      </div>
    </div>
  );
}
