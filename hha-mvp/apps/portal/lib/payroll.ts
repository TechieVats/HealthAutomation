import { prisma } from './prisma'

export interface TimesheetRow {
  employeeId: string
  name: string
  date: string // YYYY-MM-DD
  minutes: number
  type: 'visit' | 'travel' | 'admin'
  visitId: string | null
}

/**
 * Build timesheet for a given week
 * Aggregates verified visits into timesheet rows
 */
export async function buildTimesheet(weekStart: Date): Promise<TimesheetRow[]> {
  // Calculate week end (7 days from start)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Get all completed (verified) visits in this week
  const visits = await prisma.visit.findMany({
    where: {
      status: 'completed',
      startPlanned: {
        gte: weekStart,
        lt: weekEnd,
      },
    },
    include: {
      patient: true,
      evvEvents: {
        orderBy: {
          timestamp: 'asc',
        },
      },
      timesheetRows: {
        include: {
          employee: true,
        },
      },
    },
  })

  const timesheetRows: TimesheetRow[] = []

  // Process each visit
  for (const visit of visits) {
    // Type for evvEvent
    type EvvEvent = typeof visit.evvEvents[0]
    
    // Get clock in and clock out events
    const clockIn = visit.evvEvents.find((e: EvvEvent) => e.kind === 'clock_in')
    const clockOut = visit.evvEvents.find((e: EvvEvent) => e.kind === 'clock_out')

    // Calculate minutes from events or use default
    let minutes = 60 // Default 1 hour if no events
    if (clockIn && clockOut) {
      minutes = Math.round(
        (clockOut.timestamp.getTime() - clockIn.timestamp.getTime()) / (1000 * 60)
      )
    } else if (visit.startPlanned && visit.endPlanned) {
      // Fallback to planned times
      minutes = Math.round(
        (visit.endPlanned.getTime() - visit.startPlanned.getTime()) / (1000 * 60)
      )
    }

    // Get existing timesheet rows for this visit or create default
    if (visit.timesheetRows.length > 0) {
      // Use existing rows
      for (const row of visit.timesheetRows) {
        timesheetRows.push({
          employeeId: row.employeeId,
          name: row.employee?.name || 'Unknown', // Use optional chaining since employee might not be loaded
          date: visit.startPlanned.toISOString().split('T')[0],
          minutes: row.minutes,
          type: row.type as 'visit' | 'travel' | 'admin',
          visitId: row.visitId || visit.id, // Use visit.id if visitId is null
        })
      }
    } else {
      // Create default visit row - use first employee as fallback
      // In production, this would match by caregiver name or visit assignment
      const employees = await prisma.employee.findMany({
        where: {
          role: {
            in: ['RN', 'LPN', 'CNA', 'PT'],
          },
        },
        take: 1,
      })

      if (employees.length > 0) {
        const employee = employees[0]
        timesheetRows.push({
          employeeId: employee.id,
          name: employee.name,
          date: visit.startPlanned.toISOString().split('T')[0],
          minutes,
          type: 'visit',
          visitId: visit.id,
        })
      }
    }
  }

  // Also get manual (non-visit) timesheet rows for this week
  // Manual entries have visitId as null (optional field)
  // In Prisma, to query for null, we need to use a different approach
  const allTimesheetRows = await prisma.timesheetRow.findMany({
    where: {
      createdAt: {
        gte: weekStart,
        lt: weekEnd,
      },
    },
    include: {
      employee: true,
    },
  })
  
  // Type for timesheet row with employee
  type TimesheetRowWithEmployee = typeof allTimesheetRows[0]
  
  // Filter for manual entries (visitId is null)
  const manualRows = allTimesheetRows.filter((row: TimesheetRowWithEmployee) => row.visitId === null)

  for (const row of manualRows) {
    // Extract date from createdAt (or use a separate date field if available)
    const rowDate = row.createdAt.toISOString().split('T')[0]
    timesheetRows.push({
      employeeId: row.employeeId,
      name: row.employee?.name || 'Unknown', // Use optional chaining and fallback
      date: rowDate,
      minutes: row.minutes,
      type: row.type as 'visit' | 'travel' | 'admin',
      visitId: row.visitId || null,
    })
  }

  // Sort by date, then by employee name
  timesheetRows.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date)
    }
    return a.name.localeCompare(b.name)
  })

  return timesheetRows
}

