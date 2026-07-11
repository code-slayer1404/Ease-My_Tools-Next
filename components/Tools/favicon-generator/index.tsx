"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import JSZip from "jszip"
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  FileImage,
  Globe,
  ImagePlus,
  Loader2,
  RotateCcw,
  Scissors,
  Settings2,
  Sparkles,
  Upload,
  Wand2,
  X,
  Type,
} from "lucide-react"
import { ToolHeroProps } from "@/types/tool"
import ToolHero from "@/components/tool-page-helpers/ToolHero"

// shadcn/ui components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type ExportFormat = "ico" | "png" | "all"
type BackgroundMode = "transparent" | "solid" | "checkerboard"
type FitMode = "contain" | "cover"
type GeneratorMode = "image" | "text"

type SizeOption = {
  value: number
  label: string
  description: string
}

type GeneratedFile = {
  name: string
  type: string
  size: number
  blob: Blob
  previewUrl?: string
}

type TextSettings = {
  text: string
  textColor: string
  fontSize: number // percentage relative to canvas size
  fontFamily: string
  isBold: boolean
}

type Settings = {
  format: ExportFormat
  sizes: number[]
  backgroundMode: BackgroundMode
  backgroundColor: string
  padding: number
  borderRadius: number
  preserveAspectRatio: boolean
  fitMode: FitMode
  sharpness: number
  addMarginGuide: boolean
  includeAppleTouchIcon: boolean
  includeAndroidIcons: boolean
  includeManifest: boolean
  includeSvg: boolean
}

const DEFAULT_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512]

const SIZE_OPTIONS: SizeOption[] = [
  { value: 16, label: "16×16", description: "Browser tab icon" },
  { value: 32, label: "32×32", description: "Desktop/bookmark icon" },
  { value: 48, label: "48×48", description: "Legacy Windows icon" },
  { value: 64, label: "64×64", description: "High-DPI preview" },
  { value: 128, label: "128×128", description: "Chrome Web Store" },
  { value: 180, label: "180×180", description: "Apple touch icon" },
  { value: 192, label: "192×192", description: "Android launcher icon" },
  { value: 256, label: "256×256", description: "Retina/ICO source" },
  { value: 512, label: "512×512", description: "PWA / maskable icon" },
]

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  { value: "ico", label: "ICO", description: "Single legacy favicon package" },
  { value: "png", label: "PNG", description: "Modern transparent icons" },
  { value: "all", label: "All formats", description: "ICO + PNG + SVG + manifest" },
]

const FONT_OPTIONS = [
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "cursive", label: "Cursive" },
  { value: "system-ui", label: "System UI" }
]

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes"
  const units = ["Bytes", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== "string") return reject(new Error("Failed to read file"))
      resolve(result)
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

function detectMimeFromFile(file: File): string {
  if (file.type) return file.type
  const ext = file.name.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "png": return "image/png"
    case "jpg": case "jpeg": return "image/jpeg"
    case "webp": return "image/webp"
    case "gif": return "image/gif"
    case "svg": return "image/svg+xml"
    default: return "image/png"
  }
}

async function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = dataUrl
  })
}

