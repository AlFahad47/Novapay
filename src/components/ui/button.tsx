"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA1FF]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700",
        novapay:
          "bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] text-white shadow-[0_10px_24px_rgba(30,80,255,0.35)] hover:shadow-[0_14px_30px_rgba(30,80,255,0.45)] hover:-translate-y-0.5",
        outline:
          "border border-[#4DA1FF]/30 bg-transparent text-[#1E50FF] hover:bg-[#4DA1FF]/10 dark:text-[#4DA1FF] dark:hover:bg-[#4DA1FF]/15",
        ghost:
          "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        success: "bg-emerald-500 text-white hover:bg-emerald-600",
        warning: "bg-orange-500 text-white hover:bg-orange-600",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-10 px-5",
        lg: "h-12 px-7 text-base",
        icon: "h-9 w-9 rounded-full p-0",
        pill: "h-12 px-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, type = "button", ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        />
      );
    }

    return (
      <Comp
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
