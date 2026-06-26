"use client"

import React, { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type FormatType =
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "heading1"
    | "heading2"
    | "heading3"
    | "listBullet"
    | "listNumbered"
    | "code"
    | "link"
    | "quote"

const WordCounterEditor: React.FC = () => {
    const [text, setText] =
        useState<string>(`# Welcome to the Word Counter & Editor

## Markdown is also supported`)

    const [previewMode, setPreviewMode] = useState<
        "edit" | "preview" | "split"
    >("split")
    const [stats, setStats] = useState({
        words: 0,
        charsWithSpaces: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
    })
    const [isCopied, setIsCopied] = useState(false)
    const [history, setHistory] = useState<string[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // History
    useEffect(() => {
        if (text !== history[historyIndex]) {
            const newHistory = history.slice(0, historyIndex + 1)
            newHistory.push(text)
            setHistory(newHistory)
            setHistoryIndex(newHistory.length - 1)
        }
    }, [text])

    // Statistics
    useEffect(() => {
        if (!text.trim()) {
            setStats({
                words: 0,
                charsWithSpaces: 0,
                charsNoSpaces: 0,
                sentences: 0,
                paragraphs: 0,
                readingTime: 0,
            })
            return
        }
        const words = text.trim().split(/\s+/).filter(Boolean).length
        const charsWithSpaces = text.length
        const charsNoSpaces = text.replace(/\s/g, "").length
        const sentences = text.split(/[.!?]+/).filter(Boolean).length
        const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length
        const readingTime = Math.ceil(words / 200)
        setStats({
            words,
            charsWithSpaces,
            charsNoSpaces,
            sentences,
            paragraphs,
            readingTime,
        })
    }, [text])

    const insertAtCursor = (before: string, after: string = "") => {
        const textarea = textareaRef.current
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = text.substring(start, end)
        const newText =
            text.substring(0, start) +
            before +
            selectedText +
            after +
            text.substring(end)
        setText(newText)
        setTimeout(() => {
            textarea.focus()
            const newCursorPos = start + before.length + selectedText.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
    }

    const wrapSelection = (open: string, close: string) =>
        insertAtCursor(open, close)

    const insertFormat = (type: FormatType) => {
        switch (type) {
            case "bold":
                wrapSelection("**", "**")
                break
            case "italic":
                wrapSelection("*", "*")
                break
            case "underline":
                wrapSelection("<u>", "</u>")
                break
            case "strikethrough":
                wrapSelection("~~", "~~")
                break
            case "heading1":
                wrapSelection("# ", "")
                break
            case "heading2":
                wrapSelection("## ", "")
                break
            case "heading3":
                wrapSelection("### ", "")
                break
            case "listBullet":
                wrapSelection("- ", "")
                break
            case "listNumbered":
                wrapSelection("1. ", "")
                break
            case "code":
                wrapSelection("`", "`")
                break
            case "link":
                wrapSelection("[", "](url)")
                break
            case "quote":
                wrapSelection("> ", "")
                break
        }
    }

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1)
            setText(history[historyIndex - 1])
        }
    }
    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1)
            setText(history[historyIndex + 1])
        }
    }

    const copyText = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error(err)
        }
    }
    const clearText = () => {
        if (confirm("Clear all text?")) setText("")
    }
    const downloadText = () => {
        const blob = new Blob([text], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `document-${Date.now()}.md`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Custom markdown preview styles (identical to MarkdownPreviewer)
    const previewStyles = `
    .markdown-body {
      font-size: 0.9rem;
      line-height: 1.6;
      color: #1e293b;
    }
    .dark .markdown-body {
      color: #e2e8f0;
    }
    .markdown-body h1 { font-size: 1.6rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    .markdown-body h2 { font-size: 1.3rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; }
    .markdown-body h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
    .markdown-body p { margin-bottom: 0.75rem; }
    .markdown-body a { color: #3b82f6; text-decoration: underline; }
    .markdown-body code { background: #f1f5f9; padding: 0.2rem 0.3rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; }
    .dark .markdown-body code { background: #1e293b; }
    .markdown-body pre { background: #f8fafc; padding: 0.75rem; border-radius: 8px; overflow-x: auto; margin-bottom: 0.75rem; border: 1px solid #e2e8f0; }
    .dark .markdown-body pre { background: #0f172a; border-color: #334155; }
    .markdown-body pre code { background: transparent; padding: 0; }
    .markdown-body blockquote { border-left: 4px solid #94a3b8; padding-left: 1rem; color: #475569; margin-bottom: 0.75rem; }
    .dark .markdown-body blockquote { border-left-color: #64748b; color: #94a3b8; }
    .markdown-body ul {
      list-style: disc;
      padding-left: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .markdown-body ol {
      list-style: decimal;
      padding-left: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .markdown-body li {
      margin-bottom: 0.25rem;
    }
    .markdown-body ul ul {
      list-style: circle;
      margin-bottom: 0;
    }
    .markdown-body ul ul ul {
      list-style: square;
    }
    .markdown-body ol ol {
      list-style: lower-alpha;
      margin-bottom: 0;
    }
    .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 0.75rem; }
    .markdown-body th, .markdown-body td { border: 1px solid #cbd5e1; padding: 0.4rem 0.6rem; text-align: left; }
    .dark .markdown-body th, .dark .markdown-body td { border-color: #334155; }
    .markdown-body th { background: #f8fafc; font-weight: 600; }
    .dark .markdown-body th { background: #1e293b; }
    .markdown-body hr { margin: 1rem 0; }
  `

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
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-7xl">
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    <div className="space-y-5 p-5 sm:p-6">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-300/90 bg-slate-100/50 px-3 py-2 shadow-sm backdrop-blur-sm sm:px-5 sm:py-3 dark:border-slate-600/80 dark:bg-slate-800/40 dark:shadow-black/10">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => insertFormat("bold")}
                                    className="rounded-lg px-2.5 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Bold"
                                >
                                    B
                                </button>
                                <button
                                    onClick={() => insertFormat("italic")}
                                    className="rounded-lg px-2.5 py-1 text-sm text-slate-700 italic hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Italic"
                                >
                                    I
                                </button>
                                <button
                                    onClick={() => insertFormat("underline")}
                                    className="rounded-lg px-2.5 py-1 text-sm text-slate-700 underline hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Underline"
                                >
                                    U
                                </button>
                                <button
                                    onClick={() =>
                                        insertFormat("strikethrough")
                                    }
                                    className="rounded-lg px-2.5 py-1 text-sm text-slate-700 line-through hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Strikethrough"
                                >
                                    S
                                </button>
                                <div className="mx-0.5 h-5 w-px bg-slate-300 dark:bg-slate-700" />
                                <button
                                    onClick={() => insertFormat("heading1")}
                                    className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Heading 1"
                                >
                                    H1
                                </button>
                                <button
                                    onClick={() => insertFormat("heading2")}
                                    className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Heading 2"
                                >
                                    H2
                                </button>
                                <button
                                    onClick={() => insertFormat("heading3")}
                                    className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Heading 3"
                                >
                                    H3
                                </button>
                                <div className="mx-0.5 h-5 w-px bg-slate-300 dark:bg-slate-700" />
                                <button
                                    onClick={() => insertFormat("listBullet")}
                                    className="rounded-lg px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Bullet list"
                                >
                                    •
                                </button>
                                <button
                                    onClick={() => insertFormat("listNumbered")}
                                    className="rounded-lg px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Numbered list"
                                >
                                    1.
                                </button>
                                <button
                                    onClick={() => insertFormat("code")}
                                    className="rounded-lg px-2.5 py-1 font-mono text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Inline code"
                                >
                                    &lt;/&gt;
                                </button>
                                <button
                                    onClick={() => insertFormat("link")}
                                    className="rounded-lg px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Link"
                                >
                                    🔗
                                </button>
                                <button
                                    onClick={() => insertFormat("quote")}
                                    className="rounded-lg px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Quote"
                                >
                                    “
                                </button>
                                <div className="mx-0.5 h-5 w-px bg-slate-300 dark:bg-slate-700" />
                                <button
                                    onClick={undo}
                                    className="rounded-lg px-3 py-1 font-mono text-base text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Undo"
                                >
                                    ↶
                                </button>
                                <button
                                    onClick={redo}
                                    className="rounded-lg px-3 py-1 font-mono text-base text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Redo"
                                >
                                    ↷
                                </button>
                                <button
                                    onClick={copyText}
                                    className="rounded-lg px-3 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Copy"
                                >
                                    {isCopied ? "✓" : "⎘"}
                                </button>
                                <button
                                    onClick={downloadText}
                                    className="rounded-lg px-3 py-1 text-base text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                    title="Download"
                                >
                                    ↓
                                </button>
                                <button
                                    onClick={clearText}
                                    className="rounded-lg px-3 py-1 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
                                    title="Clear"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {stats.words} words
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {stats.charsWithSpaces} chars
                                </span>
                            </div>
                        </div>

                        {/* Mobile view mode tabs */}
                        <div className="flex border-b border-slate-200/80 lg:hidden dark:border-slate-800/60">
                            <button
                                onClick={() => setPreviewMode("edit")}
                                className={`flex-1 py-2 text-center text-sm font-medium transition ${
                                    previewMode === "edit"
                                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                        : "text-slate-500 dark:text-slate-400"
                                }`}
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={() => setPreviewMode("preview")}
                                className={`flex-1 py-2 text-center text-sm font-medium transition ${
                                    previewMode === "preview"
                                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                        : "text-slate-500 dark:text-slate-400"
                                }`}
                            >
                                👁️ Preview
                            </button>
                            <button
                                onClick={() => setPreviewMode("split")}
                                className={`flex-1 py-2 text-center text-sm font-medium transition ${
                                    previewMode === "split"
                                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                        : "text-slate-500 dark:text-slate-400"
                                }`}
                            >
                                📄 Split
                            </button>
                        </div>

                        {/* Main area – editor & preview */}
                        <div className="flex flex-col lg:flex-row lg:gap-5">
                            {/* Editor panel */}
                            {(previewMode === "edit" ||
                                previewMode === "split") && (
                                <div
                                    className={`w-full ${
                                        previewMode === "split"
                                            ? "lg:w-1/2"
                                            : ""
                                    }`}
                                >
                                    <div className="rounded-xl border border-slate-300 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50">
                                        <div className="border-b border-slate-200 bg-slate-100/80 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                ✏️ Editor
                                            </span>
                                        </div>
                                        <textarea
                                            ref={textareaRef}
                                            value={text}
                                            onChange={(e) =>
                                                setText(e.target.value)
                                            }
                                            className="custom-scrollbar h-[360px] w-full resize-none rounded-b-xl bg-transparent p-5 font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
                                            placeholder="Write your content here... (Markdown supported)"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Live Preview panel – with markdown-body styles */}
                            {(previewMode === "preview" ||
                                previewMode === "split") && (
                                <div
                                    className={`w-full ${
                                        previewMode === "split"
                                            ? "lg:w-1/2"
                                            : ""
                                    } ${previewMode === "split" ? "mt-5 lg:mt-0" : ""}`}
                                >
                                    <div className="rounded-xl border border-slate-300 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50">
                                        <div className="border-b border-slate-200 bg-slate-100/80 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                👁️ Live Preview
                                            </span>
                                        </div>
                                        <div className="custom-scrollbar h-[360px] overflow-auto p-5">
                                            <style>{previewStyles}</style>
                                            <style>{scrollbarStyles}</style>
                                            <div className="markdown-body">
                                                {text ? (
                                                    <ReactMarkdown
                                                        remarkPlugins={[
                                                            remarkGfm,
                                                        ]}
                                                    >
                                                        {text}
                                                    </ReactMarkdown>
                                                ) : (
                                                    <p className="text-slate-400 italic">
                                                        Nothing to preview yet
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Statistics cards */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                            <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                    Words
                                </div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {stats.words}
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                    Characters
                                </div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {stats.charsWithSpaces}
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                    No spaces
                                </div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {stats.charsNoSpaces}
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                    Sentences
                                </div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {stats.sentences}
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                    Paragraphs
                                </div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {stats.paragraphs}
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                                    Reading time
                                </div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {stats.readingTime} min
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WordCounterEditor