async function renderFaviconBlob(
  mode: GeneratorMode,
  sourceDataUrl: string,
  textSettings: TextSettings,
  size: number,
  settings: Settings
): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = settings.sharpness > 0.66 ? "high" : settings.sharpness > 0.33 ? "medium" : "low"

  // Base background fill (solid or checkerboard)
  if (settings.backgroundMode === "solid") {
    ctx.fillStyle = settings.backgroundColor
    ctx.fillRect(0, 0, size, size)
  } else if (settings.backgroundMode === "checkerboard") {
    const step = Math.max(4, Math.round(size / 8))
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        ctx.fillStyle = (x / step + y / step) % 2 === 0 ? "#e5e7eb" : "#ffffff"
        ctx.fillRect(x, y, step, step)
      }
    }
  }

  const padding = Math.max(0, Math.min(settings.padding, Math.floor(size / 2) - 1))
  const safeSize = size - padding * 2

  // Border radius clipping if requested
  if (settings.borderRadius > 0) {
    const radius = (size * settings.borderRadius) / 100
    roundRect(ctx, 0, 0, size, size, radius)
    ctx.clip()
  }

  if (settings.backgroundMode === "transparent") {
    ctx.clearRect(0, 0, size, size)
  }

  if (mode === "image" && sourceDataUrl) {
    const image = await dataUrlToImage(sourceDataUrl)
    let drawWidth = safeSize
    let drawHeight = safeSize
    const aspect = image.width / Math.max(1, image.height)

    if (settings.preserveAspectRatio) {
      if (settings.fitMode === "contain") {
        if (aspect > 1) {
          drawWidth = safeSize
          drawHeight = safeSize / aspect
        } else {
          drawHeight = safeSize
          drawWidth = safeSize * aspect
        }
      } else {
        if (aspect > 1) {
          drawHeight = safeSize
          drawWidth = safeSize * aspect
        } else {
          drawWidth = safeSize
          drawHeight = safeSize / Math.max(0.0001, aspect)
        }
      }
    }

    const x = (size - drawWidth) / 2
    const y = (size - drawHeight) / 2
    ctx.drawImage(image, x, y, drawWidth, drawHeight)

  } else if (mode === "text") {
    // Calculate accurate font size relative to current asset dimensions
    const calculatedFontSize = Math.round((size * textSettings.fontSize) / 100)
    ctx.font = `${textSettings.isBold ? "bold " : ""}${calculatedFontSize}px ${textSettings.fontFamily}`
    ctx.fillStyle = textSettings.textColor
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Draw the text centrally inside the canvas bounds
    ctx.fillText(textSettings.text || "E", size / 2, size / 2 + (calculatedFontSize * 0.05)) 
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Failed to export image"))
        else resolve(blob)
      },
      "image/png",
      1
    )
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

