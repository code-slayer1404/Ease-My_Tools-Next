"use client"

import React, { useState, useRef, useCallback } from "react"

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function SvgConverter() {
    const [file, setFile] = useState<File | null>(null)
    const [originalSvg, setOriginalSvg] = useState("")
    const [convertedImage, setConvertedImage] = useState("")
    const [converting, setConverting] = useState(false)
    const [conversionSettings, setConversionSettings] = useState({
        format: "png",
        width: 800,
        height: 600,
        quality: 90,
        backgroundColor: "transparent",
        maintainAspectRatio: true,
        customBackground: "#ffffff",
    })

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const originalDimensions = useRef({ width: 0, height: 0 })

    const handleFileUpload = useCallback(
        (uploadedFile: File | null | undefined) => {
            if (!uploadedFile) return

            if (uploadedFile.size > 5 * 1024 * 1024) {
                alert("File is too large. Maximum size is 5MB")
                return
            }

            if (!uploadedFile.type.includes("svg")) {
                alert("Please upload a valid SVG file")
                return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result
                if (typeof result !== "string") return
                const svgContent = result
                setFile(uploadedFile)
                setOriginalSvg(svgContent)
                setConvertedImage("")

                // Extract original dimensions from SVG
                const parser = new DOMParser()
                const svgDoc = parser.parseFromString(
                    svgContent,
                    "image/svg+xml"
                )
                const svgElement = svgDoc.documentElement
                const width =
                    parseInt(svgElement.getAttribute("width") ?? "") || 800
                const height =
                    parseInt(svgElement.getAttribute("height") ?? "") || 600

                originalDimensions.current = { width, height }

                setConversionSettings((prev) => ({
                    ...prev,
                    width: width,
                    height: height,
                }))
            }
            reader.readAsText(uploadedFile)
        },
        []
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            const uploadedFile = e.dataTransfer.files[0]
            handleFileUpload(uploadedFile)
        },
        [handleFileUpload]
    )

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
    }, [])

    const convertSvgToImage = async () => {
        if (!originalSvg) {
            alert("Please select a file first")
            return
        }

        setConverting(true)
        setConvertedImage("")

        try {
            const canvas = canvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            const svgBlob = new Blob([originalSvg], { type: "image/svg+xml" })
            const url = URL.createObjectURL(svgBlob)

            const img = new Image()
            img.onload = () => {
                canvas.width = conversionSettings.width
                canvas.height = conversionSettings.height

                ctx.clearRect(0, 0, canvas.width, canvas.height)

                // Background
                if (conversionSettings.backgroundColor !== "transparent") {
                    let bgColor = conversionSettings.backgroundColor
                    if (bgColor === "custom")
                        bgColor = conversionSettings.customBackground
                    else if (bgColor === "white") bgColor = "#ffffff"
                    else if (bgColor === "black") bgColor = "#000000"
                    ctx.fillStyle = bgColor
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }

                let drawWidth = canvas.width
                let drawHeight = canvas.height
                let offsetX = 0
                let offsetY = 0

                if (conversionSettings.maintainAspectRatio) {
                    const scale = Math.min(
                        canvas.width / img.width,
                        canvas.height / img.height
                    )
                    drawWidth = img.width * scale
                    drawHeight = img.height * scale
                    offsetX = (canvas.width - drawWidth) / 2
                    offsetY = (canvas.height - drawHeight) / 2
                }

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

                let mimeType: string
                let quality: number | undefined =
                    conversionSettings.quality / 100

                switch (conversionSettings.format) {
                    case "jpg":
                        mimeType = "image/jpeg"
                        break
                    case "webp":
                        mimeType = "image/webp"
                        break
                    default:
                        mimeType = "image/png"
                        quality = undefined
                        break
                }

                const dataUrl = canvas.toDataURL(mimeType, quality ?? 1)
                setConvertedImage(dataUrl)
                setConverting(false)
                URL.revokeObjectURL(url)
            }

            img.onerror = () => {
                setConverting(false)
                alert("Conversion failed")
                URL.revokeObjectURL(url)
            }

            img.src = url
        } catch (error) {
            console.error("Conversion error:", error)
            setConverting(false)
            alert("Conversion failed")
        }
    }

    const downloadImage = () => {
        if (!convertedImage) return
        const link = document.createElement("a")
        const extension = conversionSettings.format
        const fileName = `converted-image-${Date.now()}.${extension}`
        link.download = fileName
        link.href = convertedImage
        link.click()
    }

    const clearAll = () => {
        setFile(null)
        setOriginalSvg("")
        setConvertedImage("")
        setConversionSettings({
            format: "png",
            width: 800,
            height: 600,
            quality: 90,
            backgroundColor: "transparent",
            maintainAspectRatio: true,
            customBackground: "#ffffff",
        })
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleDimensionChange = (
        dimension: "width" | "height",
        value: string
    ) => {
        const numValue = parseInt(value) || 0
        setConversionSettings((prev) => {
            if (
                dimension === "width" &&
                prev.maintainAspectRatio &&
                originalDimensions.current.width
            ) {
                const ratio =
                    originalDimensions.current.height /
                    originalDimensions.current.width
                return {
                    ...prev,
                    width: numValue,
                    height: Math.round(numValue * ratio),
                }
            } else if (
                dimension === "height" &&
                prev.maintainAspectRatio &&
                originalDimensions.current.height
            ) {
                const ratio =
                    originalDimensions.current.width /
                    originalDimensions.current.height
                return {
                    ...prev,
                    height: numValue,
                    width: Math.round(numValue * ratio),
                }
            } else {
                return { ...prev, [dimension]: numValue }
            }
        })
    }

    const presetSizes = [
        {
            label: "Original",
            width: originalDimensions.current.width,
            height: originalDimensions.current.height,
        },
        { label: "Small (400x300)", width: 400, height: 300 },
        { label: "Medium (800x600)", width: 800, height: 600 },
        { label: "Large (1200x900)", width: 1200, height: 900 },
        { label: "HD (1920x1080)", width: 1920, height: 1080 },
    ]

    const formatOptions = [
        { key: "png", label: "PNG" },
        { key: "jpg", label: "JPG" },
        { key: "webp", label: "WebP" },
    ]

    const bgOptions = [
        { key: "transparent", label: "Transparent" },
        { key: "white", label: "White" },
        { key: "black", label: "Black" },
        { key: "custom", label: "Custom" },
    ]

    const hasFile = !!file

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-6xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    <div className="grid gap-6 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[1fr_1.1fr]">
                        {/* LEFT PANEL - Upload & Settings */}
                        <div className="space-y-5">
                            {!hasFile ? (
                                // Upload dropzone (dashed border, camera icon)
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="group relative cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white/50 p-5 text-center transition-all duration-200 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".svg,image/svg+xml"
                                        className="hidden"
                                        onChange={(e) =>
                                            handleFileUpload(
                                                e.target.files?.[0]
                                            )
                                        }
                                    />
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="mb-3 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-3 shadow-inner dark:from-slate-800/60 dark:to-slate-900/60">
                                            <svg
                                                className="h-7 w-7 text-slate-500 dark:text-slate-400"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.5}
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-base font-semibold tracking-tight text-slate-800 dark:text-white">
                                            Upload SVG File
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Drag & drop or click to browse
                                        </p>
                                        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                SVG
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[10px] font-medium tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                            Max 5 MB
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // Compact preview card after upload
                                <div className="rounded-xl border border-slate-200/80 bg-white/50 p-3 dark:border-slate-800/60 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                            <div
                                                className="flex h-full w-full items-center justify-center text-2xl"
                                                dangerouslySetInnerHTML={{
                                                    __html: originalSvg,
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                                                        {file.name}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                        SVG ·{" "}
                                                        {formatSize(file.size)}
                                                        {originalDimensions
                                                            .current.width >
                                                            0 && (
                                                            <>
                                                                {" "}
                                                                ·{" "}
                                                                {
                                                                    originalDimensions
                                                                        .current
                                                                        .width
                                                                }
                                                                ×
                                                                {
                                                                    originalDimensions
                                                                        .current
                                                                        .height
                                                                }
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={clearAll}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-rose-800/40 dark:hover:bg-rose-950/20 dark:hover:text-rose-300"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5"
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
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Settings - only visible when file exists */}
                            {hasFile && (
                                <>
                                    {/* Output Format - Horizontal Buttons */}
                                    <div>
                                        <label className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                            Output Format
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {formatOptions.map(
                                                ({ key, label }) => (
                                                    <button
                                                        key={key}
                                                        onClick={() =>
                                                            setConversionSettings(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    format: key,
                                                                })
                                                            )
                                                        }
                                                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                                            conversionSettings.format ===
                                                            key
                                                                ? "border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                                                                : "border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                                        }`}
                                                    >
                                                        {label}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Background Color - Horizontal Buttons */}
                                    <div>
                                        <label className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                            Background Color
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {bgOptions.map(({ key, label }) => (
                                                <button
                                                    key={key}
                                                    onClick={() =>
                                                        setConversionSettings(
                                                            (prev) => ({
                                                                ...prev,
                                                                backgroundColor:
                                                                    key,
                                                            })
                                                        )
                                                    }
                                                    className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                                        conversionSettings.backgroundColor ===
                                                        key
                                                            ? "border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                                                            : "border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        {conversionSettings.backgroundColor ===
                                            "custom" && (
                                            <input
                                                type="color"
                                                value={
                                                    conversionSettings.customBackground
                                                }
                                                onChange={(e) =>
                                                    setConversionSettings(
                                                        (prev) => ({
                                                            ...prev,
                                                            customBackground:
                                                                e.target.value,
                                                        })
                                                    )
                                                }
                                                className="mt-2 h-8 w-full rounded-lg border border-slate-200/80 bg-white/60"
                                            />
                                        )}
                                    </div>

                                    {/* Quality Slider (only for JPG/WebP) */}
                                    {conversionSettings.format !== "png" && (
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                    Quality
                                                </label>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                    {conversionSettings.quality}
                                                    %
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                value={
                                                    conversionSettings.quality
                                                }
                                                onChange={(e) =>
                                                    setConversionSettings(
                                                        (prev) => ({
                                                            ...prev,
                                                            quality: parseInt(
                                                                e.target.value
                                                            ),
                                                        })
                                                    )
                                                }
                                                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500 dark:bg-slate-800"
                                            />
                                        </div>
                                    )}

                                    {/* Maintain Aspect Ratio Checkbox */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="maintainAspect"
                                            checked={
                                                conversionSettings.maintainAspectRatio
                                            }
                                            onChange={(e) =>
                                                setConversionSettings(
                                                    (prev) => ({
                                                        ...prev,
                                                        maintainAspectRatio:
                                                            e.target.checked,
                                                    })
                                                )
                                            }
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                        />
                                        <label
                                            htmlFor="maintainAspect"
                                            className="text-xs text-slate-600 dark:text-slate-300"
                                        >
                                            Maintain aspect ratio
                                        </label>
                                    </div>

                                    {/* Resize Section */}
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                            Resize
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {presetSizes.map((preset, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() =>
                                                        setConversionSettings(
                                                            (prev) => ({
                                                                ...prev,
                                                                width: preset.width,
                                                                height: preset.height,
                                                            })
                                                        )
                                                    }
                                                    className="rounded-lg border border-slate-200/80 bg-white/60 px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-slate-800/60 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                                    Width
                                                </label>
                                                <input
                                                    type="number"
                                                    value={
                                                        conversionSettings.width
                                                    }
                                                    onChange={(e) =>
                                                        handleDimensionChange(
                                                            "width",
                                                            e.target.value
                                                        )
                                                    }
                                                    min="1"
                                                    max="5000"
                                                    className="w-full rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                                    Height
                                                </label>
                                                <input
                                                    type="number"
                                                    value={
                                                        conversionSettings.height
                                                    }
                                                    onChange={(e) =>
                                                        handleDimensionChange(
                                                            "height",
                                                            e.target.value
                                                        )
                                                    }
                                                    min="1"
                                                    max="5000"
                                                    className="w-full rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-800 transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Convert & Clear Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={convertSvgToImage}
                                            disabled={converting}
                                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold tracking-wide text-white transition-all active:scale-[0.98] ${
                                                converting
                                                    ? "cursor-not-allowed bg-slate-400 dark:bg-slate-700"
                                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 hover:shadow"
                                            }`}
                                        >
                                            {converting
                                                ? "Converting..."
                                                : "Convert"}
                                        </button>
                                        <button
                                            onClick={clearAll}
                                            className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* RIGHT PANEL - Previews (placeholders only on desktop) */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {/* Original SVG Preview */}
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Original SVG
                                    </h3>
                                    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                                        {originalSvg ? (
                                            <div
                                                className="max-h-48 w-full object-contain [&>svg]:max-h-48 [&>svg]:w-full [&>svg]:object-contain"
                                                dangerouslySetInnerHTML={{
                                                    __html: originalSvg,
                                                }}
                                            />
                                        ) : (
                                            <div className="hidden text-center opacity-60 lg:block">
                                                <div className="mb-2 text-5xl">
                                                    📄
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    SVG preview
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Converted Image Preview */}
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Converted (
                                        {conversionSettings.format.toUpperCase()}
                                        )
                                    </h3>
                                    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                                        {convertedImage ? (
                                            <img
                                                src={convertedImage}
                                                alt="Converted"
                                                className="max-h-48 object-contain"
                                            />
                                        ) : (
                                            <div className="hidden text-center opacity-60 lg:block">
                                                <div className="mb-2 text-5xl">
                                                    ✨
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Converted image will appear
                                                    here
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Download Button (only when converted image exists) */}
                            {convertedImage && (
                                <button
                                    onClick={downloadImage}
                                    className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-xs font-semibold tracking-wide text-white shadow-sm transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md active:scale-[0.98]"
                                >
                                    Download{" "}
                                    {conversionSettings.format.toUpperCase()}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden canvas for conversion */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    )
}
