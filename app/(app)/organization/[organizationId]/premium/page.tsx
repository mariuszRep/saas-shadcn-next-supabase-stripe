import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

interface PremiumPageProps {
  params: Promise<{
    organizationId: string
  }>
}

export default async function PremiumPage(props: PremiumPageProps) {
  const params = await props.params
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="default" className="text-sm px-3 py-1">
            Premium Content
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Premium Features
          </h1>
          <p className="text-lg text-muted-foreground">
            This page is only accessible to organizations with an active subscription.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle>Advanced Analytics</CardTitle>
              </div>
              <CardDescription>
                Access detailed reports and insights about your organization's performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View comprehensive dashboards, export data, and track metrics over time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle>Priority Support</CardTitle>
              </div>
              <CardDescription>
                Get help from our support team within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access to dedicated support channels and faster response times.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle>Custom Integrations</CardTitle>
              </div>
              <CardDescription>
                Connect with third-party services and automate workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Build custom integrations using our API and webhooks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle>Team Collaboration</CardTitle>
              </div>
              <CardDescription>
                Invite unlimited team members and manage permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced role-based access control and team management features.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Subscription Status: Active</CardTitle>
            <CardDescription>
              Your organization has access to all premium features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This page demonstrates subscription-based access control. Users without an
              active subscription will be redirected to the billing page when attempting
              to access premium routes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
