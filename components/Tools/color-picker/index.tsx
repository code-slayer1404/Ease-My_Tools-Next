"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import {
  Copy,
  Save,
  Pipette,
  Upload,
  X,
  Palette,
  ImagePlus,
  Check,
} from "lucide-react"
import { ToolHeroProps } from "@/types/tool"
import ToolHero from "@/components/tool-page-helpers/ToolHero"

/* ---------- COLOR CONVERSIONS ---------- */
const rgbToHsv = (
  r: number,
  g: number,
  b: number
): [number, number, number] => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else h = ((r - g) / d + 4) * 60
  }
  return [Math.round(h), Math.round(s * 100), Math.round(v * 100)]
}

const hsvToRgb = (
  h: number,
  s: number,
  v: number
): [number, number, number] => {
  s /= 100
  v /= 100
  const i = Math.floor(h / 60),
    f = h / 60 - i
  const p = v * (1 - s),
    q = v * (1 - s * f),
    t = v * (1 - s * (1 - f))
  let r = 0,
    g = 0,
    b = 0
  switch (i % 6) {
    case 0:
      r = v; g = t; b = p; break
    case 1:
      r = q; g = v; b = p; break
    case 2:
      r = p; g = v; b = t; break
    case 3:
      r = p; g = q; b = v; break
    case 4:
      r = t; g = p; b = v; break
    case 5:
      r = v; g = p; b = q; break
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

const hsvToHex = (h: number, s: number, v: number): string => {
  const [r, g, b] = hsvToRgb(h, s, v)
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const hexToHsv = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return rgbToHsv(r, g, b)
}

const hsvToHsl = (
  h: number,
  s: number,
  v: number
): [number, number, number] => {
  s /= 100
  v /= 100
  const l = ((2 - s) * v) / 2
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)
  return [h, Math.round(sl * 100), Math.round(l * 100)]
}

const hslToHsv = (
  h: number,
  s: number,
  l: number
): [number, number, number] => {
  s /= 100
  l /= 100
  const v = l + s * Math.min(l, 1 - l)
  const sv = v === 0 ? 0 : 2 * (1 - l / v)
  return [h, Math.round(sv * 100), Math.round(v * 100)]
}

/* ---------- HARMONIES ---------- */
const getHarmonies = (hue: number) => ({
  complementary: [(hue + 180) % 360],
  splitComplementary: [(hue + 150) % 360, (hue + 210) % 360],
  analogous: [(hue + 30) % 360, (hue - 30 + 360) % 360],
  triadic: [(hue + 120) % 360, (hue + 240) % 360],
  tetradic: [(hue + 60) % 360, (hue + 180) % 360, (hue + 240) % 360],
  monochromatic: [-20, -10, 10, 20].map((d) => (hue + d + 360) % 360),
})

/* ---------- EXTRACT PALETTE FROM IMAGE ---------- */
async function extractPalette(file: File, count = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const maxDim = 100
      let w = img.width,
        h = img.height
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round(h * (maxDim / w)); w = maxDim
        } else {
          w = Math.round(w * (maxDim / h)); h = maxDim
        }
      }
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) { reject(new Error("Canvas not supported")); return }
      ctx.drawImage(img, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h).data
      const colorMap = new Map<string, number>()
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i] >> 4,
          g = imageData[i + 1] >> 4,
          b = imageData[i + 2] >> 4
        const key = `${r},${g},${b}`
        colorMap.set(key, (colorMap.get(key) || 0) + 1)
      }
      const sorted = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1])
      resolve(
        sorted.slice(0, count).map(([key]) => {
          const [r, g, b] = key.split(",").map(Number)
          const hexR = ((r << 4) | 0xf).toString(16).padStart(2, "0")
          const hexG = ((g << 4) | 0xf).toString(16).padStart(2, "0")
          const hexB = ((b << 4) | 0xf).toString(16).padStart(2, "0")
          return `#${hexR}${hexG}${hexB}`
        })
      )
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}

