import React, { useRef } from 'react';
import { 
  Palette, 
  Sliders, 
  Shield, 
  Image as ImageIcon, 
  RotateCcw, 
  Check, 
  Upload, 
  X,
  Maximize2,
  Sparkles
} from 'lucide-react';

// Preset designer palettes that guarantee strong contrast
export const COLOR_PRESETS = [
  { id: 'mono-classic', name: 'Classic Dark', fg: '#090d16', bg: '#ffffff' },
  { id: 'indigo-cyber', name: 'Indigo Night', fg: '#312e81', bg: '#ffffff' },
  { id: 'emerald-fresh', name: 'Emerald Glass', fg: '#064e3b', bg: '#f0fdf4' },
  { id: 'cyber-cyan', name: 'Cyber Cyan', fg: '#083344', bg: '#ecfeff' },
  { id: 'sunset-coral', name: 'Sunset Coral', fg: '#7c2d12', bg: '#fff7ed' },
  { id: 'purple-luxe', name: 'Royal Violet', fg: '#3b0764', bg: '#faf5ff' },
  { id: 'slate-sharp', name: 'Deep Slate', fg: '#0f172a', bg: '#f8fafc' },
  { id: 'dark-neon', name: 'Cyber Dark', fg: '#38bdf8', bg: '#0b1120' }
];

// Predefined built-in crisp center logos
export const BUILTIN_LOGOS = [
  { id: 'none', name: 'None', icon: null, src: null },
  { 
    id: 'link', 
    name: 'Link', 
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
  },
  { 
    id: 'globe', 
    name: 'Web', 
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
  },
  { 
    id: 'shield', 
    name: 'Shield', 
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
  },
  { 
    id: 'star', 
    name: 'Star', 
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
  }
];

