'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdmissionActionsProps {
  admissionId: string
  status: string
  currentStatus?: string
  envelopeId?: string
  signedPdfPath?: string | null
}

export default function AdmissionActions({
  admissionId,
  status,
  currentStatus,
  envelopeId,
  signedPdfPath,
}: AdmissionActionsProps) {
  const effectiveStatus = currentStatus || status
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSendForSignature = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`/api/admissions/${admissionId}/send-for-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: 'patient@example.com',
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Admission packet sent for signature!')
        // Refresh page after a delay
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || 'Failed to send for signature')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send for signature')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshStatus = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      // Simulate checking status via webhook
      if (envelopeId) {
        // For mock: trigger webhook to complete if pending
        if (effectiveStatus === 'pending_signature' || effectiveStatus === 'sent') {
          const response = await fetch('/api/webhooks/esign', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              envelopeId,
            }),
          })

          const result = await response.json()
          if (result.success) {
            setMessage('Status updated! Signature completed.')
            setTimeout(() => {
              router.refresh()
            }, 1500)
          } else {
            setError('Failed to refresh status')
          }
        } else {
          setMessage('Status is up to date.')
        }
      } else {
        setMessage('No envelope ID found.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh status')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get signed URL from API
      const response = await fetch(`/api/admissions/${admissionId}/download-pdf`)
      const result = await response.json()

      if (result.success && result.signedUrl) {
        // Use signed URL for download
        window.location.href = result.signedUrl
        setMessage('PDF download initiated!')
      } else {
        setError(result.error || 'Failed to get download URL')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-4 flex-wrap">
        {effectiveStatus === 'draft' && (
          <button
            onClick={handleSendForSignature}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send for Signature'}
          </button>
        )}

        {(effectiveStatus === 'pending_signature' || effectiveStatus === 'sent') && (
          <button
            onClick={handleRefreshStatus}
            disabled={loading}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh Status'}
          </button>
        )}

        {effectiveStatus === 'signed' && signedPdfPath && (
          <button
            onClick={handleDownloadPdf}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Downloading...' : 'Download Signed PDF'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {message}
        </div>
      )}
    </div>
  )
}

