import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganizations } from '@/features/organizations/organization-actions'
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { SettingsSidebar } from '@/features/settings/components/settings-sidebar'
import { SettingsBreadcrumbs } from '@/features/settings/components/settings-breadcrumbs'
import { Skeleton } from '@/components/ui/skeleton'

interface SettingsLayoutProps {
  children: React.ReactNode
  params: Promise<{ organizationId: string }>
}

async function SettingsSidebarWrapper({ organizationId }: { organizationId: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getUserOrganizations()

  if (!result.success || !result.organizations) {
    return null
  }

  const userData = {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url || '',
  }

  return (
    <SettingsSidebar
      organizations={result.organizations}
      selectedOrgId={organizationId}
      user={userData}
    />
  )
}

function SettingsLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex w-full flex-col gap-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}

export default async function SettingsLayout({ children, params }: SettingsLayoutProps) {
  const { organizationId } = await params

  if (!organizationId) {
    redirect('/organizations')
  }

  return (
    <SidebarLayout
      sidebar={
        <Suspense fallback={<Skeleton className="h-screen w-64" />}>
          <SettingsSidebarWrapper organizationId={organizationId} />
        </Suspense>
      }
      header={<SettingsBreadcrumbs />}
    >
      <Suspense fallback={<SettingsLoading />}>
        {children}
      </Suspense>
    </SidebarLayout>
  )
}
