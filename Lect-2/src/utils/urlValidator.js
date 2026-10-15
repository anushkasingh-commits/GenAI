/**
 * URL Validator & Security Analyzer for QRForge
 * Strict protocol whitelist, structure validation, and threat detection.
 */

// Only allow safe web protocols
const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);

// Dangerous or unsupported protocols that MUST be explicitly blocked
const FORBIDDEN_PROTOCOLS = new Set([
  'javascript:',
  'data:',
  'file:',
  'ftp:',
  'ftps:',
  'vbscript:',
  'blob:',
  'about:',
  'chrome:',
  'resource:',
  'filesystem:',
  'ws:',
  'wss:',
  'ssh:',
  'telnet:',
  'gopher:'
]);

// Reserved / Private IPv4 ranges regex
const PRIVATE_IPV4_REGEX = /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|0\.0\.0\.0|localhost)$/i;

// IPv4 detection regex
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

// IPv6 detection in hostname
const IPV6_REGEX = /^\[?[0-9a-fA-F:]+\]?$/;

// Suspicious phishing / deceptive patterns in domain or path
const SUSPICIOUS_DOMAIN_PATTERNS = [
  /login-verify/i,
  /update-account/i,
  /security-check/i,
  /secure-billing/i,
  /verify-id/i,
  /signin-confirm/i,
  /account-recovery/i,
];

/**
 * Validates and analyzes a URL string for QR code generation
 * @param {string} rawInput 
 * @returns {Object} Structured validation result
 */
