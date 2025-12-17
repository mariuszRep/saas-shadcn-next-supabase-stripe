import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getPostAuthRedirectPath } from '@/services/auth-service'
import { InvitationService } from '@/services/invitation-service'

/**
 * Validates that a redirect path is safe (relative path only)
 * Prevents open redirect vulnerabilities
 */
function isValidRedirectPath(path: string): boolean {
  // Must start with / but not //
  if (!path.startsWith('/') || path.startsWith('//')) {
    return false
  }

  // Must not contain protocol (no absolute URLs)
  if (path.includes('://')) {
    return false
  }

  // Must not contain backslashes (windows path separator)
  if (path.includes('\\')) {
    return false
  }

  return true
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_description = searchParams.get('error_description')

  // Check if this is from email verification during onboarding or password recovery
  const isOnboarding = searchParams.get('type') === 'onboarding'
  const nextParam = searchParams.get('next') ?? (isOnboarding ? '/onboarding?verified=true' : '/organizations')

  // Password recovery can be detected by type=recovery param or by checking the next param points to reset-password
  const typeParam = searchParams.get('type')
  const isRecovery = typeParam === 'recovery' || typeParam === 'recovery_confirmation' || nextParam === '/reset-password'
  const defaultNext = isOnboarding ? '/onboarding?verified=true' : '/organizations'

  // Validate and sanitize redirect path
  const next = isValidRedirectPath(nextParam) ? nextParam : defaultNext

  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH CALLBACK] All params:', Object.fromEntries(searchParams.entries()))
    console.log('[AUTH CALLBACK]', { code: code?.substring(0, 20) + '...', error_description, next, origin, isRecovery })
  }

  // Handle Supabase auth errors (like expired OTP)
  if (error_description) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH CALLBACK] Error from Supabase:', error_description)
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description)}`
    )
  }

  // Create Supabase client
  const supabase = await createClient()

  // Handle OAuth code exchange flow
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH CALLBACK] Session exchange failed:', error)
      }
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH CALLBACK] OAuth code exchange successful')
    }
  }

  // Check if we have a valid session (either from code exchange or PKCE flow from magic links)
  const { data: { user } } = await supabase.auth.getUser()

  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH CALLBACK] User:', user ? `${user.email} (${user.id})` : 'NULL')
  }

  if (!user) {
    // No session established
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH CALLBACK] No user session found')
    }
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
  }

  // Determine redirect path based on user state and auth type
  let redirectPath: string

  // For password recovery, always use the provided next parameter (typically /reset-password)
  // Skip invitation checks as user needs to complete password reset first
  if (isRecovery) {
    redirectPath = next
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH CALLBACK] Password recovery flow, redirecting to:', redirectPath)
    }
  } else {
    // Check if user has pending invitations
    // If they do, always redirect to /organizations to show pending invitation state
    const invitationService = new InvitationService(supabase)
    const pendingInvitations = await invitationService.getPendingInvitations(user.id)
    const hasPendingInvitations = pendingInvitations && pendingInvitations.length > 0

    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH CALLBACK] Pending invitations:', hasPendingInvitations ? pendingInvitations.length : 0)
    }

    // If user has pending invitations, always redirect to /organizations to show them
    // Otherwise, if 'next' param was provided (e.g., from invitation), use it
    // Otherwise, use the smart redirect logic
    // Pass the supabase client to ensure it uses the session we just established
    if (hasPendingInvitations) {
      redirectPath = '/organizations'
    } else {
      redirectPath = nextParam ? next : await getPostAuthRedirectPath(supabase)
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH CALLBACK] Authentication successful, redirecting to:', redirectPath)
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${redirectPath}`)
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
  } else {
    return NextResponse.redirect(`${origin}${redirectPath}`)
  }
}
