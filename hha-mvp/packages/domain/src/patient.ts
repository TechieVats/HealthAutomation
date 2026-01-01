import { z } from 'zod'
import { IdSchema, DateStrSchema } from './base'

export const PayerSchema = z.enum(['Medicare', 'Medicaid', 'Private', 'SelfPay', 'Other'])
export type Payer = z.infer<typeof PayerSchema>

export const PatientSchema = z.object({
  id: IdSchema,
  mrn: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dob: DateStrSchema.optional(),
  payer: PayerSchema.optional(),
  createdAt: DateStrSchema,
})

export type Patient = z.infer<typeof PatientSchema>

export const PatientCreateSchema = PatientSchema.omit({ id: true, createdAt: true })

export function factoryPatient(): z.infer<typeof PatientCreateSchema> {
  const firstNames = ['John', 'Jane', 'Robert', 'Mary', 'James', 'Patricia', 'Michael', 'Jennifer']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  
  // Generate MRN
  const mrn = `MRN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  
  // Generate DOB (random date between 1940 and 2000)
  const year = 1940 + Math.floor(Math.random() * 60)
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1
  const dob = new Date(year, month - 1, day).toISOString()
  
  const payers: Payer[] = ['Medicare', 'Medicaid', 'Private', 'SelfPay']
  const payer = payers[Math.floor(Math.random() * payers.length)]
  
  return {
    mrn,
    firstName,
    lastName,
    dob,
    payer,
  }
}

