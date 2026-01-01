import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockDocumensoClient } from '@hha-mvp/adapters'
import { buildAdmissionHtml } from '@/lib/templates/admission'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get admission packet
    const admissionPacket = await prisma.admissionPacket.findUnique({
      where: { id },
      include: {
        patient: true,
      },
    })

    if (!admissionPacket) {
      return NextResponse.json(
        { success: false, error: 'Admission packet not found' },
        { status: 404 }
      )
    }

    if (admissionPacket.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Admission packet is not in draft status' },
        { status: 400 }
      )
    }

    // Build HTML document
    const dataJson = admissionPacket.dataJson as Record<string, unknown>
    const extractedFields = dataJson.extractedFields as Record<string, string> | undefined

    const htmlDoc = buildAdmissionHtml({
      patientFirstName: admissionPacket.patient.firstName || undefined,
      patientLastName: admissionPacket.patient.lastName || undefined,
      mrn: admissionPacket.patient.mrn,
      dob: admissionPacket.patient.dob?.toISOString().split('T')[0],
      payer: admissionPacket.patient.payer || undefined,
      extractedFields,
    })

    // Get recipient email (from request body or use default)
    const body = await request.json().catch(() => ({}))
    const recipientEmail = body.recipientEmail || 'patient@example.com'

    // Create envelope
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/esign`
    
    const { envelopeId } = await mockDocumensoClient.createEnvelope({
      subject: `Admission Packet for ${admissionPacket.patient.mrn}`,
      recipients: [recipientEmail],
      htmlDoc,
      callbackUrl,
    })

    // Update admission packet
    await prisma.admissionPacket.update({
      where: { id },
      data: {
        status: 'pending_signature',
        dataJson: {
          ...dataJson,
          envelopeId,
          sentAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        envelopeId,
        status: 'pending_signature',
      },
    })
  } catch (error) {
    console.error('Send for signature error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

