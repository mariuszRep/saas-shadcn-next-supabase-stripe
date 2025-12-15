import { redirect } from 'next/navigation'

interface OrganizationPageProps {
  params: Promise<{ organizationId: string }>
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { organizationId } = await params

  // Redirect to settings since no dashboard exists yet
  redirect(`/organizations/${organizationId}/settings`)
}
