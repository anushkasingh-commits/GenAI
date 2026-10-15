# ◈ QRForge — Production-Quality QR Code Generator

A modern, responsive, privacy-first QR Code Generator web application built with **React**, **Vite**, and **Tailored Design System**. QRForge turns any valid web URL into a high-contrast, verifiable, and scannable QR code directly inside the user's browser with **zero server-side logging or tracking**.

---

## 🚀 Key Features

### 1. Direct Destination Encoding
- Encodes the exact validated URL directly into the QR code matrix.
- **No intermediate redirect servers** or third-party tracking gateways. When scanned, camera apps navigate directly to the target URL.

### 2. Strict URL Validation & Security Engine
- **Allowed Protocols:** Exclusively `https://` and `http://`.
- **Blocked Attack Vectors:** Rejects `javascript:`, `data:`, `file:`, `ftp:`, `vbscript:`, `blob:`, `about:`, HTML script tags, control characters, and malformed strings.
- **Security Warning System:**
  - ⚠️ **Unencrypted Connection (HTTP):** Warns that data transmitted over HTTP is unencrypted.
  - ⚠️ **Raw IP Address:** Flags raw IPv4 / IPv6 addresses and localhost destinations.
  - ⚠️ **Punycode / IDN:** Alerts to internationalized domain names (`xn--...`) to prevent homograph attacks.
  - ⚠️ **Non-Standard Ports:** Flags custom ports (e.g. `:8080`, `:3000`).
  - ⚠️ **High Density / Long URLs:** Advises on minimum size for URLs > 1,500 characters.
- **Clear Security Disclaimer:**
  > *"This URL has a valid format, but format validation does not guarantee that the destination is trustworthy."*

### 3. Anti-Misleading Destination Preview
- Prominent monospace preview with visual syntax breakdown (Protocol, Domain, Port, Path, Query Parameters).
- Protocol security badges (`HTTPS ✓` / `HTTP ⚠️`).
- Clear distinction between generator interface and target destination.

### 4. Scan Reliability & Quality Indicator (WCAG 2.1)
- Real-time **WCAG contrast ratio computation** between foreground and background colors.
- Real-time **Quality & Scannability Score (0 - 100%)**.
- Alerts when color contrast drops below 4.5:1 or when colors are inverted (light QR on dark background).
- Intelligent checks for Error Correction vs. Logo obstruction vs. URL density.

### 5. Deep Customization & Presets
- **Designer Color Presets:** Classic Monochrome, Cyber Neon, Indigo Night, Emerald Glass, Sunset Coral, Deep Slate, Royal Violet, Cyber Dark.
- Custom Foreground and Background hex color pickers.
- **Error Correction Levels:** Low (`L` ~7%), Medium (`M` ~15%), Quartile (`Q` ~25%), High (`H` ~30%).
- **Center Logo / Emblem Support:** Built-in crisp SVG icons (Link, Web, Shield, Star) or custom image file upload with automatic error correction upgrade and protective circular/rounded boundary badge.
- **Quiet Zone:** Adjustable margin (0 to 6 modules).
- "Reset Customization" button.

### 6. Export & Sharing Options
- **Download High-Res PNG:** Multi-resolution selector (`512px`, `1024px`, `2048px`).
- **Download Vector SVG:** Infinite resolution scalable vector format for graphic designers and print.
- **Copy URL:** Instant clipboard copy with animated feedback.
- **Native Web Share API:** Shares directly to mobile OS share sheets with fallback.
- **Print Mode:** Dedicated printable card layout for flyers, table tents, and business cards with customized headlines and `@media print` stylesheets.

### 7. In-App QR Verification & Scanner
- **Direct Decoder Test:** Uses `jsQR` to decode the generated canvas and verify 100% byte-for-byte fidelity with the input URL.
- **Device Camera Scanner:** Real-time camera viewfinder with laser scan animation and camera flip control.
- **Image File Upload:** Test and decode existing QR screenshots or photos.

### 8. Batch QR Code Generation
- Paste multiple URLs (one per line).
- Simultaneous batch validation and status breakdown.
- Grid preview with individual download and copy buttons.
- **Download All as ZIP:** Packages all generated QR codes into a single `.zip` file using `JSZip` and `FileSaver`.

### 9. Local History (Privacy-First)
- Saves recently generated QR codes in `localStorage`.
- Shows relative time ("2m ago", "1h ago"), protocol badge, domain.
- Actions: One-click "Generate Again", "Copy URL", "Delete", and "Clear All History".
- Zero cloud transmission.

