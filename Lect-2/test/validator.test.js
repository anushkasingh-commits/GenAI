import { validateUrl } from '../src/utils/urlValidator.js';
import { normalizeUrlDetails } from '../src/utils/urlNormalizer.js';
import { getContrastRatio, evaluateQRQuality } from '../src/utils/contrastChecker.js';

console.log('--- RUNNING QRFORGE AUTOMATED TEST SUITE ---');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`✕ FAIL: ${testName}`);
    failed++;
  }
}

// 1. Valid HTTPS URL
const testHttps = validateUrl('https://github.com/anushkasingh-commits');
assert(testHttps.isValid === true, '1. Valid HTTPS URL should pass validation');
assert(testHttps.details.hostname === 'github.com', '1b. Correct hostname parsed');
assert(testHttps.details.isHttps === true, '1c. Protocol is HTTPS');

// 2. Valid HTTP URL (should be valid but flag insecure warning)
const testHttp = validateUrl('http://example.com/api/test');
assert(testHttp.isValid === true, '2. Valid HTTP URL should pass');
assert(testHttp.warnings.some(w => w.id === 'insecure-http'), '2b. HTTP triggers unencrypted connection warning');

// 3. Reject javascript: protocol
const testJs = validateUrl('javascript:alert(1)');
assert(testJs.isValid === false, '3. javascript: protocol strictly rejected');
assert(testJs.error.includes('javascript:'), '3b. Clear diagnostic message for javascript:');

// 4. Reject data: protocol
const testData = validateUrl('data:text/html,<h1>test</h1>');
assert(testData.isValid === false, '4. data: protocol strictly rejected');

// 5. Reject file: protocol
const testFile = validateUrl('file:///etc/passwd');
assert(testFile.isValid === false, '5. file: protocol strictly rejected');

// 6. Reject unsupported protocols
const testFtp = validateUrl('ftp://files.example.com');
assert(testFtp.isValid === false, '6. ftp: protocol strictly rejected');

// 7. Reject empty string or whitespace
const testEmpty = validateUrl('');
assert(testEmpty.isValid === false, '7. Empty string rejected with helpful message');

const testSpaces = validateUrl('   ');
assert(testSpaces.isValid === false, '7b. Whitespace only rejected');

// 8. Reject plain text without protocol
const testPlainText = validateUrl('google.com');
assert(testPlainText.isValid === false, '8. Plain text without protocol fails strict validation');

// 9. Normalization suggestion for plain text
const norm = normalizeUrlDetails('google.com');
assert(norm.normalized === 'https://google.com', '9. Normalizer suggests https:// prefix for domain-like input');
assert(norm.wasModified === true, '9b. Normalizer flags modification');

// 10. Query parameters & hash preservation
const testComplex = validateUrl('https://example.com/path/to/resource?auth=token123&ref=mobile#section-4');
assert(testComplex.isValid === true, '10. Complex URL with params & hash passes');
assert(testComplex.details.queryParamsCount === 2, '10b. Correct query params count');
assert(testComplex.details.hash === '#section-4', '10c. Hash fragment preserved exactly');

// 11. IP Address detection & warning
const testIp = validateUrl('http://192.168.1.1:8080/admin');
assert(testIp.isValid === true, '11. Raw IP address is valid format');
assert(testIp.warnings.some(w => w.id === 'ip-address'), '11b. Raw IP triggers security warning');

// 12. Punycode / IDN detection & warning
const testPunycode = validateUrl('https://xn--e1afmkfd.xn--p1ai/path');
assert(testPunycode.isValid === true, '12. Punycode URL format is valid');
assert(testPunycode.warnings.some(w => w.id === 'punycode-domain'), '12b. Punycode triggers homograph advisory warning');

// 13. Very long URL warning
const longUrl = 'https://example.com/test?' + 'param='.repeat(350);
const testLong = validateUrl(longUrl);
assert(testLong.isValid === true, '13. Long URL format is valid');
assert(testLong.warnings.some(w => w.id === 'long-url'), '13b. Long URL triggers high-density warning');

// 14. Contrast Ratio calculation
const contrastBW = getContrastRatio('#000000', '#ffffff');
assert(contrastBW === 21, '14. Black on White contrast ratio is 21:1');

const contrastLow = getContrastRatio('#888888', '#999999');
assert(contrastLow < 3, '14b. Low contrast properly evaluated (< 3:1)');

// 15. QR Quality Evaluator
const qualityGood = evaluateQRQuality({
  fgColor: '#000000',
  bgColor: '#ffffff',
  errorCorrectionLevel: 'M',
  size: 512,
  margin: 2,
  hasLogo: false,
  urlLength: 40
});
assert(qualityGood.score >= 90, '15. High contrast setup scores Excellent');

const qualityRisky = evaluateQRQuality({
  fgColor: '#cccccc',
  bgColor: '#ffffff',
  errorCorrectionLevel: 'L',
  size: 150,
  margin: 0,
  hasLogo: true,
  urlLength: 700
});
assert(qualityRisky.score < 50, '15b. Risky contrast + small size + logo + low EC triggers warnings');
assert(qualityRisky.suggestions.length > 0, '15c. Actionable suggestions generated');

console.log(`\nTEST RESULTS: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
