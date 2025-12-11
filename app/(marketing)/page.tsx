import { HeroSection } from '@/features/marketing/components/hero-section'
import { FeaturesSection } from '@/features/marketing/components/features-section'
import { PlansSection } from '@/features/marketing/components/plans-section'
import { ContactSection } from '@/features/marketing/components/contact-section'
import { fetchStripePricing } from '@/config/stripe'

export const metadata = {
  title: 'SaaS Template - Build Your SaaS Faster with Next.js, Supabase & Stripe',
  description:
    'A complete multi-tenant SaaS platform with authentication, subscriptions, and modern UI. Launch your product in days, not months.',
}

export default async function Home() {
  // Fetch both monthly and annual pricing from Stripe API
  const monthlyPlans = await fetchStripePricing('month')
  const annualPlans = await fetchStripePricing('year')

  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PlansSection monthlyPlans={monthlyPlans} annualPlans={annualPlans} />
      <ContactSection />
    </main>
  )
}
