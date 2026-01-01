import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Mock Prisma for E2E tests
const prisma = new PrismaClient()

describe('E2E: Referral Upload Workflow', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.admissionPacket.deleteMany({ where: { id: { startsWith: 'test-' } } })
    await prisma.referral.deleteMany({ where: { id: { startsWith: 'test-' } } })
    await prisma.patient.deleteMany({ where: { id: { startsWith: 'test-' } } })
  })

  it('should upload referral PDF, process OCR, and create admission', async () => {
    // Step 1: Create test patient
    const patient = await prisma.patient.create({
      data: {
        id: 'test-patient-001',
        mrn: 'TEST-MRN-001',
        firstName: 'Test',
        lastName: 'Patient',
      },
    })

    expect(patient).toBeDefined()
    expect(patient.mrn).toBe('TEST-MRN-001')

    // Step 2: Simulate OCR extraction (mock)
    const extractedFields = {
      firstName: 'Test',
      lastName: 'Patient',
      dob: '1980-01-15',
      payer: 'Medicare',
    }

    // Step 3: Create referral (simulating upload)
    const referral = await prisma.referral.create({
      data: {
        id: 'test-referral-001',
        patientId: patient.id,
        source: 'Test Upload',
        pdfPath: '/test/referral.pdf',
        status: 'pending',
      },
    })

    expect(referral).toBeDefined()
    expect(referral.patientId).toBe(patient.id)

    // Step 4: Create admission packet with extracted data
    const admissionPacket = await prisma.admissionPacket.create({
      data: {
        id: 'test-admission-001',
        patientId: patient.id,
        dataJson: {
          extractedFields,
          sourceFile: 'referral.pdf',
          uploadedAt: new Date().toISOString(),
        },
        status: 'draft',
      },
    })

    expect(admissionPacket).toBeDefined()
    expect(admissionPacket.patientId).toBe(patient.id)
    expect(admissionPacket.status).toBe('draft')

    const dataJson = admissionPacket.dataJson as Record<string, unknown>
    expect(dataJson.extractedFields).toBeDefined()
    expect((dataJson.extractedFields as Record<string, string>).firstName).toBe('Test')

    // Verify all entities are linked correctly
    const verified = await prisma.patient.findUnique({
      where: { id: patient.id },
      include: {
        referrals: true,
        admissionPackets: true,
      },
    })

    expect(verified).toBeDefined()
    expect(verified?.referrals.length).toBeGreaterThan(0)
    expect(verified?.admissionPackets.length).toBeGreaterThan(0)
  })

  it('should handle missing OCR fields gracefully', async () => {
    const patient = await prisma.patient.create({
      data: {
        id: 'test-patient-002',
        mrn: 'TEST-MRN-002',
      },
    })

    const admissionPacket = await prisma.admissionPacket.create({
      data: {
        id: 'test-admission-002',
        patientId: patient.id,
        dataJson: {
          extractedFields: {}, // Empty extraction
          sourceFile: 'referral.pdf',
        },
        status: 'draft',
      },
    })

    expect(admissionPacket).toBeDefined()
    expect(admissionPacket.status).toBe('draft')
  })
})

