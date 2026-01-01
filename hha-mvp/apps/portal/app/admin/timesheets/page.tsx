import { buildTimesheet } from '@/lib/payroll'
import TimesheetPreview from './TimesheetPreview'

// Force dynamic rendering - this page queries the database
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ week?: string }>
}

export default async function AdminTimesheetsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const weekParam = params.week

  // Default to current week (Monday of current week)
  let weekStart = new Date()
  if (weekParam) {
    weekStart = new Date(weekParam)
  } else {
    // Get Monday of current week
    const day = weekStart.getDay()
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    weekStart = new Date(weekStart.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)
  }

  // Format for input field
  const weekString = weekStart.toISOString().split('T')[0]

  // Build timesheet for the week
  const rows = await buildTimesheet(weekStart)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              Timesheet Management
            </h1>
            <p className="text-gray-600">View and manage employee timesheets</p>
          </div>
          <a
            href="/admin/timesheets/manual"
            className="btn-success flex items-center space-x-2"
          >
            <span>+</span>
            <span>Manual Entry</span>
          </a>
        </div>

        {/* Timesheet Preview Card */}
        <div className="card-gradient p-8">
          <TimesheetPreview weekStart={weekString} initialRows={rows} />
        </div>
      </div>
    </main>
  )
}

