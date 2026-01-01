import {
  PatientCreateSchema,
  DocumentCreateSchema,
  VisitCreateSchema,
  CarePlanCreateSchema,
} from '@/app/lib/zod-schemas'

describe('Zod Schemas', () => {
  describe('PatientCreateSchema', () => {
    it('should validate a valid patient', () => {
      const valid = {
        syntheticId: 'PAT-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      }

      const result = PatientCreateSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should require syntheticId', () => {
      const invalid = {
        firstName: 'John',
      }

      const result = PatientCreateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('DocumentCreateSchema', () => {
    it('should validate a valid document', () => {
      const valid = {
        patientId: 'patient-123',
        fileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
        fileType: 'pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
      }

      const result = DocumentCreateSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should require all fields', () => {
      const invalid = {
        fileName: 'test.pdf',
      }

      const result = DocumentCreateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('VisitCreateSchema', () => {
    it('should validate a valid visit', () => {
      const valid = {
        patientId: 'patient-123',
        visitDate: new Date().toISOString(),
        visitType: 'home',
      }

      const result = VisitCreateSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should only allow valid visit types', () => {
      const invalid = {
        patientId: 'patient-123',
        visitDate: new Date().toISOString(),
        visitType: 'invalid',
      }

      const result = VisitCreateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('CarePlanCreateSchema', () => {
    it('should validate a valid care plan', () => {
      const valid = {
        patientId: 'patient-123',
        title: 'Test Care Plan',
        startDate: new Date().toISOString(),
      }

      const result = CarePlanCreateSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should default status to active', () => {
      const valid = {
        patientId: 'patient-123',
        title: 'Test Care Plan',
        startDate: new Date().toISOString(),
      }

      const result = CarePlanCreateSchema.parse(valid)
      expect(result.status).toBe('active')
    })
  })
})

