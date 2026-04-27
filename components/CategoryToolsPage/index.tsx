"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { categoryTitles, toolsByCategory } from "../../data/toolsData";
import BackButton from "../BackButton";

type CategoryToolsPageProps = {
  categoryId?: string;
};

const CategoryToolsPage = ({ categoryId: categoryIdProp }: CategoryToolsPageProps) => {
  const params = useParams<{ categoryId?: string; slug?: string }>();
  const categoryId = categoryIdProp ?? params?.categoryId ?? params?.slug;
  const router = useRouter();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, [categoryId]);

  // ✅ FIX: cast for safe indexing
  const categoryKey = categoryId as keyof typeof toolsByCategory;

  if (!categoryId || !toolsByCategory[categoryKey] || toolsByCategory[categoryKey].length === 0) {
    return (
      <div className={styles.categoryToolsPage}>
        <div className={styles.categoryHeader}>
          <BackButton />
          <h1>Category Not Found</h1>
          <p>The category "{categoryId}" doesn't exist or has no tools.</p>
          <button
            className={styles.backButton}
            onClick={() => router.push("/tools")}
            style={{ marginTop: "1rem" }}
          >
            Go to Tools Page
          </button>
        </div>
      </div>
    );
  }

  const categoryTools = toolsByCategory[categoryKey];

  return (
    <div className={styles.categoryToolsPage}>
      <div className={styles.categoryHeader}>
        <BackButton />
        {/* ✅ FIX here */}
        <h1>{categoryTitles[categoryId as keyof typeof categoryTitles] || "Tools"}</h1>
        <p>{categoryTools.length} tools available</p>
      </div>

      <div
        className={`${styles.categoryToolsGrid} ${animated ? styles.animated : ""}`}
      >
        {categoryTools.map((tool, index) => {
          const IconComponent = tool.icon;

          return (
            <div
              key={tool.name}
              className={`${styles.categoryToolCard} ${styles.floatingCard}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => router.push(`/tools/${tool.slug}`)}
            >
              <div className={styles.toolCardContent}>
                <IconComponent className={styles.toolCardIcon} />
                <h3>{tool.name}</h3>
                <p>Click to use this tool</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryToolsPage;