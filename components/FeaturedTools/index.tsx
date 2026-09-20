// import Link from "next/link"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card"

// type FeaturedTool = {
//     icon: string
//     title: string
//     description: string
//     badge?: string
//     slug: string
// }

// const featuredTools: FeaturedTool[] = [
//     {
//         icon: "🖼️",
//         title: "Image Compressor",
//         description: "Compress images to your exact target file size",
//         badge: "Popular",
//         slug: "image-compressor",
//     },
//     {
//         icon: "📄",
//         title: "Markdown Previewer",
//         description: "Write and preview Markdown and HTML files in real-time",
//         slug: "markdown-previewer",
//     },
//     {
//         icon: "🔍",
//         title: "Text Diff Checker",
//         description:
//             "Compare two texts and highlight the differences instantly",
//         slug: "text-diff-checker",
//     },
//     {
//         icon: "🔐",
//         title: "Password Generator",
//         description: "Create strong, secure passwords",
//         badge: "New",
//         slug: "password-generator",
//     }
// ]

// export default function FeaturedTools() {
//     return (
//         <section className="bg-background py-16 dark:bg-background">
//             {/* 
//         FIX: Explicitly set max-w-[340px] for mobile to reduce card width by ~10-15%,
//         while still expanding to max-w-screen-2xl on desktop.
//       */}
//             <div className="mx-auto max-w-[360px] px-3 sm:max-w-screen-2xl sm:px-6 lg:px-8">
//                 <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
//                     Most Popular Tools
//                 </h2>
//                 <p className="mx-auto mt-3 max-w-2xl text-center text-base text-muted-foreground md:text-lg">
//                     Try our most loved tools trusted by thousands
//                 </p>

//                 <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//                     {featuredTools.map((tool) => (
//                         <Link
//                             key={tool.slug}
//                             href={`/tools/tool/${tool.slug}`}
//                             className="block h-full w-full"
//                         >
//                             <Card className="group relative flex h-full w-full flex-col border-border/50 bg-card/80 p-8 outline-1 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/5">
//                                 {tool.badge && (
//                                     <Badge className="absolute top-4 right-4 border-0 bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm">
//                                         {tool.badge}
//                                     </Badge>
//                                 )}

//                                 <CardHeader className="flex flex-col items-center p-0 pb-4">
//                                     <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl transition-colors group-hover:bg-primary/20">
//                                         {tool.icon}
//                                     </div>
//                                     <CardTitle className="text-center text-xl font-bold">
//                                         {tool.title}
//                                     </CardTitle>
//                                 </CardHeader>

//                                 <CardContent className="flex flex-1 flex-col items-center p-0 text-center">
//                                     <CardDescription className="flex-1 text-base leading-relaxed text-muted-foreground">
//                                         {tool.description}
//                                     </CardDescription>

//                                     <Button
//                                         variant="outline"
//                                         className="mt-6 min-w-[140px] p-4 text-base text-primary transition-colors hover:bg-blue-500 hover:text-primary-foreground sm:w-auto dark:hover:bg-blue-500"
//                                     >
//                                         Use Tool &rarr;
//                                     </Button>
//                                 </CardContent>
//                             </Card>
//                         </Link>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }


// import Link from "next/link"
// import {
//     LucideIcon,
//     Image,
//     FileText,
//     GitCompare,
//     KeyRound,
//     QrCode,
//     Code2,
//     Palette,
//     ArrowRightLeft,
//     ArrowRight,
//     LayoutGrid,
// } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"

// type FeaturedTool = {
//     icon: LucideIcon
//     title: string
//     description: string
//     badge?: string
//     slug: string
// }

