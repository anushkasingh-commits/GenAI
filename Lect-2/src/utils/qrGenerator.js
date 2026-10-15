/**
 * QR Code Generator Engine using 'qrcode' library
 * Generates Canvas, High-Res PNG data URLs, and Scalable Vector SVGs.
 */
import QRCode from 'qrcode';

/**
 * Generates an SVG string of the QR Code
 * @param {string} text 
 * @param {Object} options 
 * @returns {Promise<string>} SVG string
 */
export async function generateQrSvg(text, options = {}) {
  const {
    errorCorrectionLevel = 'M',
    margin = 2,
    color = { dark: '#000000', light: '#ffffff' },
    width = 400
  } = options;

  return new Promise((resolve, reject) => {
    QRCode.toString(
      text,
      {
        type: 'svg',
        errorCorrectionLevel,
        margin,
        color,
        width
      },
      (err, svgString) => {
        if (err) reject(err);
        else resolve(svgString);
      }
    );
  });
}

/**
 * Renders QR Code directly to an HTML5 Canvas element, including optional center logo
 * @param {HTMLCanvasElement} canvas 
 * @param {string} text 
 * @param {Object} options 
 * @returns {Promise<void>}
 */
export async function renderQrToCanvas(canvas, text, options = {}) {
  const {
    errorCorrectionLevel = 'M',
    margin = 2,
    fgColor = '#000000',
    bgColor = '#ffffff',
    size = 400,
    logo = null // { src: string, sizePercent: number }
  } = options;

  // Auto upgrade error correction if a logo is present
  const effectiveEC = logo?.src ? (errorCorrectionLevel === 'L' || errorCorrectionLevel === 'M' ? 'Q' : errorCorrectionLevel) : errorCorrectionLevel;

  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin,
    errorCorrectionLevel: effectiveEC,
    color: {
      dark: fgColor,
      light: bgColor
    }
  });

  // If center logo is requested, draw it in the center
  if (logo && logo.src) {
    await drawCenterLogo(canvas, logo.src, {
      sizePercent: logo.sizePercent || 20,
      bgColor: bgColor
    });
  }
}

/**
 * Draws a logo centered over the QR canvas with a clean protective badge
 * @param {HTMLCanvasElement} canvas 
 * @param {string} logoSrc 
 * @param {Object} opts 
 * @returns {Promise<void>}
 */
function drawCenterLogo(canvas, logoSrc, opts = {}) {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const { sizePercent = 20, bgColor = '#ffffff' } = opts;
      const logoSize = (canvas.width * sizePercent) / 100;
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;
      const padding = Math.max(4, logoSize * 0.12);
      const bgSize = logoSize + padding * 2;
      const bgX = (canvas.width - bgSize) / 2;
      const bgY = (canvas.height - bgSize) / 2;
      const cornerRadius = bgSize * 0.22;

      // Draw protective rounded background behind the logo
      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(bgX, bgY, bgSize, bgSize, cornerRadius);
      ctx.fill();

      // Subtle border for clarity
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Clip and draw image smoothly
      ctx.beginPath();
      ctx.roundRect(x, y, logoSize, logoSize, cornerRadius * 0.8);
      ctx.clip();
      ctx.drawImage(img, x, y, logoSize, logoSize);
      ctx.restore();

      resolve();
    };

    img.onerror = () => {
      // If logo fails to load, gracefully continue without throwing
      resolve();
    };

    img.src = logoSrc;
  });
}

/**
 * Generates high-resolution PNG Data URL for download
 * @param {string} text 
 * @param {Object} options 
 * @returns {Promise<string>} Data URL
 */
export async function generateQrDataUrl(text, options = {}) {
  const offscreen = document.createElement('canvas');
  await renderQrToCanvas(offscreen, text, options);
  return offscreen.toDataURL('image/png');
}
