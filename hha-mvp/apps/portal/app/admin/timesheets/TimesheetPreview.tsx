'use client'

import { useState } from 'react'
import type { TimesheetRow } from '@/lib/payroll'

interface TimesheetPreviewProps {
  weekStart: string
  initialRows: TimesheetRow[]
}

export default function TimesheetPreview({ weekStart, initialRows }: TimesheetPreviewProps) {
  const [week, setWeek] = useState(weekStart)
  const [rows, setRows] = useState(initialRows)
  const [loading, setLoading] = useState(false)

  const handleWeekChange = async (newWeek: string) => {
    setWeek(newWeek)
    setLoading(true)

    try {
      // Fetch timesheet data from API (we'll use the export endpoint and parse, or create a preview endpoint)
      // For now, reload the page with new week parameter
      window.location.href = `/admin/timesheets?week=${newWeek}`
    } catch (err) {
      console.error('Failed to load timesheet:', err)
      setLoading(false)
    }
  }

  const handleExport = () => {
    const url = `/api/payroll/export?week=${week}`
    window.location.href = url
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 items-end mb-8">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Week Start (Monday)
          </label>
          <input
            type="date"
            value={week}
            onChange={(e) => handleWeekChange(e.target.value)}
            className="input-modern"
          />
        </div>

        <button
          onClick={handleExport}
          disabled={loading || rows.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            <span className="flex items-center">
              📥 Export CSV
            </span>
          )}
        </button>

        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-sm font-semibold text-gray-700">
            {rows.length} <span className="text-gray-500 font-normal">row{rows.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading timesheet data...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No timesheet data</h3>
          <p className="text-gray-600 mb-6">
            No timesheet data for this week. Verify some visits or add manual entries.
          </p>
          <a
            href="/admin/timesheets/manual"
            className="btn-success inline-flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Manual Entry</span>
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Minutes</th>
                <th>Type</th>
                <th>Visit ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="font-semibold text-gray-900">{row.name}</td>
                  <td className="text-gray-700">{row.date}</td>
                  <td className="font-medium text-gray-900">{row.minutes} min</td>
                  <td>
                    <span className={`badge ${
                      row.type === 'visit' ? 'badge-visit' :
                      row.type === 'travel' ? 'badge-travel' :
                      'badge-admin'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {row.visitId ? (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{row.visitId.substring(0, 8)}...</code>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-600 border-gray-200">Manual</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

