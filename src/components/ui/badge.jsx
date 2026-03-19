import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-label transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
                outline: "text-foreground border-border",
                soft: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
                success: "border-transparent bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50",
                warning: "border-transparent bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100/80 dark:hover:bg-amber-900/50",
                blue: "border-transparent bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/50",
                purple: "border-transparent bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100/80 dark:hover:bg-purple-900/50",
                indigo: "border-transparent bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
