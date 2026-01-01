import { prisma } from './prisma'

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
        metaJson: options.meta || {}, // Prisma accepts Record<string, unknown> for JSON fields
      },
    })
  } catch (error) {
    // Log error but don't throw - audit logging should not break main flow
    console.error('[AUDIT] Failed to log audit event:', error)
  }
}

