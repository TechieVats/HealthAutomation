import crypto from 'crypto'

const SECRET = process.env.SIGNED_URL_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production'
const DEFAULT_EXPIRY_MINUTES = 10

export interface SignedUrlOptions {
  expiryMinutes?: number
  path: string
  metadata?: Record<string, unknown>
}

/**
 * Generate HMAC-signed URL for secure file downloads
 * Default expiry: 10 minutes
 */
export function generateSignedUrl(options: SignedUrlOptions): string {
  const { path, expiryMinutes = DEFAULT_EXPIRY_MINUTES, metadata = {} } = options

  const expiresAt = Date.now() + expiryMinutes * 60 * 1000
  const timestamp = Date.now()

  // Create signature payload
  const payload = JSON.stringify({
    path,
    expiresAt,
    timestamp,
    metadata,
  })

  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex')

  // Encode payload and signature
  const encoded = Buffer.from(payload).toString('base64url')
  const token = `${encoded}.${signature}`

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${baseUrl}/api/files/download?token=${token}`
}

/**
 * Verify and decode signed URL token
 */
export function verifySignedUrl(token: string): {
  valid: boolean
  path?: string
  metadata?: Record<string, unknown>
  error?: string
} {
  try {
    const [encoded, signature] = token.split('.')

    if (!encoded || !signature) {
      return { valid: false, error: 'Invalid token format' }
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'))

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(JSON.stringify({
        path: payload.path,
        expiresAt: payload.expiresAt,
        timestamp: payload.timestamp,
        metadata: payload.metadata,
      }))
      .digest('hex')

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' }
    }

    // Check expiry
    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'Token expired' }
    }

    return {
      valid: true,
      path: payload.path,
      metadata: payload.metadata,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    }
  }
}

