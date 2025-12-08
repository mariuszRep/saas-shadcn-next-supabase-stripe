'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { createCustomerPortalSession } from '../subscription-actions'

/**
 * Customer Portal Access Button
 * Redirects users to Stripe Customer Portal for subscription management
 */
export function CustomerPortalButton() {
  const [isPending, startTransition] = useTransition()

  const handleAccessPortal = () => {
    startTransition(async () => {
      const result = await createCustomerPortalSession()

      if (result?.error) {
        // In a production app, show a toast notification
        console.error('Portal access error:', result.error)
        alert(result.error)
      }
      // If successful, the Server Action will redirect
    })
  }

  return (
    <Button
      onClick={handleAccessPortal}
      disabled={isPending}
      variant="outline"
      className="w-full"
    >
      {isPending ? 'Loading...' : 'Manage Subscription (Customer Portal)'}
    </Button>
  )
}
