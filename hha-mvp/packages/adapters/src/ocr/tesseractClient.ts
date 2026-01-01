import type { OcrClient } from './index'

// PDF text extraction using pdf-parse
// This avoids the tesseract.js worker path issues in Next.js

const PATTERNS = {
  // Patient name patterns - more flexible matching
  // Match "Patient Name: John Doe", "Name: John Doe", "Patient: John Doe"
  patientName: /(?:Patient'?s?\s*Name|Patient[\s:]+Name|Name)[\s:]*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/i,
  // Match "First Name: John" or just "First: John"
  firstName: /(?:First\s*Name|First)[\s:]*([A-Z][a-zA-Z]+)/i,
  // Match "Last Name: Doe" or "Last: Doe" or "Surname: Doe"
  lastName: /(?:Last\s*Name|Last|Surname)[\s:]*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/i,
  // DOB patterns - match various formats
  // "DOB: 8/3/32", "Date of Birth: 08/03/1932", "Birth Date: 8-3-32"
  dob: /(?:DOB|Date\s*of\s*Birth|Birth\s*Date|Date)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  // Payer patterns - match "Payer: Medicare", "Insurance: Medicaid", etc.
  payer: /(?:Payer|Insurance|Insurance\s*Type)[\s:]*([A-Z][a-zA-Z]+)/i,
  medicare: /Medicare/i,
  medicaid: /Medicaid/i,
}

export class TesseractClient implements OcrClient {
  private async extractTextFromPdfWithOcr(filePath: string): Promise<string> {
    try {
      console.log('🔄 Attempting OCR extraction with Tesseract.js...')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createWorker } = require('tesseract.js')
      const worker = await createWorker('eng')
      
      // Tesseract can work directly with PDF files
      const { data: { text } } = await worker.recognize(filePath)
      await worker.terminate()
      
      console.log(`✅ OCR extracted ${text.length} characters`)
      return text
    } catch (error) {
      console.error('❌ OCR extraction failed:', error)
      return ''
    }
  }

  private async extractTextFromPdf(filePath: string): Promise<string> {
    try {
      // First, try pdf-parse for text-based PDFs (faster)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const fs = await import('fs')
      
      const dataBuffer = fs.readFileSync(filePath)
      
      // Try with options to get better extraction
      const options = {
        max: 0, // No limit on pages
      }
      
      // pdf-parse returns a Promise
      const data = await pdfParse(dataBuffer, options)
      
      // Extract text from the PDF data
      let text = (data && data.text) ? data.text : ''
      
      // Clean up the text - normalize line endings
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      
      // Check if PDF is image-based (scanned)
      // If we got very little text from a multi-page PDF, it's likely image-based
      const isImageBased = text.trim().length < 100 && data.numpages > 0
      
      if (isImageBased) {
        console.warn('⚠️  PDF appears to be image-based (scanned)')
        console.warn(`   pdf-parse extracted only ${text.length} characters from ${data.numpages} pages`)
        console.log('🔄 Attempting OCR extraction as fallback...')
        
        // Fallback to OCR for image-based PDFs
        const ocrText = await this.extractTextFromPdfWithOcr(filePath)
        if (ocrText && ocrText.trim().length > 50) {
          console.log(`✅ OCR extracted ${ocrText.length} characters`)
          return ocrText
        } else {
          console.warn('⚠️  OCR also failed or extracted very little text')
          return text // Return whatever we got from pdf-parse
        }
      } else if (text.length > 0) {
        console.log(`✅ Extracted ${text.length} characters from ${data.numpages} page(s) (text-based PDF)`)
        console.log(`📄 First 500 chars:`, text.substring(0, 500))
      } else {
        console.warn('⚠️  PDF extracted but no text content found')
      }
      
      return text
    } catch (error) {
      console.error('❌ PDF parsing error:', error)
      console.error('Error details:', error instanceof Error ? error.message : String(error))
      
      // Try OCR as fallback
      console.log('🔄 Attempting OCR extraction as fallback...')
      const ocrText = await this.extractTextFromPdfWithOcr(filePath)
      if (ocrText && ocrText.trim().length > 50) {
        return ocrText
      }
      
      return ''
    }
  }

  private async readTextFile(filePath: string): Promise<string> {
    try {
      const fs = await import('fs')
      const path = await import('path')
      
      const ext = path.extname(filePath).toLowerCase()
      if (ext === '.pdf') {
        // Extract text from PDF
        return await this.extractTextFromPdf(filePath)
      }
      
      // Try to read as text file
      const content = fs.readFileSync(filePath, 'utf-8')
      return content
    } catch (error) {
      console.error('File read error:', error)
      return ''
    }
  }

  private extractName(text: string): { firstName?: string; lastName?: string } {
    const extracted: { firstName?: string; lastName?: string } = {}
    
    // Try multiple name patterns - be more flexible
    const namePatterns = [
      // "Patient Name: John Doe" or "Name: John Doe"
      /(?:Patient'?s?\s*Name|Name)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
      // "Patient Name: John Doe" (more flexible)
      /(?:Patient'?s?\s*Name|Name)[\s:]+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/i,
      // "First Name: John" and "Last Name: Doe" separately
      /First\s*Name[\s:]+([A-Z][a-zA-Z]+)/i,
      /Last\s*Name[\s:]+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/i,
    ]
    
    // Try full patient name pattern first (e.g., "Edith Wade" or "John Michael Smith")
    const patientNameMatch = text.match(PATTERNS.patientName)
    if (patientNameMatch && patientNameMatch[1]) {
      const fullName = patientNameMatch[1].trim()
      const nameParts = fullName.split(/\s+/).filter(p => p.length > 0)
      if (nameParts.length >= 1) {
        extracted.firstName = nameParts[0]
      }
      if (nameParts.length >= 2) {
        extracted.lastName = nameParts.slice(1).join(' ')
      }
      if (extracted.firstName || extracted.lastName) {
        return extracted
      }
    }
    
    // Try separate first/last name patterns
    const firstNameMatch = text.match(PATTERNS.firstName)
    if (firstNameMatch && firstNameMatch[1]) {
      extracted.firstName = firstNameMatch[1].trim()
    }
    
    const lastNameMatch = text.match(PATTERNS.lastName)
    if (lastNameMatch && lastNameMatch[1]) {
      extracted.lastName = lastNameMatch[1].trim()
    }
    
    // If we found a name but it's split, try to find the other part
    if (extracted.firstName && !extracted.lastName) {
      // Look for last name nearby
      const afterFirstName = text.substring(text.indexOf(extracted.firstName) + extracted.firstName.length)
      const lastNameMatch2 = afterFirstName.match(/\b([A-Z][a-zA-Z]+)\b/)
      if (lastNameMatch2 && lastNameMatch2[1] !== extracted.firstName) {
        extracted.lastName = lastNameMatch2[1]
      }
    }
    
    return extracted
  }

  private extractDOB(text: string): string | undefined {
    // Try DOB label pattern first
    const dobMatch = text.match(PATTERNS.dob)
    if (dobMatch) {
      return dobMatch[1]
    }
    
    // Fallback: look for date patterns that might be DOB
    // Look for dates in MM/DD/YY or MM/DD/YYYY format
    const datePatterns = [
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/, // MM/DD/YYYY
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})\b/, // MM/DD/YY
    ]
    
    for (const pattern of datePatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        const dateStr = match[1]
        // Check if it's a reasonable date (not a year like 2024)
        const parts = dateStr.split(/[\/\-]/)
        if (parts.length === 3) {
          const month = parseInt(parts[0])
          const day = parseInt(parts[1])
          const year = parseInt(parts[2])
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
            return dateStr
          }
        }
      }
    }
    
    return undefined
  }

  private extractPayer(text: string): string | undefined {
    // Try payer label pattern first
    const payerMatch = text.match(PATTERNS.payer)
    if (payerMatch) {
      const payer = payerMatch[1]
      const validPayers = ['Medicare', 'Medicaid', 'Private', 'SelfPay', 'Other']
      if (validPayers.includes(payer)) {
        return payer
      }
    }
    
    // Check for Medicare keyword
    if (PATTERNS.medicare.test(text)) {
      return 'Medicare'
    }
    
    // Check for Medicaid keyword
    if (PATTERNS.medicaid.test(text)) {
      return 'Medicaid'
    }
    
    // Fallback: look for payer keywords anywhere in text
    const payerKeywords = ['Medicare', 'Medicaid', 'Private', 'SelfPay']
    for (const keyword of payerKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        return keyword
      }
    }
    
    return undefined
  }

  async extractFields(filePath: string): Promise<Record<string, string>> {
    try {
      const path = await import('path')
      const ext = path.extname(filePath).toLowerCase()
      
      // Read file content (for both PDFs and text files)
      const text = await this.readTextFile(filePath)

      // Log the raw extracted text for debugging
      console.log('📋 Raw extracted text length:', text ? text.length : 0)
      if (text && text.length > 0) {
        console.log('📋 Raw text (first 1000 chars):', JSON.stringify(text.substring(0, 1000)))
      }

      // If no text extracted at all, return empty object (let the API handle fallback)
      if (!text || text.trim().length === 0) {
        console.warn('⚠️  No text extracted from file - PDF may be image-based or corrupted')
        console.warn('⚠️  Returning empty extraction (API will use factory defaults)')
        return {} // Return empty object instead of mock data
      }

      // Normalize text for better pattern matching
      const normalizedText = text.replace(/\s+/g, ' ').trim()

      console.log('📋 Normalized text length:', normalizedText.length)
      console.log('📋 Normalized text (first 500 chars):', normalizedText.substring(0, 500))

      // Extract fields using improved patterns
      const extracted: Record<string, string> = {}

      // Extract name - try both original and normalized text
      const { firstName, lastName } = this.extractName(normalizedText)
      if (firstName) {
        extracted.firstName = firstName
        console.log(`✅ Extracted firstName: ${firstName}`)
      }
      if (lastName) {
        extracted.lastName = lastName
        console.log(`✅ Extracted lastName: ${lastName}`)
      }

      // Extract DOB
      const dob = this.extractDOB(normalizedText)
      if (dob) {
        extracted.dob = dob
        console.log(`✅ Extracted dob: ${dob}`)
      }

      // Extract payer
      const payer = this.extractPayer(normalizedText)
      if (payer) {
        extracted.payer = payer
        console.log(`✅ Extracted payer: ${payer}`)
      }

      // Return whatever was extracted (even if partial)
      // Don't return mock data - let the API decide what to do
      console.log('📋 Final extracted fields:', extracted)
      console.log(`📋 Extraction summary: ${Object.keys(extracted).length} fields found`)
      
      return extracted
    } catch (error) {
      console.error('❌ OCR extraction error:', error)
      console.error('Error details:', error instanceof Error ? error.message : String(error))
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace')
      // Return empty object on error - let API handle fallback
      return {}
    }
  }
}

export const tesseractClient = new TesseractClient()
