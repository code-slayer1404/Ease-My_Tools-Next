"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import JSZip from "jszip"
import jsQR from "jsqr"
import { QRCodeSVG } from "qrcode.react"
import {
  AlertCircle,
  Camera,
  Copy,
  Download,
  FileImage,
  FilePlus,
  ImageUp,
  Link2,
  Loader2,
  QrCode,
  Trash2,
  Upload,
  X,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { ToolHeroProps } from "@/types/tool"
import ToolHero from "@/components/tool-page-helpers/ToolHero"

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H"
type QRSize = "small" | "medium" | "large" | "xlarge"
type ActiveTab = "generate" | "decode" | "camera"
type QRMode =
  | "text"
  | "url"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "vcard"
  | "location"
  | "calendar"
  | "pdf"
type ExportFormat = "svg" | "png" | "jpg" | "webp"
type QRStylePreset = "classic" | "rounded" | "glass"

type DecodedItem = {
  id: string
  fileName: string
  fileSize: number
  text: string
  createdAt: number
  previewUrl: string
}

type QRFormState = {
  text: string
  url: string
  wifiSsid: string
  wifiPassword: string
  wifiSecurity: "WPA" | "WEP" | "nopass"
  wifiHidden: boolean
  emailTo: string
  emailSubject: string
  emailBody: string
  phoneNumber: string
  smsNumber: string
  smsMessage: string
  whatsappNumber: string
  whatsappMessage: string
  vcardFirstName: string
  vcardLastName: string
  vcardOrg: string
  vcardTitle: string
  vcardPhone: string
  vcardEmail: string
  vcardUrl: string
  locationLat: string
  locationLng: string
  locationLabel: string
  calendarTitle: string
  calendarStart: string
  calendarEnd: string
  calendarLocation: string
  calendarDescription: string
  pdfUrl: string
}

const sizeMap: Record<QRSize, number> = {
  small: 160,
  medium: 220,
  large: 280,
  xlarge: 340,
}

const localStorageKeys = {
  decoded: "qr-tool-decoded-v2",
}

const QR_MAX_LENGTH = 4000

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function safeFileName(value: string, fallback = "qr-code") {
  const cleaned = value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return cleaned.slice(0, 48) || fallback
}

function encodeWifi({ ssid, password, security, hidden }: { ssid: string; password: string; security: "WPA" | "WEP" | "nopass"; hidden: boolean }) {
  const esc = (v: string) => v.replace(/([\\;,:\"])/g, "\\$1")
  return `WIFI:T:${security};S:${esc(ssid)};P:${esc(password)};H:${hidden ? "true" : "false"};;`
}

function encodeEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
  const params = new URLSearchParams()
  if (subject.trim()) params.set("subject", subject.trim())
  if (body.trim()) params.set("body", body.trim())
  const q = params.toString()
  return `mailto:${encodeURIComponent(to.trim())}${q ? `?${q}` : ""}`
}

function encodeSms({ number, message }: { number: string; message: string }) {
  const params = new URLSearchParams()
  if (message.trim()) params.set("body", message.trim())
  const q = params.toString()
  return `sms:${encodeURIComponent(number.trim())}${q ? `?${q}` : ""}`
}

function encodeWhatsApp({ number, message }: { number: string; message: string }) {
  const text = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ""
  const digits = number.replace(/[^\d+]/g, "")
  return `https://wa.me/${digits}${text}`
}

function encodePhone(number: string) {
  return `tel:${number.replace(/\s+/g, "").trim()}`
}

function encodeLocation(lat: string, lng: string, label: string) {
  const latitude = lat.trim()
  const longitude = lng.trim()
  if (!latitude || !longitude) return ""
  const query = label.trim()
    ? `${latitude},${longitude} (${label.trim()})`
    : `${latitude},${longitude}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function encodeCalendar({
  title,
  start,
  end,
  location,
  description,
}: {
  title: string
  start: string
  end: string
  location: string
  description: string
}) {
  const params = new URLSearchParams()
  params.set("text", title.trim())
  if (start) params.set("dates", `${start.replace(/[-:]/g, "").replace(".000", "")}/${end ? end.replace(/[-:]/g, "").replace(".000", "") : start.replace(/[-:]/g, "").replace(".000", "")}`)
  if (location.trim()) params.set("location", location.trim())
  if (description.trim()) params.set("details", description.trim())
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`
}

function encodeVCard(data: QRFormState) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${data.vcardLastName};${data.vcardFirstName};;;`,
    `FN:${[data.vcardFirstName, data.vcardLastName].filter(Boolean).join(" ")}`,
    data.vcardOrg ? `ORG:${data.vcardOrg}` : "",
    data.vcardTitle ? `TITLE:${data.vcardTitle}` : "",
    data.vcardPhone ? `TEL;TYPE=CELL:${data.vcardPhone}` : "",
    data.vcardEmail ? `EMAIL;TYPE=INTERNET:${data.vcardEmail}` : "",
    data.vcardUrl ? `URL:${data.vcardUrl}` : "",
    "END:VCARD",
  ]
  return lines.filter(Boolean).join("\n")
}

function buildQrValue(mode: QRMode, form: QRFormState) {
  switch (mode) {
    case "text":
      return form.text.trim()
    case "url":
      return form.url.trim()
    case "wifi":
      return encodeWifi({
        ssid: form.wifiSsid,
        password: form.wifiPassword,
        security: form.wifiSecurity,
        hidden: form.wifiHidden,
      })
    case "email":
      return encodeEmail({ to: form.emailTo, subject: form.emailSubject, body: form.emailBody })
    case "phone":
      return encodePhone(form.phoneNumber)
    case "sms":
      return encodeSms({ number: form.smsNumber, message: form.smsMessage })
    case "whatsapp":
      return encodeWhatsApp({ number: form.whatsappNumber, message: form.whatsappMessage })
    case "vcard":
      return encodeVCard(form)
    case "location":
      return encodeLocation(form.locationLat, form.locationLng, form.locationLabel)
    case "calendar":
      return encodeCalendar({
        title: form.calendarTitle,
        start: form.calendarStart,
        end: form.calendarEnd,
        location: form.calendarLocation,
        description: form.calendarDescription,
      })
    case "pdf":
      return form.pdfUrl.trim()
    default:
      return form.text.trim()
  }
}

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === "string") resolve(result)
      else reject(new Error("Unable to read file"))
    }
    reader.onerror = () => reject(new Error("Unable to read file"))
    reader.readAsDataURL(file)
  })
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Unable to export image"))
        else resolve(blob)
      },
      type,
      quality
    )
  })
}

function getMimeFromFile(file: File) {
  if (file.type) return file.type
  const ext = file.name.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "png": return "image/png"
    case "jpg":
    case "jpeg": return "image/jpeg"
    case "webp": return "image/webp"
    case "bmp": return "image/bmp"
    case "gif": return "image/gif"
    default: return "image/*"
  }
}

function isLikelyQrImageFile(file: File) {
  return ["image/png", "image/jpeg", "image/webp", "image/bmp", "image/gif"].includes(getMimeFromFile(file))
}

function normalizeDecodedText(text: string) {
  return text.replace(/\r\n/g, "\n").trim()
}

function parseMultiLineInputs(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function maybeUrl(value: string) {
  if (/^https?:\/\//i.test(value) || /^www\./i.test(value)) return value.startsWith("http") ? value : `https://${value}`
  return value
}

function QRPreviewFrame({
  className = "",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`transition-all duration-300 rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 ${className}`}>
      {children}
    </div>
  )
}

function InputHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{children}</p>
}

