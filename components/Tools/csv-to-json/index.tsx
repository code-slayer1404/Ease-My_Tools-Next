"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Upload,
  Copy,
  Download,
  Trash2,
  FileText,
  Search,
  Settings2,
  Table2,
  Check,
  AlertTriangle,
  BarChart3,
} from "lucide-react"
import { ToolHeroProps } from "@/types/tool"
import ToolHero from "@/components/tool-page-helpers/ToolHero"

/* -------------------------------------------------------
   CSV / JSON / TSV / Markdown / HTML / XLSX Converter
   Professional Tailwind UI – same logic, polished design
------------------------------------------------------- */

type Format = "csv" | "tsv" | "json" | "markdown" | "html" | "xlsx"
type JsonMode = "pretty" | "compact"
type SortMode = "none" | "asc" | "desc"
type Row = Record<string, unknown>

type ParseResult = {
  rows: Row[]
  headers: string[]
  meta: {
    delimiter?: string
    sourceFormat: Format
  }
}

const FORMAT_LABELS: Record<Format, string> = {
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  markdown: "Markdown",
  html: "HTML",
  xlsx: "XLSX",
}

const SAMPLE_DATA = `name,age,city\nAman,24,Delhi\nPriya,28,Mumbai\nRahul,31,Jaipur`

// ---------- Helper functions (unchanged logic) ----------
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
}

function trimBOM(text: string): string {
  return text.replace(/^\uFEFF/, "")
}

function isProbablyHtml(text: string): boolean {
  return /<\s*table[\s>]/i.test(text) || /<\s*tr[\s>]/i.test(text)
}

function isProbablyJson(text: string): boolean {
  const t = text.trim()
  return t.startsWith("{") || t.startsWith("[")
}

function isProbablyMarkdownTable(text: string): boolean {
  const lines = normalizeLineEndings(text).trim().split("\n")
  return (
    lines.length >= 2 &&
    lines[0].includes("|") &&
    /^\s*\|?\s*[:\-]+(?:\s*\|\s*[:\-]+)+\s*\|?\s*$/.test(lines[1])
  )
}

function guessDelimiter(text: string): string {
  const sample = normalizeLineEndings(text).split("\n").slice(0, 8).join("\n")
  const candidates = [",", "\t", ";", "|"]
  const scores = candidates.map((d) => {
    const count = (sample.match(new RegExp(escapeRegExp(d), "g")) || []).length
    return { d, count }
  })
  scores.sort((a, b) => b.count - a.count)
  return scores[0]?.d || ","
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function detectFormat(text: string): Format {
  const trimmed = trimBOM(text).trim()
  if (!trimmed) return "csv"
  if (isProbablyJson(trimmed)) return "json"
  if (isProbablyHtml(trimmed)) return "html"
  if (isProbablyMarkdownTable(trimmed)) return "markdown"
  if (trimmed.includes("\t")) return "tsv"
  if (trimmed.includes(",") || trimmed.includes(";") || trimmed.includes("|")) return "csv"
  return "csv"
}

function parseDelimited(text: string, delimiter: string): string[][] {
  const src = normalizeLineEndings(trimBOM(text))
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let i = 0
  let inQuotes = false

  while (i < src.length) {
    const char = src[i]
    const next = src[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i += 2
        continue
      }
      if (char === '"') {
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }

    if (char === '"') {
      inQuotes = true
      i++
      continue
    }

    if (char === delimiter) {
      row.push(field)
      field = ""
      i++
      continue
    }

    if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
      i++
      continue
    }

    field += char
    i++
  }

  row.push(field)
  if (row.some((x) => x !== "") || rows.length === 0) rows.push(row)
  return rows
}

