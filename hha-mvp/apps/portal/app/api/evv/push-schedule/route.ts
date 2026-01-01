import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockEvvClient } from '@hha-mvp/adapters'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitId } = body

    if (!visitId) {
      return NextResponse.json(
        { success: false, error: 'Missing visitId' },
        { status: 400 }
      )
    }

    // Get visit
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        patient: true,
      },
    })

    if (!visit) {
      return NextResponse.json(
        { success: false, error: 'Visit not found' },
        { status: 404 }
      )
    }

    // Push to EVV
    await mockEvvClient.pushSchedule({
      id: visit.id,
      patientId: visit.patientId,
      startPlanned: visit.startPlanned,
      endPlanned: visit.endPlanned,
    })

    // Update visit status to indicate it's been pushed
    await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'scheduled', // Keep as scheduled, but now it's in EVV system
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule pushed to EVV successfully',
    })
  } catch (error) {
    console.error('Push schedule error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

