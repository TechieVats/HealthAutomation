import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockEvvClient } from '@hha-mvp/adapters'

export async function GET(request: NextRequest) {
  try {
    const visitId = request.nextUrl.searchParams.get('visitId')

    if (!visitId) {
      return NextResponse.json(
        { success: false, error: 'Missing visitId' },
        { status: 400 }
      )
    }

    // Get visit with events
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        evvEvents: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    if (!visit) {
      return NextResponse.json(
        { success: false, error: 'Visit not found' },
        { status: 404 }
      )
    }

    // Ensure visit is in EVV system
    await mockEvvClient.pushSchedule({
      id: visit.id,
      patientId: visit.patientId,
      startPlanned: visit.startPlanned,
      endPlanned: visit.endPlanned,
    })

    // Sync events to EVV
    for (const event of visit.evvEvents) {
      await mockEvvClient.recordEvent({
        visitId: event.visitId,
        kind: event.kind as 'clock_in' | 'clock_out',
        timestamp: event.timestamp,
        lat: event.lat,
        lng: event.lng,
      })
    }

    // Validate
    const validation = await mockEvvClient.validate(visitId)

    // Update visit status if verified
    if (validation.verified && visit.status !== 'completed') {
      await prisma.visit.update({
        where: { id: visitId },
        data: { status: 'completed' },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: validation.verified,
        reasons: validation.reasons,
        status: validation.verified ? 'Verified' : 'Not Verified',
      },
      message: validation.verified
        ? 'Visit verified successfully'
        : 'Visit validation failed',
    })
  } catch (error) {
    console.error('Validate error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

