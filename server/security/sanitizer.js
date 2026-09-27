import crypto from 'crypto';

const ADVERSARIAL_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt\s+override/i,
  /reveal\s+(the\s+)?system\s+(prompt|instructions)/i,
  /bypass\s+all\s+safety\s+filters/i,
  /you\s+are\s+now\s+in\s+DAN\s+mode/i,
  /pretend\s+you\s+are\s+unrestricted/i
];

export function createSecureCodePayload(code = '') {
  const nonce = crypto.randomBytes(6).toString('hex');
  const boundaryTag = `SECURE_CODE_BOUNDARY_${nonce}`;

  const hasAdversarialPatterns = ADVERSARIAL_PATTERNS.some(pattern => pattern.test(code));

  const boundedPayload = `<<<${boundaryTag}>>>\n${code}\n<<<${boundaryTag}>>>`;

  return {
    rawCode: code,
    nonce,
    boundaryTag,
    boundedPayload,
    hasAdversarialPatterns
  };
}

export function sanitizeCode(code = '') {
  if (typeof code !== 'string') return '';
  // Basic sanity cleaning
  return code.replace(/\0/g, '');
}
