"use client"

import React, { useState, useMemo, useCallback } from "react"

/* ---------- tiny lorem generator ---------- */
const WORDS = [
    "lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
    "consectetur",
    "adipiscing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua",
    "ut",
    "enim",
    "ad",
    "minim",
    "veniam",
    "quis",
    "nostrud",
    "exercitation",
    "ullamco",
    "laboris",
    "nisi",
    "ut",
    "aliquip",
    "ex",
    "ea",
    "commodo",
    "consequat",
    "duis",
    "aute",
    "irure",
    "dolor",
    "in",
    "reprehenderit",
    "in",
    "voluptate",
    "velit",
    "esse",
    "cillum",
    "dolore",
    "eu",
    "fugiat",
    "nulla",
    "pariatur",
    "excepteur",
    "sint",
    "occaecat",
    "cupidatat",
    "non",
    "proident",
    "sunt",
    "in",
    "culpa",
    "qui",
    "officia",
    "deserunt",
    "mollit",
    "anim",
    "id",
    "est",
    "laborum",
]

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateWords(count: number, startLorem: boolean): string {
    if (count <= 0) return ""
    const words: string[] = []
    if (startLorem && count >= 2) {
        words.push("lorem", "ipsum")
        for (let i = 2; i < count; i++)
            words.push(WORDS[randInt(2, WORDS.length - 1)])
    } else {
        for (let i = 0; i < count; i++)
            words.push(WORDS[randInt(0, WORDS.length - 1)])
    }
    return words.join(" ")
}

function generateSentences(count: number, startLorem: boolean): string {
    const sentences: string[] = []
    for (let i = 0; i < count; i++) {
        const wordCount = randInt(5, 15)
        const s = generateWords(wordCount, i === 0 && startLorem)
        sentences.push(s.charAt(0).toUpperCase() + s.slice(1) + ".")
    }
    return sentences.join(" ")
}

function generateParagraphs(count: number, startLorem: boolean): string {
    const paragraphs: string[] = []
    for (let i = 0; i < count; i++) {
        const sentenceCount = randInt(3, 8)
        paragraphs.push(generateSentences(sentenceCount, i === 0 && startLorem))
    }
    return paragraphs.join("\n\n")
}

function applyHtml(
    text: string,
    type: "paragraphs" | "words" | "sentences",
    includeUl: boolean
): string {
    if (type === "paragraphs") {
        let html = text
            .split("\n\n")
            .map((p) => `<p>${p}</p>`)
            .join("\n")
        if (includeUl) {
            const listItems = randInt(3, 5)
            const items = Array.from(
                { length: listItems },
                () => `<li>${generateWords(randInt(2, 5), false)}</li>`
            ).join("\n")
            html += `\n<ul>\n${items}\n</ul>`
        }
        return html
    }
    if (type === "sentences") {
        return text
            .split(". ")
            .filter(Boolean)
            .map((s) => `<p>${s}.</p>`)
            .join("\n")
    }
    return `<p>${text}</p>`
}

/* ---------- stat card (fixed spacing) ---------- */
const StatCard = ({
    label,
    value,
    accent,
}: {
    label: string
    value: string
    accent: "emerald" | "blue" | "violet" | "slate"
}) => {
    const accentMap = {
        emerald: "text-emerald-600 dark:text-emerald-400",
        blue: "text-blue-600 dark:text-blue-400",
        violet: "text-violet-600 dark:text-violet-400",
        slate: "text-slate-800 dark:text-slate-100",
    }
    return (
        <div className="flex flex-col gap-0.5 rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                {label}
            </span>
            <span
                className={`text-sm leading-tight font-bold tabular-nums ${accentMap[accent]}`}
            >
                {value}
            </span>
        </div>
    )
}

type GeneratorType = "paragraphs" | "words" | "sentences"

