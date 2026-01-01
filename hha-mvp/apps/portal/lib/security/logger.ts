/**
 * Redacting logger that rejects PHI-like values
 * Prevents logging of MRN, DOB, email patterns, and other PHI
 */

// Patterns that indicate PHI
const PHI_PATTERNS = [
  // MRN patterns: MRN-123, MR123456, etc.
  /\b(MRN|MR)[\s\-_]?[\dA-Z]{4,}/i,
  // DOB patterns: MM/DD/YYYY, YYYY-MM-DD with dates
  /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,
  // Email patterns
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  // SSN patterns: XXX-XX-XXXX
  /\b\d{3}-\d{2}-\d{4}\b/,
  // Phone patterns: (XXX) XXX-XXXX, XXX-XXX-XXXX
  /\b(\(?\d{3}\)?[\s\-]?)?\d{3}[\s\-]?\d{4}\b/,
]

function containsPHI(value: unknown): boolean {
  if (typeof value === 'string') {
    return PHI_PATTERNS.some(pattern => pattern.test(value))
  }

  if (typeof value === 'object' && value !== null) {
    // Check nested objects
    for (const [key, val] of Object.entries(value)) {
      // Skip known safe keys
      if (['id', 'syntheticId', 'status', 'type'].includes(key.toLowerCase())) {
        continue
      }
      if (containsPHI(val)) {
        return true
      }
    }
  }

  return false
}

function redactValue(value: unknown): unknown {
  if (typeof value === 'string' && containsPHI(value)) {
    return '[REDACTED]'
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const redacted: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      if (containsPHI(val)) {
        redacted[key] = '[REDACTED]'
      } else {
        redacted[key] = redactValue(val)
      }
    }
    return redacted
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) => redactValue(item))
  }

  return value
}

interface Logger {
  info(message: string, meta?: unknown): void
  error(message: string, error?: unknown, meta?: unknown): void
  warn(message: string, meta?: unknown): void
  debug(message: string, meta?: unknown): void
}

class RedactingLogger implements Logger {
  private baseLogger: typeof console

  constructor() {
    this.baseLogger = console
  }

  private shouldReject(message: string, meta?: unknown): boolean {
    // Check message itself
    if (containsPHI(message)) {
      return true
    }

    // Check metadata
    if (meta && containsPHI(meta)) {
      return true
    }

    return false
  }

  info(message: string, meta?: unknown): void {
    if (this.shouldReject(message, meta)) {
      this.baseLogger.warn('[LOGGER] Rejected log entry containing potential PHI')
      return
    }

    const safeMeta = meta ? redactValue(meta) : undefined
    this.baseLogger.log(`[INFO] ${message}`, safeMeta || '')
  }

  error(message: string, error?: unknown, meta?: unknown): void {
    // Always log errors, but redact PHI
    const safeMeta = meta ? redactValue(meta) : undefined
    this.baseLogger.error(`[ERROR] ${message}`, error, safeMeta || '')
  }

  warn(message: string, meta?: unknown): void {
    if (this.shouldReject(message, meta)) {
      this.baseLogger.warn('[LOGGER] Rejected log entry containing potential PHI')
      return
    }

    const safeMeta = meta ? redactValue(meta) : undefined
    this.baseLogger.warn(`[WARN] ${message}`, safeMeta || '')
  }

  debug(message: string, meta?: unknown): void {
    if (this.shouldReject(message, meta)) {
      this.baseLogger.warn('[LOGGER] Rejected log entry containing potential PHI')
      return
    }

    const safeMeta = meta ? redactValue(meta) : undefined
    this.baseLogger.debug(`[DEBUG] ${message}`, safeMeta || '')
  }
}

// Export singleton logger instance
export const logger = new RedactingLogger()

