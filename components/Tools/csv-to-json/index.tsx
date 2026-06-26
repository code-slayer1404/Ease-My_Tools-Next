"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react"

/* ---------- Supported formats ---------- */
type Format = "csv" | "tsv" | "json" | "markdown" | "html"

const FORMAT_LABELS: Record<Format, string> = {
    csv: "CSV",
    tsv: "TSV",
    json: "JSON",
    markdown: "Markdown Table",
    html: "HTML Table",
}

/* ---------- Auto-detect format ---------- */
function guessFormat(text: string): Format {
    const trimmed = text.trim()
    if (!trimmed) return "csv"
    // JSON: starts with [ or {
    if (/^\s*[[{]/.test(trimmed)) return "json"
    // HTML table: contains <table> or <tr>
    if (/<\s*table/i.test(trimmed) || /<\s*tr/i.test(trimmed)) return "html"
    // Markdown: first line contains pipe and second line is separator (|---)
    const lines = trimmed.split("\n")
    if (
        lines.length >= 2 &&
        lines[0].includes("|") &&
        /^[\s|:\-]+$/.test(lines[1])
    )
        return "markdown"
    // TSV: contains tabs
    if (trimmed.includes("\t")) return "tsv"
    // Default to CSV
    return "csv"
}

/* ---------- CSV / TSV parser (RFC 4180 style) ---------- */
function parseDelimited(text: string, delimiter: string): string[][] {
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentField = ""
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const nextChar = text[i + 1]

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                currentField += '"'
                i++
            } else if (char === '"') {
                inQuotes = false
            } else {
                currentField += char
            }
        } else {
            if (char === '"') {
                inQuotes = true
            } else if (char === delimiter) {
                currentRow.push(currentField)
                currentField = ""
            } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
                if (char === "\r") i++
                currentRow.push(currentField)
                rows.push(currentRow)
                currentRow = []
                currentField = ""
            } else if (char === "\r") {
                currentRow.push(currentField)
                rows.push(currentRow)
                currentRow = []
                currentField = ""
            } else {
                currentField += char
            }
        }
    }
    currentRow.push(currentField)
    if (
        currentRow.length > 0 &&
        (currentRow.length > 1 || currentRow[0] !== "")
    ) {
        rows.push(currentRow)
    }
    return rows
}

function unescapeDelimitedValue(val: string): string {
    return val.replace(/""/g, '"')
}

function parseCSV(text: string): Record<string, unknown>[] {
    const rows = parseDelimited(text.trim(), ",")
    if (rows.length === 0) return []
    const header = rows[0].map((h) => unescapeDelimitedValue(h.trim()))
    return rows.slice(1).map((row) => {
        const obj: Record<string, unknown> = {}
        header.forEach((key, idx) => {
            obj[key] = idx < row.length ? unescapeDelimitedValue(row[idx]) : ""
        })
        return obj
    })
}

function parseTSV(text: string): Record<string, unknown>[] {
    const rows = parseDelimited(text.trim(), "\t")
    if (rows.length === 0) return []
    const header = rows[0].map((h) => unescapeDelimitedValue(h.trim()))
    return rows.slice(1).map((row) => {
        const obj: Record<string, unknown> = {}
        header.forEach((key, idx) => {
            obj[key] = idx < row.length ? unescapeDelimitedValue(row[idx]) : ""
        })
        return obj
    })
}

/* ---------- Markdown table parser ---------- */
function parseMarkdownTable(text: string): Record<string, unknown>[] {
    const lines = text.trim().split("\n")
    if (lines.length < 2) return []
    const headerLine = lines[0]
    const separatorLine = lines[1]
    const dataLines = lines.slice(2)

    const headers = headerLine
        .split("|")
        .map((h) => h.trim())
        .filter((h) => h.length > 0)
    const sepParts = separatorLine
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    if (headers.length === 0 || sepParts.length !== headers.length) return []
    const validSep = sepParts.every((s) => /^:?-+:?$/.test(s))
    if (!validSep) return []

    return dataLines.map((line) => {
        const cells = line
            .split("|")
            .map((c) => c.trim())
            .filter((c, idx) => idx > 0 || c !== "")
        const obj: Record<string, unknown> = {}
        headers.forEach((header, idx) => {
            obj[header] = idx < cells.length ? cells[idx] : ""
        })
        return obj
    })
}

/* ---------- HTML table parser ---------- */
function parseHTMLTable(text: string): Record<string, unknown>[] {
    try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, "text/html")
        const table = doc.querySelector("table")
        if (!table) return []
        const rows = table.querySelectorAll("tr")
        if (rows.length === 0) return []
        const headerCells = rows[0].querySelectorAll("th, td")
        const headers = Array.from(headerCells).map(
            (cell) => cell.textContent?.trim() ?? ""
        )
        if (headers.length === 0) return []

        const result: Record<string, unknown>[] = []
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll("td, th")
            const obj: Record<string, unknown> = {}
            headers.forEach((header, idx) => {
                obj[header] =
                    idx < cells.length
                        ? (cells[idx].textContent?.trim() ?? "")
                        : ""
            })
            result.push(obj)
        }
        return result
    } catch {
        return []
    }
}

