// "use client"

// import React, { useState, useCallback, useMemo, useEffect } from "react"
// import { diffWords, diffLines, diffChars, type Change } from "diff"

// type DiffMode = "words" | "characters" | "lines"
// type ViewMode = "unified" | "split"

// const TextDiffChecker: React.FC = () => {
//     const [textA, setTextA] = useState<string>(`function greet(name) {
//     return "Hello, " + name + "!";
// }

// console.log(greet("World"));`)

//     const [textB, setTextB] = useState<string>(`function greet(name) {
//     return \`Hello, \${name}!\`;
// }

// console.log(greet("Developer"));
// console.log("Welcome!");`)

//     const [diffResult, setDiffResult] = useState<Change[]>([])
//     const [diffMode, setDiffMode] = useState<DiffMode>("lines")
//     const [viewMode, setViewMode] = useState<ViewMode>("unified")
//     const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false)
//     const [caseSensitive, setCaseSensitive] = useState<boolean>(true)
//     const [showStats, setShowStats] = useState<boolean>(true)

//     // Function to compute diff
//     const computeDiff = useCallback(() => {
//         let text1 = textA
//         let text2 = textB

//         if (!caseSensitive) {
//             text1 = text1.toLowerCase()
//             text2 = text2.toLowerCase()
//         }

//         if (ignoreWhitespace) {
//             text1 = text1.replace(/\s+/g, " ").trim()
//             text2 = text2.replace(/\s+/g, " ").trim()
//         }

//         let diff: Change[]
//         switch (diffMode) {
//             case "characters":
//                 diff = diffChars(text1, text2)
//                 break
//             case "lines":
//                 diff = diffLines(text1, text2)
//                 break
//             case "words":
//             default:
//                 diff = diffWords(text1, text2)
//                 break
//         }
//         setDiffResult(diff)
//     }, [textA, textB, diffMode, ignoreWhitespace, caseSensitive])

//     // Auto‑compare on any relevant change
//     useEffect(() => {
//         computeDiff()
//     }, [computeDiff])

//     const handleSwap = useCallback(() => {
//         setTextA(textB)
//         setTextB(textA)
//     }, [textA, textB])

//     const handleClear = useCallback(() => {
//         setTextA("")
//         setTextB("")
//         setDiffResult([])
//     }, [])

//     const handleLoadSample = useCallback(() => {
//         setTextA(`const calculateTotal = (items) => {
//     let total = 0;
//     for (let i = 0; i < items.length; i++) {
//         total += items[i].price;
//     }
//     return total;
// };`)
//         setTextB(`const calculateTotal = (items) => {
//     return items.reduce((sum, item) => sum + item.price, 0);
// };`)
//     }, [])

//     // Helper to count units (lines/words/chars) in a string based on diffMode
//     const countUnits = useCallback(
//         (str: string): number => {
//             if (diffMode === "lines") {
//                 // Count lines (empty lines count as 1)
//                 const lines = str.split("\n")
//                 return lines.length
//             } else if (diffMode === "words") {
//                 // Count words (split by whitespace, ignore empty)
//                 return str
//                     .trim()
//                     .split(/\s+/)
//                     .filter((w) => w.length > 0).length
//             } else {
//                 // characters
//                 return str.length
//             }
//         },
//         [diffMode]
//     )

//     // Compute stats based on diffMode
//     const getDiffStats = useMemo(() => {
//         let added = 0
//         let removed = 0
//         let unchanged = 0

//         diffResult.forEach((part) => {
//             const count = countUnits(part.value)
//             if (part.added) added += count
//             else if (part.removed) removed += count
//             else unchanged += count
//         })

//         const unitLabel =
//             diffMode === "lines"
//                 ? "lines"
//                 : diffMode === "words"
//                   ? "words"
//                   : "chars"
//         return { added, removed, unchanged, total: added + removed, unitLabel }
//     }, [diffResult, diffMode, countUnits])

