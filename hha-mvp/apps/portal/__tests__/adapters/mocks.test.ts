import { describe, it, expect } from 'vitest'
import {
  mockEvvClient,
  mockDocumensoClient,
  ehrAdapter,
} from '@hha-mvp/adapters'

describe('Adapter Mocks', () => {
  describe('MockEVVClient', () => {
    it('should push schedule and return ok', async () => {
      const result = await mockEvvClient.pushSchedule({
        id: 'visit-123',
        patientId: 'patient-123',
        startPlanned: new Date(),
      })

      expect(result.ok).toBe(true)
    })

    it('should record events', async () => {
      const result = await mockEvvClient.recordEvent({
        visitId: 'visit-123',
        kind: 'clock_in',
        timestamp: new Date(),
        lat: 40.7128,
        lng: -74.0060,
      })

      expect(result.ok).toBe(true)
    })

    it('should validate visits', async () => {
      // First push a schedule
      await mockEvvClient.pushSchedule({
        id: 'visit-123',
        patientId: 'patient-123',
        startPlanned: new Date(),
      })

      // Record events
      await mockEvvClient.recordEvent({
        visitId: 'visit-123',
        kind: 'clock_in',
        timestamp: new Date(),
        lat: 40.7128,
        lng: -74.0060,
      })

      await mockEvvClient.recordEvent({
        visitId: 'visit-123',
        kind: 'clock_out',
        timestamp: new Date(Date.now() + 3600000),
        lat: 40.7128,
        lng: -74.0060,
      })

      // Validate
      const result = await mockEvvClient.validate('visit-123')
      expect(result.verified).toBeDefined()
      expect(Array.isArray(result.reasons)).toBe(true)
    })
  })

  describe('MockDocumensoClient', () => {
    it('should create envelope', async () => {
      const result = await mockDocumensoClient.createEnvelope({
        subject: 'Test Document',
        recipients: ['test@example.com'],
        htmlDoc: '<html>Test</html>',
        callbackUrl: 'http://localhost:3000/webhook',
      })

      expect(result.envelopeId).toBeDefined()
      expect(result.envelopeId).toContain('env_')
    })

    it('should get status', async () => {
      const { envelopeId } = await mockDocumensoClient.createEnvelope({
        subject: 'Test',
        recipients: ['test@example.com'],
        htmlDoc: '<html>Test</html>',
        callbackUrl: 'http://localhost:3000/webhook',
      })

      const status = await mockDocumensoClient.getStatus(envelopeId)
      expect(['draft', 'sent', 'completed']).toContain(status)
    })

    it('should download PDF', async () => {
      const { envelopeId } = await mockDocumensoClient.createEnvelope({
        subject: 'Test',
        recipients: ['test@example.com'],
        htmlDoc: '<html>Test</html>',
        callbackUrl: 'http://localhost:3000/webhook',
      })

      const pdf = await mockDocumensoClient.downloadPdf(envelopeId)
      expect(pdf).toBeInstanceOf(Buffer)
      expect(pdf.length).toBeGreaterThan(0)
    })
  })

  describe('MockEHRAdapter', () => {
    it('should sync patient', async () => {
      const result = await ehrAdapter.syncPatient('patient-123', {
        mrn: 'MRN-123',
      })

      expect(result.success).toBe(true)
      expect(result.ehrId).toBeDefined()
    })

    it('should get patient data', async () => {
      const result = await ehrAdapter.getPatientData('patient-123')
      expect(result).toBeDefined()
    })
  })
})