/* ---------- Output formatters ---------- */
function getStringValue(value: unknown): string {
    if (value === null || value === undefined) return ""
    return String(value)
}

function arrayToCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return ""
    const header = Object.keys(data[0])
    const escapeField = (val: string): string => {
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`
        }
        return val
    }
    const headerLine = header.map(escapeField).join(",")
    const rows = data.map((row) =>
        header.map((h) => escapeField(getStringValue(row[h]))).join(",")
    )
    return [headerLine, ...rows].join("\n")
}

function arrayToTSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return ""
    const header = Object.keys(data[0])
    const rows = data.map((row) =>
        header.map((h) => getStringValue(row[h])).join("\t")
    )
    return [header.join("\t"), ...rows].join("\n")
}

function arrayToMarkdown(data: Record<string, unknown>[]): string {
    if (data.length === 0) return ""
    const header = Object.keys(data[0])
    const headerLine = "| " + header.join(" | ") + " |"
    const sepLine = "| " + header.map(() => "---").join(" | ") + " |"
    const rows = data.map(
        (row) =>
            "| " + header.map((h) => getStringValue(row[h])).join(" | ") + " |"
    )
    return [headerLine, sepLine, ...rows].join("\n")
}

function arrayToHTML(data: Record<string, unknown>[]): string {
    if (data.length === 0) return ""
    const header = Object.keys(data[0])
    const thead = "<tr>" + header.map((h) => `<th>${h}</th>`).join("") + "</tr>"
    const tbody = data
        .map(
            (row) =>
                "<tr>" +
                header
                    .map((h) => `<td>${getStringValue(row[h])}</td>`)
                    .join("") +
                "</tr>"
        )
        .join("\n")
    return `<table>\n<thead>\n${thead}\n</thead>\n<tbody>\n${tbody}\n</tbody>\n</table>`
}

/* ---------- StatCard ---------- */
const StatCard: React.FC<{
    label: string
    value: string | number
    accent: "slate" | "emerald" | "blue" | "violet"
}> = ({ label, value, accent }) => {
    const colors = {
        slate: "text-slate-800 dark:text-slate-100",
        emerald: "text-emerald-600 dark:text-emerald-400",
        blue: "text-blue-600 dark:text-blue-400",
        violet: "text-violet-600 dark:text-violet-400",
    }
    return (
        <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                {label}
            </div>
            <div className={`text-sm font-bold tabular-nums ${colors[accent]}`}>
                {value}
            </div>
        </div>
    )
}

/* ---------- Panel ---------- */
const Panel: React.FC<{
    title: string
    children: React.ReactNode
    className?: string
}> = ({ title, children, className = "" }) => (
    <div
        className={`flex h-full flex-col rounded-xl border border-slate-300 bg-white/50 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 ${className}`}
    >
        <div className="flex-shrink-0 border-b border-slate-200 bg-slate-100/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <span className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-200">
                {title}
            </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col space-y-3 p-4">
            {children}
        </div>
    </div>
)

/* ---------- Main Tool ---------- */
const CSVJsonConverter: React.FC = () => {
    const [inputText, setInputText] = useState<string>("")
    const [detectedFormat, setDetectedFormat] = useState<Format>("csv")
    const [inputFormat, setInputFormat] = useState<Format | null>(null) // null = auto-detect
    const [outputFormat, setOutputFormat] = useState<Format>("json")
    const [parsedData, setParsedData] = useState<
        Record<string, unknown>[] | null
    >(null)
    const [error, setError] = useState<string | null>(null)

    // Auto-detect when input text changes
    useEffect(() => {
        setDetectedFormat(guessFormat(inputText))
    }, [inputText])

    const effectiveInputFormat = inputFormat ?? detectedFormat

    const parseInput = useCallback((text: string, format: Format) => {
        setError(null)
        if (!text.trim()) {
            setParsedData(null)
            return
        }
        try {
            let result: Record<string, unknown>[] | null = null
            switch (format) {
                case "csv":
                    result = parseCSV(text)
                    break
                case "tsv":
                    result = parseTSV(text)
                    break
                case "json": {
                    const parsed: unknown = JSON.parse(text)
                    if (!Array.isArray(parsed))
                        throw new Error("JSON must be an array of objects")
                    result = parsed as Record<string, unknown>[]
                    break
                }
                case "markdown":
                    result = parseMarkdownTable(text)
                    break
                case "html":
                    result = parseHTMLTable(text)
                    break
            }
            if (!result) throw new Error("Could not parse input")
            setParsedData(result)
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Parse error"
            setError(message)
            setParsedData(null)
        }
    }, [])

    // Re-parse when input text or effective format changes
    useEffect(() => {
        parseInput(inputText, effectiveInputFormat)
    }, [inputText, effectiveInputFormat, parseInput])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value)
    }

    const handleInputFormatOverride = (fmt: Format | null) => {
        setInputFormat(fmt)
    }

    const outputText = useMemo<string>(() => {
        if (!parsedData || parsedData.length === 0) return ""
        switch (outputFormat) {
            case "csv":
                return arrayToCSV(parsedData)
            case "tsv":
                return arrayToTSV(parsedData)
            case "json":
                return JSON.stringify(parsedData, null, 2)
            case "markdown":
                return arrayToMarkdown(parsedData)
            case "html":
                return arrayToHTML(parsedData)
            default:
                return ""
        }
    }, [parsedData, outputFormat])

    const swapFormats = () => {
        const newInputFmt = outputFormat
        const newOutputFmt = effectiveInputFormat
        setInputFormat(newInputFmt)
        setOutputFormat(newOutputFmt)
        setInputText(outputText)
        // parsedData will be regenerated via useEffect
    }

    const copyOutput = async () => {
        try {
            await navigator.clipboard.writeText(outputText)
        } catch {
            // ignore
        }
    }

    const clearInput = () => {
        setInputText("")
        setParsedData(null)
        setError(null)
    }

    const stats = useMemo(() => {
        if (!parsedData) return { rows: 0, cols: 0 }
        const rows = parsedData.length
        const cols = rows > 0 ? Object.keys(parsedData[0]).length : 0
        return { rows, cols }
    }, [parsedData])

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-6xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b-2 border-slate-300/90 bg-slate-100/50 px-2 py-2 shadow-sm backdrop-blur-sm sm:gap-2 sm:px-5 sm:py-3 dark:border-slate-600/80 dark:bg-slate-800/40 dark:shadow-black/10">
                        <div />
                        <div className="flex items-center gap-1 sm:gap-3">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {parsedData
                                    ? `${stats.rows} rows × ${stats.cols} cols`
                                    : "No data"}
                            </span>
                            <button
                                onClick={copyOutput}
                                disabled={!outputText}
                                className="rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-30 sm:px-4 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Copy output"
                            >
                                ⎘
                            </button>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        <div className="grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
                            {/* Input Panel */}
                            <div className="flex min-h-[400px] flex-col">
                                <Panel title="Input">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="mr-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                            Input as:
                                        </span>
                                        {(
                                            [
                                                "auto",
                                                ...Object.keys(FORMAT_LABELS),
                                            ] as const
                                        ).map((fmt) => {
                                            const actualFormat =
                                                fmt === "auto" ? null : fmt
                                            const isActive =
                                                actualFormat === inputFormat ||
                                                (inputFormat === null &&
                                                    actualFormat === null)
                                            const label =
                                                fmt === "auto"
                                                    ? `Auto (${FORMAT_LABELS[detectedFormat]})`
                                                    : FORMAT_LABELS[
                                                          fmt as Format
                                                      ]
                                            return (
                                                <button
                                                    key={fmt}
                                                    onClick={() =>
                                                        handleInputFormatOverride(
                                                            actualFormat
                                                        )
                                                    }
                                                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                                        isActive
                                                            ? "border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                                                            : "border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            )
                                        })}
                                        <button
                                            onClick={clearInput}
                                            className="ml-auto rounded-lg border border-slate-200 bg-white/60 px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-rose-400 dark:hover:bg-rose-950/20"
                                            title="Clear input"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <textarea
                                        value={inputText}
                                        onChange={handleInputChange}
                                        placeholder="Paste your data here..."
                                        className="custom-scrollbar min-h-[200px] w-full flex-1 resize-none rounded-lg border border-slate-300 bg-white/80 px-3 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
                                        spellCheck={false}
                                    />
                                    {error && (
                                        <div className="rounded-lg border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
                                            {error}
                                        </div>
                                    )}
                                </Panel>
                            </div>

                            {/* Swap button */}
                            <div className="flex items-center justify-center py-4 lg:py-0">
                                <button
                                    onClick={swapFormats}
                                    className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-lg shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Swap input and output"
                                >
                                    ⇄
                                </button>
                            </div>

                            {/* Output Panel */}
                            <div className="flex min-h-[400px] flex-col">
                                <Panel title="Output">
                                    <div className="flex flex-wrap gap-1.5">
                                        {(
                                            Object.keys(
                                                FORMAT_LABELS
                                            ) as Format[]
                                        ).map((fmt) => (
                                            <button
                                                key={fmt}
                                                onClick={() =>
                                                    setOutputFormat(fmt)
                                                }
                                                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                                    outputFormat === fmt
                                                        ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                                                        : "border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                                }`}
                                            >
                                                {FORMAT_LABELS[fmt]}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        readOnly
                                        value={outputText}
                                        className="custom-scrollbar min-h-[200px] w-full flex-1 resize-none rounded-lg border border-slate-300 bg-slate-50/80 px-3 py-2 font-mono text-sm text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                                        placeholder="Output..."
                                        spellCheck={false}
                                    />
                                </Panel>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

export default CSVJsonConverter
