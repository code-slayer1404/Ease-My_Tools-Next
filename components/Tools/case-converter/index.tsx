"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUp,
  ArrowDown,
  Text,
  Heading,
  Trash2,
  Copy,
  Check,
  FileText,
  BarChart,
  Download,
  Upload,
  ClipboardPaste,
  Shuffle,
  History,
  RefreshCw,
  Keyboard as KeyboardIcon,
} from "lucide-react"
import { ToolHeroProps } from "@/types/tool"
import ToolHero from "@/components/tool-page-helpers/ToolHero"

type CaseMode =
  | "upper"
  | "lower"
  | "sentence"
  | "title"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "dot"
  | "path"

const CASE_LABELS: Record<CaseMode, string> = {
  upper: "UPPER",
  lower: "lower",
  sentence: "Sentence",
  title: "Title",
  camel: "camelCase",
  pascal: "PascalCase",
  snake: "snake_case",
  kebab: "kebab-case",
  constant: "CONSTANT_CASE",
  dot: "dot.case",
  path: "path/case",
}

const QUICK_MODES: Array<{ mode: CaseMode; icon: React.ReactNode }> = [
  { mode: "upper", icon: <ArrowUp className="h-4 w-4" /> },
  { mode: "lower", icon: <ArrowDown className="h-4 w-4" /> },
  { mode: "sentence", icon: <Text className="h-4 w-4" /> },
  { mode: "title", icon: <Heading className="h-4 w-4" /> },
]

const ALL_MODES: CaseMode[] = [
  "upper",
  "lower",
  "sentence",
  "title",
  "camel",
  "pascal",
  "snake",
  "kebab",
  "constant",
  "dot",
  "path",
]

const SAMPLE_TEXT = `hello world. this is a sample paragraph.

openai makes helpful tools.
case conversion is useful for titles, identifiers, and seo.`

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
}

function splitWords(text: string): string[] {
  return normalizeText(text)
    .trim()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

function capitalize(word: string): string {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function toSentenceCase(text: string): string {
  const normalized = normalizeText(text).toLowerCase()
  return normalized.replace(
    /(^|[.!?]\s+)(\p{L})/gu,
    (_match, sep: string, letter: string) => `${sep}${letter.toUpperCase()}`
  )
}

function toTitleCase(text: string): string {
  const smallWords = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "if",
    "in",
    "nor",
    "of",
    "on",
    "or",
    "per",
    "the",
    "to",
    "via",
    "vs",
    "with",
  ])

  const parts = normalizeText(text).toLowerCase().split(/(\s+)/)
  return parts
    .map((part, index) => {
      if (/^\s+$/.test(part)) return part
      const isFirstOrLast = index === 0 || index === parts.length - 1
      if (!isFirstOrLast && smallWords.has(part)) return part
      return capitalize(part)
    })
    .join("")
}

function toCamelCase(text: string): string {
  const words = splitWords(text).map((w) => w.toLowerCase())
  if (!words.length) return ""
  return words[0] + words.slice(1).map(capitalize).join("")
}

function toPascalCase(text: string): string {
  return splitWords(text)
    .map((w) => capitalize(w.toLowerCase()))
    .join("")
}

function toSnakeCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLowerCase())
    .join("_")
}

function toKebabCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLowerCase())
    .join("-")
}

function toConstantCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toUpperCase())
    .join("_")
}

function toDotCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLowerCase())
    .join(".")
}

function toPathCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLowerCase())
    .join("/")
}

function convertText(text: string, mode: CaseMode): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase()
    case "lower":
      return text.toLowerCase()
    case "sentence":
      return toSentenceCase(text)
    case "title":
      return toTitleCase(text)
    case "camel":
      return toCamelCase(text)
    case "pascal":
      return toPascalCase(text)
    case "snake":
      return toSnakeCase(text)
    case "kebab":
      return toKebabCase(text)
    case "constant":
      return toConstantCase(text)
    case "dot":
      return toDotCase(text)
    case "path":
      return toPathCase(text)
    default:
      return text
  }
}

function countWords(text: string): number {
  return splitWords(text).length
}

function countSentences(text: string): number {
  const matches = normalizeText(text).trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g)
  return matches ? matches.filter((s) => s.trim().length > 0).length : 0
}

function countParagraphs(text: string): number {
  return normalizeText(text)
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean).length
}

function estimateReadingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200))
}

function estimateSpeakingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 130))
}

function getCharacterStats(text: string) {
  const normalized = normalizeText(text)
  const characters = normalized.length
  const withoutSpaces = normalized.replace(/\s/g, "").length
  const words = countWords(normalized)
  const sentences = countSentences(normalized)
  const paragraphs = countParagraphs(normalized)
  return {
    characters,
    withoutSpaces,
    words,
    sentences,
    paragraphs,
    readingTime: estimateReadingTimeMinutes(words),
    speakingTime: estimateSpeakingTimeMinutes(words),
  }
}

type StatCardProps = {
  label: string
  value: string | number
  tone?: "blue" | "emerald" | "violet" | "slate"
}

const StatCard = ({ label, value, tone = "slate" }: StatCardProps) => {
  const colors = {
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    slate: "text-slate-800 dark:text-slate-100",
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </div>
      <div className={`text-sm font-bold tabular-nums ${colors[tone]}`}>{value}</div>
    </div>
  )
}

