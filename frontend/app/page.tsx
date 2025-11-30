import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="container max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Column - Hero Content */}
          <div className="animate-slide-up space-y-6">
            <div className="inline-block border-4 border-border bg-accent px-4 py-2 shadow-md">
              <span className="text-sm font-black uppercase tracking-wider text-accent-foreground">Free • Secure • Fast</span>
            </div>
            
            <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
              Track Your
              <br />
              <span className="mt-2 inline-block border-8 border-border bg-primary px-4 py-2 text-primary-foreground shadow-2xl">
                Expenses
              </span>
            </h1>
            
            <p className="max-w-lg text-xl font-bold md:text-2xl">
              Simple, powerful expense tracking. 
              No fluff, just results.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href={siteConfig.links.home}
                className={buttonVariants({ size: "lg" })}
              >
                Start Tracking
              </Link>
              
              <Link
                href={siteConfig.links.home}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                View Demo
              </Link>
            </div>

            {/* Color accents */}
            <div className="flex gap-2 pt-3">
              <div className="h-2 w-16 bg-primary" />
              <div className="h-2 w-16 bg-accent" />
              <div className="h-2 w-16 bg-secondary" />
              <div className="h-2 w-16 bg-destructive" />
            </div>
          </div>

          {/* Right Column - Feature Grid */}
          <div className="animate-pop-in grid grid-cols-2 gap-4" style={{ animationDelay: "0.2s" }}>
            <div className="border-4 border-border bg-primary p-6 shadow-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-md">
              <div className="text-5xl font-black text-primary-foreground">∞</div>
              <div className="mt-3 text-xl font-black uppercase text-primary-foreground">Unlimited</div>
              <p className="mt-1 text-sm font-bold text-primary-foreground">Track as much as you want</p>
            </div>

            <div className="border-4 border-border bg-accent p-6 shadow-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-md">
              <div className="text-5xl font-black text-accent-foreground">⚡</div>
              <div className="mt-3 text-xl font-black uppercase text-accent-foreground">Lightning</div>
              <p className="text-accent-foreground/80 mt-1 text-sm font-bold">Blazing fast performance</p>
            </div>

            <div className="border-4 border-border bg-secondary p-6 shadow-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-md">
              <div className="text-5xl font-black text-secondary-foreground">🔒</div>
              <div className="mt-3 text-xl font-black uppercase text-secondary-foreground">Secure</div>
              <p className="text-secondary-foreground/80 mt-1 text-sm font-bold">Your data, protected</p>
            </div>

            <div className="border-4 border-border bg-secondary-foreground p-6 shadow-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-md">
              <div className="text-5xl font-black text-primary-foreground">📊</div>
              <div className="mt-3 text-xl font-black uppercase text-primary-foreground">Insights</div>
              <p className="mt-1 text-sm font-bold text-primary-foreground">Visual breakdowns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


