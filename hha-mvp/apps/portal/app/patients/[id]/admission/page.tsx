import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AdmissionActions from './AdmissionActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PatientAdmissionPage({ params }: PageProps) {
  const { id } = await params

  // Get patient and their admission packets (all statuses, most recent first)
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      admissionPackets: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!patient) {
    notFound()
  }

  const admissionPacket = patient.admissionPackets[0]

  if (!admissionPacket) {
    return (
      <main className="container mx-auto p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Admission Packet</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No admission packet found for patient {patient.mrn}
          </p>
        </div>
      </main>
    )
  }

  const dataJson = admissionPacket.dataJson as Record<string, unknown>
  const extractedFields = dataJson.extractedFields as Record<string, string> | undefined
  const envelopeId = dataJson.envelopeId as string | undefined

  return (
    <main className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Admission Packet</h1>
      <p className="text-gray-600 mb-6">
        Patient: {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Admission Details</h2>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Status:</span>{' '}
            <span className={`capitalize inline-block px-2 py-1 rounded text-sm font-semibold ${
              admissionPacket.status === 'signed' ? 'bg-green-100 text-green-800' :
              admissionPacket.status === 'pending_signature' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {admissionPacket.status.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="font-medium">Created:</span>{' '}
            {new Date(admissionPacket.createdAt).toLocaleString()}
          </div>
          {envelopeId && (
            <div>
              <span className="font-medium">Envelope ID:</span>{' '}
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{envelopeId}</code>
            </div>
          )}
          {admissionPacket.signedPdfPath && (
            <div>
              <span className="font-medium">Signed PDF:</span>{' '}
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{admissionPacket.signedPdfPath}</code>
            </div>
          )}
        </div>

        <div className="mt-6">
          <AdmissionActions 
            admissionId={admissionPacket.id}
            status={admissionPacket.status}
            envelopeId={envelopeId}
            signedPdfPath={admissionPacket.signedPdfPath}
            currentStatus={admissionPacket.status}
          />
        </div>
      </div>

      {extractedFields && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Extracted Data</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(extractedFields).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {value || '(not available)'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
        <pre className="bg-gray-50 p-4 rounded overflow-auto text-xs">
          {JSON.stringify(dataJson, null, 2)}
        </pre>
      </div>
    </main>
  )
}
