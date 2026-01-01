import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockDocumensoClient } from '@hha-mvp/adapters'
import { generateSignedUrl } from '@/lib/security/signed-url'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get admission packet
    const admissionPacket = await prisma.admissionPacket.findUnique({
      where: { id },
    })

    if (!admissionPacket) {
      return NextResponse.json(
        { success: false, error: 'Admission packet not found' },
        { status: 404 }
      )
    }

    // Generate signed URL for secure download (10 min expiry)
    let pdfPath: string | null = null

    if (admissionPacket.signedPdfPath) {
      const fs = require('fs')
      if (fs.existsSync(admissionPacket.signedPdfPath)) {
        pdfPath = admissionPacket.signedPdfPath
      }
    }

    // If no signed PDF, try to get from envelope
    if (!pdfPath) {
      const dataJson = admissionPacket.dataJson as Record<string, unknown>
      const envelopeId = dataJson.envelopeId as string | undefined

      if (envelopeId) {
        const pdfBuffer = await mockDocumensoClient.downloadPdf(envelopeId)
        // Save temporarily (in production, use proper storage)
        const fs = require('fs')
        const path = require('path')
        const tempPath = path.join(process.cwd(), 'var', 'data', 'esign', `temp-${id}.pdf`)
        const dir = path.dirname(tempPath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(tempPath, pdfBuffer)
        pdfPath = tempPath
      }
    }

    if (!pdfPath) {
      return NextResponse.json(
        { success: false, error: 'No PDF available' },
        { status: 404 }
      )
    }

    // Return signed URL instead of direct file
    const signedUrl = generateSignedUrl({
      path: pdfPath,
      expiryMinutes: 10,
      metadata: {
        admissionId: id,
        type: 'admission_pdf',
      },
    })

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn: '10 minutes',
    })
  } catch (error) {
    console.error('Download PDF error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

