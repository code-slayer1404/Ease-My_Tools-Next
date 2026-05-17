"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./styles.module.css";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const menus = [
    { title: "PDF", items: ["Merge PDF", "Split PDF", "Compress PDF"] },
    { title: "Image", items: ["Remove BG", "Resize", "Convert"] },
    { title: "Video", items: ["Compress", "Mute", "Convert"] },
    { title: "File", items: ["Split Excel", "Word → PDF", "PPT → PDF"] },
  ];

  const icons: Record<string, string> = {
    "Merge PDF": "📑", "Split PDF": "✂️", "Compress PDF": "📉",
    "Remove BG": "🖼️", "Resize": "📏", "Convert": "🔄",
    "Compress": "🎥", "Mute": "🔇",
    "Split Excel": "📊", "Word → PDF": "📝", "PPT → PDF": "📽️",
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const toggleTheme = () => setTheme(activeTheme === "dark" ? "light" : "dark");

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          EaseMyTools
        </Link>

        <div className={styles.desktopMenu}>
          {menus.map((menu, idx) => (
            <div
              key={idx}
              className={styles.dropdown}
              onMouseEnter={() => setOpenDropdown(idx)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className={styles.dropdownBtn}>
                {menu.title} <span className={styles.arrow}>▾</span>
              </button>
              {openDropdown === idx && (
                <div className={styles.dropdownPanel}>
                  {menu.items.map((item, i) => (
                    <Link
                      key={i}
                      href={`/tools/${item.toLowerCase().replace(/\s/g, "-")}`}
                      className={styles.dropdownItem}
                    >
                      <span className={styles.itemIcon}>{icons[item]}</span>
                      <span>{item}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.right}>
          {status === "loading" ? (
            <div className={styles.loader}>...</div>
          ) : session ? (
            // Desktop user menu only (hidden on mobile via CSS)
            <div className={styles.userMenu} ref={userDropdownRef}>
              <button
                className={styles.userBtn}
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <span className={styles.avatar}>
                  {session.user?.email?.[0].toUpperCase()}
                </span>
                <span className={styles.chevron}>▾</span>
              </button>
              {isUserDropdownOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userEmail}>{session.user?.email}</div>
                  <button onClick={() => signOut()} className={styles.signOutBtn}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.signInBtn}>
              Sign In
            </Link>
          )}
          <button className={styles.themeBtn} onClick={toggleTheme}>
            {!mounted
              ? "🌓 Theme"
              : activeTheme === "light"
                ? "🌙 Dark"
                : "☀️ Light"}
          </button>

          <button
            className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
          <div className={styles.mobileMenu} ref={mobileMenuRef}>
            <div className={styles.mobileHeader}>
              <span>Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.mobileContent}>
              {menus.map((menu, idx) => (
                <div key={idx} className={styles.mobileDropdown}>
                  <button
                    className={styles.mobileDropdownBtn}
                    onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                  >
                    {menu.title}
                    <span>{openDropdown === idx ? "▴" : "▾"}</span>
                  </button>
                  {openDropdown === idx && (
                    <div className={styles.mobileDropdownPanel}>
                      {menu.items.map((item, i) => (
                        <Link
                          key={i}
                          href={`/tools/${item.toLowerCase().replace(/\s/g, "-")}`}
                          className={styles.mobileDropdownItem}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className={styles.itemIcon}>{icons[item]}</span>
                          <span>{item}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className={styles.mobileAuth}>
                {session ? (
                  <>
                    <div className={styles.mobileUserEmail}>{session.user?.email}</div>
                    <button
                      onClick={() => signOut()}
                      className={styles.mobileSignOut}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" className={styles.mobileSignIn} onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;