//     const copyDiff = useCallback(() => {
//         const diffText = diffResult
//             .map((part) => {
//                 if (part.added) return `[+] ${part.value}`
//                 if (part.removed) return `[-] ${part.value}`
//                 return `    ${part.value}`
//             })
//             .join("")
//         navigator.clipboard.writeText(diffText)
//         alert("Diff copied to clipboard!")
//     }, [diffResult])

//     const scrollbarStyles = `
//     .custom-scrollbar::-webkit-scrollbar {
//       width: 6px;
//       height: 6px;
//     }
//     .custom-scrollbar::-webkit-scrollbar-track {
//       background: #e2e8f0;
//       border-radius: 10px;
//     }
//     .custom-scrollbar::-webkit-scrollbar-thumb {
//       background: #94a3b8;
//       border-radius: 10px;
//     }
//     .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//       background: #64748b;
//     }
//     .dark .custom-scrollbar::-webkit-scrollbar-track {
//       background: #1e293b;
//     }
//     .dark .custom-scrollbar::-webkit-scrollbar-thumb {
//       background: #475569;
//     }
//     .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//       background: #64748b;
//     }
//     .custom-scrollbar {
//       scrollbar-width: thin;
//       scrollbar-color: #94a3b8 #e2e8f0;
//     }
//     .dark .custom-scrollbar {
//       scrollbar-color: #475569 #1e293b;
//     }
//   `

//     // Unified diff with line numbers (sequential numbering over all displayed lines)
//     const renderUnifiedDiff = () => {
//         let lineNumber = 1
//         const elements: JSX.Element[] = []

//         diffResult.forEach((part, index) => {
//             const isAdded = part.added
//             const isRemoved = part.removed
//             const lines = part.value.split("\n")
//             lines.forEach((line, lineIndex) => {
//                 const displayLine = line === "" && lines.length > 1 ? " " : line
//                 elements.push(
//                     <div
//                         key={`${index}-${lineIndex}`}
//                         className={`flex border-b border-slate-100 dark:border-slate-800 ${
//                             isAdded
//                                 ? "bg-green-100 text-green-900 dark:bg-green-900/60 dark:text-green-100"
//                                 : isRemoved
//                                   ? "bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-100"
//                                   : ""
//                         }`}
//                     >
//                         <div className="w-8 flex-shrink-0 border-r border-slate-200 py-0.5 text-right text-xs text-slate-400 select-none dark:border-slate-700">
//                             {lineNumber}
//                         </div>
//                         <div className="w-8 flex-shrink-0 py-0.5 text-right font-mono text-xs text-slate-500 select-none">
//                             {isAdded ? "+" : isRemoved ? "-" : " "}
//                         </div>
//                         <pre className="flex-1 py-0.5 pl-2 break-all whitespace-pre-wrap">
//                             {displayLine}
//                         </pre>
//                     </div>
//                 )
//                 lineNumber++
//             })
//         })
//         return <div className="font-mono text-xs">{elements}</div>
//     }

//     // Split diff with line numbers (separate numbering for left and right columns)
//     const renderSplitDiff = () => {
//         const leftItems: {
//             line: string
//             type: "removed" | "unchanged" | null
//         }[] = []
//         const rightItems: {
//             line: string
//             type: "added" | "unchanged" | null
//         }[] = []

//         diffResult.forEach((part) => {
//             if (part.removed) {
//                 part.value.split("\n").forEach((line) => {
//                     leftItems.push({ line, type: "removed" })
//                     rightItems.push({ line: "", type: null })
//                 })
//             } else if (part.added) {
//                 part.value.split("\n").forEach((line) => {
//                     rightItems.push({ line, type: "added" })
//                     leftItems.push({ line: "", type: null })
//                 })
//             } else {
//                 part.value.split("\n").forEach((line) => {
//                     leftItems.push({ line, type: "unchanged" })
//                     rightItems.push({ line, type: "unchanged" })
//                 })
//             }
//         })

