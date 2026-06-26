"use client"

import React, { useState, useCallback } from "react"

/* ---------- tiny xml helpers ---------- */

function parseXml(xml: string) {
    try {
        const p = new DOMParser()
        const d = p.parseFromString(xml, "application/xml")
        const e = d.querySelector("parsererror")
        if (e)
            return {
                ok: false,
                error: e.textContent?.split("error:")[1]?.trim() || "invalid",
            }
        const root = d.documentElement
        if (!root) return { ok: false, error: "empty" }
        function walk(el: Element): any {
            const attrs: any = {}
            for (let i = 0; i < el.attributes.length; i++)
                attrs[el.attributes[i].name] = el.attributes[i].value
            const kids: any[] = []
            const texts: string[] = []
            for (let i = 0; i < el.childNodes.length; i++) {
                const n = el.childNodes[i]
                if (n.nodeType === 1) kids.push(walk(n as Element))
                else if (n.nodeType === 3) {
                    const t = (n as Text).nodeValue?.trim()
                    if (t) texts.push(t)
                }
            }
            const isTextOnly = kids.length === 0 && texts.length > 0
            return {
                tag: el.tagName,
                attrs,
                kids,
                text: texts.join(" "),
                isTextOnly,
            }
        }
        return { ok: true, tree: walk(root) }
    } catch (e: any) {
        return { ok: false, error: e.message }
    }
}

function fmt(n: any, indent: number, d: number): string {
    const pad = " ".repeat(indent * d)
    const attrs = Object.entries(n.attrs || {})
        .map(([k, v]) => ` ${k}="${v}"`)
        .join("")
    if (n.isTextOnly) return `${pad}<${n.tag}${attrs}>${n.text}</${n.tag}>`
    if (!n.kids.length && !n.text) return `${pad}<${n.tag}${attrs} />`
    let s = `${pad}<${n.tag}${attrs}>`
    if (n.text && !n.isTextOnly)
        s += "\n" + " ".repeat(indent * (d + 1)) + n.text
    for (const c of n.kids) s += "\n" + fmt(c, indent, d + 1)
    s += "\n" + pad + `</${n.tag}>`
    return s
}

function minify(xml: string) {
    return xml.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim()
}

/* ---------- tree view ---------- */

