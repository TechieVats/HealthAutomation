import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with synthetic data...')

  // Create synthetic patients (no PHI)
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        syntheticId: 'PAT-001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1980-01-15'),
        email: 'john.doe@example.com',
        phone: '555-0101',
        address: '123 Main St, Anytown, ST 12345',
        syntheticData: {
          notes: 'Synthetic test patient data',
          generatedAt: new Date().toISOString(),
        },
      },
    }),
    prisma.patient.create({
      data: {
        syntheticId: 'PAT-002',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('1975-05-22'),
        email: 'jane.smith@example.com',
        phone: '555-0102',
        address: '456 Oak Ave, Somewhere, ST 67890',
        syntheticData: {
          notes: 'Synthetic test patient data',
          generatedAt: new Date().toISOString(),
        },
      },
    }),
    prisma.patient.create({
      data: {
        syntheticId: 'PAT-003',
        firstName: 'Bob',
        lastName: 'Johnson',
        dateOfBirth: new Date('1990-08-10'),
        email: 'bob.johnson@example.com',
        phone: '555-0103',
        syntheticData: {
          notes: 'Synthetic test patient data',
          generatedAt: new Date().toISOString(),
        },
      },
    }),
  ])

  console.log(`✅ Created ${patients.length} synthetic patients`)

  // Create care plans
  const carePlans = await Promise.all([
    prisma.carePlan.create({
      data: {
        patientId: patients[0].id,
        title: 'Home Health Monitoring Plan',
        description: 'Weekly visits for vital signs monitoring and medication management',
        startDate: new Date(),
        status: 'active',
      },
    }),
    prisma.carePlan.create({
      data: {
        patientId: patients[1].id,
        title: 'Physical Therapy Plan',
        description: 'Bi-weekly PT sessions for mobility improvement',
        startDate: new Date(),
        status: 'active',
      },
    }),
  ])

  console.log(`✅ Created ${carePlans.length} care plans`)

  // Create visits
  const visits = await Promise.all([
    prisma.visit.create({
      data: {
        patientId: patients[0].id,
        visitDate: new Date(),
        visitType: 'home',
        providerNotes: 'Patient in good spirits. Vital signs stable.',
        evvVerified: true,
        evvData: {
          verifiedAt: new Date().toISOString(),
          location: { lat: 40.7128, lng: -74.0060 },
        },
      },
    }),
    prisma.visit.create({
      data: {
        patientId: patients[1].id,
        visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        visitType: 'home',
        providerNotes: 'Progress noted in mobility exercises.',
        evvVerified: true,
        evvData: {
          verifiedAt: new Date().toISOString(),
          location: { lat: 40.7589, lng: -73.9851 },
        },
      },
    }),
  ])

  console.log(`✅ Created ${visits.length} visits`)

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

