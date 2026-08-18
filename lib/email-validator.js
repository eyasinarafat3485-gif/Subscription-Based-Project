import { promises as dnsPromises } from 'dns';

// List of common disposable / fake / temporary email domains to block
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', '10minutemail.com', 'mailinator.com',
  'guerrillamail.com', 'trashmail.com', 'yopmail.com', 'dispostable.com',
  'getnada.com', 'fakeinbox.com', 'throwawaymail.com', 'generator.email',
  'sharklasers.com', 'crazymailing.com', 'dropmail.me', 'mohmal.com',
  'maildrop.cc', 'tempmail.net', 'disposablemail.com', 'mytemp.email',
  'nada.ltd', 'emailondeck.com', 'tempinbox.com', 'getairmail.com',
  'inboxalias.com', 'fakemailgenerator.com', 'tempmailaddress.com',
  'armyspy.com', 'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu',
  'gustr.com', 'jourrapide.com', 'rhyta.com', 'teleworm.us', 'superrito.com'
]);

/**
 * Validates whether an email address is syntactically valid, not disposable,
 * and belongs to a domain with active DNS MX (Mail Exchange) records.
 * 
 * @param {string} email 
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export async function validateOrganicEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }

  const trimmed = email.trim().toLowerCase();

  // 1. Strict Syntax Regex Check (RFC 5322)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email format (e.g. name@example.com).' };
  }

  const domain = trimmed.split('@')[1];
  if (!domain) {
    return { valid: false, error: 'Invalid email domain.' };
  }

  // 2. Disposable / Fake Domain Check
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, error: 'Temporary or disposable email addresses are not allowed. Please use a real email (e.g. Gmail, Yahoo, Outlook).' };
  }

  // 3. DNS MX Record Verification (Check if domain actually receives emails)
  try {
    const mxRecords = await dnsPromises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, error: `The domain "${domain}" has no active mail server and cannot receive emails.` };
    }
  } catch (err) {
    // If ENOTFOUND or ENODATA, domain doesn't exist or has no mail servers
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return { valid: false, error: `The email domain "${domain}" does not exist or cannot accept emails.` };
    }
    // Fallback: If DNS resolution fails due to timeout or network glitch, log warning but don't hard crash
    console.warn(`DNS MX lookup warning for domain "${domain}":`, err.message);
  }

  return { valid: true };
}
