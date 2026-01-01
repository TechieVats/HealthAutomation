import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { GET, POST } from '@/app/api/visits/route'
import { createMockRequest, getJsonResponse } from './test-utils'
import { prisma } from '@/lib/prisma'
import { factoryPatient } from '@hha-mvp/domain'

describe('API: /api/visits', () => {
  let testPatientId: string
  let createdVisitIds: string[] = []

  beforeAll(async () => {
    // Create a test patient
    const patientData = factoryPatient()
    const patient = await prisma.patient.create({
      data: {
        mrn: patientData.mrn,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dob: patientData.dob ? new Date(patientData.dob) : null,
        payer: patientData.payer,
      },
    })
    testPatientId = patient.id
  })

  afterAll(async () => {
    // Cleanup
    for (const id of createdVisitIds) {
      await prisma.visit.delete({ where: { id } }).catch(() => {})
    }
    await prisma.patient.delete({ where: { id: testPatientId } }).catch(() => {})
  })

  describe('POST /api/visits', () => {
    it('should reject request with missing required fields', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/visits',
        body: { patientId: testPatientId },
      })
      const response = await POST(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('required fields')
    })

    it('should successfully create a visit', async () => {
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + 3600000) // 1 hour later

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/visits',
        body: {
          patientId: testPatientId,
          startPlanned: startDate.toISOString(),
          endPlanned: endDate.toISOString(),
          caregiverName: 'Test Caregiver',
          status: 'scheduled',
        },
      })

      const response = await POST(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.visitId).toBeDefined()
      expect(data.visit).toBeDefined()
      expect(data.visit.patientId).toBe(testPatientId)
      expect(data.visit.status).toBe('scheduled')

      createdVisitIds.push(data.visitId)
    })
  })

  describe('GET /api/visits', () => {
    it('should return list of visits', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/visits',
      })

      const response = await GET(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.visits)).toBe(true)
    })
  })
})