/* ========== MAIN TOOL ========== */
export default function ColorPickerTool({ tool }: ToolHeroProps) {
  const [hue, setHue] = useState(0)
  const [sat, setSat] = useState(100)
  const [val, setVal] = useState(100)

  const hex = hsvToHex(hue, sat, val)
  const [r, g, b] = hsvToRgb(hue, sat, val)
  const [hl, sl, ll] = hsvToHsl(hue, sat, val)

  const [hexInput, setHexInput] = useState(hex)
  const [rgbInput, setRgbInput] = useState({ r, g, b })
  const [hslInput, setHslInput] = useState({ h: hl, s: sl, l: ll })

  const [saved, setSaved] = useState<string[]>([])
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)

  const [extractImage, setExtractImage] = useState<File | null>(null)
  const [extracted, setExtracted] = useState<string[]>([])
  const [extracting, setExtracting] = useState(false)
  const [extractErr, setExtractErr] = useState<string | null>(null)

  const svCanvasRef = useRef<HTMLCanvasElement>(null)
  const hueCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHexInput(hex)
    setRgbInput({ r, g, b })
    setHslInput({ h: hl, s: sl, l: ll })
  }, [hex, r, g, b, hl, sl, ll])

  // ------ DRAWING ------
  const drawSV = useCallback(() => {
    const canvas = svCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = hsvToHex(hue, 100, 100)
    ctx.fillRect(0, 0, w, h)
    const satGrad = ctx.createLinearGradient(0, 0, w, 0)
    satGrad.addColorStop(0, "rgba(255,255,255,1)")
    satGrad.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = satGrad
    ctx.fillRect(0, 0, w, h)
    const valGrad = ctx.createLinearGradient(0, 0, 0, h)
    valGrad.addColorStop(0, "rgba(0,0,0,0)")
    valGrad.addColorStop(1, "rgba(0,0,0,1)")
    ctx.fillStyle = valGrad
    ctx.fillRect(0, 0, w, h)
    const x = (sat / 100) * w
    const y = (1 - val / 100) * h
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.fill()
    ctx.strokeStyle = "rgba(0,0,0,0.4)"
    ctx.lineWidth = 2
    ctx.stroke()
  }, [hue, sat, val])

  const drawHue = useCallback(() => {
    const canvas = hueCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)
    const trackH = 4
    const trackY = (h - trackH) / 2
    const grad = ctx.createLinearGradient(0, 0, w, 0)
    for (let i = 0; i <= 360; i += 30)
      grad.addColorStop(i / 360, hsvToHex(i, 100, 100))
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(0, trackY, w, trackH, trackH / 2)
    ctx.fill()
    const thumbX = (hue / 360) * w
    ctx.beginPath()
    ctx.arc(thumbX, h / 2, 8, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.fill()
    ctx.strokeStyle = "rgba(0,0,0,0.2)"
    ctx.lineWidth = 2
    ctx.stroke()
  }, [hue])

  useEffect(() => { drawSV() }, [drawSV])
  useEffect(() => { drawHue() }, [drawHue])

  // ------ MOUSE / TOUCH HANDLERS ------
  const handleSVMouseDown = (e: React.MouseEvent) => {
    const canvas = svCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const onMove = (ev: MouseEvent) => {
      const nx = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      const ny = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height))
      setSat(Math.round(nx * 100))
      setVal(Math.round((1 - ny) * 100))
    }
    onMove(e.nativeEvent)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", onMove)
    }, { once: true })
  }

  const handleSVTouch = (e: React.TouchEvent) => {
    const canvas = svCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const nx = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
    const ny = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height))
    setSat(Math.round(nx * 100))
    setVal(Math.round((1 - ny) * 100))
    e.preventDefault()
  }

  const handleHueMouseDown = (e: React.MouseEvent) => {
    const canvas = hueCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const onMove = (ev: MouseEvent) => {
      const nx = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      setHue(Math.round(nx * 360))
    }
    onMove(e.nativeEvent)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", onMove)
    }, { once: true })
  }

  const handleHueTouch = (e: React.TouchEvent) => {
    const canvas = hueCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const nx = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width))
    setHue(Math.round(nx * 360))
    e.preventDefault()
  }

  // ------ INPUT HANDLERS ------
  const onHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setHexInput(v)
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      const [nh, ns, nv] = hexToHsv(v)
      setHue(nh); setSat(ns); setVal(nv)
    }
  }

  const onRgbChange = (ch: "r" | "g" | "b", val: string) => {
    const num = Math.min(255, Math.max(0, parseInt(val) || 0))
    const newRgb = { ...rgbInput, [ch]: num }
    setRgbInput(newRgb)
    const [nh, ns, nv] = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)
    setHue(nh); setSat(ns); setVal(nv)
  }

  const onHslChange = (ch: "h" | "s" | "l", val: string) => {
    const num = ch === "h" ? Math.min(360, Math.max(0, parseInt(val) || 0)) : Math.min(100, Math.max(0, parseInt(val) || 0))
    const newHsl = { ...hslInput, [ch]: num }
    setHslInput(newHsl)
    const [nh, ns, nv] = hslToHsv(newHsl.h, newHsl.s, newHsl.l)
    setHue(nh); setSat(ns); setVal(nv)
  }

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLabel(label)
    setTimeout(() => setCopiedLabel(null), 1500)
  }

  const addSave = () => {
    if (!saved.includes(hex)) setSaved((p) => [...p, hex])
  }
  const removeSave = (c: string) => setSaved((p) => p.filter((x) => x !== c))

  const startDropper = useCallback(async () => {
    if (!("EyeDropper" in window)) {
      alert("EyeDropper not supported. Try Chrome or Edge.")
      return
    }
    try {
      const dropper = new (window as any).EyeDropper()
      const result = await dropper.open()
      const newHex = result.sRGBHex
      const [nh, ns, nv] = hexToHsv(newHex)
      setHue(nh); setSat(ns); setVal(nv)
      if (!saved.includes(newHex)) setSaved((p) => [...p, newHex])
    } catch { /* cancelled */ }
  }, [saved])

  const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setExtractErr("Please select an image file.")
      return
    }
    setExtractErr(null)
    setExtractImage(file)
    setExtracted([])
  }

  const performExtraction = async () => {
    if (!extractImage) return
    setExtracting(true)
    setExtractErr(null)
    try {
      const colors = await extractPalette(extractImage)
      setExtracted(colors)
    } catch (err: any) {
      setExtractErr(err.message)
    } finally {
      setExtracting(false)
    }
  }

  const harmonies = getHarmonies(hue)
  const harmonyGroups = [
    ["Comp.", harmonies.complementary],
    ["Split C.", harmonies.splitComplementary],
    ["Analog.", harmonies.analogous],
    ["Triadic", harmonies.triadic],
    ["Tetrad.", harmonies.tetradic],
    ["Mono.", harmonies.monochromatic],
  ] as const

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="w-full max-w-5xl space-y-8">
        {/* Tool Hero Header */}
        <ToolHero tool={tool} />

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr]">
            {/* LEFT COLUMN – Color picker & inputs */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-xs space-y-5">
                <canvas
                  ref={svCanvasRef}
                  width={200}
                  height={200}
                  className="mx-auto w-full cursor-crosshair rounded-xl border border-slate-300 shadow-inner dark:border-slate-700"
                  onMouseDown={handleSVMouseDown}
                  onTouchStart={handleSVTouch}
                />
                <canvas
                  ref={hueCanvasRef}
                  width={200}
                  height={24}
                  className="mx-auto h-6 w-full cursor-pointer rounded-full border border-slate-300 shadow-inner dark:border-slate-700"
                  onMouseDown={handleHueMouseDown}
                  onTouchStart={handleHueTouch}
                />

                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg border border-slate-300 shadow-sm dark:border-slate-700"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="flex-1 truncate font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {hex}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={addSave}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <Save className="mr-1 inline h-3.5 w-3.5" />
                      Save
                    </button>
                    <button
                      onClick={startDropper}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Pipette className="mr-1 inline h-3.5 w-3.5" />
                      Pick
                    </button>
                  </div>
                </div>

                {/* Color value inputs */}
                <div className="space-y-3">
                  {/* HEX */}
                  <div className="flex items-center gap-2">
                    <label className="w-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      HEX
                    </label>
                    <input
                      type="text"
                      value={hexInput}
                      onChange={onHexChange}
                      className="flex-1 rounded-lg border border-slate-300 bg-white/80 px-2 py-1.5 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                    />
                    <button
                      onClick={() => copy(hex, "HEX")}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {/* RGB */}
                  <div className="flex items-center gap-2">
                    <label className="w-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      RGB
                    </label>
                    <div className="flex flex-1 gap-1.5">
                      <input
                        type="number"
                        min={0} max={255}
                        value={rgbInput.r}
                        onChange={(e) => onRgbChange("r", e.target.value)}
                        className="w-1/3 rounded-lg border border-slate-300 bg-white/80 px-1.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                      />
                      <input
                        type="number"
                        min={0} max={255}
                        value={rgbInput.g}
                        onChange={(e) => onRgbChange("g", e.target.value)}
                        className="w-1/3 rounded-lg border border-slate-300 bg-white/80 px-1.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                      />
                      <input
                        type="number"
                        min={0} max={255}
                        value={rgbInput.b}
                        onChange={(e) => onRgbChange("b", e.target.value)}
                        className="w-1/3 rounded-lg border border-slate-300 bg-white/80 px-1.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => copy(`rgb(${r},${g},${b})`, "RGB")}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {/* HSL */}
                  <div className="flex items-center gap-2">
                    <label className="w-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      HSL
                    </label>
                    <div className="flex flex-1 gap-1.5">
                      <input
                        type="number"
                        min={0} max={360}
                        value={hslInput.h}
                        onChange={(e) => onHslChange("h", e.target.value)}
                        className="w-1/3 rounded-lg border border-slate-300 bg-white/80 px-1.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                      />
                      <input
                        type="number"
                        min={0} max={100}
                        value={hslInput.s}
                        onChange={(e) => onHslChange("s", e.target.value)}
                        className="w-1/3 rounded-lg border border-slate-300 bg-white/80 px-1.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                      />
                      <input
                        type="number"
                        min={0} max={100}
                        value={hslInput.l}
                        onChange={(e) => onHslChange("l", e.target.value)}
                        className="w-1/3 rounded-lg border border-slate-300 bg-white/80 px-1.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => copy(`hsl(${hl},${sl}%,${ll}%)`, "HSL")}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Copied toast */}
                {copiedLabel && (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <span>{copiedLabel} copied</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN – Image palette, harmonies, saved */}
            <div className="space-y-5">
              {/* Extract from image */}
              <div className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Extract from Image
                  </h3>
                </div>
                <div className="mb-3 flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Upload className="mr-1 inline h-4 w-4" />
                    {extractImage ? extractImage.name : "Choose image"}
                  </button>
                  <button
                    onClick={performExtraction}
                    disabled={!extractImage || extracting}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {extracting ? "..." : "Extract"}
                  </button>
                </div>
                {extractErr && (
                  <p className="mb-2 text-sm text-red-600 dark:text-red-400">{extractErr}</p>
                )}
                {extracted.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {extracted.map((c, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 cursor-pointer rounded-md border border-slate-300 shadow-sm transition-transform hover:scale-110 dark:border-slate-700"
                        style={{ backgroundColor: c }}
                        onClick={() => {
                          const [nh, ns, nv] = hexToHsv(c)
                          setHue(nh); setSat(ns); setVal(nv)
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Harmonies */}
              <div className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Color Harmonies
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {harmonyGroups.map(([name, hues]) => (
                    <div
                      key={name}
                      className="rounded-lg border border-slate-200 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/60"
                    >
                      <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {name}
                      </p>
                      <div className="flex gap-1.5">
                        {[hue, ...hues].map((hueVal, i) => {
                          const c = hsvToHex(hueVal, sat, val)
                          return (
                            <div
                              key={i}
                              className="h-7 w-7 cursor-pointer rounded-md border border-slate-300 transition-transform hover:scale-110 dark:border-slate-700"
                              style={{ backgroundColor: c }}
                              onClick={() => {
                                const [nh, ns, nv] = hexToHsv(c)
                                setHue(nh); setSat(ns); setVal(nv)
                              }}
                              title={c}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved palette */}
              <div className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Saved Palette
                  </h3>
                </div>
                <div className="custom-scrollbar max-h-24 overflow-auto">
                  {saved.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      No colors saved yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {saved.map((c) => (
                        <div key={c} className="group relative">
                          <div
                            className="h-8 w-8 cursor-pointer rounded-md border border-slate-300 shadow-sm transition-transform hover:scale-110 dark:border-slate-700"
                            style={{ backgroundColor: c }}
                            onClick={() => {
                              const [nh, ns, nv] = hexToHsv(c)
                              setHue(nh); setSat(ns); setVal(nv)
                            }}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); removeSave(c) }}
                            className="absolute -top-1 -right-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white group-hover:flex"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #94a3b8 #e2e8f0; }
        .dark .custom-scrollbar { scrollbar-color: #475569 #1e293b; }
      `}</style>
    </div>
  )
}