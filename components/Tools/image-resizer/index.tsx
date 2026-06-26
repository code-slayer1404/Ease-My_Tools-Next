"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Download, ImageIcon } from "lucide-react"

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ImageResizer() {
    const [file, setFile] = useState<File | null>(null)
    const [originalImage, setOriginalImage] = useState<string>("")
    const [resizedImage, setResizedImage] = useState<string>("")
    const [width, setWidth] = useState(800)
    const [height, setHeight] = useState(600)
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
    const [quality, setQuality] = useState(0.8)
    const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        return () => {
            if (originalImage && originalImage.startsWith("blob:"))
                URL.revokeObjectURL(originalImage)
            if (resizedImage && resizedImage.startsWith("blob:"))
                URL.revokeObjectURL(resizedImage)
        }
    }, [originalImage, resizedImage])

    const handleFileUpload = (uploadedFile: File | null | undefined) => {
        if (!uploadedFile) return
        if (!uploadedFile.type.startsWith("image/")) {
            alert("Please select an image file")
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            const result = e.target?.result
            if (typeof result !== "string") return
            const img = new Image()
            img.onload = () => {
                if (originalImage && originalImage.startsWith("blob:"))
                    URL.revokeObjectURL(originalImage)
                if (resizedImage && resizedImage.startsWith("blob:"))
                    URL.revokeObjectURL(resizedImage)
                setOriginalImage(result)
                setOriginalSize({ width: img.width, height: img.height })
                setWidth(img.width)
                setHeight(img.height)
                setResizedImage("")
                setFile(uploadedFile)
            }
            img.src = result
        }
        reader.readAsDataURL(uploadedFile)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        handleFileUpload(e.dataTransfer.files[0])
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const resizeImage = () => {
        if (!originalImage) {
            alert("Please upload an image first")
            return
        }
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = new Image()
        img.onload = () => {
            let newWidth = width
            let newHeight = height

            if (maintainAspectRatio) {
                const aspectRatio = img.width / img.height
                if (newWidth / newHeight > aspectRatio) {
                    newWidth = newHeight * aspectRatio
                } else {
                    newHeight = newWidth / aspectRatio
                }
            }

            canvas.width = newWidth
            canvas.height = newHeight
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
            ctx.drawImage(img, 0, 0, newWidth, newHeight)

            const resizedDataURL = canvas.toDataURL("image/jpeg", quality)
            if (resizedImage && resizedImage.startsWith("blob:"))
                URL.revokeObjectURL(resizedImage)
            setResizedImage(resizedDataURL)
        }
        img.src = originalImage
    }

    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth)
        if (maintainAspectRatio && originalSize.width > 0) {
            const aspectRatio = originalSize.width / originalSize.height
            setHeight(Math.round(newWidth / aspectRatio))
        }
    }

    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight)
        if (maintainAspectRatio && originalSize.height > 0) {
            const aspectRatio = originalSize.width / originalSize.height
            setWidth(Math.round(newHeight * aspectRatio))
        }
    }

    const toggleAspectRatio = (checked: boolean) => {
        setMaintainAspectRatio(checked)
        if (checked && originalSize.width > 0 && originalSize.height > 0) {
            const aspectRatio = originalSize.width / originalSize.height
            setHeight(Math.round(width / aspectRatio))
        }
    }

    const clearAll = () => {
        if (originalImage && originalImage.startsWith("blob:"))
            URL.revokeObjectURL(originalImage)
        if (resizedImage && resizedImage.startsWith("blob:"))
            URL.revokeObjectURL(resizedImage)
        setFile(null)
        setOriginalImage("")
        setResizedImage("")
        setOriginalSize({ width: 0, height: 0 })
        setWidth(800)
        setHeight(600)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const downloadResizedImage = () => {
        if (!resizedImage) return
        const link = document.createElement("a")
        link.href = resizedImage
        link.download = `resized-${width}x${height}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const applyPreset = (preset: string) => {
        if (maintainAspectRatio) return
        switch (preset) {
            case "facebook":
                setWidth(1200)
                setHeight(630)
                break
            case "instagram":
                setWidth(1080)
                setHeight(1080)
                break
            case "twitter":
                setWidth(1200)
                setHeight(675)
                break
            case "thumbnail":
                setWidth(300)
                setHeight(300)
                break
            case "hd":
                setWidth(1920)
                setHeight(1080)
                break
        }
    }

    const presetOptions = [
        { key: "facebook", label: "Facebook (1200×630)" },
        { key: "instagram", label: "Instagram (1080×1080)" },
        { key: "twitter", label: "Twitter (1200×675)" },
        { key: "thumbnail", label: "Thumbnail (300×300)" },
        { key: "hd", label: "HD (1920×1080)" },
    ]

    const hasFile = !!file

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-foreground sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="w-full max-w-5xl">
                <Card className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-xl">
                    <CardContent className="grid gap-5 p-4 sm:gap-6 sm:p-5 lg:grid-cols-[1fr_1.1fr]">
                        {/* LEFT PANEL - Upload & Settings */}
                        <div className="min-w-0 space-y-5">
                            {!hasFile ? (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border bg-muted/50 p-4 text-center transition-all duration-200 hover:border-muted-foreground/30"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                            handleFileUpload(
                                                e.target.files?.[0]
                                            )
                                        }
                                    />
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="mb-2 rounded-full bg-muted p-2.5 shadow-inner">
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-semibold">
                                            Upload Image
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Drag & drop or click to browse
                                        </p>
                                        <div className="mt-2 flex flex-wrap justify-center gap-1">
                                            {["JPG", "PNG", "GIF", "WebP"].map(
                                                (fmt) => (
                                                    <span
                                                        key={fmt}
                                                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                                                    >
                                                        {fmt}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                        <p className="mt-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                            Max file size: no limit
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <Card className="rounded-xl border border-border bg-card/50">
                                    <CardContent className="flex min-w-0 items-center gap-2 p-2">
                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
                                            {originalImage && (
                                                <img
                                                    src={originalImage}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-1">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {file.name}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {file.type
                                                            .split("/")[1]
                                                            ?.toUpperCase() ||
                                                            "IMG"}{" "}
                                                        ·{" "}
                                                        {formatSize(file.size)}
                                                        {originalSize.width >
                                                            0 && (
                                                            <>
                                                                {" "}
                                                                ·{" "}
                                                                {
                                                                    originalSize.width
                                                                }
                                                                ×
                                                                {
                                                                    originalSize.height
                                                                }
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearAll}
                                                    className="h-7 flex-shrink-0 px-1.5 py-0 text-xs text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="mr-0.5 h-3.5 w-3.5" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {hasFile && (
                                <>
                                    {/* Quick Presets */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                            Quick Presets
                                        </Label>
                                        <div className="grid min-w-0 grid-cols-2 gap-1 sm:grid-cols-3">
                                            {presetOptions.map(
                                                ({ key, label }) => (
                                                    <Button
                                                        key={key}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            applyPreset(key)
                                                        }
                                                        disabled={
                                                            maintainAspectRatio
                                                        }
                                                        className="h-7 truncate px-1.5 py-0 text-xs"
                                                    >
                                                        {label}
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Width & Height */}
                                    <div className="grid min-w-0 grid-cols-2 gap-1.5">
                                        <div className="min-w-0 space-y-1">
                                            <Label className="text-xs">
                                                Width (px)
                                            </Label>
                                            <Input
                                                type="number"
                                                value={width}
                                                onChange={(e) =>
                                                    handleWidthChange(
                                                        parseInt(
                                                            e.target.value
                                                        ) || 1
                                                    )
                                                }
                                                min={1}
                                                max={5000}
                                                className="h-7 w-full min-w-0 px-2 text-xs"
                                            />
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <Label className="text-xs">
                                                Height (px)
                                            </Label>
                                            <Input
                                                type="number"
                                                value={height}
                                                onChange={(e) =>
                                                    handleHeightChange(
                                                        parseInt(
                                                            e.target.value
                                                        ) || 1
                                                    )
                                                }
                                                min={1}
                                                max={5000}
                                                className="h-7 w-full min-w-0 px-2 text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Maintain Aspect Ratio */}
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="maintainAspect"
                                            checked={maintainAspectRatio}
                                            onCheckedChange={(checked) =>
                                                toggleAspectRatio(checked)
                                            }
                                        />
                                        <Label
                                            htmlFor="maintainAspect"
                                            className="cursor-pointer text-xs"
                                        >
                                            Maintain aspect ratio
                                        </Label>
                                    </div>

                                    {/* Quality Slider */}
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                Quality
                                            </Label>
                                            <span className="text-xs font-bold">
                                                {Math.round(quality * 100)}%
                                            </span>
                                        </div>
                                        <Slider
                                            value={[quality]}
                                            onValueChange={([val]) =>
                                                setQuality(val)
                                            }
                                            min={0.1}
                                            max={1}
                                            step={0.1}
                                            aria-label="Quality"
                                        />
                                    </div>

                                    {/* Resize & Clear Buttons */}
                                    <div className="flex gap-1.5 pt-1">
                                        <Button
                                            onClick={resizeImage}
                                            size="sm"
                                            className="h-7 flex-1 text-xs"
                                        >
                                            Resize Image
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={clearAll}
                                            className="h-7 text-xs"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* RIGHT PANEL - Previews */}
                        <div className="min-w-0 space-y-5">
                            {/* Original Preview */}
                            {originalImage ? (
                                <div>
                                    <Label className="mb-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Original
                                    </Label>
                                    <div className="flex min-h-[200px] min-w-0 items-center justify-center rounded-lg border border-border bg-card/60 p-4">
                                        <img
                                            src={originalImage}
                                            alt="Original"
                                            className="max-h-48 max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="mt-1 text-center text-[10px] text-muted-foreground">
                                        {originalSize.width} ×{" "}
                                        {originalSize.height} px
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden rounded-xl border border-dashed border-border bg-card/40 p-3 text-center backdrop-blur-sm lg:block">
                                    <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Original image will appear here
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        Upload an image to get started
                                    </p>
                                </div>
                            )}

                            {/* Resized Preview */}
                            {resizedImage ? (
                                <div>
                                    <Label className="mb-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Resized
                                    </Label>
                                    <div className="flex min-h-[200px] min-w-0 items-center justify-center rounded-lg border border-border bg-card/60 p-4">
                                        <img
                                            src={resizedImage}
                                            alt="Resized"
                                            className="max-h-48 max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="mt-1 text-center text-[10px] text-muted-foreground">
                                        {width} × {height} px
                                    </div>
                                    <Button
                                        onClick={downloadResizedImage}
                                        size="lg"
                                        variant="secondary"
                                        className="mt-2 h-7 w-full"
                                    >
                                        <Download className="mr-1 h-3.5 w-3.5" />
                                        Download Resized Image
                                    </Button>
                                </div>
                            ) : (
                                hasFile && (
                                    <div className="hidden rounded-xl border border-dashed border-border bg-card/40 p-3 text-center backdrop-blur-sm lg:block">
                                        <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Resized image will appear here
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                                            Adjust settings and click
                                            &quot;Resize Image&quot;
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    )
}
