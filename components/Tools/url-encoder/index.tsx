// "use client"

// import React, { useEffect, useMemo, useRef, useState } from "react"
// import {
//   ArrowRightLeft,
//   ClipboardPaste,
//   Copy,
//   Download,
//   FileText,
//   Link2,
//   Trash2,
//   Upload,
//   Check,
//   Search,
//   Settings2,
//   AlertTriangle,
//   Info,
// } from "lucide-react"
// import { ToolHeroProps } from "@/types/tool"
// import ToolHero from "@/components/tool-page-helpers/ToolHero"

// /* -------------------------------------------------------
//    URL Encoder / Decoder – unified professional UI
// ------------------------------------------------------- */

// type Mode = "component" | "full"
// type Operation = "encode" | "decode"

// type QueryParam = {
//   key: string
//   value: string
// }

// type ParsedUrl = {
//   protocol: string
//   username: string
//   password: string
//   host: string
//   hostname: string
//   port: string
//   pathname: string
//   search: string
//   hash: string
//   origin: string
//   params: QueryParam[]
// }

// const SAMPLE_TEXT = `hello world? name=OpenAI & title=URL Encoder/Decoder`
// const SAMPLE_URL = `https://example.com/search?q=hello world&page=2&sort=latest#section`

// // Helper components
// const Panel: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
//   <div className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 flex flex-col gap-3">
//     <div>
//       <div className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</div>
//       {subtitle && <div className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>}
//     </div>
//     <div className="flex flex-col gap-3 flex-1">{children}</div>
//   </div>
// )

// const StatCard: React.FC<{ label: string; value: string | number; tone?: "blue" | "emerald" | "violet" | "slate" }> = ({ label, value, tone = "slate" }) => {
//   const tones = {
//     blue: "text-blue-600 dark:text-blue-400",
//     emerald: "text-emerald-600 dark:text-emerald-400",
//     violet: "text-violet-600 dark:text-violet-400",
//     slate: "text-slate-800 dark:text-slate-100",
//   }
//   return (
//     <div className="rounded-lg border border-slate-200/80 bg-white/70 px-3 py-2 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
//       <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
//       <div className={`text-sm font-bold tabular-nums ${tones[tone]}`}>{value}</div>
//     </div>
//   )
// }

// // Utility functions (unchanged)
// function normalizeLineEndings(text: string): string { return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n") }
// function safeDecodeURIComponent(text: string): string { try { return decodeURIComponent(text) } catch { return text } }
// function safeDecodeURI(text: string): string { try { return decodeURI(text) } catch { return text } }
// function safeEncodeURIComponent(text: string): string { try { return encodeURIComponent(text) } catch { return text } }
// function safeEncodeURI(text: string): string { try { return encodeURI(text) } catch { return text } }
// function bytesOf(text: string): number { return new Blob([text]).size }
// function countWords(text: string): number { return normalizeLineEndings(text).trim().split(/\s+/).filter(Boolean).length }
// function countLines(text: string): number { if (!text.trim()) return 0; return normalizeLineEndings(text).split("\n").length }
// function isLikelyUrl(text: string): boolean { const trimmed = text.trim(); return /^https?:\/\//i.test(trimmed) || /^\/\//.test(trimmed) || /^[^\s]+\.[^\s]+/.test(trimmed) }

// function parseUrlMaybe(raw: string): ParsedUrl | null {
//   const input = raw.trim()
//   if (!input) return null
//   const candidates = [input, /^https?:\/\//i.test(input) ? input : `https://${input}`]
//   for (const candidate of candidates) {
//     try {
//       const url = new URL(candidate)
//       const params: QueryParam[] = []
//       url.searchParams.forEach((value, key) => { params.push({ key, value }) })
//       return {
//         protocol: url.protocol,
//         username: url.username,
//         password: url.password,
//         host: url.host,
//         hostname: url.hostname,
//         port: url.port,
//         pathname: url.pathname,
//         search: url.search,
//         hash: url.hash,
//         origin: url.origin,
//         params,
//       }
//     } catch {}
//   }
//   return null
// }

// function buildUrlFromParsed(parsed: ParsedUrl): string {
//   const url = new URL(parsed.origin || `https://${parsed.host || parsed.hostname}`)
//   url.username = parsed.username
//   url.password = parsed.password
//   url.hostname = parsed.hostname || url.hostname
//   url.port = parsed.port
//   url.pathname = parsed.pathname || "/"
//   url.search = ""
//   parsed.params.forEach(({ key, value }) => { if (key.trim()) url.searchParams.append(key, value) })
//   url.hash = parsed.hash || ""
//   return url.toString()
// }

// function toPlusSpaces(text: string): string { return text.replace(/%20/g, "+") }
// function fromPlusSpaces(text: string): string { return text.replace(/\+/g, "%20") }

// export default function URLEncoder({ tool }: ToolHeroProps) {
//   const [inputText, setInputText] = useState("")
//   const [outputText, setOutputText] = useState("")
//   const [operation, setOperation] = useState<Operation>("encode")
//   const [mode, setMode] = useState<Mode>("component")
//   const [liveMode, setLiveMode] = useState(true)
//   const [autoCopy, setAutoCopy] = useState(false)
//   const [plusSpace, setPlusSpace] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [status, setStatus] = useState<string>("")
//   const [showParser, setShowParser] = useState(true)
//   const [copied, setCopied] = useState(false)
//   const [selectedParamIndex, setSelectedParamIndex] = useState<number | null>(null)
//   const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
//   const inputFileRef = useRef<HTMLInputElement | null>(null)

//   const canCopy = useMemo(() => !!outputText.trim(), [outputText])

//   const parsed = useMemo(() => parseUrlMaybe(inputText), [inputText])
//   const inputStats = useMemo(() => {
//     const bytes = bytesOf(inputText)
//     const outBytes = bytesOf(outputText)
//     return { chars: inputText.length, words: countWords(inputText), lines: countLines(inputText), bytes, outBytes, diff: outBytes - bytes }
//   }, [inputText, outputText])

//   const encodeText = (text: string) => {
//     const value = mode === "component" ? safeEncodeURIComponent(text) : safeEncodeURI(text)
//     return plusSpace ? toPlusSpaces(value) : value
//   }
//   const decodeText = (text: string) => {
//     const normalized = plusSpace ? fromPlusSpaces(text) : text
//     return mode === "component" ? safeDecodeURIComponent(normalized) : safeDecodeURI(normalized)
//   }

//   useEffect(() => {
//     if (!liveMode) return
//     setError(null)
//     if (!inputText.trim()) { setOutputText(""); return }
//     const t = window.setTimeout(() => {
//       const result = operation === "encode" ? encodeText(inputText) : decodeText(inputText)
//       setOutputText(result)
//     }, 180)
//     return () => window.clearTimeout(t)
//   }, [inputText, operation, mode, plusSpace, liveMode])