const TreeItem: React.FC<{ node: any; depth: number }> = ({ node, depth }) => {
    const [collapsed, setCollapsed] = useState(false)
    const toggle = () => setCollapsed(!collapsed)
    const hasKids = node.kids?.length > 0
    return (
        <div className="whitespace-nowrap" style={{ marginLeft: depth * 20 }}>
            <div
                onClick={toggle}
                className="inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 select-none hover:bg-slate-100 dark:hover:bg-slate-800"
            >
                {hasKids ? (
                    <span className="w-4 text-center text-xs">
                        {collapsed ? "▶" : "▼"}
                    </span>
                ) : (
                    <span className="w-4" />
                )}
                <span className="font-semibold text-blue-700 dark:text-blue-400">
                    &lt;{node.tag}
                </span>
                {Object.entries(node.attrs || {}).map(([k, v]: any) => (
                    <span
                        key={k}
                        className="ml-1 text-emerald-700 dark:text-emerald-400"
                    >
                        {k}=
                        <span className="text-orange-600 dark:text-orange-300">
                            "{v}"
                        </span>
                    </span>
                ))}
                {node.isTextOnly ? (
                    <>
                        <span className="text-blue-700 dark:text-blue-400">
                            &gt;
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                            {node.text}
                        </span>
                        <span className="text-blue-700 dark:text-blue-400">
                            &lt;/{node.tag}&gt;
                        </span>
                    </>
                ) : (
                    <span className="text-blue-700 dark:text-blue-400">
                        &gt;
                    </span>
                )}
            </div>
            {!collapsed && (
                <>
                    {node.text && !node.isTextOnly && (
                        <div
                            style={{ marginLeft: depth * 20 + 20 }}
                            className="whitespace-nowrap text-slate-700 italic dark:text-slate-300"
                        >
                            {node.text}
                        </div>
                    )}
                    {hasKids &&
                        node.kids.map((c: any, i: number) => (
                            <TreeItem key={i} node={c} depth={depth + 1} />
                        ))}
                    {!node.isTextOnly && (
                        <div
                            style={{ marginLeft: depth * 20 }}
                            className="whitespace-nowrap text-blue-700 dark:text-blue-400"
                        >
                            &lt;/{node.tag}&gt;
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

/* ---------- stat card ---------- */

const Stat: React.FC<{
    label: string
    value: string | number
    accent: string
}> = ({ label, value, accent }) => {
    const colorMap: any = {
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
            <div
                className={`text-sm font-bold tabular-nums ${colorMap[accent]}`}
            >
                {value}
            </div>
        </div>
    )
}

/* ---------- main tool ---------- */

export default function XmlTool() {
    const [xml, setXml] = useState("")
    const [indent, setIndent] = useState(2)
    const [mode, setMode] = useState<"format" | "minify" | "tree">("format")
    const [result, setResult] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<"input" | "output">("input")
    const [isCopied, setIsCopied] = useState(false)

    const handleInput = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const v = e.target.value
            setXml(v)
            const r = parseXml(v)
            setResult(r)
        },
        []
    )

    let output = ""
    if (result?.ok && xml.trim()) {
        if (mode === "format") output = fmt(result.tree, indent, 0)
        else if (mode === "minify") output = minify(xml)
    }

    const inputSize = new Blob([xml]).size
    const outputSize = new Blob([output]).size
    const lines = xml.split(/\r?\n/).length

    const copyOutput = async () => {
        try {
            const textToCopy = output || xml
            await navigator.clipboard.writeText(textToCopy)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch {}
    }

    const downloadOutput = () => {
        const blob = new Blob([output || xml], { type: "application/xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `formatted-${Date.now()}.xml`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const printOutput = () => {
        const content = output || xml
        const escaped = content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")

        const iframe = document.createElement("iframe")
        iframe.style.position = "fixed"
        iframe.style.right = "0"
        iframe.style.bottom = "0"
        iframe.style.width = "0"
        iframe.style.height = "0"
        iframe.style.border = "none"
        iframe.title = "Print XML"
        document.body.appendChild(iframe)

        const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document
        if (!iframeDoc) return

        iframeDoc.open()
        iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>XML Output</title>
        <style>
          body {
            margin: 40px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            word-break: break-all;
            color: #1e293b;
            background: #fff;
          }
        </style>
      </head>
      <body>${escaped}</body>
    </html>
  `)
        iframeDoc.close()

        const iframeWindow = iframe.contentWindow
        if (iframeWindow) {
            iframeWindow.print()

            if (iframeWindow.onafterprint !== undefined) {
                iframeWindow.onafterprint = () => {
                    document.body.removeChild(iframe)
                }
            } else {
                // Fallback: remove after a delay
                setTimeout(() => {
                    document.body.removeChild(iframe)
                }, 2000)
            }
        }
    }

    const clearAll = () => {
        setXml("")
        setResult(null)
    }

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-6xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b-2 border-slate-300/90 bg-slate-100/50 px-2 py-2 shadow-sm backdrop-blur-sm sm:gap-2 sm:px-5 sm:py-3 dark:border-slate-600/80 dark:bg-slate-800/40 dark:shadow-black/10">
                        {/* Left group */}
                        <div className="flex flex-wrap items-center gap-0.5 sm:gap-2">
                            {(["format", "minify", "tree"] as const).map(
                                (m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={`rounded-lg px-1.5 py-0.5 text-xs font-semibold transition sm:px-3 sm:py-1.5 sm:text-sm ${
                                            mode === m
                                                ? "bg-blue-500 text-white shadow-sm"
                                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        }`}
                                        title={
                                            m.charAt(0).toUpperCase() +
                                            m.slice(1)
                                        }
                                    >
                                        {m === "format"
                                            ? "Format"
                                            : m === "minify"
                                              ? "Minify"
                                              : "Tree"}
                                    </button>
                                )
                            )}
                            <div className="mx-1 h-4 w-px bg-slate-300 sm:mx-2 sm:h-6 dark:bg-slate-700" />
                            {/* Indent control – compact slider */}
                            <div className="flex items-center gap-1">
                                <label className="hidden text-[10px] font-semibold text-slate-500 uppercase sm:inline dark:text-slate-400">
                                    Indent:
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={8}
                                    value={indent}
                                    onChange={(e) =>
                                        setIndent(Number(e.target.value))
                                    }
                                    className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500 dark:bg-slate-800"
                                    title={`Indent: ${indent} spaces`}
                                />
                                <span className="w-5 text-right text-xs font-bold text-slate-700 tabular-nums dark:text-slate-200">
                                    {indent}
                                </span>
                            </div>
                        </div>

                        {/* Right group */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-3">
                            <span className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                                {lines} lines · {(inputSize / 1024).toFixed(1)}{" "}
                                kB
                            </span>
                            <div className="mx-0.5 hidden h-4 w-px bg-slate-300 sm:mx-1 sm:block sm:h-6 dark:bg-slate-700" />
                            <button
                                onClick={copyOutput}
                                disabled={!xml.trim()}
                                className="rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-30 sm:px-4 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Copy"
                            >
                                {isCopied ? "✓" : "⎘"}
                            </button>
                            <button
                                onClick={downloadOutput}
                                disabled={!xml.trim()}
                                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 disabled:opacity-30 sm:px-4 sm:py-1.5 sm:text-base dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                title="Download"
                            >
                                ↓
                            </button>
                            <button
                                onClick={printOutput}
                                disabled={!xml.trim()}
                                className="rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-30 sm:px-4 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Print"
                            >
                                🖨️
                            </button>
                            <button
                                onClick={clearAll}
                                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 sm:px-4 sm:py-1.5 sm:text-base dark:text-rose-400 dark:hover:bg-rose-950/20"
                                title="Clear"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Mobile tabs */}
                    <div className="flex border-b border-slate-200/80 lg:hidden dark:border-slate-800/60">
                        <button
                            onClick={() => setActiveTab("input")}
                            className={`flex-1 py-3 text-center text-xs font-medium ${
                                activeTab === "input"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            📄 Input
                        </button>
                        <button
                            onClick={() => setActiveTab("output")}
                            className={`flex-1 py-3 text-center text-xs font-medium ${
                                activeTab === "output"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            📋 Output
                        </button>
                    </div>

                    {/* Panels – no sidebar, full-width two-column layout */}
                    <div className="p-5 sm:p-6">
                        <div className="grid gap-5 lg:grid-cols-2">
                            {/* Input panel */}
                            <div
                                className={`flex h-[432px] flex-col rounded-xl border border-slate-300 bg-white/50 dark:border-slate-700 dark:bg-slate-900/40 ${
                                    activeTab === "output"
                                        ? "hidden lg:flex"
                                        : ""
                                }`}
                            >
                                <div className="flex-shrink-0 border-b border-slate-200 bg-slate-100/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        XML Input
                                    </span>
                                </div>
                                <textarea
                                    value={xml}
                                    onChange={handleInput}
                                    placeholder="Paste XML here..."
                                    spellCheck={false}
                                    className="custom-scrollbar min-h-0 w-full flex-1 resize-none rounded-b-xl bg-white/80 px-5 py-4 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-100"
                                />
                                {result?.error && (
                                    <div className="mx-5 mt-2 mb-4 rounded-lg border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-xs text-rose-700 backdrop-blur-sm dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
                                        {result.error}
                                    </div>
                                )}
                            </div>

                            {/* Output panel */}
                            <div
                                className={`flex h-[432px] flex-col rounded-xl border border-slate-300 bg-white/50 dark:border-slate-700 dark:bg-slate-900/40 ${
                                    activeTab === "input"
                                        ? "hidden lg:flex"
                                        : ""
                                } min-w-0`}
                            >
                                <div className="flex-shrink-0 border-b border-slate-200 bg-slate-100/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {mode === "tree"
                                            ? "Tree View"
                                            : "Output"}
                                    </span>
                                </div>

                                {mode === "tree" ? (
                                    <div className="custom-scrollbar min-h-0 min-w-0 flex-1 overflow-auto px-5 py-4">
                                        <div className="inline-block min-w-full">
                                            {result?.tree ? (
                                                <TreeItem
                                                    node={result.tree}
                                                    depth={0}
                                                />
                                            ) : (
                                                <div className="text-sm whitespace-nowrap text-slate-400">
                                                    Enter valid XML to see tree
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <textarea
                                        readOnly
                                        value={output}
                                        placeholder="Output..."
                                        className="custom-scrollbar min-h-0 w-full flex-1 resize-none rounded-b-xl bg-slate-50/80 px-5 py-4 font-mono text-sm text-slate-800 focus:outline-none dark:bg-slate-900/60 dark:text-slate-100"
                                    />
                                )}

                                {outputSize > 0 && mode !== "tree" && (
                                    <div className="mt-auto px-5 pt-2 pb-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <Stat
                                                label="Output Size"
                                                value={`${(outputSize / 1024).toFixed(1)} kB`}
                                                accent="emerald"
                                            />
                                            <Stat
                                                label="Compression"
                                                value={
                                                    inputSize
                                                        ? `${((1 - outputSize / inputSize) * 100).toFixed(1)}%`
                                                        : "—"
                                                }
                                                accent="blue"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom scrollbar styles */}
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
