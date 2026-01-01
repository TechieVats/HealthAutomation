import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { CarePlanCreateSchema } from '@/app/lib/zod-schemas'
import { ehrAdapter } from '@/app/lib/adapters/ehr-adapter'

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get('patientId')
    const status = request.nextUrl.searchParams.get('status')
    
    const where: any = {}
    if (patientId) where.patientId = patientId
    if (status) where.status = status
    
    const carePlans = await prisma.carePlan.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            syntheticId: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: carePlans })
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
    const validated = CarePlanCreateSchema.parse(body)

    const carePlan = await prisma.carePlan.create({
      data: {
        ...validated,
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
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

    // Optionally sync to EHR
    if (process.env.AUTO_SYNC_EHR === 'true') {
      const syncResult = await ehrAdapter.syncCarePlan(carePlan.id, carePlan)
      
      if (syncResult.success && syncResult.ehrId) {
        await prisma.carePlan.update({
          where: { id: carePlan.id },
          data: {
            ehrSynced: true,
            ehrId: syncResult.ehrId,
          },
        })
      }
    }

    return NextResponse.json({ success: true, data: carePlan }, { status: 201 })
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