//   useEffect(() => {
//     if (!autoCopy || !outputText) return
//     void navigator.clipboard.writeText(outputText).catch(() => undefined)
//   }, [autoCopy, outputText])

//   useEffect(() => {
//     const onKeyDown = (e: KeyboardEvent) => {
//       const meta = e.ctrlKey || e.metaKey
//       if (!meta) return
//       const key = e.key.toLowerCase()
//       if (e.shiftKey && key === "e") { e.preventDefault(); setOperation("encode") }
//       else if (e.shiftKey && key === "d") { e.preventDefault(); setOperation("decode") }
//       else if (e.shiftKey && key === "f") { e.preventDefault(); setMode("full") }
//       else if (e.shiftKey && key === "c") { e.preventDefault(); void handleCopy(outputText) }
//       else if (e.shiftKey && key === "i") { e.preventDefault(); void handleCopy(inputText) }
//       else if (e.shiftKey && key === "v") { e.preventDefault(); void handlePaste() }
//       else if (e.shiftKey && key === "s") { e.preventDefault(); swapOperation() }
//       else if (e.shiftKey && key === "x") { e.preventDefault(); clearAll() }
//     }
//     window.addEventListener("keydown", onKeyDown)
//     return () => window.removeEventListener("keydown", onKeyDown)
//   }, [outputText, inputText, mode, operation])

//   const runProcess = () => {
//     setError(null)
//     if (!inputText.trim()) { setOutputText(""); setStatus("Please enter text"); return }
//     try {
//       const result = operation === "encode" ? encodeText(inputText) : decodeText(inputText)
//       setOutputText(result)
//       setStatus(operation === "encode" ? "Encoded successfully" : "Decoded successfully")
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Invalid input")
//       setOutputText("")
//     }
//   }

//   const runOnCurrentInput = () => { runProcess() }

//   const clearAll = () => {
//     setInputText("")
//     setOutputText("")
//     setError(null)
//     setStatus("Cleared")
//     setSelectedParamIndex(null)
//   }

//   const copyToClipboard = async (text: string) => {
//     if (!text) return
//     try {
//       await navigator.clipboard.writeText(text)
//       setCopied(true)
//       setStatus("Copied to clipboard")
//       if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
//       copyTimerRef.current = setTimeout(() => setCopied(false), 1800)
//     } catch { setStatus("Copy failed") }
//   }

//   const handleCopy = async (text: string) => { await copyToClipboard(text) }
//   const handlePaste = async () => {
//     try {
//       const text = await navigator.clipboard.readText()
//       setInputText(text)
//       setStatus("Pasted from clipboard")
//     } catch { setStatus("Paste not allowed") }
//   }

//   const swapOperation = () => {
//     setOperation((prev) => (prev === "encode" ? "decode" : "encode"))
//     setInputText(outputText)
//     setOutputText(inputText)
//     setStatus("Swapped")
//   }

//   const loadSample = () => {
//     setInputText(mode === "full" ? SAMPLE_URL : SAMPLE_TEXT)
//     setStatus("Sample loaded")
//   }

//   const downloadOutput = () => {
//     if (!outputText) return
//     const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = operation === "encode" ? "url-encoded.txt" : "url-decoded.txt"
//     a.click()
//     URL.revokeObjectURL(url)
//     setStatus("Downloaded")
//   }

//   const handleFile = async (file: File) => {
//     const text = await file.text()
//     setInputText(text)
//     setStatus(`Loaded ${file.name}`)
//   }

//   const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) await handleFile(file)
//     e.target.value = ""
//   }

//   const updateParam = (index: number, field: "key" | "value", value: string) => {
//     if (!parsed) return
//     const nextParams = [...parsed.params]
//     nextParams[index] = { ...nextParams[index], [field]: value }
//     const nextParsed = { ...parsed, params: nextParams }
//     setInputText(buildUrlFromParsed(nextParsed))
//     setStatus("Query parameter updated")
//   }

//   const addParam = () => {
//     if (!parsed) return
//     const nextParams = [...parsed.params, { key: "", value: "" }]
//     setInputText(buildUrlFromParsed({ ...parsed, params: nextParams }))
//     setSelectedParamIndex(nextParams.length - 1)
//     setStatus("Parameter added")
//   }

//   const removeParam = (index: number) => {
//     if (!parsed) return
//     const nextParams = parsed.params.filter((_, i) => i !== index)
//     setInputText(buildUrlFromParsed({ ...parsed, params: nextParams }))
//     setSelectedParamIndex(null)
//     setStatus("Parameter removed")
//   }

//   const normalizedOutput = useMemo(() => outputText, [outputText])

//   return (
//     <div className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
//       <div className="w-full max-w-7xl space-y-8">
//         <ToolHero tool={tool} />

//         <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
//           {/* Toolbar row for sample, paste, clear, upload */}
//           <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-300/90 bg-slate-100/50 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6 dark:border-slate-600/80 dark:bg-slate-800/40">
//             <div className="flex flex-wrap items-center gap-2">
//               <button
//                 onClick={loadSample}
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
//               >
//                 <FileText className="h-4 w-4" />
//                 Sample
//               </button>
//               <button
//                 onClick={handlePaste}
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
//               >
//                 <ClipboardPaste className="h-4 w-4" />
//                 Paste
//               </button>
//               <button
//                 onClick={clearAll}
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700"
//               >
//                 <Trash2 className="h-4 w-4" />
//                 Clear
//               </button>
//               <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer">
//                 <Upload className="h-4 w-4" />
//                 Upload File
//                 <input
//                   ref={inputFileRef}
//                   type="file"
//                   accept=".txt,.md,.csv,.json,.log"
//                   className="hidden"
//                   onChange={onFileChange}
//                 />
//               </label>
//             </div>
//             {status && (
//               <span className="text-xs text-emerald-600 dark:text-emerald-400">{status}</span>
//             )}
//             {error && (
//               <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
//                 <AlertTriangle className="h-3.5 w-3.5" />
//                 {error}
//               </span>
//             )}
//           </div>

//           {/* Main panels */}
//           <div className="p-6 sm:p-8 space-y-8">
//             <div className="grid gap-6 xl:grid-cols-2">
//               <Panel title="Input" subtitle="Paste text or a full URL">
//                 <div className="mb-3 flex flex-wrap items-center gap-2">
//                   <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mode</span>
//                   <button onClick={() => setOperation("encode")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${operation === "encode" ? "bg-blue-600 text-white dark:bg-blue-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
//                     Encode
//                   </button>
//                   <button onClick={() => setOperation("decode")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${operation === "decode" ? "bg-blue-600 text-white dark:bg-blue-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
//                     Decode
//                   </button>
//                   <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Type</span>
//                   <button onClick={() => setMode("component")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "component" ? "bg-emerald-600 text-white dark:bg-emerald-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
//                     Component
//                   </button>
//                   <button onClick={() => setMode("full")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "full" ? "bg-emerald-600 text-white dark:bg-emerald-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
//                     Full URL
//                   </button>
//                 </div>

