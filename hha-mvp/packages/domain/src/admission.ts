import { z } from 'zod'
import { IdSchema } from './base'

export const AdmissionStatusSchema = z.enum(['draft', 'pending_signature', 'signed', 'completed'])
export type AdmissionStatus = z.infer<typeof AdmissionStatusSchema>

export const AdmissionPacketSchema = z.object({
  id: IdSchema,
  patientId: IdSchema,
  dataJson: z.record(z.unknown()),
  signedPdfPath: z.string().optional(),
  status: AdmissionStatusSchema,
})

export type AdmissionPacket = z.infer<typeof AdmissionPacketSchema>

export const AdmissionPacketCreateSchema = AdmissionPacketSchema.omit({ id: true })

export function factoryAdmission(patientId: string): z.infer<typeof AdmissionPacketCreateSchema> {
  const statuses: AdmissionStatus[] = ['draft', 'pending_signature', 'signed', 'completed']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  
  const dataJson = {
    diagnosis: ['Diabetes', 'Hypertension', 'COPD', 'Heart Failure', 'Post-Surgical'][
      Math.floor(Math.random() * 5)
    ],
    services: ['Skilled Nursing', 'Physical Therapy', 'Occupational Therapy'],
    startDate: new Date().toISOString(),
    estimatedDuration: Math.floor(Math.random() * 60) + 30, // 30-90 days
    notes: 'Generated synthetic admission packet data',
  }
  
  return {
    patientId,
    dataJson,
    signedPdfPath: status === 'signed' || status === 'completed' 
      ? `/admissions/adm-${patientId}-${Date.now()}.pdf`
      : undefined,
    status,
  }
}

