import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none border-4 border-border uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md hover:translate-x-1 hover:translate-y-1 hover:shadow-sm active:translate-x-2 active:translate-y-2 active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:translate-x-1 hover:translate-y-1 hover:shadow-sm active:translate-x-2 active:translate-y-2 active:shadow-none",
        outline:
          "bg-background border-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-sm active:translate-x-2 active:translate-y-2 active:shadow-none shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:translate-x-1 hover:translate-y-1 hover:shadow-sm active:translate-x-2 active:translate-y-2 active:shadow-none",
        ghost: "border-0 hover:bg-muted",
        link: "border-0 underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
