import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Benefit = {
    icon: string
    title: string
    description: string
}

const benefits: Benefit[] = [
    {
        icon: "🔒",
        title: "100% Secure",
        description: "Files processed locally, never stored on servers",
    },
    {
        icon: "⚡",
        title: "Lightning Fast",
        description: "Process files in seconds with our optimized tools",
    },
    {
        icon: "🎯",
        title: "No Watermarks",
        description: "Get clean results without any branding",
    },
    {
        icon: "💯",
        title: "Completely Free",
        description: "No hidden costs or subscription fees",
    },
]

export default function BenefitsSection() {
    return (
        <section className="bg-muted/30 py-16 dark:bg-slate-900/50">
            {/* 
        Kept the exact same container pattern as FeaturedTools:
        Clamped mobile width (-10%), unlocks to full screen-2xl on desktop.
      */}
            <div className="mx-auto max-w-[360px] px-3 sm:max-w-screen-2xl sm:px-6 lg:px-8">
                <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Why Choose EaseMyTools?
                </h2>

                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit, index) => (
                        <Card
                            key={index}
                            className="group relative flex h-full w-full flex-col rounded-2xl border-border/50 bg-card/80 p-8 outline-1 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/5"
                        >
                            <CardHeader className="flex flex-col items-center p-0 pb-4">
                                {/* Bigger icon (text-5xl = 3rem) exactly like the original */}
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-5xl transition-colors group-hover:bg-primary/20">
                                    {benefit.icon}
                                </div>
                                <CardTitle className="text-center text-xl font-bold">
                                    {benefit.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex flex-1 flex-col items-center p-0 text-center">
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    {benefit.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
