import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { VisitCreateSchema } from '@/app/lib/zod-schemas'
import { evvAdapter } from '@/app/lib/adapters/evv-adapter'

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get('patientId')
    
    const where = patientId ? { patientId } : {}
    
    const visits = await prisma.visit.findMany({
      where,
      orderBy: { visitDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            syntheticId: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: visits })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = VisitCreateSchema.parse(body)

    const visit = await prisma.visit.create({
      data: {
        ...validated,
        visitDate: new Date(validated.visitDate),
      },
      include: {
        patient: {
          select: {
            id: true,
            syntheticId: true,
          },
        },
      },
    })

    // Optionally verify with EVV
    const evvResult = await evvAdapter.verifyVisit(visit.id, {
      visitId: visit.id,
      visitDate: visit.visitDate,
      visitType: visit.visitType,
    })

    if (evvResult.success && evvResult.verified) {
      await prisma.visit.update({
        where: { id: visit.id },
        data: {
          evvVerified: true,
          evvData: evvResult.evvData as any,
        },
      })
    }

    return NextResponse.json({ success: true, data: visit }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

