import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, caregiverName, startPlanned, endPlanned, status = 'scheduled' } = body

    if (!patientId || !startPlanned || !endPlanned) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: patientId, startPlanned, endPlanned' },
        { status: 400 }
      )
    }

    const visit = await prisma.visit.create({
      data: {
        patientId,
        caregiverName: caregiverName || null,
        startPlanned: new Date(startPlanned),
        endPlanned: new Date(endPlanned),
        status: status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
      },
      include: {
        patient: true,
      },
    })

    return NextResponse.json({
      success: true,
      visitId: visit.id,
      visit,
    })
  } catch (error) {
    console.error('Create visit error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const visits = await prisma.visit.findMany({
      include: {
        patient: true,
      },
      orderBy: {
        startPlanned: 'desc',
      },
      take: 100,
    })

    return NextResponse.json({
      success: true,
      visits,
    })
  } catch (error) {
    console.error('Get visits error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

