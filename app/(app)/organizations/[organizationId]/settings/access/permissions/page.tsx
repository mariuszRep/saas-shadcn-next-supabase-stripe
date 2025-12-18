import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContentWrapper } from '@/components/layout/content-wrapper'
import { PermissionsList } from '@/features/permissions/components/permissions-list'

interface PermissionsPageProps {
  params: Promise<{ organizationId: string }>
}

export default async function PermissionsPage({ params }: PermissionsPageProps) {
  const { organizationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <ContentWrapper variant="full">
      <PermissionsList organizationId={organizationId} />
    </ContentWrapper>
  )
}
