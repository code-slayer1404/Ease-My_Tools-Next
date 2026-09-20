import { SpecialTag } from "./category"

export interface Tool {
    name: string
    slug: string
    icon: any
    tags: string[]
    primaryCategory: SpecialTag,
    color? : string,
    component: () => Promise<any>

    seo: {
        title: string
        description: string
    }

    seoContent: {
        h1: string
        intro: string
        howToUse: string[]
        features: string[]
        benefits: string[]
        useCases: string[]
        faqs: {
            question: string
            answer: string
        }[]

        relatedTools: {
            slug: string
            name: string
        }[]
    }
}

export interface ToolHeroProps {
    tool: {

        name: string

        seo: {
            title: string
            description: string
        }

        seoContent: {
            h1: string
            intro: string
        }
    }
}
