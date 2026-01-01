import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

export interface AuditLogOptions {
  who: string
  action: string
  entity: string
  entityId: string
  meta?: Record<string, unknown>
}

/**
 * Helper function to log audit events
 * Saves AuditEvent row to database
 */
export async function logAudit(options: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: {
        who: options.who,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
        metaJson: (options.meta || {}) as Prisma.InputJsonValue, // Cast to Prisma's InputJsonValue type
      },
    })
  } catch (error) {
    // Log error but don't throw - audit logging should not break main flow
    console.error('[AUDIT] Failed to log audit event:', error)
  }
}

