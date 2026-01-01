import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { saveFile, generateSignedUrl } from '@/app/lib/storage'
import { DocumentCreateSchema } from '@/app/lib/zod-schemas'

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get('patientId')
    
    const where = patientId ? { patientId } : {}
    
    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            syntheticId: true,
          },
        },
      },
    })

    // Generate signed URLs for file access
    const documentsWithUrls = documents.map(doc => ({
      ...doc,
      signedUrl: generateSignedUrl(doc.filePath),
    }))

    return NextResponse.json({ success: true, data: documentsWithUrls })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const patientId = formData.get('patientId') as string

    if (!file || !patientId) {
      return NextResponse.json(
        { success: false, error: 'Missing file or patientId' },
        { status: 400 }
      )
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    })

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Save file
    const uploadedFile = await saveFile(file)

    // Create document record
    const document = await prisma.document.create({
      data: {
        patientId,
        fileName: uploadedFile.fileName,
        filePath: uploadedFile.filePath,
        fileType: path.extname(uploadedFile.fileName).slice(1),
        fileSize: uploadedFile.fileSize,
        mimeType: uploadedFile.mimeType,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          ...document,
          signedUrl: generateSignedUrl(document.filePath),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import * as path from 'path'

