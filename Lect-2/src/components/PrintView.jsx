import React, { useRef, useEffect, useState } from 'react';
import { Printer, X, Download, Globe, Sparkles } from 'lucide-react';
import { renderQrToCanvas } from '../utils/qrGenerator';

export function PrintView({
  isOpen,
  onClose,
  url,
  validation,
  options
}) {
  const printCanvasRef = useRef(null);
  const [printTitle, setPrintTitle] = useState('Scan with your phone to open destination');
  const [printSubtitle, setPrintSubtitle] = useState('Point your camera at this QR code');

  useEffect(() => {
    if (isOpen && url && printCanvasRef.current) {
      renderQrToCanvas(printCanvasRef.current, url, {
        ...options,
        size: 500
      });
    }
  }, [isOpen, url, options]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay print-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="print-modal-title">
      <div className="modal-content print-modal-card">
        <div className="modal-header no-print">
          <div className="modal-title-group">
            <Printer size={20} className="modal-header-icon" aria-hidden="true" />
            <div>
              <h2 id="print-modal-title" className="modal-title">Print-Ready QR Card Layout</h2>
              <p className="modal-subtitle">Customize headline text and print a crisp physical card/flyer</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close print layout dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Customization Inputs (Hidden when printing) */}
        <div className="print-settings-row no-print">
          <div className="print-input-group">
            <label htmlFor="print-title-input" className="print-label">Card Headline</label>
            <input
              id="print-title-input"
              type="text"
              className="print-text-input"
              value={printTitle}
              onChange={(e) => setPrintTitle(e.target.value)}
            />
          </div>
          <div className="print-input-group">
            <label htmlFor="print-sub-input" className="print-label">Instructions Subtext</label>
            <input
              id="print-sub-input"
              type="text"
              className="print-text-input"
              value={printSubtitle}
              onChange={(e) => setPrintSubtitle(e.target.value)}
            />
          </div>
        </div>

        {/* The Actual Printable Card */}
        <div className="print-card-wrapper">
          <div className="printable-sheet" id="printable-area">
            <div className="print-sheet-header">
              <div className="print-brand-tag">◈ QRForge Physical Card</div>
              <h1 className="print-sheet-title">{printTitle}</h1>
              <p className="print-sheet-subtitle">{printSubtitle}</p>
            </div>

            <div className="print-sheet-qr-box">
              <canvas
                ref={printCanvasRef}
                width={500}
                height={500}
                className="print-canvas-element"
              />
            </div>

            <div className="print-sheet-footer">
              <div className="print-destination-badge font-mono">
                {validation?.details?.hostname || url}
              </div>
              <p className="print-url-full font-mono">{url}</p>
              <span className="print-verified-note">Direct URL &bull; Safe Scanning</span>
            </div>
          </div>
        </div>

        {/* Print Action Button (Hidden when printing) */}
        <div className="print-modal-actions no-print">
          <button
            type="button"
            className="btn-print-trigger"
            onClick={handlePrint}
          >
            <Printer size={18} aria-hidden="true" />
            <span>Print Card Now (⌘P)</span>
          </button>
          <button
            type="button"
            className="btn-print-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
