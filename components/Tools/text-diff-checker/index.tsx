"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import { diffWords, diffLines, diffChars, type Change } from "diff"

type DiffMode = "words" | "characters" | "lines"
type ViewMode = "unified" | "split"

const TextDiffChecker: React.FC = () => {
    const [textA, setTextA] = useState<string>(`function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("World"));`)

    const [textB, setTextB] = useState<string>(`function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));
console.log("Welcome!");`)

    const [diffResult, setDiffResult] = useState<Change[]>([])
    const [diffMode, setDiffMode] = useState<DiffMode>("lines")
    const [viewMode, setViewMode] = useState<ViewMode>("unified")
    const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false)
    const [caseSensitive, setCaseSensitive] = useState<boolean>(true)
    const [showStats, setShowStats] = useState<boolean>(true)

    // Function to compute diff
    const computeDiff = useCallback(() => {
        let text1 = textA
        let text2 = textB

        if (!caseSensitive) {
            text1 = text1.toLowerCase()
            text2 = text2.toLowerCase()
        }

        if (ignoreWhitespace) {
            text1 = text1.replace(/\s+/g, " ").trim()
            text2 = text2.replace(/\s+/g, " ").trim()
        }

        let diff: Change[]
        switch (diffMode) {
            case "characters":
                diff = diffChars(text1, text2)
                break
            case "lines":
                diff = diffLines(text1, text2)
                break
            case "words":
            default:
                diff = diffWords(text1, text2)
                break
        }
        setDiffResult(diff)
    }, [textA, textB, diffMode, ignoreWhitespace, caseSensitive])

    // Auto‑compare on any relevant change
    useEffect(() => {
        computeDiff()
    }, [computeDiff])

    const handleSwap = useCallback(() => {
        setTextA(textB)
        setTextB(textA)
    }, [textA, textB])

    const handleClear = useCallback(() => {
        setTextA("")
        setTextB("")
        setDiffResult([])
    }, [])

    const handleLoadSample = useCallback(() => {
        setTextA(`const calculateTotal = (items) => {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price;
    }
    return total;
};`)
        setTextB(`const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price, 0);
};`)
    }, [])

    // Helper to count units (lines/words/chars) in a string based on diffMode
    const countUnits = useCallback(
        (str: string): number => {
            if (diffMode === "lines") {
                // Count lines (empty lines count as 1)
                const lines = str.split("\n")
                return lines.length
            } else if (diffMode === "words") {
                // Count words (split by whitespace, ignore empty)
                return str
                    .trim()
                    .split(/\s+/)
                    .filter((w) => w.length > 0).length
            } else {
                // characters
                return str.length
            }
        },
        [diffMode]
    )

    // Compute stats based on diffMode
    const getDiffStats = useMemo(() => {
        let added = 0
        let removed = 0
        let unchanged = 0

        diffResult.forEach((part) => {
            const count = countUnits(part.value)
            if (part.added) added += count
            else if (part.removed) removed += count
            else unchanged += count
        })

        const unitLabel =
            diffMode === "lines"
                ? "lines"
                : diffMode === "words"
                  ? "words"
                  : "chars"
        return { added, removed, unchanged, total: added + removed, unitLabel }
    }, [diffResult, diffMode, countUnits])

    const copyDiff = useCallback(() => {
        const diffText = diffResult
            .map((part) => {
                if (part.added) return `[+] ${part.value}`
                if (part.removed) return `[-] ${part.value}`
                return `    ${part.value}`
            })
            .join("")
        navigator.clipboard.writeText(diffText)
        alert("Diff copied to clipboard!")
    }, [diffResult])

    const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #e2e8f0;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-track {
      background: #1e293b;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #475569;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 #e2e8f0;
    }
    .dark .custom-scrollbar {
      scrollbar-color: #475569 #1e293b;
    }
  `

    // Unified diff with line numbers (sequential numbering over all displayed lines)
    const renderUnifiedDiff = () => {
        let lineNumber = 1
        const elements: JSX.Element[] = []

        diffResult.forEach((part, index) => {
            const isAdded = part.added
            const isRemoved = part.removed
            const lines = part.value.split("\n")
            lines.forEach((line, lineIndex) => {
                const displayLine = line === "" && lines.length > 1 ? " " : line
                elements.push(
                    <div
                        key={`${index}-${lineIndex}`}
                        className={`flex border-b border-slate-100 dark:border-slate-800 ${
                            isAdded
                                ? "bg-green-100 text-green-900 dark:bg-green-900/60 dark:text-green-100"
                                : isRemoved
                                  ? "bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-100"
                                  : ""
                        }`}
                    >
                        <div className="w-8 flex-shrink-0 border-r border-slate-200 py-0.5 text-right text-xs text-slate-400 select-none dark:border-slate-700">
                            {lineNumber}
                        </div>
                        <div className="w-8 flex-shrink-0 py-0.5 text-right font-mono text-xs text-slate-500 select-none">
                            {isAdded ? "+" : isRemoved ? "-" : " "}
                        </div>
                        <pre className="flex-1 py-0.5 pl-2 break-all whitespace-pre-wrap">
                            {displayLine}
                        </pre>
                    </div>
                )
                lineNumber++
            })
        })
        return <div className="font-mono text-xs">{elements}</div>
    }

    // Split diff with line numbers (separate numbering for left and right columns)
    const renderSplitDiff = () => {
        const leftItems: {
            line: string
            type: "removed" | "unchanged" | null
        }[] = []
        const rightItems: {
            line: string
            type: "added" | "unchanged" | null
        }[] = []

        diffResult.forEach((part) => {
            if (part.removed) {
                part.value.split("\n").forEach((line) => {
                    leftItems.push({ line, type: "removed" })
                    rightItems.push({ line: "", type: null })
                })
            } else if (part.added) {
                part.value.split("\n").forEach((line) => {
                    rightItems.push({ line, type: "added" })
                    leftItems.push({ line: "", type: null })
                })
            } else {
                part.value.split("\n").forEach((line) => {
                    leftItems.push({ line, type: "unchanged" })
                    rightItems.push({ line, type: "unchanged" })
                })
            }
        })

        const maxLen = Math.max(leftItems.length, rightItems.length)
        while (leftItems.length < maxLen)
            leftItems.push({ line: "", type: null })
        while (rightItems.length < maxLen)
            rightItems.push({ line: "", type: null })

        return (
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        Original
                    </div>
                    <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
                        {leftItems.map((item, idx) => (
                            <div
                                key={`left-${idx}`}
                                className={`flex border-b border-slate-100 dark:border-slate-800 ${
                                    item.type === "removed"
                                        ? "bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-100"
                                        : ""
                                }`}
                            >
                                <div className="w-10 flex-shrink-0 border-r border-slate-200 px-1 py-0.5 text-right text-xs text-slate-400 dark:border-slate-700">
                                    {idx + 1}
                                </div>
                                <pre className="flex-1 px-2 py-0.5 text-xs break-all whitespace-pre-wrap">
                                    {item.line === "" ? " " : item.line}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        Modified
                    </div>
                    <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
                        {rightItems.map((item, idx) => (
                            <div
                                key={`right-${idx}`}
                                className={`flex border-b border-slate-100 dark:border-slate-800 ${
                                    item.type === "added"
                                        ? "bg-green-100 text-green-900 dark:bg-green-900/60 dark:text-green-100"
                                        : ""
                                }`}
                            >
                                <div className="w-10 flex-shrink-0 border-r border-slate-200 px-1 py-0.5 text-right text-xs text-slate-400 dark:border-slate-700">
                                    {idx + 1}
                                </div>
                                <pre className="flex-1 px-2 py-0.5 text-xs break-all whitespace-pre-wrap">
                                    {item.line === "" ? " " : item.line}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-6xl">
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    <div className="space-y-5 p-5 sm:p-6">
                        {/* Toolbar – mobile-friendly */}
                        <div className="border-b-2 border-slate-300/90 bg-slate-100/50 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-5 sm:py-3 dark:border-slate-600/80 dark:bg-slate-800/40 dark:shadow-black/10">
                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Diff Mode
                                    </label>
                                    <select
                                        value={diffMode}
                                        onChange={(e) =>
                                            setDiffMode(
                                                e.target.value as DiffMode
                                            )
                                        }
                                        className="rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                    >
                                        <option value="words">Words</option>
                                        <option value="characters">
                                            Characters
                                        </option>
                                        <option value="lines">Lines</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        View Mode
                                    </label>
                                    <select
                                        value={viewMode}
                                        onChange={(e) =>
                                            setViewMode(
                                                e.target.value as ViewMode
                                            )
                                        }
                                        className="rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                    >
                                        <option value="unified">
                                            Unified View
                                        </option>
                                        <option value="split">
                                            Split View
                                        </option>
                                    </select>
                                </div>

                                <div className="hidden h-6 w-px bg-slate-300 sm:block dark:bg-slate-700" />

                                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={ignoreWhitespace}
                                            onChange={(e) =>
                                                setIgnoreWhitespace(
                                                    e.target.checked
                                                )
                                            }
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                        />
                                        Ignore Whitespace
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={caseSensitive}
                                            onChange={(e) =>
                                                setCaseSensitive(
                                                    e.target.checked
                                                )
                                            }
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                        />
                                        Case Sensitive
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={showStats}
                                            onChange={(e) =>
                                                setShowStats(e.target.checked)
                                            }
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                        />
                                        Show Statistics
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Text Input Panels */}
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="rounded-xl border border-slate-300 bg-white/50 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/80 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        📄 Original Text
                                    </span>
                                    <button
                                        onClick={() => setTextA("")}
                                        className="rounded p-1 text-sm text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <textarea
                                    className="custom-scrollbar h-64 w-full resize-none rounded-b-xl bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
                                    placeholder="Enter original text here..."
                                    value={textA}
                                    onChange={(e) => setTextA(e.target.value)}
                                />
                            </div>
                            <div className="rounded-xl border border-slate-300 bg-white/50 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/80 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        📝 Modified Text
                                    </span>
                                    <button
                                        onClick={() => setTextB("")}
                                        className="rounded p-1 text-sm text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <textarea
                                    className="custom-scrollbar h-64 w-full resize-none rounded-b-xl bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
                                    placeholder="Enter modified text here..."
                                    value={textB}
                                    onChange={(e) => setTextB(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={computeDiff}
                                    className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold tracking-wide text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                                >
                                    🔄 Compare Texts
                                </button>
                                <button
                                    onClick={handleSwap}
                                    className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    ⇄ Swap Texts
                                </button>
                                <button
                                    onClick={handleLoadSample}
                                    className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    📋 Load Sample
                                </button>
                                <button
                                    onClick={handleClear}
                                    className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    🗑️ Clear All
                                </button>
                                {diffResult.length > 0 && (
                                    <button
                                        onClick={copyDiff}
                                        className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        📋 Copy Diff
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Statistics Cards – now with correct units based on diffMode */}
                        {showStats && diffResult.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                    <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                        Added
                                    </div>
                                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        +{getDiffStats.added}{" "}
                                        {getDiffStats.unitLabel}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                    <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                        Removed
                                    </div>
                                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                        -{getDiffStats.removed}{" "}
                                        {getDiffStats.unitLabel}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                    <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                        Unchanged
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {getDiffStats.unchanged}{" "}
                                        {getDiffStats.unitLabel}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                    <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                        Total Changes
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {getDiffStats.total}{" "}
                                        {getDiffStats.unitLabel}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Diff Output */}
                        {diffResult.length > 0 && (
                            <div className="rounded-xl border border-slate-300 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/80 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        Difference Result
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {viewMode === "unified"
                                            ? "Green = Added, Red = Removed"
                                            : "Left = Removed, Right = Added"}
                                    </span>
                                </div>
                                <div className="custom-scrollbar max-h-[500px] overflow-auto p-4">
                                    {viewMode === "unified"
                                        ? renderUnifiedDiff()
                                        : renderSplitDiff()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{scrollbarStyles}</style>
        </div>
    )
}

export default TextDiffChecker