export default function QRCodeTool({ tool }: ToolHeroProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("generate")
  const [mode, setMode] = useState<QRMode>("text")
  const [qrSize, setQrSize] = useState<QRSize>("medium")
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M")
  const [includeMargin] = useState(true)
  const [fgColor, setFgColor] = useState("#0f172a")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [qrStyle, setQrStyle] = useState<QRStylePreset>("classic")
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg")
  const [scale] = useState(4)
  const [logoDataUrl, setLogoDataUrl] = useState<string>("")
  const [, setLogoFileName] = useState("")
  const [logoScale] = useState(18)
  const [, setGeneratedBatch] = useState<string[]>([])
  const [batchInput, setBatchInput] = useState("")
  const [decodedItems, setDecodedItems] = useState<DecodedItem[]>([])
  const [decodedText, setDecodedText] = useState<string | null>(null)
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraText, setCameraText] = useState<string>("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle")
  const [copiedFromDecode, setCopiedFromDecode] = useState(false)
  const [form, setForm] = useState<QRFormState>({
    text: "",
    url: "",
    wifiSsid: "",
    wifiPassword: "",
    wifiSecurity: "WPA",
    wifiHidden: false,
    emailTo: "",
    emailSubject: "",
    emailBody: "",
    phoneNumber: "",
    smsNumber: "",
    smsMessage: "",
    whatsappNumber: "",
    whatsappMessage: "",
    vcardFirstName: "",
    vcardLastName: "",
    vcardOrg: "",
    vcardTitle: "",
    vcardPhone: "",
    vcardEmail: "",
    vcardUrl: "",
    locationLat: "",
    locationLng: "",
    locationLabel: "",
    calendarTitle: "",
    calendarStart: "",
    calendarEnd: "",
    calendarLocation: "",
    calendarDescription: "",
    pdfUrl: "",
  })

  const svgWrapperRef = useRef<HTMLDivElement>(null)
  const decodeCanvasRef = useRef<HTMLCanvasElement>(null)
  const decodeFileInputRef = useRef<HTMLInputElement>(null)
  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const copyTimerRef = useRef<number | null>(null)
  const scanTimerRef = useRef<number | null>(null)
  const historyLoadedRef = useRef(false)

  const sizePx = sizeMap[qrSize]

  useEffect(() => {
    if (typeof window === "undefined") return
    const decodedStored = window.localStorage.getItem(localStorageKeys.decoded)
    if (decodedStored) {
      try {
        setDecodedItems(JSON.parse(decodedStored) as DecodedItem[])
      } catch {
        window.localStorage.removeItem(localStorageKeys.decoded)
      }
    }
    historyLoadedRef.current = true
  }, [])

  useEffect(() => {
    if (!historyLoadedRef.current || typeof window === "undefined") return
    window.localStorage.setItem(localStorageKeys.decoded, JSON.stringify(decodedItems.slice(0, 30)))
  }, [decodedItems])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
      if (scanTimerRef.current) window.clearInterval(scanTimerRef.current)
      if (cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      if (cameraText.startsWith("blob:")) URL.revokeObjectURL(cameraText)
    }
  }, [cameraText])

  useEffect(() => {
    if (!isRecording) {
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current)
        scanTimerRef.current = null
      }
      return
    }
    const scan = () => {
      const video = cameraVideoRef.current
      const canvas = cameraCanvasRef.current
      if (!video || !canvas || video.readyState < 2) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, canvas.width, canvas.height)
      if (code?.data) {
        const value = normalizeDecodedText(code.data)
        setCameraText(value)
        setDecodedText(value)
        setDecodeError(null)
      }
    }
    scanTimerRef.current = window.setInterval(scan, 350)
    return () => {
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current)
        scanTimerRef.current = null
      }
    }
  }, [isRecording])

  const currentValue = useMemo(() => buildQrValue(mode, form), [mode, form])
  const previewValue = currentValue

  const isDataTooLong = useMemo(() => currentValue.length > QR_MAX_LENGTH, [currentValue])

  const handleCopyCurrent = useCallback(async () => {
    if (!currentValue) return
    try {
      await navigator.clipboard.writeText(currentValue)
      setCopyState("copied")
      toast.success("Copied to clipboard")
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopyState("idle"), 1600)
    } catch {
      setCopyState("failed")
      toast.error("Copy failed")
    }
  }, [currentValue])

  const handleClearGenerator = () => {
    setGeneratedBatch([])
    setBatchInput("")
    setForm((prev) => ({
      ...prev,
      text: "",
      url: "",
      wifiSsid: "",
      wifiPassword: "",
      emailTo: "",
      emailSubject: "",
      emailBody: "",
      phoneNumber: "",
      smsNumber: "",
      smsMessage: "",
      whatsappNumber: "",
      whatsappMessage: "",
      vcardFirstName: "",
      vcardLastName: "",
      vcardOrg: "",
      vcardTitle: "",
      vcardPhone: "",
      vcardEmail: "",
      vcardUrl: "",
      locationLat: "",
      locationLng: "",
      locationLabel: "",
      calendarTitle: "",
      calendarStart: "",
      calendarEnd: "",
      calendarLocation: "",
      calendarDescription: "",
      pdfUrl: "",
    }))
    toast.message("Form reset completely")
  }

  const handleDownloadCurrent = useCallback(async () => {
    const svg = svgWrapperRef.current?.querySelector("svg") as SVGSVGElement | null
    if (!svg || !currentValue) return

    const baseName = `${safeFileName(currentValue)}-${Date.now()}`
    try {
      if (exportFormat === "svg") {
        const serialized = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${baseName}.svg`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const serialized = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("Unable to render QR code"))
          img.src = svgUrl
        })
        const canvas = document.createElement("canvas")
        const targetSize = Math.max(64, Math.round(sizePx * scale))
        canvas.width = targetSize
        canvas.height = targetSize
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Canvas not supported")
        if (exportFormat !== "png") {
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        ctx.drawImage(img, 0, 0, targetSize, targetSize)
        URL.revokeObjectURL(svgUrl)
        const mime = exportFormat === "png" ? "image/png" : exportFormat === "jpg" ? "image/jpeg" : "image/webp"
        const quality = exportFormat === "jpg" || exportFormat === "webp" ? 0.92 : undefined
        const blob = await canvasToBlob(canvas, mime, quality)
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${baseName}.${exportFormat === "jpg" ? "jpg" : exportFormat}`
        a.click()
        URL.revokeObjectURL(url)
      }
      toast.success(`Downloaded ${exportFormat.toUpperCase()}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed")
    }
  }, [currentValue, exportFormat, bgColor, scale, sizePx])

  const handleGenerateBatch = useCallback(() => {
    const items = parseMultiLineInputs(batchInput)
    if (!items.length) {
      setGeneratedBatch([])
      toast.error("Batch input is empty")
      return
    }
    setGeneratedBatch(items)
    toast.success(`Prepared ${items.length} QR codes`)
  }, [batchInput])

  const handleDownloadBatch = useCallback(async () => {
    const items = parseMultiLineInputs(batchInput)
    if (!items.length) {
      toast.error("Batch input is empty")
      return
    }
    try {
      const zip = new JSZip()
      for (let i = 0; i < items.length; i += 1) {
        const value = maybeUrl(items[i])
        zip.file(`${safeFileName(value, `qr-${i + 1}`)}.txt`, value)
      }
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `qr-batch-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Batch ZIP downloaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Batch download failed")
    }
  }, [batchInput])

  const processDecodeFile = useCallback(async (file: File) => {
    if (!isLikelyQrImageFile(file)) {
      setDecodeError("Unsupported format. Use PNG, JPG, WebP, BMP, or GIF.")
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setDecodeError("File size exceeds 20 MB.")
      return
    }
    setDecodeError(null)
    setIsDecoding(true)
    const previewUrl = URL.createObjectURL(file)
    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = dataUrl
      })
      const canvas = decodeCanvasRef.current
      if (!canvas) throw new Error("Canvas not available")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas not available")
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, canvas.width, canvas.height)
      const resultText = code?.data ? normalizeDecodedText(code.data) : ""
      if (!resultText) {
        setDecodeError("No readable QR code detected in the image.")
        return
      }
      setDecodedText(resultText)
      const decoded: DecodedItem = {
        id: uid(),
        fileName: file.name,
        fileSize: file.size,
        text: resultText,
        createdAt: Date.now(),
        previewUrl,
      }
      setDecodedItems((prev) => [decoded, ...prev.filter((item) => item.text !== resultText).slice(0, 29)])
      toast.success("QR code decoded")
    } catch (error) {
      setDecodeError(error instanceof Error ? error.message : "Decoding failed")
      URL.revokeObjectURL(previewUrl)
    } finally {
      setIsDecoding(false)
    }
  }, [])

  const handleDecodeFiles = useCallback(async (files: FileList | File[]) => {
    const items = Array.from(files)
    if (!items.length) return
    setDecodedText(null)
    setDecodeError(null)
    setIsDecoding(true)
    try {
      for (const file of items) {
        await processDecodeFile(file)
      }
    } finally {
      setIsDecoding(false)
    }
  }, [processDecodeFile])

  const handleDecodeReset = useCallback(() => {
    decodedItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setDecodedItems([])
    setDecodedText(null)
    setDecodeError(null)
    setIsDecoding(false)
    setCopiedFromDecode(false)
    if (decodeFileInputRef.current) decodeFileInputRef.current.value = ""
    toast.message("Decoder state reset")
  }, [decodedItems])

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      cameraStreamRef.current = stream
      const video = cameraVideoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setIsRecording(true)
      setCameraReady(true)
      setActiveTab("camera")
      toast.success("Camera started")
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Camera access denied")
      toast.error("Camera access failed")
    }
  }, [])

  const stopCamera = useCallback(() => {
    setIsRecording(false)
    setCameraReady(false)
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      cameraStreamRef.current = null
    }
    const video = cameraVideoRef.current
    if (video) video.srcObject = null
  }, [])

  const copyDecodedText = useCallback(async () => {
    if (!decodedText && !cameraText) return
    const textToCopy = decodedText || cameraText
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedFromDecode(true)
      toast.success("Decoded text copied")
      setTimeout(() => setCopiedFromDecode(false), 1600)
    } catch {
      toast.error("Copy failed")
    }
  }, [decodedText, cameraText])

  const onPasteHandler = useCallback(async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.clipboardData.items)
    const fileItem = items.find((item) => item.kind === "file")
    if (fileItem) {
      const file = fileItem.getAsFile()
      if (file) {
        e.preventDefault()
        if (activeTab === "decode") {
          await processDecodeFile(file)
        } else {
          const dataUrl = await readFileAsDataURL(file)
          setLogoDataUrl(dataUrl)
          setLogoFileName(file.name)
          toast.success("Pasted image set as logo")
        }
        return
      }
    }
    const text = e.clipboardData.getData("text")
    if (text) {
      if (activeTab === "decode") {
        setDecodedText(text)
      } else {
        setForm((prev) => ({ ...prev, text }))
        setMode("text")
      }
    }
  }, [activeTab, processDecodeFile])

  const renderGeneratorInputs = () => {
    const inputStyle = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"

    switch (mode) {
      case "text":
        return (
          <textarea
            value={form.text}
            onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
            placeholder="Enter custom text or notes..."
            rows={4}
            className={`${inputStyle} resize-none font-mono text-xs`}
          />
        )
      case "url":
        return <input value={form.url} onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://example.com" className={`${inputStyle} font-mono text-xs`} />
      case "wifi":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.wifiSsid} onChange={(e) => setForm((prev) => ({ ...prev, wifiSsid: e.target.value }))} placeholder="Network SSID" className={inputStyle} />
            <input value={form.wifiPassword} onChange={(e) => setForm((prev) => ({ ...prev, wifiPassword: e.target.value }))} placeholder="Password" className={inputStyle} />
            <select value={form.wifiSecurity} onChange={(e) => setForm((prev) => ({ ...prev, wifiSecurity: e.target.value as QRFormState["wifiSecurity"] }))} className={inputStyle}>
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Open (No Password)</option>
            </select>
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm cursor-pointer select-none dark:border-slate-700 dark:bg-slate-800/50">
              <input type="checkbox" checked={form.wifiHidden} onChange={(e) => setForm((prev) => ({ ...prev, wifiHidden: e.target.checked }))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Hidden SSID
            </label>
          </div>
        )
      case "email":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.emailTo} onChange={(e) => setForm((prev) => ({ ...prev, emailTo: e.target.value }))} placeholder="Recipient Email" className={inputStyle} />
            <input value={form.emailSubject} onChange={(e) => setForm((prev) => ({ ...prev, emailSubject: e.target.value }))} placeholder="Subject" className={inputStyle} />
            <textarea value={form.emailBody} onChange={(e) => setForm((prev) => ({ ...prev, emailBody: e.target.value }))} placeholder="Email Body" rows={3} className={`${inputStyle} sm:col-span-2 resize-none`} />
          </div>
        )
      case "phone":
        return <input value={form.phoneNumber} onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} placeholder="+1 (555) 000-0000" className={inputStyle} />
      case "sms":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.smsNumber} onChange={(e) => setForm((prev) => ({ ...prev, smsNumber: e.target.value }))} placeholder="Phone Number" className={inputStyle} />
            <input value={form.smsMessage} onChange={(e) => setForm((prev) => ({ ...prev, smsMessage: e.target.value }))} placeholder="Preset Message" className={inputStyle} />
          </div>
        )
      case "whatsapp":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.whatsappNumber} onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))} placeholder="Phone (with country code)" className={inputStyle} />
            <input value={form.whatsappMessage} onChange={(e) => setForm((prev) => ({ ...prev, whatsappMessage: e.target.value }))} placeholder="Pre-filled text" className={inputStyle} />
          </div>
        )
      case "vcard":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.vcardFirstName} onChange={(e) => setForm((prev) => ({ ...prev, vcardFirstName: e.target.value }))} placeholder="First Name" className={inputStyle} />
            <input value={form.vcardLastName} onChange={(e) => setForm((prev) => ({ ...prev, vcardLastName: e.target.value }))} placeholder="Last Name" className={inputStyle} />
            <input value={form.vcardOrg} onChange={(e) => setForm((prev) => ({ ...prev, vcardOrg: e.target.value }))} placeholder="Organization / Co." className={inputStyle} />
            <input value={form.vcardTitle} onChange={(e) => setForm((prev) => ({ ...prev, vcardTitle: e.target.value }))} placeholder="Job Title" className={inputStyle} />
            <input value={form.vcardPhone} onChange={(e) => setForm((prev) => ({ ...prev, vcardPhone: e.target.value }))} placeholder="Phone Number" className={inputStyle} />
            <input value={form.vcardEmail} onChange={(e) => setForm((prev) => ({ ...prev, vcardEmail: e.target.value }))} placeholder="Email Address" className={inputStyle} />
            <input value={form.vcardUrl} onChange={(e) => setForm((prev) => ({ ...prev, vcardUrl: e.target.value }))} placeholder="Website URL" className={`${inputStyle} sm:col-span-2`} />
          </div>
        )
      case "location":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.locationLat} onChange={(e) => setForm((prev) => ({ ...prev, locationLat: e.target.value }))} placeholder="Latitude (e.g. 37.7749)" className={inputStyle} />
            <input value={form.locationLng} onChange={(e) => setForm((prev) => ({ ...prev, locationLng: e.target.value }))} placeholder="Longitude (e.g. -122.4194)" className={inputStyle} />
            <input value={form.locationLabel} onChange={(e) => setForm((prev) => ({ ...prev, locationLabel: e.target.value }))} placeholder="Location Name" className={`${inputStyle} sm:col-span-2`} />
          </div>
        )
      case "calendar":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.calendarTitle} onChange={(e) => setForm((prev) => ({ ...prev, calendarTitle: e.target.value }))} placeholder="Event Name" className={inputStyle} />
            <input value={form.calendarLocation} onChange={(e) => setForm((prev) => ({ ...prev, calendarLocation: e.target.value }))} placeholder="Location" className={inputStyle} />
            <input value={form.calendarStart} onChange={(e) => setForm((prev) => ({ ...prev, calendarStart: e.target.value }))} placeholder="Start Date/Time" className={inputStyle} />
            <input value={form.calendarEnd} onChange={(e) => setForm((prev) => ({ ...prev, calendarEnd: e.target.value }))} placeholder="End Date/Time" className={inputStyle} />
            <textarea value={form.calendarDescription} onChange={(e) => setForm((prev) => ({ ...prev, calendarDescription: e.target.value }))} rows={2} placeholder="Event Notes" className={`${inputStyle} sm:col-span-2 resize-none`} />
          </div>
        )
      case "pdf":
        return <input value={form.pdfUrl} onChange={(e) => setForm((prev) => ({ ...prev, pdfUrl: e.target.value }))} placeholder="https://example.com/document.pdf" className={inputStyle} />
      default:
        return null
    }
  }

  const decodeCopyValue = decodedText || cameraText
  const hasGenerated = Boolean(previewValue && previewValue.trim() && !isDataTooLong)
  const batchItems = useMemo(() => parseMultiLineInputs(batchInput), [batchInput])

  return (
    <div
      onPaste={onPasteHandler}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragOver(false)
      }}
      onDrop={async (e) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = Array.from(e.dataTransfer.files || [])
        if (!files.length) return
        if (activeTab === "decode") {
          await handleDecodeFiles(files)
        } else {
          const first = files[0]
          const dataUrl = await readFileAsDataURL(first)
          setLogoDataUrl(dataUrl)
          setLogoFileName(first.name)
          toast.success("Logo added")
        }
      }}
      className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100"
    >
      <div className="w-full max-w-7xl space-y-6">
        <ToolHero tool={tool} />

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-black/40">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight">QR Studio Pro</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Generator & Scanner Toolkit</p>
              </div>
            </div>

            {/* Main Segmented Switcher */}
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-950/60 mr-20">
              {(
                [
                  { id: "generate", label: "Generate", icon: QrCode },
                  { id: "decode", label: "Decode", icon: FileImage },
                  { id: "camera", label: "Camera", icon: Camera },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              {isDragOver && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                  <Sparkles className="h-3 w-3 animate-spin" /> Drop file here
                </span>
              )}
              <button
                onClick={handleClearGenerator}
                title="Reset generator state"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Core Body Container */}
          <div className="grid gap-6 p-6 xl:grid-cols-12">
            
            {/* LEFT COLUMN: Input Control Center (7 cols on desktop) */}
            <div className={`space-y-6 xl:col-span-7 ${activeTab !== "generate" ? "hidden xl:block" : ""}`}>
              <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white/50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Select Mode & Payload</h2>
                    <InputHint>Choose data type and configure properties</InputHint>
                  </div>
                  
                  {/* Mode Dropdown */}
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as QRMode)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="text">Text Payload</option>
                    <option value="url">Web URL</option>
                    <option value="wifi">WiFi Network</option>
                    <option value="email">Email Draft</option>
                    <option value="phone">Phone Contact</option>
                    <option value="sms">SMS Text</option>
                    <option value="whatsapp">WhatsApp Link</option>
                    <option value="vcard">vCard Contact</option>
                    <option value="location">Map Location</option>
                    <option value="calendar">Calendar Event</option>
                    <option value="pdf">PDF Link</option>
                  </select>
                </div>

                {/* Form Input Container */}
                <div className="min-h-[110px] space-y-3">{renderGeneratorInputs()}</div>

                <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Batch Processing</span>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      placeholder="Multiple URLs/Texts (New line per item)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                    <button
                      onClick={handleGenerateBatch}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <FilePlus className="h-3.5 w-3.5" /> Batch
                    </button>
                    {batchItems.length > 0 && (
                      <button
                        onClick={handleDownloadBatch}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        <Download className="h-3.5 w-3.5" /> ZIP
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Design Customization Accordion/Section */}
              <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Appearance & Styling</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Size</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["small", "medium", "large", "xlarge"] as QRSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => setQrSize(size)}
                          className={`rounded-lg border py-1.5 text-[11px] font-semibold transition ${
                            qrSize === size
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Preset Style</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["classic", "rounded", "glass"] as QRStylePreset[]).map((style) => (
                        <button
                          key={style}
                          onClick={() => setQrStyle(style)}
                          className={`rounded-lg border py-1.5 text-[11px] font-semibold capitalize transition ${
                            qrStyle === style
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Error Tolerance</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(["L", "M", "Q", "H"] as ErrorCorrectionLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setErrorLevel(level)}
                          className={`rounded-lg border py-1.5 text-[11px] font-semibold transition ${
                            errorLevel === level
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Foreground</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-8 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800" />
                      <span className="font-mono text-xs uppercase text-slate-500">{fgColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Background</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800" />
                      <span className="font-mono text-xs uppercase text-slate-500">{bgColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Export Format</label>
                    <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as ExportFormat)} className="w-full rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <option value="svg">SVG Vector</option>
                      <option value="png">PNG Image</option>
                      <option value="jpg">JPG Image</option>
                      <option value="webp">WebP Image</option>
                    </select>
                  </div>
                </div>

                {/* Optional Center Logo Settings */}
                <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Custom Overlay Logo</span>
                      <InputHint>Center image embedded within QR</InputHint>
                    </div>
                    <div className="flex items-center gap-2">
                      {logoDataUrl && (
                        <button onClick={() => { setLogoDataUrl(""); setLogoFileName("") }} className="text-xs font-medium text-rose-500 hover:underline">
                          Remove
                        </button>
                      )}
                      <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                        <Upload className="h-3 w-3" /> Select Logo
                      </button>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*,.svg" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const dataUrl = await readFileAsDataURL(file); setLogoDataUrl(dataUrl); setLogoFileName(file.name); toast.success("Logo added") }} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Interactive View / Display Panel (5 cols on desktop) */}
            <div className="space-y-6 xl:col-span-5">
              
              {/* Generator Live Preview Frame */}
              {activeTab === "generate" && (
                <div className="flex flex-col items-center justify-between space-y-5 rounded-2xl border border-slate-200/80 bg-white/50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Preview</span>
                    <button
                      onClick={handleCopyCurrent}
                      disabled={!currentValue}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 disabled:opacity-40 dark:text-blue-400"
                    >
                      <Copy className="h-3.5 w-3.5" /> {copyState === "copied" ? "Copied!" : "Copy Value"}
                    </button>
                  </div>

                  <QRPreviewFrame className={qrStyle === "glass" ? "border-white/30 bg-white/10 backdrop-blur-md shadow-xl" : qrStyle === "rounded" ? "rounded-3xl" : "rounded-2xl"}>
                    <div ref={svgWrapperRef} className="flex flex-col items-center justify-center">
                      {previewValue && !isDataTooLong ? (
                        <QRCodeSVG
                          value={maybeUrl(previewValue)}
                          size={sizePx}
                          level={errorLevel}
                          fgColor={fgColor}
                          bgColor={bgColor}
                          includeMargin={includeMargin}
                          imageSettings={
                            logoDataUrl
                              ? {
                                  src: logoDataUrl,
                                  height: logoScale * 2,
                                  width: logoScale * 2,
                                  excavate: true,
                                }
                              : undefined
                          }
                        />
                      ) : previewValue && isDataTooLong ? (
                        <div className="flex flex-col items-center gap-2 p-4 text-center text-amber-600">
                          <AlertCircle className="h-8 w-8" />
                          <span className="text-xs font-semibold">Content exceeds limit (~4000 chars)</span>
                        </div>
                      ) : (
                        <div className="flex h-48 w-48 flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                          <QrCode className="h-12 w-12 stroke-1" />
                          <span className="mt-2 text-xs">Enter content to render</span>
                        </div>
                      )}
                    </div>
                  </QRPreviewFrame>

                  <div className="flex w-full gap-2">
                    <button
                      onClick={handleDownloadCurrent}
                      disabled={!hasGenerated}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" /> Download QR
                    </button>
                  </div>

                  <div className="w-full rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 text-left dark:border-slate-800 dark:bg-slate-900/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Encoded Output</span>
                    <p className="mt-1 max-h-16 overflow-auto font-mono text-xs text-slate-600 break-all dark:text-slate-300">
                      {currentValue || "No value currently formatted."}
                    </p>
                  </div>
                </div>
              )}

              {/* Decoder Tab */}
              {activeTab === "decode" && (
                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Decode QR Image</h2>
                    <button onClick={handleDecodeReset} className="text-xs text-slate-500 hover:underline">Reset</button>
                  </div>

                  <div
                    onClick={() => decodeFileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
                      isDragOver ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-700 dark:bg-slate-800/40"
                    }`}
                  >
                    <FileImage className="h-8 w-8 text-slate-400" />
                    <span className="mt-2 text-xs font-semibold">Click or drag image file here</span>
                    <span className="text-[10px] text-slate-400">Supports PNG, JPG, WebP</span>
                    <input ref={decodeFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files?.length && handleDecodeFiles(e.target.files)} />
                  </div>

                  {isDecoding && (
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> Processing file...
                    </div>
                  )}

                  {decodeError && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {decodeError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500">Decoded Text Result</span>
                    <div className="min-h-[90px] max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs break-all dark:border-slate-700 dark:bg-slate-800">
                      {decodedText || <span className="text-slate-400 italic">No text decoded yet.</span>}
                    </div>
                    {decodedText && (
                      <div className="flex gap-2 pt-1">
                        <button onClick={copyDecodedText} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                          <Copy className="h-3.5 w-3.5" /> Copy Result
                        </button>
                        <button onClick={() => { setForm((prev) => ({ ...prev, text: decodedText })); setMode("text"); setActiveTab("generate") }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <Link2 className="h-3.5 w-3.5" /> Edit in Generator
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Camera Scanner Tab */}
              {activeTab === "camera" && (
                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Webcam Live Scanner</h2>
                    {!isRecording ? (
                      <button onClick={startCamera} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                        <Camera className="h-3.5 w-3.5" /> Start Feed
                      </button>
                    ) : (
                      <button onClick={stopCamera} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20">
                        <X className="h-3.5 w-3.5" /> Stop
                      </button>
                    )}
                  </div>

                  {cameraError && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {cameraError}
                    </div>
                  )}

                  <div className="relative overflow-hidden rounded-2xl bg-black h-56 flex items-center justify-center">
                    <video ref={cameraVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                    {!isRecording && <span className="text-xs text-slate-500">Camera offline</span>}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500">Detected Code Data</span>
                    <div className="min-h-[60px] max-h-32 overflow-auto rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs break-all dark:border-slate-700 dark:bg-slate-800">
                      {cameraText || <span className="text-slate-400 italic">Scanning stream...</span>}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <canvas ref={decodeCanvasRef} className="hidden" />
          <canvas ref={cameraCanvasRef} className="hidden" />
        </div>
      </div>
    </div>
  )
}