//                 <textarea
//                   value={inputText}
//                   onChange={(e) => setInputText(e.target.value)}
//                   placeholder={mode === "full" ? "Enter a URL to encode/decode..." : "Enter text to encode/decode..."}
//                   className="custom-scrollbar min-h-[220px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
//                   spellCheck={false}
//                 />

//                 <div className="flex flex-wrap gap-2">
//                   <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
//                     <input type="checkbox" checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} /> Live
//                   </label>
//                   <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
//                     <input type="checkbox" checked={autoCopy} onChange={(e) => setAutoCopy(e.target.checked)} /> Auto copy
//                   </label>
//                   <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
//                     <input type="checkbox" checked={plusSpace} onChange={(e) => setPlusSpace(e.target.checked)} /> + as space
//                   </label>
//                   <button onClick={() => handleCopy(inputText)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     Copy input
//                   </button>
//                 </div>
//               </Panel>

//               <Panel title="Output" subtitle="Encoded / decoded result">
//                 <div className="mb-3 flex flex-wrap items-center gap-2">
//                   <button onClick={runOnCurrentInput} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <Search className="h-4 w-4" /> Process
//                   </button>
//                   <button onClick={() => { setMode("full"); runProcess() }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <Link2 className="h-4 w-4" /> Process URL
//                   </button>
//                   <button onClick={swapOperation} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <ArrowRightLeft className="h-4 w-4" /> Swap
//                   </button>
//                   <button onClick={() => handleCopy(outputText)} disabled={!canCopy} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
//                     <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
//                   </button>
//                   <button onClick={downloadOutput} disabled={!canCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <Download className="h-4 w-4" /> Download
//                   </button>
//                 </div>
//                 <textarea
//                   value={normalizedOutput}
//                   readOnly
//                   placeholder="Encoded / decoded result will appear here..."
//                   className="custom-scrollbar min-h-[220px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
//                   spellCheck={false}
//                 />
//               </Panel>
//             </div>

//             {/* Stats & Parser row */}
//             <div className="grid gap-6 xl:grid-cols-2">
//               <Panel title="Stats" subtitle="Input / output summary">
//                 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//                   <StatCard label="Chars" value={inputStats.chars} tone="blue" />
//                   <StatCard label="Words" value={inputStats.words} tone="emerald" />
//                   <StatCard label="Lines" value={inputStats.lines} tone="violet" />
//                   <StatCard label="Bytes" value={inputStats.bytes} tone="slate" />
//                 </div>
//                 <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
//                   <StatCard label="Out bytes" value={inputStats.outBytes} tone="blue" />
//                   <StatCard label="Diff" value={inputStats.diff} tone="emerald" />
//                   <StatCard label="Likely URL" value={isLikelyUrl(inputText) ? "Yes" : "No"} tone="violet" />
//                   <StatCard label="Mode" value={mode === "component" ? "Component" : "Full URL"} tone="slate" />
//                 </div>
//               </Panel>

//               <Panel title="URL Parser" subtitle="Protocol, host, path, and query parameters">
//                 <div className="mb-3 flex items-center gap-2">
//                   <button onClick={() => setShowParser(!showParser)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     {showParser ? "Hide parser" : "Show parser"}
//                   </button>
//                   <button onClick={addParam} disabled={!parsed} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <Settings2 className="mr-1 inline h-4 w-4" /> Add param
//                   </button>
//                 </div>

//                 {showParser ? (
//                   parsed ? (
//                     <div className="space-y-3">
//                       <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
//                         <StatCard label="Protocol" value={parsed.protocol || "-"} tone="blue" />
//                         <StatCard label="Host" value={parsed.host || "-"} tone="emerald" />
//                         <StatCard label="Path" value={parsed.pathname || "/"} tone="violet" />
//                         <StatCard label="Query" value={parsed.params.length} tone="slate" />
//                       </div>
//                       <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
//                         <div className="grid grid-cols-[1fr_1fr_auto] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
//                           <div>Key</div>
//                           <div>Value</div>
//                           <div />
//                         </div>
//                         <div className="custom-scrollbar max-h-[340px] overflow-auto">
//                           {parsed.params.length === 0 ? (
//                             <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No query params found.</div>
//                           ) : (
//                             parsed.params.map((param, idx) => (
//                               <div key={`${param.key}-${idx}`} className={`grid grid-cols-[1fr_1fr_auto] gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800 ${selectedParamIndex === idx ? "bg-blue-50/60 dark:bg-blue-900/20" : ""}`}>
//                                 <input
//                                   value={param.key}
//                                   onChange={(e) => updateParam(idx, "key", e.target.value)}
//                                   className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
//                                   placeholder="key"
//                                 />
//                                 <input
//                                   value={param.value}
//                                   onChange={(e) => updateParam(idx, "value", e.target.value)}
//                                   className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
//                                   placeholder="value"
//                                 />
//                                 <button onClick={() => removeParam(idx)} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
//                                   Remove
//                                 </button>
//                               </div>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
//                       <Info className="mr-2 inline h-4 w-4" /> Enter a valid URL to see protocol, host, path, and query parameters.
//                     </div>
//                   )
//                 ) : null}
//               </Panel>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,116,139,.5); border-radius: 999px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71,85,105,.8); }
//         .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(100,116,139,.5) transparent; }
//       `}</style>
//     </div>
//   )
// }












// "use client"

// import React, { useEffect, useMemo, useRef, useState } from "react"
// import {
//   ArrowRightLeft,
//   ClipboardPaste,
//   Copy,
//   Download,
//   FileText,
//   Link2,
//   Trash2,
//   Upload,
//   Check,
//   Search,
//   Settings2,
//   AlertTriangle,
//   Info,
// } from "lucide-react"
// import { ToolHeroProps } from "@/types/tool"
// import ToolHero from "@/components/tool-page-helpers/ToolHero"

// /* -------------------------------------------------------
//     URL Encoder / Decoder – unified professional UI
// ------------------------------------------------------- */

// type Mode = "component" | "full"
// type Operation = "encode" | "decode"

// type QueryParam = {
//   key: string
//   value: string
// }

// type ParsedUrl = {
//   protocol: string
//   username: string
//   password: string
//   host: string
//   hostname: string
//   port: string
//   pathname: string
//   search: string
//   hash: string
//   origin: string
//   params: QueryParam[]
// }

