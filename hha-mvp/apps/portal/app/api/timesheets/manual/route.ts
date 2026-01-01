import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, date, minutes, type } = body

    if (!employeeId || !date || !minutes || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Create manual timesheet row (no visitId)
    const timesheetRow = await prisma.timesheetRow.create({
      data: {
        employeeId,
        visitId: null, // Manual entry
        minutes: parseInt(minutes, 10),
        type,
        createdAt: new Date(date), // Use date as createdAt for sorting
      },
      include: {
        employee: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: timesheetRow,
      message: 'Manual entry created successfully',
    })
  } catch (error) {
    console.error('Manual entry error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

