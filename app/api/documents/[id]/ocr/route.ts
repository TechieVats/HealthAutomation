import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { ocrAdapter } from '@/app/lib/adapters/ocr-adapter'
import { OCRProcessSchema } from '@/app/lib/zod-schemas'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }

    // Process OCR
    const ocrResult = await ocrAdapter.processDocument(document.filePath, {
      outputFormat: 'structured',
    })

    if (!ocrResult.success) {
      return NextResponse.json(
        { success: false, error: ocrResult.error },
        { status: 500 }
      )
    }

    // Update document with OCR data
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        ocrProcessed: true,
        ocrData: ocrResult.structuredData as any,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        document: updated,
        ocrResult: {
          text: ocrResult.text,
          structuredData: ocrResult.structuredData,
          confidence: ocrResult.confidence,
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

