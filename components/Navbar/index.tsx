"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from './styles.module.css';
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  console.log("navbar was rendered");

  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  const rawMenus = [
    { title: "PDF", items: [{ label: "Merge PDF", icon: "📑" }, { label: "Split PDF", icon: "✂️" }, { label: "Compress PDF", icon: "📉" }] },
    { title: "Image", items: [{ label: "Remove BG", icon: "🖼️" }, { label: "Resize", icon: "📏" }, { label: "Convert", icon: "🔄" }] },
    { title: "Video", items: [{ label: "Compress", icon: "🎥" }, { label: "Mute", icon: "🔇" }, { label: "Convert", icon: "🔄" }] },
    { title: "File", items: [{ label: "Split Excel", icon: "📊" }, { label: "Word → PDF", icon: "📝" }, { label: "PPT → PDF", icon: "📽️" }] }
  ];

  const menus = Array.isArray(rawMenus) ? rawMenus : [];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Close menu on resize
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setActiveDropdown(null);
    }
  };

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = theme === "system" ? resolvedTheme : theme;

  const handleThemeToggle = () => {
    setTheme(activeTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className={styles["navbar"]}>
      <div className={styles["navbar-container"]}>

        <Link href={"/" as any} className={styles["navbar-logo"]} style={{ textDecoration: "None" }}>
          EaseMyTools
        </Link>

        <nav className={styles["navbar-desktop-nav"]}>
          {menus.map((menu, index) => (
            <div
              className={styles["nav-desktop-item"]}
              key={index}
              onMouseEnter={() =>
                window.innerWidth > 1023 && setActiveDropdown(index)
              }
              onMouseLeave={() =>
                window.innerWidth > 1023 && setActiveDropdown(null)
              }
            >
              <button className={styles["nav-desktop-link"]}>
                {menu.title}
                <span className={styles["desktop-arrow"]}>▾</span>
              </button>

              {activeDropdown === index && (
                <div className={styles["desktop-dropdown-panel"]}>
                  <div className={styles["desktop-dropdown-grid"]}>
                    {menu.items.map((item: any, itemIndex: number) => (
                      <Link
                        key={itemIndex}
                        href={`/${(item as any).id || ""}` as any}
                        className={styles["desktop-dropdown-item"]}
                        onClick={() => {
                          setIsMenuOpen(false);
                          setActiveDropdown(null);
                        }}
                      >
                        <div className={styles["dropdown-item-icon"]}>{item.icon}</div>
                        <div className={styles["dropdown-item-label"]}>{item.label}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={styles["navbar-right"]}>
          <div className={styles["navbar-actions"]}>
            {status === "loading" ? (
              <div className={styles["auth-loading"]}>...</div>
            ) : session ? (
              <div className={styles["user-menu"]}>
                <span className={styles["user-email"]}>
                  {session.user?.email?.split("@")[0]}
                </span>
                <button onClick={() => signOut()} className={styles["signout-btn"]}>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href={"/login" as any} className={styles["signin-btn"]}>
                Sign In
              </Link>
            )}
            <button className={styles["theme-toggle-btn"]} onClick={handleThemeToggle}>
              {!mounted ? "🌓 Theme" : activeTheme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>

          <button
            ref={hamburgerRef}
            className={`${styles["mobile-hamburger"]} ${isMenuOpen ? styles["active"] : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className={styles["hamburger-lines"]}>
              <span className={styles["line"]}></span>
              <span className={styles["line"]}></span>
              <span className={styles["line"]}></span>
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <>
            <div className={styles["mobile-menu-overlay"]} onClick={toggleMenu} />
            <nav ref={menuRef} className={styles["mobile-menu"]}>
              <div className={styles["mobile-menu-header"]}>
                <div className={styles["mobile-menu-title"]}>Menu</div>
                <button className={styles["mobile-close-btn"]} onClick={toggleMenu}>✕</button>
              </div>

              <div className={styles["mobile-menu-content"]}>
                {menus.map((menu, index) => (
                  <div
                    className={`${styles["mobile-menu-item"]} ${activeDropdown === index ? styles["active"] : ""}`}
                    key={index}
                  >
                    <button
                      className={styles["mobile-menu-link"]}
                      onClick={() => toggleDropdown(index)}
                    >
                      <span>{menu.title}</span>
                      <span className={styles["mobile-arrow"]}>
                        {activeDropdown === index ? "▴" : "▾"}
                      </span>
                    </button>

                    {activeDropdown === index && (
                      <div className={styles["mobile-dropdown-panel"]}>
                        <div className={styles["mobile-dropdown-grid"]}>
                          {menu.items.map((item: any, itemIndex: number) => (
                            <Link
                              key={itemIndex}
                              href={`/${(item as any).id || ""}` as any}
                              className={styles["mobile-dropdown-item"]}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                            >
                              <div className={styles["mobile-item-icon"]}>{item.icon}</div>
                              <div className={styles["mobile-item-label"]}>{item.label}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className={styles["mobile-auth-section"]}>
                  {status === "loading" ? (
                    <div className={styles["mobile-auth-loading"]}>Loading...</div>
                  ) : session ? (
                    <>
                      <div className={styles["mobile-user-email"]}>
                        {session.user?.email}
                      </div>
                      <button onClick={() => signOut()} className={styles["mobile-signout-btn"]}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link href={"/login" as any} className={styles["mobile-signin-btn"]} onClick={toggleMenu}>
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;