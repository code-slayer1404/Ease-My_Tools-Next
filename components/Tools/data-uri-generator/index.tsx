"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Clipboard,
  ClipboardPaste,
  Copy,
  Download,
  FileImage,
  FileText,
  Link2,
  RefreshCw,
  Trash2,
  Upload,
  Check,
  AlertTriangle,
  Info,
  Search,
  Eye,
  Code2,
  WandSparkles,
} from "lucide-react"
import { ToolHeroProps } from "@/types/tool"
import ToolHero from "@/components/tool-page-helpers/ToolHero"

/* -------------------------------------------------------
   Data URI Generator / Decoder – unified professional UI
------------------------------------------------------- */

type InputMode = "text" | "file" | "datauri"
type OutputTab = "datauri" | "base64" | "decoded"
type TextType = "plainText" | "html" | "css" | "javascript" | "json" | "xml" | "svg"

type FileInfo = {
  name: string
  size: number
  type: string
  lastModified?: number
  characterCount?: number
  uriLength?: number
  base64Length?: number
  encodingRatio?: number
}

type ParsedDataUri = {
  mime: string
  charset?: string
  isBase64: boolean
  data: string
  decodedText?: string
  base64?: string
}

const MIME_PRESETS: Record<TextType, string> = {
  plainText: "text/plain",
  html: "text/html",
  css: "text/css",
  javascript: "application/javascript",
  json: "application/json",
  xml: "application/xml",
  svg: "image/svg+xml",
}

const MIME_OPTIONS = [
  "text/plain",
  "text/html",
  "text/css",
  "text/csv",
  "text/markdown",
  "application/javascript",
  "application/json",
  "application/xml",
  "application/pdf",
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
  "application/zip",
]

const SAMPLE_TEXT = `Hello world!\nThis is a sample text.`
const SAMPLE_HTML = `<div style="font-family:system-ui;padding:16px"><h1>Hello</h1><p>This is a <strong>Data URI</strong> preview.</p></div>`
const SAMPLE_JSON = JSON.stringify({ message: "Hello", ok: true }, null, 2)
const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80"><rect width="240" height="80" rx="12" fill="#0f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#38bdf8" font-size="24" font-family="Arial">Data URI</text></svg>`

