import { ehrAdapter } from '@/app/lib/adapters/ehr-adapter'
import { evvAdapter } from '@/app/lib/adapters/evv-adapter'
import { esignAdapter } from '@/app/lib/adapters/esign-adapter'
import { ocrAdapter } from '@/app/lib/adapters/ocr-adapter'

describe('Adapters', () => {
  describe('EHR Adapter', () => {
    it('should have syncCarePlan method', () => {
      expect(typeof ehrAdapter.syncCarePlan).toBe('function')
    })

    it('should return mock data in development', async () => {
      const result = await ehrAdapter.syncCarePlan('test-id', {})
      expect(result.success).toBe(true)
      expect(result.ehrId).toBeDefined()
    })
  })

  describe('EVV Adapter', () => {
    it('should have verifyVisit method', () => {
      expect(typeof evvAdapter.verifyVisit).toBe('function')
    })

    it('should return verified status in development', async () => {
      const result = await evvAdapter.verifyVisit('test-id', {})
      expect(result.success).toBe(true)
      expect(result.verified).toBe(true)
    })
  })

  describe('E-Signature Adapter', () => {
    it('should have requestSignature method', () => {
      expect(typeof esignAdapter.requestSignature).toBe('function')
    })

    it('should return signature ID in development', async () => {
      const result = await esignAdapter.requestSignature(
        'doc-id',
        'test@example.com',
        'Test User'
      )
      expect(result.success).toBe(true)
      expect(result.signatureId).toBeDefined()
    })
  })

  describe('OCR Adapter', () => {
    it('should have processDocument method', () => {
      expect(typeof ocrAdapter.processDocument).toBe('function')
    })

    // Note: OCR test would require an actual file, skipped for minimal tests
  })
})

