"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import styles from "./styles.module.css"

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

const Base64Converter = () => {
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
            if (!base64Regex.test(cleanStr)) return false
            atob(cleanStr)
            return true
        } catch {
            return false
        }
    }, [])

    // Helper: Detect if string is a Data URL
    const isDataUrl = useCallback((str: string): boolean => {
        return str.startsWith("data:") && str.includes(";base64,")
    }, [])

    // Helper: Extract Base64 from Data URL
    const extractBase64FromDataUrl = useCallback((dataUrl: string): string => {
        return dataUrl.split(",")[1] || ""
    }, [])

    // Helper: Get MIME type from Data URL
    const getMimeTypeFromDataUrl = useCallback((dataUrl: string): string => {
        const match = dataUrl.match(/^data:([^;]+);base64,/)
        return match?.[1] ?? "application/octet-stream"
    }, [])

    // Helper: Detect image format from Base64 signature
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

    // Helper: Get image dimensions
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

    // Helper: Format file size
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }, [])

    // Helper: Detect content type from Base64
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

                const firstChars = base64.slice(0, 20)
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
        [
            isDataUrl,
            getMimeTypeFromDataUrl,
            extractBase64FromDataUrl,
            decodeBase64ToText,
            detectImageFormat,
            getImageDimensions,
        ]
    )

    // Encode file to Base64
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

    // Handle file upload
    const handleFileUpload = useCallback(
        async (file: File) => {
            if (!file) return

            if (file.size > MAX_FILE_SIZE) {
                setError(
                    `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`
                )
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

    // Handle Encode button click
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
                setError(
                    err instanceof Error ? err.message : "Failed to encode file"
                )
            } finally {
                setIsProcessing(false)
                setProcessingProgress(0)
            }
        }
    }, [fileType, inputText, fileInfo, encodeTextToBase64, encodeFileToBase64])

    // Handle Decode button click
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
                throw new Error(
                    "Invalid Base64 string. Please check your input."
                )
            }

            const result = await detectContentType(base64ToDecode)
            setDecodeResult(result)

            if (result.contentType === "text") {
                setOutputText(result.data)
            } else if (result.contentType === "image") {
                setOutputText("")
            } else {
                setOutputText("")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to decode")
        } finally {
            setIsProcessing(false)
        }
    }, [
        inputText,
        isDataUrl,
        extractBase64FromDataUrl,
        isValidBase64,
        detectContentType,
    ])

    // Handle download decoded image
    const handleDownloadDecodedImage = useCallback(() => {
        if (!decodeResult || decodeResult.contentType !== "image") return

        const link = document.createElement("a")
        const mimeType = decodeResult.mimeType || "image/png"
        const extension = mimeType.split("/")[1] || "png"
        link.download = `decoded_image.${extension}`
        link.href = decodeResult.data
        link.click()
    }, [decodeResult])

    // Handle download decoded binary file
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

    // Handle download encoded result
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

    // Handle copy to clipboard
    const handleCopy = useCallback(async () => {
        const textToCopy =
            outputText ||
            (decodeResult?.contentType === "text" ? decodeResult.data : "")
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

    // Handle copy data URL
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

    // Handle swap between encode/decode
    const handleSwap = useCallback(() => {
        const newMode = mode === "encode" ? "decode" : "encode"
        setMode(newMode)

        if (mode === "encode") {
            setInputText(outputText)
            setOutputText("")
        } else {
            setInputText(outputText)
            setOutputText("")
        }

        if (fileInfo?.previewUrl) {
            URL.revokeObjectURL(fileInfo.previewUrl)
        }
        setFileInfo(null)
        setDecodeResult(null)
        setError("")

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }

        if (newMode === "encode") {
            setFileType("text")
        }
    }, [mode, outputText, fileInfo])

    // Handle clear all
    const clearAll = useCallback(() => {
        setInputText("")
        setOutputText("")
        setError("")
        setCopied(false)
        setDecodeResult(null)

        if (fileInfo?.previewUrl) {
            URL.revokeObjectURL(fileInfo.previewUrl)
        }
        setFileInfo(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }

        if (copyTimeoutRef.current) {
            clearTimeout(copyTimeoutRef.current)
        }
    }, [fileInfo])

    // Handle sample data
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
            const sampleBase64 =
                "SGVsbG8gV29ybGQhIOS9oOWlv+eVjOeVjCEg8J+MjSDRo9mFISIh"
            setInputText(sampleBase64)
            setOutputText("")
            setError("")
            setTimeout(() => handleDecode(), 100)
        }
    }, [mode, encodeTextToBase64, handleDecode])

    // Drag and drop handlers
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

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragging(false)
        },
        []
    )

    const triggerFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const isLargeOutput = outputText.length > LARGE_OUTPUT_THRESHOLD
    const isEncodeDisabled =
        mode === "encode" &&
        (fileType === "text" ? !inputText.trim() : !fileInfo?.file)
    const isDecodeDisabled = mode === "decode" && !inputText.trim()

    // Render input area
    const renderInputArea = () => {
        if (mode === "decode") {
            return (
                <div className={styles.inputSection}>
                    <div className={styles.sectionHeader}>
                        <h3>📥 Base64 Input</h3>
                        {isProcessing && (
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${processingProgress}%` }}
                                />
                            </div>
                        )}
                    </div>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter Base64 string or Data URL to decode..."
                        className={styles.textarea}
                        rows={6}
                        disabled={isProcessing}
                    />
                    {isDataUrl(inputText) && (
                        <div className={styles.dataUrlInfo}>
                            <span>🔍 Data URL detected</span>
                            <small>
                                MIME Type: {getMimeTypeFromDataUrl(inputText)}
                            </small>
                        </div>
                    )}
                </div>
            )
        }

        if (fileType === "text") {
            return (
                <div className={styles.inputSection}>
                    <div className={styles.sectionHeader}>
                        <h3>📤 Text Input</h3>
                    </div>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter text to encode..."
                        className={styles.textarea}
                        rows={6}
                        disabled={isProcessing}
                    />
                </div>
            )
        }

        return (
            <div className={styles.inputSection}>
                <div className={styles.sectionHeader}>
                    <h3>
                        {fileType === "image"
                            ? "🖼️ Image Input"
                            : "📦 Binary File Input"}
                    </h3>
                    {isProcessing && (
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${processingProgress}%` }}
                            />
                        </div>
                    )}
                </div>

                <div
                    className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={triggerFileUpload}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            triggerFileUpload()
                        }
                    }}
                >
                    {fileInfo?.previewUrl && fileType === "image" ? (
                        <div className={styles.imagePreviewContainer}>
                            <img
                                src={fileInfo.previewUrl}
                                alt="Preview"
                                className={styles.imagePreview}
                            />
                            <div className={styles.imageOverlay}>
                                <span>Click or drag to change</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.dropContent}>
                            <span className={styles.dropIcon}>
                                {fileType === "image" ? "🖼️" : "📦"}
                            </span>
                            <p>
                                Drag & drop a {fileType} file here or click to
                                browse
                            </p>
                            <small>
                                Maximum file size:{" "}
                                {MAX_FILE_SIZE / (1024 * 1024)}MB
                            </small>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={fileType === "image" ? "image/*" : "*/*"}
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file)
                        }}
                        hidden
                    />
                </div>

                {fileInfo && !fileInfo.previewUrl && (
                    <div className={styles.fileInfoCard}>
                        <div className={styles.fileInfoIcon}>📄</div>
                        <div className={styles.fileInfoDetails}>
                            <div className={styles.fileInfoName}>
                                {fileInfo.name}
                            </div>
                            <div className={styles.fileInfoMeta}>
                                <span>
                                    Size: {(fileInfo.size / 1024).toFixed(2)} KB
                                </span>
                                <span>Type: {fileInfo.type}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={styles.base64Converter}>
            <div className={styles.layout}>
                {/* Mode Selector */}
                <div className={styles.modeSelector}>
                    <button
                        className={`${styles.modeBtn} ${mode === "encode" ? styles.active : ""}`}
                        onClick={() => setMode("encode")}
                    >
                        <span>🔐</span>
                        Encode to Base64
                    </button>
                    <button
                        className={`${styles.modeBtn} ${mode === "decode" ? styles.active : ""}`}
                        onClick={() => setMode("decode")}
                    >
                        <span>🔓</span>
                        Decode from Base64
                    </button>
                </div>

                {/* File Type Selector (encode mode only) */}
                {mode === "encode" && (
                    <div className={styles.fileTypeSelector} role="radiogroup">
                        <label
                            className={`${styles.fileTypeLabel} ${fileType === "text" ? styles.active : ""}`}
                        >
                            <input
                                type="radio"
                                value="text"
                                checked={fileType === "text"}
                                onChange={(e) =>
                                    setFileType(e.target.value as FileType)
                                }
                            />
                            <span>📝 Text</span>
                        </label>
                        <label
                            className={`${styles.fileTypeLabel} ${fileType === "image" ? styles.active : ""}`}
                        >
                            <input
                                type="radio"
                                value="image"
                                checked={fileType === "image"}
                                onChange={(e) =>
                                    setFileType(e.target.value as FileType)
                                }
                            />
                            <span>🖼️ Image</span>
                        </label>
                        <label
                            className={`${styles.fileTypeLabel} ${fileType === "binary" ? styles.active : ""}`}
                        >
                            <input
                                type="radio"
                                value="binary"
                                checked={fileType === "binary"}
                                onChange={(e) =>
                                    setFileType(e.target.value as FileType)
                                }
                            />
                            <span>📦 Binary</span>
                        </label>
                    </div>
                )}

                {/* Input Area */}
                {renderInputArea()}

                {/* Action Buttons */}
                <div className={styles.actionBar}>
                    <button
                        className={styles.primaryBtn}
                        onClick={
                            mode === "encode" ? handleEncode : handleDecode
                        }
                        disabled={
                            isProcessing ||
                            (mode === "encode"
                                ? isEncodeDisabled
                                : isDecodeDisabled)
                        }
                    >
                        {isProcessing
                            ? "Processing..."
                            : mode === "encode"
                              ? "🔐 Encode"
                              : "🔓 Decode"}
                    </button>
                    <button
                        className={styles.secondaryBtn}
                        onClick={handleSample}
                        disabled={isProcessing}
                    >
                        📋 Sample
                    </button>
                    <button
                        className={styles.secondaryBtn}
                        onClick={clearAll}
                        disabled={isProcessing}
                    >
                        🗑️ Clear
                    </button>
                    <button
                        className={styles.secondaryBtn}
                        onClick={handleSwap}
                        disabled={isProcessing}
                    >
                        🔄 Swap
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={styles.errorMessage} role="alert">
                        <span className={styles.errorIcon}>⚠️</span>
                        <span className={styles.errorText}>{error}</span>
                        <button
                            className={styles.errorClose}
                            onClick={() => setError("")}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Decode Results - Image Preview Section */}
                {decodeResult?.contentType === "image" && (
                    <div className={styles.decodeImageSection}>
                        <div className={styles.imagePreviewCard}>
                            <div className={styles.imagePreviewHeader}>
                                <span className={styles.imagePreviewIcon}>
                                    🖼️
                                </span>
                                <h3 className={styles.imagePreviewTitle}>
                                    Decoded Image
                                </h3>
                                <span className={styles.imageFormatBadge}>
                                    {decodeResult.mimeType
                                        ?.split("/")[1]
                                        ?.toUpperCase() || "IMAGE"}
                                </span>
                            </div>

                            <div className={styles.imagePreviewWrapper}>
                                <img
                                    src={decodeResult.data}
                                    alt="Decoded"
                                    className={styles.decodedImage}
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none"
                                    }}
                                />
                            </div>
                        </div>

                        <div className={styles.metadataCard}>
                            <div className={styles.metadataHeader}>
                                <span className={styles.metadataIcon}>📋</span>
                                <h4>Image Metadata</h4>
                            </div>

                            <div className={styles.metadataGrid}>
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>
                                        Format
                                    </span>
                                    <span className={styles.metadataValue}>
                                        {decodeResult.mimeType || "Unknown"}
                                    </span>
                                </div>

                                {decodeResult.imageDimensions && (
                                    <div className={styles.metadataItem}>
                                        <span className={styles.metadataLabel}>
                                            Dimensions
                                        </span>
                                        <span className={styles.metadataValue}>
                                            {decodeResult.imageDimensions.width}{" "}
                                            ×{" "}
                                            {
                                                decodeResult.imageDimensions
                                                    .height
                                            }{" "}
                                            px
                                        </span>
                                    </div>
                                )}

                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>
                                        File Size
                                    </span>
                                    <span className={styles.metadataValue}>
                                        {decodeResult.size
                                            ? formatFileSize(decodeResult.size)
                                            : "Unknown"}
                                    </span>
                                </div>

                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>
                                        Base64 Length
                                    </span>
                                    <span className={styles.metadataValue}>
                                        {decodeResult.data
                                            .split(",")[1]
                                            ?.length.toLocaleString() ||
                                            decodeResult.data.length.toLocaleString()}{" "}
                                        chars
                                    </span>
                                </div>

                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>
                                        Aspect Ratio
                                    </span>
                                    <span className={styles.metadataValue}>
                                        {decodeResult.imageDimensions
                                            ? (
                                                  decodeResult.imageDimensions
                                                      .width /
                                                  decodeResult.imageDimensions
                                                      .height
                                              ).toFixed(2)
                                            : "Unknown"}
                                    </span>
                                </div>

                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>
                                        Color Depth
                                    </span>
                                    <span className={styles.metadataValue}>
                                        24-bit
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.imageActionBar}>
                            <button
                                className={`${styles.actionBtn} ${styles.primaryAction}`}
                                onClick={handleDownloadDecodedImage}
                            >
                                <span>💾</span>
                                Download Image
                            </button>
                            <button
                                className={`${styles.actionBtn} ${styles.secondaryAction}`}
                                onClick={handleCopy}
                            >
                                <span>📋</span>
                                {copied ? "Copied!" : "Copy Base64"}
                            </button>
                            <button
                                className={`${styles.actionBtn} ${styles.secondaryAction}`}
                                onClick={handleCopyDataUrl}
                            >
                                <span>🔗</span>
                                Copy Data URL
                            </button>
                        </div>
                    </div>
                )}

                {/* Decode Results - Binary File Info */}
                {decodeResult?.contentType === "binary" && (
                    <div className={styles.decodeBinarySection}>
                        <div className={styles.sectionHeader}>
                            <h3>📦 Binary Data Detected</h3>
                        </div>
                        <div className={styles.binaryInfo}>
                            <div className={styles.binaryInfoRow}>
                                <span>File Type:</span>
                                <strong>
                                    {decodeResult.mimeType || "Unknown"}
                                </strong>
                            </div>
                            <div className={styles.binaryInfoRow}>
                                <span>Size:</span>
                                <strong>
                                    {((decodeResult.size || 0) / 1024).toFixed(
                                        2
                                    )}{" "}
                                    KB
                                </strong>
                            </div>
                            <div className={styles.binaryInfoRow}>
                                <span>Base64 Length:</span>
                                <strong>
                                    {decodeResult.data.length.toLocaleString()}{" "}
                                    chars
                                </strong>
                            </div>
                        </div>
                        <div className={styles.outputActions}>
                            <button
                                className={styles.actionBtn}
                                onClick={handleDownloadDecodedBinary}
                            >
                                💾 Download File
                            </button>
                            <button
                                className={styles.actionBtn}
                                onClick={handleCopy}
                            >
                                {copied ? "✅ Copied!" : "📋 Copy Base64"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Output Section (for text/binary output) */}
                {outputText && mode === "encode" && (
                    <div className={styles.outputSection}>
                        <div className={styles.sectionHeader}>
                            <h3>📥 Base64 Output</h3>
                            <span className={styles.outputLength}>
                                Length: {outputText.length.toLocaleString()}{" "}
                                chars
                            </span>
                        </div>

                        {!isLargeOutput ? (
                            <textarea
                                value={outputText}
                                readOnly
                                className={`${styles.textarea} ${styles.outputTextarea}`}
                                rows={6}
                            />
                        ) : (
                            <div className={styles.largeOutputWarning}>
                                <span>⚠️</span>
                                <p>
                                    Output is very large (
                                    {outputText.length.toLocaleString()}{" "}
                                    characters).
                                </p>
                                <p>
                                    Use Copy or Download buttons below to save
                                    the result.
                                </p>
                            </div>
                        )}

                        <div className={styles.outputActions}>
                            <button
                                className={styles.actionBtn}
                                onClick={handleCopy}
                                disabled={!outputText}
                            >
                                {copied ? "✅ Copied!" : "📋 Copy"}
                            </button>
                            <button
                                className={styles.actionBtn}
                                onClick={handleDownloadEncoded}
                                disabled={!outputText}
                            >
                                💾 Download
                            </button>
                        </div>
                    </div>
                )}

                {/* Text Decode Output */}
                {decodeResult?.contentType === "text" && outputText && (
                    <div className={styles.outputSection}>
                        <div className={styles.sectionHeader}>
                            <h3>📤 Decoded Text</h3>
                            <span className={styles.outputLength}>
                                Length: {outputText.length.toLocaleString()}{" "}
                                chars
                            </span>
                        </div>
                        <textarea
                            value={outputText}
                            readOnly
                            className={`${styles.textarea} ${styles.outputTextarea}`}
                            rows={6}
                        />
                        <div className={styles.outputActions}>
                            <button
                                className={styles.actionBtn}
                                onClick={handleCopy}
                            >
                                {copied ? "✅ Copied!" : "📋 Copy"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Info Cards */}
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>💡</div>
                        <div className={styles.infoContent}>
                            <h4>What is Base64?</h4>
                            <p>
                                Base64 encoding converts binary data to ASCII
                                text format, making it safe for transmission
                                over text-based protocols.
                            </p>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>🎯</div>
                        <div className={styles.infoContent}>
                            <h4>Common Uses</h4>
                            <p>
                                Email attachments, data URLs, API
                                authentication, storing binary data in JSON, and
                                embedding images in HTML/CSS.
                            </p>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>⚡</div>
                        <div className={styles.infoContent}>
                            <h4>Pro Tips</h4>
                            <p>
                                Base64 increases data size by ~33%. Supports
                                Unicode, emoji, and all international
                                characters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Base64Converter
