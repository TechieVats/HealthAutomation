import { createWorker } from 'tesseract.js'
import type { OCRAdapter, OCROptions, OCRResult } from '@/app/types'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Interface-first OCR adapter using Tesseract.js
 * Supports LangChain integration for structured parsing
 */
class TesseractOCRAdapter implements OCRAdapter {
  private worker: ReturnType<typeof createWorker> | null = null
  private langchainEnabled: boolean = false

  constructor() {
    this.langchainEnabled = process.env.ENABLE_LANGCHAIN === 'true'
  }

  async initializeWorker(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker('eng')
    }
  }

  async processDocument(filePath: string, options?: OCROptions): Promise<OCRResult> {
    try {
      await this.initializeWorker()

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: `File not found: ${filePath}`,
        }
      }

      // Read file and perform OCR
      const { data } = await this.worker!.recognize(filePath)

      let structuredData: unknown = undefined

      // If LangChain is enabled, use it for structured parsing
      if (this.langchainEnabled && options?.outputFormat === 'structured') {
        structuredData = await this.parseWithLangChain(data.text)
      } else if (options?.outputFormat === 'json') {
        // Simple JSON structure extraction
        structuredData = this.extractStructuredData(data.text)
      }

      return {
        success: true,
        text: data.text,
        structuredData,
        confidence: data.confidence,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown OCR error',
      }
    }
  }

  private async parseWithLangChain(text: string): Promise<unknown> {
    // TODO: Integrate LangChain for advanced parsing
    // For now, return basic structure
    return this.extractStructuredData(text)
  }

  private extractStructuredData(text: string): unknown {
    // Basic structured extraction (can be enhanced)
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    
    return {
      lines,
      wordCount: text.split(/\s+/).length,
      extractedFields: this.extractFields(text),
    }
  }

  private extractFields(text: string): Record<string, string> {
    const fields: Record<string, string> = {}
    
    // Extract common patterns (dates, emails, phones, etc.)
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}/g
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
    
    const dates = text.match(datePattern)
    const emails = text.match(emailPattern)
    const phones = text.match(phonePattern)
    
    if (dates) fields.dates = dates.join(', ')
    if (emails) fields.emails = emails.join(', ')
    if (phones) fields.phones = phones.join(', ')
    
    return fields
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }
}

// Export singleton instance
export const ocrAdapter = new TesseractOCRAdapter()

