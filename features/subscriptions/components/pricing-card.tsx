'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type PricingPlan, formatPrice } from '@/config/stripe'
import { createSubscriptionCheckoutWithPrice } from '../subscription-actions'

interface PricingCardProps {
  plan: PricingPlan
  currentPlanId?: string
}

/**
 * Pricing Card Component
 * Displays subscription plan details with features and subscribe button
 * Uses shadcn/ui Card primitives for consistent styling
 */
export function PricingCard({ plan, currentPlanId }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isCurrentPlan = currentPlanId === plan.id

  const handleSubscribe = async () => {
    if (isCurrentPlan) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await createSubscriptionCheckoutWithPrice(plan.priceId)

      if (result?.error) {
        setError(result.error)
      }
      // If successful, the Server Action will redirect to Stripe Checkout
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={plan.highlighted ? 'border-primary shadow-lg relative' : ''}>
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Most Popular</Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
            <span className="text-muted-foreground">/{plan.interval}</span>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan}
          className="w-full"
          variant={plan.highlighted ? 'default' : 'outline'}
          size="lg"
        >
          {isLoading
            ? 'Loading...'
            : isCurrentPlan
            ? 'Current Plan'
            : plan.cta}
        </Button>
      </CardFooter>
    </Card>
  )
}