function parseCSVLike(text: string, delimiter: string): ParseResult {
  const rows = parseDelimited(text, delimiter)
  if (rows.length === 0)
    return { rows: [], headers: [], meta: { delimiter, sourceFormat: delimiter === "\t" ? "tsv" : "csv" } }

  const headers = rows[0].map((h, idx) => (h.trim() ? h.trim() : `column_${idx + 1}`))
  const dataRows = rows.slice(1)

  const parsed = dataRows
    .filter((r) => r.some((cell) => String(cell).trim() !== ""))
    .map((r) => {
      const obj: Row = {}
      headers.forEach((h, idx) => {
        obj[h] = idx < r.length ? r[idx] : ""
      })
      return obj
    })

  return { rows: parsed, headers, meta: { delimiter, sourceFormat: delimiter === "\t" ? "tsv" : "csv" } }
}

function splitMarkdownRow(line: string): string[] {
  const cells: string[] = []
  let current = ""
  let escape = false
  let inCode = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (escape) {
      current += char
      escape = false
      continue
    }
    if (char === "\\") {
      escape = true
      continue
    }
    if (char === "`") {
      inCode = !inCode
      current += char
      continue
    }
    if (char === "|" && !inCode) {
      cells.push(current.trim())
      current = ""
      continue
    }
    current += char
  }
  cells.push(current.trim())
  return cells.filter((c, idx) => idx !== 0 || c !== "")
}

function parseMarkdownTable(text: string): ParseResult {
  const lines = normalizeLineEndings(text).trim().split("\n")
  if (lines.length < 2) return { rows: [], headers: [], meta: { sourceFormat: "markdown" } }

  const headers = splitMarkdownRow(lines[0]).filter(Boolean)
  const sep = splitMarkdownRow(lines[1])
  const isValidSep = sep.length >= headers.length && sep.every((s) => /^:?-{3,}:?$/.test(s))
  if (!headers.length || !isValidSep) return { rows: [], headers: [], meta: { sourceFormat: "markdown" } }

  const rows = lines.slice(2).map((line) => {
    const cells = splitMarkdownRow(line)
    const obj: Row = {}
    headers.forEach((h, idx) => (obj[h] = idx < cells.length ? cells[idx] : ""))
    return obj
  })

  return { rows, headers, meta: { sourceFormat: "markdown" } }
}

function parseHtmlTable(text: string): ParseResult {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, "text/html")
    const table = doc.querySelector("table")
    if (!table) return { rows: [], headers: [], meta: { sourceFormat: "html" } }

    const allRows = Array.from(table.querySelectorAll("tr"))
    if (!allRows.length) return { rows: [], headers: [], meta: { sourceFormat: "html" } }

    const headerCells = Array.from(allRows[0].querySelectorAll("th, td"))
    const headers = headerCells.map((cell, idx) => cell.textContent?.trim() || `column_${idx + 1}`)

    const rows: Row[] = []
    for (let i = 1; i < allRows.length; i++) {
      const cells = Array.from(allRows[i].querySelectorAll("td, th"))
      const obj: Row = {}
      headers.forEach((h, idx) => {
        obj[h] = idx < cells.length ? cells[idx].textContent?.trim() ?? "" : ""
      })
      rows.push(obj)
    }

    return { rows, headers, meta: { sourceFormat: "html" } }
  } catch {
    return { rows: [], headers: [], meta: { sourceFormat: "html" } }
  }
}

async function parseXlsxFile(file: File): Promise<ParseResult> {
  try {
    const xlsx = await import("xlsx")
    const arrayBuffer = await file.arrayBuffer()
    const wb = xlsx.read(arrayBuffer, { type: "array" })
    const sheetName = wb.SheetNames[0]
    const sheet = wb.Sheets[sheetName]
    const rows = xlsx.utils.sheet_to_json<Row>(sheet, { defval: "" })
    const headers = rows.length ? Object.keys(rows[0]) : []
    return { rows, headers, meta: { sourceFormat: "xlsx" } }
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? `XLSX support needs the "xlsx" package. ${err.message}`
        : 'XLSX support needs the "xlsx" package.'
    )
  }
}