export default function LoremIpsumTool() {
    const [type, setType] = useState<GeneratorType>("paragraphs")
    const [count, setCount] = useState(5)
    const [startLorem, setStartLorem] = useState(true)
    const [includeHtml, setIncludeHtml] = useState(false)
    const [includeUl, setIncludeUl] = useState(false)
    const [copied, setCopied] = useState(false)
    const [seed, setSeed] = useState(0) // triggers new random output

    const generatedText = useMemo(() => {
        // Dummy read of seed forces regeneration
        void seed
        let raw = ""
        if (type === "paragraphs") raw = generateParagraphs(count, startLorem)
        else if (type === "sentences")
            raw = generateSentences(count, startLorem)
        else raw = generateWords(count, startLorem)

        if (includeHtml) return applyHtml(raw, type, includeUl)
        return raw
    }, [type, count, startLorem, includeHtml, includeUl, seed])

    const wordCount = useMemo(
        () => generatedText.split(/\s+/).filter(Boolean).length,
        [generatedText]
    )
    const charCount = generatedText.length
    const paragraphCount =
        type === "paragraphs" ? count : type === "sentences" ? 0 : 0

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(generatedText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [generatedText])

    const handleDownload = useCallback(() => {
        const blob = new Blob([generatedText], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `lorem-ipsum-${Date.now()}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [generatedText])

    const handleClear = useCallback(() => {
        setType("paragraphs")
        setCount(5)
        setStartLorem(true)
        setIncludeHtml(false)
        setIncludeUl(false)
    }, [])

    const handleGenerate = () => setSeed((s) => s + 1)

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-5xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    <div className="grid gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[1fr_1.05fr]">
                        {/* Left Panel – Controls */}
                        <div>
                            <div className="h-full rounded-xl border border-slate-200/80 bg-white/50 p-4 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                {/* Type selector */}
                                <div className="mb-5">
                                    <label className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Generate by
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {(
                                            [
                                                "paragraphs",
                                                "sentences",
                                                "words",
                                            ] as GeneratorType[]
                                        ).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setType(t)}
                                                className={`rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize transition ${
                                                    type === t
                                                        ? "border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                                                        : "border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Count */}
                                <div className="mb-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                            Number of {type}
                                        </label>
                                        <span className="text-base font-bold text-slate-800 tabular-nums dark:text-white">
                                            {count}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={1}
                                        max={
                                            type === "words"
                                                ? 500
                                                : type === "sentences"
                                                  ? 200
                                                  : 50
                                        }
                                        value={count}
                                        onChange={(e) =>
                                            setCount(Number(e.target.value))
                                        }
                                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500 dark:bg-slate-800"
                                    />
                                    <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                        <span>1</span>
                                        <span>
                                            {type === "words"
                                                ? 250
                                                : type === "sentences"
                                                  ? 100
                                                  : 25}
                                        </span>
                                        <span>
                                            {type === "words"
                                                ? 500
                                                : type === "sentences"
                                                  ? 200
                                                  : 50}
                                        </span>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="mb-5 space-y-3">
                                    <label className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-white">
                                                Start with "Lorem ipsum"
                                            </p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                Begin with the classic opener
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={startLorem}
                                            onClick={() =>
                                                setStartLorem(!startLorem)
                                            }
                                            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border transition-colors duration-200 ${
                                                startLorem
                                                    ? "border-blue-500 bg-blue-500"
                                                    : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-700"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                                    startLorem
                                                        ? "translate-x-4"
                                                        : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </label>

                                    <label className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-white">
                                                Include HTML markup
                                            </p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                Wrap in tags for web use
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={includeHtml}
                                            onClick={() =>
                                                setIncludeHtml(!includeHtml)
                                            }
                                            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border transition-colors duration-200 ${
                                                includeHtml
                                                    ? "border-blue-500 bg-blue-500"
                                                    : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-700"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                                    includeHtml
                                                        ? "translate-x-4"
                                                        : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </label>

                                    {includeHtml && type === "paragraphs" && (
                                        <label className="flex items-center justify-between gap-4 pl-2">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-800 dark:text-white">
                                                    Add unordered list
                                                </p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                    Append a &lt;ul&gt; block
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={includeUl}
                                                onClick={() =>
                                                    setIncludeUl(!includeUl)
                                                }
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border transition-colors duration-200 ${
                                                    includeUl
                                                        ? "border-blue-500 bg-blue-500"
                                                        : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-700"
                                                }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                                        includeUl
                                                            ? "translate-x-4"
                                                            : "translate-x-0"
                                                    }`}
                                                />
                                            </button>
                                        </label>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="mt-auto flex gap-2 pt-2">
                                    <button
                                        onClick={handleClear}
                                        className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-bold tracking-wide text-white shadow-sm shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow active:scale-[0.98]"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel – Output */}
                        <div className="h-full">
                            <div className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-white/50 p-4 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                {/* Output textarea */}
                                <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60">
                                    <textarea
                                        readOnly
                                        value={generatedText}
                                        className="custom-scrollbar h-full w-full resize-none rounded-lg bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-200"
                                    />
                                </div>

                                {/* Statistics (now with proper spacing) */}
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    <StatCard
                                        label="Words"
                                        value={wordCount.toString()}
                                        accent="blue"
                                    />
                                    <StatCard
                                        label="Characters"
                                        value={charCount.toString()}
                                        accent="violet"
                                    />
                                    <StatCard
                                        label="Paragraphs"
                                        value={
                                            paragraphCount > 0
                                                ? paragraphCount.toString()
                                                : "—"
                                        }
                                        accent="emerald"
                                    />
                                </div>

                                {/* Output action buttons */}
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="flex-1 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        {copied ? "✓ Copied" : "⎘ Copy"}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2 text-xs font-bold tracking-wide text-white shadow-sm transition hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98]"
                                    >
                                        ↓ Download .txt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollbar styles */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #94a3b8 #e2e8f0; }
        .dark .custom-scrollbar { scrollbar-color: #475569 #1e293b; }
      `}</style>
        </div>
    )
}
