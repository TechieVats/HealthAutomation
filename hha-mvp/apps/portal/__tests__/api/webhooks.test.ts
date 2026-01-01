import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { POST } from '@/app/api/webhooks/esign/route'
import { createMockRequest, getJsonResponse } from './test-utils'
import { prisma } from '@/lib/prisma'
import { factoryPatient } from '@hha-mvp/domain'
import { mockDocumensoClient } from '@hha-mvp/adapters'

describe('API: /api/webhooks/esign', () => {
  let testPatientId: string
  let testAdmissionId: string
  let testEnvelopeId: string

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

    // Create envelope first
    const { envelopeId } = await mockDocumensoClient.createEnvelope({
      subject: 'Test Admission',
      recipients: ['test@example.com'],
      htmlDoc: '<html>Test</html>',
      callbackUrl: 'http://localhost:3000/api/webhooks/esign',
    })
    testEnvelopeId = envelopeId

    const admission = await prisma.admissionPacket.create({
      data: {
        patientId: patient.id,
        dataJson: {
          extractedFields: {},
          envelopeId: testEnvelopeId,
        },
        status: 'pending_signature',
      },
    })
    testAdmissionId = admission.id
  })

  afterAll(async () => {
    await prisma.admissionPacket.delete({ where: { id: testAdmissionId } }).catch(() => {})
    await prisma.patient.delete({ where: { id: testPatientId } }).catch(() => {})
  })

  it('should reject request without envelopeId', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/webhooks/esign',
      body: {},
    })
    const response = await POST(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('envelopeId')
  })

  it('should process webhook and mark admission as signed', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/webhooks/esign',
      body: {
        envelopeId: testEnvelopeId,
      },
    })
    const response = await POST(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.admissionPacketId).toBe(testAdmissionId)
    expect(data.data.signedPdfPath).toBeDefined()

    // Verify database update
    const updated = await prisma.admissionPacket.findUnique({
      where: { id: testAdmissionId },
    })
    expect(updated?.status).toBe('signed')
    expect(updated?.signedPdfPath).toBeDefined()
  })
})

