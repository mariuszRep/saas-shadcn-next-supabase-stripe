import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrganizationCard } from '@/features/organizations/components/organization-card'
import { OrganizationListClient } from '@/features/organizations/components/organization-list-client'
import { Building2 } from 'lucide-react'

export default async function OrganizationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch organizations where user has permissions with LEFT JOIN on pending invitations
  const { data: userPermissions } = await supabase
    .from('permissions')
    .select(`
      org_id,
      role_id,
      organizations!inner(id, name, created_at),
      roles!inner(name, description)
    `)
    .eq('principal_id', user.id)
    .eq('object_type', 'organization')

  // Fetch pending invitations for this user
  const { data: pendingInvitations } = await supabase
    .from('invitations')
    .select('id, org_id, expires_at')
    .eq('user_id', user.id)
    .eq('status', 'pending')

  // Create invitation map by org_id
  const invitationMap = new Map(
    pendingInvitations?.map(inv => [inv.org_id, inv]) || []
  )

  // Extract unique organizations with invitation status
  const organizations = userPermissions?.map(perm => {
    const org = (perm.organizations as any)
    const role = (perm.roles as any)
    const invitation = invitationMap.get(perm.org_id)

    return {
      id: org.id,
      name: org.name,
      created_at: org.created_at,
      roleName: role?.name,
      roleDescription: role?.description,
      invitation: invitation ? {
        invitationId: invitation.id,
        expiresAt: invitation.expires_at,
      } : undefined,
    }
  }) || []

  // Remove duplicates and sort
  const uniqueOrganizations = Array.from(
    new Map(organizations.map(org => [org.id, org])).values()
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Get member and workspace counts for all organizations
  const orgIds = uniqueOrganizations.map(org => org.id)

  const { data: memberCounts } = await supabase
    .from('permissions')
    .select('org_id')
    .eq('object_type', 'organization')
    .in('org_id', orgIds)

  const { data: workspaceCounts } = await supabase
    .from('workspaces')
    .select('organization_id')
    .in('organization_id', orgIds)

  // Create count maps
  const memberCountMap = new Map<string, number>()
  memberCounts?.forEach(m => {
    memberCountMap.set(m.org_id, (memberCountMap.get(m.org_id) || 0) + 1)
  })

  const workspaceCountMap = new Map<string, number>()
  workspaceCounts?.forEach(w => {
    workspaceCountMap.set(w.organization_id, (workspaceCountMap.get(w.organization_id) || 0) + 1)
  })

  // Prepare organization data for client component
  const organizationsData = uniqueOrganizations.map((org) => {
    return {
      id: org.id,
      name: org.name,
      memberCount: memberCountMap.get(org.id) || 0,
      workspaceCount: workspaceCountMap.get(org.id) || 0,
      invitation: org.invitation ? {
        invitationId: org.invitation.invitationId,
        roleName: org.roleName,
        roleDescription: org.roleDescription,
        expiresAt: org.invitation.expiresAt,
      } : undefined,
    }
  })

  return (
    <OrganizationListClient organizations={organizationsData} />
  )
}
