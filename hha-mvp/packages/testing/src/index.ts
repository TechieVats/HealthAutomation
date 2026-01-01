import type {
  PatientCreateSchema,
  ReferralCreateSchema,
  VisitCreateSchema,
  EmployeeCreateSchema,
} from '@hha-mvp/domain'
import type { z } from 'zod'

// Synthetic data generators (no PHI)
export function generateMRN(): string {
  return `MRN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

export function generateSyntheticPatient(): z.infer<typeof PatientCreateSchema> {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana']
  const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Davis']
  
  return {
    mrn: generateMRN(),
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    payer: ['Medicare', 'Medicaid', 'Private'][Math.floor(Math.random() * 3)],
  }
}

export function generateSyntheticReferral(patientId: string): z.infer<typeof ReferralCreateSchema> {
  return {
    patientId,
    source: ['Hospital', 'Physician', 'Family', 'Self'][Math.floor(Math.random() * 4)],
    status: 'pending',
  }
}

export function generateSyntheticVisit(patientId: string): z.infer<typeof VisitCreateSchema> {
  const start = new Date()
  start.setHours(9, 0, 0, 0)
  
  const end = new Date(start)
  end.setHours(start.getHours() + 2)

  return {
    patientId,
    caregiverName: ['Nurse A', 'Nurse B', 'Nurse C'][Math.floor(Math.random() * 3)],
    startPlanned: start.toISOString(),
    endPlanned: end.toISOString(),
    status: 'scheduled',
  }
}

export function generateSyntheticEmployee(): z.infer<typeof EmployeeCreateSchema> {
  const names = ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim']
  const roles = ['RN', 'LPN', 'CNA', 'PT']
  
  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + 1)

  return {
    name: names[Math.floor(Math.random() * names.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    licenseNo: `LIC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    licenseExpiry: expiry.toISOString(),
  }
}

// Test utilities
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

