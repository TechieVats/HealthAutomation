import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockDocumensoClient } from '@hha-mvp/adapters'
import * as fs from 'fs'
import * as path from 'path'

const ESIGN_DIR = process.env.ESIGN_DIR || path.join(process.cwd(), 'var', 'data', 'esign')

// Ensure directory exists
if (!fs.existsSync(ESIGN_DIR)) {
  fs.mkdirSync(ESIGN_DIR, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    
    // Extract envelope ID from webhook payload
    const envelopeId = body.envelopeId || body.data?.envelopeId

    if (!envelopeId) {
      return NextResponse.json(
        { success: false, error: 'Missing envelopeId' },
        { status: 400 }
      )
    }

    // Find admission packet with this envelope ID
    const admissionPackets = await prisma.admissionPacket.findMany({
      where: {
        status: 'pending_signature',
      },
    })

    let admissionPacket = null
    for (const packet of admissionPackets) {
      const dataJson = packet.dataJson as Record<string, unknown>
      if (dataJson.envelopeId === envelopeId) {
        admissionPacket = packet
        break
      }
    }

    if (!admissionPacket) {
      return NextResponse.json(
        { success: false, error: 'Admission packet not found for envelope' },
        { status: 404 }
      )
    }

    // Mark envelope as completed in mock
    mockDocumensoClient.markCompleted(envelopeId)

    // Download signed PDF
    const pdfBuffer = await mockDocumensoClient.downloadPdf(envelopeId)

    // Save PDF
    const pdfFileName = `admission-${admissionPacket.id}-${Date.now()}.pdf`
    const pdfPath = path.join(ESIGN_DIR, pdfFileName)
    fs.writeFileSync(pdfPath, pdfBuffer)

    // Update admission packet
    await prisma.admissionPacket.update({
      where: { id: admissionPacket.id },
      data: {
        status: 'signed',
        signedPdfPath: pdfPath,
        dataJson: {
          ...(admissionPacket.dataJson as Record<string, unknown>),
          completedAt: new Date().toISOString(),
        },
      },
    })

    console.log(`[Webhook] Marked admission ${admissionPacket.id} as signed`)

    return NextResponse.json({
      success: true,
      data: {
        admissionPacketId: admissionPacket.id,
        envelopeId,
        signedPdfPath: pdfPath,
      },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

