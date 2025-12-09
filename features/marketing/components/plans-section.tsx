import { PricingClient } from '@/app/(marketing)/plans/pricing-client'
import { type PricingPlan } from '@/config/stripe'

interface PlansSectionProps {
  monthlyPlans: PricingPlan[]
  annualPlans: PricingPlan[]
}

export function PlansSection({ monthlyPlans, annualPlans }: PlansSectionProps) {
  return (
    <section id="plans" className="scroll-mt-16 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent plans
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your team. Start with a 14-day free trial on any plan.
          </p>
        </div>

        {/* Client-side pricing with interval toggle */}
        <PricingClient monthlyPlans={monthlyPlans} annualPlans={annualPlans} />
      </div>
    </section>
  )
}
