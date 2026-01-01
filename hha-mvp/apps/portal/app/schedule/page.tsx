import PageHeader from '@/components/PageHeader'
import { mockSchedule } from '@/lib/fakeData'

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Schedule"
          description="View and manage visit schedule"
        />

        <div className="card-gradient overflow-hidden">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Caregiver</th>
                <th>Patient</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockSchedule.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="font-semibold text-gray-900">
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="text-gray-700">{item.time}</td>
                  <td className="font-medium text-gray-900">{item.caregiver}</td>
                  <td className="text-gray-900">{item.patient}</td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Completed' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : item.status === 'Scheduled'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

