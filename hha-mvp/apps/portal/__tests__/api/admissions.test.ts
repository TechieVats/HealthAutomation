import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { GET } from '@/app/api/admissions/[id]/route'
import { POST as POST_SEND } from '@/app/api/admissions/[id]/send-for-signature/route'
import { GET as GET_DOWNLOAD } from '@/app/api/admissions/[id]/download-pdf/route'
import { createMockRequest, getJsonResponse, createMockParams } from './test-utils'
import { prisma } from '@/lib/prisma'
import { factoryPatient } from '@hha-mvp/domain'

describe('API: /api/admissions/[id]', () => {
  let testPatientId: string
  let testAdmissionId: string

  beforeAll(async () => {
    // Create test patient and admission
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

    const admission = await prisma.admissionPacket.create({
      data: {
        patientId: patient.id,
        dataJson: {
          extractedFields: {
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            dob: '01/15/1980',
            payer: 'Medicare',
          },
        },
        status: 'draft',
      },
    })
    testAdmissionId = admission.id
  })

  afterAll(async () => {
    await prisma.admissionPacket.delete({ where: { id: testAdmissionId } }).catch(() => {})
    await prisma.patient.delete({ where: { id: testPatientId } }).catch(() => {})
  })

  describe('GET /api/admissions/[id]', () => {
    it('should return admission packet', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: `http://localhost:3000/api/admissions/${testAdmissionId}`,
      })
      const params = createMockParams({ id: testAdmissionId })
      const response = await GET(request, { params })
      const data = await getJsonResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.id).toBe(testAdmissionId)
      expect(data.patientId).toBe(testPatientId)
    })

    it('should return 404 for non-existent admission', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/admissions/non-existent-id',
      })
      const params = createMockParams({ id: 'non-existent-id' })
      const response = await GET(request, { params })
      const data = await getJsonResponse(response)

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/admissions/[id]/send-for-signature', () => {
    it('should send admission for signature', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: `http://localhost:3000/api/admissions/${testAdmissionId}/send-for-signature`,
        body: {
          recipientEmail: 'test@example.com',
        },
      })
      const params = createMockParams({ id: testAdmissionId })
      const response = await POST_SEND(request, { params })
      const data = await getJsonResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.envelopeId).toBeDefined()
      expect(data.data.status).toBe('pending_signature')

      // Verify database update
      const updated = await prisma.admissionPacket.findUnique({
        where: { id: testAdmissionId },
      })
      expect(updated?.status).toBe('pending_signature')
    })

    it('should reject if admission not in draft status', async () => {
      // Create another admission that's already signed
      const signedAdmission = await prisma.admissionPacket.create({
        data: {
          patientId: testPatientId,
          dataJson: {},
          status: 'signed',
        },
      })

      const request = createMockRequest({
        method: 'POST',
        url: `http://localhost:3000/api/admissions/${signedAdmission.id}/send-for-signature`,
        body: {
          recipientEmail: 'test@example.com',
        },
      })
      const params = createMockParams({ id: signedAdmission.id })
      const response = await POST_SEND(request, { params })
      const data = await getJsonResponse(response)

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)

      // Cleanup
      await prisma.admissionPacket.delete({ where: { id: signedAdmission.id } })
    })
  })

  describe('GET /api/admissions/[id]/download-pdf', () => {
    it('should return signed URL for download', async () => {
      // First, send for signature to create an envelope
      const sendRequest = createMockRequest({
        method: 'POST',
        url: `http://localhost:3000/api/admissions/${testAdmissionId}/send-for-signature`,
        body: { recipientEmail: 'test@example.com' },
      })
      const sendParams = createMockParams({ id: testAdmissionId })
      await POST_SEND(sendRequest, { params: sendParams })

      const request = createMockRequest({
        method: 'GET',
        url: `http://localhost:3000/api/admissions/${testAdmissionId}/download-pdf`,
      })
      const params = createMockParams({ id: testAdmissionId })
      const response = await GET_DOWNLOAD(request, { params })
      const data = await getJsonResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.signedUrl).toBeDefined()
      expect(data.signedUrl).toContain('/api/files/download')
    })
  })
})

