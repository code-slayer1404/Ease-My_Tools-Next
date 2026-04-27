"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from './styles.module.css';
import { useTheme } from "next-themes";

type MenuItem = {
  label: string;
  icon: string;
};

type Menu = {
  title: string;
  items: MenuItem[];
};

// 🔥 helper: convert label → slug
const slugify = (text: string) =>
  text.toLowerCase().replace(/\s+/g, "-");

const Navbar = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const rawMenus: Menu[] = [
    {
      title: "PDF",
      items: [
        { label: "Merge PDF", icon: "📑" },
        { label: "Split PDF", icon: "✂️" },
        { label: "Compress PDF", icon: "📉" }
      ]
    },
    {
      title: "Image",
      items: [
        { label: "Remove BG", icon: "🖼️" },
        { label: "Resize", icon: "📏" },
        { label: "Convert", icon: "🔄" }
      ]
    },
    {
      title: "Video",
      items: [
        { label: "Compress", icon: "🎥" },
        { label: "Mute", icon: "🔇" },
        { label: "Convert", icon: "🔄" }
      ]
    },
    {
      title: "File",
      items: [
        { label: "Split Excel", icon: "📊" },
        { label: "Word → PDF", icon: "📝" },
        { label: "PPT → PDF", icon: "📽️" }
      ]
    }
  ];

  const menus = Array.isArray(rawMenus) ? rawMenus : [];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1023) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) setActiveDropdown(null);
  };

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  useEffect(() => setMounted(true), []);

  const activeTheme = theme === "system" ? resolvedTheme : theme;

  const handleThemeToggle = () => {
    setTheme(activeTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className={styles["navbar"]}>
      <div className={styles["navbar-container"]}>

        {/* Logo */}
        <Link href="/" className={styles["navbar-logo"]} style={{ textDecoration: "none" }}>
          EaseMyTools
        </Link>

        {/* Desktop Menu */}
        <nav className={styles["navbar-desktop-nav"]}>
          {menus.map((menu, index) => (
            <div
              key={index}
              className={styles["nav-desktop-item"]}
              onMouseEnter={() => window.innerWidth > 1023 && setActiveDropdown(index)}
              onMouseLeave={() => window.innerWidth > 1023 && setActiveDropdown(null)}
            >
              <button className={styles["nav-desktop-link"]}>
                {menu.title}
                <span className={styles["desktop-arrow"]}>▾</span>
              </button>

              {activeDropdown === index && (
                <div className={styles["desktop-dropdown-panel"]}>
                  <div className={styles["desktop-dropdown-grid"]}>
                    {menu.items.map((item, i) => {
                      const slug = slugify(item.label);

                      return (
                        <Link
                          key={i}
                          href={`/${slug}`}
                          className={styles["desktop-dropdown-item"]}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setActiveDropdown(null);
                          }}
                        >
                          <div className={styles["dropdown-item-icon"]}>{item.icon}</div>
                          <div className={styles["dropdown-item-label"]}>{item.label}</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex">
          <div className={styles["navbar-actions"]}>
            <Link href="/login" className={styles["signin-btn"]}>
              Sign In
            </Link>
            <button className={styles["theme-toggle-btn"]} onClick={handleThemeToggle}>
              {!mounted ? "🌓 Theme" : activeTheme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>

          {/* Hamburger */}
          <button
            ref={hamburgerRef}
            className={`${styles["mobile-hamburger"]} ${isMenuOpen ? styles["active"] : ""}`}
            onClick={toggleMenu}
          >
            <div className={styles["hamburger-lines"]}>
              <span className={styles["line"]}></span>
              <span className={styles["line"]}></span>
              <span className={styles["line"]}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <>
            <div className={styles["mobile-menu-overlay"]} onClick={toggleMenu} />

            <nav ref={menuRef} className={styles["mobile-menu"]}>
              <div className={styles["mobile-menu-content"]}>
                {menus.map((menu, index) => (
                  <div key={index} className={styles["mobile-menu-item"]}>
                    <button
                      className={styles["mobile-menu-link"]}
                      onClick={() => toggleDropdown(index)}
                    >
                      {menu.title}
                    </button>

                    {activeDropdown === index && (
                      <div className={styles["mobile-dropdown-panel"]}>
                        {menu.items.map((item, i) => {
                          const slug = slugify(item.label);

                          return (
                            <Link
                              key={i}
                              href={`/${slug}`}
                              className={styles["mobile-dropdown-item"]}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                            >
                              {item.icon} {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;