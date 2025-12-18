/**
 * Error handling utilities for database and application errors
 */

/**
 * Utility to convert PostgreSQL RLS policy violations into user-friendly error messages
 *
 * This function handles common PostgreSQL error codes and converts them into
 * human-readable messages that can be displayed to users.
 *
 * @param error - The error object from Supabase or PostgreSQL
 * @returns A user-friendly error message
 */
export function handleRLSError(error: any): string {
  if (!error) return 'An unexpected error occurred'

  const errorMessage = error.message || ''
  const errorCode = error.code || ''

  // RLS policy violation (insufficient permissions)
  if (errorCode === '42501' || errorMessage.includes('policy')) {
    return 'You do not have permission to perform this action'
  }

  // Foreign key violation
  if (errorCode === '23503') {
    return 'This operation would violate data relationships'
  }

  // Unique constraint violation
  if (errorCode === '23505') {
    return 'This record already exists'
  }

  // Not null violation
  if (errorCode === '23502') {
    return 'Required field is missing'
  }

  // Check constraint violation
  if (errorCode === '23514') {
    return 'Data validation failed'
  }

  // Generic fallback
  return error.message || 'An unexpected error occurred'
}

/**
 * Utility to handle Supabase auth errors
 *
 * @param error - The auth error object from Supabase
 * @returns A user-friendly error message
 */
export function handleAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred'

  const errorMessage = error.message || ''

  // Invalid credentials
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password'
  }

  // User not found
  if (errorMessage.includes('User not found')) {
    return 'No account found with this email address'
  }

  // Email not confirmed
  if (errorMessage.includes('Email not confirmed')) {
    return 'Please confirm your email address before signing in'
  }

  // Password reset required
  if (errorMessage.includes('Password reset required')) {
    return 'Please reset your password to continue'
  }

  // Generic fallback
  return error.message || 'An unexpected authentication error occurred'
}
