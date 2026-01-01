import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { POST as POST_PUSH } from '@/app/api/evv/push-schedule/route'
import { POST as POST_RECORD } from '@/app/api/evv/record-event/route'
import { GET } from '@/app/api/evv/validate/route'
import { createMockRequest, getJsonResponse } from './test-utils'
import { prisma } from '@/lib/prisma'
import { factoryPatient } from '@hha-mvp/domain'

describe('API: /api/evv/*', () => {
  let testPatientId: string
  let testVisitId: string

  beforeAll(async () => {
    // Create test patient and visit
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

    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + 3600000)
    const visit = await prisma.visit.create({
      data: {
        patientId: patient.id,
        startPlanned: startDate,
        endPlanned: endDate,
        status: 'scheduled',
      },
    })
    testVisitId = visit.id
  })

  afterAll(async () => {
    await prisma.visit.delete({ where: { id: testVisitId } }).catch(() => {})
    await prisma.patient.delete({ where: { id: testPatientId } }).catch(() => {})
  })

  describe('POST /api/evv/push-schedule', () => {
    it('should reject request without visitId', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/evv/push-schedule',
        body: {},
      })
      const response = await POST_PUSH(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should push schedule to EVV system', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/evv/push-schedule',
        body: { visitId: testVisitId },
      })
      const response = await POST_PUSH(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('successfully')
    })
  })

  describe('POST /api/evv/record-event', () => {
    it('should reject request without required fields', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/evv/record-event',
        body: { visitId: testVisitId },
      })
      const response = await POST_RECORD(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should record clock-in event', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/evv/record-event',
        body: {
          visitId: testVisitId,
          kind: 'clock_in',
          timestamp: new Date().toISOString(),
          lat: 40.7128,
          lng: -74.0060,
        },
      })
      const response = await POST_RECORD(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.eventId).toBeDefined()

      // Verify event was created in database
      const events = await prisma.evvEvent.findMany({
        where: { visitId: testVisitId },
      })
      expect(events.length).toBeGreaterThan(0)
      expect(events.some(e => e.kind === 'clock_in')).toBe(true)
    })

    it('should record clock-out event', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/evv/record-event',
        body: {
          visitId: testVisitId,
          kind: 'clock_out',
          timestamp: new Date().toISOString(),
          lat: 40.7128,
          lng: -74.0060,
        },
      })
      const response = await POST_RECORD(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('GET /api/evv/validate', () => {
    it('should reject request without visitId', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/evv/validate',
      })
      const response = await GET(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate visit with events', async () => {
      // First push schedule and record events
      await POST_PUSH(createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/evv/push-schedule',
        body: { visitId: testVisitId },
      }))

      const request = createMockRequest({
        method: 'GET',
        url: `http://localhost:3000/api/evv/validate?visitId=${testVisitId}`,
      })
      const response = await GET(request)
      const data = await getJsonResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.verified).toBeDefined()
      expect(Array.isArray(data.data.reasons)).toBe(true)
    })
  })
})

