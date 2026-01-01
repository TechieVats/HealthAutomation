import { z } from 'zod'
import { IdSchema, DateStrSchema } from './base'

export const AuditEventSchema = z.object({
  id: IdSchema,
  who: z.string(),
  action: z.string(),
  entity: z.string(),
  entityId: IdSchema,
  when: DateStrSchema,
  metaJson: z.record(z.unknown()).optional(),
})

export type AuditEvent = z.infer<typeof AuditEventSchema>

export const AuditEventCreateSchema = AuditEventSchema.omit({ id: true, when: true })

export function factoryAudit(
  who: string,
  action: string,
  entity: string,
  entityId: string,
  metaJson?: Record<string, unknown>
): z.infer<typeof AuditEventCreateSchema> {
  return {
    who,
    action,
    entity,
    entityId,
    metaJson,
  }
}

