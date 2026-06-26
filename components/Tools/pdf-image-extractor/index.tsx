"use client"

import React, { useState, useRef, useCallback } from "react"
import styles from "./styles.module.css"

const t = (key: string, fallback?: string): string => fallback ?? key

// --- Type definitions ---
interface ImageData {
    id: number
    name: string
    originalName: string
    page: number
    format: string
    size: string
    dimensions: string
    url: string
    thumbnail: string | null
    originalSize?: number
}

interface PdfInfo {
    name: string
    size: string
    pages: string
    images: string
}

interface Settings {
    format: string
    quality: string
    extractAll: boolean
    includeThumbnails: boolean
    maxSize: number
}

// --- Component ---
const PDFImageExtractor = () => {
    const [file, setFile] = useState<File | null>(null)
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [processing, setProcessing] = useState(false)
    const [extractedImages, setExtractedImages] = useState<ImageData[]>([])
    const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null)
    const [settings, setSettings] = useState<Settings>({
        format: "original",
        quality: "high",
        extractAll: true,
        includeThumbnails: false,
        maxSize: 2048,
    })

    const fileInputRef = useRef<HTMLInputElement>(null)

    const API_BASE_URL = "http://localhost:8000"

    const formatOptions = [
        {
            value: "original",
            label: "Original Format",
            description: "Keep images in their original format from PDF",
        },
        {
            value: "jpg",
            label: "JPG",
            description: "Convert to JPG for smaller file sizes",
        },
        {
            value: "jpeg",
            label: "JPEG",
            description: "Convert to JPG for smaller file sizes",
        },
        {
            value: "png",
            label: "PNG",
            description: "Convert to PNG with transparency support",
        },
    ]

    const qualityOptions = [
        {
            value: "high",
            label: "High Quality",
            description: "Best quality, larger file size",
        },
        {
            value: "medium",
            label: "Medium Quality",
            description: "Good balance of quality and size",
        },
        {
            value: "low",
            label: "Low Quality",
            description: "Smaller files, lower quality",
        },
        {
            value: "adaptive",
            label: t("adaptiveQuality"),
            description: t("adaptiveDescription"),
        },
    ]

    // Upload handlers
    const handleFileUpload = useCallback((uploadedFile: File | undefined) => {
        if (!uploadedFile) return

        if (uploadedFile.size > 100 * 1024 * 1024) {
            alert("File too large. Maximum size is 50MB.")
            return
        }

        if (uploadedFile.type !== "application/pdf") {
            alert("Invalid file type. Please upload a PDF document.")
            return
        }

        setFile(uploadedFile)
        setOriginalFile(uploadedFile)
        setExtractedImages([])
        setPdfInfo(null)

        const fileSize = (uploadedFile.size / 1024 / 1024).toFixed(2)
        setPdfInfo({
            name: uploadedFile.name,
            size: fileSize,
            pages: "Unknown",
            images: "Unknown",
        })
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            const uploadedFile = e.dataTransfer.files[0]
            handleFileUpload(uploadedFile)
        },
        [handleFileUpload]
    )

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }, [])

    // Extract images
    const extractImages = async () => {
        if (!file) {
            alert("Please upload a PDF file first")
            return
        }

        setProcessing(true)
        setExtractedImages([])

        try {
            const formData = new FormData()
            formData.append("pdf", file)
            formData.append("format", String(settings.format))
            formData.append("quality", String(settings.quality))
            formData.append("extractAll", settings.extractAll.toString())
            formData.append(
                "includeThumbnails",
                settings.includeThumbnails.toString()
            )
            formData.append("maxSize", settings.maxSize.toString())

            console.log("Sending extraction request with settings:", {
                format: settings.format,
                quality: settings.quality,
                extractAll: settings.extractAll,
                includeThumbnails: settings.includeThumbnails,
                maxSize: settings.maxSize,
            })

            const response = await fetch(`${API_BASE_URL}/extract-pdf-images`, {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ||
                        "Failed to extract images from PDF. Please try again."
                )
            }

            console.log("Extraction successful:", {
                totalImages: data.images?.length,
                totalPages: data.total_pages,
            })

            const processedImages: ImageData[] = data.images.map(
                (img: any, index: number) => ({
                    id: img.id || index + 1,
                    name: img.name,
                    originalName: `Page ${img.page} - Image ${index + 1}`,
                    page: img.page,
                    format: img.format,
                    size: img.size,
                    dimensions: img.dimensions,
                    url: `${API_BASE_URL}${img.url}`,
                    thumbnail: img.thumbnail
                        ? `${API_BASE_URL}${img.thumbnail}`
                        : null,
                    originalSize: img.original_size || 0,
                })
            )

            setExtractedImages(processedImages)
            setPdfInfo((prev) =>
                prev
                    ? {
                          ...prev,
                          pages: data.total_pages?.toString() || "Unknown",
                          images: data.images?.length.toString() || "0",
                      }
                    : null
            )
        } catch (error) {
            console.error("PDF extraction error:", error)
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to extract images from PDF. Please try again."
            )
        } finally {
            setProcessing(false)
        }
    }

    // Download helpers
    const downloadImage = async (image: ImageData) => {
        try {
            const response = await fetch(image.url)
            if (!response.ok)
                throw new Error(`Download failed: ${response.status}`)

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = image.name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Download error:", error)
            alert(t("downloadError"))
        }
    }

    const downloadAllImages = async () => {
        if (extractedImages.length === 0) return
        setProcessing(true)
        try {
            for (const image of extractedImages) {
                await downloadImage(image)
                await new Promise((resolve) => setTimeout(resolve, 200))
            }
        } finally {
            setProcessing(false)
        }
    }

    const downloadSelectedImages = async (selectedIds: number[]) => {
        if (selectedIds.length === 0) return
        setProcessing(true)
        try {
            const selectedImages = extractedImages.filter((img) =>
                selectedIds.includes(img.id)
            )
            for (const image of selectedImages) {
                await downloadImage(image)
                await new Promise((resolve) => setTimeout(resolve, 200))
            }
        } finally {
            setProcessing(false)
        }
    }

    const clearAll = () => {
        setFile(null)
        setOriginalFile(null)
        setExtractedImages([])
        setPdfInfo(null)
        setSelectedImages(new Set())
        setSettings({
            format: "original",
            quality: "high",
            extractAll: true,
            includeThumbnails: false,
            maxSize: 2048,
        })
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Selection state
    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())

    const toggleImageSelection = (imageId: number) => {
        const newSelected = new Set(selectedImages)
        if (newSelected.has(imageId)) {
            newSelected.delete(imageId)
        } else {
            newSelected.add(imageId)
        }
        setSelectedImages(newSelected)
    }

    const selectAllImages = () => {
        if (selectedImages.size === extractedImages.length) {
            setSelectedImages(new Set())
        } else {
            setSelectedImages(new Set(extractedImages.map((img) => img.id)))
        }
    }

    const previewImage = (image: ImageData) => {
        window.open(image.url, "_blank")
    }

    const calculateSummary = () => {
        const totalSize = extractedImages.reduce(
            (acc, img) => acc + (img.originalSize || 0),
            0
        )
        const largestWidth = Math.max(
            ...extractedImages.map((img) => {
                const [width] = img.dimensions.split("x").map(Number)
                return isNaN(width ?? 0) ? 0 : (width ?? 0)
            }),
            0
        )
        const pagesWithImages = new Set(extractedImages.map((img) => img.page))
            .size

        return {
            totalSize: `${Math.round(totalSize / 1024)} KB`,
            largestImage: `${largestWidth}px`,
            pagesWithImages,
        }
    }

    const summary = calculateSummary()

    return (
        <div className={styles["pdf-image-extractor"]}>
            {/* <div className={styles["tool-header"]}>
        <h1>{"PDF Image Extractor"}</h1>
        <p>{"Extract images, diagrams, and graphics from your PDF documents"}</p>
      </div> */}

            <div className={styles["extractor-container"]}>
                {/* Upload Section */}
                <div className={styles["upload-section"]}>
                    <div
                        className={styles["upload-area"]}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {!file ? (
                            <div className={styles["upload-content"]}>
                                <div className={styles["upload-icon"]}>📄</div>
                                <h3>{"Upload PDF Document"}</h3>
                                <p>
                                    {
                                        "Drag & drop your PDF here or click to browse"
                                    }
                                </p>
                                <small>{"Supports: PDF documents"}</small>
                                <small>{"Max file size: 50MB"}</small>
                            </div>
                        ) : (
                            <div className={styles["file-preview"]}>
                                <div className={styles["file-icon"]}>📄</div>
                                <div className={styles["file-info"]}>
                                    <strong>{file.name}</strong>
                                    <div className={styles["file-details"]}>
                                        <span>
                                            📏{" "}
                                            {(file.size / 1024 / 1024).toFixed(
                                                2
                                            )}{" "}
                                            MB
                                        </span>
                                        {pdfInfo && (
                                            <>
                                                <span>
                                                    📑 {pdfInfo.pages} {"pages"}
                                                </span>
                                                <span>
                                                    🖼️ {pdfInfo.images}{" "}
                                                    {"images"}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className={styles["clear-btn"]}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        clearAll()
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) =>
                                handleFileUpload(e.target.files?.[0])
                            }
                            style={{ display: "none" }}
                        />
                    </div>
                </div>

                {/* Settings Section */}
                {file && (
                    <div className={styles["settings-section"]}>
                        <h3>{"Extraction Settings"}</h3>

                        <div className={styles["settings-grid"]}>
                            {/* Format Selection */}
                            <div className={styles["setting-group"]}>
                                <label>{"Output Format"}</label>
                                <div className={styles["format-options"]}>
                                    {formatOptions.map((format) => (
                                        <div
                                            key={format.value}
                                            className={`${styles["format-option"]} ${settings.format === format.value ? styles["active"] : ""}`}
                                            onClick={() =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    format: format.value,
                                                }))
                                            }
                                        >
                                            <div
                                                className={
                                                    styles["format-header"]
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles["format-label"]
                                                    }
                                                >
                                                    {format.label}
                                                </span>
                                            </div>
                                            <p
                                                className={
                                                    styles["format-description"]
                                                }
                                            >
                                                {format.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quality Settings */}
                            <div className={styles["setting-group"]}>
                                <label>{"Image Quality"}</label>
                                <div className={styles["quality-options"]}>
                                    {qualityOptions.map((quality) => (
                                        <div
                                            key={quality.value}
                                            className={`${styles["quality-option"]} ${settings.quality === quality.value ? styles["active"] : ""}`}
                                            onClick={() =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    quality: quality.value,
                                                }))
                                            }
                                        >
                                            <span
                                                className={
                                                    styles["quality-label"]
                                                }
                                            >
                                                {quality.label}
                                            </span>
                                            <span
                                                className={
                                                    styles[
                                                        "quality-description"
                                                    ]
                                                }
                                            >
                                                {quality.description}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Extraction Options */}
                            <div className={styles["setting-group"]}>
                                <label>{"Extraction Options"}</label>
                                <div className={styles["checkbox-options"]}>
                                    <label className={styles["checkbox-label"]}>
                                        <input
                                            type="checkbox"
                                            checked={settings.extractAll}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    extractAll:
                                                        e.target.checked,
                                                }))
                                            }
                                        />
                                        <span
                                            className={styles["checkmark"]}
                                        ></span>
                                        {"Extract all images from PDF"}
                                        <small
                                            className={styles["option-hint"]}
                                        >
                                            {t("extractAllHint")}
                                        </small>
                                    </label>

                                    <label className={styles["checkbox-label"]}>
                                        <input
                                            type="checkbox"
                                            checked={settings.includeThumbnails}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    includeThumbnails:
                                                        e.target.checked,
                                                }))
                                            }
                                        />
                                        <span
                                            className={styles["checkmark"]}
                                        ></span>
                                        {"Include thumbnail images"}
                                        <small
                                            className={styles["option-hint"]}
                                        >
                                            {t("thumbnailsHint")}
                                        </small>
                                    </label>
                                </div>
                            </div>

                            {/* Advanced Settings */}
                            <div className={styles["setting-group"]}>
                                <label>{"Advanced Settings"}</label>
                                <div className={styles["advanced-options"]}>
                                    <div className={styles["option-row"]}>
                                        <label htmlFor="maxSizeSlider">
                                            {"Maximum Dimension"}:{" "}
                                            <strong>
                                                {settings.maxSize}px
                                            </strong>
                                        </label>
                                        <input
                                            id="maxSizeSlider"
                                            type="range"
                                            min="256"
                                            max="4096"
                                            step="128"
                                            value={settings.maxSize}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    maxSize: parseInt(
                                                        e.target.value
                                                    ),
                                                }))
                                            }
                                            className={styles["slider"]}
                                        />
                                        <div className={styles["size-labels"]}>
                                            <span>256px</span>
                                            <span>2048px</span>
                                            <span>4096px</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extract Button */}
                        <div className={styles["extract-section"]}>
                            <button
                                onClick={extractImages}
                                className={`${styles["extract-btn"]} ${processing ? "processing" : ""}`}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span
                                            className={styles["spinner"]}
                                        ></span>
                                        {"Extracting images..."}...
                                    </>
                                ) : (
                                    <>
                                        <span
                                            className={styles["extract-icon"]}
                                        >
                                            🔍
                                        </span>
                                        {"Extract Images"}
                                    </>
                                )}
                            </button>

                            {processing && (
                                <div className={styles["processing-info"]}>
                                    <small>{t("aiProcessing")} 🤖</small>
                                    <div className={styles["progress-bar"]}>
                                        <div
                                            className={styles["progress-fill"]}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {extractedImages.length > 0 && (
                    <div className={styles["results-section"]}>
                        <div className={styles["results-header"]}>
                            <div className={styles["results-info"]}>
                                <h3>
                                    {"Extracted Images"} (
                                    {extractedImages.length})
                                </h3>
                                <p className={styles["results-description"]}>
                                    {
                                        "All images and diagrams found in your PDF"
                                    }
                                </p>
                            </div>
                            <div className={styles["results-actions"]}>
                                <div className={styles["selection-info"]}>
                                    {selectedImages.size > 0 && (
                                        <span
                                            className={styles["selected-count"]}
                                        >
                                            {selectedImages.size} {"selected"}
                                        </span>
                                    )}
                                </div>
                                <div className={styles["action-buttons"]}>
                                    {selectedImages.size > 0 && (
                                        <button
                                            onClick={() =>
                                                downloadSelectedImages(
                                                    Array.from(selectedImages)
                                                )
                                            }
                                            className={`${styles["action-btn"]} ${styles["primary"]}`}
                                            disabled={processing}
                                        >
                                            ⬇️ {"Download Selected"} (
                                            {selectedImages.size})
                                        </button>
                                    )}
                                    <button
                                        onClick={downloadAllImages}
                                        className={`${styles["action-btn"]} ${styles["secondary"]}`}
                                        disabled={processing}
                                    >
                                        📦 {"Download All"}
                                    </button>
                                    <button
                                        onClick={selectAllImages}
                                        className={`${styles["action-btn"]} ${styles["outline"]}`}
                                    >
                                        {selectedImages.size ===
                                        extractedImages.length
                                            ? "Deselect All"
                                            : "Select All"}
                                    </button>
                                    <button
                                        onClick={clearAll}
                                        className={`${styles["action-btn"]} ${styles["danger"]}`}
                                    >
                                        🗑️ {t("clearAll")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles["images-grid"]}>
                            {extractedImages.map((image) => (
                                <div
                                    key={image.id}
                                    className={`${styles["image-card"]} ${selectedImages.has(image.id) ? "selected" : ""}`}
                                    onClick={() =>
                                        toggleImageSelection(image.id)
                                    }
                                >
                                    <div className={styles["image-checkbox"]}>
                                        <input
                                            type="checkbox"
                                            checked={selectedImages.has(
                                                image.id
                                            )}
                                            onChange={() =>
                                                toggleImageSelection(image.id)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className={styles["image-preview"]}>
                                        <img
                                            src={image.thumbnail || image.url}
                                            alt={image.originalName}
                                            loading="lazy"
                                            onError={(e) => {
                                                ;(
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmM2YzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFByZXZpZXc8L3RleHQ+PC9zdmc+"
                                            }}
                                        />
                                        <div
                                            className={styles["image-overlay"]}
                                        >
                                            <button
                                                className={
                                                    styles["preview-btn"]
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    previewImage(image)
                                                }}
                                            >
                                                🔍 {"Preview"}
                                            </button>
                                            <button
                                                className={
                                                    styles["download-btn"]
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    downloadImage(image)
                                                }}
                                            >
                                                ⬇️
                                            </button>
                                        </div>
                                        <div className={styles["image-badge"]}>
                                            {image.format.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className={styles["image-info"]}>
                                        <div className={styles["image-meta"]}>
                                            <span
                                                className={styles["image-name"]}
                                            >
                                                {image.originalName}
                                            </span>
                                        </div>
                                        <div
                                            className={styles["image-details"]}
                                        >
                                            <span
                                                className={styles["image-page"]}
                                            >
                                                📄 {"Page"} {image.page}
                                            </span>
                                            <span
                                                className={styles["image-size"]}
                                            >
                                                💾 {image.size}
                                            </span>
                                            <span
                                                className={
                                                    styles["image-dimensions"]
                                                }
                                            >
                                                📐 {image.dimensions}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Section */}
                        <div className={styles["summary-section"]}>
                            <div className={styles["summary-card"]}>
                                <h4>📊 {"Extraction Summary"}</h4>
                                <div className={styles["summary-stats"]}>
                                    <div className={styles["stat"]}>
                                        <span className={styles["stat-value"]}>
                                            {extractedImages.length}
                                        </span>
                                        <span className={styles["stat-label"]}>
                                            {"Total Images"}
                                        </span>
                                    </div>
                                    <div className={styles["stat"]}>
                                        <span className={styles["stat-value"]}>
                                            {summary.totalSize}
                                        </span>
                                        <span className={styles["stat-label"]}>
                                            {"Total Size"}
                                        </span>
                                    </div>
                                    <div className={styles["stat"]}>
                                        <span className={styles["stat-value"]}>
                                            {summary.largestImage}
                                        </span>
                                        <span className={styles["stat-label"]}>
                                            {"Largest Image"}
                                        </span>
                                    </div>
                                    <div className={styles["stat"]}>
                                        <span className={styles["stat-value"]}>
                                            {summary.pagesWithImages}
                                        </span>
                                        <span className={styles["stat-label"]}>
                                            {"Pages with Images"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tips Section */}
                {!extractedImages.length && (
                    <div className={styles["tips-section"]}>
                        <h3>💡 {"Best Practices & Tips"}</h3>
                        <div className={styles["tips-list"]}>
                            <div className={styles["tip-item"]}>
                                <span className={styles["tip-icon"]}>🤖</span>
                                <div>
                                    <strong>{t("tipAITitle")}</strong>
                                    <p>{t("tipAIDescription")}</p>
                                </div>
                            </div>
                            <div className={styles["tip-item"]}>
                                <span className={styles["tip-icon"]}>🎯</span>
                                <div>
                                    <strong>{t("tipQualityTitle")}</strong>
                                    <p>{t("tipQualityDescription")}</p>
                                </div>
                            </div>
                            <div className={styles["tip-item"]}>
                                <span className={styles["tip-icon"]}>📐</span>
                                <div>
                                    <strong>{t("tipSizeTitle")}</strong>
                                    <p>{t("tipSizeDescription")}</p>
                                </div>
                            </div>
                            <div className={styles["tip-item"]}>
                                <span className={styles["tip-icon"]}>⚡</span>
                                <div>
                                    <strong>{t("tipPerformanceTitle")}</strong>
                                    <p>{t("tipPerformanceDescription")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Section */}
                <div className={styles["status-section"]}>
                    <div className={styles["status-indicator"]}>
                        <div
                            className={`${styles["status-dot"]} ${processing ? "processing" : extractedImages.length > 0 ? "success" : "ready"}`}
                        ></div>
                        <span>
                            {processing
                                ? "Extracting images from PDF..."
                                : extractedImages.length > 0
                                  ? "Images extracted successfully"
                                  : "Ready to extract images"}
                        </span>
                    </div>
                    {extractedImages.length > 0 && (
                        <div className={styles["api-status"]}>
                            <small>✅ {t("connectedToAPI")}</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PDFImageExtractor
