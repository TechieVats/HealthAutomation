import { z } from 'zod'
import { IdSchema, DateStrSchema } from './base'

export const RoleSchema = z.enum(['RN', 'LPN', 'CNA', 'PT', 'OT', 'MSW', 'ST', 'Admin', 'HR'])
export type Role = z.infer<typeof RoleSchema>

export const EmployeeSchema = z.object({
  id: IdSchema,
  name: z.string(),
  role: RoleSchema,
  licenseNo: z.string().optional(),
  licenseExpiry: DateStrSchema.optional(),
})

export type Employee = z.infer<typeof EmployeeSchema>

export const EmployeeCreateSchema = EmployeeSchema.omit({ id: true })

export function factoryEmployee(): z.infer<typeof EmployeeCreateSchema> {
  const firstNames = ['Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Christopher', 'Amanda', 'Daniel']
  const lastNames = ['Johnson', 'Chen', 'Rodriguez', 'Kim', 'Martinez', 'Anderson', 'Taylor', 'Wilson']
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const name = `${firstName} ${lastName}`
  
  const roles: Role[] = ['RN', 'LPN', 'CNA', 'PT', 'OT', 'MSW']
  const role = roles[Math.floor(Math.random() * roles.length)]
  
  // Generate license if it's a licensed role
  const licensedRoles: Role[] = ['RN', 'LPN', 'PT', 'OT', 'MSW']
  const licenseNo = licensedRoles.includes(role)
    ? `LIC-${role}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    : undefined
  
  // License expiry 1-3 years from now
  const licenseExpiry = licenseNo
    ? (() => {
        const expiry = new Date()
        expiry.setFullYear(expiry.getFullYear() + Math.floor(Math.random() * 3) + 1)
        return expiry.toISOString()
      })()
    : undefined
  
  return {
    name,
    role,
    licenseNo,
    licenseExpiry,
  }
}

