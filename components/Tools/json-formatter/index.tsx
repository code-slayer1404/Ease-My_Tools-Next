"use client"

import React, { useState, useCallback, useRef } from "react"

const JsonTool: React.FC = () => {
    const [inputJson, setInputJson] = useState<string>(
        `{\n  "name": "JSON Tool",\n  "version": "1.0",\n  "features": ["validate", "format", "minify"]\n}`
    )
    const [output, setOutput] = useState<string>("")
    const [error, setError] = useState<string | null>(null)
    const [isValid, setIsValid] = useState<boolean | null>(null)
    const [activeTab, setActiveTab] = useState<"editor" | "output">("editor")
    const [formatIndent, setFormatIndent] = useState<number>(2)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const parseJson = useCallback((jsonString: string): any => {
        try {
            const parsed = JSON.parse(jsonString)
            setError(null)
            setIsValid(true)
            return parsed
        } catch (err: any) {
            setError(err.message)
            setIsValid(false)
            return null
        }
    }, [])

    const formatJson = useCallback(() => {
        const parsed = parseJson(inputJson)
        if (parsed) {
            const formatted = JSON.stringify(parsed, null, formatIndent)
            setOutput(formatted)
            setError(null)
        } else {
            setOutput("")
        }
    }, [inputJson, formatIndent, parseJson])

    const minifyJson = useCallback(() => {
        const parsed = parseJson(inputJson)
        if (parsed) {
            const minified = JSON.stringify(parsed)
            setOutput(minified)
            setError(null)
        } else {
            setOutput("")
        }
    }, [inputJson, parseJson])

    const validateOnly = useCallback(() => {
        parseJson(inputJson)
    }, [inputJson, parseJson])

    const clearAll = useCallback(() => {
        setInputJson("")
        setOutput("")
        setError(null)
        setIsValid(null)
        textareaRef.current?.focus()
    }, [])

    const copyOutput = useCallback(async () => {
        if (!output) return
        try {
            await navigator.clipboard.writeText(output)
        } catch (err) {
            console.error("Copy failed", err)
        }
    }, [output])

    const indentOptions = [2, 4]

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-6xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b-2 border-slate-300/90 bg-slate-100/50 px-2 py-2 shadow-sm backdrop-blur-sm sm:gap-2 sm:px-5 sm:py-3 dark:border-slate-600/80 dark:bg-slate-800/40 dark:shadow-black/10">
                        <div className="flex flex-wrap items-center gap-0.5 sm:gap-2">
                            <button
                                onClick={formatJson}
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-sm dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Pretty print (format)"
                            >
                                🧹 Format
                            </button>
                            <button
                                onClick={minifyJson}
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-sm dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Minify JSON"
                            >
                                ⚡ Minify
                            </button>
                            <button
                                onClick={validateOnly}
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 sm:px-3 sm:py-1.5 sm:text-sm dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                title="Check JSON validity"
                            >
                                ✅ Validate
                            </button>
                            <div className="mx-0.5 h-4 w-px bg-slate-300 sm:mx-1 sm:h-6 dark:bg-slate-700" />
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-slate-500">Indent:</span>
                                {indentOptions.map((spaces) => (
                                    <button
                                        key={spaces}
                                        onClick={() => setFormatIndent(spaces)}
                                        className={`rounded px-1.5 py-0.5 font-mono text-xs ${
                                            formatIndent === spaces
                                                ? "bg-blue-500 text-white"
                                                : "bg-white/60 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-300"
                                        }`}
                                    >
                                        {spaces}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1 sm:gap-3">
                            {/* Copy button - larger icon, smaller text */}
                            <button
                                onClick={copyOutput}
                                disabled={!output}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40 sm:px-3 sm:py-1.5 dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Copy output"
                            >
                                <span className="text-base sm:text-lg">⎘</span>
                                <span className="text-[11px] font-medium sm:text-xs">
                                    Copy
                                </span>
                            </button>
                            {/* Clear button - larger icon, smaller text */}
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-rose-600 hover:bg-rose-50 sm:px-3 sm:py-1.5 dark:text-rose-400 dark:hover:bg-rose-950/20"
                                title="Clear all"
                            >
                                <span className="text-base sm:text-lg">✕</span>
                                <span className="text-[11px] font-medium sm:text-xs">
                                    Clear
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile tabs */}
                    <div className="flex border-b border-slate-200/80 lg:hidden dark:border-slate-800/60">
                        <button
                            onClick={() => setActiveTab("editor")}
                            className={`flex-1 py-3 text-center text-sm font-medium transition ${
                                activeTab === "editor"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            ✏️ Editor
                        </button>
                        <button
                            onClick={() => setActiveTab("output")}
                            className={`flex-1 py-3 text-center text-sm font-medium transition ${
                                activeTab === "output"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            📄 Output
                        </button>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-2">
                        {/* Left: JSON Editor */}
                        <div
                            className={`${activeTab === "output" ? "hidden lg:block" : ""}`}
                        >
                            <div className="flex h-[480px] flex-col rounded-xl border border-slate-300 dark:border-slate-700">
                                <div className="flex-shrink-0 border-b border-slate-200 bg-slate-100/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            📝 JSON Input
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            Paste or edit JSON
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 bg-white/50 dark:bg-slate-900/40">
                                    <textarea
                                        ref={textareaRef}
                                        value={inputJson}
                                        onChange={(e) =>
                                            setInputJson(e.target.value)
                                        }
                                        className="custom-scrollbar h-full w-full resize-none rounded-b-xl bg-transparent p-5 font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
                                        placeholder='{"key": "value"}'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: Output + Validation Status */}
                        <div
                            className={`${activeTab === "editor" ? "hidden lg:block" : ""}`}
                        >
                            <div className="flex h-[480px] flex-col rounded-xl border border-slate-300 dark:border-slate-700">
                                <div className="flex-shrink-0 border-b border-slate-200 bg-slate-100/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            📄 Result
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {isValid !== null && (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                                                        isValid
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                                    }`}
                                                >
                                                    {isValid
                                                        ? "✓ Valid JSON"
                                                        : "✗ Invalid"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="custom-scrollbar flex-1 overflow-auto bg-white/50 dark:bg-slate-900/40">
                                    <div className="p-5">
                                        {error && (
                                            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
                                                <span className="font-mono">
                                                    Parse error: {error}
                                                </span>
                                            </div>
                                        )}
                                        {output ? (
                                            <pre className="font-mono text-sm break-words whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                                                {output}
                                            </pre>
                                        ) : (
                                            <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                                                No output yet. Click Format or
                                                Minify.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style>{`
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
      `}</style>
        </div>
    )
}

export default JsonTool
