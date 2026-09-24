import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-[#008000]/25 bg-[#008000]/15 text-[#008000] shadow-sm",
        secondary:
          "border border-[#272833] bg-[#272833] text-zinc-300",
        destructive:
          "border border-red-500/20 bg-red-500/10 text-red-400",
        outline:
          "border border-[#272833] text-zinc-300",
        accent:
          "border border-[#008000]/30 bg-[#008000]/20 text-[#008000]",
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
