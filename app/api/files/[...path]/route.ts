import { NextRequest, NextResponse } from 'next/server'
import { verifySignedUrl, readFile } from '@/app/lib/storage'
import * as path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const token = request.nextUrl.searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing token' },
        { status: 401 }
      )
    }

    const verification = verifySignedUrl(token)
    
    if (!verification.valid || !verification.filePath) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Read file
    const fileBuffer = readFile(verification.filePath)
    const fileName = path.basename(verification.filePath)
    const ext = path.extname(fileName).slice(1).toLowerCase()
    
    // Determine content type
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      txt: 'text/plain',
    }
    
    const contentType = contentTypes[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

