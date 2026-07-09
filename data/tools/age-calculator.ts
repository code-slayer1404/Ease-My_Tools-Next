import { FaCalculator } from "react-icons/fa"
import { Tool } from "@/types/tool"

export const age_calculator: Tool = {
    name: "Age Calculator",
    slug: "age-calculator",
    icon: FaCalculator,
    primaryCategory: "misc",
    tags: [
        "misc",
        "time",
        "date",
        "age",
        "birthday",
        "years",
        "months",
        "days",
        "duration",
        "difference",
        "calendar",
        "chronology",
    ],
    component: () => import("@/components/Tools/age-calculator"),
    seo: {
        title: "Free Age Calculator Online (Instant & Accurate)",
        description: "Calculate your exact age instantly.",
    },
    seoContent: {
        h1: "Age Calculator",
        intro: "Calculate your exact age, zodiac sign, and compare with a friend.",
        howToUse: [
            "Enter your birth date.",
            "Click calculate.",
            "See your age breakdown.",
        ],
        features: [
            "Precise age output",
            "Years, months, days",
            "Simple date picker",
        ],
        benefits: [
            "Accurate birthday planning",
            "Quick age verification",
            "Fun to use",
        ],
        useCases: [
            "Form filling",
            "Birthday surprises",
            "Age eligibility checks",
        ],
        faqs: [
            {
                question: "Does it account for leap years?",
                answer: "Yes, the calculation includes leap year adjustments.",
            },
            {
                question: "Can I calculate age for future dates?",
                answer: "You can input any date to see the difference.",
            },
        ],
        relatedTools: [
            { slug: "time-calculator", name: "Time Calculator" },
            {
                slug: "percentage-calculator",
                name: "Percentage Calculator",
            },
        ],
    },
}