// const SAMPLE_TEXT = `hello world? name=OpenAI & title=URL Encoder/Decoder`
// const SAMPLE_URL = `https://example.com/search?q=hello world&page=2&sort=latest#section`

// // Helper components
// const Panel: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
//   <div className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 flex flex-col gap-3">
//     <div>
//       <div className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</div>
//       {subtitle && <div className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>}
//     </div>
//     <div className="flex flex-col gap-3 flex-1">{children}</div>
//   </div>
// )

// const StatCard: React.FC<{ label: string; value: string | number; tone?: "blue" | "emerald" | "violet" | "slate" }> = ({ label, value, tone = "slate" }) => {
//   const tones = {
//     blue: "text-blue-600 dark:text-blue-400",
//     emerald: "text-emerald-600 dark:text-emerald-400",
//     violet: "text-violet-600 dark:text-violet-400",
//     slate: "text-slate-800 dark:text-slate-100",
//   }
//   return (
//     <div className="rounded-lg border border-slate-200/80 bg-white/70 px-3 py-2 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60 min-w-0 overflow-hidden">
//       <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
//       <div className={`text-sm font-bold tabular-nums break-all ${tones[tone]}`}>{value}</div>
//     </div>
//   )
// }

// // Utility functions (unchanged)
// function normalizeLineEndings(text: string): string { return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n") }
// function safeDecodeURIComponent(text: string): string { try { return decodeURIComponent(text) } catch { return text } }
// function safeDecodeURI(text: string): string { try { return decodeURI(text) } catch { return text } }
// function safeEncodeURIComponent(text: string): string { try { return encodeURIComponent(text) } catch { return text } }
// function safeEncodeURI(text: string): string { try { return encodeURI(text) } catch { return text } }
// function bytesOf(text: string): number { return new Blob([text]).size }
// function countWords(text: string): number { return normalizeLineEndings(text).trim().split(/\s+/).filter(Boolean).length }
// function countLines(text: string): number { if (!text.trim()) return 0; return normalizeLineEndings(text).split("\n").length }
// function isLikelyUrl(text: string): boolean { const trimmed = text.trim(); return /^https?:\/\//i.test(trimmed) || /^\/\//.test(trimmed) || /^[^\s]+\.[^\s]+/.test(trimmed) }

// function parseUrlMaybe(raw: string): ParsedUrl | null {
//   const input = raw.trim()
//   if (!input) return null
//   const candidates = [input, /^https?:\/\//i.test(input) ? input : `https://${input}`]
//   for (const candidate of candidates) {
//     try {
//       const url = new URL(candidate)
//       const params: QueryParam[] = []
//       url.searchParams.forEach((value, key) => { params.push({ key, value }) })
//       return {
//         protocol: url.protocol,
//         username: url.username,
//         password: url.password,
//         host: url.host,
//         hostname: url.hostname,
//         port: url.port,
//         pathname: url.pathname,
//         search: url.search,
//         hash: url.hash,
//         origin: url.origin,
//         params,
//       }
//     } catch {}
//   }
//   return null
// }

// function buildUrlFromParsed(parsed: ParsedUrl): string {
//   const url = new URL(parsed.origin || `https://${parsed.host || parsed.hostname}`)
//   url.username = parsed.username
//   url.password = parsed.password
//   url.hostname = parsed.hostname || url.hostname
//   url.port = parsed.port
//   url.pathname = parsed.pathname || "/"
//   url.search = ""
//   parsed.params.forEach(({ key, value }) => { if (key.trim()) url.searchParams.append(key, value) })
//   url.hash = parsed.hash || ""
//   return url.toString()
// }

// function toPlusSpaces(text: string): string { return text.replace(/%20/g, "+") }
// function fromPlusSpaces(text: string): string { return text.replace(/\+/g, "%20") }

// export default function URLEncoder({ tool }: ToolHeroProps) {
//   const [inputText, setInputText] = useState("")
//   const [outputText, setOutputText] = useState("")
//   const [operation, setOperation] = useState<Operation>("encode")
//   const [mode, setMode] = useState<Mode>("component")
//   const [liveMode, setLiveMode] = useState(true)
//   const [autoCopy, setAutoCopy] = useState(false)
//   const [plusSpace, setPlusSpace] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [status, setStatus] = useState<string>("")
//   const [showParser, setShowParser] = useState(true)
//   const [copied, setCopied] = useState(false)
//   const [selectedParamIndex, setSelectedParamIndex] = useState<number | null>(null)
//   const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
//   const inputFileRef = useRef<HTMLInputElement | null>(null)

//   const canCopy = useMemo(() => !!outputText.trim(), [outputText])

//   const parsed = useMemo(() => parseUrlMaybe(inputText), [inputText])
//   const inputStats = useMemo(() => {
//     const bytes = bytesOf(inputText)
//     const outBytes = bytesOf(outputText)
//     return { chars: inputText.length, words: countWords(inputText), lines: countLines(inputText), bytes, outBytes, diff: outBytes - bytes }
//   }, [inputText, outputText])

//   const encodeText = (text: string) => {
//     const value = mode === "component" ? safeEncodeURIComponent(text) : safeEncodeURI(text)
//     return plusSpace ? toPlusSpaces(value) : value
//   }
//   const decodeText = (text: string) => {
//     const normalized = plusSpace ? fromPlusSpaces(text) : text
//     return mode === "component" ? safeDecodeURIComponent(normalized) : safeDecodeURI(normalized)
//   }

//   useEffect(() => {
//     if (!liveMode) return
//     setError(null)
//     if (!inputText.trim()) { setOutputText(""); return }
//     const t = window.setTimeout(() => {
//       const result = operation === "encode" ? encodeText(inputText) : decodeText(inputText)
//       setOutputText(result)
//     }, 180)
//     return () => window.clearTimeout(t)
//   }, [inputText, operation, mode, plusSpace, liveMode])

//   useEffect(() => {
//     if (!autoCopy || !outputText) return
//     void navigator.clipboard.writeText(outputText).catch(() => undefined)
//   }, [autoCopy, outputText])

//   useEffect(() => {
//     const onKeyDown = (e: KeyboardEvent) => {
//       const meta = e.ctrlKey || e.metaKey
//       if (!meta) return
//       const key = e.key.toLowerCase()
//       if (e.shiftKey && key === "e") { e.preventDefault(); setOperation("encode") }
//       else if (e.shiftKey && key === "d") { e.preventDefault(); setOperation("decode") }
//       else if (e.shiftKey && key === "f") { e.preventDefault(); setMode("full") }
//       else if (e.shiftKey && key === "c") { e.preventDefault(); void handleCopy(outputText) }
//       else if (e.shiftKey && key === "i") { e.preventDefault(); void handleCopy(inputText) }
//       else if (e.shiftKey && key === "v") { e.preventDefault(); void handlePaste() }
//       else if (e.shiftKey && key === "s") { e.preventDefault(); swapOperation() }
//       else if (e.shiftKey && key === "x") { e.preventDefault(); clearAll() }
//     }
//     window.addEventListener("keydown", onKeyDown)
//     return () => window.removeEventListener("keydown", onKeyDown)
//   }, [outputText, inputText, mode, operation])

