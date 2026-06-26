"use client"

import React, { ChangeEvent, useMemo, useState, useEffect, useRef } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"

marked.setOptions({
    breaks: true,
    gfm: true,
})

const MarkdownPreviewer: React.FC = () => {
    const [markdown, setMarkdown] =
        useState<string>(`# Welcome to the Markdown Previewer

## Get started with these examples:

### Text Formatting
You can make text **bold**, *italic*, or **_both_**. 
Create ~~strikethrough~~ and \`inline code\` too.

### Lists
**Unordered list:**
- First item
- Second item
  - Nested item
  - Another nested item

**Ordered list:**
1. Step one
2. Step two
3. Step three

### Links & Images
[Visit GitHub](https://github.com)
![Placeholder Image](https://via.placeholder.com/150x100?text=Markdown)

### Code Blocks
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("Developer"));
\`\`\`

### Blockquotes
> This is a blockquote.
> It can span multiple lines.

### Tables
| Feature | Status |
|---------|--------|
| Bold    | ✅     |
| Italic  | ✅     |
| Lists   | ✅     |
| Tables  | ✅     |

### Horizontal Rule
---

**Start typing or editing the markdown!** 🚀`)

    const [wordCount, setWordCount] = useState<number>(0)
    const [charCount, setCharCount] = useState<number>(0)
    const [showSidebar, setShowSidebar] = useState<boolean>(true)
    const [isCopied, setIsCopied] = useState<boolean>(false)
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const previewRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const text = markdown
        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        const chars = text.length
        setWordCount(words)
        setCharCount(chars)
    }, [markdown])

    const copyMarkdown = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(markdown)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const clearContent = (): void => {
        if (confirm("Are you sure you want to clear all content?")) {
            setMarkdown("")
        }
    }

    const insertTemplate = (template: string): void => {
        const templates: Record<string, string> = {
            heading: "\n## New Heading\n",
            bold: " **bold text** ",
            italic: " *italic text* ",
            link: " [link text](https://example.com) ",
            image: " ![alt text](https://via.placeholder.com/150) ",
            code: "\n```javascript\n// Your code here\n```\n",
            list: "\n- Item 1\n- Item 2\n- Item 3\n",
            table: "\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n",
            quote: "\n> Quote text here\n",
        }
        const insertion = templates[template] || ""
        setMarkdown((prev) => prev + insertion)
        textareaRef.current?.focus()
    }

    const downloadMarkdown = (): void => {
        const blob = new Blob([markdown], { type: "text/markdown" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `markdown-${Date.now()}.md`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const printPreview = (): void => {
        const printWindow = window.open("", "_blank")
        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Markdown Preview</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 24px;
              margin-bottom: 16px;
              font-weight: 600;
              line-height: 1.25;
            }
            h1 { font-size: 2em; border-bottom: 1px solid #eaecef; }
            h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; }
            code {
              padding: 0.2em 0.4em;
              background: #f6f8fa;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
            pre {
              padding: 16px;
              background: #f6f8fa;
              border-radius: 6px;
              overflow-x: auto;
            }
            blockquote {
              padding: 0 1em;
              color: #6a737d;
              border-left: 0.25em solid #dfe2e5;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #dfe2e5;
              padding: 8px 12px;
            }
            th {
              background: #f6f8fa;
            }
          </style>
        </head>
        <body>
          ${parsedMarkdown}
        </body>
        </html>
      `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.ctrlKey && e.key === "b") {
                e.preventDefault()
                insertTemplate("bold")
            }
            if (e.ctrlKey && e.key === "i") {
                e.preventDefault()
                insertTemplate("italic")
            }
            if (e.ctrlKey && e.key === "k") {
                e.preventDefault()
                insertTemplate("link")
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        setMarkdown(e.target.value)
    }

    const parsedMarkdown = useMemo(() => {
        try {
            const rawHtml = marked.parse(markdown) as string
            return DOMPurify.sanitize(rawHtml, {
                ADD_TAGS: ["iframe"],
                ADD_ATTR: [
                    "allow",
                    "allowfullscreen",
                    "frameborder",
                    "scrolling",
                ],
            })
        } catch (error) {
            console.error("Markdown parsing error:", error)
            return "<p>Error parsing markdown</p>"
        }
    }, [markdown])

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

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900 sm:px-6 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-[1400px]">
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    {/* Toolbar – right group gap reduced on mobile */}
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b-2 border-slate-300/90 bg-slate-100/50 px-2 py-2 shadow-sm backdrop-blur-sm sm:gap-2 sm:px-5 sm:py-3 dark:border-slate-600/80 dark:bg-slate-800/40 dark:shadow-black/10">
                        {/* Left group: compact formatting buttons */}
                        <div className="flex flex-wrap items-center gap-0.5 sm:gap-2">
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="rounded-lg p-1 text-sm text-slate-600 transition hover:bg-slate-100 sm:p-2 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Toggle Sidebar"
                            >
                                {showSidebar ? "✕" : "☰"}
                            </button>
                            <div className="mx-0.5 h-4 w-px bg-slate-300 sm:mx-1 sm:h-6 dark:bg-slate-700" />
                            <button
                                onClick={() => insertTemplate("heading")}
                                className="rounded-lg px-1.5 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-sm dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Heading (Ctrl+H)"
                            >
                                H1
                            </button>
                            <button
                                onClick={() => insertTemplate("bold")}
                                className="rounded-lg px-1.5 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-sm dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Bold (Ctrl+B)"
                            >
                                B
                            </button>
                            <button
                                onClick={() => insertTemplate("italic")}
                                className="rounded-lg px-1.5 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-sm dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Italic (Ctrl+I)"
                            >
                                I
                            </button>
                            <button
                                onClick={() => insertTemplate("link")}
                                className="rounded-lg px-1.5 py-0.5 text-sm text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Link (Ctrl+K)"
                            >
                                🔗
                            </button>
                            <button
                                onClick={() => insertTemplate("image")}
                                className="rounded-lg px-1.5 py-0.5 text-sm text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Image"
                            >
                                🖼️
                            </button>
                            <button
                                onClick={() => insertTemplate("code")}
                                className="rounded-lg px-1.5 py-0.5 font-mono text-sm text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Code block"
                            >
                                &lt;/&gt;
                            </button>
                            <button
                                onClick={() => insertTemplate("list")}
                                className="rounded-lg px-1.5 py-0.5 text-sm text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="List"
                            >
                                📋
                            </button>
                            <button
                                onClick={() => insertTemplate("table")}
                                className="rounded-lg px-1.5 py-0.5 text-sm text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Table"
                            >
                                📊
                            </button>
                            <button
                                onClick={() => insertTemplate("quote")}
                                className="rounded-lg px-1.5 py-0.5 text-sm text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Quote"
                            >
                                💬
                            </button>
                        </div>

                        {/* Right group: gap reduced from gap-2 to gap-1 on mobile */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-3">
                            <span
                                className="text-xs text-slate-500 sm:text-sm dark:text-slate-400"
                                title="Word Count"
                            >
                                📊 {wordCount} words
                            </span>
                            <span
                                className="text-xs text-slate-500 sm:text-sm dark:text-slate-400"
                                title="Character Count"
                            >
                                🔤 {charCount} chars
                            </span>
                            <div className="mx-0.5 h-4 w-px bg-slate-300 sm:mx-1 sm:h-6 dark:bg-slate-700" />
                            <button
                                onClick={copyMarkdown}
                                className="rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 sm:px-4 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Copy"
                            >
                                {isCopied ? "✓" : "⎘"}
                            </button>
                            <button
                                onClick={downloadMarkdown}
                                className="rounded-lg px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-100 sm:px-4 sm:py-1.5 sm:text-base dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                title="Download"
                            >
                                ↓
                            </button>
                            <button
                                onClick={printPreview}
                                className="rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 sm:px-4 sm:py-1.5 sm:text-base dark:text-slate-300 dark:hover:bg-slate-800"
                                title="Print"
                            >
                                🖨️
                            </button>
                            <button
                                onClick={clearContent}
                                className="rounded-lg px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 sm:px-4 sm:py-1.5 sm:text-base dark:text-rose-400 dark:hover:bg-rose-950/20"
                                title="Clear"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Mobile tabs */}
                    <div className="flex border-b border-slate-200/80 lg:hidden dark:border-slate-800/60">
                        <button
                            onClick={() => setActiveTab("write")}
                            className={`flex-1 py-3 text-center text-sm font-medium transition ${
                                activeTab === "write"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            ✏️ Write
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`flex-1 py-3 text-center text-sm font-medium transition ${
                                activeTab === "preview"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            👁️ Preview
                        </button>
                    </div>

                    {/* Main content – unchanged */}
                    <div className="flex lg:gap-4">
                        {showSidebar && (
                            <div className="hidden w-[272px] flex-shrink-0 lg:block">
                                <div className="flex h-[432px] flex-col rounded-xl border border-slate-300 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/50">
                                    <div className="custom-scrollbar flex-1 overflow-auto p-5">
                                        {/* Quick Guide and Shortcuts content */}
                                        <div className="mb-6">
                                            <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                📚 Quick Guide
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        # Heading 1
                                                    </code>
                                                    <span className="text-slate-400">
                                                        #
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        ## Heading 2
                                                    </code>
                                                    <span className="text-slate-400">
                                                        ##
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        **bold**
                                                    </code>
                                                    <span className="text-slate-400">
                                                        **
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        *italic*
                                                    </code>
                                                    <span className="text-slate-400">
                                                        *
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        [link](url)
                                                    </code>
                                                    <span className="text-slate-400">
                                                        []()
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        ![alt](url)
                                                    </code>
                                                    <span className="text-slate-400">
                                                        ![]()
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        `inline code`
                                                    </code>
                                                    <span className="text-slate-400">
                                                        `
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        ```code block```
                                                    </code>
                                                    <span className="text-slate-400">
                                                        ```
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        - list item
                                                    </code>
                                                    <span className="text-slate-400">
                                                        -
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        1. numbered list
                                                    </code>
                                                    <span className="text-slate-400">
                                                        1.
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        &gt; quote
                                                    </code>
                                                    <span className="text-slate-400">
                                                        &gt;
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                        ---
                                                    </code>
                                                    <span className="text-slate-400">
                                                        ---
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                ⚡ Shortcuts
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded border border-slate-200 bg-white px-2 py-1 font-mono dark:border-slate-700 dark:bg-slate-800">
                                                        Ctrl+B
                                                    </span>
                                                    <span className="text-slate-500">
                                                        Bold
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded border border-slate-200 bg-white px-2 py-1 font-mono dark:border-slate-700 dark:bg-slate-800">
                                                        Ctrl+I
                                                    </span>
                                                    <span className="text-slate-500">
                                                        Italic
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded border border-slate-200 bg-white px-2 py-1 font-mono dark:border-slate-700 dark:bg-slate-800">
                                                        Ctrl+K
                                                    </span>
                                                    <span className="text-slate-500">
                                                        Link
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 lg:flex lg:gap-4">
                            {/* Editor panel */}
                            <div
                                className={`${
                                    activeTab === "preview"
                                        ? "hidden lg:block"
                                        : ""
                                } w-full lg:w-1/2`}
                            >
                                <div className="flex h-[432px] flex-col rounded-xl border border-slate-300 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50">
                                    <div className="flex-shrink-0 border-b border-slate-200 bg-slate-100/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                ✏️ Markdown Editor
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                Type your markdown here...
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white/50 dark:bg-slate-900/40">
                                        <textarea
                                            ref={textareaRef}
                                            value={markdown}
                                            onChange={handleChange}
                                            className="custom-scrollbar h-full w-full resize-none rounded-b-xl bg-transparent p-5 font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
                                            placeholder="Type Markdown here..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview panel */}
                            <div
                                className={`${
                                    activeTab === "write"
                                        ? "hidden lg:block"
                                        : ""
                                } mt-5 w-full lg:mt-0 lg:w-1/2`}
                            >
                                <div className="flex h-[432px] flex-col rounded-xl border border-slate-300 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50">
                                    <div className="flex-shrink-0 border-b border-slate-200 bg-slate-100/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                👁️ Live Preview
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                Rendered HTML output
                                            </span>
                                        </div>
                                    </div>
                                    <div className="custom-scrollbar flex-1 overflow-auto bg-white/50 dark:bg-slate-900/40">
                                        <div className="p-5">
                                            <style>{previewStyles}</style>
                                            <style>{scrollbarStyles}</style>
                                            <div
                                                ref={previewRef}
                                                className="markdown-body"
                                                dangerouslySetInnerHTML={{
                                                    __html: parsedMarkdown,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MarkdownPreviewer
