import { prisma } from '@/lib/prisma'
import ManualEntryForm from './ManualEntryForm'

export default async function ManualTimesheetPage() {
  const employees = await prisma.employee.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            Manual Timesheet Entry
          </h1>
          <p className="text-gray-600">Add manual timesheet entries for employees</p>
        </div>

        <div className="card-gradient p-8">
          <ManualEntryForm employees={employees} />
        </div>
      </div>
    </main>
  )
}

