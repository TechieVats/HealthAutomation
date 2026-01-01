// Adapter interfaces and implementations

// OCR
export * from './ocr'

// E-Signature
export * from './esign'

// EVV
export * from './evv'

export interface EHRAdapter {
  syncPatient(patientId: string, data: unknown): Promise<{ success: boolean; ehrId?: string; error?: string }>
  getPatientData(patientId: string): Promise<unknown>
}

export interface EVVAdapter {
  verifyVisit(visitId: string, data: unknown): Promise<{ success: boolean; verified: boolean; error?: string }>
  logEvent(event: unknown): Promise<{ success: boolean; eventId?: string; error?: string }>
}

export interface ESignAdapter {
  requestSignature(documentId: string, signerEmail: string, signerName: string): Promise<{ success: boolean; signatureId?: string; error?: string }>
  checkSignatureStatus(signatureId: string): Promise<{ success: boolean; signed: boolean; error?: string }>
}

export interface OCRAdapter {
  processDocument(filePath: string): Promise<{ success: boolean; text?: string; error?: string }>
}

// Mock implementations
export class MockEHRAdapter implements EHRAdapter {
  async syncPatient(patientId: string, data: unknown) {
    return {
      success: true,
      ehrId: `ehr-mock-${patientId}-${Date.now()}`,
    }
  }

  async getPatientData(patientId: string) {
    return {
      id: patientId,
      synthetic: true,
      data: 'mock-patient-data',
    }
  }
}

export class MockEVVAdapter implements EVVAdapter {
  async verifyVisit(visitId: string, data: unknown) {
    return {
      success: true,
      verified: Math.random() > 0.2, // 80% verified rate
    }
  }

  async logEvent(event: unknown) {
    return {
      success: true,
      eventId: `evv-mock-${Date.now()}`,
    }
  }
}

export class MockESignAdapter implements ESignAdapter {
  async requestSignature(documentId: string, signerEmail: string, signerName: string) {
    return {
      success: true,
      signatureId: `sig-mock-${documentId}-${Date.now()}`,
    }
  }

  async checkSignatureStatus(signatureId: string) {
    return {
      success: true,
      signed: Math.random() > 0.5, // Random signed status
    }
  }
}

export class TesseractOCRAdapter implements OCRAdapter {
  private worker: any = null

  async processDocument(filePath: string) {
    try {
      if (!this.worker) {
        const { createWorker } = await import('tesseract.js')
        this.worker = await createWorker('eng')
      }

      const { data } = await this.worker.recognize(filePath)
      return {
        success: true,
        text: data.text,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown OCR error',
      }
    }
  }
}

// Export singleton instances
export const ehrAdapter = new MockEHRAdapter()
export const evvAdapter = new MockEVVAdapter()
export const esignAdapter = new MockESignAdapter()
export const ocrAdapter = new TesseractOCRAdapter()

