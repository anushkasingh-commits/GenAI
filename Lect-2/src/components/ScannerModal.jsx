import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanLine, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  Eye
} from 'lucide-react';
import jsQR from 'jsqr';
import { generateQrDataUrl } from '../utils/qrGenerator';

export function ScannerModal({
  isOpen,
  onClose,
  currentUrl,
  qrOptions,
  onShowToast
}) {
  const [mode, setMode] = useState('direct'); // 'direct' | 'camera' | 'upload'
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Auto-run direct test when modal opens in 'direct' mode
  useEffect(() => {
    if (isOpen && mode === 'direct' && currentUrl) {
      runDirectVerification();
    }
  }, [isOpen, mode, currentUrl]);

  // Clean up camera stream on close or mode change
  useEffect(() => {
    if (!isOpen || mode !== 'camera') {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode]);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Direct Verification Test: renders offscreen canvas and runs jsQR
  const runDirectVerification = async () => {
    setScanResult(null);
    setScanError(null);
    try {
      const dataUrl = await generateQrDataUrl(currentUrl, {
        ...qrOptions,
        size: 512
      });

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);

        if (code && code.data) {
          const isExactMatch = code.data === currentUrl;
          setScanResult({
            decodedUrl: code.data,
            isMatch: isExactMatch,
            mode: 'Direct Canvas Decoder'
          });
        } else {
          setScanError('Could not decode QR code. The error correction or contrast may be insufficient.');
        }
      };
      img.src = dataUrl;
    } catch (err) {
      console.error('Direct verification error:', err);
      setScanError('Failed to decode generated QR canvas.');
    }
  };

  // Start Camera Scanning
  const startCamera = async () => {
    setScanResult(null);
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setScanError('Camera permission was denied or camera is unavailable on this device.');
      setCameraActive(false);
    }
  };

  // Camera animation frame tick scanner
  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        const isExactMatch = code.data === currentUrl;
        setScanResult({
          decodedUrl: code.data,
          isMatch: isExactMatch,
          mode: 'Device Camera'
        });
        stopCamera();
        return;
      }
    }

    if (streamRef.current) {
      animFrameRef.current = requestAnimationFrame(tickScan);
    }
  };

  // Handle Image Upload Scan
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanResult(null);
    setScanError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);

        if (code && code.data) {
          const isExactMatch = code.data === currentUrl;
          setScanResult({
            decodedUrl: code.data,
            isMatch: isExactMatch,
            mode: 'Uploaded Image File'
          });
        } else {
          setScanError('No scannable QR code found in this image.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="scanner-modal-title">
      <div className="modal-content scanner-modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <ScanLine size={20} className="modal-header-icon" aria-hidden="true" />
            <div>
              <h2 id="scanner-modal-title" className="modal-title">QR Code Verification & Scanner</h2>
              <p className="modal-subtitle">Verify that the QR code decodes to the exact intended destination</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close scanner dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="scanner-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'direct'}
            className={`scanner-tab-btn ${mode === 'direct' ? 'active' : ''}`}
            onClick={() => {
              setMode('direct');
              runDirectVerification();
            }}
          >
            <Eye size={15} aria-hidden="true" />
            <span>Direct Decoder Test</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'camera'}
            className={`scanner-tab-btn ${mode === 'camera' ? 'active' : ''}`}
            onClick={() => {
              setMode('camera');
              startCamera();
            }}
          >
            <Camera size={15} aria-hidden="true" />
            <span>Camera Scanner</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'upload'}
            className={`scanner-tab-btn ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => setMode('upload')}
          >
            <Upload size={15} aria-hidden="true" />
            <span>Upload Test Image</span>
          </button>
        </div>

        <div className="scanner-body">
          {/* Mode 1: Direct Decoder */}
          {mode === 'direct' && (
            <div className="scanner-direct-view">
              <div className="direct-info-box">
                <Sparkles size={16} className="icon-success" aria-hidden="true" />
                <span>
                  Simulates a camera scanner by running the QR decoding algorithm on your generated QR code.
                </span>
              </div>
              <button
                type="button"
                className="btn-re-verify"
                onClick={runDirectVerification}
              >
                <RefreshCw size={14} aria-hidden="true" />
                <span>Run Decoder Test Again</span>
              </button>
            </div>
          )}

          {/* Mode 2: Camera Scanner */}
          {mode === 'camera' && (
            <div className="scanner-camera-view">
              {!cameraActive && !scanResult && (
                <div className="camera-prompt">
                  <Camera size={44} className="icon-muted" aria-hidden="true" />
                  <p>Point your camera at any printed or on-screen QR code.</p>
                  <button
                    type="button"
                    className="btn-start-camera"
                    onClick={startCamera}
                  >
                    Start Camera
                  </button>
                </div>
              )}

              <div className={`camera-video-wrapper ${cameraActive ? 'active' : 'hidden'}`}>
                <video ref={videoRef} className="camera-video-feed" />
                <div className="camera-overlay-frame">
                  <div className="viewfinder-corner top-left" />
                  <div className="viewfinder-corner top-right" />
                  <div className="viewfinder-corner bottom-left" />
                  <div className="viewfinder-corner bottom-right" />
                  <div className="scan-laser-line" />
                </div>
              </div>

              {cameraActive && (
                <div className="camera-controls-bar">
                  <button
                    type="button"
                    className="btn-camera-flip"
                    onClick={() => {
                      setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
                      stopCamera();
                      setTimeout(startCamera, 200);
                    }}
                  >
                    <RefreshCw size={14} /> Switch Camera
                  </button>
                  <button
                    type="button"
                    className="btn-camera-stop"
                    onClick={stopCamera}
                  >
                    Stop Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Image File Upload */}
          {mode === 'upload' && (
            <div className="scanner-upload-view">
              <div
                className="upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={36} className="upload-drop-icon" aria-hidden="true" />
                <strong className="dropzone-title">Click to upload QR code image</strong>
                <span className="dropzone-sub">Supports PNG, JPEG, SVG, WebP screenshots</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          )}

          {/* Scan Error Display */}
          {scanError && (
            <div className="scan-error-card" role="alert">
              <AlertCircle size={18} className="icon-error" aria-hidden="true" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Successful Decoded Result Card */}
          {scanResult && (
            <div className="scan-result-card" role="status">
              <div className="result-header">
                <div className="result-status-badge">
                  {scanResult.isMatch ? (
                    <span className="badge badge-success">
                      <CheckCircle2 size={13} aria-hidden="true" />
                      <span>100% Byte Match ✓</span>
                    </span>
                  ) : (
                    <span className="badge badge-warning">
                      <AlertCircle size={13} aria-hidden="true" />
                      <span>Decoded (Different URL)</span>
                    </span>
                  )}
                </div>
                <span className="result-decoder-tag font-mono">{scanResult.mode}</span>
              </div>

              <div className="result-url-box">
                <span className="result-label">Decoded Payload:</span>
                <div className="result-url-text font-mono">{scanResult.decodedUrl}</div>
              </div>

              <div className="result-actions">
                <a
                  href={scanResult.decodedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-visit-url"
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  <span>Open URL in New Tab</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
