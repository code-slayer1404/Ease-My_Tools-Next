// import type { Tool } from "@/types/tool"

// import ToolCard from "./ToolCard"

// type ToolGridProps = {
//     tools: Tool[]
// }

// export default function ToolGrid({ tools }: ToolGridProps) {
//     return (
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
//             {tools.map((tool) => (
//                 <ToolCard key={tool.slug} tool={tool} />
//             ))}
//         </div>
//     )
// }





import type { Tool } from "@/types/tool"
import ToolCard from "./ToolCard"

type ToolGridProps = {
    tools: Tool[]
}

export default function ToolGrid({ tools }: ToolGridProps) {
    return (
        <div className="mx-auto grid max-w-[1260px] grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
            ))}
        </div>
    )
}