// --- Helper components (unchanged) ---
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 Bytes"
  if (bytes === 0) return "0 Bytes"
  const units = ["Bytes", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`
}

function getFileExtension(name: string): string {
  const idx = name.lastIndexOf(".")
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ""
}

function detectTextTypeFromMime(mime: string): TextType {
  if (mime === "text/html") return "html"
  if (mime === "text/css") return "css"
  if (mime === "application/javascript" || mime === "text/javascript") return "javascript"
  if (mime === "application/json") return "json"
  if (mime === "application/xml" || mime === "text/xml") return "xml"
  if (mime === "image/svg+xml") return "svg"
  return "plainText"
}

function detectMimeFromFile(file: File, fallback: TextType): string {
  if (file.type) return file.type
  const ext = getFileExtension(file.name)
  switch (ext) {
    case "txt": return "text/plain"
    case "md": return "text/markdown"
    case "html":
    case "htm": return "text/html"
    case "css": return "text/css"
    case "js":
    case "mjs": return "application/javascript"
    case "json": return "application/json"
    case "xml": return "application/xml"
    case "svg": return "image/svg+xml"
    case "csv": return "text/csv"
    case "png": return "image/png"
    case "jpg":
    case "jpeg": return "image/jpeg"
    case "gif": return "image/gif"
    case "webp": return "image/webp"
    case "mp3": return "audio/mpeg"
    case "wav": return "audio/wav"
    case "mp4": return "video/mp4"
    case "pdf": return "application/pdf"
    default: return MIME_PRESETS[fallback]
  }
}

function safeEncode(text: string): string {
  try { return encodeURIComponent(text) } catch { return text }
}
function safeDecode(text: string): string {
  try { return decodeURIComponent(text) } catch { return text }
}

function makeDataUri(mime: string, text: string): string {
  const encoded = safeEncode(text)
  return `data:${mime};charset=utf-8,${encoded}`
}
function makeBase64FromText(text: string): string {
  if (typeof window === "undefined") return ""
  return window.btoa(unescape(encodeURIComponent(text)))
}
function textFromBase64(base64: string): string {
  if (typeof window === "undefined") return ""
  return decodeURIComponent(escape(window.atob(base64)))
}
function toUrlSafeBase64(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}
function fromUrlSafeBase64(base64: string): string {
  const padded = base64.replace(/-/g, "+").replace(/_/g, "/")
  const pad = padded.length % 4
  return pad ? padded + "=".repeat(4 - pad) : padded
}

function parseDataUri(input: string): ParsedDataUri | null {
  const trimmed = input.trim()
  if (!trimmed.startsWith("data:")) return null

  const commaIndex = trimmed.indexOf(",")
  if (commaIndex < 0) return null

  const meta = trimmed.slice(5, commaIndex)
  const data = trimmed.slice(commaIndex + 1)
  const parts = meta.split(";").filter(Boolean)
  const mime = parts[0] || "text/plain"
  const isBase64 = parts.includes("base64")
  const charsetPart = parts.find((part) => part.startsWith("charset="))
  const charset = charsetPart ? charsetPart.split("=")[1] : undefined

  let decodedText: string | undefined
  let base64: string | undefined

  try {
    if (isBase64) {
      base64 = data
      decodedText = textFromBase64(data)
    } else {
      decodedText = safeDecode(data)
      base64 = makeBase64FromText(decodedText)
    }
  } catch {
    decodedText = undefined
  }

  return { mime, charset, isBase64, data, decodedText, base64 }
}

function isTextLikeMime(mime: string): boolean {
  return (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    mime === "image/svg+xml" ||
    mime === "application/javascript"
  )
}

function isPreviewableMedia(mime: string): boolean {
  return mime.startsWith("image/") || mime.startsWith("audio/") || mime.startsWith("video/") || mime === "application/pdf" || mime === "image/svg+xml"
}

// --- Sub-components ---
const StatCard = ({ label, value, tone = "slate" }: { label: string; value: string | number; tone?: "blue" | "emerald" | "violet" | "slate" }) => {
  const classes = {
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    slate: "text-slate-800 dark:text-slate-100",
  }
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
      <div className={`text-sm font-bold tabular-nums ${classes[tone]}`}>{value}</div>
    </div>
  )
}

const Panel: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({ title, subtitle, children, className = "" }) => (
  <div className={`flex h-full flex-col rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 ${className}`}>
    <div className="mb-3">
      <div className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</div>
      {subtitle && <div className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>}
    </div>
    <div className="min-h-0 flex-1">{children}</div>
  </div>
)

export default function DataUriGenerator({ tool }: ToolHeroProps) {
  const [inputMode, setInputMode] = useState<InputMode>("text")
  const [textType, setTextType] = useState<TextType>("plainText")
  const [mimeSearch, setMimeSearch] = useState("")
  const [customMime, setCustomMime] = useState("text/plain")
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [dataUriInput, setDataUriInput] = useState("")
  const [generatedDataUri, setGeneratedDataUri] = useState("")
  const [generatedBase64, setGeneratedBase64] = useState("")
  const [decodedText, setDecodedText] = useState("")
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [copied, setCopied] = useState(false)
  const [liveMode, setLiveMode] = useState(true)
  const [urlSafeBase64, setUrlSafeBase64] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [outputTab, setOutputTab] = useState<OutputTab>("datauri")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragDepthRef = useRef(0)

  const selectedMime = useMemo(() => {
    if (inputMode === "text") return customMime.trim() || MIME_PRESETS[textType]
    if (inputMode === "file" && file) return detectMimeFromFile(file, textType)
    return customMime.trim() || "text/plain"
  }, [inputMode, textType, customMime, file])

  const filteredMimeOptions = useMemo(() => {
    const q = mimeSearch.trim().toLowerCase()
    if (!q) return MIME_OPTIONS
    return MIME_OPTIONS.filter((m) => m.toLowerCase().includes(q))
  }, [mimeSearch])

  const currentBase64 = useMemo(() => {
    if (!generatedBase64) return ""
    return urlSafeBase64 ? toUrlSafeBase64(generatedBase64) : generatedBase64
  }, [generatedBase64, urlSafeBase64])

  const currentOutput = useMemo(() => {
    if (outputTab === "base64") return currentBase64
    if (outputTab === "decoded") return decodedText
    return generatedDataUri
  }, [outputTab, currentBase64, decodedText, generatedDataUri])

  const stats = useMemo(() => {
    const dataUriBytes = new Blob([generatedDataUri]).size
    const base64Bytes = new Blob([currentBase64]).size
    const originalBytes = fileInfo?.size ?? new Blob([text || decodedText]).size
    const increase = generatedDataUri ? ((dataUriBytes - originalBytes) / Math.max(1, originalBytes)) * 100 : 0
    const ratio = originalBytes ? dataUriBytes / originalBytes : 0
    return {
      originalBytes,
      dataUriBytes,
      base64Bytes,
      increase,
      ratio,
      chars: (text || decodedText || "").length,
      lines: normalizeCountLines(text || decodedText || ""),
      uriLength: generatedDataUri.length,
      base64Length: currentBase64.length,
    }
  }, [fileInfo?.size, text, decodedText, generatedDataUri, currentBase64])

  function normalizeCountLines(value: string): number {
    if (!value.trim()) return 0
    return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").length
  }

  const generateFromText = React.useCallback(() => {
    try {
      setError(null)
      setLoading(true)
      const mime = selectedMime || "text/plain"
      const uri = makeDataUri(mime, text)
      const base64 = makeBase64FromText(text)
      setGeneratedDataUri(uri)
      setGeneratedBase64(base64)
      setDecodedText(text)
      setFileInfo({
        name: "text.txt",
        size: new Blob([text]).size,
        type: mime,
        characterCount: text.length,
        uriLength: uri.length,
        base64Length: base64.length,
        encodingRatio: new Blob([text]).size ? uri.length / new Blob([text]).size : undefined,
      })
      setStatus("Data URI generated")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate Data URI")
      setGeneratedDataUri("")
      setGeneratedBase64("")
      setDecodedText("")
    } finally {
      setLoading(false)
    }
  }, [selectedMime, text])

  const generateFromFile = React.useCallback(async () => {
    if (!file) {
      setError("Please select a file")
      return
    }
    try {
      setError(null)
      setLoading(true)
      const reader = new FileReader()
      const result = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result)
          else reject(new Error("Unable to read file"))
        }
        reader.onerror = () => reject(new Error("Unable to read file"))
        reader.readAsDataURL(file)
      })

      setGeneratedDataUri(result)
      const base64 = result.split(",")[1] || ""
      setGeneratedBase64(base64)
      setDecodedText("")
      setStatus("File converted to Data URI")

      setFileInfo((prev) => ({
        name: file.name,
        size: file.size,
        type: detectMimeFromFile(file, textType),
        lastModified: file.lastModified,
        uriLength: result.length,
        base64Length: base64.length,
        encodingRatio: file.size ? result.length / file.size : undefined,
      }))

      if (isTextLikeMime(detectMimeFromFile(file, textType))) {
        const textReader = new FileReader()
        const textValue = await new Promise<string>((resolve, reject) => {
          textReader.onload = () => {
            if (typeof textReader.result === "string") resolve(textReader.result)
            else reject(new Error("Unable to read text"))
          }
          textReader.onerror = () => reject(new Error("Unable to read text"))
          textReader.readAsText(file)
        })
        setDecodedText(textValue)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert file")
      setGeneratedDataUri("")
      setGeneratedBase64("")
      setDecodedText("")
    } finally {
      setLoading(false)
    }
  }, [file, textType])

  const decodeDataUri = React.useCallback(() => {
    try {
      setError(null)
      setLoading(true)
      const parsed = parseDataUri(dataUriInput)
      if (!parsed) {
        throw new Error("Invalid Data URI")
      }
      setGeneratedDataUri(dataUriInput)
      setGeneratedBase64(parsed.base64 || "")
      setDecodedText(parsed.decodedText || "")
      setSelectedPreviewHint(parsed.mime)
      setFileInfo({
        name: "data-uri",
        size: new Blob([dataUriInput]).size,
        type: parsed.mime,
        characterCount: parsed.decodedText?.length,
        uriLength: dataUriInput.length,
        base64Length: parsed.base64?.length,
        encodingRatio: new Blob([parsed.decodedText || ""]).size ? dataUriInput.length / new Blob([parsed.decodedText || ""]).size : undefined,
      })
      setStatus("Data URI decoded")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid Data URI")
      setGeneratedDataUri("")
      setGeneratedBase64("")
      setDecodedText("")
    } finally {
      setLoading(false)
    }
  }, [dataUriInput])

  const [selectedPreviewHint, setSelectedPreviewHint] = useState<string>("text/plain")

  useEffect(() => {
    if (!liveMode) return
    const t = window.setTimeout(() => {
      if (inputMode === "text") generateFromText()
      else if (inputMode === "file" && file) void generateFromFile()
      else if (inputMode === "datauri" && dataUriInput.trim()) decodeDataUri()
      else {
        setGeneratedDataUri("")
        setGeneratedBase64("")
        setDecodedText("")
      }
    }, 220)
    return () => window.clearTimeout(t)
  }, [inputMode, text, file, dataUriInput, liveMode, selectedMime, urlSafeBase64])

  useEffect(() => {
    if (!generatedDataUri || outputTab === "datauri") return
    if (outputTab === "base64") return
  }, [generatedDataUri, outputTab])

  const copyText = async (value: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setStatus("Copied to clipboard")
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      setError("Copy failed")
    }
  }

  const downloadText = (filename: string, value: string, mime = "text/plain;charset=utf-8") => {
    if (!value) return
    const blob = new Blob([value], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setStatus("Downloaded")
  }

  const clearAll = () => {
    setText("")
    setFile(null)
    setDataUriInput("")
    setGeneratedDataUri("")
    setGeneratedBase64("")
    setDecodedText("")
    setFileInfo(null)
    setCopied(false)
    setError(null)
    setStatus("Cleared")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setFileInfo({
      name: selected.name,
      size: selected.size,
      type: detectMimeFromFile(selected, textType),
      lastModified: selected.lastModified,
    })
    setStatus(`Selected ${selected.name}`)
    if (!liveMode && inputMode === "file") {
      await generateFromFile()
    }
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragDepthRef.current = 0
    const dropped = e.dataTransfer.files?.[0]
    if (!dropped) return
    setInputMode("file")
    setFile(dropped)
    setFileInfo({
      name: dropped.name,
      size: dropped.size,
      type: detectMimeFromFile(dropped, textType),
      lastModified: dropped.lastModified,
    })
    if (!liveMode) {
      await generateFromFile()
    }
  }

  const currentPreviewMime = fileInfo?.type || selectedPreviewHint || selectedMime
  const previewSource = generatedDataUri
  const isTextPreview = isTextLikeMime(currentPreviewMime)
  const showLargeFileWarning = (fileInfo?.size || 0) > 100 * 1024

  const previewNode = () => {
    if (!previewSource) return <div className="text-sm text-slate-500 dark:text-slate-400">No preview yet.</div>
    if (currentPreviewMime.startsWith("image/") || currentPreviewMime === "image/svg+xml") {
      return (
        <img
          src={previewSource}
          alt="Preview"
          className="max-h-[260px] max-w-full rounded-xl border border-slate-200 bg-white object-contain dark:border-slate-700 dark:bg-slate-900"
        />
      )
    }
    if (currentPreviewMime.startsWith("audio/")) {
      return <audio controls src={previewSource} className="w-full" />
    }
    if (currentPreviewMime.startsWith("video/")) {
      return <video controls src={previewSource} className="max-h-[260px] w-full rounded-xl border border-slate-200 dark:border-slate-700" />
    }
    if (currentPreviewMime === "application/pdf") {
      return <iframe src={previewSource} title="PDF preview" className="h-[320px] w-full rounded-xl border border-slate-200 dark:border-slate-700" />
    }
    if (isTextPreview) {
      const display = decodedText || safeDecode(generatedDataUri.split(",")[1] || "")
      return (
        <pre className="custom-scrollbar max-h-[260px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100">
          {display.length > 4000 ? `${display.slice(0, 4000)}...` : display}
        </pre>
      )
    }
    return <div className="text-sm text-slate-500 dark:text-slate-400">Preview not available for this MIME type.</div>
  }

  const outputFilename = outputTab === "base64" ? "data-uri-base64.txt" : outputTab === "decoded" ? "decoded-text.txt" : "data-uri.txt"

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        dragDepthRef.current += 1
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
      }}
      onDrop={onDrop}
      className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100"
    >
      <div className="w-full max-w-7xl space-y-8">
        <ToolHero tool={tool} />

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
          {/* Toolbar: mode tabs + actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-300/90 bg-slate-100/50 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6 dark:border-slate-600/80 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setInputMode("text")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  inputMode === "text"
                    ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <FileText className="h-4 w-4" />
                Text
              </button>
              <button
                onClick={() => setInputMode("file")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  inputMode === "file"
                    ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <FileImage className="h-4 w-4" />
                File
              </button>
              <button
                onClick={() => setInputMode("datauri")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  inputMode === "datauri"
                    ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <Link2 className="h-4 w-4" />
                Data URI
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          {/* Content panels */}
          <div className="p-6 sm:p-8 space-y-8">
            <div className="grid gap-6 xl:grid-cols-2">
              {/* Left: Input */}
              <Panel title="Input" subtitle={inputMode === "text" ? "Type or paste text" : inputMode === "file" ? "Upload or drop a file" : "Paste a Data URI"}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
                    <input type="checkbox" checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} /> Live mode
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
                    <input type="checkbox" checked={urlSafeBase64} onChange={(e) => setUrlSafeBase64(e.target.checked)} /> URL-safe Base64
                  </label>
                  <button
                    onClick={inputMode === "text" ? generateFromText : inputMode === "file" ? () => void generateFromFile() : decodeDataUri}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <WandSparkles className="h-4 w-4" />
                    {loading ? "Working..." : "Generate"}
                  </button>
                </div>

                {inputMode === "text" && (
                  <>
                    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          MIME type
                        </div>
                        <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800/50">
                          <Search className="h-4 w-4 text-slate-400" />
                          <input
                            value={mimeSearch}
                            onChange={(e) => setMimeSearch(e.target.value)}
                            placeholder="Search MIME..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>
                        <select
                          value={customMime}
                          onChange={(e) => setCustomMime(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800"
                        >
                          {filteredMimeOptions.map((mime) => (
                            <option key={mime} value={mime}>{mime}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Text type
                        </div>
                        <select
                          value={textType}
                          onChange={(e) => {
                            const next = e.target.value as TextType
                            setTextType(next)
                            setCustomMime(MIME_PRESETS[next])
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800"
                        >
                          <option value="plainText">Plain Text</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="javascript">JavaScript</option>
                          <option value="json">JSON</option>
                          <option value="xml">XML</option>
                          <option value="svg">SVG</option>
                        </select>
                      </div>
                    </div>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter text to convert..."
                      rows={8}
                      className="custom-scrollbar mt-3 w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => setText(SAMPLE_TEXT)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Sample Text</button>
                      <button onClick={() => setText(SAMPLE_HTML)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Sample HTML</button>
                      <button onClick={() => setText(SAMPLE_JSON)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Sample JSON</button>
                      <button onClick={() => setText(SAMPLE_SVG)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Sample SVG</button>
                      <button onClick={() => copyText(text)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Copy input</button>
                      <button onClick={() => setText("")} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Clear input</button>
                    </div>
                  </>
                )}

                {inputMode === "file" && (
                  <>
                    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-400 dark:border-slate-600 dark:bg-slate-800/40 dark:hover:border-blue-500">
                        <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Drop a file or choose one</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Supports images, text, SVG, audio, video, PDF, and more.</div>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <button onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Choose file</button>
                          <button onClick={() => setFile(null)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Clear file</button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*,audio/*,video/*,text/*,.svg,.pdf,.json,.xml,.css,.js,.md,.txt" className="hidden" onChange={onFileSelect} />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">MIME override</div>
                        <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800/50">
                          <Search className="h-4 w-4 text-slate-400" />
                          <input
                            value={mimeSearch}
                            onChange={(e) => setMimeSearch(e.target.value)}
                            placeholder="Search MIME..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>
                        <select
                          value={customMime}
                          onChange={(e) => setCustomMime(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800"
                        >
                          {filteredMimeOptions.map((mime) => (
                            <option key={mime} value={mime}>{mime}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                      {file ? (
                        <>
                          <div className="font-semibold text-slate-700 dark:text-slate-200">{file.name}</div>
                          <div>{formatBytes(file.size)} • {detectMimeFromFile(file, textType)}</div>
                        </>
                      ) : (
                        "No file selected."
                      )}
                    </div>
                  </>
                )}

                {inputMode === "datauri" && (
                  <>
                    <textarea
                      value={dataUriInput}
                      onChange={(e) => setDataUriInput(e.target.value)}
                      placeholder="Paste a Data URI here..."
                      rows={8}
                      className="custom-scrollbar w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={decodeDataUri} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Decode</button>
                      <button onClick={() => setDataUriInput("")} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Clear</button>
                      <button onClick={() => setDataUriInput(makeDataUri(customMime || "text/plain", SAMPLE_TEXT))} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Sample Data URI</button>
                    </div>
                  </>
                )}
              </Panel>

              {/* Right: Output */}
              <Panel title="Output" subtitle="Data URI, Base64, or decoded content">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => setOutputTab("datauri")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${outputTab === "datauri" ? "bg-blue-600 text-white dark:bg-blue-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                    Data URI
                  </button>
                  <button onClick={() => setOutputTab("base64")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${outputTab === "base64" ? "bg-blue-600 text-white dark:bg-blue-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                    Base64
                  </button>
                  <button onClick={() => setOutputTab("decoded")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${outputTab === "decoded" ? "bg-blue-600 text-white dark:bg-blue-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                    Decoded
                  </button>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <button onClick={() => copyText(currentOutput)} disabled={!currentOutput} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
                    <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={() => downloadText(outputFilename, currentOutput)} disabled={!currentOutput} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Download className="h-4 w-4" /> Download
                  </button>
                  <button onClick={() => setOutputTab("datauri")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <RefreshCw className="h-4 w-4" /> Reset view
                  </button>
                </div>

                <textarea
                  value={currentOutput}
                  readOnly
                  placeholder="Generated output will appear here..."
                  className="custom-scrollbar min-h-[190px] w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  spellCheck={false}
                />

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {status && <span className="text-emerald-600 dark:text-emerald-400">{status}</span>}
                  {loading && <span className="text-blue-600 dark:text-blue-400">Working...</span>}
                  {error && <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400"><AlertTriangle className="h-4 w-4" />{error}</span>}
                </div>
              </Panel>
            </div>

            {/* Stats & Preview Row */}
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Stats" subtitle="Size, ratio, and lengths">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Original" value={formatBytes(stats.originalBytes)} tone="blue" />
                  <StatCard label="Data URI" value={formatBytes(stats.dataUriBytes)} tone="emerald" />
                  <StatCard label="Base64" value={formatBytes(stats.base64Bytes)} tone="violet" />
                  <StatCard label="URI length" value={stats.uriLength.toLocaleString()} tone="slate" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Base64 len." value={stats.base64Length.toLocaleString()} tone="blue" />
                  <StatCard label="Chars" value={stats.chars.toLocaleString()} tone="emerald" />
                  <StatCard label="Lines" value={stats.lines.toLocaleString()} tone="violet" />
                  <StatCard label="Increase" value={`${stats.increase.toFixed(1)}%`} tone="slate" />
                </div>
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                  Tip: Data URIs are great for small assets, especially SVG and tiny images.
                </div>
                {showLargeFileWarning && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                    <Info className="mr-1 inline h-4 w-4" /> File is larger than 100KB. Data URI may become very long.
                  </div>
                )}
              </Panel>

              <Panel title="Preview" subtitle={currentPreviewMime}>
                <div className="space-y-3">
                  {previewNode()}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatCard label="MIME" value={currentPreviewMime} tone="blue" />
                    <StatCard label="Type" value={fileInfo?.type || selectedMime} tone="emerald" />
                  </div>
                  {fileInfo && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">File Information</div>
                      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                        <div><strong>Name:</strong> {fileInfo.name}</div>
                        <div><strong>Size:</strong> {formatBytes(fileInfo.size)}</div>
                        <div><strong>Type:</strong> {fileInfo.type}</div>
                        {fileInfo.lastModified && <div><strong>Modified:</strong> {new Date(fileInfo.lastModified).toLocaleString()}</div>}
                        {fileInfo.characterCount && <div><strong>Characters:</strong> {fileInfo.characterCount.toLocaleString()}</div>}
                        {fileInfo.uriLength && <div><strong>URI length:</strong> {fileInfo.uriLength.toLocaleString()}</div>}
                        {fileInfo.base64Length && <div><strong>Base64 len.:</strong> {fileInfo.base64Length.toLocaleString()}</div>}
                        {fileInfo.encodingRatio && <div><strong>Ratio:</strong> {fileInfo.encodingRatio.toFixed(2)}x</div>}
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </div>

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