// const featuredTools: FeaturedTool[] = [
//     {
//         icon: Image,
//         title: "Image Compressor",
//         description: "Compress images to your exact target file size",
//         badge: "Popular",
//         slug: "image-compressor",
//     },
//     {
//         icon: FileText,
//         title: "Markdown Previewer",
//         description: "Write and preview Markdown and HTML files in real-time",
//         slug: "markdown-previewer",
//     },
//     {
//         icon: GitCompare,
//         title: "Text Diff Checker",
//         description: "Compare two texts and highlight the differences instantly",
//         slug: "text-diff-checker",
//     },
//     {
//         icon: KeyRound,
//         title: "Password Generator",
//         description: "Create strong, secure passwords",
//         badge: "New",
//         slug: "password-generator",
//     },
//     {
//         icon: QrCode,
//         title: "QR Code Generator",
//         description: "Generate customized and downloadable QR codes instantly",
//         badge: "Popular",
//         slug: "qr-code-generator",
//     },
//     {
//         icon: Code2,
//         title: "JSON Formatter",
//         description: "Format, validate, and beautify your raw JSON data",
//         slug: "json-formatter",
//     },
//     {
//         icon: Palette,
//         title: "Color Palette Generator",
//         description: "Extract and generate harmonic color codes and schemes",
//         slug: "color-palette-generator",
//     },
//     {
//         icon: ArrowRightLeft,
//         title: "Unit Converter",
//         description: "Convert length, area, speed, weight, and digital storage units",
//         slug: "unit-converter",
//     },
// ]

// export default function FeaturedTools() {
//     return (
//         <section className="relative overflow-hidden bg-background py-16 lg:py-24">
//             <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
//                 {/* Header */}
//                 <div className="mx-auto max-w-2xl text-center">
//                     <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
//                         Most Popular Tools
//                     </h2>
//                     <p className="mt-3 text-base text-muted-foreground sm:text-lg">
//                         Try our most loved tools trusted by thousands
//                     </p>
//                 </div>

//                 {/* Grid */}
//                 <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//                     {featuredTools.map((tool) => {
//                         const Icon = tool.icon
//                         return (
//                             <Link
//                                 key={tool.slug}
//                                 href={`/tools/tool/${tool.slug}`}
//                                 className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 dark:bg-card/30 dark:hover:bg-card/60"
//                             >
//                                 <div>
//                                     {/* Top Row: Icon & Badge */}
//                                     <div className="flex items-center justify-between">
//                                         <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
//                                             <Icon className="h-6 w-6 stroke-[1.75]" />
//                                         </div>
//                                         {tool.badge && (
//                                             <Badge
//                                                 variant="secondary"
//                                                 className={`text-xs font-medium ${
//                                                     tool.badge === "Popular"
//                                                         ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
//                                                         : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
//                                                 }`}
//                                             >
//                                                 {tool.badge}
//                                             </Badge>
//                                         )}
//                                     </div>

//                                     {/* Content */}
//                                     <div className="mt-5">
//                                         <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
//                                             {tool.title}
//                                         </h3>
//                                         <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
//                                             {tool.description}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Bottom Action Link */}
//                                 <div className="mt-6 flex items-center text-sm font-medium text-primary">
//                                     <span>Use Tool</span>
//                                     <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
//                                 </div>
//                             </Link>
//                         )
//                     })}
//                 </div>

//                 {/* Bottom CTA Button */}
//                 <div className="mt-14 flex justify-center">
//                     <Button asChild size="lg" className="rounded-xl px-8 shadow-sm">
//                         <Link href="/tools" className="flex items-center gap-2">
//                             <LayoutGrid className="h-4 w-4" />
//                             <span>See All Tools</span>
//                             <ArrowRight className="h-4 w-4" />
//                         </Link>
//                     </Button>
//                 </div>
//             </div>
//         </section>
//     )
// }












// import Link from "next/link"
// import {
//     LucideIcon,
//     Image,
//     FileText,
//     GitCompare,
//     KeyRound,
//     QrCode,
//     Code2,
//     Palette,
//     ArrowRightLeft,
//     ArrowRight,
//     LayoutGrid,
// } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"

// type FeaturedTool = {
//     icon: LucideIcon
//     title: string
//     description: string
//     badge?: string
//     slug: string
// }

