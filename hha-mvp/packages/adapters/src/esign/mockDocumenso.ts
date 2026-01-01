import * as fs from 'fs'
import * as path from 'path'
import type { EsignClient } from './index'

// In-memory storage for mock state
const envelopeStore = new Map<string, {
  subject: string
  recipients: string[]
  htmlDoc: string
  callbackUrl: string
  status: 'draft' | 'sent' | 'completed'
  createdAt: Date
}>()

const ESIGN_DIR = process.env.ESIGN_DIR || path.join(process.cwd(), 'var', 'data', 'esign')

// Ensure directory exists
if (!fs.existsSync(ESIGN_DIR)) {
  fs.mkdirSync(ESIGN_DIR, { recursive: true })
}

export class MockDocumensoClient implements EsignClient {
  async createEnvelope(args: {
    subject: string
    recipients: string[]
    htmlDoc: string
    callbackUrl: string
  }): Promise<{ envelopeId: string }> {
    const envelopeId = `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    envelopeStore.set(envelopeId, {
      ...args,
      status: 'draft',
      createdAt: new Date(),
    })

    // Simulate sending (auto-send in mock)
    setTimeout(() => {
      const envelope = envelopeStore.get(envelopeId)
      if (envelope) {
        envelope.status = 'sent'
      }
    }, 100)

    console.log(`[MockDocumenso] Created envelope ${envelopeId}`)
    
    return { envelopeId }
  }

  async getStatus(envelopeId: string): Promise<'draft' | 'sent' | 'completed'> {
    const envelope = envelopeStore.get(envelopeId)
    if (!envelope) {
      throw new Error(`Envelope ${envelopeId} not found`)
    }
    return envelope.status
  }

  async downloadPdf(envelopeId: string): Promise<Buffer> {
    const envelope = envelopeStore.get(envelopeId)
    if (!envelope) {
      throw new Error(`Envelope ${envelopeId} not found`)
    }

    // Check if PDF already exists
    const pdfPath = path.join(ESIGN_DIR, `${envelopeId}.pdf`)
    
    if (fs.existsSync(pdfPath)) {
      return fs.readFileSync(pdfPath)
    }

    // Generate mock PDF content (simplified HTML to PDF)
    // In real implementation, this would use a PDF library like puppeteer
    const pdfContent = Buffer.from(`
PDF Document
Envelope ID: ${envelopeId}
Subject: ${envelope.subject}
Recipients: ${envelope.recipients.join(', ')}
Status: ${envelope.status}
Created: ${envelope.createdAt.toISOString()}

Document Content:
${envelope.htmlDoc.replace(/<[^>]*>/g, '').substring(0, 500)}...
    `.trim())

    // Save PDF
    fs.writeFileSync(pdfPath, pdfContent)
    
    console.log(`[MockDocumenso] Generated PDF for envelope ${envelopeId}`)
    
    return pdfContent
  }

  // Helper method for mock webhook to mark as completed
  markCompleted(envelopeId: string): void {
    const envelope = envelopeStore.get(envelopeId)
    if (envelope) {
      envelope.status = 'completed'
      console.log(`[MockDocumenso] Marked envelope ${envelopeId} as completed`)
    }
  }

  getEnvelope(envelopeId: string) {
    return envelopeStore.get(envelopeId)
  }
}

// Export singleton instance
export const mockDocumensoClient = new MockDocumensoClient()

