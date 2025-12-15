import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContentWrapper } from '@/components/layout/content-wrapper'
import { WorkspaceManager } from '@/features/workspaces/components/workspace-manager'
import { getUserOrganizations } from '@/features/organizations/organization-actions'

interface WorkspacesPageProps {
  params: Promise<{ organizationId: string }>
}

export default async function WorkspacesPage({ params }: WorkspacesPageProps) {
  const { organizationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getUserOrganizations()
  const organization = result.organizations?.find(org => org.id === organizationId)

  if (!organization) {
    redirect('/organizations')
  }

  return (
    <ContentWrapper variant="full">
      <WorkspaceManager
        organizationId={organizationId}
        organizationName={organization.name}
      />
    </ContentWrapper>
  )
}
