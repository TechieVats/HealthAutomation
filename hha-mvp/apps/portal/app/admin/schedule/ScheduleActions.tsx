'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Visit {
  id: string
  status: string
  startPlanned: Date
  patient: {
    id: string
    mrn: string
  }
}

interface ScheduleActionsProps {
  visit: Visit
}

export default function ScheduleActions({ visit }: ScheduleActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (action: string) => {
    setLoading(action)
    setMessage(null)
    setError(null)

    try {
      let endpoint = ''
      let method = 'POST'
      let body: Record<string, unknown> = { visitId: visit.id }

      switch (action) {
        case 'push':
          endpoint = '/api/evv/push-schedule'
          break
        case 'clock-in':
          endpoint = '/api/evv/record-event'
          body = {
            visitId: visit.id,
            kind: 'clock_in',
            timestamp: new Date().toISOString(),
            // Simulate location near patient (within geofence)
            lat: 40.7128 + (Math.random() - 0.5) * 0.001,
            lng: -74.0060 + (Math.random() - 0.5) * 0.001,
          }
          break
        case 'clock-out':
          endpoint = '/api/evv/record-event'
          body = {
            visitId: visit.id,
            kind: 'clock_out',
            timestamp: new Date().toISOString(),
            // Simulate location near patient (within geofence)
            lat: 40.7128 + (Math.random() - 0.5) * 0.001,
            lng: -74.0060 + (Math.random() - 0.5) * 0.001,
          }
          break
        case 'validate':
          endpoint = `/api/evv/validate?visitId=${visit.id}`
          method = 'GET'
          body = {}
          break
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message || 'Action completed successfully')
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        setError(result.error || 'Action failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {visit.status === 'scheduled' && (
          <button
            onClick={() => handleAction('push')}
            disabled={loading !== null}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading === 'push' ? 'Pushing...' : 'Push to EVV'}
          </button>
        )}

        <button
          onClick={() => handleAction('clock-in')}
          disabled={loading !== null}
          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading === 'clock-in' ? 'Recording...' : 'Simulate Clock In'}
        </button>

        <button
          onClick={() => handleAction('clock-out')}
          disabled={loading !== null}
          className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 disabled:bg-gray-400"
        >
          {loading === 'clock-out' ? 'Recording...' : 'Simulate Clock Out'}
        </button>

        <button
          onClick={() => handleAction('validate')}
          disabled={loading !== null}
          className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading === 'validate' ? 'Validating...' : 'Validate'}
        </button>
      </div>

      {message && (
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-700 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

