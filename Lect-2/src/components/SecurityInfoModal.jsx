import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  EyeOff, 
  Info,
  ServerOff
} from 'lucide-react';

export function SecurityInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="security-info-title">
      <div className="modal-content security-info-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck size={22} className="icon-success" aria-hidden="true" />
            <div>
              <h2 id="security-info-title" className="modal-title">Security & Privacy Architecture</h2>
              <p className="modal-subtitle">How QRForge protects your destinations and privacy</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close security info dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="security-info-body">
          {/* Section 1: Privacy Guarantee */}
          <div className="security-pillar-box">
            <div className="pillar-header">
              <ServerOff size={18} className="pillar-icon" aria-hidden="true" />
              <h3>100% Client-Side Privacy Guarantee</h3>
            </div>
            <p>
              Your URLs and generated QR codes are processed <strong>entirely inside your local browser</strong>. 
              No URLs are transmitted to, stored on, or logged by external web servers.
              Your history is persisted strictly in your browser's private <code>localStorage</code>.
            </p>
          </div>

          {/* Section 2: Format Validation vs Trustworthiness */}
          <div className="security-pillar-box">
            <div className="pillar-header">
              <AlertTriangle size={18} className="pillar-icon text-warning" aria-hidden="true" />
              <h3>URL Format Validation vs. Destination Trust</h3>
            </div>
            <p>
              It is critical to distinguish between <strong>syntactic URL validation</strong> and <strong>website trustworthiness</strong>:
            </p>
            <ul className="security-bullet-list">
              <li>
                <strong>What QRForge Validates:</strong> Ensures proper URL structure, restricts protocols to <code>http://</code> and <code>https://</code>, flags raw IP addresses, warns on unencrypted connections, and rejects dangerous script injections (<code>javascript:</code>, <code>data:</code>, <code>file:</code>).
              </li>
              <li>
                <strong>What Format Validation Cannot Guarantee:</strong> A syntactically valid URL does NOT guarantee that the destination server is benign, safe, or free of phishing. Users should always inspect the domain name on their scanning device before navigating.
              </li>
            </ul>
          </div>

          {/* Section 3: Blocked Protocols & Attack Vectors */}
          <div className="security-pillar-box">
            <div className="pillar-header">
              <Lock size={18} className="pillar-icon" aria-hidden="true" />
              <h3>Blocked Attack Vectors</h3>
            </div>
            <div className="protocol-tags-grid">
              <div className="proto-tag tag-blocked">
                <code>javascript:</code> <span>Cross-Site Scripting (XSS)</span>
              </div>
              <div className="proto-tag tag-blocked">
                <code>data:</code> <span>Data Injection & Malicious Payloads</span>
              </div>
              <div className="proto-tag tag-blocked">
                <code>file:</code> <span>Local File System Disclosure</span>
              </div>
              <div className="proto-tag tag-blocked">
                <code>vbscript:</code> <span>Legacy Script Execution</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-primary-modal-close"
            onClick={onClose}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
