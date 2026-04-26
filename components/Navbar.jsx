"use client";

// @ts-nocheck

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link"; // Added for SPA navigation
import "../styles/Navbar.css";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  console.log("navbar was rendered");

  const { theme, toggleTheme } = useTheme();
  const rawMenus = [{"title":"PDF","items":[{"label":"Merge PDF","icon":"📑"},{"label":"Split PDF","icon":"✂️"},{"label":"Compress PDF","icon":"📉"}]},{"title":"Image","items":[{"label":"Remove BG","icon":"🖼️"},{"label":"Resize","icon":"📏"},{"label":"Convert","icon":"🔄"}]},{"title":"Video","items":[{"label":"Compress","icon":"🎥"},{"label":"Mute","icon":"🔇"},{"label":"Convert","icon":"🔄"}]},{"title":"File","items":[{"label":"Split Excel","icon":"📊"},{"label":"Word → PDF","icon":"📝"},{"label":"PPT → PDF","icon":"📽️"}]}];
  const menus = Array.isArray(rawMenus) ? rawMenus : []; // defensive guard
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setActiveDropdown(null);
    }
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <header className={`navbar navbar-${theme}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo" style={{ textDecoration: "None" }}>
          EaseMyTools
        </Link>


        {/* Desktop Navigation Menu */}
        <nav className="navbar-desktop-nav">
          {menus.map((menu, index) => (
            <div
              className="nav-desktop-item"
              key={index}
              onMouseEnter={() =>
                window.innerWidth > 1023 && setActiveDropdown(index)
              }
              onMouseLeave={() =>
                window.innerWidth > 1023 && setActiveDropdown(null)
              }
            >
              <button className="nav-desktop-link">
                {menu.title}
                <span className="desktop-arrow">▾</span>
              </button>

              {/* Desktop Dropdown Panel */}
              {activeDropdown === index && (
                <div className="desktop-dropdown-panel">
                  <div className="desktop-dropdown-grid">
                    {menu.items.map((item, itemIndex) => (
                      <Link
                        key={itemIndex}
                        href={`/${item.id || ""}`}
                        className="desktop-dropdown-item"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setActiveDropdown(null);
                        }}
                      >
                        <div className="dropdown-item-icon">{item.icon}</div>
                        <div className="dropdown-item-label">{item.label}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex">
          {/* Desktop Action Buttons */}
          <div className="navbar-actions">
            <Link href="/login" className="signin-btn">
              Sign In
            </Link>
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            ref={hamburgerRef}
            className={`mobile-hamburger ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="hamburger-lines">
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <>
            <div className="mobile-menu-overlay" onClick={toggleMenu} />
            <nav ref={menuRef} className="mobile-menu">
              <div className="mobile-menu-header">
                <div className="mobile-menu-title">Menu</div>
                <button className="mobile-close-btn" onClick={toggleMenu}>
                  {/* ✕ */}
                </button>
              </div>

              <div className="mobile-menu-content">
                {menus.map((menu, index) => (
                  <div
                    className={`mobile-menu-item ${activeDropdown === index ? "active" : ""
                      }`}
                    key={index}
                  >
                    <button
                      className="mobile-menu-link"
                      onClick={() => toggleDropdown(index)}
                    >
                      <span>{menu.title}</span>
                      <span className="mobile-arrow">
                        {activeDropdown === index ? "▴" : "▾"}
                      </span>
                    </button>

                    {activeDropdown === index && (
                      <div className="mobile-dropdown-panel">
                        <div className="mobile-dropdown-grid">
                          {menu.items.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              href={`/${item.id || ""}`}
                              className="mobile-dropdown-item"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                            >
                              <div className="mobile-item-icon">{item.icon}</div>
                              <div className="mobile-item-label">{item.label}</div>
                            </Link>
                          ))}
                        </div>
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