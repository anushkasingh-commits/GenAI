import React from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Globe, 
  ShieldCheck, 
  Palette, 
  FileText, 
  Calendar,
  Layers
} from 'lucide-react';
import { BUILTIN_LOGOS } from './QRControls';

export const TEMPLATES = [
  {
    id: 'standard-web',
    name: 'Standard Website',
    description: 'Clean, versatile black-on-white layout suitable for general websites and documentation.',
    icon: Globe,
    options: {
      fgColor: '#090d16',
      bgColor: '#ffffff',
      errorCorrectionLevel: 'M',
      margin: 2,
      logo: null
    }
  },
  {
    id: 'high-security-print',
    name: 'High-Redundancy Print',
    description: 'Maximum Error Correction (Level H ~30%) and generous quiet zone. Ideal for physical flyers & posters.',
    icon: ShieldCheck,
    options: {
      fgColor: '#000000',
      bgColor: '#ffffff',
      errorCorrectionLevel: 'H',
      margin: 4,
      logo: null
    }
  },
  {
    id: 'cyber-tech',
    name: 'Cyber SaaS & Tech',
    description: 'High-tech dark cyan styling with an embedded link emblem.',
    icon: Sparkles,
    options: {
      fgColor: '#083344',
      bgColor: '#ecfeff',
      errorCorrectionLevel: 'Q',
      margin: 2,
      logo: BUILTIN_LOGOS.find(l => l.id === 'link') || null
    }
  },
  {
    id: 'creative-emerald',
    name: 'Creative Portfolio',
    description: 'Vibrant emerald green with an embedded globe emblem and balanced density.',
    icon: Palette,
    options: {
      fgColor: '#064e3b',
      bgColor: '#f0fdf4',
      errorCorrectionLevel: 'Q',
      margin: 2,
      logo: BUILTIN_LOGOS.find(l => l.id === 'globe') || null
    }
  },
  {
    id: 'event-conference',
    name: 'Event / Conference',
    description: 'High-contrast sunset styling with star badge for badges, tickets, and signage.',
    icon: Calendar,
    options: {
      fgColor: '#7c2d12',
      bgColor: '#fff7ed',
      errorCorrectionLevel: 'Q',
      margin: 3,
      logo: BUILTIN_LOGOS.find(l => l.id === 'star') || null
    }
  }
];

export function TemplatesModal({
  isOpen,
  onClose,
  onApplyTemplate,
  currentOptions
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="templates-modal-title">
      <div className="modal-content templates-modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <Sparkles size={20} className="modal-header-icon" aria-hidden="true" />
            <div>
              <h2 id="templates-modal-title" className="modal-title">QR Style Templates</h2>
              <p className="modal-subtitle">Select a pre-tuned styling and error correction preset</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close templates dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="templates-grid">
          {TEMPLATES.map((tpl) => {
            const IconComponent = tpl.icon;
            const isMatch = currentOptions.fgColor.toLowerCase() === tpl.options.fgColor.toLowerCase() &&
                            currentOptions.bgColor.toLowerCase() === tpl.options.bgColor.toLowerCase() &&
                            currentOptions.errorCorrectionLevel === tpl.options.errorCorrectionLevel;

            return (
              <div key={tpl.id} className={`template-card ${isMatch ? 'active-template' : ''}`}>
                <div className="template-card-top">
                  <div className="template-icon-wrapper" style={{ backgroundColor: `${tpl.options.fgColor}15`, color: tpl.options.fgColor }}>
                    <IconComponent size={22} />
                  </div>
                  <div className="template-info">
                    <h3 className="template-name">{tpl.name}</h3>
                    <div className="template-badge-row">
                      <span className="template-ec-badge">EC: Level {tpl.options.errorCorrectionLevel}</span>
                      <span className="template-margin-badge">Margin: {tpl.options.margin}</span>
                    </div>
                  </div>
                </div>

                <p className="template-description">{tpl.description}</p>

                {/* Color preview swatch */}
                <div className="template-swatch-bar">
                  <span className="swatch-label">Colors:</span>
                  <div className="swatch-preview-pills">
                    <span className="swatch-dot" style={{ backgroundColor: tpl.options.fgColor }} title={`Foreground ${tpl.options.fgColor}`} />
                    <span className="swatch-dot" style={{ backgroundColor: tpl.options.bgColor, border: '1px solid rgba(0,0,0,0.15)' }} title={`Background ${tpl.options.bgColor}`} />
                  </div>
                  {tpl.options.logo && <span className="template-logo-tag">+ Logo</span>}
                </div>

                <button
                  type="button"
                  className="btn-apply-template"
                  onClick={() => {
                    onApplyTemplate(tpl.options);
                    onClose();
                  }}
                >
                  {isMatch ? <Check size={14} className="icon-success" /> : null}
                  <span>{isMatch ? 'Currently Applied' : 'Apply Preset'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
