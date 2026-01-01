import { NextRequest } from 'next/server'

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockRequest(
  options: {
    method?: string
    url?: string
    body?: any
    headers?: Record<string, string>
    searchParams?: Record<string, string>
    formData?: FormData
  } = {}
): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000',
    body,
    headers = {},
    searchParams = {},
    formData,
  } = options

  // Build URL with search params
  const urlObj = new URL(url)
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  const request = new NextRequest(urlObj.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  // Override formData if provided
  if (formData) {
    // @ts-expect-error - Override formData method for testing
    request.formData = async () => formData
  }

  return request
}

/**
 * Create a mock NextRequest with FormData for file uploads
 */
export function createMockFormDataRequest(file: File | Buffer, fileName: string = 'test.pdf'): NextRequest {
  const formData = new FormData()
  const blob = file instanceof Buffer ? new Blob([file], { type: 'application/pdf' }) : file
  formData.append('file', blob, fileName)

  return createMockRequest({
    method: 'POST',
    url: 'http://localhost:3000/api/referrals/upload',
    headers: {},
    formData,
  })
}

/**
 * Extract JSON response from NextResponse
 */
export async function getJsonResponse(response: Response): Promise<any> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Create a mock params object for dynamic routes
 */
export function createMockParams(params: Record<string, string>): Promise<Record<string, string>> {
  return Promise.resolve(params)
}

