"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import NextImage from "next/image"
import { 
  Lock, 
  Unlock, 
  FileText, 
  Image as ImageIcon, 
  Box, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Download, 
  AlertTriangle, 
  Check
} from "lucide-react"
import { ToolHeroProps } from "@/types/tool"
import ToolHero from "@/components/tool-page-helpers/ToolHero"

// shadcn/ui components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

type Mode = "encode" | "decode"
type FileType = "text" | "image" | "binary"
type DecodeContentType = "text" | "image" | "binary" | "unknown"

interface FileInfo {
    name: string
    size: number
    type: string
    lastModified: number
    previewUrl?: string
    encodedData?: string
    file?: File
}

interface DecodeResult {
    contentType: DecodeContentType
    data: string
    mimeType?: string
    filename?: string
    size?: number
    imageDimensions?: { width: number; height: number }
}

const MAX_FILE_SIZE = 50 * 1024 * 1024
const LARGE_OUTPUT_THRESHOLD = 100000

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

export default function Base64Converter({ tool }: ToolHeroProps) {
    // Core state
    const [inputText, setInputText] = useState<string>("")
    const [outputText, setOutputText] = useState<string>("")
    const [mode, setMode] = useState<Mode>("encode")
    const [fileType, setFileType] = useState<FileType>("text")
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
    const [decodeResult, setDecodeResult] = useState<DecodeResult | null>(null)
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [processingProgress, setProcessingProgress] = useState<number>(0)

    // UI state
    const [error, setError] = useState<string>("")
    const [copied, setCopied] = useState<boolean>(false)
    const [isDragging, setIsDragging] = useState<boolean>(false)

    // Refs
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
            if (fileInfo?.previewUrl) URL.revokeObjectURL(fileInfo.previewUrl)
            if (
                decodeResult?.data &&
                decodeResult.contentType === "image" &&
                decodeResult.data.startsWith("blob:")
            ) {
                URL.revokeObjectURL(decodeResult.data)
            }
        }
    }, [fileInfo, decodeResult])

    // Helper: Encode text to Base64
    const encodeTextToBase64 = useCallback((text: string): string => {
        const encoder = new TextEncoder()
        const data = encoder.encode(text)
        const binaryString = Array.from(data)
            .map((byte) => String.fromCharCode(byte))
            .join("")
        return btoa(binaryString)
    }, [])

    // Helper: Decode Base64 to text
    const decodeBase64ToText = useCallback((base64: string): string => {
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        const decoder = new TextDecoder("utf-8")
        return decoder.decode(bytes)
    }, [])

    // Helper: Validate Base64 string
    const isValidBase64 = useCallback((str: string): boolean => {
        try {
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
            const cleanStr = str.split(",")?.pop() || str
            if (!base64Regex.test(cleanStr.trim())) return false
            atob(cleanStr.trim())
            return true
        } catch {
            return false
        }
    }, [])

    const isDataUrl = useCallback((str: string): boolean => {
        return str.startsWith("data:") && str.includes(";base64,")
    }, [])

    const extractBase64FromDataUrl = useCallback((dataUrl: string): string => {
        return dataUrl.split(",")[1] || ""
    }, [])

    const getMimeTypeFromDataUrl = useCallback((dataUrl: string): string => {
        const match = dataUrl.match(/^data:([^;]+);base64,/)
        return match?.[1] ?? "application/octet-stream"
    }, [])

    const detectImageFormat = useCallback((base64: string): string => {
        const signatures: Record<string, string> = {
            "/9j/": "image/jpeg",
            iVBORw0KGgo: "image/png",
            R0lGODdh: "image/gif",
            R0lGODlh: "image/gif",
            PHN2ZyB4bWxu: "image/svg+xml",
            Qk0: "image/bmp",
            SUkq: "image/tiff",
            TU0AK: "image/tiff",
            AAAAIGZ0eXBhdmlm: "image/avif",
            AAABAAEA: "image/x-icon",
            UklGR: "image/webp",
        }

        for (const [signature, format] of Object.entries(signatures)) {
            if (base64.startsWith(signature)) {
                return format
            }
        }
        return "application/octet-stream"
    }, [])

    const getImageDimensions = useCallback(
        (url: string): Promise<{ width: number; height: number }> => {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.onload = () => {
                    resolve({ width: img.width, height: img.height })
                }
                img.onerror = reject
                img.src = url
            })
        },
        []
    )

    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }, [])

    const detectContentType = useCallback(
        async (base64: string): Promise<DecodeResult> => {
            if (isDataUrl(base64)) {
                const mimeType = getMimeTypeFromDataUrl(base64)
                const cleanBase64 = extractBase64FromDataUrl(base64)

                if (mimeType.startsWith("image/")) {
                    return new Promise((resolve) => {
                        const img = new Image()
                        const blobUrl = `data:${mimeType};base64,${cleanBase64}`
                        img.onload = () => {
                            resolve({
                                contentType: "image",
                                data: blobUrl,
                                mimeType,
                                imageDimensions: {
                                    width: img.width,
                                    height: img.height,
                                },
                                size: Math.ceil(cleanBase64.length * 0.75),
                            })
                        }
                        img.onerror = () => {
                            resolve({
                                contentType: "binary",
                                data: cleanBase64,
                                mimeType,
                                size: Math.ceil(cleanBase64.length * 0.75),
                            })
                        }
                        img.src = blobUrl
                    })
                }

                return {
                    contentType: "binary",
                    data: cleanBase64,
                    mimeType,
                    size: Math.ceil(cleanBase64.length * 0.75),
                }
            }

            try {
                const decodedText = decodeBase64ToText(base64)
                const isValidText =
                    !decodedText.includes("\uFFFD") && decodedText.length > 0

                if (
                    isValidText &&
                    /[\x20-\x7E\r\n\t]/.test(decodedText.slice(0, 100))
                ) {
                    return {
                        contentType: "text",
                        data: decodedText,
                    }
                }

                const detectedFormat = detectImageFormat(base64)

                if (detectedFormat.startsWith("image/")) {
                    const blobUrl = `data:${detectedFormat};base64,${base64}`
                    const dimensions = await getImageDimensions(blobUrl).catch(
                        () => undefined
                    )
                    return {
                        contentType: "image",
                        data: blobUrl,
                        mimeType: detectedFormat,
                        imageDimensions: dimensions,
                        size: Math.ceil(base64.length * 0.75),
                    }
                }

                return {
                    contentType: "binary",
                    data: base64,
                    size: Math.ceil(base64.length * 0.75),
                }
            } catch {
                return {
                    contentType: "binary",
                    data: base64,
                    size: Math.ceil(base64.length * 0.75),
                }
            }
        },
        [isDataUrl, getMimeTypeFromDataUrl, extractBase64FromDataUrl, decodeBase64ToText, detectImageFormat, getImageDimensions]
    )

    const encodeFileToBase64 = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    setProcessingProgress((event.loaded / event.total) * 100)
                }
            }
            reader.onload = (e) => {
                const result = e.target?.result
                if (typeof result === "string") {
                    let base64 = result
                    if (result.includes(",")) {
                        const [, base64Data = ""] = result.split(",")
                        base64 = base64Data
                    }
                    resolve(base64)
                } else {
                    reject(new Error("Failed to read file"))
                }
            }
            reader.onerror = () => reject(new Error("File reading failed"))
            reader.readAsDataURL(file)
        })
    }, [])

    const handleFileUpload = useCallback(
        async (file: File) => {
            if (!file) return

            if (file.size > MAX_FILE_SIZE) {
                setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`)
                return
            }

            if (fileInfo?.previewUrl) {
                URL.revokeObjectURL(fileInfo.previewUrl)
            }

            let previewUrl: string | undefined
            if (fileType === "image" && file.type.startsWith("image/")) {
                previewUrl = URL.createObjectURL(file)
            }

            setFileInfo({
                name: file.name,
                size: file.size,
                type: file.type || "application/octet-stream",
                lastModified: file.lastModified,
                previewUrl,
                file,
            })

            setError("")

            if (fileType === "text") {
                setIsProcessing(true)
                try {
                    const fileText = await file.text()
                    setInputText(fileText)
                    const encoded = encodeTextToBase64(fileText)
                    setOutputText(encoded)
                } catch (err) {
                    setError("Failed to process text file")
                } finally {
                    setIsProcessing(false)
                    setProcessingProgress(0)
                }
            }
        },
        [fileType, fileInfo, encodeTextToBase64]
    )

    const handleEncode = useCallback(async () => {
        setError("")
        setDecodeResult(null)

        if (fileType === "text") {
            if (!inputText.trim()) {
                setError("Please enter text to encode")
                return
            }
            try {
                setIsProcessing(true)
                const encoded = encodeTextToBase64(inputText)
                setOutputText(encoded)
            } catch (err) {
                setError("Failed to encode text")
            } finally {
                setIsProcessing(false)
            }
        } else if (fileType === "image" || fileType === "binary") {
            if (!fileInfo?.file) {
                setError(`Please select a ${fileType} file to encode`)
                return
            }

            setIsProcessing(true)
            setProcessingProgress(0)

            try {
                const base64Data = await encodeFileToBase64(fileInfo.file)
                setOutputText(base64Data)
                setFileInfo((prev) =>
                    prev ? { ...prev, encodedData: base64Data } : null
                )
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to encode file")
            } finally {
                setIsProcessing(false)
                setProcessingProgress(0)
            }
        }
    }, [fileType, inputText, fileInfo, encodeTextToBase64, encodeFileToBase64])

    const handleDecode = useCallback(async () => {
        setError("")
        setOutputText("")
        setDecodeResult(null)

        if (!inputText.trim()) {
            setError("Please enter Base64 string to decode")
            return
        }

        setIsProcessing(true)

        try {
            let base64ToDecode = inputText.trim()

            if (isDataUrl(base64ToDecode)) {
                base64ToDecode = extractBase64FromDataUrl(base64ToDecode)
            }

            if (!isValidBase64(base64ToDecode)) {
                throw new Error("Invalid Base64 string. Please check your input.")
            }

            const result = await detectContentType(base64ToDecode)
            setDecodeResult(result)

            if (result.contentType === "text") {
                setOutputText(result.data)
            } else {
                setOutputText("")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to decode")
        } finally {
            setIsProcessing(false)
        }
    }, [inputText, isDataUrl, extractBase64FromDataUrl, isValidBase64, detectContentType])

    const handleDownloadDecodedImage = useCallback(() => {
        if (!decodeResult || decodeResult.contentType !== "image") return
        const link = document.createElement("a")
        const mimeType = decodeResult.mimeType || "image/png"
        const extension = mimeType.split("/")[1] || "png"
        link.download = `decoded_image.${extension}`
        link.href = decodeResult.data
        link.click()
    }, [decodeResult])

    const handleDownloadDecodedBinary = useCallback(() => {
        if (!decodeResult || decodeResult.contentType !== "binary") return
        try {
            const binaryString = atob(decodeResult.data)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }
            const mimeType = decodeResult.mimeType || "application/octet-stream"
            const extension = mimeType.split("/")[1] || "bin"
            const blob = new Blob([bytes], { type: mimeType })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `decoded_file.${extension}`
            link.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            setError("Failed to download binary file")
        }
    }, [decodeResult])

    const handleDownloadEncoded = useCallback(() => {
        if (!outputText) return
        const blob = new Blob([outputText], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `encoded_${Date.now()}.txt`
        link.click()
        URL.revokeObjectURL(url)
    }, [outputText])

    const handleCopy = useCallback(async () => {
        const textToCopy = outputText || (decodeResult?.contentType === "text" ? decodeResult.data : "")
        if (!textToCopy) return
        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
            copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            setError("Failed to copy to clipboard")
        }
    }, [outputText, decodeResult])

    const handleCopyDataUrl = useCallback(async () => {
        if (!decodeResult || decodeResult.contentType !== "image") return
        try {
            await navigator.clipboard.writeText(decodeResult.data)
            setCopied(true)
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
            copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            setError("Failed to copy Data URL")
        }
    }, [decodeResult])

    const handleSwap = useCallback(() => {
        const newMode = mode === "encode" ? "decode" : "encode"
        setMode(newMode)
        setInputText(outputText)
        setOutputText("")

        if (fileInfo?.previewUrl) URL.revokeObjectURL(fileInfo.previewUrl)
        setFileInfo(null)
        setDecodeResult(null)
        setError("")

        if (fileInputRef.current) fileInputRef.current.value = ""
        if (newMode === "encode") setFileType("text")
    }, [mode, outputText, fileInfo])

    const clearAll = useCallback(() => {
        setInputText("")
        setOutputText("")
        setError("")
        setCopied(false)
        setDecodeResult(null)

        if (fileInfo?.previewUrl) URL.revokeObjectURL(fileInfo.previewUrl)
        setFileInfo(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }, [fileInfo])

    const handleSample = useCallback(() => {
        if (mode === "encode") {
            const sampleText = "Hello World! 你好世界! 🌍 نعم! שלום!"
            setInputText(sampleText)
            const encoded = encodeTextToBase64(sampleText)
            setOutputText(encoded)
            setFileType("text")
            setError("")
            setDecodeResult(null)
        } else {
            const sampleBase64 = "SGVsbG8gV29ybGQhIOS9oOWlv+eVjOeVjCEg8J+MjSDRo9mFISIh"
            setInputText(sampleBase64)
            setOutputText("")
            setError("")
            setTimeout(() => handleDecode(), 100)
        }
    }, [mode, encodeTextToBase64, handleDecode])

    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) {
                if (fileType === "image" && !file.type.startsWith("image/")) {
                    setError("Please drop an image file")
                    return
                }
                await handleFileUpload(file)
            }
        },
        [handleFileUpload, fileType]
    )

    const triggerFileUpload = () => {
        fileInputRef.current?.click()
    }

    const isLargeOutput = outputText.length > LARGE_OUTPUT_THRESHOLD
    const isEncodeDisabled = mode === "encode" && (fileType === "text" ? !inputText.trim() : !fileInfo?.file)
    const isDecodeDisabled = mode === "decode" && !inputText.trim()

    return (
        <div className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-7xl space-y-8">
                <ToolHero tool={tool} />

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
                    <div className="p-6 sm:p-8">
                        {/* Process Type Tabs */}
                        <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); clearAll(); }} className="w-full mb-6">
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="encode" className="gap-2">
                                    <Lock className="h-4 w-4" /> Encode to Base64
                                </TabsTrigger>
                                <TabsTrigger value="decode" className="gap-2">
                                    <Unlock className="h-4 w-4" /> Decode from Base64
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* File Type Config (Encode mode only) */}
                        {mode === "encode" && (
                            <div className="flex flex-wrap gap-2 mb-6" role="radiogroup">
                                {[
                                    { id: "text", label: "Text Input", icon: FileText },
                                    { id: "image", label: "Image Input", icon: ImageIcon },
                                    { id: "binary", label: "Binary File", icon: Box },
                                ].map((type) => {
                                    const Icon = type.icon
                                    const active = fileType === type.id
                                    return (
                                        <Button
                                            key={type.id}
                                            type="button"
                                            variant={active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => { setFileType(type.id as FileType); clearAll(); }}
                                            className="gap-2 rounded-xl"
                                        >
                                            <Icon className="h-4 w-4" />
                                            {type.label}
                                        </Button>
                                    )
                                })}
                            </div>
                        )}

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Input Panel Card */}
                            <Card className="border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Upload className="h-4 w-4 text-indigo-500" />
                                            {mode === "encode" ? `${fileType.toUpperCase()} Source Bounds` : "Base64 payload String"}
                                        </span>
                                        {isProcessing && processingProgress > 0 && (
                                            <Badge variant="secondary" className="animate-pulse">
                                                Reading: {Math.round(processingProgress)}%
                                            </Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1">
                                    {mode === "decode" || fileType === "text" ? (
                                        <div className="relative">
                                            <Textarea
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                placeholder={mode === "decode" ? "Paste raw Base64 contents or complete image Data URLs to analyze..." : "Type text content to package into secure ASCII vectors..."}
                                                disabled={isProcessing}
                                                className="h-[240px] max-h-[240px] font-mono text-xs leading-relaxed resize-none custom-scrollbar bg-transparent rounded-xl"
                                            />
                                            {mode === "decode" && isDataUrl(inputText) && (
                                                <div className="mt-2 p-3 rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20 text-xs text-blue-600 dark:text-blue-400 flex items-center justify-between">
                                                    <span className="truncate">🎯 Data URL prefix verified</span>
                                                    <Badge variant="outline" className="text-[10px] uppercase font-mono max-w-[150px] truncate">
                                                        {getMimeTypeFromDataUrl(inputText)}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={handleDrop}
                                                onClick={triggerFileUpload}
                                                className={cn(
                                                    "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center h-[240px] bg-slate-50/40 dark:bg-slate-950/20",
                                                    isDragging ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                                )}
                                            >
                                                {fileInfo?.previewUrl && fileType === "image" ? (
                                                    <div className="relative group w-36 h-36 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                                                        <NextImage
                                                            src={fileInfo.previewUrl}
                                                            fill
                                                            alt="Input target asset blueprint"
                                                            unoptimized
                                                            className="object-contain p-2"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-white font-medium">
                                                            Replace Asset
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2 select-none">
                                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl inline-block shadow-sm border border-slate-100 dark:border-slate-800/80">
                                                            <Upload className="h-6 w-6 text-slate-500" />
                                                        </div>
                                                        <p className="text-sm font-medium">Drag & drop files or click to browser</p>
                                                        <p className="text-xs text-slate-400">Safe payload ceilings: Up to {MAX_FILE_SIZE / (1024 * 1024)}MB files</p>
                                                    </div>
                                                )}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept={fileType === "image" ? "image/*" : "*/*"}
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                                    className="hidden"
                                                />
                                            </div>

                                            {fileInfo && !fileInfo.previewUrl && (
                                                <div className="flex items-center gap-3 p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 rounded-xl shadow-inner">
                                                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-lg">📄</div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{fileInfo.name}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                                                            {formatFileSize(fileInfo.size)} • {fileInfo.type}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Command Dashboard Trigger Row */}
                                    <div className="flex flex-wrap gap-2 pt-2 justify-end">
                                        <Button variant="outline" size="sm" onClick={handleSample} disabled={isProcessing} className="gap-1.5 rounded-xl">
                                            <FileText className="h-3.5 w-3.5" /> Sample
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={clearAll} disabled={isProcessing} className="gap-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-slate-200 dark:border-slate-800">
                                            <Trash2 className="h-3.5 w-3.5" /> Clear
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleSwap} disabled={isProcessing} className="gap-1.5 rounded-xl">
                                            <RefreshCw className="h-3.5 w-3.5" /> Swap
                                        </Button>
                                        <Button 
                                            onClick={mode === "encode" ? handleEncode : handleDecode}
                                            disabled={isProcessing || (mode === "encode" ? isEncodeDisabled : isDecodeDisabled)}
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 rounded-xl min-w-[90px]"
                                        >
                                            {isProcessing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : mode === "encode" ? "🔐 Encode" : "🔓 Decode"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Output Panel Card */}
                            <Card className="border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Box className="h-4 w-4 text-emerald-500" />
                                        Target Compiled Output
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                                    
                                    {/* Decode Image Context Mode UI */}
                                    {decodeResult?.contentType === "image" && (
                                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="grid gap-4 sm:grid-cols-[140px_1fr] flex-1">
                                                <div className="relative h-[140px] sm:aspect-square rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden group shadow-inner">
                                                    <NextImage
                                                        src={decodeResult.data}
                                                        fill
                                                        unoptimized
                                                        alt="Decoded workspace pipeline target image"
                                                        className="object-contain p-2"
                                                    />
                                                </div>
                                                <div className="space-y-2 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl bg-slate-50/30 dark:bg-slate-950/20">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                                        <span>Image Parameters</span>
                                                        <Badge className="bg-emerald-500 text-white font-mono text-[9px]">
                                                            {decodeResult.mimeType?.split("/")[1]?.toUpperCase() || "IMG"}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                                        <div><span className="text-slate-400">MIME-Type:</span> <p className="font-semibold truncate">{decodeResult.mimeType || "Unknown"}</p></div>
                                                        {decodeResult.imageDimensions && (
                                                            <div><span className="text-slate-400">Dimensions:</span> <p className="font-semibold font-mono">{decodeResult.imageDimensions.width} × {decodeResult.imageDimensions.height}px</p></div>
                                                        )}
                                                        <div><span className="text-slate-400">Extracted Weight:</span> <p className="font-semibold">{decodeResult.size ? formatFileSize(decodeResult.size) : "Unknown"}</p></div>
                                                        <div><span className="text-slate-400">Aspect Scale:</span> <p className="font-semibold font-mono">{decodeResult.imageDimensions ? (decodeResult.imageDimensions.width / decodeResult.imageDimensions.height).toFixed(2) : "Unknown"}</p></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2 justify-end">
                                                <Button size="sm" onClick={handleDownloadDecodedImage} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl">
                                                    <Download className="h-3.5 w-3.5" /> Download Image
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 rounded-xl">
                                                    <Copy className="h-3.5 w-3.5" /> Copy Base64
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={handleCopyDataUrl} className="gap-1.5 rounded-xl">
                                                    <Copy className="h-3.5 w-3.5" /> Copy Data URL
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Decode Binary Mode UI */}
                                    {decodeResult?.contentType === "binary" && (
                                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 rounded-2xl flex items-center gap-4 flex-1">
                                                <div className="p-3.5 bg-white dark:bg-slate-900 border shadow-sm rounded-xl text-2xl">📦</div>
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Decoded File Core Asset Blob</div>
                                                    <div className="text-xs text-slate-400 font-mono space-y-0.5">
                                                        <p>Format Pattern: {decodeResult.mimeType || "Unknown/Octet-Stream"}</p>
                                                        <p>Calculated Weight: {decodeResult.size ? formatFileSize(decodeResult.size) : "Unknown"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2 justify-end">
                                                <Button size="sm" onClick={handleDownloadDecodedBinary} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl">
                                                    <Download className="h-3.5 w-3.5" /> Download File
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 rounded-xl">
                                                    <Copy className="h-3.5 w-3.5" /> Copy Payload String
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Plain Standard Vector Render Outputs */}
                                    {(!decodeResult || decodeResult.contentType === "text") && (
                                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="relative flex-1">
                                                {outputText && mode === "encode" && isLargeOutput ? (
                                                    <div className="h-[240px] max-h-[240px] flex flex-col items-center justify-center text-center p-6 border rounded-xl border-amber-200/60 bg-amber-50/20 dark:border-amber-900/30 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 space-y-2">
                                                        <AlertTriangle className="h-6 w-6" />
                                                        <div className="text-sm font-semibold">Large Payload Stream Blocked</div>
                                                        <p className="text-xs text-slate-400 max-w-sm">Output content exceeds safety standard limits ({outputText.length.toLocaleString()} chars). Use downlinks below to extract without lagging DOM frame layers.</p>
                                                    </div>
                                                ) : (
                                                    <Textarea
                                                        value={outputText}
                                                        readOnly
                                                        placeholder="Compiled data strings array packages will execute and print dynamically here..."
                                                        className="h-[240px] max-h-[240px] font-mono text-xs leading-relaxed resize-none bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 rounded-xl custom-scrollbar"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2 justify-end">
                                                <Button size="sm" onClick={handleCopy} disabled={!outputText} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl min-w-[80px]">
                                                    <Copy className="h-3.5 w-3.5" />
                                                    {copied ? "Copied!" : "Copy"}
                                                </Button>
                                                {mode === "encode" && (
                                                    <Button size="sm" variant="outline" onClick={handleDownloadEncoded} disabled={!outputText} className="gap-1.5 rounded-xl">
                                                        <Download className="h-3.5 w-3.5" /> Download TXT
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Error Alert Display */}
                        {error && (
                            <div className="mt-4 p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between shadow-sm animate-in fade-in-50">
                                <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {error}</span>
                                <button type="button" onClick={() => setError("")} className="hover:opacity-70 text-sm font-bold px-1.5">×</button>
                            </div>
                        )}

                        {/* Informational Guidance Section */}
                        {/* <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { title: "What is Base64?", icon: "💡", desc: "Base64 encoding converts binary data to ASCII text format, making it safe for transmission over text-based protocols." },
                                { title: "Common Uses", icon: "🎯", desc: "Email attachments, data URLs, API authentication, storing binary data in JSON, and embedding images in HTML/CSS." },
                                { title: "Pro Tips", icon: "⚡", desc: "Base64 increases data size by ~33%. Supports Unicode, emoji, and all international characters perfectly." },
                            ].map((info) => (
                                <div key={info.title} className="p-4 rounded-xl border border-slate-200/70 bg-white/40 dark:border-slate-800/80 dark:bg-slate-950/20 flex gap-3 shadow-sm">
                                    <div className="text-xl select-none">{info.icon}</div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{info.title}</h4>
                                        <p className="text-xs text-slate-400 leading-normal">{info.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div> */}

                    </div>
                </div>
            </div>
        </div>
    )
}