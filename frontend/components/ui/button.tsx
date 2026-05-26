"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { buttonMotion } from "@/lib/animations"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-transparent bg-clip-padding text-[13px] font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]",
        outline:
          "bg-transparent text-[var(--text-primary)] border-[0.5px] border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] aria-expanded:bg-[var(--bg-elevated)]",
        secondary:
          "bg-transparent text-[var(--text-primary)] border-[0.5px] border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] aria-expanded:bg-[var(--bg-elevated)]",
        ghost:
          "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] aria-expanded:bg-[var(--bg-elevated)]",
        destructive:
          "bg-transparent text-[var(--error)] border-[0.5px] border-[color-mix(in_srgb,var(--error)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]",
        link: "text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-[18px] py-[10px] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-[var(--radius-sm)] px-2 text-xs in-data-[slot=button-group]:rounded-[var(--radius-md)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[var(--radius-sm)] px-3 text-[12px] in-data-[slot=button-group]:rounded-[var(--radius-md)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-5 text-[14px] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[var(--radius-sm)] in-data-[slot=button-group]:rounded-[var(--radius-md)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[var(--radius-sm)] in-data-[slot=button-group]:rounded-[var(--radius-md)]",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const computedClassName = cn(buttonVariants({ variant, size, className }))

  if (asChild && React.isValidElement(children)) {
    const child = React.Children.only(children) as React.ReactElement<{ className?: string }>
    return React.cloneElement(child, {
      ...props,
      className: cn(computedClassName, child.props?.className),
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={computedClassName}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

/** Button with hover scale (1.05) and tap (0.95) motion. Use for primary CTAs. Does not support asChild. */
const MotionButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "asChild"> & { motion?: boolean }
>(function MotionButton(
  { motion: enableMotion = true, className, variant = "default", size = "default", children, ...props },
  ref
) {
  const computedClassName = cn(buttonVariants({ variant, size, className }))
  if (!enableMotion) {
    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        className={computedClassName}
        {...props}
      >
        {children}
      </ButtonPrimitive>
    )
  }
  return (
    <motion.button
      ref={ref}
      type={(props as React.ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
      data-slot="button"
      className={computedClassName}
      whileHover={buttonMotion.hover}
      whileTap={buttonMotion.tap}
      transition={buttonMotion.transition}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  )
})

export { Button, MotionButton, buttonVariants }
