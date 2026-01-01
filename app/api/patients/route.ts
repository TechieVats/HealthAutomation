import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { PatientCreateSchema } from '@/app/lib/zod-schemas'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    
    return NextResponse.json({ success: true, data: patients })
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
    const validated = PatientCreateSchema.parse(body)

    const patient = await prisma.patient.create({
      data: {
        ...validated,
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : undefined,
      },
    })

    return NextResponse.json({ success: true, data: patient }, { status: 201 })
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

