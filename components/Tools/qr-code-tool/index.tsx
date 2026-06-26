"use client"

import React, { useState, useRef, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import jsQR from "jsqr"

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H"
type QRSize = "small" | "medium" | "large" | "xlarge"

const sizeMap: Record<QRSize, number> = {
    small: 160,
    medium: 200,
    large: 250,
    xlarge: 300,
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function QRCodeTool() {
    const [inputText, setInputText] = useState("")
    const [qrSize, setQrSize] = useState<QRSize>("medium")
    const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M")
    const [includeMargin, setIncludeMargin] = useState(true)

    const [decodeFile, setDecodeFile] = useState<File | null>(null)
    const [decodePreviewUrl, setDecodePreviewUrl] = useState<string | null>(
        null
    )
    const [isDecoding, setIsDecoding] = useState(false)
    const [decodedText, setDecodedText] = useState<string | null>(null)
    const [decodeError, setDecodeError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const [activeTab, setActiveTab] = useState<"generate" | "decode">(
        "generate"
    )

    const svgWrapperRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const decodeFileInputRef = useRef<HTMLInputElement>(null)

    const handleDownload = useCallback(() => {
        if (!inputText || !svgWrapperRef.current) return
        const svg = svgWrapperRef.current.querySelector("svg")
        if (!svg) return
        const svgData = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `qr-code-${Date.now()}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [inputText])

    const clearInputText = () => setInputText("")

    const processDecodeFile = useCallback(
        (file: File) => {
            const allowed = [
                "image/png",
                "image/jpeg",
                "image/webp",
                "image/bmp",
                "image/gif",
            ]
            if (!allowed.includes(file.type)) {
                setDecodeError(
                    "Unsupported format. Please use PNG, JPG, WebP, BMP, or GIF."
                )
                return
            }
            if (file.size > 20 * 1024 * 1024) {
                setDecodeError("File size exceeds 20 MB.")
                return
            }
            if (decodePreviewUrl) URL.revokeObjectURL(decodePreviewUrl)
            setDecodeError(null)
            setDecodeFile(file)
            setDecodePreviewUrl(URL.createObjectURL(file))
            setDecodedText(null)
        },
        [decodePreviewUrl]
    )

    const handleDecodeReset = useCallback(() => {
        if (decodePreviewUrl) URL.revokeObjectURL(decodePreviewUrl)
        setDecodeFile(null)
        setDecodePreviewUrl(null)
        setDecodedText(null)
        setDecodeError(null)
        setIsDecoding(false)
        if (decodeFileInputRef.current) decodeFileInputRef.current.value = ""
    }, [decodePreviewUrl])

    const performDecode = useCallback(() => {
        if (!decodeFile || isDecoding) return
        setIsDecoding(true)
        setDecodeError(null)
        setDecodedText(null)

        const reader = new FileReader()
        reader.onload = (event) => {
            const result = event.target?.result
            if (typeof result !== "string") {
                setIsDecoding(false)
                return
            }
            const img = new Image()
            img.onload = () => {
                const canvas = canvasRef.current
                if (!canvas) {
                    setIsDecoding(false)
                    return
                }
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext("2d")
                if (!ctx) {
                    setIsDecoding(false)
                    return
                }
                ctx.drawImage(img, 0, 0)
                const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                )
                const code = jsQR(imageData.data, canvas.width, canvas.height)
                if (code) {
                    setDecodedText(code.data)
                } else {
                    setDecodeError("No QR code found in the image.")
                }
                setIsDecoding(false)
            }
            img.onerror = () => {
                setDecodeError("Failed to load image.")
                setIsDecoding(false)
            }
            img.src = result
        }
        reader.readAsDataURL(decodeFile)
    }, [decodeFile, isDecoding])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        if (e.dataTransfer.files?.[0])
            processDecodeFile(e.dataTransfer.files[0])
    }

    const hasText = inputText.length > 0
    const hasDecodeFile = !!decodeFile
    const hasDecodedText = !!decodedText

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-5xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    {/* Mobile toggle */}
                    <div className="flex justify-center p-2 lg:hidden">
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                            <button
                                onClick={() => setActiveTab("generate")}
                                className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                                    activeTab === "generate"
                                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                }`}
                            >
                                ✨ Generate
                            </button>
                            <button
                                onClick={() => setActiveTab("decode")}
                                className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                                    activeTab === "decode"
                                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                }`}
                            >
                                📷 Decode
                            </button>
                        </div>
                    </div>

                    {/* Two‑column layout */}
                    <div className="grid gap-4 px-3 py-3 sm:gap-5 sm:px-4 sm:py-4 lg:grid-cols-[1fr_1.05fr]">
                        {/* ========== LEFT PANEL : QR GENERATOR ========== */}
                        <div
                            className={`${activeTab === "decode" ? "hidden lg:block" : ""}`}
                        >
                            <div className="rounded-xl border border-slate-200/80 bg-white/50 p-3 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                {/* Input + clear button – bigger clear X */}
                                <div className="relative">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) =>
                                            setInputText(e.target.value)
                                        }
                                        placeholder="Enter text or URL…"
                                        rows={2}
                                        className="w-full resize-none rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 pr-9 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                                    />
                                    {inputText && (
                                        <button
                                            onClick={clearInputText}
                                            className="absolute top-1.5 right-1.5 rounded-md p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                                            title="Clear text"
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Settings groups with subtle borders */}
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    {/* Size group */}
                                    <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                                        <label className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                            Size
                                        </label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {(
                                                [
                                                    "small",
                                                    "medium",
                                                    "large",
                                                    "xlarge",
                                                ] as QRSize[]
                                            ).map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() =>
                                                        setQrSize(size)
                                                    }
                                                    className={`rounded-md border px-1 py-1 text-xs font-semibold transition ${
                                                        qrSize === size
                                                            ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                            : "border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                                    }`}
                                                >
                                                    {size === "small"
                                                        ? "S"
                                                        : size === "medium"
                                                          ? "M"
                                                          : size === "large"
                                                            ? "L"
                                                            : "XL"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Error Correction group – renamed label */}
                                    <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                                        <label className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                            Error Correction
                                        </label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {(
                                                [
                                                    "L",
                                                    "M",
                                                    "Q",
                                                    "H",
                                                ] as ErrorCorrectionLevel[]
                                            ).map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() =>
                                                        setErrorLevel(level)
                                                    }
                                                    className={`rounded-md border px-1 py-1 text-xs font-semibold transition ${
                                                        errorLevel === level
                                                            ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                            : "border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Margin checkbox spanning two columns */}
                                    <div className="col-span-2">
                                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={includeMargin}
                                                onChange={(e) =>
                                                    setIncludeMargin(
                                                        e.target.checked
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 dark:border-slate-700"
                                            />
                                            Include quiet zone
                                        </label>
                                    </div>
                                </div>

                                {/* Preview / placeholder */}
                                {hasText ? (
                                    <div className="mt-4 flex flex-col items-center">
                                        <div
                                            ref={svgWrapperRef}
                                            className="mb-3 flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                        >
                                            <QRCodeSVG
                                                value={inputText}
                                                size={sizeMap[qrSize]}
                                                level={errorLevel}
                                                fgColor="#000000"
                                                bgColor="#ffffff"
                                                includeMargin={includeMargin}
                                            />
                                        </div>
                                        <button
                                            onClick={handleDownload}
                                            className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm transition hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98]"
                                        >
                                            ↓ Download SVG
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/40 p-3 text-center backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/30">
                                        <svg
                                            className="mb-1.5 h-6 w-6 text-slate-400 dark:text-slate-500"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75z"
                                            />
                                        </svg>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            QR will appear here
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ========== RIGHT PANEL : QR DECODER ========== */}
                        <div
                            className={`${activeTab === "generate" ? "hidden lg:block" : ""}`}
                        >
                            <div className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-white/50 p-3 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                {/* Dropzone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={
                                        !hasDecodeFile
                                            ? () =>
                                                  decodeFileInputRef.current?.click()
                                            : undefined
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (
                                            !hasDecodeFile &&
                                            (e.key === "Enter" || e.key === " ")
                                        )
                                            decodeFileInputRef.current?.click()
                                    }}
                                    className={`group relative rounded-lg border-2 border-dashed bg-white/50 transition-all duration-200 outline-none dark:bg-slate-900/50 ${
                                        isDragOver
                                            ? "border-blue-400 bg-blue-50/30 shadow-[0_0_0_1px_rgba(59,130,246,0.2)] dark:border-blue-500/70 dark:bg-blue-500/5"
                                            : "border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600"
                                    } ${!hasDecodeFile ? "cursor-pointer" : "cursor-default"} `}
                                >
                                    <input
                                        ref={decodeFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0])
                                                processDecodeFile(
                                                    e.target.files[0]
                                                )
                                        }}
                                    />

                                    {!hasDecodeFile ? (
                                        <div className="flex min-h-[90px] flex-col items-center justify-center p-3 text-center">
                                            <div className="mb-2 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-1.5 shadow-inner dark:from-slate-800/60 dark:to-slate-900/60">
                                                <svg
                                                    className="h-5 w-5 text-slate-500 dark:text-slate-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-white">
                                                Drop QR image here
                                            </p>
                                            <div className="mt-1 flex flex-wrap justify-center gap-1">
                                                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                    PNG
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                    JPG
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                    WEBP
                                                </span>
                                            </div>
                                            <p className="mt-1 text-[9px] font-medium text-slate-400 uppercase dark:text-slate-500">
                                                Max 20 MB
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-2">
                                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                                {decodePreviewUrl && (
                                                    <img
                                                        src={decodePreviewUrl}
                                                        alt="preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-1">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-white">
                                                            {decodeFile.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                            {formatSize(
                                                                decodeFile.size
                                                            )}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDecodeReset()
                                                        }}
                                                        className="rounded-md p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                                                        title="Remove file"
                                                    >
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Error / loading */}
                                {decodeError && (
                                    <div className="mt-2 rounded-lg border border-rose-200/80 bg-rose-50/80 px-2 py-1.5 text-xs text-rose-700 backdrop-blur-sm dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
                                        {decodeError}
                                    </div>
                                )}
                                {isDecoding && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                        <svg
                                            className="h-3.5 w-3.5 animate-spin"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Decoding…
                                    </div>
                                )}

                                {/* Result area */}
                                <div className="mt-3 flex min-h-[60px] flex-1 flex-col">
                                    {hasDecodedText ? (
                                        <>
                                            <div className="flex-1 overflow-auto rounded-lg border border-slate-200/80 bg-white/60 px-2 py-1.5 dark:border-slate-800/60 dark:bg-slate-900/60">
                                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                                    Decoded
                                                </p>
                                                <p className="mt-0.5 font-mono text-sm break-all text-slate-800 dark:text-slate-200">
                                                    {decodedText}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        decodedText!
                                                    )
                                                    alert("Copied to clipboard")
                                                }}
                                                className="mt-2 w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                                            >
                                                ⎘ Copy
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/40 p-2 text-center backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/30">
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                Decoded text appears here
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Decode button */}
                                {hasDecodeFile &&
                                    !hasDecodedText &&
                                    !isDecoding && (
                                        <div className="mt-2 pt-1">
                                            <button
                                                onClick={performDecode}
                                                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow active:scale-[0.98]"
                                            >
                                                Decode QR
                                            </button>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    )
}
