"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"

// Official shadcn/ui structural components
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

const menus = [
    { title: "PDF", items: ["Merge PDF", "Split PDF", "Compress PDF"] },
    { title: "Image", items: ["Remove BG", "Resize", "Convert"] },
    { title: "Video", items: ["Compress", "Mute", "Convert"] },
    { title: "File", items: ["Split Excel", "Word → PDF", "PPT → PDF"] },
]

const icons: Record<string, string> = {
    "Merge PDF": "📑",
    "Split PDF": "✂️",
    "Compress PDF": "📉",
    "Remove BG": "🖼️",
    Resize: "📏",
    Convert: "🔄",
    Compress: "🎥",
    Mute: "🔇",
    "Split Excel": "📊",
    "Word → PDF": "📝",
    "PPT → PDF": "📽️",
}

const ChevronDown = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
        stroke="currentColor"
        className={`h-3 w-3 transition-transform duration-200 ${className || ""}`}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
    </svg>
)

const Navbar = () => {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const { data: session, status } = useSession()
    const [mounted, setMounted] = useState(false)
    const [openMobileMenu, setOpenMobileMenu] = useState(false)
    const [mobileDropdown, setMobileDropdown] = useState<number | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Window resize listener to automatically dismiss the mobile menu state
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setOpenMobileMenu(false)
                setMobileDropdown(null)
            }
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const activeTheme = theme === "system" ? resolvedTheme : theme
    const toggleTheme = () =>
        setTheme(activeTheme === "dark" ? "light" : "dark")
    const getToolPath = (item: string) => {
        return {
            pathname: `/tools/tool/${item.toLowerCase().replace(/\s/g, "-")}`,
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-400/90 bg-gray-200/80 shadow-lg shadow-gray-400 backdrop-blur-md transition-colors duration-300 dark:border-gray-700/90 dark:bg-gray-950/80 dark:shadow-none">
            {/* 
        Used arbitrary values [..] on the `lg:` prefix to simulate 
        a 16px root font-size on desktop ONLY for this navbar.
        Mobile keeps the global 14px root.
      */}
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[64px] lg:max-w-[1280px] lg:px-[32px]">
                {/* Brand Logo - scales to 24px on desktop */}
                <Link
                    href="/"
                    className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent transition-transform select-none active:scale-98 lg:text-[24px]"
                >
                    EaseMyTools
                </Link>

                {/* Desktop Navigation Menu Links */}
                <nav className="hidden items-center lg:flex lg:gap-[8px]">
                    {menus.map((menu, idx) => (
                        <DropdownMenu key={idx}>
                            <DropdownMenuTrigger className="group flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-all outline-none hover:bg-gray-100/80 hover:text-gray-900 data-[state=open]:bg-gray-100/80 lg:gap-[6px] lg:rounded-[12px] lg:px-[16px] lg:py-[8px] lg:text-[16px] dark:text-gray-300 dark:hover:bg-gray-900/80 dark:hover:text-white dark:data-[state=open]:bg-gray-900/80">
                                {menu.title}
                                <ChevronDown className="text-gray-400 group-data-[state=open]:rotate-180" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="center"
                                sideOffset={8}
                                className="w-48 rounded-xl border border-gray-200/60 bg-white p-1.5 shadow-xl lg:w-[192px] dark:border-gray-800 dark:bg-gray-900"
                            >
                                {menu.items.map((item, i) => (
                                    <DropdownMenuItem key={i} asChild>
                                        <Link
                                            href={getToolPath(item)}
                                            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition-colors outline-none hover:bg-gray-100 lg:text-[16px] dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            <span className="text-base">
                                                {icons[item]}
                                            </span>
                                            <span>{item}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ))}
                </nav>

                {/* Global Controls Array */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Global User Authentication Blocks - Visible on ALL screen sizes */}
                    {status === "loading" ? (
                        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                    ) : session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 p-1 transition-all outline-none hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-inner lg:h-[32px] lg:w-[32px] lg:text-[16px]">
                                    {session.user?.email
                                        ?.charAt(0)
                                        .toUpperCase() || "?"}
                                </div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="center"
                                sideOffset={8}
                                className="w-56 rounded-xl border border-gray-200/60 bg-white p-1.5 shadow-xl lg:w-[224px] dark:border-gray-800 dark:bg-gray-900"
                            >
                                <div className="mb-1 truncate border-b border-gray-100 px-3 py-2 text-xs font-medium text-gray-400 lg:text-[12px] dark:border-gray-800">
                                    {session.user?.name}
                                </div>

                                <div className="mb-1 truncate border-b border-gray-100 px-3 py-2 text-xs font-medium text-gray-400 lg:text-[12px] dark:border-gray-800">
                                    <Link href={"/dashboard"}>Dashboard</Link>
                                </div>

                                <DropdownMenuItem asChild>
                                    <button
                                        onClick={() => signOut()}
                                        className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 transition-colors outline-none hover:bg-red-50 lg:text-[16px] dark:text-red-400 dark:hover:bg-red-950/30"
                                    >
                                        Sign Out
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3 text-sm font-medium text-white shadow-md shadow-indigo-500/10 transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 lg:h-[40px] lg:rounded-[12px] lg:px-[12px] lg:text-[16px]"
                        >
                            Sign In
                        </Link>
                    )}

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="flex h-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50 active:scale-95 lg:h-[40px] lg:rounded-[12px] lg:px-[12px] lg:text-[16px] dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
                        aria-label="Toggle Theme"
                    >
                        {!mounted
                            ? "🌓"
                            : activeTheme === "light"
                              ? "🌙 Dark"
                              : "☀️ Light"}
                    </button>

                    {/* Mobile Shell Drawer Trigger */}
                    <Sheet
                        open={openMobileMenu}
                        onOpenChange={setOpenMobileMenu}
                    >
                        <SheetTrigger asChild>
                            <button
                                className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[4px] rounded-xl border border-gray-200 text-gray-600 transition-all active:bg-gray-50 lg:hidden dark:border-gray-800 dark:text-gray-300 dark:active:bg-gray-900"
                                aria-label="Open Menu"
                            >
                                <span
                                    className={`h-[2px] w-5 rounded-full bg-current transition-transform ${openMobileMenu ? "translate-y-[6px] rotate-45" : ""}`}
                                />
                                <span
                                    className={`h-[2px] w-5 rounded-full bg-current transition-opacity ${openMobileMenu ? "opacity-0" : ""}`}
                                />
                                <span
                                    className={`h-[2px] w-5 rounded-full bg-current transition-transform ${openMobileMenu ? "-translate-y-[6px] -rotate-45" : ""}`}
                                />
                            </button>
                        </SheetTrigger>

                        <SheetContent
                            side="right"
                            className="flex w-full max-w-[290px] flex-col justify-between border-l border-gray-200 bg-white p-5 outline-none dark:border-gray-800 dark:bg-gray-950 [&>button]:hidden"
                        >
                            <div className="overflow-y-auto">
                                <SheetHeader className="mb-4 flex flex-row items-center justify-between space-y-0 border-b border-gray-100 pb-3.5 text-left dark:border-gray-900">
                                    <SheetTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                        Menu
                                    </SheetTitle>

                                    {/* Custom sized close button */}
                                    <button
                                        onClick={() => setOpenMobileMenu(false)}
                                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
                                        aria-label="Close Menu"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2.5"
                                            stroke="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </SheetHeader>

                                {/* Submenus Accordion Stack - Mobile stays strictly at 14px root scale */}
                                <div className="space-y-2.5">
                                    {menus.map((menu, idx) => {
                                        const isDropdownOpen =
                                            mobileDropdown === idx
                                        return (
                                            <div
                                                key={idx}
                                                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40"
                                            >
                                                <button
                                                    onClick={() =>
                                                        setMobileDropdown(
                                                            isDropdownOpen
                                                                ? null
                                                                : idx
                                                        )
                                                    }
                                                    className="flex w-full cursor-pointer items-center justify-between p-4 text-sm font-semibold text-gray-700 hover:bg-gray-100/50 dark:text-gray-200 dark:hover:bg-gray-900/60"
                                                >
                                                    {menu.title}
                                                    <ChevronDown
                                                        className={
                                                            isDropdownOpen
                                                                ? "rotate-180 text-indigo-500"
                                                                : "text-gray-400"
                                                        }
                                                    />
                                                </button>

                                                {isDropdownOpen && (
                                                    <div className="grid grid-cols-1 gap-1 border-t border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-950">
                                                        {menu.items.map(
                                                            (item, i) => (
                                                                <Link
                                                                    key={i}
                                                                    href={getToolPath(
                                                                        item
                                                                    )}
                                                                    onClick={() =>
                                                                        setOpenMobileMenu(
                                                                            false
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                                                                >
                                                                    <span className="shrink-0 text-base">
                                                                        {
                                                                            icons[
                                                                                item
                                                                            ]
                                                                        }
                                                                    </span>
                                                                    <span className="truncate">
                                                                        {item}
                                                                    </span>
                                                                </Link>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

export default Navbar
