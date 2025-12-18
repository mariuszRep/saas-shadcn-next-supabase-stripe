import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContentWrapper } from '@/components/layout/content-wrapper'

interface GeneralProfilePageProps {
  params: Promise<{ organizationId: string }>
}

export default async function GeneralProfilePage({ params }: GeneralProfilePageProps) {
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
        <h2 className="text-xl font-semibold">Organization Profile</h2>
        <p className="text-muted-foreground">
          Manage your organization's profile settings and information.
        </p>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Organization profile settings will be implemented here.
          </p>
        </div>
      </div>
    </ContentWrapper>
  )
}
