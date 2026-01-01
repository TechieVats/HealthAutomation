// Mock data for pages that don't require database access

export interface MockPatient {
  id: string
  mrn: string
  name: string
  dob: string
  payer: string
  status: string
}

export interface MockSchedule {
  date: string
  caregiver: string
  patient: string
  status: string
  time: string
}

export interface MockTimesheet {
  employee: string
  date: string
  hours: number
  type: string
}

export const mockPatients: MockPatient[] = [
  { id: '1', mrn: 'MRN-001', name: 'John Smith', dob: '1955-03-15', payer: 'Medicare', status: 'Active' },
  { id: '2', mrn: 'MRN-002', name: 'Jane Doe', dob: '1948-07-22', payer: 'Medicaid', status: 'Active' },
  { id: '3', mrn: 'MRN-003', name: 'Robert Johnson', dob: '1962-11-30', payer: 'Private', status: 'Active' },
  { id: '4', mrn: 'MRN-004', name: 'Mary Williams', dob: '1950-05-10', payer: 'Medicare', status: 'Discharged' },
  { id: '5', mrn: 'MRN-005', name: 'James Brown', dob: '1945-09-18', payer: 'Medicaid', status: 'Active' },
]

export const mockSchedule: MockSchedule[] = [
  { date: '2024-11-04', caregiver: 'Sarah Johnson', patient: 'John Smith', status: 'Scheduled', time: '10:00 AM' },
  { date: '2024-11-04', caregiver: 'Michael Chen', patient: 'Jane Doe', status: 'Completed', time: '2:00 PM' },
  { date: '2024-11-05', caregiver: 'Sarah Johnson', patient: 'Robert Johnson', status: 'Scheduled', time: '9:00 AM' },
  { date: '2024-11-05', caregiver: 'Emily Rodriguez', patient: 'James Brown', status: 'Scheduled', time: '1:00 PM' },
  { date: '2024-11-06', caregiver: 'Michael Chen', patient: 'John Smith', status: 'Scheduled', time: '11:00 AM' },
]

export const mockTimesheets: MockTimesheet[] = [
  { employee: 'Sarah Johnson', date: '2024-11-04', hours: 8.5, type: 'Visit' },
  { employee: 'Michael Chen', date: '2024-11-04', hours: 7.0, type: 'Visit' },
  { employee: 'Emily Rodriguez', date: '2024-11-04', hours: 6.5, type: 'Visit' },
  { employee: 'Sarah Johnson', date: '2024-11-05', hours: 8.0, type: 'Visit' },
  { employee: 'Michael Chen', date: '2024-11-05', hours: 7.5, type: 'Visit' },
  { employee: 'Emily Rodriguez', date: '2024-11-05', hours: 4.0, type: 'Admin' },
]

export const mockEmployees = [
  { id: '1', name: 'Sarah Johnson', role: 'RN' },
  { id: '2', name: 'Michael Chen', role: 'LPN' },
  { id: '3', name: 'Emily Rodriguez', role: 'CNA' },
  { id: '4', name: 'David Kim', role: 'PT' },
]

