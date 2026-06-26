"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import styles from "./styles.module.css"

interface Platform {
    id: string
    name: string
    icon: string
    size: number
    aspect: string
    dimensions: string
    quality: number
    bgColor: string
}

interface ProcessedImage {
    url: string
    blob: Blob
    size: number
    dimensions: string
    platformId: string
}

interface FaceDetection {
    x: number
    y: number
    width: number
    height: number
}

const ProfilePicOptimizer: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null)
    const [originalUrl, setOriginalUrl] = useState<string>("")
    const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
    const [processing, setProcessing] = useState<boolean>(false)
    const [faceDetection, setFaceDetection] = useState<boolean>(true)
    const [bgPadding, setBgPadding] = useState<number>(10)
    const [bgColor, setBgColor] = useState<string>("#ffffff")
    const [zoomLevel, setZoomLevel] = useState<number>(1)
    const [faceDetected, setFaceDetected] = useState<FaceDetection | null>(null)
    const [progress, setProgress] = useState<number>(0)
    const [activeTab, setActiveTab] = useState<string>("upload")

    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    // Platform specifications
    const platforms: Platform[] = [
        {
            id: "whatsapp",
            name: "WhatsApp",
            icon: "💬",
            size: 500,
            aspect: "1:1",
            dimensions: "500x500",
            quality: 85,
            bgColor: "#25D366",
        },
        {
            id: "instagram",
            name: "Instagram",
            icon: "📸",
            size: 320,
            aspect: "1:1",
            dimensions: "320x320",
            quality: 90,
            bgColor: "#E4405F",
        },
        {
            id: "facebook",
            name: "Facebook",
            icon: "👍",
            size: 720,
            aspect: "1:1",
            dimensions: "720x720",
            quality: 85,
            bgColor: "#1877F2",
        },
        {
            id: "snapchat",
            name: "Snapchat",
            icon: "👻",
            size: 360,
            aspect: "1:1",
            dimensions: "360x360",
            quality: 80,
            bgColor: "#FFFC00",
        },
        {
            id: "twitter",
            name: "Twitter",
            icon: "🐦",
            size: 400,
            aspect: "1:1",
            dimensions: "400x400",
            quality: 85,
            bgColor: "#1DA1F2",
        },
        {
            id: "linkedin",
            name: "LinkedIn",
            icon: "🔗",
            size: 400,
            aspect: "1:1",
            dimensions: "400x400",
            quality: 90,
            bgColor: "#0A66C2",
        },
    ]

    // Load face-api.js for face detection
    useEffect(() => {
        const loadFaceApi = async () => {
            if (faceDetection && originalImage) {
                // Dynamically load face-api.js
                const script = document.createElement("script")
                script.src =
                    "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
                script.async = true
                document.body.appendChild(script)

                script.onload = async () => {
                    try {
                        // Load models from CDN
                        const MODEL_URL =
                            "https://justadudewhohacks.github.io/face-api.js/models"
                        await Promise.all([
                            (
                                window as any
                            ).faceapi?.nets.tinyFaceDetector.loadFromUri(
                                MODEL_URL
                            ),
                            (
                                window as any
                            ).faceapi?.nets.faceLandmark68Net.loadFromUri(
                                MODEL_URL
                            ),
                        ])
                    } catch (error) {
                        console.error(
                            "Failed to load face detection models:",
                            error
                        )
                    }
                }
            }
        }
        loadFaceApi()
    }, [faceDetection, originalImage])

    const handleFileUpload = useCallback(
        async (uploadedFile: File | null) => {
            if (!uploadedFile) return

            if (uploadedFile.size > 10 * 1024 * 1024) {
                alert("File size should be less than 10MB")
                return
            }

            if (!uploadedFile.type.startsWith("image/")) {
                alert("Please upload a valid image file")
                return
            }

            setOriginalImage(uploadedFile)
            setProcessedImages([])
            setProgress(0)
            setActiveTab("adjust")

            const reader = new FileReader()
            reader.onload = async (e) => {
                const imageUrl = e.target?.result as string
                setOriginalUrl(imageUrl)

                // Auto-detect face
                if (faceDetection) {
                    await detectFace(imageUrl)
                }
            }
            reader.readAsDataURL(uploadedFile)
        },
        [faceDetection]
    )

    const detectFace = async (imageUrl: string): Promise<void> => {
        if (!(window as any).faceapi) return

        const img = new Image()
        img.src = imageUrl
        await new Promise((resolve) => {
            img.onload = resolve
        })

        try {
            const detections = await (window as any).faceapi.detectAllFaces(
                img,
                new (window as any).faceapi.TinyFaceDetectorOptions()
            )

            if (detections && detections.length > 0) {
                const face = detections[0].box
                setFaceDetected({
                    x: face.x,
                    y: face.y,
                    width: face.width,
                    height: face.height,
                })
            }
        } catch (error) {
            console.error("Face detection failed:", error)
        }
    }

    const processImage = async (
        img: HTMLImageElement,
        platform: Platform,
        face: FaceDetection | null
    ): Promise<Blob> => {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")!

            const targetSize = platform.size
            canvas.width = targetSize
            canvas.height = targetSize

            // Calculate crop area based on face detection or center crop
            let sourceX = 0
            let sourceY = 0
            let sourceWidth = img.width
            let sourceHeight = img.height

            if (face && faceDetection) {
                // Use face detection for smart cropping
                const padding = bgPadding / 100
                const cropSize =
                    Math.max(face.width, face.height) * (1 + padding * 2)
                sourceX = Math.max(0, face.x + face.width / 2 - cropSize / 2)
                sourceY = Math.max(0, face.y + face.height / 2 - cropSize / 2)
                sourceWidth = Math.min(img.width - sourceX, cropSize)
                sourceHeight = Math.min(img.height - sourceY, cropSize)
            } else {
                // Center crop to square
                const cropSize = Math.min(img.width, img.height)
                sourceX = (img.width - cropSize) / 2
                sourceY = (img.height - cropSize) / 2
                sourceWidth = cropSize
                sourceHeight = cropSize
            }

            // Apply zoom
            const zoomedWidth = sourceWidth / zoomLevel
            const zoomedHeight = sourceHeight / zoomLevel
            const zoomedX = sourceX + (sourceWidth - zoomedWidth) / 2
            const zoomedY = sourceY + (sourceHeight - zoomedHeight) / 2

            // Clear canvas with background color
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, targetSize, targetSize)

            // Calculate draw area with padding
            const paddingPercent = bgPadding / 100
            const drawSize = targetSize * (1 - paddingPercent * 2)
            const drawX = targetSize * paddingPercent
            const drawY = targetSize * paddingPercent

            // Draw image
            ctx.drawImage(
                img,
                zoomedX,
                zoomedY,
                zoomedWidth,
                zoomedHeight,
                drawX,
                drawY,
                drawSize,
                drawSize
            )

            // Apply Instagram-specific vignette effect
            if (platform.id === "instagram") {
                const gradient = ctx.createRadialGradient(
                    targetSize / 2,
                    targetSize / 2,
                    (targetSize / 2) * 0.5,
                    targetSize / 2,
                    targetSize / 2,
                    targetSize / 2
                )
                gradient.addColorStop(0, "rgba(0,0,0,0)")
                gradient.addColorStop(1, "rgba(0,0,0,0.15)")
                ctx.fillStyle = gradient
                ctx.fillRect(0, 0, targetSize, targetSize)
            }

            canvas.toBlob(
                (blob) => resolve(blob!),
                "image/jpeg",
                platform.quality / 100
            )
        })
    }

    const processAllPlatforms = async () => {
        if (!originalUrl) return

        setProcessing(true)
        setProgress(0)

        const img = new Image()
        img.src = originalUrl
        await new Promise((resolve) => {
            img.onload = resolve
        })

        const platformsToProcess =
            selectedPlatform === "all"
                ? platforms
                : platforms.filter((p) => p.id === selectedPlatform)

        const results: ProcessedImage[] = []
        let face = faceDetected

        // Try face detection again if not detected
        if (!face && faceDetection && (window as any).faceapi) {
            await detectFace(originalUrl)
            face = faceDetected
        }

        for (let i = 0; i < platformsToProcess.length; i++) {
            const platform: any = platformsToProcess[i]
            try {
                const blob = await processImage(img, platform, face)
                const url = URL.createObjectURL(blob)

                results.push({
                    url,
                    blob,
                    size: blob.size,
                    dimensions: platform.dimensions,
                    platformId: platform.id,
                })

                setProgress(((i + 1) / platformsToProcess.length) * 100)
            } catch (error) {
                console.error(`Error processing ${platform.name}:`, error)
            }
        }

        setProcessedImages(results)
        setProcessing(false)
        setActiveTab("results")
    }

    const downloadImage = (image: ProcessedImage) => {
        const link = document.createElement("a")
        const platform = platforms.find((p) => p.id === image.platformId)
        link.download = `profile_${image.platformId}_${Date.now()}.jpg`
        link.href = image.url
        link.click()
    }

    const downloadAll = () => {
        processedImages.forEach((image) => {
            setTimeout(() => downloadImage(image), 100)
        })
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const filteredPlatforms =
        selectedPlatform === "all"
            ? platforms
            : platforms.filter((p) => p.id === selectedPlatform)

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            {/* <div className={styles.hero}>
        <div className={styles.heroBadge}>✨ Smart Optimizer</div>
        <h1 className={styles.heroTitle}>Profile Picture Optimizer</h1>
        <p className={styles.heroSubtitle}>
          Create perfectly sized profile pictures for all social media platforms with AI-powered face detection
        </p>
      </div> */}

            {/* Tab Navigation */}
            <div className={styles.tabBar}>
                <button
                    className={`${styles.tab} ${activeTab === "upload" ? styles.active : ""}`}
                    onClick={() => setActiveTab("upload")}
                >
                    📸 Upload
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "adjust" ? styles.active : ""}`}
                    onClick={() => setActiveTab("adjust")}
                    disabled={!originalImage}
                >
                    🎨 Adjust
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "results" ? styles.active : ""}`}
                    onClick={() => setActiveTab("results")}
                    disabled={processedImages.length === 0}
                >
                    📱 Results
                </button>
            </div>

            <div className={styles.main}>
                {/* Upload Tab */}
                {activeTab === "upload" && (
                    <div className={styles.uploadTab}>
                        <div
                            className={styles.uploadArea}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={styles.uploadIcon}>📸</div>
                            <h3>Upload Your Photo</h3>
                            <p>Drag & drop or click to browse</p>
                            <small>Supports JPG, PNG, WebP (Max 10MB)</small>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    handleFileUpload(
                                        e.target.files?.[0] || null
                                    )
                                }
                                style={{ display: "none" }}
                            />
                        </div>

                        <div className={styles.infoBox}>
                            <div className={styles.infoIcon}>💡</div>
                            <div className={styles.infoContent}>
                                <h4>Tips for best results</h4>
                                <ul>
                                    <li>Use a clear, well-lit photo</li>
                                    <li>
                                        Face should be visible and looking at
                                        the camera
                                    </li>
                                    <li>High resolution images work best</li>
                                    <li>Avoid busy backgrounds</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Adjust Tab */}
                {activeTab === "adjust" && originalUrl && (
                    <div className={styles.adjustTab}>
                        <div className={styles.previewSection}>
                            <div className={styles.originalPreview}>
                                <h3>Original Image</h3>
                                <img src={originalUrl} alt="Original" />
                                <div className={styles.imageInfo}>
                                    <span>{originalImage?.name}</span>
                                    <span>
                                        {formatFileSize(
                                            originalImage?.size || 0
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.controlsSection}>
                                <h3>Adjustments</h3>

                                <div className={styles.controlGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={faceDetection}
                                            onChange={(e) =>
                                                setFaceDetection(
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <span>🎯 Smart Face Detection</span>
                                    </label>
                                    <p className={styles.controlHint}>
                                        Automatically centers on faces
                                    </p>
                                </div>

                                <div className={styles.controlGroup}>
                                    <label>
                                        Background Padding: {bgPadding}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="30"
                                        value={bgPadding}
                                        onChange={(e) =>
                                            setBgPadding(
                                                parseInt(e.target.value)
                                            )
                                        }
                                    />
                                    <div className={styles.rangeLabels}>
                                        <span>Less space</span>
                                        <span>More space</span>
                                    </div>
                                </div>

                                <div className={styles.controlGroup}>
                                    <label>Background Color</label>
                                    <div className={styles.colorPicker}>
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) =>
                                                setBgColor(e.target.value)
                                            }
                                        />
                                        <span className={styles.colorValue}>
                                            {bgColor}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.controlGroup}>
                                    <label>
                                        Zoom Level: {zoomLevel.toFixed(2)}x
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.01"
                                        value={zoomLevel}
                                        onChange={(e) =>
                                            setZoomLevel(
                                                parseFloat(e.target.value)
                                            )
                                        }
                                    />
                                    <div className={styles.rangeLabels}>
                                        <span>Zoom Out</span>
                                        <span>Zoom In</span>
                                    </div>
                                </div>

                                <button
                                    className={styles.processBtn}
                                    onClick={processAllPlatforms}
                                >
                                    ✨ Generate Profile Pictures
                                </button>
                            </div>
                        </div>

                        {faceDetected && (
                            <div className={styles.faceDetectionBadge}>
                                <span>🎯</span>
                                <p>Face detected! Smart cropping enabled</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === "results" && (
                    <div className={styles.resultsTab}>
                        {/* Platform Filter */}
                        <div className={styles.platformFilter}>
                            <button
                                className={`${styles.filterBtn} ${selectedPlatform === "all" ? styles.active : ""}`}
                                onClick={() => setSelectedPlatform("all")}
                            >
                                All Platforms
                            </button>
                            {platforms.map((platform) => (
                                <button
                                    key={platform.id}
                                    className={`${styles.filterBtn} ${selectedPlatform === platform.id ? styles.active : ""}`}
                                    onClick={() =>
                                        setSelectedPlatform(platform.id)
                                    }
                                >
                                    {platform.icon} {platform.name}
                                </button>
                            ))}
                        </div>

                        {/* Results Grid */}
                        <div className={styles.resultsGrid}>
                            {filteredPlatforms.map((platform) => {
                                const image = processedImages.find(
                                    (img) => img.platformId === platform.id
                                )
                                return (
                                    <div
                                        key={platform.id}
                                        className={styles.resultCard}
                                    >
                                        <div
                                            className={styles.platformHeader}
                                            style={{
                                                backgroundColor:
                                                    platform.bgColor + "20",
                                            }}
                                        >
                                            <span
                                                className={styles.platformIcon}
                                            >
                                                {platform.icon}
                                            </span>
                                            <h4>{platform.name}</h4>
                                            <span
                                                className={styles.platformSize}
                                            >
                                                {platform.dimensions}
                                            </span>
                                        </div>

                                        <div className={styles.imagePreview}>
                                            {image ? (
                                                <img
                                                    src={image.url}
                                                    alt={platform.name}
                                                />
                                            ) : (
                                                <div
                                                    className={
                                                        styles.loadingPlaceholder
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.spinner
                                                        }
                                                    ></div>
                                                </div>
                                            )}
                                        </div>

                                        {image && (
                                            <div
                                                className={styles.imageDetails}
                                            >
                                                <div
                                                    className={styles.fileSize}
                                                >
                                                    📦{" "}
                                                    {formatFileSize(image.size)}
                                                </div>
                                                <div
                                                    className={
                                                        styles.qualityBadge
                                                    }
                                                >
                                                    Optimized {platform.quality}
                                                    %
                                                </div>
                                            </div>
                                        )}

                                        <div className={styles.resultActions}>
                                            <button
                                                className={styles.downloadBtn}
                                                onClick={() =>
                                                    image &&
                                                    downloadImage(image)
                                                }
                                                disabled={!image}
                                            >
                                                ⬇️ Download
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Bulk Actions */}
                        {processedImages.length > 0 && (
                            <div className={styles.bulkActions}>
                                <button
                                    className={styles.downloadAllBtn}
                                    onClick={downloadAll}
                                >
                                    📦 Download All
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Processing Overlay */}
                {processing && (
                    <div className={styles.processingOverlay}>
                        <div className={styles.processingCard}>
                            <div className={styles.spinner}></div>
                            <h3>Processing your images...</h3>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p>{Math.round(progress)}% complete</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePicOptimizer
