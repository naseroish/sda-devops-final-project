import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="container max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-6 animate-slide-up">
            <div className="inline-block border-4 border-border bg-accent px-4 py-2 shadow-md">
              <span className="text-sm font-black uppercase tracking-wider text-accent-foreground">Free • Secure • Fast</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-none uppercase tracking-tight">
              Track Your
              <br />
              <span className="inline-block border-8 border-border bg-primary text-primary-foreground px-4 py-2 shadow-2xl mt-2">
                Expenses
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-bold max-w-lg">
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
          <div className="grid grid-cols-2 gap-4 animate-pop-in" style={{ animationDelay: "0.2s" }}>
            <div className="border-4 border-border bg-primary p-6 shadow-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-md transition-all">
              <div className="text-5xl font-black text-primary-foreground">∞</div>
              <div className="text-xl font-black text-primary-foreground mt-3 uppercase">Unlimited</div>
              <p className="text-sm font-bold text-primary-foreground mt-1">Track as much as you want</p>
            </div>

            <div className="border-4 border-border bg-accent p-6 shadow-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-md transition-all">
              <div className="text-5xl font-black text-accent-foreground">⚡</div>
              <div className="text-xl font-black text-accent-foreground mt-3 uppercase">Lightning</div>
              <p className="text-sm font-bold text-accent-foreground/80 mt-1">Blazing fast performance</p>
            </div>

            <div className="border-4 border-border bg-secondary p-6 shadow-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-md transition-all">
              <div className="text-5xl font-black text-secondary-foreground">🔒</div>
              <div className="text-xl font-black text-secondary-foreground mt-3 uppercase">Secure</div>
              <p className="text-sm font-bold text-secondary-foreground/80 mt-1">Your data, protected</p>
            </div>

            <div className="border-4 border-border bg-secondary-foreground p-6 shadow-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-md transition-all">
              <div className="text-5xl font-black text-primary-foreground">📊</div>
              <div className="text-xl font-black mt-3 uppercase text-primary-foreground">Insights</div>
              <p className="text-sm font-bold text-primary-foreground mt-1">Visual breakdowns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


