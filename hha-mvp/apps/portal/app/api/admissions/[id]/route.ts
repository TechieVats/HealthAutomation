import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    return NextResponse.json({
      success: true,
      ...admissionPacket,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