function safeValue(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function sortHeaders(headers: string[], rows: Row[], mode: SortMode): string[] {
  if (mode === "none") return headers
  const sorted = [...headers].sort((a, b) => a.localeCompare(b))
  return mode === "desc" ? sorted.reverse() : sorted
}

function cleanRows(
  rows: Row[],
  headers: string[],
  opts: {
    trimSpaces: boolean
    removeEmptyRows: boolean
    removeDuplicateRows: boolean
    removeEmptyColumns: boolean
  }
): { rows: Row[]; headers: string[] } {
  let nextRows = rows.map((row) => {
    if (!opts.trimSpaces) return row
    const out: Row = {}
    headers.forEach((h) => {
      const v = row[h]
      out[h] = typeof v === "string" ? v.trim() : v
    })
    return out
  })

  if (opts.removeEmptyRows) {
    nextRows = nextRows.filter((row) => headers.some((h) => safeValue(row[h]).trim() !== ""))
  }

  if (opts.removeDuplicateRows) {
    const seen = new Set<string>()
    nextRows = nextRows.filter((row) => {
      const key = JSON.stringify(headers.map((h) => row[h]))
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  let nextHeaders = [...headers]
  if (opts.removeEmptyColumns) {
    nextHeaders = nextHeaders.filter((h) => nextRows.some((row) => safeValue(row[h]).trim() !== ""))
    nextRows = nextRows.map((row) => {
      const obj: Row = {}
      nextHeaders.forEach((h) => (obj[h] = row[h]))
      return obj
    })
  }

  return { rows: nextRows, headers: nextHeaders }
}

function parseJsonInput(text: string): ParseResult {
  const parsed = JSON.parse(text)

  if (Array.isArray(parsed)) {
    const rows = parsed.map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) return item as Row
      return { value: item }
    })
    const headers = rows.length ? Object.keys(rows[0]) : []
    return { rows, headers, meta: { sourceFormat: "json" } }
  }

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>
    if (Array.isArray(obj.data)) {
      const rows = obj.data.map((item) =>
        item && typeof item === "object" ? (item as Row) : { value: item }
      )
      const headers = rows.length ? Object.keys(rows[0]) : []
      return { rows, headers, meta: { sourceFormat: "json" } }
    }
    const rows = [obj]
    return { rows, headers: Object.keys(obj), meta: { sourceFormat: "json" } }
  }

  return { rows: [{ value: parsed }], headers: ["value"], meta: { sourceFormat: "json" } }
}

function parseText(text: string, format: Format): ParseResult {
  const src = trimBOM(text)
  switch (format) {
    case "csv": {
      const delimiter = guessDelimiter(src)
      return parseCSVLike(src, delimiter)
    }
    case "tsv":
      return parseCSVLike(src, "\t")
    case "json":
      return parseJsonInput(src)
    case "markdown":
      return parseMarkdownTable(src)
    case "html":
      return parseHtmlTable(src)
    default:
      return { rows: [], headers: [], meta: { sourceFormat: format } }
  }
}

function formatRowsToCsv(rows: Row[], headers: string[]): string {
  const esc = (value: string) => {
    if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
    return value
  }
  const lines = [headers.map(esc).join(",")]
  rows.forEach((row) => lines.push(headers.map((h) => esc(safeValue(row[h]))).join(",")))
  return lines.join("\n")
}

function formatRowsToTsv(rows: Row[], headers: string[]): string {
  const lines = [headers.join("\t")]
  rows.forEach((row) =>
    lines.push(headers.map((h) => safeValue(row[h]).replace(/\t/g, " ")).join("\t"))
  )
  return lines.join("\n")
}

function formatRowsToMarkdown(rows: Row[], headers: string[]): string {
  const head = `| ${headers.join(" | ")} |`
  const sep = `| ${headers.map(() => "---").join(" | ")} |`
  const body = rows.map(
    (row) => `| ${headers.map((h) => safeValue(row[h]).replace(/\|/g, "\\|")).join(" | ")} |`
  )
  return [head, sep, ...body].join("\n")
}