//   const runProcess = () => {
//     setError(null)
//     if (!inputText.trim()) { setOutputText(""); setStatus("Please enter text"); return }
//     try {
//       const result = operation === "encode" ? encodeText(inputText) : decodeText(inputText)
//       setOutputText(result)
//       setStatus(operation === "encode" ? "Encoded successfully" : "Decoded successfully")
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Invalid input")
//       setOutputText("")
//     }
//   }

//   const runOnCurrentInput = () => { runProcess() }

//   const clearAll = () => {
//     setInputText("")
//     setOutputText("")
//     setError(null)
//     setStatus("Cleared")
//     setSelectedParamIndex(null)
//   }

//   const copyToClipboard = async (text: string) => {
//     if (!text) return
//     try {
//       await navigator.clipboard.writeText(text)
//       setCopied(true)
//       setStatus("Copied to clipboard")
//       if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
//       copyTimerRef.current = setTimeout(() => setCopied(false), 1800)
//     } catch { setStatus("Copy failed") }
//   }

//   const handleCopy = async (text: string) => { await copyToClipboard(text) }
//   const handlePaste = async () => {
//     try {
//       const text = await navigator.clipboard.readText()
//       setInputText(text)
//       setStatus("Pasted from clipboard")
//     } catch { setStatus("Paste not allowed") }
//   }

//   const swapOperation = () => {
//     setOperation((prev) => (prev === "encode" ? "decode" : "encode"))
//     setInputText(outputText)
//     setOutputText(inputText)
//     setStatus("Swapped")
//   }

//   const loadSample = () => {
//     setInputText(mode === "full" ? SAMPLE_URL : SAMPLE_TEXT)
//     setStatus("Sample loaded")
//   }

//   const downloadOutput = () => {
//     if (!outputText) return
//     const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = operation === "encode" ? "url-encoded.txt" : "url-decoded.txt"
//     a.click()
//     URL.revokeObjectURL(url)
//     setStatus("Downloaded")
//   }

//   const handleFile = async (file: File) => {
//     const text = await file.text()
//     setInputText(text)
//     setStatus(`Loaded ${file.name}`)
//   }

//   const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) await handleFile(file)
//     e.target.value = ""
//   }

//   const updateParam = (index: number, field: "key" | "value", value: string) => {
//     if (!parsed) return
//     const nextParams = [...parsed.params]
//     nextParams[index] = { ...nextParams[index], [field]: value }
//     const nextParsed = { ...parsed, params: nextParams }
//     setInputText(buildUrlFromParsed(nextParsed))
//     setStatus("Query parameter updated")
//   }

//   const addParam = () => {
//     if (!parsed) return
//     const nextParams = [...parsed.params, { key: "", value: "" }]
//     setInputText(buildUrlFromParsed({ ...parsed, params: nextParams }))
//     setSelectedParamIndex(nextParams.length - 1)
//     setStatus("Parameter added")
//   }

//   const removeParam = (index: number) => {
//     if (!parsed) return
//     const nextParams = parsed.params.filter((_, i) => i !== index)
//     setInputText(buildUrlFromParsed({ ...parsed, params: nextParams }))
//     setSelectedParamIndex(null)
//     setStatus("Parameter removed")
//   }

//   const normalizedOutput = useMemo(() => outputText, [outputText])

//   return (
//     <div className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
//       <div className="w-full max-w-7xl space-y-8">
//         <ToolHero tool={tool} />

//         <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
//           {/* Toolbar row for sample, paste, clear, upload */}
//           <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-300/90 bg-slate-100/50 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6 dark:border-slate-600/80 dark:bg-slate-800/40">
//             <div className="flex flex-wrap items-center gap-2">
//               <button
//                 onClick={loadSample}
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
//               >
//                 <FileText className="h-4 w-4" />
//                 Sample
//               </button>
//               <button
//                 onClick={handlePaste}
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
//               >
//                 <ClipboardPaste className="h-4 w-4" />
//                 Paste
//               </button>
//               <button
//                 onClick={clearAll}
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700"
//               >
//                 <Trash2 className="h-4 w-4" />
//                 Clear
//               </button>
//               <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer">
//                 <Upload className="h-4 w-4" />
//                 Upload File
//                 <input
//                   ref={inputFileRef}
//                   type="file"
//                   accept=".txt,.md,.csv,.json,.log"
//                   className="hidden"
//                   onChange={onFileChange}
//                 />
//               </label>
//             </div>
//             {status && (
//               <span className="text-xs text-emerald-600 dark:text-emerald-400">{status}</span>
//             )}
//             {error && (
//               <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
//                 <AlertTriangle className="h-3.5 w-3.5" />
//                 {error}
//               </span>
//             )}
//           </div>

//           {/* Main panels */}
//           <div className="p-6 sm:p-8 space-y-8">
//             <div className="grid gap-6 xl:grid-cols-2">
//               <Panel title="Input" subtitle="Paste text or a full URL">
//                 <div className="mb-3 flex flex-wrap items-center gap-2">
//                   <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mode</span>
//                   <button onClick={() => setOperation("encode")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${operation === "encode" ? "bg-blue-600 text-white dark:bg-blue-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
//                     Encode
//                   </button>
//                   <button onClick={() => setOperation("decode")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${operation === "decode" ? "bg-blue-600 text-white dark:bg-blue-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
//                     Decode
//                   </button>
//                   <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Type</span>
//                   <button onClick={() => setMode("component")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "component" ? "bg-emerald-600 text-white dark:bg-emerald-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
//                     Component
//                   </button>
//                   <button onClick={() => setMode("full")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "full" ? "bg-emerald-600 text-white dark:bg-emerald-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
//                     Full URL
//                   </button>
//                 </div>

//                 <textarea
//                   value={inputText}
//                   onChange={(e) => setInputText(e.target.value)}
//                   placeholder={mode === "full" ? "Enter a URL to encode/decode..." : "Enter text to encode/decode..."}
//                   className="custom-scrollbar min-h-[220px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
//                   spellCheck={false}
//                 />

