/**
 * Stripe Configuration
 * Utilities for formatting and working with Stripe pricing data
 */

import Stripe from 'stripe'

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  priceId: string
  features: string[]
  highlighted?: boolean
  cta: string
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(price)
}

/**
 * Fetch pricing plans from Stripe API
 * Retrieves active prices with product information
 * @param interval - Filter by billing interval ('month' or 'year'), or 'all' for both
 */
export async function fetchStripePricing(
  interval: 'month' | 'year' | 'all' = 'all'
): Promise<PricingPlan[]> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
  })

  // Fetch all active prices with product expansion
  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product'],
  })

  // Transform Stripe prices to PricingPlan format
  const plans: PricingPlan[] = prices.data
    .filter((price) => {
      // Only include recurring prices
      if (price.type !== 'recurring') return false

      // Filter by interval if specified
      if (interval === 'all') return true
      return price.recurring?.interval === interval
    })
    .map((price) => {
      const product = price.product as Stripe.Product
      const metadata = product.metadata || {}

      // Parse features from metadata (comma-separated string or array)
      let features: string[] = []
      if (metadata.features) {
        try {
          // Try parsing as JSON array first
          features = JSON.parse(metadata.features)
        } catch {
          // Fall back to comma-separated string
          features = metadata.features.split(',').map(f => f.trim())
        }
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        currency: price.currency,
        interval: price.recurring?.interval as 'month' | 'year',
        priceId: price.id,
        features,
        highlighted: metadata.highlighted === 'true',
        cta: metadata.cta || 'Start Free Trial',
      }
    })
    // Sort by metadata.order or price
    .sort((a, b) => {
      const aProduct = prices.data.find(p => p.id === a.priceId)?.product as Stripe.Product
      const bProduct = prices.data.find(p => p.id === b.priceId)?.product as Stripe.Product
      const aOrder = parseInt(aProduct?.metadata?.order || '999')
      const bOrder = parseInt(bProduct?.metadata?.order || '999')
      return aOrder - bOrder
    })

  return plans
}
