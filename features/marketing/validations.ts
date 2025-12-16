import { z } from 'zod'

/**
 * Name validation schema
 * - Must be 2-100 characters
 * - Required for contact forms
 */
export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')

/**
 * Email validation schema
 * - Must be a valid email format
 * - Maximum 320 characters (RFC 5321)
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(320, 'Email is too long (maximum 320 characters)')
  .email('Please enter a valid email address')

/**
 * Subject validation schema
 * - Required for contact forms
 * - 3-200 characters
 */
export const subjectSchema = z
  .string()
  .trim()
  .min(3, 'Subject must be at least 3 characters')
  .max(200, 'Subject must be less than 200 characters')

/**
 * Message validation schema
 * - Must be 10-1000 characters
 */
export const messageSchema = z
  .string()
  .trim()
  .min(10, 'Message must be at least 10 characters long')
  .max(1000, 'Message must be less than 1000 characters')

/**
 * Phone number validation schema
 * - Optional
 * - International format
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .optional()

/**
 * Company name validation schema
 * - Optional
 * - 2-100 characters when provided
 */
export const companySchema = z
  .string()
  .trim()
  .min(2, 'Company name must be at least 2 characters')
  .max(100, 'Company name must be less than 100 characters')
  .optional()

/**
 * Contact form submission validation schema
 */
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: subjectSchema,
  message: messageSchema,
  phone: phoneSchema,
  company: companySchema,
})

/**
 * Newsletter subscription validation schema
 */
export const newsletterSubscriptionSchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().trim().min(1, 'Last name is required').max(50).optional(),
})

/**
 * Demo request validation schema
 */
export const demoRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  company: companySchema,
  phone: phoneSchema,
  message: messageSchema.optional(),
})

/**
 * Quote request validation schema
 */
export const quoteRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  company: z.string().trim().min(2, 'Company name is required').max(100),
  phone: phoneSchema,
  projectDescription: z
    .string()
    .trim()
    .min(20, 'Please provide at least 20 characters describing your project')
    .max(2000, 'Description must be less than 2000 characters'),
  budget: z.enum(['<10k', '10k-50k', '50k-100k', '100k+'], {
    errorMap: () => ({ message: 'Please select a budget range' }),
  }).optional(),
})

// Export types
export type ContactFormInput = z.infer<typeof contactFormSchema>
export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>
export type DemoRequestInput = z.infer<typeof demoRequestSchema>
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>
