'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { mockEmployees } from '@/lib/fakeData'

export default function ManualEntryPage() {
  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    minutes: '',
    type: 'visit' as 'visit' | 'travel' | 'admin',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Manual Entry Submitted:', {
      ...formData,
      minutes: parseInt(formData.minutes, 10),
    })
    alert('Entry submitted! Check console for data.')
    
    // Reset form
    setFormData({
      employee: '',
      date: new Date().toISOString().split('T')[0],
      minutes: '',
      type: 'visit',
      notes: '',
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Manual Entry"
          description="Add manual timesheet entries"
        />

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select employee...</option>
                {mockEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minutes
              </label>
              <input
                type="number"
                value={formData.minutes}
                onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                required
                min="1"
                placeholder="Enter minutes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'visit' | 'travel' | 'admin' })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="visit">Visit</option>
                <option value="travel">Travel</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Submit Entry
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  employee: '',
                  date: new Date().toISOString().split('T')[0],
                  minutes: '',
                  type: 'visit',
                  notes: '',
                })}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