### 10. Dark & Light Mode + Accessibility (a11y)
- Modern glassmorphic theme system with smooth CSS variable transitions.
- Persists user theme preference and honors system `prefers-color-scheme`.
- Screen reader friendly ARIA live regions and semantic landmarks.
- **Keyboard Shortcuts:**
  - `⌘ + Enter` / `Ctrl + Enter`: Generate QR Code
  - `⌘ + K` / `Ctrl + K`: Focus URL input
  - `Esc`: Clear input or close modal

---

## 📁 Project Structure

```text
Lect-2/
├── public/
│   └── favicon.svg             # Vector brand icon
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navigation, mode tabs, theme toggle, modals trigger
│   │   ├── Hero.jsx            # Title, subtitle, and quick sample test pills
│   │   ├── UrlInput.jsx        # Validated URL input, paste, suggestion fix, submit CTA
│   │   ├── DestinationPreview.jsx # Anti-misleading breakdown card
│   │   ├── SecurityNotice.jsx  # Security warnings accordion & disclaimers
│   │   ├── QRPreview.jsx       # QR Canvas, SVG download, PNG resolutions, share, copy
│   │   ├── QRControls.jsx      # Color swatches, error correction, logo, margin
│   │   ├── QualityIndicator.jsx # WCAG contrast calculation & scan reliability meter
│   │   ├── HistoryList.jsx     # LocalStorage history panel with timeago
│   │   ├── BatchGenerator.jsx  # Multi-line batch QR generation & ZIP export
│   │   ├── TemplatesModal.jsx  # Style preset selector modal
│   │   ├── ScannerModal.jsx    # Camera & direct canvas verification tester
│   │   ├── PrintView.jsx       # Print-ready card layout
│   │   ├── SecurityInfoModal.jsx # Architecture & validation documentation modal
│   │   ├── Toast.jsx           # Non-intrusive action notifications
│   │   └── Footer.jsx          # Shortcuts legend, privacy statements, copyright
│   ├── hooks/
│   │   ├── useTheme.js         # Dark/Light theme manager with system sync
│   │   ├── useLocalStorage.js  # Reactive local storage hook
│   │   └── useKeyboardShortcut.js # Global hotkey listeners
│   ├── utils/
│   │   ├── urlValidator.js     # Strict URL parser, protocol checks, threat heuristics
│   │   ├── urlNormalizer.js    # URL cleaning and suggestion engine
│   │   ├── contrastChecker.js  # WCAG luminance and scan quality evaluator
│   │   ├── qrGenerator.js      # Canvas, PNG, SVG rendering engine with center logo
│   │   ├── storage.js          # Privacy-first localStorage history manager
│   │   └── timeAgo.js          # Humanized timestamp formatter
│   ├── styles/
│   │   ├── variables.css       # Design tokens, color palettes, spacing
│   │   ├── globals.css         # Typography, resets, keyframe animations
│   │   ├── components.css      # Component styles & responsive grid
│   │   └── print.css           # Print media stylesheet
│   ├── App.jsx                 # Main application state orchestration
│   ├── main.jsx                # React root mount
│   └── index.css               # Main stylesheet bundle
├── test/
│   ├── validator.test.js       # 29 automated tests for validation & security
│   └── qr_roundtrip.test.js    # QR encode/decode roundtrip tests
├── package.json
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone or navigate to the repository
cd Lect-2

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The app will be accessible at: `http://localhost:5173/`

### Running Production Build
```bash
npm run build
```

### Running the Automated Test Suite
```bash
# Run URL validation and security tests
node test/validator.test.js

# Run QR roundtrip encoding & decoding tests
node test/qr_roundtrip.test.js
```

---

## 🔒 Security Architecture

1. **Protocol Allowlisting:** Only `https:` and `http:` URLs can be processed. Any attempt to use `javascript:`, `data:`, `file:`, `ftp:`, or other schemes is blocked instantly before parsing.
2. **Zero Server Intermediaries:** Generated QR codes directly encode the destination. No analytics redirect links or tracking middleware.
3. **Local-Only Storage:** User history stays in the browser's `localStorage` and can be cleared with 1 click.
4. **Transparent Security Disclaimers:** Explicitly reminds users that syntactically valid URLs do not imply verified website trustworthiness.

---

## 📄 License
MIT License &bull; Built with precision by QRForge
# QRForge