//         const maxLen = Math.max(leftItems.length, rightItems.length)
//         while (leftItems.length < maxLen)
//             leftItems.push({ line: "", type: null })
//         while (rightItems.length < maxLen)
//             rightItems.push({ line: "", type: null })

//         return (
//             <div className="grid grid-cols-2 gap-4">
//                 <div>
//                     <div className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
//                         Original
//                     </div>
//                     <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
//                         {leftItems.map((item, idx) => (
//                             <div
//                                 key={`left-${idx}`}
//                                 className={`flex border-b border-slate-100 dark:border-slate-800 ${
//                                     item.type === "removed"
//                                         ? "bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-100"
//                                         : ""
//                                 }`}
//                             >
//                                 <div className="w-10 flex-shrink-0 border-r border-slate-200 px-1 py-0.5 text-right text-xs text-slate-400 dark:border-slate-700">
//                                     {idx + 1}
//                                 </div>
//                                 <pre className="flex-1 px-2 py-0.5 text-xs break-all whitespace-pre-wrap">
//                                     {item.line === "" ? " " : item.line}
//                                 </pre>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//                 <div>
//                     <div className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
//                         Modified
//                     </div>
//                     <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
//                         {rightItems.map((item, idx) => (
//                             <div
//                                 key={`right-${idx}`}
//                                 className={`flex border-b border-slate-100 dark:border-slate-800 ${
//                                     item.type === "added"
//                                         ? "bg-green-100 text-green-900 dark:bg-green-900/60 dark:text-green-100"
//                                         : ""
//                                 }`}
//                             >
//                                 <div className="w-10 flex-shrink-0 border-r border-slate-200 px-1 py-0.5 text-right text-xs text-slate-400 dark:border-slate-700">
//                                     {idx + 1}
//                                 </div>
//                                 <pre className="flex-1 px-2 py-0.5 text-xs break-all whitespace-pre-wrap">
//                                     {item.line === "" ? " " : item.line}
//                                 </pre>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
//             <div className="w-full max-w-6xl">
//                 <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
//                     <div className="space-y-5 p-5 sm:p-6">
//                         {/* Toolbar – mobile-friendly */}
//                         <div className="border-b-2 border-slate-300/90 bg-slate-100/50 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-5 sm:py-3 dark:border-slate-600/80 dark:bg-slate-800/40 dark:shadow-black/10">
//                             <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
//                                 <div className="flex items-center gap-2">
//                                     <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
//                                         Diff Mode
//                                     </label>
//                                     <select
//                                         value={diffMode}
//                                         onChange={(e) =>
//                                             setDiffMode(
//                                                 e.target.value as DiffMode
//                                             )
//                                         }
//                                         className="rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
//                                     >
//                                         <option value="words">Words</option>
//                                         <option value="characters">
//                                             Characters
//                                         </option>
//                                         <option value="lines">Lines</option>
//                                     </select>
//                                 </div>

//                                 <div className="flex items-center gap-2">
//                                     <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
//                                         View Mode
//                                     </label>
//                                     <select
//                                         value={viewMode}
//                                         onChange={(e) =>
//                                             setViewMode(
//                                                 e.target.value as ViewMode
//                                             )
//                                         }
//                                         className="rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
//                                     >
//                                         <option value="unified">
//                                             Unified View
//                                         </option>
//                                         <option value="split">
//                                             Split View
//                                         </option>
//                                     </select>
//                                 </div>

//                                 <div className="hidden h-6 w-px bg-slate-300 sm:block dark:bg-slate-700" />