// const featuredTools: FeaturedTool[] = [
//     {
//         icon: Image,
//         title: "Image Compressor",
//         description: "Compress images to your exact target file size",
//         badge: "Popular",
//         slug: "image-compressor",
//     },
//     {
//         icon: FileText,
//         title: "Markdown Previewer",
//         description: "Write and preview Markdown and HTML files in real-time",
//         slug: "markdown-previewer",
//     },
//     {
//         icon: GitCompare,
//         title: "Text Diff Checker",
//         description: "Compare two texts and highlight the differences instantly",
//         slug: "text-diff-checker",
//     },
//     {
//         icon: KeyRound,
//         title: "Password Generator",
//         description: "Create strong, secure passwords",
//         badge: "New",
//         slug: "password-generator",
//     },
//     {
//         icon: QrCode,
//         title: "QR Code Generator",
//         description: "Generate customized and downloadable QR codes instantly",
//         badge: "Popular",
//         slug: "qr-code-generator",
//     },
//     {
//         icon: Code2,
//         title: "JSON Formatter",
//         description: "Format, validate, and beautify your raw JSON data",
//         slug: "json-formatter",
//     },
//     {
//         icon: Palette,
//         title: "Color Palette Generator",
//         description: "Extract and generate harmonic color codes and schemes",
//         slug: "color-palette-generator",
//     },
//     {
//         icon: ArrowRightLeft,
//         title: "Unit Converter",
//         description: "Convert length, area, speed, weight, and digital storage units",
//         slug: "unit-converter",
//     },
// ]

// export default function FeaturedTools() {
//     return (
//         <section className="relative overflow-hidden bg-background py-12 sm:py-16 lg:py-24">
//             <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
//                 {/* Header */}
//                 <div className="mx-auto max-w-2xl text-center">
//                     <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
//                         Most Popular Tools
//                     </h2>
//                     <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base lg:text-lg">
//                         Try our most loved tools trusted by thousands
//                     </p>
//                 </div>

//                 {/* Grid - 1 col on mobile, 2 col on tablet (sm/md), 4 col on desktop (lg) */}
//                 <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:mt-12 lg:grid-cols-4 lg:gap-6">
//                     {featuredTools.map((tool) => {
//                         const Icon = tool.icon
//                         return (
//                             <Link
//                                 key={tool.slug}
//                                 href={`/tools/tool/${tool.slug}`}
//                                 className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 sm:p-6 dark:bg-card/30 dark:hover:bg-card/60"
//                             >
//                                 <div>
//                                     {/* Top Row: Icon & Badge */}
//                                     <div className="flex items-center justify-between">
//                                         <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:h-12 sm:w-12">
//                                             <Icon className="h-5 w-5 stroke-[1.75] sm:h-6 sm:w-6" />
//                                         </div>
//                                         {tool.badge && (
//                                             <Badge
//                                                 variant="secondary"
//                                                 className={`text-[11px] font-medium sm:text-xs ${
//                                                     tool.badge === "Popular"
//                                                         ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
//                                                         : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
//                                                 }`}
//                                             >
//                                                 {tool.badge}
//                                             </Badge>
//                                         )}
//                                     </div>

//                                     {/* Content */}
//                                     <div className="mt-4 sm:mt-5">
//                                         <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary sm:text-lg">
//                                             {tool.title}
//                                         </h3>
//                                         <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">
//                                             {tool.description}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Bottom Action Link */}
//                                 <div className="mt-5 flex items-center text-xs font-medium text-primary sm:mt-6 sm:text-sm">
//                                     <span>Use Tool</span>
//                                     <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 sm:h-4 sm:w-4" />
//                                 </div>
//                             </Link>
//                         )
//                     })}
//                 </div>

//                 {/* Bottom CTA Button */}
//                 <div className="mt-10 flex justify-center sm:mt-14">
//                     <Button
//                         asChild
//                         size="lg"
//                         className="w-full max-w-xs rounded-xl shadow-sm sm:w-auto sm:px-8"
//                     >
//                         <Link href="/tools" className="flex items-center justify-center gap-2">
//                             <LayoutGrid className="h-4 w-4" />
//                             <span>See All Tools</span>
//                             <ArrowRight className="h-4 w-4" />
//                         </Link>
//                     </Button>
//                 </div>
//             </div>
//         </section>
//     )
// }






