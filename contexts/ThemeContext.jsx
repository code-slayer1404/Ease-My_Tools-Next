"use client";




import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme === "light" ? "light" : "dark";
    } catch (error) {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      // Ignore storage errors and still apply theme class.
    }
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
