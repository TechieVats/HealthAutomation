import { z } from 'zod'

// Patient schemas
export const PatientCreateSchema = z.object({
  syntheticId: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  syntheticData: z.record(z.unknown()).optional(),
})

export const PatientUpdateSchema = PatientCreateSchema.partial()

// Document schemas
export const DocumentCreateSchema = z.object({
  patientId: z.string().min(1),
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  fileType: z.string(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
})

export const DocumentUpdateSchema = z.object({
  signed: z.boolean().optional(),
  signatureId: z.string().optional(),
  ocrProcessed: z.boolean().optional(),
  ocrData: z.record(z.unknown()).optional(),
})

// Visit schemas
export const VisitCreateSchema = z.object({
  patientId: z.string().min(1),
  visitDate: z.string().datetime(),
  visitType: z.enum(['home', 'virtual', 'in-office']),
  providerNotes: z.string().optional(),
})

export const VisitUpdateSchema = z.object({
  evvVerified: z.boolean().optional(),
  evvData: z.record(z.unknown()).optional(),
  providerNotes: z.string().optional(),
})

// CarePlan schemas
export const CarePlanCreateSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
})

export const CarePlanUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  ehrSynced: z.boolean().optional(),
  ehrId: z.string().optional(),
})

// OCR schemas
export const OCRProcessSchema = z.object({
  documentId: z.string().min(1),
  filePath: z.string().min(1),
})

// Workflow schemas
export const WorkflowExecutionCreateSchema = z.object({
  workflowId: z.string().min(1),
  workflowName: z.string().min(1),
  inputData: z.record(z.unknown()).optional(),
})

