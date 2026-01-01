import { describe, it, expect } from 'vitest'
import { generateSignedUrl, verifySignedUrl } from '@/lib/security/signed-url'

describe('Signed URL Helper', () => {
  it('should generate valid signed URL', () => {
    const url = generateSignedUrl({
      path: '/var/data/referrals/test.pdf',
    })

    expect(url).toContain('/api/files/download')
    expect(url).toContain('token=')
  })

  it('should verify valid token', () => {
    const url = generateSignedUrl({
      path: '/var/data/referrals/test.pdf',
      expiryMinutes: 10,
    })

    const token = new URL(url).searchParams.get('token')!
    const verification = verifySignedUrl(token)

    expect(verification.valid).toBe(true)
    expect(verification.path).toBe('/var/data/referrals/test.pdf')
  })

  it('should reject expired token', async () => {
    const url = generateSignedUrl({
      path: '/var/data/referrals/test.pdf',
      expiryMinutes: 0.001, // 0.001 minutes = very short expiry
    })

    const token = new URL(url).searchParams.get('token')!

    // Wait for expiry
    await new Promise(resolve => setTimeout(resolve, 100))

    const verification = verifySignedUrl(token)
    expect(verification.valid).toBe(false)
    expect(verification.error).toContain('expired')
  })

  it('should reject invalid signature', () => {
    const invalidToken = 'invalid.token.signature'
    const verification = verifySignedUrl(invalidToken)

    expect(verification.valid).toBe(false)
    expect(verification.error).toBeDefined()
  })

  it('should include metadata in signed URL', () => {
    const url = generateSignedUrl({
      path: '/var/data/referrals/test.pdf',
      metadata: { admissionId: 'test-123', type: 'admission' },
    })

    const token = new URL(url).searchParams.get('token')!
    const verification = verifySignedUrl(token)

    expect(verification.valid).toBe(true)
    expect(verification.metadata).toBeDefined()
    expect((verification.metadata as Record<string, string>).admissionId).toBe('test-123')
  })
})

