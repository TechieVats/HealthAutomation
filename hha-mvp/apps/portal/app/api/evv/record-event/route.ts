import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockEvvClient } from '@hha-mvp/adapters'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitId, kind, timestamp, lat, lng } = body

    if (!visitId || !kind || !timestamp || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (kind !== 'clock_in' && kind !== 'clock_out') {
      return NextResponse.json(
        { success: false, error: 'Invalid event kind' },
        { status: 400 }
      )
    }

    // Record event in EVV
    await mockEvvClient.recordEvent({
      visitId,
      kind,
      timestamp: new Date(timestamp),
      lat: Number(lat),
      lng: Number(lng),
    })

    // Persist EvvEvent to database
    await prisma.evvEvent.create({
      data: {
        visitId,
        kind,
        timestamp: new Date(timestamp),
        lat: Number(lat),
        lng: Number(lng),
      },
    })

    // Update visit status
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
    })

    if (visit) {
      // Update status: clock_in → "in_progress" (Recorded), clock_out → keep as is (will be Verified after validation)
      if (kind === 'clock_in') {
        await prisma.visit.update({
          where: { id: visitId },
          data: { status: 'in_progress' }, // This represents "Recorded"
        })
      }
      // Note: Status becomes "completed" (Verified) only after validation
    }

    return NextResponse.json({
      success: true,
      message: `${kind === 'clock_in' ? 'Clock-in' : 'Clock-out'} event recorded`,
    })
  } catch (error) {
    console.error('Record event error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

