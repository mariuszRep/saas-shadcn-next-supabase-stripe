import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContentWrapper } from '@/components/layout/content-wrapper'
import { InvitationsList } from '@/features/invitations/components/invitations-list'

interface InvitationsPageProps {
  params: Promise<{ organizationId: string }>
}

export default async function InvitationsPage({ params }: InvitationsPageProps) {
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
      <InvitationsList organizationId={organizationId} />
    </ContentWrapper>
  )
}
