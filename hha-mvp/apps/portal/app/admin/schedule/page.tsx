import { prisma } from '@/lib/prisma'
import ScheduleActions from './ScheduleActions'
import type { Prisma } from '@prisma/client'

type VisitWithRelations = Prisma.VisitGetPayload<{
  include: {
    patient: {
      select: {
        id: true
        mrn: true
        firstName: true
        lastName: true
      }
    }
    evvEvents: true
  }
}>

export default async function AdminSchedulePage() {
  // Get all scheduled and in-progress visits
  const visits = await prisma.visit.findMany({
    where: {
      status: {
        in: ['scheduled', 'in_progress'],
      },
    },
    include: {
      patient: {
        select: {
          id: true,
          mrn: true,
          firstName: true,
          lastName: true,
        },
      },
      evvEvents: {
        orderBy: {
          timestamp: 'asc',
        },
      },
    },
    orderBy: {
      startPlanned: 'asc',
    },
  })

  return (
    <main className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Schedule Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EVV Events
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visits.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No scheduled visits found
                </td>
              </tr>
            ) : (
              visits.map((visit: VisitWithRelations) => (
                <tr key={visit.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {visit.patient.firstName} {visit.patient.lastName}
                    </div>
                    <div className="text-sm text-gray-500">MRN: {visit.patient.mrn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(visit.startPlanned).toLocaleString()}
                    </div>
                    {visit.endPlanned && (
                      <div className="text-sm text-gray-500">
                        End: {new Date(visit.endPlanned).toLocaleTimeString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                      visit.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {visit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {visit.evvEvents.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {visit.evvEvents.map((event: { id: string; kind: string; timestamp: Date }) => (
                            <li key={event.id}>
                              {event.kind} at {new Date(event.timestamp).toLocaleTimeString()}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">No events</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ScheduleActions visit={visit} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

