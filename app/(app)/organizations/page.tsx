import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrganizationService } from '@/services/organization-service'
import { InvitationService } from '@/services/invitation-service'
import { OrganizationCard } from '@/features/organizations/components/organization-card'
import { OrganizationListClient } from '@/features/organizations/components/organization-list-client'
import { Building2 } from 'lucide-react'

export default async function OrganizationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const organizationService = new OrganizationService(supabase)
  const invitationService = new InvitationService(supabase)

  const [memberOrganizations, pendingInvitations] = await Promise.all([
    organizationService.getUserOrganizations(),
    invitationService.getPendingInvitations(user.id),
  ])

  // Create a map for quick lookup of member organizations
  const memberOrgMap = new Map(memberOrganizations.map(org => [org.id, org]))

  // Create a map for quick lookup of pending invitations, prioritizing the invitation info
  const invitationOrgMap = new Map()
  
  // Collect org IDs that need to be fetched directly
  const orgIdsToFetch = new Set<string>()
  
  for (const inv of pendingInvitations) {
    let orgDetails = inv.organizations as any

    // Fallback: If join failed (e.g. RLS issue) but we have the org in memberOrganizations
    if (!orgDetails && inv.org_id && memberOrgMap.has(inv.org_id)) {
      const memberOrg = memberOrgMap.get(inv.org_id)
      if (memberOrg) {
        orgDetails = {
          id: memberOrg.id,
          name: memberOrg.name,
          created_at: memberOrg.created_at,
        }
      }
    }

    // Collect org IDs that need direct fetching
    if (!orgDetails && inv.org_id) {
      orgIdsToFetch.add(inv.org_id)
    }

    if (orgDetails) {
      invitationOrgMap.set(orgDetails.id, {
        id: orgDetails.id,
        name: orgDetails.name,
        created_at: orgDetails.created_at,
        invitation: {
          invitationId: inv.id,
          expiresAt: inv.expires_at,
        },
      })
    }
  }

  // Batch fetch organizations that weren't found via join or member map
  if (orgIdsToFetch.size > 0) {
    const { data: directOrgs } = await supabase
      .from('organizations')
      .select('id, name, created_at')
      .in('id', Array.from(orgIdsToFetch))
    
    const directOrgMap = new Map(directOrgs?.map(org => [org.id, org]) || [])
    
    // Process invitations that needed direct org fetching
    for (const inv of pendingInvitations) {
      if (inv.org_id && !invitationOrgMap.has(inv.org_id)) {
        const directOrg = directOrgMap.get(inv.org_id)
        if (directOrg) {
          invitationOrgMap.set(directOrg.id, {
            id: directOrg.id,
            name: directOrg.name,
            created_at: directOrg.created_at,
            invitation: {
              invitationId: inv.id,
              expiresAt: inv.expires_at,
            },
          })
        }
      }
    }
  }

  // Combine both lists, giving precedence to invitations if an organization has both
  const combinedOrganizations: any[] = []
  const processedOrgIds = new Set<string>()

  // Add organizations with pending invitations first
  for (const [orgId, org] of invitationOrgMap) {
    combinedOrganizations.push(org)
    processedOrgIds.add(orgId)
  }

  // Add member organizations that don't have pending invitations
  for (const org of memberOrganizations) {
    if (!processedOrgIds.has(org.id)) {
      combinedOrganizations.push({
        id: org.id,
        name: org.name,
        created_at: org.created_at,
      })
      processedOrgIds.add(org.id)
    }
  }

  // Sort by created_at in descending order (newest first)
  combinedOrganizations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Get member and workspace counts for all combined organizations
  const orgIds = combinedOrganizations.map(org => org.id)

  const { data: memberCounts } = await supabase
    .from('permissions')
    .select('org_id')
    .eq('object_type', 'organization')
    .in('org_id', orgIds)

  const { data: workspaceCounts } = await supabase
    .from('workspaces')
    .select('organization_id')
    .in('organization_id', orgIds)

  const { data: rolesData } = await supabase
    .from('organization_roles')
    .select('id, name, description')

  const rolesMap = new Map(rolesData?.map(role => [role.id, role]) || [])

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
  const organizationsData = combinedOrganizations.map((org) => {
    const isMember = memberOrgMap.has(org.id)
    const invitationInfo = org.invitation // Check if the combined org already has invitation info

    let roleName = undefined
    let roleDescription = undefined

    if (invitationInfo) {
      // Find the role associated with the invitation from the member organizations
      // Note: memberOrg may not have roles property, so we'll skip role assignment for now
      // This can be enhanced later when role data is properly fetched
      const memberOrg = memberOrgMap.get(org.id)
      // TODO: Fetch role information properly when needed
      // if (memberOrg && memberOrg.roles && memberOrg.roles.length > 0) {
      //   const primaryRole = rolesMap.get(memberOrg.roles[0].organization_role_id)
      //   if (primaryRole) {
      //     roleName = primaryRole.name
      //     roleDescription = primaryRole.description
      //   }
      // }
    }

    return {
      id: org.id,
      name: org.name,
      memberCount: memberCountMap.get(org.id) || 0,
      workspaceCount: workspaceCountMap.get(org.id) || 0,
      isMember, // Indicate if the user is a member
      invitation: invitationInfo ? {
        invitationId: invitationInfo.invitationId,
        roleName: roleName, // Populate role name for invitation card
        roleDescription: roleDescription, // Populate role description for invitation card
        expiresAt: invitationInfo.expiresAt,
      } : undefined,
    }
  })

  return (
    <OrganizationListClient organizations={organizationsData} />
  )
}
