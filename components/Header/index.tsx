"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const Header = () => {
    const words = [
        { text: "Everything", color: "#7C3AED" }, // Purple
        { text: "PDFs", color: "#E11D48" }, // Red
        { text: "Videos", color: "#2563EB" }, // Blue
        { text: "Images", color: "#059669" }, // Green
    ]

    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length)
        }, 2000)

        return () => clearInterval(interval)
    }, [words.length])

    const currentWord = words[index] || words[0]

    return (
        <section className="bg-background relative z-10 mt-8 flex flex-col items-center justify-center px-4 py-8 text-center">
            <h1 className="text-[38px] leading-tight font-bold tracking-tight text-foreground sm:text-6xl">
                Free Tools to Simplify{" "}
                {/* 
          Fixed-height container for the rotating word.
          Prevents layout shift without using weird CSS hacks.
        */}
                <span className="inline-flex h-[1.4em] min-w-[120px] items-center justify-center align-middle sm:min-w-[160px]">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={currentWord.text}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="round-ed-md px-3 py-1 whitespace-nowrap text-white shadow-sm"
                            style={{ backgroundColor: currentWord.color }}
                        >
                            {currentWord.text}
                        </motion.span>
                    </AnimatePresence>
                </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-muted-foreground opacity-90 sm:text-2xl">
                Smart online tools to edit, convert, and compress your PDFs,
                videos, and images instantly
            </p>
        </section>
    )
}

export default Header
