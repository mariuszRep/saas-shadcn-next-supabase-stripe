import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionTestForm } from '@/features/subscriptions/components/subscription-test-form'
import { CustomerPortalButton } from '@/features/subscriptions/components/customer-portal-button'

export default async function SubscriptionTestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Stripe Subscription Test</h1>
          <p className="text-muted-foreground">
            Test the Stripe subscription integration by creating a subscription checkout session
          </p>
        </div>

        <SubscriptionTestForm />

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or manage existing subscription
              </span>
            </div>
          </div>

          <CustomerPortalButton />
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <h3 className="font-medium">Testing Instructions:</h3>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm mb-1">Creating a Subscription:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click "Create Subscription Checkout" button</li>
                <li>You'll be redirected to Stripe's hosted checkout page</li>
                <li>Use test card: 4242 4242 4242 4242</li>
                <li>Use any future expiry date and any 3-digit CVC</li>
                <li>Complete the test subscription</li>
                <li>You'll be redirected to the success page</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-sm mb-1">Managing Subscription (Customer Portal):</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>After creating a subscription, click "Manage Subscription" button</li>
                <li>You'll be redirected to Stripe Customer Portal</li>
                <li>Test updating payment method with card: 4000 0025 0000 3155</li>
                <li>Test canceling subscription (sets cancel_at_period_end flag)</li>
                <li>Verify subscription remains active until period ends</li>
                <li>Check webhook logs for customer.subscription.updated events</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-4 space-y-2">
          <h3 className="font-medium text-blue-900 dark:text-blue-100">How It Works:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Your subscription is linked to your organization</li>
            <li>Customer and subscription metadata include your org_id</li>
            <li>Webhooks will notify your app of subscription events</li>
            <li>You can track subscription status in Stripe dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
