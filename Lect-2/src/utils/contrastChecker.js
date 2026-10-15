/**
 * Color Contrast & QR Code Scan Reliability Calculator
 * Implements WCAG 2.1 relative luminance and contrast ratio algorithms
 * plus QR-specific optical scannability scoring.
 */

/**
 * Converts Hex color string to RGB object
 * @param {string} hex 
 * @returns {{r: number, g: number, b: number}}
 */
export function hexToRgb(hex) {
  let cleanHex = hex.replace(/^#/, '');

  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }

  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) {
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Calculates WCAG relative luminance of an sRGB color
 * @param {number} r 0-255
 * @param {number} g 0-255
 * @param {number} b 0-255
 * @returns {number} 0.0 - 1.0
 */
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes contrast ratio between two hex colors (1:1 to 21:1)
 * @param {string} foregroundHex 
 * @param {string} backgroundHex 
 * @returns {number} Contrast ratio rounded to 2 decimals
 */
export function getContrastRatio(foregroundHex, backgroundHex) {
  const fg = hexToRgb(foregroundHex);
  const bg = hexToRgb(backgroundHex);

  const l1 = getRelativeLuminance(fg.r, fg.g, fg.b);
  const l2 = getRelativeLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

/**
 * Evaluates comprehensive QR code scan reliability and quality
 * @param {Object} options 
 * @param {string} options.fgColor 
 * @param {string} options.bgColor 
 * @param {string} options.errorCorrectionLevel 'L' | 'M' | 'Q' | 'H'
 * @param {number} options.size Pixels
 * @param {number} options.margin Modules
 * @param {boolean} options.hasLogo 
 * @param {number} options.urlLength 
 * @returns {Object} Structured Quality Assessment
 */
export function evaluateQRQuality({
  fgColor = '#000000',
  bgColor = '#ffffff',
  errorCorrectionLevel = 'M',
  size = 300,
  margin = 2,
  hasLogo = false,
  urlLength = 30
}) {
  const fg = hexToRgb(fgColor);
  const bg = hexToRgb(bgColor);

  const fgLum = getRelativeLuminance(fg.r, fg.g, fg.b);
  const bgLum = getRelativeLuminance(bg.r, bg.g, bg.b);
  const ratio = getContrastRatio(fgColor, bgColor);

  const isInverted = fgLum > bgLum; // Light QR on dark background
  const suggestions = [];
  let score = 100;

  // 1. Contrast Evaluation
  let contrastRating = 'Excellent';
  if (ratio >= 7) {
    contrastRating = 'Excellent';
  } else if (ratio >= 4.5) {
    contrastRating = 'Good';
    score -= 10;
  } else if (ratio >= 3) {
    contrastRating = 'Moderate';
    score -= 30;
    suggestions.push('Contrast ratio is below 4.5:1. Some smartphone cameras may struggle under dim lighting.');
  } else {
    contrastRating = 'Poor (Unreliable)';
    score -= 60;
    suggestions.push('Critical: Color contrast is too low (< 3:1). The QR code will likely fail to scan.');
  }

  // 2. Inversion Check
  if (isInverted) {
    score -= 15;
    suggestions.push('Inverted colors (light QR on dark background) are not supported by some older camera apps.');
  }

  // 3. Logo vs Error Correction Check
  if (hasLogo) {
    if (errorCorrectionLevel === 'L' || errorCorrectionLevel === 'M') {
      score -= 25;
      suggestions.push('A logo is placed in the center. Switch Error Correction to High (Q or H) to ensure 25-30% error recovery.');
    }
  }

  // 4. Margin / Quiet Zone Check
  if (margin < 1) {
    score -= 15;
    suggestions.push('No quiet zone margin. Adding at least 2 modules of quiet space prevents background bleeding.');
  }

  // 5. URL Length & Density Check
  if (urlLength > 600) {
    score -= 15;
    suggestions.push('High data density due to long URL. Using a larger download size (>= 500px) is recommended for crisp scanning.');
  }

  // 6. Size Check for Printing
  if (size < 200) {
    score -= 10;
    suggestions.push('Small pixel dimensions may cause blurring if displayed on high-DPI screens.');
  }

  score = Math.max(10, Math.min(100, score));

  let label = 'Excellent';
  let badgeColor = 'var(--status-success)';
  if (score >= 85) {
    label = 'Excellent';
    badgeColor = 'var(--status-success)';
  } else if (score >= 70) {
    label = 'Good';
    badgeColor = 'var(--status-info)';
  } else if (score >= 50) {
    label = 'Acceptable';
    badgeColor = 'var(--status-warning)';
  } else {
    label = 'Risky / Low Scan Reliability';
    badgeColor = 'var(--status-error)';
  }

  return {
    score,
    label,
    badgeColor,
    contrastRatio: ratio,
    contrastRating,
    isInverted,
    suggestions
  };
}
