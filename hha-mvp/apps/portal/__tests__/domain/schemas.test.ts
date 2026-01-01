import { describe, it, expect } from 'vitest'
import {
  PatientCreateSchema,
  ReferralCreateSchema,
  VisitCreateSchema,
  EmployeeCreateSchema,
  AdmissionPacketCreateSchema,
} from '@hha-mvp/domain'

describe('Domain Schemas', () => {
  describe('PatientCreateSchema', () => {
    it('should parse valid patient data', () => {
      const valid = {
        mrn: 'MRN-123456',
        firstName: 'John',
        lastName: 'Doe',
        dob: '1980-01-15T00:00:00Z',
        payer: 'Medicare',
      }

      const result = PatientCreateSchema.safeParse(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.mrn).toBe('MRN-123456')
        expect(result.data.payer).toBe('Medicare')
      }
    })

    it('should require mrn', () => {
      const invalid = {
        firstName: 'John',
      }

      const result = PatientCreateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should validate payer enum', () => {
      const invalid = {
        mrn: 'MRN-123',
        payer: 'InvalidPayer',
      }

      const result = PatientCreateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('ReferralCreateSchema', () => {
    it('should parse valid referral data', () => {
      // Use a valid CUID format for patientId (CUID format: cl + 24 alphanumeric chars)
      const valid = {
        patientId: 'clm0wq8hq0000fq8hq0000000', // Valid CUID format
        source: 'Hospital',
        status: 'pending' as const,
      }

      const result = ReferralCreateSchema.safeParse(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.patientId).toBe(valid.patientId)
        expect(result.data.status).toBe('pending')
      }
    })

    it('should require patientId', () => {
      const invalid = {
        source: 'Hospital',
      }

      const result = ReferralCreateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('VisitCreateSchema', () => {
    it('should parse valid visit data', () => {
      // Use valid CUID and ISO datetime format
      const valid = {
        patientId: 'clm0wq8hq0000fq8hq0000000', // Valid CUID format
        startPlanned: new Date().toISOString(),
        endPlanned: new Date(Date.now() + 3600000).toISOString(),
        status: 'scheduled' as const,
      }

      const result = VisitCreateSchema.safeParse(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.patientId).toBe(valid.patientId)
        expect(result.data.status).toBe('scheduled')
      }
    })

    it('should only allow valid visit statuses', () => {
      const invalid = {
        patientId: 'patient-123',
        startPlanned: new Date().toISOString(),
        status: 'invalid_status',
      }

      const result = VisitCreateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('EmployeeCreateSchema', () => {
    it('should parse valid employee data', () => {
      const valid = {
        name: 'John Doe',
        role: 'RN',
        licenseNo: 'LIC-12345',
        licenseExpiry: new Date().toISOString(),
      }

      const result = EmployeeCreateSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should require name and role', () => {
      const invalid = {
        name: 'John Doe',
      }

      const result = EmployeeCreateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('AdmissionPacketCreateSchema', () => {
    it('should parse valid admission packet data', () => {
      // Use valid CUID format
      const valid = {
        patientId: 'clm0wq8hq0000fq8hq0000000', // Valid CUID format
        dataJson: { extractedFields: { firstName: 'John' } },
        status: 'draft' as const,
      }

      const result = AdmissionPacketCreateSchema.safeParse(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.patientId).toBe(valid.patientId)
        expect(result.data.status).toBe('draft')
      }
    })

    it('should require patientId and dataJson', () => {
      const invalid = {
        status: 'draft',
      }

      const result = AdmissionPacketCreateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})

