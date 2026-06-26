"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import styles from "./styles.module.css"

interface Thumbnail {
    id: string
    timestamp: number
    timeFormatted: string
    url: string
    blob: Blob
    width: number
    height: number
}

interface VideoInfo {
    duration: number
    width: number
    height: number
    size: number
    name: string
}

const VideoThumbnailGenerator: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoUrl, setVideoUrl] = useState<string>("")
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
    const [thumbnailCount, setThumbnailCount] = useState<number>(10)
    const [selectedFormat, setSelectedFormat] = useState<string>("png")
    const [customTimestamp, setCustomTimestamp] = useState<number>(0)
    const [isGenerating, setIsGenerating] = useState<boolean>(false)
    const [progress, setProgress] = useState<number>(0)
    const [activeTab, setActiveTab] = useState<string>("upload")
    const [dragActive, setDragActive] = useState<boolean>(false)
    const [quality, setQuality] = useState<number>(90)
    const [width, setWidth] = useState<number>(640)
    const [height, setHeight] = useState<number>(360)
    const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const customVideoRef = useRef<HTMLVideoElement>(null)

    // Format options
    const formatOptions = [
        {
            value: "png",
            label: "PNG",
            description: "Best quality, larger size",
            icon: "🖼️",
        },
        {
            value: "jpeg",
            label: "JPEG",
            description: "Good quality, smaller size",
            icon: "📷",
        },
        {
            value: "webp",
            label: "WebP",
            description: "Modern format, balanced",
            icon: "🌐",
        },
    ]

    // Handle file upload (fixed signature to accept undefined)
    const handleFileUpload = useCallback((uploadedFile: File | undefined) => {
        if (!uploadedFile) return

        if (!uploadedFile.type.startsWith("video/")) {
            alert("Please upload a valid video file")
            return
        }

        if (uploadedFile.size > 200 * 1024 * 1024) {
            alert("File size should be less than 200MB")
            return
        }

        setVideoFile(uploadedFile)
        setThumbnails([])
        setProgress(0)

        const url = URL.createObjectURL(uploadedFile)
        setVideoUrl(url)

        // Get video info
        const video = document.createElement("video")
        video.preload = "metadata"
        video.src = url

        video.onloadedmetadata = () => {
            setVideoInfo({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                size: uploadedFile.size,
                name: uploadedFile.name,
            })

            // Set initial dimensions
            setWidth(video.videoWidth)
            setHeight(video.videoHeight)
        }

        setActiveTab("adjust")
    }, [])

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setDragActive(false)

            const droppedFile = e.dataTransfer.files[0]
            handleFileUpload(droppedFile) // Now accepts undefined, so no error
        },
        [handleFileUpload]
    )

    // Format time from seconds to MM:SS or HH:MM:SS
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`
    }

    // Generate thumbnails at specific timestamps
    const generateThumbnails = async () => {
        if (!videoFile || !videoInfo) return

        setIsGenerating(true)
        setThumbnails([])

        const video = videoRef.current
        if (!video) return

        video.src = videoUrl
        await new Promise((resolve) => {
            video.onloadeddata = resolve
        })

        // Calculate timestamps
        const timestamps: number[] = []
        const interval = videoInfo.duration / (thumbnailCount + 1)

        for (let i = 1; i <= thumbnailCount; i++) {
            timestamps.push(interval * i)
        }

        const generatedThumbnails: Thumbnail[] = []

        for (let i = 0; i < timestamps.length; i++) {
            const timestamp = timestamps[i]
            // Guard against undefined (though loop ensures it's a number)
            if (timestamp === undefined) continue

            // Seek to timestamp
            video.currentTime = timestamp
            await new Promise((resolve) => {
                video.onseeked = resolve
            })

            // Capture frame
            const canvas = canvasRef.current
            if (!canvas) continue

            // Calculate dimensions maintaining aspect ratio
            const outputWidth = width
            let outputHeight = height

            if (keepAspectRatio && videoInfo) {
                const aspectRatio = videoInfo.width / videoInfo.height
                outputHeight = Math.round(outputWidth / aspectRatio)
            }

            canvas.width = outputWidth
            canvas.height = outputHeight

            const ctx = canvas.getContext("2d")
            ctx?.drawImage(video, 0, 0, outputWidth, outputHeight)

            // Convert to selected format
            const mimeType = `image/${selectedFormat}`
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), mimeType, quality / 100)
            })

            const url = URL.createObjectURL(blob)

            generatedThumbnails.push({
                id: `thumb_${timestamp}`,
                timestamp, // Now definitely a number
                timeFormatted: formatTime(timestamp),
                url,
                blob,
                width: outputWidth,
                height: outputHeight,
            })

            setProgress(((i + 1) / timestamps.length) * 100)
        }

        setThumbnails(generatedThumbnails)
        setIsGenerating(false)
        setActiveTab("results")
    }

    // Capture custom frame at specific timestamp
    const captureCustomFrame = async () => {
        if (!videoFile || !videoInfo) return

        const video = customVideoRef.current
        if (!video) return

        video.src = videoUrl
        await new Promise((resolve) => {
            video.onloadeddata = resolve
        })

        video.currentTime = customTimestamp
        await new Promise((resolve) => {
            video.onseeked = resolve
        })

        const canvas = canvasRef.current
        if (!canvas) return

        // Calculate dimensions
        const outputWidth = width
        let outputHeight = height

        if (keepAspectRatio && videoInfo) {
            const aspectRatio = videoInfo.width / videoInfo.height
            outputHeight = Math.round(outputWidth / aspectRatio)
        }

        canvas.width = outputWidth
        canvas.height = outputHeight

        const ctx = canvas.getContext("2d")
        ctx?.drawImage(video, 0, 0, outputWidth, outputHeight)

        const mimeType = `image/${selectedFormat}`
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), mimeType, quality / 100)
        })

        const url = URL.createObjectURL(blob)

        const customThumbnail: Thumbnail = {
            id: `custom_${customTimestamp}`,
            timestamp: customTimestamp,
            timeFormatted: formatTime(customTimestamp),
            url,
            blob,
            width: outputWidth,
            height: outputHeight,
        }

        setThumbnails((prev) => [...prev, customThumbnail])
    }

    // Download single thumbnail
    const downloadThumbnail = (thumbnail: Thumbnail) => {
        const link = document.createElement("a")
        const filename = `thumbnail_${thumbnail.timeFormatted.replace(/:/g, "-")}.${selectedFormat}`
        link.download = filename
        link.href = thumbnail.url
        link.click()
    }

    // Download all thumbnails as ZIP
    const downloadAllThumbnails = async () => {
        const JSZip = (await import("jszip")).default
        const zip = new JSZip()

        thumbnails.forEach((thumbnail, index) => {
            const filename = `thumbnail_${index + 1}_${thumbnail.timeFormatted.replace(/:/g, "-")}.${selectedFormat}`
            zip.file(filename, thumbnail.blob)
        })

        const content = await zip.generateAsync({ type: "blob" })
        const link = document.createElement("a")
        link.download = `thumbnails_${Date.now()}.zip`
        link.href = URL.createObjectURL(content)
        link.click()
    }

    // Reset all
    const resetAll = () => {
        setVideoFile(null)
        setVideoUrl("")
        setVideoInfo(null)
        setThumbnails([])
        setProgress(0)
        setCustomTimestamp(0)
        setThumbnailCount(10)
        setWidth(640)
        setHeight(360)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            {/* <div className={styles.hero}>
        <div className={styles.heroBadge}>🎬 Smart Thumbnail Generator</div>
        <h1 className={styles.heroTitle}>Video Thumbnail Generator</h1>
        <p className={styles.heroSubtitle}>
          Extract high-quality thumbnails from any video. Perfect for YouTube, social media, and content creation.
        </p>
      </div> */}

            {/* Tab Navigation */}
            <div className={styles.tabBar}>
                <button
                    className={`${styles.tab} ${activeTab === "upload" ? styles.active : ""}`}
                    onClick={() => setActiveTab("upload")}
                >
                    📤 Upload
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "adjust" ? styles.active : ""}`}
                    onClick={() => setActiveTab("adjust")}
                    disabled={!videoFile}
                >
                    ⚙️ Adjust
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "results" ? styles.active : ""}`}
                    onClick={() => setActiveTab("results")}
                    disabled={thumbnails.length === 0}
                >
                    🖼️ Results
                </button>
            </div>

            <div className={styles.main}>
                {/* Upload Tab */}
                {activeTab === "upload" && (
                    <div className={styles.uploadTab}>
                        <div
                            className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={styles.uploadIcon}>🎬</div>
                            <h3>Upload Video</h3>
                            <p>Drag & drop or click to browse</p>
                            <small>
                                Supports MP4, WebM, AVI, MOV (Max 200MB)
                            </small>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={(e) =>
                                    handleFileUpload(e.target.files?.[0])
                                }
                                style={{ display: "none" }}
                            />
                        </div>

                        <div className={styles.infoBox}>
                            <div className={styles.infoIcon}>💡</div>
                            <div className={styles.infoContent}>
                                <h4>Tips for best results</h4>
                                <ul>
                                    <li>
                                        Use high-quality source videos for
                                        better thumbnails
                                    </li>
                                    <li>
                                        Choose key moments in your video for
                                        thumbnails
                                    </li>
                                    <li>
                                        PNG format gives best quality, JPEG is
                                        more compact
                                    </li>
                                    <li>
                                        Adjust quality and dimensions for
                                        optimal results
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Adjust Tab */}
                {activeTab === "adjust" && videoInfo && (
                    <div className={styles.adjustTab}>
                        {/* Video Preview */}
                        <div className={styles.videoPreview}>
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                controls
                                className={styles.videoPlayer}
                            />
                            <div className={styles.videoInfo}>
                                <div className={styles.infoRow}>
                                    <span>📹 {videoInfo.name}</span>
                                    <span>
                                        ⏱️ {formatTime(videoInfo.duration)}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>
                                        📐 {videoInfo.width}×{videoInfo.height}
                                    </span>
                                    <span>
                                        💾 {formatFileSize(videoInfo.size)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <div className={styles.settingsPanel}>
                            <div className={styles.settingsSection}>
                                <h3>Thumbnail Settings</h3>

                                <div className={styles.controlGroup}>
                                    <label>
                                        Number of Thumbnails: {thumbnailCount}
                                    </label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="20"
                                        value={thumbnailCount}
                                        onChange={(e) =>
                                            setThumbnailCount(
                                                parseInt(e.target.value)
                                            )
                                        }
                                    />
                                    <div className={styles.rangeLabels}>
                                        <span>5</span>
                                        <span>10</span>
                                        <span>15</span>
                                        <span>20</span>
                                    </div>
                                </div>

                                <div className={styles.controlGroup}>
                                    <label>Thumbnail Quality: {quality}%</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={quality}
                                        onChange={(e) =>
                                            setQuality(parseInt(e.target.value))
                                        }
                                    />
                                </div>

                                <div className={styles.controlGroup}>
                                    <label>Output Format</label>
                                    <div className={styles.formatGrid}>
                                        {formatOptions.map((opt) => (
                                            <div
                                                key={opt.value}
                                                className={`${styles.formatCard} ${selectedFormat === opt.value ? styles.active : ""}`}
                                                onClick={() =>
                                                    setSelectedFormat(opt.value)
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.formatIcon
                                                    }
                                                >
                                                    {opt.icon}
                                                </span>
                                                <span
                                                    className={
                                                        styles.formatName
                                                    }
                                                >
                                                    {opt.label}
                                                </span>
                                                <span
                                                    className={
                                                        styles.formatDesc
                                                    }
                                                >
                                                    {opt.description}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.settingsSection}>
                                <h3>Dimensions</h3>

                                <div className={styles.controlGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={keepAspectRatio}
                                            onChange={(e) =>
                                                setKeepAspectRatio(
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <span>Maintain Aspect Ratio</span>
                                    </label>
                                </div>

                                <div className={styles.dimensionControls}>
                                    <div className={styles.dimensionInput}>
                                        <label>Width (px)</label>
                                        <input
                                            type="number"
                                            value={width}
                                            onChange={(e) => {
                                                const newWidth = parseInt(
                                                    e.target.value
                                                )
                                                setWidth(newWidth)
                                                if (
                                                    keepAspectRatio &&
                                                    videoInfo
                                                ) {
                                                    const aspectRatio =
                                                        videoInfo.width /
                                                        videoInfo.height
                                                    setHeight(
                                                        Math.round(
                                                            newWidth /
                                                                aspectRatio
                                                        )
                                                    )
                                                }
                                            }}
                                            min="100"
                                            max="1920"
                                        />
                                    </div>
                                    <div className={styles.dimensionInput}>
                                        <label>Height (px)</label>
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => {
                                                const newHeight = parseInt(
                                                    e.target.value
                                                )
                                                setHeight(newHeight)
                                                if (
                                                    keepAspectRatio &&
                                                    videoInfo
                                                ) {
                                                    const aspectRatio =
                                                        videoInfo.width /
                                                        videoInfo.height
                                                    setWidth(
                                                        Math.round(
                                                            newHeight *
                                                                aspectRatio
                                                        )
                                                    )
                                                }
                                            }}
                                            min="100"
                                            max="1080"
                                        />
                                    </div>
                                </div>

                                <div className={styles.presetButtons}>
                                    <button
                                        onClick={() => {
                                            setWidth(320)
                                            setHeight(180)
                                        }}
                                    >
                                        240p
                                    </button>
                                    <button
                                        onClick={() => {
                                            setWidth(640)
                                            setHeight(360)
                                        }}
                                    >
                                        360p
                                    </button>
                                    <button
                                        onClick={() => {
                                            setWidth(854)
                                            setHeight(480)
                                        }}
                                    >
                                        480p
                                    </button>
                                    <button
                                        onClick={() => {
                                            setWidth(1280)
                                            setHeight(720)
                                        }}
                                    >
                                        720p
                                    </button>
                                    <button
                                        onClick={() => {
                                            setWidth(1920)
                                            setHeight(1080)
                                        }}
                                    >
                                        1080p
                                    </button>
                                </div>
                            </div>

                            <div className={styles.settingsSection}>
                                <h3>Custom Frame Capture</h3>
                                <div className={styles.customFrame}>
                                    <input
                                        type="range"
                                        min="0"
                                        max={videoInfo.duration}
                                        step="0.1"
                                        value={customTimestamp}
                                        onChange={(e) =>
                                            setCustomTimestamp(
                                                parseFloat(e.target.value)
                                            )
                                        }
                                    />
                                    <div className={styles.timestampDisplay}>
                                        <span>
                                            Timestamp:{" "}
                                            {formatTime(customTimestamp)}
                                        </span>
                                        <button
                                            onClick={captureCustomFrame}
                                            className={styles.captureBtn}
                                        >
                                            🎯 Capture This Frame
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                className={styles.generateBtn}
                                onClick={generateThumbnails}
                            >
                                🎬 Generate Thumbnails
                            </button>
                        </div>

                        {/* Hidden Canvas for Capture */}
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                        <video
                            ref={customVideoRef}
                            style={{ display: "none" }}
                        />
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === "results" && thumbnails.length > 0 && (
                    <div className={styles.resultsTab}>
                        {/* Thumbnail Grid */}
                        <div className={styles.thumbnailGrid}>
                            {thumbnails.map((thumbnail, index) => (
                                <div
                                    key={thumbnail.id}
                                    className={styles.thumbnailCard}
                                >
                                    <div className={styles.thumbnailTime}>
                                        ⏱️ {thumbnail.timeFormatted}
                                    </div>
                                    <img
                                        src={thumbnail.url}
                                        alt={`Thumbnail at ${thumbnail.timeFormatted}`}
                                        className={styles.thumbnailImage}
                                    />
                                    <div className={styles.thumbnailInfo}>
                                        <span>
                                            📐 {thumbnail.width}×
                                            {thumbnail.height}
                                        </span>
                                        <span>
                                            💾{" "}
                                            {formatFileSize(
                                                thumbnail.blob.size
                                            )}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.downloadThumbBtn}
                                        onClick={() =>
                                            downloadThumbnail(thumbnail)
                                        }
                                    >
                                        ⬇️ Download
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Bulk Actions */}
                        {thumbnails.length > 1 && (
                            <div className={styles.bulkActions}>
                                <button
                                    className={styles.downloadAllBtn}
                                    onClick={downloadAllThumbnails}
                                >
                                    📦 Download All ({thumbnails.length}{" "}
                                    thumbnails)
                                </button>
                                <button
                                    className={styles.resetBtn}
                                    onClick={resetAll}
                                >
                                    🔄 New Video
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Processing Overlay */}
                {isGenerating && (
                    <div className={styles.processingOverlay}>
                        <div className={styles.processingCard}>
                            <div className={styles.spinner}></div>
                            <h3>Generating Thumbnails...</h3>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p>{Math.round(progress)}% complete</p>
                            <small>Processing {thumbnailCount} frames</small>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden video element for thumbnail generation */}
            <video ref={videoRef} style={{ display: "none" }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    )
}

export default VideoThumbnailGenerator
