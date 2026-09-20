// import Link from "next/link"

// import { Card, CardContent } from "@/components/ui/card"

// import type { Tool } from "@/types/tool"

// type ToolCardProps = {
//     tool: Tool
// }

// export default function ToolCard({ tool }: ToolCardProps) {
//     const Icon = tool.icon

//     return (
//         <Link href={`/tools/tool/${tool.slug}`}>
//             <Card className="h-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
//                 <CardContent className="space-y-4 p-5">
//                     <div className="flex items-center gap-3">
//                         <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
//                             <Icon className="h-6 w-6 text-primary" />
//                         </div>

//                         <h3 className="text-lg font-semibold">{tool.name}</h3>
//                     </div>

//                     <p className="line-clamp-3 text-sm text-muted-foreground">
//                         {tool.seo.description}
//                     </p>

//                     <div className="flex flex-wrap gap-2">
//                         {tool.tags.slice(0, 3).map((tag) => (
//                             <span
//                                 key={tag}
//                                 className="rounded-full bg-secondary px-2 py-1 text-xs"
//                             >
//                                 {tag}
//                             </span>
//                         ))}
//                     </div>
//                 </CardContent>
//             </Card>
//         </Link>
//     )
// }




import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Tool } from "@/types/tool"

type ToolCardProps = {
    tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
    const Icon = tool.icon
    const primaryTag = tool.tags?.[0] || "Tool"

    return (
        <Link
            href={`/tools/tool/${tool.slug}`}
            className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card/60 p-3.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 sm:rounded-2xl sm:p-5 dark:bg-[#111827]/60 dark:hover:bg-[#1f2937]/70"
        >
            <div>
                {/* Icon Container */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:h-12 sm:w-12 sm:rounded-xl">
                    <Icon className="h-5 w-5 stroke-[2] sm:h-6 sm:w-6 sm:stroke-[1.75]" />
                </div>

                {/* Title */}
                <h3 className="mt-3 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:mt-4 sm:text-base lg:text-lg">
                    {tool.name}
                </h3>

                {/* Description (Desktop only to keep mobile cards neat) */}
                <p className="mt-1.5 hidden text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:block sm:text-sm">
                    {tool.seo.description}
                </p>
            </div>

            {/* Bottom Row: Category Tag / Tags */}
            <div className="mt-3 flex items-center justify-between sm:mt-4">
                {/* Primary Tag on mobile, multi-tags on tablet/desktop */}
                <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-medium text-primary/90 sm:text-xs">
                        {primaryTag}
                    </span>
                    {tool.tags?.slice(1, 3).map((tag) => (
                        <span
                            key={tag}
                            className="hidden rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline-block"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Micro Arrow on Hover */}
                <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 sm:h-4 sm:w-4" />
            </div>
        </Link>
    )
}