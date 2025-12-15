import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContentWrapper } from '@/components/layout/content-wrapper'

interface AccountSecurityPageProps {
  params: Promise<{ organizationId: string }>
}

export default async function AccountSecurityPage({ params }: AccountSecurityPageProps) {
  const { organizationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <ContentWrapper variant="narrow">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Account Security</h2>
        <p className="text-muted-foreground">
          Manage your account security settings and authentication.
        </p>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Account security settings will be implemented here.
          </p>
        </div>
      </div>
    </ContentWrapper>
  )
}
