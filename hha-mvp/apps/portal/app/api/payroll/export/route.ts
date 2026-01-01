import { NextRequest, NextResponse } from 'next/server'
import { buildTimesheet } from '@/lib/payroll'

export async function GET(request: NextRequest) {
  try {
    const weekParam = request.nextUrl.searchParams.get('week')
    
    if (!weekParam) {
      return NextResponse.json(
        { success: false, error: 'Missing week parameter (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    // Parse week start date
    const weekStart = new Date(weekParam)
    if (isNaN(weekStart.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Build timesheet
    const rows = await buildTimesheet(weekStart)

    // Generate CSV
    const headers = ['employeeId', 'name', 'date', 'minutes', 'type', 'visitId']
    const csvRows = [
      headers.join(','),
      ...rows.map((row) => [
        row.employeeId,
        `"${row.name}"`,
        row.date,
        row.minutes,
        row.type,
        row.visitId || '',
      ].join(',')),
    ]

    const csv = csvRows.join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="timesheet-${weekParam}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

