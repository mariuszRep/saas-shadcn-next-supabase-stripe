import { z } from 'zod'

/**
 * Amount validation schema
 * - Must be a positive number
 * - Represents amount in cents (smallest currency unit)
 */
export const amountSchema = z
  .number()
  .int('Amount must be an integer')
  .positive('Amount must be positive')
  .max(99999999, 'Amount is too large')

/**
 * Currency validation schema
 * - Must be a valid 3-letter ISO currency code
 */
export const currencySchema = z
  .string()
  .length(3, 'Currency must be a 3-letter ISO code')
  .toLowerCase()
  .regex(/^[a-z]{3}$/, 'Invalid currency code format')

/**
 * Stripe payment method ID validation schema
 * - Must start with "pm_"
 */
export const paymentMethodIdSchema = z
  .string()
  .min(1, 'Payment method ID is required')
  .startsWith('pm_', 'Invalid Stripe payment method ID format')

/**
 * Create checkout session validation schema
 */
export const createCheckoutSessionSchema = z.object({
  priceId: z.string().optional(),
  amount: amountSchema.optional(),
  currency: currencySchema.optional().default('usd'),
  successUrl: z.string().url('Invalid success URL format').optional(),
  cancelUrl: z.string().url('Invalid cancel URL format').optional(),
})

/**
 * Attach payment method validation schema
 */
export const attachPaymentMethodSchema = z.object({
  paymentMethodId: paymentMethodIdSchema,
  customerId: z
    .string()
    .min(1, 'Customer ID is required')
    .startsWith('cus_', 'Invalid Stripe customer ID format'),
})

/**
 * Detach payment method validation schema
 */
export const detachPaymentMethodSchema = z.object({
  paymentMethodId: paymentMethodIdSchema,
})

/**
 * Set default payment method validation schema
 */
export const setDefaultPaymentMethodSchema = z.object({
  paymentMethodId: paymentMethodIdSchema,
  customerId: z
    .string()
    .min(1, 'Customer ID is required')
    .startsWith('cus_', 'Invalid Stripe customer ID format'),
})

/**
 * Create payment intent validation schema
 */
export const createPaymentIntentSchema = z.object({
  amount: amountSchema,
  currency: currencySchema.default('usd'),
  paymentMethodId: paymentMethodIdSchema.optional(),
  customerId: z.string().optional(),
})

// Export types
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>
export type AttachPaymentMethodInput = z.infer<typeof attachPaymentMethodSchema>
export type DetachPaymentMethodInput = z.infer<typeof detachPaymentMethodSchema>
export type SetDefaultPaymentMethodInput = z.infer<typeof setDefaultPaymentMethodSchema>
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