export function QRControls({
  options,
  onChange,
  onReset
}) {
  const fileInputRef = useRef(null);

  const handlePresetSelect = (preset) => {
    onChange({
      ...options,
      fgColor: preset.fg,
      bgColor: preset.bg
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({
        ...options,
        logo: {
          src: event.target.result,
          name: file.name,
          sizePercent: 20
        },
        // Auto bump error correction to Q if it was lower
        errorCorrectionLevel: options.errorCorrectionLevel === 'L' || options.errorCorrectionLevel === 'M' ? 'Q' : options.errorCorrectionLevel
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectBuiltinLogo = (logo) => {
    if (logo.id === 'none') {
      onChange({
        ...options,
        logo: null
      });
    } else {
      onChange({
        ...options,
        logo: {
          src: logo.src,
          name: logo.name,
          sizePercent: 20
        },
        errorCorrectionLevel: options.errorCorrectionLevel === 'L' || options.errorCorrectionLevel === 'M' ? 'Q' : options.errorCorrectionLevel
      });
    }
  };

  return (
    <div className="qr-controls-card" aria-label="QR Code Customization Controls">
      <div className="controls-header">
        <div className="controls-title-group">
          <Palette size={18} className="controls-icon" aria-hidden="true" />
          <h3 className="controls-heading">Customize QR Code</h3>
        </div>
        <button
          type="button"
          className="btn-reset-controls"
          onClick={onReset}
          title="Reset to default settings"
          aria-label="Reset customization"
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Color Palette Presets */}
      <div className="control-section">
        <label className="control-section-label">Color Presets</label>
        <div className="color-presets-grid">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = options.fgColor.toLowerCase() === preset.fg.toLowerCase() && 
                               options.bgColor.toLowerCase() === preset.bg.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                className={`preset-swatch-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handlePresetSelect(preset)}
                title={preset.name}
                aria-label={`Select ${preset.name} color preset`}
              >
                <span
                  className="preset-swatch-circle"
                  style={{
                    backgroundColor: preset.bg,
                    borderColor: preset.fg
                  }}
                >
                  <span
                    className="preset-swatch-inner"
                    style={{ backgroundColor: preset.fg }}
                  />
                </span>
                <span className="preset-name">{preset.name}</span>
                {isSelected && <Check size={12} className="preset-check" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Hex Pickers */}
      <div className="control-section custom-colors-row">
        <div className="color-picker-item">
          <label htmlFor="fg-color-input" className="control-sublabel">QR Color (Foreground)</label>
          <div className="color-input-wrapper">
            <input
              id="fg-color-input"
              type="color"
              className="color-picker-input"
              value={options.fgColor}
              onChange={(e) => onChange({ ...options, fgColor: e.target.value })}
            />
            <input
              type="text"
              className="color-hex-text"
              value={options.fgColor}
              onChange={(e) => onChange({ ...options, fgColor: e.target.value })}
              maxLength={7}
            />
          </div>
        </div>

        <div className="color-picker-item">
          <label htmlFor="bg-color-input" className="control-sublabel">Background</label>
          <div className="color-input-wrapper">
            <input
              id="bg-color-input"
              type="color"
              className="color-picker-input"
              value={options.bgColor}
              onChange={(e) => onChange({ ...options, bgColor: e.target.value })}
            />
            <input
              type="text"
              className="color-hex-text"
              value={options.bgColor}
              onChange={(e) => onChange({ ...options, bgColor: e.target.value })}
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* 3. Error Correction Level */}
      <div className="control-section">
        <div className="control-label-with-tip">
          <label className="control-section-label">
            <Shield size={14} aria-hidden="true" /> Error Correction Level
          </label>
          <span className="control-tip">Higher levels allow scanning even if partially damaged or covered by a logo</span>
        </div>
        <div className="segmented-control" role="radiogroup" aria-label="Error correction level">
          {[
            { id: 'L', label: 'Low (~7%)', desc: 'Standard data' },
            { id: 'M', label: 'Medium (~15%)', desc: 'Default balance' },
            { id: 'Q', label: 'Quartile (~25%)', desc: 'Recommended with logo' },
            { id: 'H', label: 'High (~30%)', desc: 'Best redundancy' }
          ].map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              role="radio"
              aria-checked={options.errorCorrectionLevel === lvl.id}
              className={`segmented-btn ${options.errorCorrectionLevel === lvl.id ? 'active' : ''}`}
              onClick={() => onChange({ ...options, errorCorrectionLevel: lvl.id })}
              title={lvl.desc}
            >
              <strong className="seg-key">{lvl.id}</strong>
              <span className="seg-label">{lvl.label.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Center Logo Selector & Custom Upload */}
      <div className="control-section">
        <div className="control-label-with-tip">
          <label className="control-section-label">
            <ImageIcon size={14} aria-hidden="true" /> Center Logo / Icon
          </label>
          <span className="control-tip">Small center emblem (auto-boosts error correction)</span>
        </div>

        <div className="logo-selector-row">
          {BUILTIN_LOGOS.map((l) => {
            const isSelected = (!options.logo && l.id === 'none') || (options.logo && options.logo.name === l.name);
            return (
              <button
                key={l.id}
                type="button"
                className={`logo-pill-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectBuiltinLogo(l)}
              >
                {l.id !== 'none' && (
                  <img src={l.src} alt="" className="logo-pill-img" />
                )}
                <span>{l.name}</span>
              </button>
            );
          })}

          {/* Custom Upload Trigger */}
          <button
            type="button"
            className="logo-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload custom logo image"
          >
            <Upload size={14} aria-hidden="true" />
            <span>Upload Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        {options.logo && options.logo.src && (
          <div className="active-logo-preview-badge">
            <img src={options.logo.src} alt="Selected logo preview" className="active-logo-thumb" />
            <span className="active-logo-name">{options.logo.name || 'Custom Logo'}</span>
            <button
              type="button"
              className="btn-remove-logo"
              onClick={() => onChange({ ...options, logo: null })}
              title="Remove logo"
              aria-label="Remove logo"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 5. Margin / Quiet Zone */}
      <div className="control-section">
        <div className="control-slider-header">
          <label htmlFor="margin-slider" className="control-section-label">Quiet Zone Margin</label>
          <span className="slider-value-badge">{options.margin} modules</span>
        </div>
        <input
          id="margin-slider"
          type="range"
          min="0"
          max="6"
          step="1"
          className="range-slider"
          value={options.margin}
          onChange={(e) => onChange({ ...options, margin: parseInt(e.target.value, 10) })}
        />
      </div>
    </div>
  );
}