export function validateUrl(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a URL to get started.',
      warnings: [],
      normalizedUrl: '',
      originalInput: '',
      details: null,
    };
  }

  const trimmed = rawInput.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please enter a URL.',
      warnings: [],
      normalizedUrl: '',
      originalInput: rawInput,
      details: null,
    };
  }

  // Check for forbidden control characters or raw newlines / tabs
  if (/[\r\n\t\0]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'URL contains illegal control characters or line breaks.',
      warnings: [],
      normalizedUrl: '',
      originalInput: rawInput,
      details: null,
    };
  }

  // Check for explicit forbidden protocols before parsing
  const lowerInput = trimmed.toLowerCase();
  for (const forbidden of FORBIDDEN_PROTOCOLS) {
    if (lowerInput.startsWith(forbidden)) {
      return {
        isValid: false,
        error: `Protocol '${forbidden}' is blocked for security reasons. Only http:// and https:// URLs are permitted.`,
        warnings: [],
        normalizedUrl: '',
        originalInput: rawInput,
        details: null,
      };
    }
  }

  // Check for HTML/Script injection attempts
  if (/<script|<\/?\w+.*?>/i.test(trimmed)) {
    return {
      isValid: false,
      error: 'Dangerous script or HTML injection detected. Only standard web URLs are allowed.',
      warnings: [],
      normalizedUrl: '',
      originalInput: rawInput,
      details: null,
    };
  }

  // Check if string lacks a scheme (e.g. plain text "example" or "hello world")
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) {
    return {
      isValid: false,
      error: 'Missing protocol. Please enter a complete URL starting with https:// or http://',
      warnings: [],
      normalizedUrl: '',
      originalInput: rawInput,
      details: null,
    };
  }

  const scheme = schemeMatch[1].toLowerCase() + ':';
  if (!ALLOWED_PROTOCOLS.has(scheme)) {
    return {
      isValid: false,
      error: `Protocol '${scheme}' is not supported. Only https:// and http:// are allowed.`,
      warnings: [],
      normalizedUrl: '',
      originalInput: rawInput,
      details: null,
    };
  }

  // Attempt URL parse
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    return {
      isValid: false,
      error: 'This URL appears malformed or has an invalid structure.',
      warnings: [],
      normalizedUrl: '',
      originalInput: rawInput,
      details: null,
    };
  }

  // Check hostname presence and validity
  const hostname = parsed.hostname;
  if (!hostname || hostname.trim() === '') {
    return {
      isValid: false,
      error: 'URL is missing a valid hostname (domain or IP).',
      warnings: [],
      normalizedUrl: '',
      originalInput: rawInput,
      details: null,
    };
  }

  // Ensure hostname has either a valid dot (domain with TLD) or is localhost or IP
  const isIp = IPV4_REGEX.test(hostname) || hostname.startsWith('[') || hostname === 'localhost';
  const hasDot = hostname.includes('.');
  if (!hasDot && !isIp && hostname !== 'localhost') {
    return {
      isValid: false,
      error: `"${hostname}" is not a valid fully qualified domain name.`,
      warnings: [],
      normalizedUrl: '',
      originalInput: rawInput,
      details: null,
    };
  }

  // Generate Warnings for Suspicious or Unusual characteristics
  const warnings = [];

  // 1. Insecure HTTP Warning
  if (parsed.protocol === 'http:') {
    warnings.push({
      id: 'insecure-http',
      title: 'Unencrypted Connection (HTTP)',
      message: 'This URL uses unencrypted HTTP instead of secure HTTPS. Sensitive data transmitted over this link may be intercepted.',
      severity: 'warning'
    });
  }

  // 2. IP Address / Localhost Warning
  if (isIp || PRIVATE_IPV4_REGEX.test(hostname)) {
    warnings.push({
      id: 'ip-address',
      title: 'IP Address Destination',
      message: `The destination "${hostname}" is a raw IP or local address rather than a public domain name. Scanners on external networks will be unable to access local addresses.`,
      severity: 'warning'
    });
  }

  // 3. Punycode / Internationalized Domain Name (Homograph spoof risk)
  if (hostname.includes('xn--')) {
    warnings.push({
      id: 'punycode-domain',
      title: 'Punycode / IDN Domain Detected',
      message: 'This domain uses Punycode (internationalized characters), which can sometimes be used in lookalike / spoofing attacks.',
      severity: 'warning'
    });
  }

  // 4. Non-standard Port
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    warnings.push({
      id: 'custom-port',
      title: 'Non-Standard Port',
      message: `The URL connects to a custom port (:${parsed.port}). Some mobile networks or firewalls may block non-standard web ports.`,
      severity: 'info'
    });
  }

  // 5. Extremely Long URL (> 1500 chars)
  if (trimmed.length > 1500) {
    warnings.push({
      id: 'long-url',
      title: 'Very Long URL',
      message: `URL length is ${trimmed.length} characters. Generating high-density QR codes may make scanning difficult on low-resolution cameras.`,
      severity: 'warning'
    });
  }

  // 6. Suspicious Phishing Keywords
  for (const pattern of SUSPICIOUS_DOMAIN_PATTERNS) {
    if (pattern.test(parsed.hostname) || pattern.test(parsed.pathname)) {
      warnings.push({
        id: 'suspicious-keywords',
        title: 'Suspicious URL Structure',
        message: 'The URL structure contains patterns commonly associated with credential harvesting or deceptive redirects.',
        severity: 'warning'
      });
      break;
    }
  }

  // 7. Excessive subdomains (e.g. secure.login.bank.update.example.com)
  const domainParts = hostname.split('.');
  if (domainParts.length > 4 && !isIp) {
    warnings.push({
      id: 'deep-subdomain',
      title: 'Deep Subdomain Hierarchy',
      message: 'This URL has numerous subdomain levels, which is a common obfuscation technique in phishing campaigns.',
      severity: 'info'
    });
  }

  // Safe Normalized URL string
  const normalizedUrl = parsed.toString();

  // Extract query parameters
  const queryParams = [];
  parsed.searchParams.forEach((value, key) => {
    queryParams.push({ key, value });
  });

  return {
    isValid: true,
    error: null,
    warnings,
    normalizedUrl,
    originalInput: rawInput,
    details: {
      protocol: parsed.protocol,
      isHttps: parsed.protocol === 'https:',
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      queryParams,
      queryParamsCount: queryParams.length,
      length: normalizedUrl.length,
      isIpAddress: isIp,
      isPunycode: hostname.includes('xn--'),
      origin: parsed.origin
    }
  };
}
