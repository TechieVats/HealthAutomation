#!/usr/bin/env node
/**
 * Demo script: End-to-end workflow automation
 * 
 * This script demonstrates the complete HHA MVP workflow:
 * 1. Upload referral PDF
 * 2. Process OCR and create admission
 * 3. Send for signature and complete
 * 4. Create visit and simulate EVV
 * 5. Validate visit
 * 6. Export payroll CSV
 */

import * as fs from 'fs'
import * as path from 'path'
import FormData from 'form-data'
import fetch from 'node-fetch'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const API_BASE = `${BASE_URL}/api`

interface DemoResult {
  patientId?: string
  referralId?: string
  admissionId?: string
  envelopeId?: string
  visitId?: string
  payrollCsvPath?: string
  signedPdfPath?: string
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function uploadReferralPdf(): Promise<{ patientId: string; referralId: string; admissionId: string }> {
  console.log('\n📄 Step 1: Upload Referral PDF')
  
  // Use existing fixture or create a simple synthetic PDF content
  const fixturesDir = path.join(process.cwd(), 'packages', 'testing', 'fixtures', 'referrals')
  const fixtureFile = path.join(fixturesDir, 'sample-referral-1.txt')
  
  let pdfPath: string
  if (fs.existsSync(fixtureFile)) {
    // Create a mock PDF file from the fixture
    pdfPath = path.join(process.cwd(), 'var', 'data', 'referrals', `demo-${Date.now()}.pdf`)
    const dir = path.dirname(pdfPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const content = fs.readFileSync(fixtureFile, 'utf-8')
    fs.writeFileSync(pdfPath, content)
  } else {
    // Create minimal synthetic referral
    pdfPath = path.join(process.cwd(), 'var', 'data', 'referrals', `demo-${Date.now()}.pdf`)
    const dir = path.dirname(pdfPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const syntheticContent = `
PATIENT REFERRAL FORM

Patient Name: John Demo
Date of Birth: 01/15/1980
Payer: Medicare

Referral Source: Hospital Demo Unit
Date: ${new Date().toISOString()}

This is a synthetic referral for demonstration purposes.
    `.trim()
    fs.writeFileSync(pdfPath, syntheticContent)
  }

  console.log(`  Created PDF: ${pdfPath}`)

  // Upload via API
  const formData = new FormData()
  formData.append('file', fs.createReadStream(pdfPath))

  const response = await fetch(`${API_BASE}/referrals/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Upload failed: ${error}`)
  }

  const result = await response.json() as { success: boolean; patientId?: string; referralId?: string; admissionId?: string; error?: string }
  
  if (!result.success || !result.patientId || !result.admissionId) {
    throw new Error('Upload succeeded but missing IDs')
  }

  console.log(`  ✅ Patient created: ${result.patientId}`)
  console.log(`  ✅ Referral created: ${result.referralId}`)
  console.log(`  ✅ Admission created: ${result.admissionId}`)

  return {
    patientId: result.patientId,
    referralId: result.referralId || '',
    admissionId: result.admissionId,
  }
}

async function sendForSignature(admissionId: string): Promise<{ envelopeId: string }> {
  console.log('\n✍️  Step 2: Send for Signature')

  const response = await fetch(`${API_BASE}/admissions/${admissionId}/send-for-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipientEmail: 'patient@demo.example.com',
      recipientName: 'Demo Patient',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Send for signature failed: ${error}`)
  }

  const result = await response.json() as { success: boolean; envelopeId?: string }
  
  if (!result.success || !result.envelopeId) {
    throw new Error('Send succeeded but missing envelope ID')
  }

  console.log(`  ✅ Envelope created: ${result.envelopeId}`)

  // Simulate webhook completion
  console.log('  📬 Simulating webhook completion...')
  await sleep(1000)

  const webhookResponse = await fetch(`${API_BASE}/webhooks/esign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      envelopeId: result.envelopeId,
      status: 'completed',
    }),
  })

  if (!webhookResponse.ok) {
    const error = await webhookResponse.text()
    throw new Error(`Webhook failed: ${error}`)
  }

  const webhookResult = await webhookResponse.json() as { success: boolean }
  
  if (!webhookResult.success) {
    throw new Error('Webhook processing failed')
  }

  console.log(`  ✅ Signature completed via webhook`)

  return { envelopeId: result.envelopeId }
}

async function createAndValidateVisit(patientId: string): Promise<{ visitId: string }> {
  console.log('\n🏥 Step 3: Create Visit and Simulate EVV')

  // Create visit
  const visitStart = new Date()
  visitStart.setHours(10, 0, 0, 0)
  const visitEnd = new Date(visitStart)
  visitEnd.setHours(visitStart.getHours() + 1)

  const createVisitResponse = await fetch(`${API_BASE}/visits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patientId,
      caregiverName: 'Demo Caregiver',
      startPlanned: visitStart.toISOString(),
      endPlanned: visitEnd.toISOString(),
      status: 'scheduled',
    }),
  })

  if (!createVisitResponse.ok) {
    const error = await createVisitResponse.text()
    throw new Error(`Create visit failed: ${error}`)
  }

  const visitResult = await createVisitResponse.json() as { success: boolean; visitId?: string }
  
  if (!visitResult.success || !visitResult.visitId) {
    throw new Error('Visit creation succeeded but missing visit ID')
  }

  const visitId = visitResult.visitId
  console.log(`  ✅ Visit created: ${visitId}`)

  // Push to EVV
  console.log('  📤 Pushing to EVV...')
  const pushResponse = await fetch(`${API_BASE}/evv/push-schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      visitId,
    }),
  })

  if (!pushResponse.ok) {
    const error = await pushResponse.text()
    throw new Error(`Push to EVV failed: ${error}`)
  }

  console.log(`  ✅ Schedule pushed to EVV`)

  // Simulate clock in
  console.log('  🕐 Simulating clock in...')
  const clockInResponse = await fetch(`${API_BASE}/evv/record-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      visitId,
      kind: 'clock_in',
      timestamp: visitStart.toISOString(),
      lat: 40.7128,
      lng: -74.0060,
    }),
  })

  if (!clockInResponse.ok) {
    const error = await clockInResponse.text()
    throw new Error(`Clock in failed: ${error}`)
  }

  console.log(`  ✅ Clock in recorded`)

  // Simulate clock out
  console.log('  🕐 Simulating clock out...')
  const clockOutResponse = await fetch(`${API_BASE}/evv/record-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      visitId,
      kind: 'clock_out',
      timestamp: visitEnd.toISOString(),
      lat: 40.7128,
      lng: -74.0060,
    }),
  })

  if (!clockOutResponse.ok) {
    const error = await clockOutResponse.text()
    throw new Error(`Clock out failed: ${error}`)
  }

  console.log(`  ✅ Clock out recorded`)

  // Validate visit
  console.log('  ✓ Validating visit...')
  const validateResponse = await fetch(`${API_BASE}/evv/validate?visitId=${visitId}`, {
    method: 'GET',
  })

  if (!validateResponse.ok) {
    const error = await validateResponse.text()
    throw new Error(`Validation failed: ${error}`)
  }

  const validateResult = await validateResponse.json() as { success: boolean; verified?: boolean }
  
  if (!validateResult.success) {
    throw new Error('Validation request failed')
  }

  console.log(`  ✅ Visit validated: ${validateResult.verified ? 'VERIFIED' : 'NOT VERIFIED'}`)

  return { visitId }
}

async function exportPayrollCsv(): Promise<string> {
  console.log('\n💰 Step 4: Export Payroll CSV')

  // Get current week start (Monday)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - daysToMonday)
  weekStart.setHours(0, 0, 0, 0)

  const weekStr = weekStart.toISOString().split('T')[0]

  const response = await fetch(`${API_BASE}/payroll/export?week=${weekStr}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Export failed: ${error}`)
  }

  const csv = await response.text()

  // Save CSV to file
  const csvPath = path.join(process.cwd(), 'var', 'data', 'payroll', `payroll-${weekStr}.csv`)
  const dir = path.dirname(csvPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(csvPath, csv)

  console.log(`  ✅ Payroll CSV exported: ${csvPath}`)
  console.log(`  📊 Rows: ${csv.split('\n').length - 1} (excluding header)`)

  return csvPath
}

async function main() {
  console.log('\n🚀 HHA MVP Demo Script')
  console.log('=' .repeat(50))

  const result: DemoResult = {}

  try {
    // Step 1: Upload referral
    const { patientId, referralId, admissionId } = await uploadReferralPdf()
    result.patientId = patientId
    result.referralId = referralId
    result.admissionId = admissionId

    // Step 2: Send for signature
    const { envelopeId } = await sendForSignature(admissionId)
    result.envelopeId = envelopeId

    // Step 3: Create visit and validate
    const { visitId } = await createAndValidateVisit(patientId)
    result.visitId = visitId

    // Step 4: Export payroll
    const csvPath = await exportPayrollCsv()
    result.payrollCsvPath = csvPath

    // Get signed PDF path
    const getAdmissionResponse = await fetch(`${API_BASE}/admissions/${admissionId}`)
    if (getAdmissionResponse.ok) {
      const admission = await getAdmissionResponse.json() as { signedPdfPath?: string }
      result.signedPdfPath = admission.signedPdfPath
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ Demo completed successfully!')
    console.log('\n📋 Generated Artifacts:')
    console.log(`  Patient ID: ${result.patientId}`)
    console.log(`  Referral ID: ${result.referralId}`)
    console.log(`  Admission ID: ${result.admissionId}`)
    console.log(`  Envelope ID: ${result.envelopeId}`)
    console.log(`  Visit ID: ${result.visitId}`)
    if (result.signedPdfPath) {
      console.log(`  Signed PDF: ${result.signedPdfPath}`)
    }
    console.log(`  Payroll CSV: ${result.payrollCsvPath}`)
    console.log('\n🌐 Portal URLs:')
    console.log(`  Portal: ${BASE_URL}`)
    console.log(`  Patient: ${BASE_URL}/patients/${result.patientId}`)
    console.log(`  Admission: ${BASE_URL}/patients/${result.patientId}/admission`)
    console.log(`  Admin Schedule: ${BASE_URL}/admin/schedule`)
    console.log(`  Admin Timesheets: ${BASE_URL}/admin/timesheets`)

  } catch (error) {
    console.error('\n❌ Demo failed:')
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()