const CaseConverter: React.FC<ToolHeroProps> = ({ tool }) => {
  const [inputText, setInputText] = useState("")
  const [selectedMode, setSelectedMode] = useState<CaseMode>("upper")
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [autoCopy, setAutoCopy] = useState(false)
  const [liveMode, setLiveMode] = useState(true)
  const [lastAction, setLastAction] = useState<string>("")
  const [manualOutput, setManualOutput] = useState<string>("")
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const outputRef = useRef<HTMLTextAreaElement | null>(null)

  const convertedText = useMemo(
    () => (liveMode ? convertText(inputText, selectedMode) : manualOutput),
    [inputText, selectedMode, liveMode, manualOutput]
  )

  const stats = useMemo(() => getCharacterStats(inputText), [inputText])

  useEffect(() => {
    if (!autoCopy || !convertedText) return
    void navigator.clipboard.writeText(convertedText).catch(() => undefined)
  }, [autoCopy, convertedText])

  const applyMode = (mode: CaseMode) => {
    setSelectedMode(mode)
    setLastAction(CASE_LABELS[mode])
    setStatus(`${CASE_LABELS[mode]} applied`)
    if (!liveMode) {
      setManualOutput(convertText(inputText, mode))
    }
  }

  const handleCopy = async () => {
    if (!convertedText) return
    try {
      await navigator.clipboard.writeText(convertedText)
      setCopied(true)
      setStatus("Copied to clipboard")
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
      setStatus("Copy failed")
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setInputText(text)
        setStatus("Pasted from clipboard")
        setLastAction("Paste")
      }
    } catch {
      setStatus("Paste not allowed by browser")
    }
  }

  const handleDownload = () => {
    if (!convertedText) return
    const blob = new Blob([convertedText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `case-converted-${selectedMode}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setStatus("Downloaded TXT")
  }

  const clearInput = () => {
    setInputText("")
    setManualOutput("")
    setCopied(false)
    setStatus("Cleared")
    setLastAction("Clear")
  }

  const clearOutput = () => {
    setManualOutput("")
    setStatus("Output cleared")
    setLastAction("Clear output")
  }

  const copyInput = async () => {
    if (!inputText) return
    try {
      await navigator.clipboard.writeText(inputText)
      setStatus("Input copied")
    } catch {
      setStatus("Copy failed")
    }
  }

  const swapText = () => {
    setInputText(convertedText)
    setLastAction("Swapped")
    setStatus("Input replaced with output")
    if (!liveMode) setManualOutput(inputText)
  }

  const loadSample = () => {
    setInputText(SAMPLE_TEXT)
    setStatus("Sample loaded")
    setLastAction("Sample loaded")
    if (!liveMode) setManualOutput(convertText(SAMPLE_TEXT, selectedMode))
  }

  const handleFile = async (file: File) => {
    const text = await file.text()
    setInputText(text)
    setStatus(`Loaded ${file.name}`)
    setLastAction(`Loaded ${file.name}`)
    if (!liveMode) setManualOutput(convertText(text, selectedMode))
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleFile(file)
    e.target.value = ""
  }

  return (
    <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="w-full max-w-7xl space-y-8">
        <ToolHero tool={tool} />

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-300/90 bg-slate-100/50 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6 dark:border-slate-600/80 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadSample}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <FileText className="h-4 w-4" />
                Sample
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
              <button
                onClick={handlePaste}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ClipboardPaste className="h-4 w-4" />
                Paste
              </button>
              <button
                onClick={swapText}
                disabled={!convertedText && !inputText}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Shuffle className="h-4 w-4" />
                Swap
              </button>
              <button
                onClick={clearInput}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.json"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {status ? <span className="text-emerald-600 dark:text-emerald-400">{status}</span> : null}
              {lastAction ? <span className="hidden sm:inline">{lastAction}</span> : null}
            </div>
          </div>

          <div className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:gap-8">
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Input Text</h3>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value)
                  if (!liveMode) setManualOutput(convertText(e.target.value, selectedMode))
                }}
                placeholder="Enter your text here..."
                className="w-full rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                rows={10}
              />
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => setInputText((v) => v.trim())}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Trim spaces
                </button>
                <button
                  onClick={copyInput}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Copy input
                </button>
                <button
                  onClick={() => setInputText("")}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Clear input
                </button>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Converted Text</h3>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-800">
                    <input type="checkbox" checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} />
                    Live
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-800">
                    <input type="checkbox" checked={autoCopy} onChange={(e) => setAutoCopy(e.target.checked)} />
                    Auto copy
                  </label>
                </div>
              </div>

              <textarea
                ref={outputRef}
                value={convertedText}
                readOnly
                placeholder="Converted text will appear here..."
                className="w-full rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                rows={10}
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {convertedText && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  disabled={!convertedText}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Download className="h-4 w-4" /> Download TXT
                </button>
                <button
                  onClick={clearOutput}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <RefreshCw className="h-4 w-4" /> Clear output
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Case Modes</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">One click conversion for every common format</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_MODES.map(({ mode, icon }) => (
                <button
                  key={mode}
                  onClick={() => applyMode(mode)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium shadow-sm transition active:scale-[0.98] ${
                    selectedMode === mode
                      ? "border-blue-500 bg-blue-500 text-white shadow-blue-500/20"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {icon}
                  {CASE_LABELS[mode]}
                </button>
              ))}
              {ALL_MODES.slice(4).map((mode) => (
                <button
                  key={mode}
                  onClick={() => applyMode(mode)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium shadow-sm transition active:scale-[0.98] ${
                    selectedMode === mode
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/20"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {CASE_LABELS[mode]}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 text-center">
              <StatCard label="Characters" value={stats.characters} tone="blue" />
              <StatCard label="Without spaces" value={stats.withoutSpaces} tone="emerald" />
              <StatCard label="Words" value={stats.words} tone="violet" />
              <StatCard label="Sentences" value={stats.sentences} tone="slate" />
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

export default CaseConverter