//                 <div className="flex flex-wrap gap-2">
//                   <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
//                     <input type="checkbox" checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} /> Live
//                   </label>
//                   <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
//                     <input type="checkbox" checked={autoCopy} onChange={(e) => setAutoCopy(e.target.checked)} /> Auto copy
//                   </label>
//                   <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
//                     <input type="checkbox" checked={plusSpace} onChange={(e) => setPlusSpace(e.target.checked)} /> + as space
//                   </label>
//                   <button onClick={() => handleCopy(inputText)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     Copy input
//                   </button>
//                 </div>
//               </Panel>

//               <Panel title="Output" subtitle="Encoded / decoded result">
//                 <div className="mb-3 flex flex-wrap items-center gap-2">
//                   <button onClick={runOnCurrentInput} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <Search className="h-4 w-4" /> Process
//                   </button>
//                   <button onClick={() => { setMode("full"); runProcess() }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <Link2 className="h-4 w-4" /> Process URL
//                   </button>
//                   <button onClick={swapOperation} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <ArrowRightLeft className="h-4 w-4" /> Swap
//                   </button>
//                   <button onClick={() => handleCopy(outputText)} disabled={!canCopy} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
//                     <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
//                   </button>
//                   <button onClick={downloadOutput} disabled={!canCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <Download className="h-4 w-4" /> Download
//                   </button>
//                 </div>
//                 <textarea
//                   value={normalizedOutput}
//                   readOnly
//                   placeholder="Encoded / decoded result will appear here..."
//                   className="custom-scrollbar min-h-[220px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
//                   spellCheck={false}
//                 />
//               </Panel>
//             </div>

//             {/* Stats & Parser row */}
//             <div className="grid gap-6 xl:grid-cols-2">
//               <Panel title="Stats" subtitle="Input / output summary">
//                 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//                   <StatCard label="Chars" value={inputStats.chars} tone="blue" />
//                   <StatCard label="Words" value={inputStats.words} tone="emerald" />
//                   <StatCard label="Lines" value={inputStats.lines} tone="violet" />
//                   <StatCard label="Bytes" value={inputStats.bytes} tone="slate" />
//                 </div>
//                 <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
//                   <StatCard label="Out bytes" value={inputStats.outBytes} tone="blue" />
//                   <StatCard label="Diff" value={inputStats.diff} tone="emerald" />
//                   <StatCard label="Likely URL" value={isLikelyUrl(inputText) ? "Yes" : "No"} tone="violet" />
//                   <StatCard label="Mode" value={mode === "component" ? "Component" : "Full URL"} tone="slate" />
//                 </div>
//               </Panel>

//               <Panel title="URL Parser" subtitle="Protocol, host, path, and query parameters">
//                 <div className="mb-3 flex items-center gap-2">
//                   <button onClick={() => setShowParser(!showParser)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     {showParser ? "Hide parser" : "Show parser"}
//                   </button>
//                   <button onClick={addParam} disabled={!parsed} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
//                     <Settings2 className="mr-1 inline h-4 w-4" /> Add param
//                   </button>
//                 </div>

//                 {showParser ? (
//                   parsed ? (
//                     <div className="space-y-3">
//                       <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
//                         <StatCard label="Protocol" value={parsed.protocol || "-"} tone="blue" />
//                         <StatCard label="Host" value={parsed.host || "-"} tone="emerald" />
//                         <StatCard label="Path" value={parsed.pathname || "/"} tone="violet" />
//                         <StatCard label="Query" value={parsed.params.length} tone="slate" />
//                       </div>
//                       <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
//                         <div className="grid grid-cols-[1fr_1fr_auto] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
//                           <div>Key</div>
//                           <div>Value</div>
//                           <div />
//                         </div>
//                         <div className="custom-scrollbar max-h-[340px] overflow-auto">
//                           {parsed.params.length === 0 ? (
//                             <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No query params found.</div>
//                           ) : (
//                             parsed.params.map((param, idx) => (
//                               <div key={`${param.key}-${idx}`} className={`grid grid-cols-[1fr_1fr_auto] gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800 ${selectedParamIndex === idx ? "bg-blue-50/60 dark:bg-blue-900/20" : ""}`}>
//                                 <input
//                                   value={param.key}
//                                   onChange={(e) => updateParam(idx, "key", e.target.value)}
//                                   className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
//                                   placeholder="key"
//                                 />
//                                 <input
//                                   value={param.value}
//                                   onChange={(e) => updateParam(idx, "value", e.target.value)}
//                                   className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
//                                   placeholder="value"
//                                 />
//                                 <button onClick={() => removeParam(idx)} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
//                                   Remove
//                                 </button>
//                               </div>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
//                       <Info className="mr-2 inline h-4 w-4" /> Enter a valid URL to see protocol, host, path, and query parameters.
//                     </div>
//                   )
//                 ) : null}
//               </Panel>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,116,139,.5); border-radius: 999px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71,85,105,.8); }
//         .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(100,116,139,.5) transparent; }
//       `}</style>
//     </div>
//   )
// }
















"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowRightLeft,
  ClipboardPaste,
  Copy,
  Download,
  FileText,
  Link2,
  Trash2,
  Upload,
  Check,
  Search,
  Settings2,
  AlertTriangle,
  Info,
} from "lucide-react"
import { ToolHeroProps } from "@/types/tool"
import ToolHero from "@/components/tool-page-helpers/ToolHero"

/* -------------------------------------------------------
    URL Encoder / Decoder – unified professional UI
------------------------------------------------------- */

type Mode = "component" | "full"
type Operation = "encode" | "decode"

type QueryParam = {
  key: string
  value: string
}

type ParsedUrl = {
  protocol: string
  username: string
  password: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  params: QueryParam[]
}

const SAMPLE_TEXT = `hello world? name=OpenAI & title=URL Encoder/Decoder`
const SAMPLE_URL = `https://example.com/search?q=hello world&page=2&sort=latest#section`

// Helper components
const Panel: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 flex flex-col gap-3">
    <div>
      <div className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</div>
      {subtitle && <div className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>}
    </div>
    <div className="flex flex-col gap-3 flex-1">{children}</div>
  </div>
)

const StatCard: React.FC<{ label: string; value: string | number; tone?: "blue" | "emerald" | "violet" | "slate"; isPath?: boolean }> = ({ label, value, tone = "slate", isPath = false }) => {
  const tones = {
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    slate: "text-slate-800 dark:text-slate-100",
  }
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/70 px-3 py-2 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60 flex flex-col min-w-0 w-full">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
      {isPath ? (
        <div className={`text-sm font-bold break-all custom-scrollbar overflow-y-auto max-h-[120px] pr-1 mt-0.5 ${tones[tone]}`}>
          {value}
        </div>
      ) : (
        <div className={`text-sm font-bold break-all custom-scrollbar overflow-y-auto max-h-[80px] pr-1 mt-0.5 sm:truncate sm:max-h-none ${tones[tone]}`}>{value}</div>
      )}
    </div>
  )
}

