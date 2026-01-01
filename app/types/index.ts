// Interface definitions for external system adapters

export interface EHRAdapter {
  syncCarePlan(carePlanId: string, carePlanData: unknown): Promise<{ success: boolean; ehrId?: string; error?: string }>
  getPatientData(patientId: string): Promise<unknown>
  createAppointment(patientId: string, appointmentData: unknown): Promise<{ success: boolean; appointmentId?: string; error?: string }>
}

export interface EVVAdapter {
  verifyVisit(visitId: string, visitData: unknown): Promise<{ success: boolean; verified: boolean; evvData?: unknown; error?: string }>
  logVisit(visitId: string, visitData: unknown): Promise<{ success: boolean; logId?: string; error?: string }>
}

export interface ESignAdapter {
  requestSignature(documentId: string, signerEmail: string, signerName: string): Promise<{ success: boolean; signatureId?: string; error?: string }>
  checkSignatureStatus(signatureId: string): Promise<{ success: boolean; signed: boolean; completedAt?: Date; error?: string }>
  downloadSignedDocument(signatureId: string): Promise<{ success: boolean; fileBuffer?: Buffer; error?: string }>
}

export interface OCRAdapter {
  processDocument(filePath: string, options?: OCROptions): Promise<OCRResult>
}

export interface OCROptions {
  language?: string
  outputFormat?: 'text' | 'json' | 'structured'
}

export interface OCRResult {
  success: boolean
  text?: string
  structuredData?: unknown
  confidence?: number
  error?: string
}

