"use client";

import React, { useState, useEffect } from "react";
import styles from './styles.module.css';

const Header = () => {

  const words = [{ text: "Everything", color: "#7C3AED" }, { text: "PDFs", color: "#E11D48" }, { text: "Videos", color: "#2563EB" }, { text: "Images", color: "#059669" }];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [words.length]);

  // Fallback to avoid "undefined" errors
  const currentWord = words[index] || { text: "Tools", color: "#6366f1" };

  return (
    <div className={styles["hero-container"]}>
      <h1 className={styles["hero-title"]}>
        {"Free Tools to Simplify"}{" "}
        <span
          key={currentWord.text}
          className={styles["highlight"]}
          style={{ backgroundColor: currentWord.color }}
        >
          {currentWord.text}
        </span>{" "}
        {/* {"Simple"} */}
      </h1>
      <p className={styles["hero-subtitle"]}>{"Smart online tools to edit, convert, and compress your PDFs, videos, and images instantly"}</p>
    </div>
  );
};

export default Header;