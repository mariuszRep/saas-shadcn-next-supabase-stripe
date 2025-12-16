'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PermissionsService } from '@/services/permission-service'
import { handleRLSError } from '@/lib/errors'
import type {
    PrincipalType,
    ObjectType,
    PermissionAction,
    Permission,
    Role,
} from '@/types/database'
import type {
    AssignRoleParams,
    CheckPermissionParams,
    PermissionWithDetails,
} from '@/types/permissions'

// =====================================================
// ASSIGN ROLE
// =====================================================

export async function assignRole(params: AssignRoleParams): Promise<{
    success: boolean
    permission?: Permission
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Business logic validation only
        if (params.principal_type !== 'user') {
            return { success: false, error: 'Only user principal type is currently supported' }
        }

        // Initialize service
        const permissionsService = new PermissionsService(supabase)

        // Check for duplicate permission (better UX than constraint error)
        const duplicateResult = await permissionsService.checkDuplicatePermission(params)

        if (!duplicateResult.success) {
            return { success: false, error: duplicateResult.error }
        }

        if (duplicateResult.permission) {
            return { success: false, error: 'This permission already exists' }
        }

        // Create permission - RLS handles authorization
        const createResult = await permissionsService.createPermission(params, user.id)

        if (!createResult.success) {
            return { success: false, error: handleRLSError({ message: createResult.error }) }
        }

        revalidatePath('/settings')
        revalidatePath(`/organizations/${params.org_id}/settings`)

        return { success: true, permission: createResult.permission }
    } catch (error) {
        console.error('Unexpected error assigning role:', error)
        return { success: false, error: handleRLSError(error) }
    }
}

// =====================================================
// REVOKE ROLE
// =====================================================

export async function revokeRole(permission_id: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Initialize service
        const permissionsService = new PermissionsService(supabase)

        // Soft delete the permission
        const result = await permissionsService.softDeletePermission(permission_id, user.id)

        if (!result.success) {
            return { success: false, error: 'Failed to revoke role' }
        }

        // Revalidate relevant paths
        revalidatePath('/settings')

        return { success: true }
    } catch (error) {
        console.error('Unexpected error revoking role:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

// =====================================================
// GET OBJECT PERMISSIONS
// =====================================================

export async function getObjectPermissions(
    object_type: ObjectType,
    object_id: string
): Promise<{
    success: boolean
    permissions?: PermissionWithDetails[]
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Initialize service
        const permissionsService = new PermissionsService(supabase)

        // Fetch permissions with role and user details
        const result = await permissionsService.getPermissionsWithDetails(object_type, object_id)

        if (!result.success) {
            return { success: false, error: 'Failed to fetch permissions' }
        }

        return { success: true, permissions: result.permissions }
    } catch (error) {
        console.error('Unexpected error fetching permissions:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

// =====================================================
// GET ALL ORGANIZATION PERMISSIONS
// =====================================================

export async function getAllOrgPermissions(org_id: string): Promise<{
    success: boolean
    permissions?: PermissionWithDetails[]
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Initialize service
        const permissionsService = new PermissionsService(supabase)

        // Fetch ALL permissions for this organization (any object type)
        const result = await permissionsService.getAllOrgPermissionsWithDetails(org_id)

        if (!result.success) {
            return { success: false, error: 'Failed to fetch permissions' }
        }

        return { success: true, permissions: result.permissions }
    } catch (error) {
        console.error('Unexpected error fetching permissions:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

// =====================================================
// GET ORGANIZATION MEMBERS
// =====================================================

export async function getOrgMembers(org_id: string): Promise<{
    success: boolean
    members?: Array<{
        org_id: string
        user_id: string
        role_id: string
        role_name: string
        email?: string
        name?: string
    }>
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Initialize service
        const permissionsService = new PermissionsService(supabase)

        // Fetch organization members with user details
        const result = await permissionsService.getOrgMembersWithDetails(org_id)

        if (!result.success) {
            return { success: false, error: 'Failed to fetch organization members' }
        }

        return { success: true, members: result.members }
    } catch (error) {
        console.error('Unexpected error fetching organization members:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

// =====================================================
// GET WORKSPACE MEMBERS
// =====================================================

export async function getWorkspaceMembers(workspace_id: string): Promise<{
    success: boolean
    members?: Array<{
        workspace_id: string
        user_id: string
        role_id: string
        role_name: string
    }>
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Initialize service
        const permissionsService = new PermissionsService(supabase)

        // Fetch workspace members
        const result = await permissionsService.getWorkspaceMembersFormatted(workspace_id)

        if (!result.success) {
            return { success: false, error: 'Failed to fetch workspace members' }
        }

        return { success: true, members: result.members }
    } catch (error) {
        console.error('Unexpected error fetching workspace members:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

// =====================================================
// CHECK PERMISSION
// =====================================================

export async function checkPermission(params: CheckPermissionParams): Promise<{
    success: boolean
    hasPermission?: boolean
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Initialize service
        const permissionsService = new PermissionsService(supabase)

        // Check user permission
        const result = await permissionsService.checkUserPermission(params)

        if (!result.success) {
            return { success: false, error: 'Failed to check permission' }
        }

        return { success: true, hasPermission: result.hasPermission }
    } catch (error) {
        console.error('Unexpected error checking permission:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

// =====================================================
// GET USER ORGANIZATIONS
// =====================================================

export async function getUserOrganizations(): Promise<{
    success: boolean
    organizations?: Array<{ id: string; name: string }>
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Initialize service
        const permissionsService = new PermissionsService(supabase)

        // Get organizations where user has access
        const result = await permissionsService.getUserOrganizationsWithDetails()

        if (!result.success) {
            return { success: false, error: 'Failed to fetch organizations' }
        }

        return { success: true, organizations: result.organizations }
    } catch (error) {
        console.error('Unexpected error fetching organizations:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

// =====================================================
// GET ORGANIZATION WORKSPACES
// =====================================================

export async function getOrganizationWorkspaces(org_id: string): Promise<{
    success: boolean
    workspaces?: Array<{ id: string; name: string }>
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Initialize service
        const permissionsService = new PermissionsService(supabase)

        // Fetch workspaces for the organization
        const result = await permissionsService.getOrgWorkspaces(org_id)

        if (!result.success) {
            return { success: false, error: 'Failed to fetch workspaces' }
        }

        return { success: true, workspaces: result.workspaces }
    } catch (error) {
        console.error('Unexpected error fetching workspaces:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