//                                 <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
//                                     <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
//                                         <input
//                                             type="checkbox"
//                                             checked={ignoreWhitespace}
//                                             onChange={(e) =>
//                                                 setIgnoreWhitespace(
//                                                     e.target.checked
//                                                 )
//                                             }
//                                             className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
//                                         />
//                                         Ignore Whitespace
//                                     </label>
//                                     <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
//                                         <input
//                                             type="checkbox"
//                                             checked={caseSensitive}
//                                             onChange={(e) =>
//                                                 setCaseSensitive(
//                                                     e.target.checked
//                                                 )
//                                             }
//                                             className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
//                                         />
//                                         Case Sensitive
//                                     </label>
//                                     <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
//                                         <input
//                                             type="checkbox"
//                                             checked={showStats}
//                                             onChange={(e) =>
//                                                 setShowStats(e.target.checked)
//                                             }
//                                             className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
//                                         />
//                                         Show Statistics
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Text Input Panels */}
//                         <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
//                             <div className="rounded-xl border border-slate-300 bg-white/50 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
//                                 <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/80 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
//                                     <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
//                                         📄 Original Text
//                                     </span>
//                                     <button
//                                         onClick={() => setTextA("")}
//                                         className="rounded p-1 text-sm text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
//                                     >
//                                         🗑️
//                                     </button>
//                                 </div>
//                                 <textarea
//                                     className="custom-scrollbar h-64 w-full resize-none rounded-b-xl bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
//                                     placeholder="Enter original text here..."
//                                     value={textA}
//                                     onChange={(e) => setTextA(e.target.value)}
//                                 />
//                             </div>
//                             <div className="rounded-xl border border-slate-300 bg-white/50 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
//                                 <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/80 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
//                                     <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
//                                         📝 Modified Text
//                                     </span>
//                                     <button
//                                         onClick={() => setTextB("")}
//                                         className="rounded p-1 text-sm text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
//                                     >
//                                         🗑️
//                                     </button>
//                                 </div>
//                                 <textarea
//                                     className="custom-scrollbar h-64 w-full resize-none rounded-b-xl bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
//                                     placeholder="Enter modified text here..."
//                                     value={textB}
//                                     onChange={(e) => setTextB(e.target.value)}
//                                 />
//                             </div>
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex justify-center">
//                             <div className="flex flex-wrap gap-3">
//                                 <button
//                                     onClick={computeDiff}
//                                     className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold tracking-wide text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
//                                 >
//                                     🔄 Compare Texts
//                                 </button>
//                                 <button
//                                     onClick={handleSwap}
//                                     className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
//                                 >
//                                     ⇄ Swap Texts
//                                 </button>
//                                 <button
//                                     onClick={handleLoadSample}
//                                     className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
//                                 >
//                                     📋 Load Sample
//                                 </button>
//                                 <button
//                                     onClick={handleClear}
//                                     className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
//                                 >
//                                     🗑️ Clear All
//                                 </button>
//                                 {diffResult.length > 0 && (
//                                     <button
//                                         onClick={copyDiff}
//                                         className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
//                                     >
//                                         📋 Copy Diff
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Statistics Cards – now with correct units based on diffMode */}
//                         {showStats && diffResult.length > 0 && (
//                             <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//                                 <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
//                                     <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
//                                         Added
//                                     </div>
//                                     <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
//                                         +{getDiffStats.added}{" "}
//                                         {getDiffStats.unitLabel}
//                                     </div>
//                                 </div>
//                                 <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
//                                     <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
//                                         Removed
//                                     </div>
//                                     <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
//                                         -{getDiffStats.removed}{" "}
//                                         {getDiffStats.unitLabel}
//                                     </div>
//                                 </div>
//                                 <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
//                                     <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
//                                         Unchanged
//                                     </div>
//                                     <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
//                                         {getDiffStats.unchanged}{" "}
//                                         {getDiffStats.unitLabel}
//                                     </div>
//                                 </div>
//                                 <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
//                                     <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
//                                         Total Changes
//                                     </div>
//                                     <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
//                                         {getDiffStats.total}{" "}
//                                         {getDiffStats.unitLabel}
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Diff Output */}
//                         {diffResult.length > 0 && (
//                             <div className="rounded-xl border border-slate-300 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50">
//                                 <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/80 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
//                                     <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
//                                         Difference Result
//                                     </span>
//                                     <span className="text-[10px] text-slate-400">
//                                         {viewMode === "unified"
//                                             ? "Green = Added, Red = Removed"
//                                             : "Left = Removed, Right = Added"}
//                                     </span>
//                                 </div>
//                                 <div className="custom-scrollbar max-h-[500px] overflow-auto p-4">
//                                     {viewMode === "unified"
//                                         ? renderUnifiedDiff()
//                                         : renderSplitDiff()}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//             <style>{scrollbarStyles}</style>
//         </div>
//     )
// }

