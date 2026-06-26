"use client"

import React, { useState, useCallback } from "react"

/* ---------- Math utilities ---------- */
const gcd = (a: number, b: number): number => {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b !== 0) [a, b] = [b, a % b]
    return a
}

const simplify = (num: number, den: number): [number, number] => {
    if (den === 0) return [0, 1]
    const g = gcd(num, den)
    return [num / g, den / g]
}

const decimalToFraction = (dec: number, maxDen = 1000): [number, number] => {
    if (isNaN(dec) || !isFinite(dec)) return [0, 1]
    let bestNum = 0,
        bestDen = 1,
        bestErr = Math.abs(dec)
    for (let den = 1; den <= maxDen; den++) {
        const num = Math.round(dec * den)
        const err = Math.abs(dec - num / den)
        if (err < bestErr) {
            bestErr = err
            bestNum = num
            bestDen = den
            if (bestErr < 1e-12) break
        }
    }
    return simplify(bestNum, bestDen)
}

const improperToMixed = (
    num: number,
    den: number
): [number, number, number] => {
    if (den === 0) return [0, 0, 1]
    const sign = (num < 0 ? -1 : 1) * (den < 0 ? -1 : 1)
    const absNum = Math.abs(num)
    const absDen = Math.abs(den)
    const whole = Math.floor(absNum / absDen) * sign
    const rem = absNum % absDen
    if (rem === 0) return [whole, 0, 1]
    if (whole === 0) {
        const [sNum, sDen] = simplify(sign * rem, absDen)
        return [0, sNum, sDen]
    } else {
        const [sNum, sDen] = simplify(rem, absDen)
        return [whole, sNum, sDen]
    }
}

const mixedToImproper = (
    whole: number,
    num: number,
    den: number
): [number, number] => {
    if (den === 0) return [0, 1]
    const sign = whole >= 0 ? 1 : -1
    const improperNum = sign * (Math.abs(whole) * den + num)
    return simplify(improperNum, den)
}

/* ---------- Professional fraction display (whole vertically centered) ---------- */
const FractionDisplay: React.FC<{
    numerator: number
    denominator: number
    whole?: number
    className?: string
}> = ({ numerator, denominator, whole, className = "" }) => {
    if (denominator === 0) return <span className="text-slate-500">∞</span>
    const absNum = Math.abs(numerator)
    const absDen = Math.abs(denominator)
    const isNegative = numerator < 0 !== denominator < 0
    const hasWhole = whole !== undefined && whole !== 0

    if (numerator === 0) {
        return <span className={className}>{hasWhole ? whole : "0"}</span>
    }

    if (!hasWhole) {
        return (
            <span className={`inline-flex items-center gap-0.5 ${className}`}>
                {isNegative && <span className="mr-0.5">−</span>}
                <span className="inline-flex flex-col items-center leading-tight">
                    <span className="border-b border-current px-1 text-[0.85em]">
                        {absNum}
                    </span>
                    <span className="px-1 text-[0.85em]">{absDen}</span>
                </span>
            </span>
        )
    }

    // Mixed number: whole + fraction – vertically centered with the fraction bar
    const wholeSign = whole! < 0 ? -1 : 1
    const displayWhole = Math.abs(whole!)
    const displayNum = absNum
    const displayDen = absDen

    return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
            {wholeSign === -1 && <span className="mr-0.5">−</span>}
            <span>{displayWhole}</span>
            <span className="inline-flex flex-col items-center leading-tight">
                <span className="border-b border-current px-1 text-[0.85em]">
                    {displayNum}
                </span>
                <span className="px-1 text-[0.85em]">{displayDen}</span>
            </span>
        </span>
    )
}

/* ---------- Stat card ---------- */
const StatCard: React.FC<{
    label: string
    value: string | number
    accent: string
    active?: boolean
}> = ({ label, value, accent, active }) => {
    const colors: Record<string, string> = {
        slate: "text-slate-800 dark:text-slate-100",
        emerald: "text-emerald-600 dark:text-emerald-400",
        blue: "text-blue-600 dark:text-blue-400",
        violet: "text-violet-600 dark:text-violet-400",
    }
    return (
        <div
            className={`rounded-lg border px-3 py-2 shadow-sm transition-all ${
                active
                    ? "border-blue-500/60 bg-blue-50/40 ring-1 ring-blue-500/20 dark:border-blue-400/60 dark:bg-blue-900/20"
                    : "border-slate-200/80 bg-white/50 dark:border-slate-800/60 dark:bg-slate-900/50"
            }`}
        >
            <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                {label}
            </div>
            <div className={`text-sm font-bold tabular-nums ${colors[accent]}`}>
                {value}
            </div>
        </div>
    )
}

