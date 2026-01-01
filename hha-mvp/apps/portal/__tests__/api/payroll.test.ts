import { describe, it, expect, beforeAll } from 'vitest'
import { GET } from '@/app/api/payroll/export/route'
import { createMockRequest, getJsonResponse } from './test-utils'

describe('API: /api/payroll/export', () => {
  it('should reject request without week parameter', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/payroll/export',
    })
    const response = await GET(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('week parameter')
  })

  it('should reject invalid date format', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/payroll/export',
      searchParams: { week: 'invalid-date' },
    })
    const response = await GET(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('date format')
  })

  it('should return CSV file with valid week parameter', async () => {
    const weekStart = new Date('2024-01-01')
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/payroll/export',
      searchParams: { week: weekStart.toISOString().split('T')[0] },
    })
    const response = await GET(request)
    const csv = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/csv')
    expect(csv).toContain('employeeId')
    expect(csv).toContain('name')
    expect(csv).toContain('date')
    expect(csv).toContain('minutes')
    expect(csv).toContain('type')
    expect(csv).toContain('visitId')
  })
})

