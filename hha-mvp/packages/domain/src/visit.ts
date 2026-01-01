import { z } from 'zod'
import { IdSchema, DateStrSchema } from './base'

export const VisitStatusSchema = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled'])
export type VisitStatus = z.infer<typeof VisitStatusSchema>

export const VisitSchema = z.object({
  id: IdSchema,
  patientId: IdSchema,
  caregiverName: z.string().optional(),
  startPlanned: DateStrSchema,
  endPlanned: DateStrSchema.optional(),
  status: VisitStatusSchema,
})

export type Visit = z.infer<typeof VisitSchema>

export const VisitCreateSchema = VisitSchema.omit({ id: true })

export function factoryVisit(patientId: string, employeeName?: string): z.infer<typeof VisitCreateSchema> {
  // Generate future visit times (1-14 days from now)
  const daysFromNow = Math.floor(Math.random() * 14) + 1
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + daysFromNow)
  startDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0)
  
  const endDate = new Date(startDate)
  endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 4) + 1)
  
  const statuses: VisitStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  
  const caregivers = ['Nurse A', 'Nurse B', 'Nurse C', 'Caregiver D']
  const caregiverName = employeeName || caregivers[Math.floor(Math.random() * caregivers.length)]
  
  return {
    patientId,
    caregiverName,
    startPlanned: startDate.toISOString(),
    endPlanned: endDate.toISOString(),
    status,
  }
}

export const EvvEventKindSchema = z.enum(['check_in', 'check_out', 'geofence_enter', 'geofence_exit'])
export type EvvEventKind = z.infer<typeof EvvEventKindSchema>

export const EvvEventSchema = z.object({
  id: IdSchema,
  visitId: IdSchema,
  kind: EvvEventKindSchema,
  timestamp: DateStrSchema,
  lat: z.number(),
  lng: z.number(),
})

export type EvvEvent = z.infer<typeof EvvEventSchema>

export const EvvEventCreateSchema = EvvEventSchema.omit({ id: true })

export function factoryEvvEvent(visitId: string): z.infer<typeof EvvEventCreateSchema> {
  const kinds: EvvEventKind[] = ['check_in', 'check_out', 'geofence_enter', 'geofence_exit']
  const kind = kinds[Math.floor(Math.random() * kinds.length)]
  
  // Mock coordinates (example: New York area)
  const lat = 40.7128 + (Math.random() - 0.5) * 0.1
  const lng = -74.0060 + (Math.random() - 0.5) * 0.1
  
  return {
    visitId,
    kind,
    timestamp: new Date().toISOString(),
    lat,
    lng,
  }
}

export const TimesheetTypeSchema = z.enum(['visit', 'travel', 'admin'])
export type TimesheetType = z.infer<typeof TimesheetTypeSchema>

export const TimesheetRowSchema = z.object({
  id: IdSchema,
  employeeId: IdSchema,
  visitId: IdSchema,
  minutes: z.number().int().positive(),
  type: TimesheetTypeSchema,
})

export type TimesheetRow = z.infer<typeof TimesheetRowSchema>

export const TimesheetRowCreateSchema = TimesheetRowSchema.omit({ id: true })

export function factoryTimesheetRow(
  employeeId: string,
  visitId: string
): z.infer<typeof TimesheetRowCreateSchema> {
  const types: TimesheetType[] = ['visit', 'travel', 'admin']
  const type = types[Math.floor(Math.random() * types.length)]
  
  // Visit minutes: 30-180, Travel: 15-60, Admin: 15-120
  const minutesByType: Record<TimesheetType, [number, number]> = {
    visit: [30, 180],
    travel: [15, 60],
    admin: [15, 120],
  }
  
  const [min, max] = minutesByType[type]
  const minutes = Math.floor(Math.random() * (max - min + 1)) + min
  
  return {
    employeeId,
    visitId,
    minutes,
    type,
  }
}

