/**
 * Main test suite that runs all API endpoint tests
 * Run this file to test all API endpoints
 */

import { describe } from 'vitest'

// Import all API test suites
import './referrals.test'
import './visits.test'
import './admissions.test'
import './evv.test'
import './timesheets.test'
import './payroll.test'
import './webhooks.test'
import './files.test'

describe('All API Endpoints', () => {
  // This file aggregates all API tests
  // Individual test files are imported above
})

