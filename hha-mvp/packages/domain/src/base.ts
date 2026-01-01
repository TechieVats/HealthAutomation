import { z } from 'zod'

// Base Zod types
export const IdSchema = z.string().cuid()
export type Id = z.infer<typeof IdSchema>

export const DateStrSchema = z.string().datetime()
export type DateStr = z.infer<typeof DateStrSchema>

export const EmailSchema = z.string().email()
export type Email = z.infer<typeof EmailSchema>

