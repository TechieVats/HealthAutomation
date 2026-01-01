import * as fs from 'fs'
import * as path from 'path'
import { randomBytes } from 'crypto'
import { sign } from 'jsonwebtoken'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret-change-in-production'

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export interface UploadedFile {
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
}

/**
 * Save uploaded file to local filesystem
 * In production, this would use cloud storage (S3, etc.)
 */
export async function saveFile(file: File): Promise<UploadedFile> {
  const fileExtension = path.extname(file.name)
  const fileName = `${randomBytes(16).toString('hex')}${fileExtension}`
  const filePath = path.join(UPLOAD_DIR, fileName)

  const buffer = Buffer.from(await file.arrayBuffer())
  
  fs.writeFileSync(filePath, buffer)

  return {
    fileName: file.name,
    filePath: filePath,
    fileSize: buffer.length,
    mimeType: file.type,
  }
}

/**
 * Generate a signed URL for secure file access
 * Valid for specified duration (default 1 hour)
 */
export function generateSignedUrl(filePath: string, expiresIn: number = 3600): string {
  const relativePath = path.relative(UPLOAD_DIR, filePath)
  
  const token = sign(
    {
      filePath: relativePath,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    },
    JWT_SECRET
  )

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${baseUrl}/api/files/${relativePath}?token=${token}`
}

/**
 * Verify signed URL token
 */
export function verifySignedUrl(token: string): { valid: boolean; filePath?: string } {
  try {
    const { verify } = require('jsonwebtoken')
    const decoded = verify(token, JWT_SECRET) as { filePath: string; exp: number }
    
    if (decoded.exp * 1000 < Date.now()) {
      return { valid: false }
    }

    return {
      valid: true,
      filePath: path.join(UPLOAD_DIR, decoded.filePath),
    }
  } catch {
    return { valid: false }
  }
}

/**
 * Read file from filesystem
 */
export function readFile(filePath: string): Buffer {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  return fs.readFileSync(filePath)
}