async function createSvgWrapperFromCanvas(mode: GeneratorMode, sourceDataUrl: string, textSettings: TextSettings, settings: Settings): Promise<Blob> {
  // Turn either state into a baseline 512px dataUrl to wrap cleanly inside standard SVG structure
  const baseBlob = await renderFaviconBlob(mode, sourceDataUrl, textSettings, 512, settings)
  const reader = new FileReader()
  const dataUrl = await new Promise<string>((res) => {
    reader.onload = () => res(reader.result as string)
    reader.readAsDataURL(baseBlob)
  })

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="100%" height="100%" fill="transparent"/>
    <image href="${dataUrl}" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>
  </svg>`.trim()
  return new Blob([svg], { type: "image/svg+xml" })
}

async function createManifestBlob(files: GeneratedFile[]) {
  const iconSizes = files
    .filter((f) => f.type.startsWith("image/"))
    .map((f) => {
      const match = f.name.match(/(\d+)x\1/)
      const size = match ? Number(match[1]) : undefined
      return size ? { src: `/${f.name}`, sizes: `${size}x${size}`, type: f.type } : null
    })
    .filter(Boolean)

  const manifest = {
    name: "My App",
    short_name: "App",
    icons: iconSizes,
    theme_color: "#111827",
    background_color: "#ffffff",
    display: "standalone",
  }

  return new Blob([JSON.stringify(manifest, null, 2)], { type: "application/manifest+json" })
}

async function createIcoBlobFromPngs(pngFiles: GeneratedFile[]): Promise<Blob> {
  const entries = await Promise.all(
    pngFiles.map(async (file) => {
      const buffer = await file.blob.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const sizeMatch = file.name.match(/(\d+)x\1/)
      const size = sizeMatch ? Number(sizeMatch[1]) : 256
      return { size, bytes }
    })
  )

  const headerSize = 6
  const dirEntrySize = 16
  const imageDataOffset = headerSize + dirEntrySize * entries.length
  let currentOffset = imageDataOffset

  const dir = new Uint8Array(imageDataOffset)
  const view = new DataView(dir.buffer)
  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true)
  view.setUint16(4, entries.length, true)

  const imageParts: Uint8Array[] = []

  entries
    .sort((a, b) => a.size - b.size)
    .forEach((entry, index) => {
      const offset = headerSize + index * dirEntrySize
      const entryView = new DataView(dir.buffer, offset, dirEntrySize)
      entryView.setUint8(0, entry.size >= 256 ? 0 : entry.size)
      entryView.setUint8(1, entry.size >= 256 ? 0 : entry.size)
      entryView.setUint8(2, 0)
      entryView.setUint8(3, 0)
      entryView.setUint16(4, 1, true)
      entryView.setUint16(6, 32, true)
      entryView.setUint32(8, entry.bytes.length, true)
      entryView.setUint32(12, currentOffset, true)
      imageParts.push(entry.bytes)
      currentOffset += entry.bytes.length
    })

  const total = new Uint8Array(currentOffset)
  total.set(dir, 0)
  let cursor = imageDataOffset
  for (const bytes of imageParts) {
    total.set(bytes, cursor)
    cursor += bytes.length
  }

  return new Blob([total], { type: "image/x-icon" })
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

function buildHtmlSnippet(files: GeneratedFile[]) {
  const pngs = files.filter((f) => f.name.endsWith(".png"))
  const apple = files.find((f) => f.name.includes("apple-touch"))
  const svg = files.find((f) => f.name.endsWith(".svg"))
  const lines = [
    '<link rel="icon" href="/favicon.ico">',
    ...pngs.map((f) => {
      const size = f.name.match(/(\d+)x\1/)?.[1]
      return size ? `<link rel="icon" type="image/png" href="/${f.name}" sizes="${size}x${size}">` : ""
    }),
    apple ? '<link rel="apple-touch-icon" href="/apple-touch-icon.png">' : "",
    svg ? '<link rel="icon" type="image/svg+xml" href="/favicon.svg">' : "",
  ].filter(Boolean)

  return lines.join("\n")
}

function buildNextMetadataSnippet() {
  return `export const metadata = {
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}`
}

function buildManifestSnippet() {
  return `{
  "name": "My App",
  "short_name": "App",
  "icons": [
    { "src": "/android-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "display": "standalone",
  "theme_color": "#111827",
  "background_color": "#ffffff"
}`
}

function previewTitle(size: number) {
  if (size <= 16) return "Tab"
  if (size <= 32) return "Browser"
  if (size <= 64) return "Desktop"
  if (size <= 180) return "Apple"
  if (size <= 192) return "Android"
  return "PWA"
}

export default function FaviconGenerator({ tool }: ToolHeroProps) {
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>("image")
  const [sourceDataUrl, setSourceDataUrl] = useState<string>("")
  const [sourceMime, setSourceMime] = useState("image/png")
  const [fileName, setFileName] = useState<string>("")
  const [fileSize, setFileSize] = useState<number>(0)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0)
  
  const [textSettings, setTextSettings] = useState<TextSettings>({
    text: "A",
    textColor: "#000000",
    fontSize: 70,
    fontFamily: "sans-serif",
    isBold: true
  })

  const [settings, setSettings] = useState<Settings>({
    format: "all",
    sizes: [...DEFAULT_SIZES],
    backgroundMode: "transparent",
    backgroundColor: "#ffffff",
    padding: 0,
    borderRadius: 0,
    preserveAspectRatio: true,
    fitMode: "contain",
    sharpness: 1,
    addMarginGuide: false,
    includeAppleTouchIcon: true,
    includeAndroidIcons: true,
    includeManifest: true,
    includeSvg: true,
  })
  
  const [customPrompt, setCustomPrompt] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectedSource = useMemo(() => generatedFiles[selectedFileIndex], [generatedFiles, selectedFileIndex])

  const selectedPreviewUrl = useMemo(() => {
    if (!selectedSource?.blob) return ""
    return selectedSource.previewUrl || URL.createObjectURL(selectedSource.blob)
  }, [selectedSource])

  // Live preview logic for the center canvas display
  const livePreviewUrl = useMemo(() => {
    if (generatorMode === "image") return sourceDataUrl
    // For text mode, generate a placeholder visually matching 512x512 specs instantly
    return "" 
  }, [generatorMode, sourceDataUrl])

  // Generate a temporary canvas rendering for instant UI updates when editing text parameters
  const [textPreviewUrl, setTextPreviewUrl] = useState<string>("")
  
  useEffect(() => {
    if (generatorMode === "text") {
      renderFaviconBlob("text", "", textSettings, 256, settings)
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          setTextPreviewUrl(url)
        })
        .catch(console.error)
    }
    return () => {
      if (textPreviewUrl) URL.revokeObjectURL(textPreviewUrl)
    }
  }, [textSettings, settings, generatorMode])

  useEffect(() => {
    return () => {
      generatedFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
      if (sourceDataUrl.startsWith("blob:")) {
        URL.revokeObjectURL(sourceDataUrl)
      }
    }
  }, [])

  const handleFileUpload = useCallback(async (uploadedFile?: File | null) => {
    if (!uploadedFile) return

    if (uploadedFile.size > 8 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 8MB.")
      return
    }

    if (!uploadedFile.type.startsWith("image/") && !uploadedFile.name.toLowerCase().endsWith(".svg")) {
      toast.error("Please upload an image file.")
      return
    }

    setFileName(uploadedFile.name)
    setFileSize(uploadedFile.size)
    setSourceMime(detectMimeFromFile(uploadedFile))
    setSourceDataUrl(await readFileAsDataURL(uploadedFile))
    setGeneratedFiles([])
    setSelectedFileIndex(0)
    toast.success("Image loaded")
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const uploadedFile = e.dataTransfer.files?.[0]
      await handleFileUpload(uploadedFile)
    },
    [handleFileUpload]
  )

  const handleGenerate = useCallback(async () => {
    if (generatorMode === "image" && !sourceDataUrl) {
      toast.error("Please upload an image first.")
      return
    }
    if (settings.sizes.length === 0) {
      toast.error("Please select at least one size.")
      return
    }

    setProcessing(true)
    setProgress(0)
    setGeneratedFiles([])

    try {
      const sizes = [...new Set(settings.sizes)].sort((a, b) => a - b)
      const outputs: GeneratedFile[] = []
      const pngBySize = new Map<number, GeneratedFile>()

      for (let i = 0; i < sizes.length; i += 1) {
        const size = sizes[i]
        const blob = await renderFaviconBlob(generatorMode, sourceDataUrl, textSettings, size, settings)
        const file = {
          name: `favicon-${size}x${size}.png`,
          type: "image/png",
          size: blob.size,
          blob,
        }
        outputs.push(file)
        pngBySize.set(size, file)
        setProgress(Math.round(((i + 1) / sizes.length) * 70))
      }

      if (settings.includeAppleTouchIcon) {
        const blob = await renderFaviconBlob(generatorMode, sourceDataUrl, textSettings, 180, settings)
        outputs.push({ name: "apple-touch-icon.png", type: "image/png", size: blob.size, blob })
      }

      if (settings.includeAndroidIcons) {
        const android192 = await renderFaviconBlob(generatorMode, sourceDataUrl, textSettings, 192, settings)
        const android512 = await renderFaviconBlob(generatorMode, sourceDataUrl, textSettings, 512, settings)
        outputs.push({ name: "android-192x192.png", type: "image/png", size: android192.size, blob: android192 })
        outputs.push({ name: "android-512x512.png", type: "image/png", size: android512.size, blob: android512 })
      }

      if (settings.includeSvg) {
        const svgBlob = await createSvgWrapperFromCanvas(generatorMode, sourceDataUrl, textSettings, settings)
        outputs.push({ name: "favicon.svg", type: "image/svg+xml", size: svgBlob.size, blob: svgBlob })
      }

      const icoSource = [...pngBySize.values()].sort((a, b) => b.size - a.size).slice(0, 6)
      if (settings.format === "ico" || settings.format === "all") {
        const icoBlob = await createIcoBlobFromPngs(icoSource)
        outputs.push({ name: "favicon.ico", type: "image/x-icon", size: icoBlob.size, blob: icoBlob })
      }

      if (settings.includeManifest) {
        const manifestBlob = await createManifestBlob(outputs)
        outputs.push({ name: "site.webmanifest", type: "application/manifest+json", size: manifestBlob.size, blob: manifestBlob })
      }

      if (settings.format === "png") {
        const onlyPng = outputs.filter((f) => f.type === "image/png")
        setGeneratedFiles(onlyPng)
      } else if (settings.format === "ico") {
        setGeneratedFiles(outputs.filter((f) => f.name === "favicon.ico" || f.name === "apple-touch-icon.png"))
      } else {
        setGeneratedFiles(outputs)
      }

      setSelectedFileIndex(0)
      setProgress(100)
      toast.success("Favicons generated successfully")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to generate favicons")
    } finally {
      setProcessing(false)
    }
  }, [settings, sourceDataUrl, generatorMode, textSettings])

  const handleDownloadAll = useCallback(async () => {
    if (generatedFiles.length === 0) return
    const zip = new JSZip()
    for (const file of generatedFiles) {
      zip.file(file.name, file.blob)
    }
    const blob = await zip.generateAsync({ type: "blob" })
    downloadBlob(blob, "favicon-package.zip")
    toast.success("ZIP downloaded")
  }, [generatedFiles])

  const handleDownloadSingle = useCallback((file: GeneratedFile) => {
    downloadBlob(file.blob, file.name)
    toast.success(`Downloaded ${file.name}`)
  }, [])

  const handleCopyHtml = useCallback(async () => {
    if (generatedFiles.length === 0) {
      toast.error("Generate icons first.")
      return
    }
    await copyText(buildHtmlSnippet(generatedFiles))
    toast.success("HTML copied")
  }, [generatedFiles])

  const handleCopyMetadata = useCallback(async () => {
    await copyText(buildNextMetadataSnippet())
    toast.success("Next.js metadata copied")
  }, [])

  const handleCopyManifest = useCallback(async () => {
    await copyText(buildManifestSnippet())
    toast.success("Manifest snippet copied")
  }, [])

  const handleClear = () => {
    setSourceDataUrl("")
    setSourceMime("image/png")
    setFileName("")
    setFileSize(0)
    setGeneratedFiles([])
    setSelectedFileIndex(0)
    setProgress(0)
    setTextSettings({ text: "A", textColor: "#000000", fontSize: 70, fontFamily: "sans-serif", isBold: true })
    if (fileInputRef.current) fileInputRef.current.value = ""
    toast.message("Cleared all configurations")
  }

  const selectAllSizes = () => setSettings((prev) => ({ ...prev, sizes: [...DEFAULT_SIZES] }))
  const clearAllSizes = () => setSettings((prev) => ({ ...prev, sizes: [] }))

  const toggleSize = (size: number) => {
    setSettings((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size].sort((a, b) => a - b),
    }))
  }

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="w-full max-w-7xl space-y-8">
        <ToolHero tool={tool} />

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
          <div className="p-6 sm:p-8">
            {/* Toolbar row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium Favicon Generator Pro
                </Badge>
                {generatorMode === "image" && fileName && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {fileName} ({formatBytes(fileSize)})
                  </span>
                )}
              
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleClear} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
                <Button onClick={handleGenerate} disabled={(generatorMode === "image" && !sourceDataUrl) || processing} className="gap-2">
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  Generate Package
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            {processing && (
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1">
                  <span>{progress}%</span>
                  <span>Generating multi-platform assets...</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Generator Mode Switcher Tabs */}
            <Tabs value={generatorMode} onValueChange={(v) => setGeneratorMode(v as GeneratorMode)} className="w-full mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="image" className="gap-2">
                  <FileImage className="h-4 w-4" /> Image Upload
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-2">
                  <Type className="h-4 w-4" /> Text / Initials
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
              {/* Left column: input (upload/text) + settings */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Configure Favicon Input
                  </CardTitle>
                  <CardDescription>
                    {generatorMode === "image" 
                      ? "Upload your branding assets to slice into multi-format layouts." 
                      : "Type characters, adjust font scaling, and customize branding colors instantly."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Image Input UI Render */}
                  {generatorMode === "image" && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-slate-400 hover:bg-slate-100/70 dark:border-slate-700 dark:bg-slate-950/30 dark:hover:border-slate-500 dark:hover:bg-slate-900/50"
                    >
                      {sourceDataUrl ? (
                        <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                            <img src={sourceDataUrl} alt="Source preview" className="h-36 w-full object-contain p-3" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500" />
                              <span className="font-medium">{fileName}</span>
                            </div>
                            <div className="text-sm text-slate-500">{formatBytes(fileSize)} · {sourceMime}</div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                                <ImagePlus className="h-4 w-4" />
                                Replace
                              </Button>
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleClear(); }} className="gap-2">
                                <X className="h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
                          <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
                            <FileImage className="h-8 w-8 text-slate-600 dark:text-slate-300" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-lg font-semibold">Drop your logo here</div>
                            <div className="text-sm text-slate-500">PNG, JPG, WEBP, GIF, SVG supported</div>
                          </div>
                          <Button type="button" variant="secondary" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Choose file
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.svg"
                        className="hidden"
                        onChange={(e) => void handleFileUpload(e.target.files?.[0])}
                      />
                    </div>
                  )}

                  {/* Text/Initials Input UI Render */}
                  {generatorMode === "text" && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 dark:border-slate-800 dark:bg-slate-950/30">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fav-text">Favicon Text / Emoji</Label>
                          <Input
                            id="fav-text"
                            maxLength={4}
                            value={textSettings.text}
                            onChange={(e) => setTextSettings(prev => ({ ...prev, text: e.target.value }))}
                            placeholder="e.g., AB or 🚀"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fav-text-color">Text Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="fav-text-color"
                              type="color"
                              value={textSettings.textColor}
                              onChange={(e) => setTextSettings(prev => ({ ...prev, textColor: e.target.value }))}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={textSettings.textColor}
                              onChange={(e) => setTextSettings(prev => ({ ...prev, textColor: e.target.value }))}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select
                            value={textSettings.fontFamily}
                            onValueChange={(v) => setTextSettings(prev => ({ ...prev, fontFamily: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_OPTIONS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                          <div>
                            <Label className="font-medium">Bold Character weight</Label>
                          </div>
                          <Switch
                            checked={textSettings.isBold}
                            onCheckedChange={(c) => setTextSettings(prev => ({ ...prev, isBold: c }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Label>Font Scale Adjust: {textSettings.fontSize}%</Label>
                        </div>
                        <Slider
                          value={[textSettings.fontSize]}
                          min={10}
                          max={120}
                          step={1}
                          onValueChange={([v]) => setTextSettings(prev => ({ ...prev, fontSize: v }))}
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="platform">Platform</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="mt-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Output format</Label>
                          <Select
                            value={settings.format}
                            onValueChange={(value) => setSettings((prev) => ({ ...prev, format: value as ExportFormat }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose format" />
                            </SelectTrigger>
                            <SelectContent>
                              {FORMAT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Background mode</Label>
                          <Select
                            value={settings.backgroundMode}
                            onValueChange={(value) =>
                              setSettings((prev) => ({ ...prev, backgroundMode: value as BackgroundMode }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Background" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="transparent">Transparent</SelectItem>
                              <SelectItem value="solid">Solid color</SelectItem>
                              <SelectItem value="checkerboard">Checkerboard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                        <div className="space-y-2">
                          <Label>Background color</Label>
                          <Input
                            type="color"
                            value={settings.backgroundColor}
                            onChange={(e) => setSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                            className="h-11 p-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fit mode</Label>
                          <Select
                            disabled={generatorMode === "text"}
                            value={settings.fitMode}
                            onValueChange={(value) => setSettings((prev) => ({ ...prev, fitMode: value as FitMode }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contain">Contain</SelectItem>
                              <SelectItem value="cover">Cover</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="platform" className="mt-4 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm text-slate-500">Pick all icon sizes you want in the package.</div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={selectAllSizes}>
                            Select all
                          </Button>
                          <Button variant="outline" size="sm" onClick={clearAllSizes}>
                            Clear all
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {SIZE_OPTIONS.map((opt) => {
                          const checked = settings.sizes.includes(opt.value)
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => toggleSize(opt.value)}
                              className={cn(
                                "rounded-2xl border p-4 text-left transition",
                                checked
                                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700"
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold">{opt.label}</div>
                                  <div className={cn("mt-1 text-xs", checked ? "text-slate-300 dark:text-slate-700" : "text-slate-500")}>{opt.description}</div>
                                </div>
                                <div className={cn("mt-0.5 rounded-full border p-1", checked ? "border-white/30" : "border-slate-200")}>
                                  <Checkbox checked={checked} />
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="mt-4 space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Padding / Inset: {settings.padding}px</Label>
                        </div>
                        <Slider
                          value={[settings.padding]}
                          min={0}
                          max={64}
                          step={1}
                          onValueChange={([value]) => setSettings((prev) => ({ ...prev, padding: value }))}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Corner Border radius: {settings.borderRadius}%</Label>
                        </div>
                        <Slider
                          value={[settings.borderRadius]}
                          min={0}
                          max={50}
                          step={1}
                          onValueChange={([value]) => setSettings((prev) => ({ ...prev, borderRadius: value }))}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Sharpness scaling: {Math.round(settings.sharpness * 100)}%</Label>
                        </div>
                        <Slider
                          value={[settings.sharpness]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={([value]) => setSettings((prev) => ({ ...prev, sharpness: value }))}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                          <div>
                            <div className="font-medium">Preserve aspect ratio</div>
                            <div className="text-xs text-slate-500">Keep original proportions</div>
                          </div>
                          <Switch
                            disabled={generatorMode === "text"}
                            checked={settings.preserveAspectRatio}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, preserveAspectRatio: checked }))}
                          />
                        </label>

                        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                          <div>
                            <div className="font-medium">Apple touch icon</div>
                            <div className="text-xs text-slate-500">Include 180×180 export</div>
                          </div>
                          <Switch
                            checked={settings.includeAppleTouchIcon}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, includeAppleTouchIcon: checked }))}
                          />
                        </label>

                        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                          <div>
                            <div className="font-medium">Android icons</div>
                            <div className="text-xs text-slate-500">Include 192×192 and 512×512</div>
                          </div>
                          <Switch
                            checked={settings.includeAndroidIcons}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, includeAndroidIcons: checked }))}
                          />
                        </label>

                        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                          <div>
                            <div className="font-medium">Manifest file</div>
                            <div className="text-xs text-slate-500">Generate site.webmanifest</div>
                          </div>
                          <Switch
                            checked={settings.includeManifest}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, includeManifest: checked }))}
                          />
                        </label>

                        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                          <div>
                            <div className="font-medium">SVG fallback</div>
                            <div className="text-xs text-slate-500">Generate favicon.svg</div>
                          </div>
                          <Switch
                            checked={settings.includeSvg}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, includeSvg: checked }))}
                          />
                        </label>

                        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                          <div>
                            <div className="font-medium">Margin guide</div>
                            <div className="text-xs text-slate-500">Show safe-area hint</div>
                          </div>
                          <Switch
                            checked={settings.addMarginGuide}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, addMarginGuide: checked }))}
                          />
                        </label>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Right column: output & preview */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Output Preview & Exports
                  </CardTitle>
                  <CardDescription>Download compiled individual files, full platform ZIPs, or metadata.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Button variant="secondary" onClick={handleCopyHtml} className="gap-2">
                      <Copy className="h-4 w-4" />
                      Copy HTML
                    </Button>
                    <Button variant="secondary" onClick={handleCopyMetadata} className="gap-2">
                      <Globe className="h-4 w-4" />
                      Next.js metadata
                    </Button>
                    <Button variant="secondary" onClick={handleCopyManifest} className="gap-2">
                      <Copy className="h-4 w-4" />
                      Manifest snippet
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Scissors className="h-4 w-4" />
                      Asset Target Inspector
                    </div>
                    <Badge variant="outline">{generatedFiles.length} files compiled</Badge>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-white dark:bg-slate-900">
                        {selectedSource ? (
                          <img src={selectedPreviewUrl} alt={selectedSource.name} className="h-full w-full object-contain" />
                        ) : generatorMode === "image" && sourceDataUrl ? (
                          <img src={sourceDataUrl} alt="Preview" className="h-full w-full object-contain" />
                        ) : generatorMode === "text" && textPreviewUrl ? (
                          <img src={textPreviewUrl} alt="Text Preview" className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-400">Preview Canvas</div>
                        )}
                        {settings.addMarginGuide && (
                          <div className="pointer-events-none absolute inset-3 rounded-[18%] border border-dashed border-sky-500/70" />
                        )}
                      </div>
                      <div className="mt-3 text-center text-xs text-slate-500">
                        {selectedSource ? `${selectedSource.name}` : "Run generate to preview output assets"}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <ScrollArea className="h-[300px] rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="space-y-2 p-3">
                          {generatedFiles.map((file, idx) => (
                            <button
                              key={file.name}
                              type="button"
                              onClick={() => setSelectedFileIndex(idx)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition",
                                idx === selectedFileIndex
                                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900"
                              )}
                            >
                              <div>
                                <div className="font-medium">{file.name}</div>
                                <div className={cn("text-xs", idx === selectedFileIndex ? "text-slate-300 dark:text-slate-600" : "text-slate-500")}>
                                  {formatBytes(file.size)} · {file.type}
                                </div>
                              </div>
                              <div className="text-xs font-medium">{previewTitle(Number(file.name.match(/(\d+)x\1/)?.[1] || 0) || 0)}</div>
                            </button>
                          ))}
                          {generatedFiles.length === 0 && (
                            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
                              Hit "Generate Package" to compile files here.
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                          onClick={() => selectedSource && handleDownloadSingle(selectedSource)}
                          disabled={!selectedSource}
                          className="gap-2 text-xs"
                        >
                          <Download className="h-4 w-4" />
                          Download Selected
                        </Button>
                        <Button
                          onClick={handleDownloadAll}
                          disabled={generatedFiles.length === 0}
                          variant="outline"
                          className="gap-2 text-xs"
                        >
                          <Download className="h-4 w-4" />
                          Download Full ZIP
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}