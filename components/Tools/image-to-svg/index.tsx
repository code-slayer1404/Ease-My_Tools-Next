"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import ImageTracer from "imagetracerjs"

type TraceMode =
    | "logo"
    | "detailed"
    | "sketch"
    | "anime"
    | "icon"
    | "blackwhite"
    | "smooth"
    | "minimal"

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ImageToSvg() {
    const [preview, setPreview] = useState<string>("")
    const [svgCode, setSvgCode] = useState<string>("")
    const [svgUrl, setSvgUrl] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [mode, setMode] = useState<TraceMode>("logo")
    const [quality, setQuality] = useState<number>(5)
    const [recommendedMode, setRecommendedMode] = useState<string>("")
    const [file, setFile] = useState<File | null>(null)

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const selectedFile = acceptedFiles?.[0]
            if (!selectedFile) return

            if (selectedFile.size > 10 * 1024 * 1024) {
                alert("Please upload image smaller than 10MB")
                return
            }

            // Clean up old URLs
            if (preview) URL.revokeObjectURL(preview)
            if (svgUrl) URL.revokeObjectURL(svgUrl)

            setFile(selectedFile)
            const imageUrl = URL.createObjectURL(selectedFile)
            setPreview(imageUrl)
            setSvgCode("")
            setSvgUrl("")

            const fileName = selectedFile.name.toLowerCase()
            if (fileName.includes("logo") || fileName.includes("icon")) {
                setMode("logo")
                setQuality(5)
                setRecommendedMode("Recommended: Logo Mode")
            } else if (
                fileName.includes("anime") ||
                fileName.includes("cartoon")
            ) {
                setMode("anime")
                setQuality(6)
                setRecommendedMode("Recommended: Anime Mode")
            } else if (
                fileName.includes("sketch") ||
                fileName.includes("drawing")
            ) {
                setMode("sketch")
                setQuality(2)
                setRecommendedMode("Recommended: Sketch Mode")
            } else if (selectedFile.size > 4 * 1024 * 1024) {
                setMode("minimal")
                setQuality(3)
                setRecommendedMode("Recommended: Minimal Mode")
            } else {
                setMode("detailed")
                setQuality(6)
                setRecommendedMode("Recommended: Detailed Mode")
            }
        },
        [preview, svgUrl]
    )

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "image/png": [],
            "image/jpeg": [],
            "image/jpg": [],
            "image/webp": [],
            "image/gif": [],
            "image/bmp": [],
            "image/tiff": [],
            "image/avif": [],
            "image/x-icon": [],
        },
        multiple: false,
        onDrop,
    })

    const getModeSettings = (): Record<string, number | boolean> => {
        switch (mode) {
            case "logo":
                return {
                    ltres: 0.1,
                    qtres: 0.1,
                    pathomit: 1,
                    colorsampling: 2,
                    numberofcolors: quality,
                    mincolorratio: 0,
                    colorquantcycles: 3,
                    scale: 1,
                    strokewidth: 1,
                    blurradius: 0,
                    blurdelta: 4,
                    roundcoords: 1,
                }
            case "detailed":
                return {
                    ltres: 1,
                    qtres: 1,
                    pathomit: 6,
                    colorsampling: 2,
                    numberofcolors: quality + 1,
                    mincolorratio: 0,
                    colorquantcycles: 2,
                    scale: 1,
                    strokewidth: 1,
                    blurradius: 1,
                    blurdelta: 10,
                }
            case "sketch":
                return {
                    ltres: 4,
                    qtres: 4,
                    pathomit: 12,
                    colorsampling: 0,
                    numberofcolors: 2,
                    colorquantcycles: 1,
                    scale: 1,
                    strokewidth: 2,
                    blurradius: 0,
                    blurdelta: 20,
                }
            case "anime":
                return {
                    ltres: 0.5,
                    qtres: 0.5,
                    pathomit: 2,
                    colorsampling: 2,
                    numberofcolors: 8,
                    colorquantcycles: 2,
                    scale: 1,
                    strokewidth: 1,
                    blurradius: 1,
                    blurdelta: 6,
                }
            case "icon":
                return {
                    ltres: 0.1,
                    qtres: 0.1,
                    pathomit: 0,
                    colorsampling: 0,
                    numberofcolors: 4,
                    colorquantcycles: 1,
                    scale: 1,
                    strokewidth: 1,
                }
            case "blackwhite":
                return {
                    ltres: 1,
                    qtres: 1,
                    pathomit: 1,
                    colorsampling: 0,
                    numberofcolors: 2,
                    colorquantcycles: 1,
                    scale: 1,
                    strokewidth: 1,
                }
            case "smooth":
                return {
                    ltres: 2,
                    qtres: 2,
                    pathomit: 8,
                    colorsampling: 2,
                    numberofcolors: quality,
                    colorquantcycles: 2,
                    scale: 1,
                    strokewidth: 1,
                    blurradius: 2,
                    blurdelta: 12,
                    roundcoords: 2,
                }
            case "minimal":
                return {
                    ltres: 4,
                    qtres: 4,
                    pathomit: 20,
                    colorsampling: 0,
                    numberofcolors: 3,
                    colorquantcycles: 1,
                    scale: 1,
                    strokewidth: 1,
                }
            default:
                return {}
        }
    }

    const enhanceImage = async (): Promise<string> => {
        if (!file) throw new Error("No file selected")
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/image-to-svg", {
            method: "POST",
            body: formData,
        })
        if (!response.ok) throw new Error("Enhancement failed")
        const blob = await response.blob()
        return URL.createObjectURL(blob)
    }

    const convertToSvg = async (): Promise<void> => {
        if (!preview) return
        try {
            setLoading(true)
            const enhancedImage = await enhanceImage()
            ImageTracer.imageToSVG(
                enhancedImage,
                (svgString: string) => {
                    setSvgCode(svgString)
                    const blob = new Blob([svgString], {
                        type: "image/svg+xml",
                    })
                    const url = URL.createObjectURL(blob)
                    setSvgUrl(url)
                    setLoading(false)
                },
                getModeSettings()
            )
        } catch (error) {
            console.error(error)
            setLoading(false)
            alert("SVG conversion failed")
        }
    }

    const copySvg = async (): Promise<void> => {
        if (!svgCode) return
        await navigator.clipboard.writeText(svgCode)
        alert("SVG copied")
    }

    const handleReset = () => {
        if (preview) URL.revokeObjectURL(preview)
        if (svgUrl) URL.revokeObjectURL(svgUrl)
        setFile(null)
        setPreview("")
        setSvgCode("")
        setSvgUrl("")
        setRecommendedMode("")
    }

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
                                    {...getRootProps()}
                                    className="group relative cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white/50 p-5 text-center transition-all duration-200 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600"
                                >
                                    <input {...getInputProps()} />
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
                                            Upload Image
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Drag & drop or click to browse
                                        </p>
                                        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                PNG
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                JPEG
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                WEBP
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                GIF
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[10px] font-medium tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                            Max 10 MB
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // Compact preview card after upload
                                <div className="rounded-xl border border-slate-200/80 bg-white/50 p-3 dark:border-slate-800/60 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                            {preview && (
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                                                        {file?.name}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                        {file?.type
                                                            .split("/")[1]
                                                            ?.toUpperCase() ||
                                                            "IMG"}{" "}
                                                        ·{" "}
                                                        {formatSize(
                                                            file?.size || 0
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleReset}
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

                            {/* Mode Selection */}
                            <div>
                                <label className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Conversion Mode
                                </label>
                                <select
                                    value={mode}
                                    onChange={(e) =>
                                        setMode(e.target.value as TraceMode)
                                    }
                                    className="w-full rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 text-sm text-slate-800 transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                >
                                    <option value="logo">Logo</option>
                                    <option value="detailed">Detailed</option>
                                    <option value="sketch">Sketch</option>
                                    <option value="anime">Anime</option>
                                    <option value="icon">Icon</option>
                                    <option value="blackwhite">
                                        Black & White
                                    </option>
                                    <option value="smooth">Smooth</option>
                                    <option value="minimal">Minimal</option>
                                </select>
                                {recommendedMode && (
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {recommendedMode}
                                    </p>
                                )}
                            </div>

                            {/* Quality Slider */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        SVG Quality
                                    </label>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        {quality} Colors
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="2"
                                    max="6"
                                    value={quality}
                                    onChange={(e) =>
                                        setQuality(Number(e.target.value))
                                    }
                                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500 dark:bg-slate-800"
                                />
                            </div>

                            {/* Convert Button */}
                            <button
                                type="button"
                                onClick={convertToSvg}
                                disabled={!preview || loading}
                                className={`w-full rounded-lg px-3 py-2 text-xs font-bold tracking-wide text-white transition-all active:scale-[0.98] ${
                                    !preview || loading
                                        ? "cursor-not-allowed bg-slate-400 dark:bg-slate-700"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 hover:shadow"
                                }`}
                            >
                                {loading ? "Converting..." : "Convert to SVG"}
                            </button>
                        </div>

                        {/* RIGHT PANEL - Previews (placeholders only on desktop) */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {/* Original Image Preview */}
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Original
                                    </h3>
                                    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="max-h-48 object-contain"
                                            />
                                        ) : (
                                            <div className="hidden text-center opacity-60 lg:block">
                                                <div className="mb-2 text-5xl">
                                                    🖼️
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    No image uploaded
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SVG Result Preview */}
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        SVG Result
                                    </h3>
                                    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                                        {svgUrl ? (
                                            <img
                                                src={svgUrl}
                                                alt="SVG"
                                                className="max-h-48 object-contain"
                                            />
                                        ) : (
                                            <div className="hidden text-center opacity-60 lg:block">
                                                <div className="mb-2 text-5xl">
                                                    ✨
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    SVG will appear here
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons & SVG Code (only when result exists) */}
                            {svgUrl && (
                                <>
                                    <div className="flex gap-3">
                                        <a
                                            href={svgUrl}
                                            download="converted.svg"
                                            className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-center text-xs font-semibold tracking-wide text-white shadow-sm transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md active:scale-[0.98]"
                                        >
                                            Download SVG
                                        </a>
                                        <button
                                            type="button"
                                            onClick={copySvg}
                                            className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            Copy SVG
                                        </button>
                                    </div>

                                    <textarea
                                        readOnly
                                        value={svgCode}
                                        rows={8}
                                        className="w-full rounded-lg border border-slate-200/80 bg-white/60 p-3 font-mono text-xs text-slate-700 focus:outline-none dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
