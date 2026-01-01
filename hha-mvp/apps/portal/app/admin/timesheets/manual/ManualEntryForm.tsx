'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
  id: string
  name: string
  role: string
}

interface ManualEntryFormProps {
  employees: Employee[]
}

export default function ManualEntryForm({ employees }: ManualEntryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    minutes: '',
    type: 'admin' as 'visit' | 'travel' | 'admin',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/timesheets/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          minutes: parseInt(formData.minutes, 10),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Manual entry created successfully!')
        // Reset form
        setFormData({
          employeeId: '',
          date: new Date().toISOString().split('T')[0],
          minutes: '',
          type: 'admin',
        })
        setTimeout(() => {
          router.push('/admin/timesheets')
        }, 1500)
      } else {
        setError(result.error || 'Failed to create entry')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Employee
        </label>
        <select
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          required
          className="input-modern"
        >
          <option value="">Select employee...</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.role})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="input-modern"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Minutes
        </label>
        <input
          type="number"
          value={formData.minutes}
          onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
          required
          min="1"
          placeholder="Enter minutes worked"
          className="input-modern"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'visit' | 'travel' | 'admin' })}
          required
          className="input-modern"
        >
          <option value="visit">Visit</option>
          <option value="travel">Travel</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            'Create Entry'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg">
          <div className="flex items-center">
            <span className="text-emerald-500 mr-2">✅</span>
            <p className="text-emerald-700 font-medium">{message}</p>
          </div>
        </div>
      )}
    </form>
  )
}

