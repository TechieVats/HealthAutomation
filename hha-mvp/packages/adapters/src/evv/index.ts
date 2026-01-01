export interface Visit {
  id: string
  patientId: string
  startPlanned: Date
  endPlanned?: Date | null
  [key: string]: unknown
}

export interface EvvClient {
  pushSchedule(visit: Visit): Promise<{ ok: true }>
  recordEvent(event: {
    visitId: string
    kind: 'clock_in' | 'clock_out'
    timestamp: Date
    lat: number
    lng: number
  }): Promise<{ ok: true }>
  validate(visitId: string): Promise<{ verified: boolean; reasons: string[] }>
}

export { MockEvvClient, mockEvvClient } from './mockEvv'