/* ---------- Reusable panel wrapper (with optional clear button) ---------- */
const Panel: React.FC<{
    title: string
    children: React.ReactNode
    onClear?: () => void
    className?: string
}> = ({ title, children, onClear, className = "" }) => (
    <div
        className={`flex flex-col rounded-xl border border-slate-300 bg-white/50 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 ${className}`}
    >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-slate-100/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <span className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-200">
                {title}
            </span>
            {onClear && (
                <button
                    onClick={onClear}
                    className="rounded-md p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                    title="Clear this section"
                >
                    ✕
                </button>
            )}
        </div>
        <div className="flex-1 p-4">{children}</div>
    </div>
)

/* ---------- Main component ---------- */
const MathToolkit: React.FC = () => {
    /* ========== Universal converter ========== */
    type InputFormat = "decimal" | "fraction" | "percent" | "mixed"
    const [inputFormat, setInputFormat] = useState<InputFormat>("decimal")
    const [universalInput, setUniversalInput] = useState("")

    const [decimalOut, setDecimalOut] = useState<string>("")
    const [percentOut, setPercentOut] = useState<string>("")
    const [fractionNum, setFractionNum] = useState<number>(0)
    const [fractionDen, setFractionDen] = useState<number>(1)
    const [mixedWhole, setMixedWhole] = useState<number>(0)
    const [mixedNum, setMixedNum] = useState<number>(0)
    const [mixedDen, setMixedDen] = useState<number>(1)

    const processUniversalInput = useCallback(
        (raw: string, format: InputFormat) => {
            const s = raw.trim()
            if (!s) {
                setDecimalOut("")
                setPercentOut("")
                setFractionNum(0)
                setFractionDen(1)
                setMixedWhole(0)
                setMixedNum(0)
                setMixedDen(1)
                return
            }

            let dec: number | null = null
            let num = 0,
                den = 1

            try {
                if (format === "decimal") {
                    dec = parseFloat(s)
                    if (isNaN(dec)) return
                    ;[num, den] = decimalToFraction(dec)
                } else if (format === "percent") {
                    const p = parseFloat(s)
                    if (isNaN(p)) return
                    dec = p / 100
                    ;[num, den] = decimalToFraction(dec)
                } else if (format === "fraction") {
                    const parts = s.split("/")
                    if (parts.length !== 2) return
                    num = parseFloat(parts[0])
                    den = parseFloat(parts[1])
                    if (isNaN(num) || isNaN(den) || den === 0) return
                    dec = num / den
                    ;[num, den] = simplify(num, den)
                } else if (format === "mixed") {
                    const match = s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)
                    if (!match) return
                    const w = parseInt(match[1], 10)
                    const n = parseInt(match[2], 10)
                    const d = parseInt(match[3], 10)
                    if (d === 0) return
                    dec = w >= 0 ? w + n / d : w - n / d
                    ;[num, den] = mixedToImproper(w, n, d)
                }

                if (dec === null || isNaN(dec) || !isFinite(dec)) return

                setDecimalOut(dec.toString())
                setPercentOut(`${(dec * 100).toFixed(2)}%`)
                setFractionNum(num)
                setFractionDen(den)

                const [mixedW, mixedN, mixedD] = improperToMixed(num, den)
                setMixedWhole(mixedW)
                setMixedNum(mixedN)
                setMixedDen(mixedD)
            } catch {
                // ignore malformed input
            }
        },
        []
    )

    const handleUniversalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setUniversalInput(val)
        processUniversalInput(val, inputFormat)
    }

    const changeInputFormat = (fmt: InputFormat) => {
        setInputFormat(fmt)
        setUniversalInput("")
        processUniversalInput("", fmt)
    }

    const clearUniversal = () => {
        setUniversalInput("")
        processUniversalInput("", inputFormat)
    }

    /* ========== Fraction tools ========== */
    const [fracTool, setFracTool] = useState<"simplify" | "mixed">("simplify")

    // Simplify
    const [simpNum, setSimpNum] = useState("")
    const [simpDen, setSimpDen] = useState("")
    const [simpResultNum, setSimpResultNum] = useState<number | null>(null)
    const [simpResultDen, setSimpResultDen] = useState<number | null>(null)
    const [simpGcd, setSimpGcd] = useState<number>(0)

    const handleSimplify = () => {
        const n = parseInt(simpNum, 10)
        const d = parseInt(simpDen, 10)
        if (isNaN(n) || isNaN(d) || d === 0) return
        const g = gcd(n, d)
        setSimpGcd(g)
        const [sn, sd] = simplify(n, d)
        setSimpResultNum(sn)
        setSimpResultDen(sd)
    }

    // Mixed ↔ Improper
    const [mixedDirection, setMixedDirection] = useState<
        "toImproper" | "toMixed"
    >("toImproper")
    const [mWhole, setMWhole] = useState("")
    const [mNum, setMNum] = useState("")
    const [mDen, setMDen] = useState("")
    const [iNum, setINum] = useState("")
    const [iDen, setIDen] = useState("")
    const [convResultNum, setConvResultNum] = useState<number>(0)
    const [convResultDen, setConvResultDen] = useState<number>(1)
    const [convWhole, setConvWhole] = useState<number | undefined>(undefined)
    const [convDisplay, setConvDisplay] = useState<string>("")

    const handleMixedConvert = () => {
        if (mixedDirection === "toImproper") {
            const w = parseInt(mWhole, 10)
            const n = parseInt(mNum, 10)
            const d = parseInt(mDen, 10)
            if (isNaN(w) || isNaN(n) || isNaN(d) || d === 0) return
            const [num, den] = mixedToImproper(w, n, d)
            setConvResultNum(num)
            setConvResultDen(den)
            setConvWhole(undefined)
            setConvDisplay(`${num}/${den}`)
        } else {
            const n = parseInt(iNum, 10)
            const d = parseInt(iDen, 10)
            if (isNaN(n) || isNaN(d) || d === 0) return
            const [w, num, den] = improperToMixed(n, d)
            setConvResultNum(num)
            setConvResultDen(den)
            setConvWhole(w)
            if (num === 0) {
                setConvDisplay(`${w}`)
            } else {
                setConvDisplay(`${w} ${num}/${den}`)
            }
        }
    }

    const clearFractionTools = () => {
        setSimpNum("")
        setSimpDen("")
        setSimpResultNum(null)
        setSimpResultDen(null)
        setSimpGcd(0)
        setMWhole("")
        setMNum("")
        setMDen("")
        setINum("")
        setIDen("")
        setConvResultNum(0)
        setConvResultDen(1)
        setConvWhole(undefined)
        setConvDisplay("")
    }

    /* ========== Mobile tabs ========== */
    const [activeTab, setActiveTab] = useState<"universal" | "fractionTools">(
        "universal"
    )

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-5xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    {/* Mobile tabs */}
                    <div className="flex border-b border-slate-200/80 lg:hidden dark:border-slate-800/60">
                        <button
                            onClick={() => setActiveTab("universal")}
                            className={`flex-1 py-3 text-center text-xs font-medium transition ${
                                activeTab === "universal"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            🔢 Universal
                        </button>
                        <button
                            onClick={() => setActiveTab("fractionTools")}
                            className={`flex-1 py-3 text-center text-xs font-medium transition ${
                                activeTab === "fractionTools"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            🧮 Fraction Tools
                        </button>
                    </div>

                    {/* Main grid: left column wider, right column narrower */}
                    <div className="p-5 sm:p-6">
                        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
                            {/* Left panel: Universal Converter */}
                            <div
                                className={
                                    activeTab === "universal"
                                        ? ""
                                        : "hidden lg:block"
                                }
                            >
                                <Panel
                                    title="🔢 Universal Converter"
                                    onClear={clearUniversal}
                                >
                                    <div className="space-y-4">
                                        {/* Input format toggle */}
                                        <div>
                                            <label className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                Input format
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(
                                                    [
                                                        "decimal",
                                                        "fraction",
                                                        "percent",
                                                        "mixed",
                                                    ] as const
                                                ).map((fmt) => (
                                                    <button
                                                        key={fmt}
                                                        onClick={() =>
                                                            changeInputFormat(
                                                                fmt
                                                            )
                                                        }
                                                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                                            inputFormat === fmt
                                                                ? "border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                                                                : "border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                                        }`}
                                                    >
                                                        {fmt === "decimal" &&
                                                            "Decimal"}
                                                        {fmt === "fraction" &&
                                                            "Fraction"}
                                                        {fmt === "percent" &&
                                                            "Percent"}
                                                        {fmt === "mixed" &&
                                                            "Mixed"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Input field */}
                                        <input
                                            type="text"
                                            value={universalInput}
                                            onChange={handleUniversalInput}
                                            placeholder={
                                                inputFormat === "decimal"
                                                    ? "e.g., 0.75"
                                                    : inputFormat === "fraction"
                                                      ? "e.g., 3/4"
                                                      : inputFormat ===
                                                          "percent"
                                                        ? "e.g., 75%"
                                                        : "e.g., 1 1/2"
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
                                        />

                                        {/* Output cards */}
                                        {decimalOut !== "" && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <StatCard
                                                    label="Decimal"
                                                    value={decimalOut}
                                                    accent="slate"
                                                    active={
                                                        inputFormat ===
                                                        "decimal"
                                                    }
                                                />
                                                <StatCard
                                                    label="Percent"
                                                    value={percentOut}
                                                    accent="emerald"
                                                    active={
                                                        inputFormat ===
                                                        "percent"
                                                    }
                                                />
                                                {/* Fraction card with visual fraction */}
                                                <div
                                                    className={`rounded-lg border px-3 py-2 shadow-sm transition-all ${
                                                        inputFormat ===
                                                        "fraction"
                                                            ? "border-blue-500/60 bg-blue-50/40 ring-1 ring-blue-500/20 dark:border-blue-400/60 dark:bg-blue-900/20"
                                                            : "border-slate-200/80 bg-white/50 dark:border-slate-800/60 dark:bg-slate-900/50"
                                                    }`}
                                                >
                                                    <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                                        Fraction
                                                    </div>
                                                    <div className="mt-0.5">
                                                        <FractionDisplay
                                                            numerator={
                                                                fractionNum
                                                            }
                                                            denominator={
                                                                fractionDen
                                                            }
                                                            className="text-sm font-bold text-blue-600 tabular-nums dark:text-blue-400"
                                                        />
                                                    </div>
                                                </div>
                                                {/* Mixed number card – N/A when |value| < 1 */}
                                                <div
                                                    className={`rounded-lg border px-3 py-2 shadow-sm transition-all ${
                                                        inputFormat === "mixed"
                                                            ? "border-blue-500/60 bg-blue-50/40 ring-1 ring-blue-500/20 dark:border-blue-400/60 dark:bg-blue-900/20"
                                                            : "border-slate-200/80 bg-white/50 dark:border-slate-800/60 dark:bg-slate-900/50"
                                                    }`}
                                                >
                                                    <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                                        Mixed Number
                                                    </div>
                                                    <div className="mt-0.5">
                                                        {Math.abs(
                                                            Number(decimalOut)
                                                        ) < 1 ? (
                                                            <span className="text-sm font-bold text-slate-400">
                                                                N/A
                                                            </span>
                                                        ) : mixedNum === 0 ? (
                                                            <span className="text-sm font-bold text-violet-600 tabular-nums dark:text-violet-400">
                                                                {mixedWhole}
                                                            </span>
                                                        ) : (
                                                            <FractionDisplay
                                                                numerator={
                                                                    mixedNum
                                                                }
                                                                denominator={
                                                                    mixedDen
                                                                }
                                                                whole={
                                                                    mixedWhole
                                                                }
                                                                className="text-sm font-bold text-violet-600 tabular-nums dark:text-violet-400"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                            </div>

                            {/* Right panel: Fraction Tools (narrower column) */}
                            <div
                                className={
                                    activeTab === "fractionTools"
                                        ? ""
                                        : "hidden lg:block"
                                }
                            >
                                <Panel
                                    title="🧮 Fraction Tools"
                                    onClear={clearFractionTools}
                                >
                                    <div className="flex flex-col items-center">
                                        {/* Tool selector toggle */}
                                        <div className="mb-5 flex gap-2">
                                            <button
                                                onClick={() =>
                                                    setFracTool("simplify")
                                                }
                                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                                                    fracTool === "simplify"
                                                        ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                        : "border-slate-200 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
                                                }`}
                                            >
                                                Simplify
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setFracTool("mixed")
                                                }
                                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                                                    fracTool === "mixed"
                                                        ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                        : "border-slate-200 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
                                                }`}
                                            >
                                                Mixed ↔ Improper
                                            </button>
                                        </div>

                                        {fracTool === "simplify" ? (
                                            <div className="w-full max-w-xs space-y-4">
                                                <label className="block text-center text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                    Simplify fraction
                                                </label>
                                                <div className="flex items-center justify-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={simpNum}
                                                        onChange={(e) =>
                                                            setSimpNum(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Num"
                                                        className="w-20 rounded-lg border border-slate-300 bg-white/80 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" &&
                                                            handleSimplify()
                                                        }
                                                    />
                                                    <span className="text-sm font-bold">
                                                        /
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={simpDen}
                                                        onChange={(e) =>
                                                            setSimpDen(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Den"
                                                        className="w-20 rounded-lg border border-slate-300 bg-white/80 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" &&
                                                            handleSimplify()
                                                        }
                                                    />
                                                </div>
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={handleSimplify}
                                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold tracking-wide text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                                                    >
                                                        Simplify
                                                    </button>
                                                </div>
                                                {simpResultNum !== null &&
                                                    simpResultDen !== null && (
                                                        <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 text-center dark:border-slate-800/60 dark:bg-slate-900/30">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <FractionDisplay
                                                                    numerator={
                                                                        simpResultNum
                                                                    }
                                                                    denominator={
                                                                        simpResultDen
                                                                    }
                                                                    className="text-base font-bold text-blue-600 dark:text-blue-400"
                                                                />
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                    (GCD:{" "}
                                                                    {simpGcd})
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                Decimal:{" "}
                                                                {(
                                                                    simpResultNum /
                                                                    simpResultDen
                                                                ).toFixed(4)}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-sm space-y-4">
                                                {/* Mixed ↔ Improper conversion tool */}
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setMixedDirection(
                                                                "toImproper"
                                                            )
                                                        }
                                                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                                            mixedDirection ===
                                                            "toImproper"
                                                                ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                                : "border-slate-200 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
                                                        }`}
                                                    >
                                                        Mixed → Improper
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setMixedDirection(
                                                                "toMixed"
                                                            )
                                                        }
                                                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                                            mixedDirection ===
                                                            "toMixed"
                                                                ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                                : "border-slate-200 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
                                                        }`}
                                                    >
                                                        Improper → Mixed
                                                    </button>
                                                </div>

                                                {mixedDirection ===
                                                "toImproper" ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={mWhole}
                                                            onChange={(e) =>
                                                                setMWhole(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Whole"
                                                            className="w-16 rounded-lg border border-slate-300 bg-white/80 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={mNum}
                                                            onChange={(e) =>
                                                                setMNum(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Num"
                                                            className="w-16 rounded-lg border border-slate-300 bg-white/80 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
                                                        />
                                                        <span className="text-sm font-bold">
                                                            /
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={mDen}
                                                            onChange={(e) =>
                                                                setMDen(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Den"
                                                            className="w-16 rounded-lg border border-slate-300 bg-white/80 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
                                                            onKeyDown={(e) =>
                                                                e.key ===
                                                                    "Enter" &&
                                                                handleMixedConvert()
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={iNum}
                                                            onChange={(e) =>
                                                                setINum(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Num"
                                                            className="w-20 rounded-lg border border-slate-300 bg-white/80 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
                                                        />
                                                        <span className="text-sm font-bold">
                                                            /
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={iDen}
                                                            onChange={(e) =>
                                                                setIDen(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Den"
                                                            className="w-20 rounded-lg border border-slate-300 bg-white/80 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
                                                            onKeyDown={(e) =>
                                                                e.key ===
                                                                    "Enter" &&
                                                                handleMixedConvert()
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={
                                                            handleMixedConvert
                                                        }
                                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold tracking-wide text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                                                    >
                                                        Convert
                                                    </button>
                                                </div>

                                                {convDisplay && (
                                                    <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 text-center dark:border-slate-800/60 dark:bg-slate-900/30">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                Result:
                                                            </span>
                                                            {convWhole !==
                                                                undefined &&
                                                            convResultNum >
                                                                0 ? (
                                                                <FractionDisplay
                                                                    numerator={
                                                                        convResultNum
                                                                    }
                                                                    denominator={
                                                                        convResultDen
                                                                    }
                                                                    whole={
                                                                        convWhole
                                                                    }
                                                                    className="text-base font-bold text-violet-600 dark:text-violet-400"
                                                                />
                                                            ) : (
                                                                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                                                                    {
                                                                        convDisplay
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MathToolkit
