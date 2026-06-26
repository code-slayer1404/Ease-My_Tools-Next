"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"

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
            r = v
            g = t
            b = p
            break
        case 1:
            r = q
            g = v
            b = p
            break
        case 2:
            r = p
            g = v
            b = t
            break
        case 3:
            r = p
            g = q
            b = v
            break
        case 4:
            r = t
            g = p
            b = v
            break
        case 5:
            r = v
            g = p
            b = q
            break
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
                    h = Math.round(h * (maxDim / w))
                    w = maxDim
                } else {
                    w = Math.round(w * (maxDim / h))
                    h = maxDim
                }
            }
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext("2d")
            if (!ctx) {
                reject(new Error("Canvas not supported"))
                return
            }
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
            const sorted = Array.from(colorMap.entries()).sort(
                (a, b) => b[1] - a[1]
            )
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
export default function ColorPickerTool() {
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

    // ------ DRAWING (with clearRect fix) ------
    const drawSV = useCallback(() => {
        const canvas = svCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const w = canvas.width,
            h = canvas.height
        ctx.clearRect(0, 0, w, h) // CLEAR before drawing
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
        ctx.arc(x, y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = "#ffffff"
        ctx.fill()
        ctx.strokeStyle = "rgba(0,0,0,0.4)"
        ctx.lineWidth = 1.5
        ctx.stroke()
    }, [hue, sat, val])

    const drawHue = useCallback(() => {
        const canvas = hueCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const w = canvas.width,
            h = canvas.height
        ctx.clearRect(0, 0, w, h) // CLEAR before drawing – fixes blurry trail
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
        ctx.arc(thumbX, h / 2, 7, 0, 2 * Math.PI)
        ctx.fillStyle = "#ffffff"
        ctx.fill()
        ctx.strokeStyle = "rgba(0,0,0,0.2)"
        ctx.lineWidth = 1.5
        ctx.stroke()
    }, [hue])

    useEffect(() => {
        drawSV()
    }, [drawSV])
    useEffect(() => {
        drawHue()
    }, [drawHue])

    // ------ MOUSE / TOUCH HANDLERS ------
    const handleSVMouseDown = (e: React.MouseEvent) => {
        const canvas = svCanvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const onMove = (ev: MouseEvent) => {
            const nx = Math.max(
                0,
                Math.min(1, (ev.clientX - rect.left) / rect.width)
            )
            const ny = Math.max(
                0,
                Math.min(1, (ev.clientY - rect.top) / rect.height)
            )
            setSat(Math.round(nx * 100))
            setVal(Math.round((1 - ny) * 100))
        }
        onMove(e.nativeEvent)
        window.addEventListener("mousemove", onMove)
        window.addEventListener(
            "mouseup",
            () => {
                window.removeEventListener("mousemove", onMove)
            },
            { once: true }
        )
    }

    const handleSVTouch = (e: React.TouchEvent) => {
        const canvas = svCanvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const touch = e.touches[0]
        const nx = Math.max(
            0,
            Math.min(1, (touch.clientX - rect.left) / rect.width)
        )
        const ny = Math.max(
            0,
            Math.min(1, (touch.clientY - rect.top) / rect.height)
        )
        setSat(Math.round(nx * 100))
        setVal(Math.round((1 - ny) * 100))
        e.preventDefault()
    }

    const handleHueMouseDown = (e: React.MouseEvent) => {
        const canvas = hueCanvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const onMove = (ev: MouseEvent) => {
            const nx = Math.max(
                0,
                Math.min(1, (ev.clientX - rect.left) / rect.width)
            )
            setHue(Math.round(nx * 360))
        }
        onMove(e.nativeEvent)
        window.addEventListener("mousemove", onMove)
        window.addEventListener(
            "mouseup",
            () => {
                window.removeEventListener("mousemove", onMove)
            },
            { once: true }
        )
    }

    const handleHueTouch = (e: React.TouchEvent) => {
        const canvas = hueCanvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const nx = Math.max(
            0,
            Math.min(1, (e.touches[0].clientX - rect.left) / rect.width)
        )
        setHue(Math.round(nx * 360))
        e.preventDefault()
    }

    // ------ INPUT HANDLERS ------
    const onHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value
        setHexInput(v)
        if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
            const [nh, ns, nv] = hexToHsv(v)
            setHue(nh)
            setSat(ns)
            setVal(nv)
        }
    }

    const onRgbChange = (ch: "r" | "g" | "b", val: string) => {
        const num = Math.min(255, Math.max(0, parseInt(val) || 0))
        const newRgb = { ...rgbInput, [ch]: num }
        setRgbInput(newRgb)
        const [nh, ns, nv] = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)
        setHue(nh)
        setSat(ns)
        setVal(nv)
    }

    const onHslChange = (ch: "h" | "s" | "l", val: string) => {
        const num =
            ch === "h"
                ? Math.min(360, Math.max(0, parseInt(val) || 0))
                : Math.min(100, Math.max(0, parseInt(val) || 0))
        const newHsl = { ...hslInput, [ch]: num }
        setHslInput(newHsl)
        const [nh, ns, nv] = hslToHsv(newHsl.h, newHsl.s, newHsl.l)
        setHue(nh)
        setSat(ns)
        setVal(nv)
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
            setHue(nh)
            setSat(ns)
            setVal(nv)
            if (!saved.includes(newHex)) setSaved((p) => [...p, newHex])
        } catch {
            /* cancelled */
        }
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
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-5xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    <div className="grid gap-5 px-4 py-5 sm:gap-5 sm:px-5 sm:py-5 lg:grid-cols-[1fr_1.05fr]">
                        {/* LEFT COLUMN – vertically centered */}
                        <div className="flex h-full items-center">
                            <div className="w-full space-y-4">
                                <canvas
                                    ref={svCanvasRef}
                                    width={160}
                                    height={160}
                                    className="mx-auto w-full max-w-[160px] cursor-crosshair rounded-lg border border-slate-300 shadow-sm dark:border-slate-700"
                                    onMouseDown={handleSVMouseDown}
                                    onTouchStart={handleSVTouch}
                                />
                                <canvas
                                    ref={hueCanvasRef}
                                    width={140}
                                    height={18}
                                    className="mx-auto h-[18px] w-full max-w-[140px] cursor-pointer rounded-full border border-slate-300 shadow-sm dark:border-slate-700"
                                    onMouseDown={handleHueMouseDown}
                                    onTouchStart={handleHueTouch}
                                />
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-8 w-8 rounded-lg border border-slate-300 dark:border-slate-700"
                                        style={{ backgroundColor: hex }}
                                    />
                                    <span className="flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {hex}
                                    </span>
                                    <button
                                        onClick={addSave}
                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                                    >
                                        Save Color
                                    </button>
                                    <button
                                        onClick={startDropper}
                                        className="rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        🎯 Pick Color
                                    </button>
                                </div>
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex items-center gap-2">
                                        <label className="w-8 text-[10px] font-semibold text-slate-500 uppercase dark:text-slate-400">
                                            HEX
                                        </label>
                                        <input
                                            type="text"
                                            value={hexInput}
                                            onChange={onHexChange}
                                            className="flex-1 rounded border border-slate-200 bg-white/80 px-2 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                                        />
                                        <button
                                            onClick={() => copy(hex, "HEX")}
                                            className="rounded p-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            ⎘
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="w-8 text-[10px] font-semibold text-slate-500 uppercase dark:text-slate-400">
                                            RGB
                                        </label>
                                        <div className="flex flex-1 gap-1">
                                            <input
                                                type="number"
                                                min={0}
                                                max={255}
                                                value={rgbInput.r}
                                                onChange={(e) =>
                                                    onRgbChange(
                                                        "r",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded border border-slate-200 bg-white/80 px-1 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                                                placeholder="R"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                max={255}
                                                value={rgbInput.g}
                                                onChange={(e) =>
                                                    onRgbChange(
                                                        "g",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded border border-slate-200 bg-white/80 px-1 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                                                placeholder="G"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                max={255}
                                                value={rgbInput.b}
                                                onChange={(e) =>
                                                    onRgbChange(
                                                        "b",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded border border-slate-200 bg-white/80 px-1 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                                                placeholder="B"
                                            />
                                        </div>
                                        <button
                                            onClick={() =>
                                                copy(
                                                    `rgb(${r},${g},${b})`,
                                                    "RGB"
                                                )
                                            }
                                            className="rounded p-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            ⎘
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="w-8 text-[10px] font-semibold text-slate-500 uppercase dark:text-slate-400">
                                            HSL
                                        </label>
                                        <div className="flex flex-1 gap-1">
                                            <input
                                                type="number"
                                                min={0}
                                                max={360}
                                                value={hslInput.h}
                                                onChange={(e) =>
                                                    onHslChange(
                                                        "h",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded border border-slate-200 bg-white/80 px-1 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                                                placeholder="H"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={hslInput.s}
                                                onChange={(e) =>
                                                    onHslChange(
                                                        "s",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded border border-slate-200 bg-white/80 px-1 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                                                placeholder="S"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={hslInput.l}
                                                onChange={(e) =>
                                                    onHslChange(
                                                        "l",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded border border-slate-200 bg-white/80 px-1 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                                                placeholder="L"
                                            />
                                        </div>
                                        <button
                                            onClick={() =>
                                                copy(
                                                    `hsl(${hl},${sl}%,${ll}%)`,
                                                    "HSL"
                                                )
                                            }
                                            className="rounded p-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            ⎘
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN – now with more visible borders */}
                        <div className="space-y-4">
                            <div className="rounded-xl border border-slate-300 bg-white/50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                                <span className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Extract from image
                                </span>
                                <div className="mb-2 flex gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={onImageSelect}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="flex-1 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        {extractImage
                                            ? extractImage.name
                                            : "Choose image"}
                                    </button>
                                    <button
                                        onClick={performExtraction}
                                        disabled={!extractImage || extracting}
                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {extracting ? "..." : "Extract"}
                                    </button>
                                </div>
                                {extractErr && (
                                    <p className="mb-1 text-xs text-rose-500">
                                        {extractErr}
                                    </p>
                                )}
                                {extracted.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {extracted.map((c, i) => (
                                            <div
                                                key={i}
                                                className="h-6 w-6 cursor-pointer rounded border border-slate-300 dark:border-slate-700"
                                                style={{ backgroundColor: c }}
                                                onClick={() => {
                                                    const [nh, ns, nv] =
                                                        hexToHsv(c)
                                                    setHue(nh)
                                                    setSat(ns)
                                                    setVal(nv)
                                                }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-300 bg-white/50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                                <span className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Harmonies
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    {harmonyGroups.map(([name, hues]) => (
                                        <div
                                            key={name}
                                            className="rounded border border-slate-300 bg-white/60 p-2 dark:border-slate-700 dark:bg-slate-900/60"
                                        >
                                            <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                                                {name}
                                            </p>
                                            <div className="mt-1 flex gap-1">
                                                {[hue, ...hues].map(
                                                    (hueVal, i) => {
                                                        const c = hsvToHex(
                                                            hueVal,
                                                            sat,
                                                            val
                                                        )
                                                        return (
                                                            <div
                                                                key={i}
                                                                className="h-5 w-5 cursor-pointer rounded border border-slate-300 transition-transform hover:scale-110 dark:border-slate-700"
                                                                style={{
                                                                    backgroundColor:
                                                                        c,
                                                                }}
                                                                onClick={() => {
                                                                    const [
                                                                        nh,
                                                                        ns,
                                                                        nv,
                                                                    ] =
                                                                        hexToHsv(
                                                                            c
                                                                        )
                                                                    setHue(nh)
                                                                    setSat(ns)
                                                                    setVal(nv)
                                                                }}
                                                                title={c}
                                                            />
                                                        )
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-300 bg-white/50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                                <span className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Saved palette
                                </span>
                                <div className="custom-scrollbar max-h-16 overflow-auto">
                                    {saved.length === 0 ? (
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            No colors saved yet
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {saved.map((c) => (
                                                <div
                                                    key={c}
                                                    className="group relative"
                                                >
                                                    <div
                                                        className="h-6 w-6 cursor-pointer rounded border border-slate-300 dark:border-slate-700"
                                                        style={{
                                                            backgroundColor: c,
                                                        }}
                                                        onClick={() => {
                                                            const [nh, ns, nv] =
                                                                hexToHsv(c)
                                                            setHue(nh)
                                                            setSat(ns)
                                                            setVal(nv)
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeSave(c)
                                                        }}
                                                        className="absolute -top-1 -right-1 hidden h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white group-hover:flex"
                                                    >
                                                        ×
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
