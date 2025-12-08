import Stripe from 'stripe'
import { CheckoutSessionResult } from './payment-service'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Subscription Service - Business logic layer for Stripe subscriptions
 * Handles subscription checkout session creation with organization linking
 * and Customer Portal session management
 */

/**
 * Initialize Stripe instance with secret key
 */
function getStripeInstance(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  })
}

export interface SubscriptionCheckoutParams {
  priceId: string
  orgId: string
  orgName: string
  userEmail: string
}

/**
 * Create a Stripe Checkout Session for subscription with organization linking
 * Creates or retrieves Stripe Customer with org_id in metadata
 */
export async function createSubscriptionCheckoutSession(
  params: SubscriptionCheckoutParams
): Promise<CheckoutSessionResult> {
  try {
    const stripe = getStripeInstance()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Find or create Stripe Customer with org_id in metadata
    let customerId: string

    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: params.userEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id

      // Update customer metadata to include org_id if not present
      const customer = existingCustomers.data[0]
      if (!customer.metadata.org_id) {
        await stripe.customers.update(customerId, {
          metadata: {
            org_id: params.orgId,
            org_name: params.orgName,
          },
        })
      }
    } else {
      // Create new customer with org metadata
      const customer = await stripe.customers.create({
        email: params.userEmail,
        metadata: {
          org_id: params.orgId,
          org_name: params.orgName,
        },
      })
      customerId = customer.id
    }

    // Create Checkout Session in subscription mode
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          org_id: params.orgId,
          org_name: params.orgName,
        },
      },
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription/test`,
    })

    if (!session.url) {
      return { error: 'Failed to create checkout session URL' }
    }

    return { url: session.url }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { error: `Failed to create subscription checkout session: ${message}` }
  }
}

export interface CustomerPortalParams {
  orgId: string
  returnUrl: string
}

/**
 * Create a Stripe Customer Portal Session for subscription management
 * Retrieves the Stripe customer_id from subscriptions table and creates portal session
 */
export async function createCustomerPortalSession(
  params: CustomerPortalParams
): Promise<CheckoutSessionResult> {
  try {
    const stripe = getStripeInstance()
    const supabase = createServiceRoleClient()

    // Query subscriptions table for stripe_customer_id by org_id
    const { data: subscription, error: queryError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, status')
      .eq('org_id', params.orgId)
      .single()

    if (queryError || !subscription) {
      return {
        error: 'No active subscription found. Please create a subscription first.'
      }
    }

    // Create Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: params.returnUrl,
    })

    if (!session.url) {
      return { error: 'Failed to create portal session URL' }
    }

    return { url: session.url }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { error: `Failed to create customer portal session: ${message}` }
  }
}
