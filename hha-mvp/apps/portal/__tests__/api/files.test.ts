import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/files/download/route'
import { createMockRequest, getJsonResponse } from './test-utils'
import { generateSignedUrl } from '@/lib/security/signed-url'
import * as fs from 'fs'
import * as path from 'path'

describe('API: /api/files/download', () => {
  it('should reject request without token', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/files/download',
    })
    const response = await GET(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toContain('token')
  })

  it('should reject invalid signed URL', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/files/download',
      searchParams: { token: 'invalid-token' },
    })
    const response = await GET(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('should reject request for non-existent file', async () => {
    const signedUrl = generateSignedUrl({
      path: '/non/existent/file.pdf',
      expiryMinutes: 10,
    })
    const url = new URL(signedUrl)
    const token = url.searchParams.get('token') || ''

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/files/download',
      searchParams: { token },
    })
    const response = await GET(request)
    const data = await getJsonResponse(response)

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toContain('not found')
  })

  it('should successfully download existing file', async () => {
    // Create a test file
    const testDir = path.join(process.cwd(), 'var', 'data', 'test')
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }
    const testFilePath = path.join(testDir, 'test-file.pdf')
    const testContent = Buffer.from('test pdf content')
    fs.writeFileSync(testFilePath, testContent)

    try {
      const signedUrl = generateSignedUrl({
        path: testFilePath,
        expiryMinutes: 10,
      })
      const url = new URL(signedUrl)
      const token = url.searchParams.get('token') || ''

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/files/download',
        searchParams: { token },
      })
      const response = await GET(request)
      const fileContent = await response.arrayBuffer()

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('application/pdf')
      expect(Buffer.from(fileContent).toString()).toBe(testContent.toString())
    } finally {
      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
    }
  })
})

