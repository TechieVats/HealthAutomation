import { NextRequest, NextResponse } from 'next/server'
import { verifySignedUrl } from '@/lib/security/signed-url'
import * as fs from 'fs'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing token' },
        { status: 401 }
      )
    }

    // Verify signed URL
    const verification = verifySignedUrl(token)

    if (!verification.valid || !verification.path) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if file exists
    if (!fs.existsSync(verification.path)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = fs.readFileSync(verification.path)
    const fileName = verification.path.split('/').pop() || 'file.pdf'
    const ext = fileName.split('.').pop()?.toLowerCase() || ''

    // Determine content type
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    }

    const contentType = contentTypes[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

