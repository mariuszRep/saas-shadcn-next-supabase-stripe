import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContentWrapper } from '@/components/layout/content-wrapper'
import { RolesList } from '@/features/roles/components/roles-list'

interface RolesPageProps {
  params: Promise<{ organizationId: string }>
}

export default async function RolesPage({ params }: RolesPageProps) {
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
      <RolesList organizationId={organizationId} />
    </ContentWrapper>
  )
}
