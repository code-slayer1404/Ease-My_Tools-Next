"use client";

import React, { useState, useEffect } from "react";
import "../styles/Header.css";
import { useTheme } from "../contexts/ThemeContext";

const Header = () => {
  const { theme } = useTheme();

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
    <div className={`hero-container ${theme}`}>
      <h1 className="hero-title">
        {"Free Tools to Make"}{" "}
        <span
          key={currentWord.text}
          className="highlight"
          style={{ backgroundColor: currentWord.color }}
        >
          {currentWord.text}
        </span>{" "}
        {"Simple"}
      </h1>
      <p className="hero-subtitle">{"We offer PDF, video, image and other online tools to make your life easier"}</p>
    </div>
  );
};

export default Header;