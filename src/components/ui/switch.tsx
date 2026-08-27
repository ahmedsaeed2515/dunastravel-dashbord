"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Sizes
        size === "default" && "h-6 w-11 p-0.5",
        size === "sm" && "h-4 w-7 p-0.5",
        // Checked state
        "data-[checked]:bg-amber-600 data-[checked]:border-amber-600 dark:data-[checked]:bg-amber-500 dark:data-[checked]:border-amber-500",
        // Unchecked state (high contrast slate track with clear border)
        "data-[unchecked]:bg-slate-300 data-[unchecked]:border-slate-400/80 dark:data-[unchecked]:bg-slate-700 dark:data-[unchecked]:border-slate-600",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-md border border-slate-300/80 dark:border-slate-400/60 ring-0 transition-transform duration-200",
          size === "default" && "size-5 data-[checked]:translate-x-5 data-[unchecked]:translate-x-0 rtl:data-[checked]:-translate-x-5 rtl:data-[unchecked]:translate-x-0",
          size === "sm" && "size-3 data-[checked]:translate-x-3 data-[unchecked]:translate-x-0 rtl:data-[checked]:-translate-x-3 rtl:data-[unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
