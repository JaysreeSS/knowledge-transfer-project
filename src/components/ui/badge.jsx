import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
                outline: "text-foreground",
                soft: "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200/80",
                success: "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80",
                warning: "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100/80",
                blue: "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100/80",
                purple: "border-transparent bg-purple-50 text-purple-700 hover:bg-purple-100/80",
                indigo: "border-transparent bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80",
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
