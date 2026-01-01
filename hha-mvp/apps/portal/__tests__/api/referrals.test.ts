import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { POST } from '@/app/api/referrals/upload/route'
import { createMockRequest, createMockFormDataRequest, getJsonResponse } from './test-utils'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

describe('API: /api/referrals/upload', () => {
  let createdPatientIds: string[] = []
  let createdReferralIds: string[] = []
  let createdAdmissionIds: string[] = []
  const testFilesDir = path.join(process.cwd(), 'var', 'data', 'referrals')

  beforeAll(async () => {
    // Ensure test directory exists
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true })
    }
    
    // Check database connection
    try {
      await prisma.$connect()
    } catch (error) {
      console.warn('⚠️  Database connection failed - some tests may fail:', error)
    }
  })
  
  afterAll(async () => {
    // Cleanup: Delete created records
    for (const id of createdAdmissionIds) {
      await prisma.admissionPacket.delete({ where: { id } }).catch(() => {})
    }
    for (const id of createdReferralIds) {
      await prisma.referral.delete({ where: { id } }).catch(() => {})
    }
    for (const id of createdPatientIds) {
      await prisma.patient.delete({ where: { id } }).catch(() => {})
    }
  })

  it('should reject request without file', async () => {
    // Create a request with no file
    const formData = new FormData()
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/referrals/upload',
      formData,
    })
    const response = await POST(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('No file provided')
  })

  it('should reject non-PDF file', async () => {
    // Create a request with a text file
    const txtFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', txtFile)
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/referrals/upload',
      formData,
    })
    
    const response = await POST(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('PDF')
  })

  it('should successfully upload PDF and create patient, referral, and admission', async () => {
    // Create a mock PDF content (minimal valid PDF)
    const pdfContent = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\ntrailer\n<< /Root 1 0 R /Size 1 >>\nstartxref\n17\n%%EOF'
    )
    const pdfFile = new File([pdfContent], 'test-referral.pdf', { type: 'application/pdf' })
    const formData = new FormData()
    formData.append('file', pdfFile)

    const request = createMockFormDataRequest(pdfContent, 'test-referral.pdf')
    const response = await POST(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.data.patientId).toBeDefined()
    expect(data.data.referralId).toBeDefined()
    expect(data.data.admissionPacketId).toBeDefined()
    expect(data.data.extractedFields).toBeDefined()

    // Track for cleanup
    createdPatientIds.push(data.data.patientId)
    createdReferralIds.push(data.data.referralId)
    createdAdmissionIds.push(data.data.admissionPacketId)

    // Verify database records
    const patient = await prisma.patient.findUnique({
      where: { id: data.data.patientId },
    })
    expect(patient).toBeDefined()
    expect(patient?.mrn).toBeDefined()

    const referral = await prisma.referral.findUnique({
      where: { id: data.data.referralId },
    })
    expect(referral).toBeDefined()
    expect(referral?.patientId).toBe(data.data.patientId)

    const admission = await prisma.admissionPacket.findUnique({
      where: { id: data.data.admissionPacketId },
    })
    expect(admission).toBeDefined()
    expect(admission?.status).toBe('draft')
  })
})

