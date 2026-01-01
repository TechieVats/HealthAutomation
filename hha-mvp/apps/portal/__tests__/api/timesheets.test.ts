import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { POST } from '@/app/api/timesheets/manual/route'
import { createMockRequest, getJsonResponse } from './test-utils'
import { prisma } from '@/lib/prisma'
import { factoryEmployee } from '@hha-mvp/domain'

describe('API: /api/timesheets/manual', () => {
  let testEmployeeId: string
  let createdTimesheetIds: string[] = []

  beforeAll(async () => {
    // Create test employee
    const employeeData = factoryEmployee()
    const employee = await prisma.employee.create({
      data: {
        name: employeeData.name,
        role: employeeData.role,
        licenseNo: employeeData.licenseNo,
        licenseExpiry: employeeData.licenseExpiry ? new Date(employeeData.licenseExpiry) : null,
      },
    })
    testEmployeeId = employee.id
  })

  afterAll(async () => {
    // Cleanup
    for (const id of createdTimesheetIds) {
      await prisma.timesheetRow.delete({ where: { id } }).catch(() => {})
    }
    await prisma.employee.delete({ where: { id: testEmployeeId } }).catch(() => {})
  })

  it('should reject request with missing required fields', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/timesheets/manual',
      body: {
        employeeId: testEmployeeId,
      },
    })
    const response = await POST(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('required fields')
  })

  it('should reject request with non-existent employee', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/timesheets/manual',
      body: {
        employeeId: 'non-existent-id',
        date: new Date().toISOString(),
        minutes: 60,
        type: 'admin',
      },
    })
    const response = await POST(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Employee not found')
  })

  it('should successfully create manual timesheet entry', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/timesheets/manual',
      body: {
        employeeId: testEmployeeId,
        date: new Date().toISOString(),
        minutes: 120,
        type: 'admin',
      },
    })
    const response = await POST(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.data.employeeId).toBe(testEmployeeId)
    expect(data.data.minutes).toBe(120)
    expect(data.data.type).toBe('admin')
    expect(data.data.visitId).toBeNull() // Manual entries have no visitId

    createdTimesheetIds.push(data.data.id)
  })
})

