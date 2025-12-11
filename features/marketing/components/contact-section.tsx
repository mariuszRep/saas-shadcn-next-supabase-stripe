import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-16 py-16 sm:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Still have questions?
            </h2>
            <p className="text-lg text-muted-foreground">
              Contact our sales team for custom enterprise solutions
            </p>
          </div>

          <div className="pt-4">
            <Button asChild size="lg">
              <a href="mailto:sales@yourcompany.com">
                <Mail className="h-5 w-5" />
                <span>sales@yourcompany.com</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
