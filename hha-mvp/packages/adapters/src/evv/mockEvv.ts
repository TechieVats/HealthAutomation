import type { EvvClient, Visit } from './index'

// In-memory storage for EVV data
const scheduledVisits = new Map<string, Visit>()
const eventHistory = new Map<string, Array<{
  visitId: string
  kind: 'clock_in' | 'clock_out'
  timestamp: Date
  lat: number
  lng: number
}>>()

// Dummy patient locations (in production, these would come from patient data)
const patientLocations = new Map<string, { lat: number; lng: number }>()

// Initialize some dummy locations (New York area)
patientLocations.set('default', { lat: 40.7128, lng: -74.0060 })

// Geofence radius in meters
const GEOFENCE_RADIUS = 250

// On-time window in minutes
const TIME_WINDOW_MINUTES = 15

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Haversine formula to calculate distance in meters
  const R = 6371000 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function getPatientLocation(patientId: string): { lat: number; lng: number } {
  // Return patient location or default
  return patientLocations.get(patientId) || patientLocations.get('default')!
}

export class MockEvvClient implements EvvClient {
  async pushSchedule(visit: Visit): Promise<{ ok: true }> {
    scheduledVisits.set(visit.id, visit)
    
    // Store patient location if not already set
    if (!patientLocations.has(visit.patientId)) {
      // Generate a location near default (small random offset)
      const base = patientLocations.get('default')!
      patientLocations.set(visit.patientId, {
        lat: base.lat + (Math.random() - 0.5) * 0.01,
        lng: base.lng + (Math.random() - 0.5) * 0.01,
      })
    }
    
    console.log(`[MockEVV] Pushed schedule for visit ${visit.id}`)
    return { ok: true }
  }

  async recordEvent(event: {
    visitId: string
    kind: 'clock_in' | 'clock_out'
    timestamp: Date
    lat: number
    lng: number
  }): Promise<{ ok: true }> {
    const events = eventHistory.get(event.visitId) || []
    events.push(event)
    eventHistory.set(event.visitId, events)
    
    console.log(`[MockEVV] Recorded ${event.kind} event for visit ${event.visitId}`)
    return { ok: true }
  }

  async validate(visitId: string): Promise<{ verified: boolean; reasons: string[] }> {
    const visit = scheduledVisits.get(visitId)
    if (!visit) {
      return {
        verified: false,
        reasons: ['Visit not found in schedule'],
      }
    }

    const events = eventHistory.get(visitId) || []
    const clockInEvents = events.filter(e => e.kind === 'clock_in')
    const clockOutEvents = events.filter(e => e.kind === 'clock_out')

    const reasons: string[] = []
    let verified = true

    // Check for clock in
    if (clockInEvents.length === 0) {
      verified = false
      reasons.push('No clock-in event recorded')
    } else {
      const clockIn = clockInEvents[0]
      
      // Check time window (±15 minutes)
      const plannedStart = new Date(visit.startPlanned)
      const timeDiff = Math.abs(clockIn.timestamp.getTime() - plannedStart.getTime()) / (1000 * 60)
      
      if (timeDiff > TIME_WINDOW_MINUTES) {
        verified = false
        reasons.push(`Clock-in time ${timeDiff.toFixed(1)} minutes from planned (allowed: ±${TIME_WINDOW_MINUTES} min)`)
      } else {
        reasons.push(`Clock-in time within window (${timeDiff.toFixed(1)} min)`)
      }

      // Check geofence (250m radius)
      const patientLoc = getPatientLocation(visit.patientId)
      const distance = getDistance(clockIn.lat, clockIn.lng, patientLoc.lat, patientLoc.lng)
      
      if (distance > GEOFENCE_RADIUS) {
        verified = false
        reasons.push(`Clock-in location ${distance.toFixed(0)}m from patient (allowed: ${GEOFENCE_RADIUS}m)`)
      } else {
        reasons.push(`Clock-in location within geofence (${distance.toFixed(0)}m)`)
      }
    }

    // Check for clock out
    if (clockOutEvents.length === 0) {
      verified = false
      reasons.push('No clock-out event recorded')
    } else {
      const clockOut = clockOutEvents[0]
      
      // Clock out should be after clock in
      if (clockInEvents.length > 0) {
        const clockIn = clockInEvents[0]
        if (clockOut.timestamp <= clockIn.timestamp) {
          verified = false
          reasons.push('Clock-out must be after clock-in')
        } else {
          const duration = (clockOut.timestamp.getTime() - clockIn.timestamp.getTime()) / (1000 * 60)
          reasons.push(`Visit duration: ${duration.toFixed(1)} minutes`)
        }
      }

      // Check geofence for clock out
      const patientLoc = getPatientLocation(visit.patientId)
      const distance = getDistance(clockOut.lat, clockOut.lng, patientLoc.lat, patientLoc.lng)
      
      if (distance > GEOFENCE_RADIUS) {
        verified = false
        reasons.push(`Clock-out location ${distance.toFixed(0)}m from patient (allowed: ${GEOFENCE_RADIUS}m)`)
      } else {
        reasons.push(`Clock-out location within geofence (${distance.toFixed(0)}m)`)
      }
    }

    return { verified, reasons }
  }

  // Helper methods for testing
  getEvents(visitId: string) {
    return eventHistory.get(visitId) || []
  }

  getScheduledVisit(visitId: string) {
    return scheduledVisits.get(visitId)
  }
}

// Export singleton instance
export const mockEvvClient = new MockEvvClient()

