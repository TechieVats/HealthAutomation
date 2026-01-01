/**
 * Seed script to populate database with synthetic data
 * Uses Prisma client from portal app
 */

import { PrismaClient } from '@prisma/client'
import {
  factoryPatient,
  factoryEmployee,
  factoryVisit,
  factoryEvvEvent,
  factoryTimesheetRow,
} from '@hha-mvp/domain'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (optional, for clean seed)
  console.log('🧹 Clearing existing data...')
  await prisma.timesheetRow.deleteMany()
  await prisma.evvEvent.deleteMany()
  await prisma.visit.deleteMany()
  await prisma.admissionPacket.deleteMany()
  await prisma.referral.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.patient.deleteMany()

  // Seed 3 patients
  console.log('👥 Creating 3 patients...')
  const patients = []
  for (let i = 0; i < 3; i++) {
    const patientData = factoryPatient()
    const patient = await prisma.patient.create({
      data: {
        mrn: patientData.mrn,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dob: patientData.dob ? new Date(patientData.dob) : null,
        payer: patientData.payer,
      },
    })
    patients.push(patient)
    console.log(`  ✓ Created patient ${patient.mrn} (${patient.firstName} ${patient.lastName})`)
  }

  // Seed 2 employees
  console.log('👨‍⚕️ Creating 2 employees...')
  const employees = []
  for (let i = 0; i < 2; i++) {
    const employeeData = factoryEmployee()
    const employee = await prisma.employee.create({
      data: {
        name: employeeData.name,
        role: employeeData.role,
        licenseNo: employeeData.licenseNo,
        licenseExpiry: employeeData.licenseExpiry ? new Date(employeeData.licenseExpiry) : null,
      },
    })
    employees.push(employee)
    console.log(`  ✓ Created employee ${employee.name} (${employee.role})`)
  }

  // Seed 5 visits with future times
  console.log('📅 Creating 5 visits with future times...')
  const visits = []
  for (let i = 0; i < 5; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)]
    const employee = employees[Math.floor(Math.random() * employees.length)]
    
    const visitData = factoryVisit(patient.id, employee.name)
    const visit = await prisma.visit.create({
      data: {
        patientId: visitData.patientId,
        caregiverName: visitData.caregiverName,
        startPlanned: new Date(visitData.startPlanned),
        endPlanned: visitData.endPlanned ? new Date(visitData.endPlanned) : null,
        status: visitData.status,
      },
    })
    visits.push(visit)
    
    // Create EVV event for some visits
    if (Math.random() > 0.3) {
      const evvData = factoryEvvEvent(visit.id)
      await prisma.evvEvent.create({
        data: {
          visitId: evvData.visitId,
          kind: evvData.kind,
          timestamp: new Date(evvData.timestamp),
          lat: evvData.lat,
          lng: evvData.lng,
        },
      })
    }
    
    // Create timesheet row for some visits
    if (Math.random() > 0.3) {
      const timesheetData = factoryTimesheetRow(employee.id, visit.id)
      await prisma.timesheetRow.create({
        data: {
          employeeId: timesheetData.employeeId,
          visitId: timesheetData.visitId,
          minutes: timesheetData.minutes,
          type: timesheetData.type,
        },
      })
    }
    
    const startDate = new Date(visit.startPlanned).toLocaleDateString()
    console.log(`  ✓ Created visit for patient ${patient.mrn} on ${startDate} (${visit.status})`)
  }

  console.log('')
  console.log('✅ Seed completed successfully!')
  console.log(`   - ${patients.length} patients`)
  console.log(`   - ${employees.length} employees`)
  console.log(`   - ${visits.length} visits`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

