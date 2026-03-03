import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative isolate inline-flex max-w-full items-center justify-center gap-2 overflow-hidden whitespace-normal rounded-md text-center text-sm font-bold leading-5 ring-offset-background transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out before:pointer-events-none before:absolute before:inset-y-0 before:-left-1/2 before:z-0 before:w-1/3 before:skew-x-[-18deg] before:bg-white/30 before:opacity-0 before:blur-md before:transition-all before:duration-500 hover:before:left-[115%] hover:before:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 [&>*]:relative [&>*]:z-10 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-primary/30 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.18),inset_0_1px_0_hsl(0_0%_100%/0.22)] hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_16px_34px_hsl(var(--primary)/0.24),inset_0_1px_0_hsl(0_0%_100%/0.28)]",
        cyber:
          "border border-primary/45 bg-primary/10 text-primary shadow-[0_10px_26px_hsl(var(--primary)/0.12),inset_0_1px_0_hsl(var(--primary)/0.18)] hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/18 hover:text-foreground hover:shadow-[0_0_28px_hsl(var(--primary)/0.24)]",
        destructive:
          "border border-destructive/35 bg-destructive text-destructive-foreground shadow-[0_10px_22px_hsl(var(--destructive)/0.16)] hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-[0_14px_30px_hsl(var(--destructive)/0.22)]",
        outline:
          "border border-border/80 bg-background/75 text-foreground shadow-[0_8px_20px_hsl(var(--foreground)/0.045),inset_0_1px_0_hsl(var(--foreground)/0.08)] backdrop-blur hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/10 hover:shadow-[0_12px_28px_hsl(var(--primary)/0.12),inset_0_1px_0_hsl(var(--primary)/0.14)]",
        secondary:
          "border border-secondary/35 bg-secondary text-secondary-foreground shadow-[0_10px_22px_hsl(var(--secondary)/0.14)] hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-[0_14px_30px_hsl(var(--secondary)/0.2)]",
        ghost:
          "border border-transparent text-muted-foreground shadow-none hover:-translate-y-0.5 hover:border-border/60 hover:bg-muted/75 hover:text-foreground",
        link: "overflow-visible rounded-sm border-transparent px-0 text-primary shadow-none underline-offset-4 before:hidden hover:underline",
        social:
          "border border-border/80 bg-background/75 text-foreground shadow-[0_8px_20px_hsl(var(--foreground)/0.045),inset_0_1px_0_hsl(var(--foreground)/0.08)] backdrop-blur hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-card-hover",
      },
      size: {
        default: "min-h-11 px-5 py-2.5",
        sm: "min-h-9 px-3.5 py-1.5 text-xs",
        lg: "min-h-12 px-7 py-3 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
