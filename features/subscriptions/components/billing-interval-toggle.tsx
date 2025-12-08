'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export type BillingInterval = 'month' | 'year'

interface BillingIntervalToggleProps {
  defaultInterval?: BillingInterval
  onIntervalChange?: (interval: BillingInterval) => void
}

/**
 * Billing Interval Toggle
 * Switch between monthly and annual billing
 */
export function BillingIntervalToggle({
  defaultInterval = 'month',
  onIntervalChange,
}: BillingIntervalToggleProps) {
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval)

  const handleToggle = (newInterval: BillingInterval) => {
    setInterval(newInterval)
    onIntervalChange?.(newInterval)
  }

  return (
    <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={interval === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToggle('month')}
        className="min-w-[100px]"
      >
        Monthly
      </Button>
      <Button
        variant={interval === 'year' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToggle('year')}
        className="min-w-[100px] relative"
      >
        Annual
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          Save 20%
        </span>
      </Button>
    </div>
  )
}