// Utility functions (unchanged)
function normalizeLineEndings(text: string): string { return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n") }
function safeDecodeURIComponent(text: string): string { try { return decodeURIComponent(text) } catch { return text } }
function safeDecodeURI(text: string): string { try { return decodeURI(text) } catch { return text } }
function safeEncodeURIComponent(text: string): string { try { return encodeURIComponent(text) } catch { return text } }
function safeEncodeURI(text: string): string { try { return encodeURI(text) } catch { return text } }
function bytesOf(text: string): number { return new Blob([text]).size }
function countWords(text: string): number { return normalizeLineEndings(text).trim().split(/\s+/).filter(Boolean).length }
function countLines(text: string): number { if (!text.trim()) return 0; return normalizeLineEndings(text).split("\n").length }
function isLikelyUrl(text: string): boolean { const trimmed = text.trim(); return /^https?:\/\//i.test(trimmed) || /^\/\//.test(trimmed) || /^[^\s]+\.[^\s]+/.test(trimmed) }

function parseUrlMaybe(raw: string): ParsedUrl | null {
  const input = raw.trim()
  if (!input) return null
  const candidates = [input, /^https?:\/\//i.test(input) ? input : `https://${input}`]
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate)
      const params: QueryParam[] = []
      url.searchParams.forEach((value, key) => { params.push({ key, value }) })
      return {
        protocol: url.protocol,
        username: url.username,
        password: url.password,
        host: url.host,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
        params,
      }
    } catch {}
  }
  return null
}

function buildUrlFromParsed(parsed: ParsedUrl): string {
  const url = new URL(parsed.origin || `https://${parsed.host || parsed.hostname}`)
  url.username = parsed.username
  url.password = parsed.password
  url.hostname = parsed.hostname || url.hostname
  url.port = parsed.port
  url.pathname = parsed.pathname || "/"
  url.search = ""
  parsed.params.forEach(({ key, value }) => { if (key.trim()) url.searchParams.append(key, value) })
  url.hash = parsed.hash || ""
  return url.toString()
}

function toPlusSpaces(text: string): string { return text.replace(/%20/g, "+") }
function fromPlusSpaces(text: string): string { return text.replace(/\+/g, "%20") }

