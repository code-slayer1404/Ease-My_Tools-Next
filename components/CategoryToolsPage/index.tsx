"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import styles from "./styles.module.css"

import { CATEGORIES } from "../../data/featuredCategories"
import { getToolsByTag } from "../../data/registry"

type CategoryToolsPageProps = {
    categoryId?: string
}

const CategoryToolsPage = ({
    categoryId: categoryIdProp,
}: CategoryToolsPageProps) => {
    const params = useParams<{ categoryId?: string; slug?: string }>()
    const categoryId = categoryIdProp ?? params?.categoryId ?? params?.slug
    const router = useRouter()
    const [animated, setAnimated] = useState(false)

    const category = CATEGORIES.find((c) => c.tag === categoryId)

    const categoryTools = categoryId ? getToolsByTag(categoryId) : []

    useEffect(() => {
        setAnimated(true)
    }, [categoryId])

    if (!category || categoryTools.length === 0) {
        return (
            <div className={styles.categoryToolsPage}>
                <div className={styles.categoryHeader}>
                    <h1>Category Not Found</h1>
                    <p>
                        {'The category "'}
                        {categoryId}
                        {"\" doesn't exist or has no tools."}
                    </p>
                    <button
                        className={styles.backButton}
                        onClick={() => router.push("/tools" as any)}
                        style={{ marginTop: "1rem" }}
                    >
                        Go to Tools Page
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.categoryToolsPage}>
            <div className={styles.categoryHeader}>
                <h1>{category?.title ?? "Tools"}</h1>
                <p>{categoryTools.length} tools available</p>
            </div>

            <div
                className={`${styles.categoryToolsGrid} ${
                    animated ? styles.animated : ""
                }`}
            >
                {categoryTools.map((tool: any, index: number) => {
                    const IconComponent = tool.icon

                    return (
                        <div
                            key={tool.name}
                            className={`${styles.categoryToolCard} ${styles.floatingCard}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() =>
                                router.push(`/tools/tool/${tool.slug}` as any)
                            }
                        >
                            <div className={styles.toolCardContent}>
                                <IconComponent
                                    className={styles.toolCardIcon}
                                />
                                <h3>{tool.name}</h3>
                                <p>Click to use this tool</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CategoryToolsPage
