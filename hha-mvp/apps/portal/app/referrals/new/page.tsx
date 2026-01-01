'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'

export default function NewReferralPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extractedFields, setExtractedFields] = useState<Record<string, string> | null>(null)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [referralId, setReferralId] = useState<string | null>(null)
  const [admissionId, setAdmissionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setExtractedFields(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/referrals/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setExtractedFields(result.data.extractedFields || {})
        setPatientId(result.data.patientId)
        setReferralId(result.data.referralId)
        setAdmissionId(result.data.admissionPacketId)
        setSuccess(true)
        setError(null)
      } else {
        setError(result.error || 'Upload failed')
        setSuccess(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateAdmission = () => {
    if (patientId) {
      router.push(`/patients/${patientId}/admission`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <PageHeader
          title="New Referral"
          description="Upload a referral PDF to extract patient information and create an admission packet."
        />

        <div className="card-gradient p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3 text-3xl">📄</span>
            Upload Referral PDF
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select PDF File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 file:text-white hover:file:from-blue-600 hover:file:to-indigo-700 file:cursor-pointer file:shadow-md file:hover:shadow-lg file:transition-all"
                disabled={uploading}
              />
            </div>
            {file && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  📎 Selected: <span className="font-semibold">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">🚀</span>
                Upload & Extract
              </span>
            )}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2 text-xl">⚠️</span>
                <div>
                  <strong className="text-red-700">Error:</strong>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success && !error && (
            <div className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg">
              <div className="flex items-center">
                <span className="text-emerald-500 mr-2 text-xl">✅</span>
                <div>
                  <strong className="text-emerald-700">Success!</strong>
                  <p className="text-emerald-600 mt-1">File uploaded and processed successfully.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {extractedFields && (
          <div className="card-gradient p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3 text-3xl">✨</span>
              Extracted Fields
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(extractedFields).map(([key, value]) => (
                <div key={key} className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="text-base font-medium text-gray-900">
                    {value || <span className="text-gray-400 italic">(not found)</span>}
                  </p>
                </div>
              ))}
            </div>

            {patientId && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCreateAdmission}
                  className="btn-success mb-4"
                >
                  <span className="flex items-center">
                    <span className="mr-2">📋</span>
                    View Admission Packet
                  </span>
                </button>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600"><strong className="text-gray-700">Patient ID:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{patientId}</code></p>
                  <p className="text-sm text-gray-600"><strong className="text-gray-700">Referral ID:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{referralId}</code></p>
                  {admissionId && <p className="text-sm text-gray-600"><strong className="text-gray-700">Admission ID:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{admissionId}</code></p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