export default function URLEncoder({ tool }: ToolHeroProps) {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [operation, setOperation] = useState<Operation>("encode")
  const [mode, setMode] = useState<Mode>("component")
  const [liveMode, setLiveMode] = useState(true)
  const [autoCopy, setAutoCopy] = useState(false)
  const [plusSpace, setPlusSpace] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [showParser, setShowParser] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selectedParamIndex, setSelectedParamIndex] = useState<number | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputFileRef = useRef<HTMLInputElement | null>(null)

  const canCopy = useMemo(() => !!outputText.trim(), [outputText])

  const parsed = useMemo(() => parseUrlMaybe(inputText), [inputText])
  const inputStats = useMemo(() => {
    const bytes = bytesOf(inputText)
    const outBytes = bytesOf(outputText)
    return { chars: inputText.length, words: countWords(inputText), lines: countLines(inputText), bytes, outBytes, diff: outBytes - bytes }
  }, [inputText, outputText])

  const encodeText = (text: string) => {
    const value = mode === "component" ? safeEncodeURIComponent(text) : safeEncodeURI(text)
    return plusSpace ? toPlusSpaces(value) : value
  }
  const decodeText = (text: string) => {
    const normalized = plusSpace ? fromPlusSpaces(text) : text
    return mode === "component" ? safeDecodeURIComponent(normalized) : safeDecodeURI(normalized)
  }

  useEffect(() => {
    if (!liveMode) return
    setError(null)
    if (!inputText.trim()) { setOutputText(""); return }
    const t = window.setTimeout(() => {
      const result = operation === "encode" ? encodeText(inputText) : decodeText(inputText)
      setOutputText(result)
    }, 180)
    return () => window.clearTimeout(t)
  }, [inputText, operation, mode, plusSpace, liveMode])

  useEffect(() => {
    if (!autoCopy || !outputText) return
    void navigator.clipboard.writeText(outputText).catch(() => undefined)
  }, [autoCopy, outputText])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey
      if (!meta) return
      const key = e.key.toLowerCase()
      if (e.shiftKey && key === "e") { e.preventDefault(); setOperation("encode") }
      else if (e.shiftKey && key === "d") { e.preventDefault(); setOperation("decode") }
      else if (e.shiftKey && key === "f") { e.preventDefault(); setMode("full") }
      else if (e.shiftKey && key === "c") { e.preventDefault(); void handleCopy(outputText) }
      else if (e.shiftKey && key === "i") { e.preventDefault(); void handleCopy(inputText) }
      else if (e.shiftKey && key === "v") { e.preventDefault(); void handlePaste() }
      else if (e.shiftKey && key === "s") { e.preventDefault(); swapOperation() }
      else if (e.shiftKey && key === "x") { e.preventDefault(); clearAll() }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [outputText, inputText, mode, operation])

  const runProcess = () => {
    setError(null)
    if (!inputText.trim()) { setOutputText(""); setStatus("Please enter text"); return }
    try {
      const result = operation === "encode" ? encodeText(inputText) : decodeText(inputText)
      setOutputText(result)
      setStatus(operation === "encode" ? "Encoded successfully" : "Decoded successfully")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input")
      setOutputText("")
    }
  }

  const runOnCurrentInput = () => { runProcess() }

  const clearAll = () => {
    setInputText("")
    setOutputText("")
    setError(null)
    setStatus("Cleared")
    setSelectedParamIndex(null)
  }

  const copyToClipboard = async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setStatus("Copied to clipboard")
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800)
    } catch { setStatus("Copy failed") }
  }

  const handleCopy = async (text: string) => { await copyToClipboard(text) }
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      setStatus("Pasted from clipboard")
    } catch { setStatus("Paste not allowed") }
  }

  const swapOperation = () => {
    setOperation((prev) => (prev === "encode" ? "decode" : "encode"))
    setInputText(outputText)
    setOutputText(inputText)
    setStatus("Swapped")
  }

  const loadSample = () => {
    setInputText(mode === "full" ? SAMPLE_URL : SAMPLE_TEXT)
    setStatus("Sample loaded")
  }

  const downloadOutput = () => {
    if (!outputText) return
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = operation === "encode" ? "url-encoded.txt" : "url-decoded.txt"
    a.click()
    URL.revokeObjectURL(url)
    setStatus("Downloaded")
  }

  const handleFile = async (file: File) => {
    const text = await file.text()
    setInputText(text)
    setStatus(`Loaded ${file.name}`)
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleFile(file)
    e.target.value = ""
  }

  const updateParam = (index: number, field: "key" | "value", value: string) => {
    if (!parsed) return
    const nextParams = [...parsed.params]
    nextParams[index] = { ...nextParams[index], [field]: value }
    const nextParsed = { ...parsed, params: nextParams }
    setInputText(buildUrlFromParsed(nextParsed))
    setStatus("Query parameter updated")
  }

  const addParam = () => {
    if (!parsed) return
    const nextParams = [...parsed.params, { key: "", value: "" }]
    setInputText(buildUrlFromParsed({ ...parsed, params: nextParams }))
    setSelectedParamIndex(nextParams.length - 1)
    setStatus("Parameter added")
  }

  const removeParam = (index: number) => {
    if (!parsed) return
    const nextParams = parsed.params.filter((_, i) => i !== index)
    setInputText(buildUrlFromParsed({ ...parsed, params: nextParams }))
    setSelectedParamIndex(null)
    setStatus("Parameter removed")
  }

  const normalizedOutput = useMemo(() => outputText, [outputText])

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="w-full max-w-7xl space-y-8">
        <ToolHero tool={tool} />

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
          {/* Toolbar row for sample, paste, clear, upload */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-300/90 bg-slate-100/50 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6 dark:border-slate-600/80 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadSample}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <FileText className="h-4 w-4" />
                Sample
              </button>
              <button
                onClick={handlePaste}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ClipboardPaste className="h-4 w-4" />
                Paste
              </button>
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer">
                <Upload className="h-4 w-4" />
                Upload File
                <input
                  ref={inputFileRef}
                  type="file"
                  accept=".txt,.md,.csv,.json,.log"
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>
            </div>
            {status && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">{status}</span>
            )}
            {error && (
              <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {error}
              </span>
            )}
          </div>

          {/* Main panels */}
          <div className="p-6 sm:p-8 space-y-8">
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Input" subtitle="Paste text or a full URL">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mode</span>
                  <button onClick={() => setOperation("encode")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${operation === "encode" ? "bg-blue-600 text-white dark:bg-blue-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                    Encode
                  </button>
                  <button onClick={() => setOperation("decode")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${operation === "decode" ? "bg-blue-600 text-white dark:bg-blue-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                    Decode
                  </button>
                  <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Type</span>
                  <button onClick={() => setMode("component")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "component" ? "bg-emerald-600 text-white dark:bg-emerald-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                    Component
                  </button>
                  <button onClick={() => setMode("full")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "full" ? "bg-emerald-600 text-white dark:bg-emerald-500" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                    Full URL
                  </button>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={mode === "full" ? "Enter a URL to encode/decode..." : "Enter text to encode/decode..."}
                  className="custom-scrollbar min-h-[220px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  spellCheck={false}
                />

                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
                    <input type="checkbox" checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} /> Live
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
                    <input type="checkbox" checked={autoCopy} onChange={(e) => setAutoCopy(e.target.checked)} /> Auto copy
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
                    <input type="checkbox" checked={plusSpace} onChange={(e) => setPlusSpace(e.target.checked)} /> + as space
                  </label>
                  <button onClick={() => handleCopy(inputText)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    Copy input
                  </button>
                </div>
              </Panel>

              <Panel title="Output" subtitle="Encoded / decoded result">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <button onClick={runOnCurrentInput} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Search className="h-4 w-4" /> Process
                  </button>
                  <button onClick={() => { setMode("full"); runProcess() }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Link2 className="h-4 w-4" /> Process URL
                  </button>
                  <button onClick={swapOperation} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <ArrowRightLeft className="h-4 w-4" /> Swap
                  </button>
                  <button onClick={() => handleCopy(outputText)} disabled={!canCopy} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
                    <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={downloadOutput} disabled={!canCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Download className="h-4 w-4" /> Download
                  </button>
                </div>
                <textarea
                  value={normalizedOutput}
                  readOnly
                  placeholder="Encoded / decoded result will appear here..."
                  className="custom-scrollbar min-h-[220px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  spellCheck={false}
                />
              </Panel>
            </div>

            {/* Stats & Parser row */}
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Stats" subtitle="Input / output summary">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 text-center">
                  <StatCard label="Chars" value={inputStats.chars} tone="blue" />
                  <StatCard label="Words" value={inputStats.words} tone="emerald" />
                  <StatCard label="Lines" value={inputStats.lines} tone="violet" />
                  <StatCard label="Bytes" value={inputStats.bytes} tone="slate" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3  lg:grid-cols-4 text-center">
                  <StatCard label="Out bytes" value={inputStats.outBytes} tone="blue" />
                  <StatCard label="Diff" value={inputStats.diff} tone="emerald" />
                  <StatCard label="Likely URL" value={isLikelyUrl(inputText) ? "Yes" : "No"} tone="violet" />
                  <StatCard label="Mode" value={mode === "component" ? "Component" : "Full URL"} tone="slate" />
                </div>
              </Panel>

              <Panel title="URL Parser" subtitle="Protocol, host, path, and query parameters">
                <div className="mb-3 flex items-center gap-2">
                  <button onClick={() => setShowParser(!showParser)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    {showParser ? "Hide parser" : "Show parser"}
                  </button>
                  <button onClick={addParam} disabled={!parsed} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Settings2 className="mr-1 inline h-4 w-4" /> Add param
                  </button>
                </div>

                {showParser ? (
                  parsed ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Protocol" value={parsed.protocol || "-"} tone="blue" />
                        <StatCard label="Host" value={parsed.host || "-"} tone="emerald" />
                        <StatCard label="Path" value={parsed.pathname || "/"} tone="violet" isPath={true} />
                        <StatCard label="Query" value={parsed.params.length} tone="slate" />
                      </div>
                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
                          <div>Key</div>
                          <div>Value</div>
                          <div />
                        </div>
                        <div className="custom-scrollbar max-h-[340px] overflow-auto">
                          {parsed.params.length === 0 ? (
                            <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No query params found.</div>
                          ) : (
                            parsed.params.map((param, idx) => (
                              <div key={`${param.key}-${idx}`} className={`grid grid-cols-[1fr_1fr_auto] gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800 ${selectedParamIndex === idx ? "bg-blue-50/60 dark:bg-blue-900/20" : ""}`}>
                                <input
                                  value={param.key}
                                  onChange={(e) => updateParam(idx, "key", e.target.value)}
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 w-full"
                                  placeholder="key"
                                />
                                <input
                                  value={param.value}
                                  onChange={(e) => updateParam(idx, "value", e.target.value)}
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 w-full"
                                  placeholder="value"
                                />
                                <button onClick={() => removeParam(idx)} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                                  Remove
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                      <Info className="mr-2 inline h-4 w-4" /> Enter a valid URL to see protocol, host, path, and query parameters.
                    </div>
                  )
                ) : null}
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