import Link from "next/link"
import {
    LucideIcon,
    Image,
    FileText,
    GitCompare,
    KeyRound,
    QrCode,
    Code2,
    Palette,
    ArrowRightLeft,
    ArrowRight,
    LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type FeaturedTool = {
    icon: LucideIcon
    title: string
    category: string
    description: string
    color: string       // Icon text & border color
    bgColor: string     // Icon background
    categoryColor: string // Category label color
    slug: string
}

const featuredTools: FeaturedTool[] = [
    {
        icon: Image,
        title: "Image Compressor",
        category: "Image Tools",
        description: "Compress images to exact target file size",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        categoryColor: "text-emerald-400/90",
        slug: "image-compressor",
    },
    {
        icon: FileText,
        title: "Markdown Previewer",
        category: "Doc Tools",
        description: "Write and preview Markdown in real-time",
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        categoryColor: "text-orange-400/90",
        slug: "markdown-previewer",
    },
    {
        icon: GitCompare,
        title: "Text Diff Checker",
        category: "Text Tools",
        description: "Compare two texts and highlight differences",
        color: "text-pink-400",
        bgColor: "bg-pink-500/10",
        categoryColor: "text-pink-400/90",
        slug: "text-diff-checker",
    },
    {
        icon: KeyRound,
        title: "Password Generator",
        category: "Security",
        description: "Create strong, secure passwords",
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        categoryColor: "text-cyan-400/90",
        slug: "password-generator",
    },
    {
        icon: QrCode,
        title: "QR Code Generator",
        category: "Utility Tools",
        description: "Generate customized QR codes instantly",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        categoryColor: "text-purple-400/90",
        slug: "qr-code-tool",
    },
    {
        icon: Code2,
        title: "JSON Formatter",
        category: "Dev Tools",
        description: "Format, validate, and beautify JSON",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        categoryColor: "text-blue-400/90",
        slug: "json-formatter",
    },
    {
        icon: Palette,
        title: "Palette Generator",
        category: "Design Tools",
        description: "Extract and generate harmonic color schemes",
        color: "text-rose-400",
        bgColor: "bg-rose-500/10",
        categoryColor: "text-rose-400/90",
        slug: "color-picker",
    },
    {
        icon: ArrowRightLeft,
        title: "Unit Converter",
        category: "Math & Units",
        description: "Convert length, area, speed, and weights",
        color: "text-indigo-400",
        bgColor: "bg-indigo-500/10",
        categoryColor: "text-indigo-400/90",
        slug: "unit-converter",
    },
]

export default function FeaturedTools() {
    return (
        <section className="relative overflow-hidden bg-background py-5 sm:py-8 lg:py-12">
            <div className="mx-auto max-w-[1260px] px-3 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                        Most Popular Tools
                    </h2>
                    <p className="mt-1.5 text-xs text-muted-foreground sm:mt-3 sm:text-base lg:text-lg">
                        Try our most loved tools trusted by thousands
                    </p>
                </div>

                {/* Grid - 2 Column on Mobile (TinyWow Style) | 4 Column on Desktop */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 md:grid-cols-3 lg:mt-12 lg:grid-cols-4 lg:gap-6">
                    {featuredTools.map((tool) => {
                        const Icon = tool.icon
                        return (
                            <Link
                                key={tool.slug}
                                href={`/tools/tool/${tool.slug}`}
                                className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card/60 p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 sm:rounded-2xl sm:p-5 dark:bg-[#111827]/60 dark:hover:bg-[#1f2937]/70"
                            >
                                <div>
                                    {/* Icon Box */}
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.bgColor} ${tool.color} sm:h-12 sm:w-12 sm:rounded-xl`}
                                    >
                                        <Icon className="h-5 w-5 stroke-[2] sm:h-6 sm:w-6 sm:stroke-[1.75]" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="mt-3 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:mt-4 sm:text-base lg:text-lg">
                                        {tool.title}
                                    </h3>

                                    {/* Desktop-only Short Description */}
                                    <p className="mt-1 hidden text-xs leading-relaxed text-muted-foreground sm:block">
                                        {tool.description}
                                    </p>
                                </div>

                                {/* Category Tag (TinyWow Style) */}
                                <div className="mt-2.5 sm:mt-4">
                                    <span className={`text-[11px] font-medium sm:text-xs ${tool.categoryColor}`}>
                                        {tool.category}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-8 flex justify-center sm:mt-14">
                    <Button
                        asChild
                        size="lg"
                        className="w-full max-w-[280px] rounded-xl shadow-sm sm:w-auto sm:px-8"
                    >
                        <Link href="/tools" className="flex items-center justify-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            <span>See All Tools</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}