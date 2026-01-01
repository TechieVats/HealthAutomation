import PageHeader from '@/components/PageHeader'
import { mockPatients } from '@/lib/fakeData'
import Link from 'next/link'

export default function PatientsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Patients"
          description="View and manage patient records"
        />

        <div className="card-gradient overflow-hidden">
          <table className="table-modern">
            <thead>
              <tr>
                <th>MRN</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Payer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100">
                  <td className="font-mono text-sm font-semibold text-gray-900">{patient.mrn}</td>
                  <td className="font-semibold text-gray-900">{patient.name}</td>
                  <td className="text-gray-700">{new Date(patient.dob).toLocaleDateString()}</td>
                  <td>
                    <span className="badge bg-indigo-100 text-indigo-800 border-indigo-200">
                      {patient.payer}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      patient.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/patients/${patient.id}/admission`}
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                    >
                      View →
                    </Link>
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
