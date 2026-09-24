import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-gym-primary/20 bg-gym-primary/10 text-gym-primary shadow-sm",
        secondary:
          "border border-[#27272A] bg-[#27272A] text-zinc-300",
        destructive:
          "border border-red-500/20 bg-red-500/10 text-red-400",
        outline:
          "border border-[#27272A] text-zinc-300",
        accent:
          "border border-gym-primary/30 bg-gym-primary/15 text-gym-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
