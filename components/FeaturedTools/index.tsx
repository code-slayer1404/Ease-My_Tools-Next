import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

type FeaturedTool = {
    icon: string
    title: string
    description: string
    badge?: string
    slug: string
}

const featuredTools: FeaturedTool[] = [
    {
        icon: "🖼️",
        title: "Image Compressor",
        description: "Compress images to your exact target file size",
        badge: "Popular",
        slug: "image-compressor",
    },
    {
        icon: "📄",
        title: "Markdown Previewer",
        description: "Write and preview Markdown and HTML files in real-time",
        slug: "markdown-previewer",
    },
    {
        icon: "🔍",
        title: "Text Diff Checker",
        description:
            "Compare two texts and highlight the differences instantly",
        slug: "text-diff-checker",
    },
    {
        icon: "🔐",
        title: "Password Generator",
        description: "Create strong, secure passwords",
        badge: "New",
        slug: "password-generator",
    },
]

export default function FeaturedTools() {
    return (
        <section className="bg-muted/30 py-16 dark:bg-slate-900/50">
            {/* 
        FIX: Explicitly set max-w-[340px] for mobile to reduce card width by ~10-15%,
        while still expanding to max-w-screen-2xl on desktop.
      */}
            <div className="mx-auto max-w-[360px] px-3 sm:max-w-screen-2xl sm:px-6 lg:px-8">
                <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Most Popular Tools
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-center text-base text-muted-foreground md:text-lg">
                    Try our most loved tools trusted by thousands
                </p>

                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {featuredTools.map((tool) => (
                        <Link
                            key={tool.slug}
                            href={`/tools/tool/${tool.slug}`}
                            className="block h-full w-full"
                        >
                            <Card className="group relative flex h-full w-full flex-col border-border/50 bg-card/80 p-8 outline-1 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/5">
                                {tool.badge && (
                                    <Badge className="absolute top-4 right-4 border-0 bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm">
                                        {tool.badge}
                                    </Badge>
                                )}

                                <CardHeader className="flex flex-col items-center p-0 pb-4">
                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl transition-colors group-hover:bg-primary/20">
                                        {tool.icon}
                                    </div>
                                    <CardTitle className="text-center text-xl font-bold">
                                        {tool.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="flex flex-1 flex-col items-center p-0 text-center">
                                    <CardDescription className="flex-1 text-base leading-relaxed text-muted-foreground">
                                        {tool.description}
                                    </CardDescription>

                                    <Button
                                        variant="outline"
                                        className="mt-6 min-w-[140px] p-4 text-base text-primary transition-colors hover:bg-blue-500 hover:text-primary-foreground sm:w-auto dark:hover:bg-blue-500"
                                    >
                                        Use Tool &rarr;
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
