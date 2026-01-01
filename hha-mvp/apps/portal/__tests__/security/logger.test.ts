import { describe, it, expect, vi } from 'vitest'
import { logger } from '@/lib/security/logger'

describe('Redacting Logger', () => {
  it('should reject logs containing MRN patterns', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn')
    logger.info('Patient MRN-123456 admitted')
    expect(consoleWarnSpy).toHaveBeenCalledWith('[LOGGER] Rejected log entry containing potential PHI')
    consoleWarnSpy.mockRestore()
  })

  it('should reject logs containing email patterns', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn')
    logger.info('Sent email to patient@example.com')
    expect(consoleWarnSpy).toHaveBeenCalledWith('[LOGGER] Rejected log entry containing potential PHI')
    consoleWarnSpy.mockRestore()
  })

  it('should reject logs containing DOB patterns', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn')
    logger.info('Patient DOB: 01/15/1980')
    expect(consoleWarnSpy).toHaveBeenCalledWith('[LOGGER] Rejected log entry containing potential PHI')
    consoleWarnSpy.mockRestore()
  })

  it('should allow safe logs', () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    logger.info('Visit status updated', { status: 'completed', visitId: 'visit-123' })
    expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] Visit status updated', { status: 'completed', visitId: 'visit-123' })
    consoleLogSpy.mockRestore()
  })
})


