import QRCode from 'qrcode';
import jsQR from 'jsqr';

console.log('--- TESTING QR CODE ROUNDTRIP ENCODING & DECODING ---');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`✕ FAIL: ${name}`);
    failed++;
  }
}

async function testRoundtrip(url, errorCorrectionLevel = 'M') {
  // Generate raw pixel data from QRCode
  const qrData = await QRCode.create(url, { errorCorrectionLevel });
  const size = qrData.modules.size;
  const margin = 2;
  const totalSize = size + margin * 2;
  const scale = 8;
  const canvasWidth = totalSize * scale;

  const rgbaBuffer = new Uint8ClampedArray(canvasWidth * canvasWidth * 4);

  // Fill white
  for (let i = 0; i < rgbaBuffer.length; i += 4) {
    rgbaBuffer[i] = 255;
    rgbaBuffer[i + 1] = 255;
    rgbaBuffer[i + 2] = 255;
    rgbaBuffer[i + 3] = 255;
  }

  // Draw modules
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (qrData.modules.get(r, c)) {
        const startX = (c + margin) * scale;
        const startY = (r + margin) * scale;
        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const pixelIdx = ((startY + py) * canvasWidth + (startX + px)) * 4;
            rgbaBuffer[pixelIdx] = 0;
            rgbaBuffer[pixelIdx + 1] = 0;
            rgbaBuffer[pixelIdx + 2] = 0;
            rgbaBuffer[pixelIdx + 3] = 255;
          }
        }
      }
    }
  }

  const decoded = jsQR(rgbaBuffer, canvasWidth, canvasWidth);
  return decoded ? decoded.data : null;
}

async function runTests() {
  const testUrls = [
    'https://github.com/anushkasingh-commits',
    'https://example.com/api/v1/auth?token=1234567890abcdef&redirect=true#dashboard',
    'http://insecure-domain.org/path',
    'https://sub.domain.co.uk/search?q=test%20query&page=3'
  ];

  for (const url of testUrls) {
    const decoded = await testRoundtrip(url, 'M');
    assert(decoded === url, `Decoded payload matches "${url}"`);
  }

  console.log(`\nROUNDTRIP RESULTS: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
