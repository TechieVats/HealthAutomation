import { z } from 'zod'
import { IdSchema } from './base'

export const ReferralStatusSchema = z.enum(['pending', 'reviewed', 'approved', 'rejected'])
export type ReferralStatus = z.infer<typeof ReferralStatusSchema>

export const ReferralSchema = z.object({
  id: IdSchema,
  patientId: IdSchema,
  source: z.string(),
  pdfPath: z.string().optional(),
  status: ReferralStatusSchema,
})

export type Referral = z.infer<typeof ReferralSchema>

export const ReferralCreateSchema = ReferralSchema.omit({ id: true })

export function factoryReferral(patientId: string): z.infer<typeof ReferralCreateSchema> {
  const sources = ['Hospital', 'Physician Office', 'Family Member', 'Self-Referral', 'Agency']
  const statuses: ReferralStatus[] = ['pending', 'reviewed', 'approved', 'rejected']
  
  return {
    patientId,
    source: sources[Math.floor(Math.random() * sources.length)],
    pdfPath: `/referrals/ref-${Date.now()}.pdf`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }
}