// export default TextDiffChecker




















"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import { diffWords, diffLines, diffChars, type Change } from "diff"
import { ToolHeroProps } from "../../../types/tool"
import ToolHero from "../../tool-page-helpers/ToolHero"

// Added missing shadcn/ui Button import component
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

type DiffMode = "words" | "characters" | "lines"
type ViewMode = "unified" | "split"

interface AlignedLine {
    line: string
    type: "added" | "removed" | "unchanged" | null
}

export default function TextDiffChecker({ tool }: ToolHeroProps) {
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
    const [isCopied, setIsCopied] = useState<boolean>(false)

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

    const countUnits = useCallback(
        (str: string): number => {
            if (diffMode === "lines") {
                const lines = str.split("\n")
                return lines.length
            } else if (diffMode === "words") {
                return str
                    .trim()
                    .split(/\s+/)
                    .filter((w) => w.length > 0).length
            } else {
                return str.length
            }
        },
        [diffMode]
    )

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
        void navigator.clipboard.writeText(diffText).then(() => {
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        })
    }, [diffResult])

    const renderUnifiedDiff = () => {
        let lineNumber = 1
        const elements: JSX.Element[] = []

        diffResult.forEach((part, index) => {
            const isAdded = part.added
            const isRemoved = part.removed
            const lines = part.value.split("\n")
            
            lines.forEach((line, lineIndex) => {
                if (lineIndex === lines.length - 1 && line === "" && index < diffResult.length - 1) return

                const displayLine = line === "" ? " " : line
                elements.push(
                    <div
                        key={`${index}-${lineIndex}`}
                        className={`flex border-b border-slate-100 dark:border-slate-800/40 font-mono text-xs ${
                            isAdded
                                ? "bg-emerald-500/15 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300"
                                : isRemoved
                                  ? "bg-rose-500/15 text-rose-900 dark:bg-rose-500/10 dark:text-rose-300"
                                  : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                        <div className="w-10 shrink-0 border-r border-slate-200/80 bg-slate-50/50 py-1 pr-2 text-right text-[11px] font-medium text-slate-400 select-none dark:border-slate-800 dark:bg-slate-950/20">
                            {lineNumber}
                        </div>
                        <div className="w-8 shrink-0 py-1 text-center font-bold text-slate-400 select-none">
                            {isAdded ? "+" : isRemoved ? "-" : " "}
                        </div>
                        <pre className="flex-1 py-1 pl-2 font-mono text-xs break-all whitespace-pre-wrap leading-relaxed">
                            {displayLine}
                        </pre>
                    </div>
                )
                lineNumber++
            })
        })
        return <div className="divide-y divide-slate-100 dark:divide-slate-800/40">{elements}</div>
    }

    const renderSplitDiff = () => {
        const leftLines: AlignedLine[] = []
        const rightLines: AlignedLine[] = []

        let i = 0
        while (i < diffResult.length) {
            const current = diffResult[i]
            const next = diffResult[i + 1]

            if (current?.removed && next?.added) {
                const rLines = current.value.split("\n")
                const aLines = next.value.split("\n")
                const maxChunk = Math.max(rLines.length, aLines.length)

                for (let j = 0; j < maxChunk; j++) {
                    if (j < rLines.length) {
                        leftLines.push({ line: rLines[j]!, type: "removed" })
                    } else {
                        leftLines.push({ line: "", type: null })
                    }

                    if (j < aLines.length) {
                        rightLines.push({ line: aLines[j]!, type: "added" })
                    } else {
                        rightLines.push({ line: "", type: null })
                    }
                }
                i += 2
            } else if (current?.removed) {
                current.value.split("\n").forEach((line) => {
                    leftLines.push({ line, type: "removed" })
                    rightLines.push({ line: "", type: null })
                })
                i++
            } else if (current?.added) {
                current.value.split("\n").forEach((line) => {
                    leftLines.push({ line: "", type: null })
                    rightLines.push({ line, type: "added" })
                })
                i++
            } else if (current) {
                current.value.split("\n").forEach((line) => {
                    leftLines.push({ line, type: "unchanged" })
                    rightLines.push({ line, type: "unchanged" })
                })
                i++
            }
        }

        return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Original View</div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                        {leftLines.map((item, idx) => (
                            <div
                                key={`left-${idx}`}
                                className={`flex font-mono text-xs border-b border-slate-100 last:border-0 dark:border-slate-900/60 ${
                                    item.type === "removed" ? "bg-rose-500/15 text-rose-900 dark:bg-rose-500/10 dark:text-rose-300" : ""
                                }`}
                            >
                                <div className="w-10 shrink-0 border-r border-slate-200/80 bg-slate-50/50 py-1 pr-2 text-right text-[11px] font-medium text-slate-400 select-none dark:border-slate-800 dark:bg-slate-900/30">
                                    {item.type ? idx + 1 : " "}
                                </div>
                                <pre className="flex-1 px-3 py-1 font-mono text-xs break-all whitespace-pre-wrap min-h-[24px] leading-relaxed">
                                    {item.line}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Modified View</div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                        {rightLines.map((item, idx) => (
                            <div
                                key={`right-${idx}`}
                                className={`flex font-mono text-xs border-b border-slate-100 last:border-0 dark:border-slate-900/60 ${
                                    item.type === "added" ? "bg-emerald-500/15 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300" : ""
                                }`}
                            >
                                <div className="w-10 shrink-0 border-r border-slate-200/80 bg-slate-50/50 py-1 pr-2 text-right text-[11px] font-medium text-slate-400 select-none dark:border-slate-800 dark:bg-slate-900/30">
                                    {item.type ? idx + 1 : " "}
                                </div>
                                <pre className="flex-1 px-3 py-1 font-mono text-xs break-all whitespace-pre-wrap min-h-[24px] leading-relaxed">
                                    {item.line}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
    .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #94a3b8 #e2e8f0; }
    .dark .custom-scrollbar { scrollbar-color: #475569 #1e293b; }
  `

    return (
        <div className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-7xl space-y-8">
                <ToolHero tool={tool} />

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
                    <div className="p-6 sm:p-8 space-y-6">
                        
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Diff Mode</label>
                                    <select
                                        value={diffMode}
                                        onChange={(e) => setDiffMode(e.target.value as DiffMode)}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 font-medium"
                                    >
                                        <option value="words">Words</option>
                                        <option value="characters">Characters</option>
                                        <option value="lines">Lines</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">View Mode</label>
                                    <select
                                        value={viewMode}
                                        onChange={(e) => setViewMode(e.target.value as ViewMode)}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 font-medium"
                                    >
                                        <option value="unified">Unified View</option>
                                        <option value="split">Split View</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={ignoreWhitespace}
                                        onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                                        className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                                    />
                                    Ignore Whitespace
                                </label>
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={caseSensitive}
                                        onChange={(e) => setCaseSensitive(e.target.checked)}
                                        className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                                    />
                                    Case Sensitive
                                </label>
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={showStats}
                                        onChange={(e) => setShowStats(e.target.checked)}
                                        className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                                    />
                                    Show Stats
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex flex-col">
                                <div className="flex items-center justify-between border-b border-slate-200/60 bg-slate-100/40 px-4 py-2.5 dark:border-slate-800/60 dark:bg-slate-950/40 rounded-t-2xl">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">📄 Original Text</span>
                                    <button onClick={() => setTextA("")} className="text-slate-400 hover:text-rose-500 text-xs transition font-semibold p-1">Clear</button>
                                </div>
                                <textarea
                                    className="custom-scrollbar h-64 w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
                                    placeholder="Enter original configuration text parameters..."
                                    value={textA}
                                    onChange={(e) => setTextA(e.target.value)}
                                />
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex flex-col">
                                <div className="flex items-center justify-between border-b border-slate-200/60 bg-slate-100/40 px-4 py-2.5 dark:border-slate-800/60 dark:bg-slate-950/40 rounded-t-2xl">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">📝 Modified Text</span>
                                    <button onClick={() => setTextB("")} className="text-slate-400 hover:text-rose-500 text-xs transition font-semibold p-1">Clear</button>
                                </div>
                                <textarea
                                    className="custom-scrollbar h-64 w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
                                    placeholder="Enter modified text comparison streams..."
                                    value={textB}
                                    onChange={(e) => setTextB(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-b py-4 border-slate-200/60 dark:border-slate-800/60">
                            <Button onClick={computeDiff} className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5">Compare String Inputs</Button>
                            <Button variant="outline" onClick={handleSwap} className="h-9 rounded-xl text-xs px-4 border-slate-200">Swap Viewports</Button>
                            <Button variant="outline" onClick={handleLoadSample} className="h-9 rounded-xl text-xs px-4 border-slate-200">Load Matrix Samples</Button>
                            <Button variant="outline" onClick={handleClear} className="h-9 rounded-xl text-xs px-4 text-rose-600 hover:bg-rose-50 border-slate-200 dark:border-slate-800 dark:hover:bg-rose-950/20">Reset Core Layout</Button>
                            {diffResult.length > 0 && (
                                <Button variant={isCopied ? "default" : "outline"} onClick={copyDiff} className="h-9 rounded-xl text-xs px-4 min-w-[100px]">
                                    {isCopied ? "Copied!" : "Copy Diff Summary"}
                                </Button>
                            )}
                        </div>

                        {showStats && diffResult.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-in fade-in-40">
                                {[
                                    { label: "Added Elements", val: `+${getDiffStats.added}`, color: "text-emerald-600 dark:text-emerald-400" },
                                    { label: "Removed Elements", val: `-${getDiffStats.removed}`, color: "text-rose-600 dark:text-rose-400" },
                                    { label: "Unchanged Buffers", val: `${getDiffStats.unchanged}`, color: "text-slate-600 dark:text-slate-300" },
                                    { label: "Total Intersections", val: `${getDiffStats.total}`, color: "text-indigo-600 dark:text-indigo-400" }
                                ].map((stat, i) => (
                                    <div key={i} className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-3 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</div>
                                        <div className={`text-sm font-extrabold font-mono mt-1 ${stat.color}`}>{stat.val} <span className="text-[10px] font-medium opacity-70 ml-0.5">{getDiffStats.unitLabel}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {diffResult.length > 0 && (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/10 overflow-hidden shadow-sm">
                                <div className="flex items-center justify-between border-b bg-slate-100/40 px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Comparative Diff Engine Trace</span>
                                    <span className="text-[10px] font-medium text-slate-400 font-mono">
                                        {viewMode === "unified" ? "Green Highlight = Insertions, Red Highlight = Deletions" : "Left Workspace = Removals, Right Workspace = Append Blocks"}
                                    </span>
                                </div>
                                <div className="custom-scrollbar max-h-[500px] overflow-auto p-4 bg-white dark:bg-slate-950">
                                    {viewMode === "unified" ? renderUnifiedDiff() : renderSplitDiff()}
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