function formatRowsToHtml(rows: Row[], headers: string[]): string {
  const thead = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>`
  const tbody = rows
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td>${escapeHtml(safeValue(row[h]))}</td>`).join("")}</tr>`
    )
    .join("\n")
  return `<table>\n<thead>\n${thead}\n</thead>\n<tbody>\n${tbody}\n</tbody>\n</table>`
}

function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function inferDownloadName(outputFormat: Format): string {
  return `converted.${outputFormat === "markdown" ? "md" : outputFormat === "html" ? "html" : outputFormat}`
}

// ---------- Component ----------
export default function CSVJsonConverter({ tool }: ToolHeroProps) {
  const [inputText, setInputText] = useState("")
  const [detectedFormat, setDetectedFormat] = useState<Format>("csv")
  const [manualInputFormat, setManualInputFormat] = useState<Format | null>(null)
  const [outputFormat, setOutputFormat] = useState<Format>("json")
  const [jsonMode, setJsonMode] = useState<JsonMode>("pretty")
  const [sortMode, setSortMode] = useState<SortMode>("none")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [loadingXlsx, setLoadingXlsx] = useState(false)
  const [trimSpaces, setTrimSpaces] = useState(true)
  const [removeEmptyRows, setRemoveEmptyRows] = useState(false)
  const [removeDuplicateRows, setRemoveDuplicateRows] = useState(false)
  const [removeEmptyColumns, setRemoveEmptyColumns] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [showStats, setShowStats] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setDetectedFormat(detectFormat(inputText))
  }, [inputText])

  const effectiveInputFormat = manualInputFormat ?? detectedFormat

  const reparse = useCallback(async (text: string, fmt: Format) => {
    setError(null)
    setStatus("")
    if (!text.trim()) {
      setParsed(null)
      return
    }
    try {
      const result = parseText(text, fmt)
      setParsed(result)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Parse error"
      setError(message)
      setParsed(null)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void reparse(inputText, effectiveInputFormat)
    }, 220)
    return () => window.clearTimeout(t)
  }, [inputText, effectiveInputFormat, reparse])

  const cleaned = useMemo(() => {
    if (!parsed) return null
    const baseHeaders = parsed.headers.length
      ? parsed.headers
      : parsed.rows[0]
      ? Object.keys(parsed.rows[0])
      : []
    const headers = sortHeaders(baseHeaders, parsed.rows, sortMode)
    const next = cleanRows(parsed.rows, headers, {
      trimSpaces,
      removeEmptyRows,
      removeDuplicateRows,
      removeEmptyColumns,
    })
    return { rows: next.rows, headers: next.headers }
  }, [parsed, sortMode, trimSpaces, removeEmptyRows, removeDuplicateRows, removeEmptyColumns])

  const filteredRows = useMemo(() => {
    if (!cleaned) return []
    const q = search.trim().toLowerCase()
    if (!q) return cleaned.rows
    return cleaned.rows.filter((row) =>
      cleaned.headers.some((h) => safeValue(row[h]).toLowerCase().includes(q))
    )
  }, [cleaned, search])

  const outputText = useMemo(() => {
    if (!cleaned) return ""
    const rows = filteredRows
    const headers = cleaned.headers
    if (!rows.length || !headers.length) return ""

    switch (outputFormat) {
      case "csv":
        return formatRowsToCsv(rows, headers)
      case "tsv":
        return formatRowsToTsv(rows, headers)
      case "json":
        return jsonMode === "pretty"
          ? JSON.stringify(rows, null, 2)
          : JSON.stringify(rows)
      case "markdown":
        return formatRowsToMarkdown(rows, headers)
      case "html":
        return formatRowsToHtml(rows, headers)
      case "xlsx":
        return JSON.stringify(rows, null, 2)
      default:
        return ""
    }
  }, [cleaned, filteredRows, jsonMode, outputFormat])

  const stats = useMemo(() => {
    const rows = filteredRows.length
    const cols = cleaned?.headers.length ?? 0
    const emptyCells = cleaned
      ? filteredRows.reduce((acc, row) => {
          return (
            acc +
            cleaned.headers.reduce(
              (n, h) => n + (safeValue(row[h]).trim() === "" ? 1 : 0),
              0
            )
          )
        }, 0)
      : 0
    return { rows, cols, emptyCells }
  }, [cleaned, filteredRows])

  const canCopy = Boolean(outputText)

  const applySample = () => {
    setInputText(SAMPLE_DATA)
    setManualInputFormat(null)
    setOutputFormat("json")
    setSearch("")
    setStatus("Sample data loaded")
    setError(null)
  }

  const clearAll = () => {
    setInputText("")
    setParsed(null)
    setError(null)
    setStatus("")
    setSearch("")
  }

  const handleCopy = async () => {
    if (!outputText) return
    try {
      await navigator.clipboard.writeText(outputText)
      setStatus("Copied to clipboard")
    } catch {
      const temp = document.createElement("textarea")
      temp.value = outputText
      document.body.appendChild(temp)
      temp.select()
      document.execCommand("copy")
      temp.remove()
      setStatus("Copied to clipboard")
    }
  }

  const handleDownload = () => {
    if (!outputText) return
    const filename = inferDownloadName(outputFormat)
    const mime = outputFormat === "html" ? "text/html;charset=utf-8" : "text/plain;charset=utf-8"
    downloadText(filename, outputText, mime)
  }

  const processFile = useCallback(async (file: File) => {
    setError(null)
    setStatus(`Reading ${file.name}...`)
    const lower = file.name.toLowerCase()
    const ext = lower.split(".").pop() || ""

    try {
      if (ext === "xlsx" || ext === "xls") {
        setLoadingXlsx(true)
        const result = await parseXlsxFile(file)
        setParsed(result)
        setInputText("")
        setManualInputFormat("json")
        setDetectedFormat("json")
        setStatus(`Loaded ${file.name}`)
        return
      }

      const text = await file.text()
      let format: Format = "csv"
      if (ext === "tsv") format = "tsv"
      else if (ext === "json") format = "json"
      else if (ext === "md" || ext === "markdown") format = "markdown"
      else if (ext === "html" || ext === "htm") format = "html"
      else format = detectFormat(text)

      setManualInputFormat(format)
      setInputText(text)
      setStatus(`Loaded ${file.name}`)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to read file"
      setError(message)
      setStatus("")
    } finally {
      setLoadingXlsx(false)
    }
  }, [])

  const onPickFile = () => fileInputRef.current?.click()

  const onInputFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
    e.target.value = ""
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) await processFile(file)
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100"
    >
      <div className="w-full max-w-7xl space-y-8">
        {/* Tool Hero Header */}
        <ToolHero tool={tool} />

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-300/90 bg-slate-100/50 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6 dark:border-slate-600/80 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onPickFile}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </button>
              <button
                onClick={applySample}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <FileText className="h-4 w-4" />
                Sample
              </button>
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.json,.md,.markdown,.html,.htm,.txt,.xlsx,.xls"
                className="hidden"
                onChange={onInputFileChange}
              />
              {loadingXlsx && <span className="text-blue-600 dark:text-blue-400">Reading XLSX...</span>}
              {status && <span className="text-emerald-600 dark:text-emerald-400">{status}</span>}
              {error && (
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {error}
                </span>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:gap-8">
            {/* Input Panel */}
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Input as</span>
                {(["auto", ...Object.keys(FORMAT_LABELS)] as const).map((item) => {
                  const value = item === "auto" ? null : (item as Format)
                  const active = value === manualInputFormat || (item === "auto" && manualInputFormat === null)
                  const label =
                    item === "auto" ? `Auto (${FORMAT_LABELS[detectedFormat]})` : FORMAT_LABELS[item as Format]
                  return (
                    <button
                      key={item}
                      onClick={() => setManualInputFormat(value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? "bg-blue-600 text-white dark:bg-blue-500"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste CSV, JSON, Markdown table, or HTML table here..."
                className="custom-scrollbar min-h-[220px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                spellCheck={false}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
                  <input type="checkbox" checked={trimSpaces} onChange={(e) => setTrimSpaces(e.target.checked)} /> Trim spaces
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
                  <input type="checkbox" checked={removeEmptyRows} onChange={(e) => setRemoveEmptyRows(e.target.checked)} /> Remove empty rows
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
                  <input type="checkbox" checked={removeDuplicateRows} onChange={(e) => setRemoveDuplicateRows(e.target.checked)} /> Remove duplicates
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
                  <input type="checkbox" checked={removeEmptyColumns} onChange={(e) => setRemoveEmptyColumns(e.target.checked)} /> Remove empty columns
                </label>
              </div>
            </div>

            {/* Output Panel */}
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Output</span>
                {Object.keys(FORMAT_LABELS).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt as Format)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      outputFormat === fmt
                        ? "bg-emerald-600 text-white dark:bg-emerald-500"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {FORMAT_LABELS[fmt as Format]}
                  </button>
                ))}
                <button
                  onClick={() => setJsonMode((m) => (m === "pretty" ? "compact" : "pretty"))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  JSON: {jsonMode}
                </button>
                <button
                  onClick={() =>
                    setSortMode((m) => (m === "none" ? "asc" : m === "asc" ? "desc" : "none"))
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Sort: {sortMode}
                </button>
              </div>
              <div className="mb-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search rows..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  />
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!canCopy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!canCopy}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
              <textarea
                readOnly
                value={outputText}
                placeholder="Converted output will appear here..."
                className="custom-scrollbar min-h-[220px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                spellCheck={false}
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {showPreview ? "Hide" : "Show"} Preview
                </button>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {showStats ? "Hide" : "Show"} Stats
                </button>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          {showStats && cleaned && (
            <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-center dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Rows</div>
                  <div className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">{stats.rows}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-center dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Columns</div>
                  <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.cols}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-center dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Empty Cells</div>
                  <div className="mt-1 text-xl font-bold text-violet-600 dark:text-violet-400">{stats.emptyCells}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-center dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Input Format</div>
                  <div className="mt-1 text-xl font-bold text-slate-700 dark:text-slate-200">
                    {FORMAT_LABELS[effectiveInputFormat]}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {showPreview && cleaned && filteredRows.length > 0 && (
            <div className="border-t border-slate-200 p-6 dark:border-slate-700">
              <div className="mb-3 flex items-center gap-2">
                <Table2 className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Preview ({filteredRows.length} rows)
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="custom-scrollbar max-h-96 overflow-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900">
                      <tr>
                        {cleaned.headers.map((h) => (
                          <th
                            key={h}
                            className="whitespace-nowrap border-b border-slate-200 px-4 py-2 text-left font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.slice(0, 200).map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 odd:bg-white even:bg-slate-50 dark:border-slate-800 dark:odd:bg-slate-900/40 dark:even:bg-slate-800/40"
                        >
                          {cleaned.headers.map((h) => (
                            <td
                              key={h}
                              className="max-w-sm overflow-hidden px-4 py-2 text-slate-700 dark:text-slate-300"
                            >
                              <div className="truncate" title={safeValue(row[h])}>
                                {safeValue(row[h])}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {filteredRows.length > 200 && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Showing first 200 rows in preview.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,116,139,.5); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71,85,105,.8); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(100,116,139,.5) transparent; }
      `}</style>
    </div>
  )
}