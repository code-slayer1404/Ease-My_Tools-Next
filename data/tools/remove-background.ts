import { MdAutoFixHigh } from "react-icons/md"
import { Tool } from "@/types/tool"

export const background_remover: Tool = {
    name: "RemoveBackground",
    slug: "remove-background",
    icon: MdAutoFixHigh,
    primaryCategory: "image",
    tags: [
        "image",
        "photo",
        "background",
        "cutout",
        "transparent",
        "editing",
        "portrait",
        "ecommerce",
        "design",
        "graphics",
        "isolation",
    ],
    component: () => import("@/components/Tools/remove-background"),
    seo: {
        title: "Remove Background | Remove Photo Backgrounds Online",
        description:
            "Remove image backgrounds and export clean transparent cutouts for products, profiles, and designs.",
    },
    seoContent: {
        h1: "Remove Background",
        intro: "Remove distracting backgrounds from photos and keep focus on your subject with a simple upload workflow.",
        howToUse: [
            "Upload an image.",
            "Run cutout or choose a background mode.",
            "Download your processed image.",
        ],
        features: [
            "Automatic subject cutout",
            "Transparent, solid color, and photo backgrounds",
            "Extra effects and basic adjustments",
        ],
        benefits: [
            "Cleaner product and profile visuals",
            "Faster image editing workflow",
            "No heavy desktop editor required",
        ],
        useCases: [
            "Ecommerce product listings",
            "Profile photos and team pages",
            "Quick creative mockups",
        ],
        faqs: [
            {
                question: "Which file types work best?",
                answer: "Clear JPG or PNG images with a visible subject generally produce the best cutout results.",
            },
            {
                question: "Can I keep a transparent background?",
                answer: "Yes, choose the transparent option before downloading.",
            },
        ],
        relatedTools: [
            { slug: "image-resizer", name: "Image Resizer" },
            { slug: "image-compressor", name: "Image Compressor" },
            {
                slug: "profile-pic-optimizer",
                name: "Profile Picture Optimizer",
            },
        ],
    },
}
