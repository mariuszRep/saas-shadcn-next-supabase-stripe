'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { RoleService } from '@/services/role-service'
import { handleRLSError } from '@/lib/errors'
import type { CreateRoleInput, UpdateRoleInput, Role } from '@/types/roles'

// =====================================================
// ROLE MANAGEMENT ACTIONS
// =====================================================

/**
 * Create a new role
 * @param data - Role creation input
 * @returns Success result with created role or error
 */
export async function createRole(data: CreateRoleInput): Promise<{
  success: boolean
  role?: Role
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Create role - RLS handles authorization
    const roleService = new RoleService(supabase)
    const result = await roleService.createRole(data)

    if (result.success) {
      revalidatePath('/settings')
      revalidatePath(`/organizations/${data.org_id}`)
      return result
    }

    return { success: false, error: handleRLSError(result.error) }
  } catch (error) {
    console.error('Unexpected error creating role:', error)
    return { success: false, error: handleRLSError(error) }
  }
}

/**
 * Update an existing role
 * @param id - Role ID
 * @param data - Role update input
 * @returns Success result with updated role or error
 */
export async function updateRole(id: string, data: UpdateRoleInput): Promise<{
  success: boolean
  role?: Role
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get role org_id for path revalidation
    const { data: role } = await supabase
      .from('roles')
      .select('org_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    // Update role - RLS handles authorization
    const roleService = new RoleService(supabase)
    const result = await roleService.updateRole(id, data)

    if (result.success && role?.org_id) {
      revalidatePath('/settings')
      revalidatePath(`/organizations/${role.org_id}`)
      return result
    }

    if (!result.success) {
      return { success: false, error: handleRLSError(result.error) }
    }

    return result
  } catch (error) {
    console.error('Unexpected error updating role:', error)
    return { success: false, error: handleRLSError(error) }
  }
}

/**
 * Delete a role (soft delete)
 * @param id - Role ID
 * @returns Success result or error
 */
export async function deleteRole(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get role org_id for path revalidation
    const { data: role } = await supabase
      .from('roles')
      .select('org_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    // Check if role is in use (business logic constraint, not authorization)
    const { data: permissionsCheck, error: checkError } = await supabase
      .from('permissions')
      .select('id')
      .eq('role_id', id)
      .is('deleted_at', null)
      .limit(1)

    if (checkError) {
      return { success: false, error: handleRLSError(checkError) }
    }

    if (permissionsCheck && permissionsCheck.length > 0) {
      return { success: false, error: 'Cannot delete role that is currently assigned to users' }
    }

    // Delete role - RLS handles authorization
    const roleService = new RoleService(supabase)
    const result = await roleService.deleteRole(id)

    if (result.success && role?.org_id) {
      revalidatePath('/settings')
      revalidatePath(`/organizations/${role.org_id}`)
      return result
    }

    if (!result.success) {
      return { success: false, error: handleRLSError(result.error) }
    }

    return result
  } catch (error) {
    return { success: false, error: handleRLSError(error) }
  }
}

/**
 * Get all roles (system-wide and org-specific)
 * @param orgId - Optional organization ID to filter roles
 * @returns Success result with roles array or error
 */
export async function getAllRoles(orgId?: string): Promise<{
  success: boolean
  roles?: Role[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Use role service to fetch roles
    const roleService = new RoleService(supabase)
    const result = await roleService.getRoles(orgId)

    if (!result.success) {
      return { success: false, error: 'Failed to fetch roles' }
    }

    return { success: true, roles: result.roles }
  } catch (error) {
    console.error('Unexpected error fetching roles:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
