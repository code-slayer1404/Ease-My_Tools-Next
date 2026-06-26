"use client"

import React, { useState, useMemo, useCallback } from "react"

/* ---------- Parse mixed time string (e.g. "2y 3mo 5d 8h 30m 15s") ---------- */
const UNITS: Record<string, number> = {
    // years
    y: 365 * 86400,
    yr: 365 * 86400,
    year: 365 * 86400,
    years: 365 * 86400,
    // months (approximate 30d)
    mo: 30 * 86400,
    month: 30 * 86400,
    months: 30 * 86400,
    // weeks
    w: 7 * 86400,
    wk: 7 * 86400,
    week: 7 * 86400,
    weeks: 7 * 86400,
    // days
    d: 86400,
    day: 86400,
    days: 86400,
    // hours
    h: 3600,
    hr: 3600,
    hour: 3600,
    hours: 3600,
    // minutes
    m: 60,
    min: 60,
    minute: 60,
    minutes: 60,
    // seconds
    s: 1,
    sec: 1,
    second: 1,
    seconds: 1,
}

function parseTimeExpression(str: string): number | null {
    const s = str.trim().toLowerCase()
    if (!s) return null

    // Try colon format: HH:MM:SS or DD:HH:MM:SS
    const colonParts = s.split(":").map(Number)
    if (
        colonParts.length >= 3 &&
        colonParts.length <= 4 &&
        colonParts.every((n) => !isNaN(n) && n >= 0)
    ) {
        let [h, m, sec, d] = [0, 0, 0, 0]
        if (colonParts.length === 3) [h, m, sec] = colonParts
        else [d, h, m, sec] = colonParts
        return d * 86400 + h * 3600 + m * 60 + sec
    }

    // Parse unit-based tokens: e.g. "2h 30m", "1y 2mo 3d"
    let total = 0
    const regex = /(-?\d*\.?\d+)\s*([a-zA-Z]+)/g
    let match
    while ((match = regex.exec(s)) !== null) {
        const value = parseFloat(match[1])
        const unit = match[2].toLowerCase()
        const multiplier = UNITS[unit]
        if (!multiplier) continue
        total += value * multiplier
    }
    // If we found any units, return total
    if (total !== 0) return total

    // Plain number: assume seconds
    const plain = parseFloat(s)
    if (!isNaN(plain)) return plain

    return null
}

/* ---------- Format duration (seconds) to human-friendly string ---------- */
function formatDuration(totalSeconds: number): string {
    if (!isFinite(totalSeconds)) return "—"
    const sign = totalSeconds < 0 ? "−" : ""
    let t = Math.abs(Math.round(totalSeconds))
    const d = Math.floor(t / 86400)
    t %= 86400
    const h = Math.floor(t / 3600)
    t %= 3600
    const m = Math.floor(t / 60)
    const s = t % 60
    const parts = []
    if (d) parts.push(`${d}d`)
    if (h) parts.push(`${h}h`)
    if (m) parts.push(`${m}m`)
    if (s || parts.length === 0) parts.push(`${s}s`)
    return sign + parts.join(" ")
}

function formatDurationDetailed(totalSeconds: number): string {
    if (!isFinite(totalSeconds)) return "—"
    const sign = totalSeconds < 0 ? "−" : ""
    let t = Math.abs(Math.round(totalSeconds))
    const d = Math.floor(t / 86400)
    t %= 86400
    const h = Math.floor(t / 3600)
    t %= 3600
    const m = Math.floor(t / 60)
    const s = t % 60
    return `${sign}${d}d ${h}h ${m}m ${s}s`
}

/* ---------- Stat Card (consistent with design system) ---------- */
const StatCard: React.FC<{
    label: string
    value: string | number
    accent: "slate" | "emerald" | "blue" | "violet"
}> = ({ label, value, accent }) => {
    const colors: Record<string, string> = {
        slate: "text-slate-800 dark:text-slate-100",
        emerald: "text-emerald-600 dark:text-emerald-400",
        blue: "text-blue-600 dark:text-blue-400",
        violet: "text-violet-600 dark:text-violet-400",
    }
    return (
        <div className="rounded-lg border border-slate-200/80 bg-white/50 px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                {label}
            </div>
            <div className={`text-sm font-bold tabular-nums ${colors[accent]}`}>
                {value}
            </div>
        </div>
    )
}

/* ---------- Reusable Panel ---------- */
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
                    title="Clear section"
                >
                    ✕
                </button>
            )}
        </div>
        <div className="flex-1 space-y-4 p-4">{children}</div>
    </div>
)

/* ---------- Time Part Input (d/h/m/s) ---------- */
const TimePartInput: React.FC<{
    label: string
    value: string
    onChange: (v: string) => void
    max?: number
    className?: string
}> = ({ label, value, onChange, max = 999, className = "w-16" }) => (
    <div className="flex items-center gap-1">
        <input
            type="number"
            min={0}
            max={max}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className={`rounded-lg border border-slate-300 bg-white/80 px-2 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 ${className}`}
        />
        <span className="w-5 text-center text-[10px] font-semibold text-slate-500 uppercase dark:text-slate-400">
            {label}
        </span>
    </div>
)

/* ---------- Date/Time Picker (for calculator modes) ---------- */
const DateTimePicker: React.FC<{
    date: string
    time: string
    onDateChange: (d: string) => void
    onTimeChange: (t: string) => void
}> = ({ date, time, onDateChange, onTimeChange }) => (
    <div className="flex flex-wrap items-center gap-2">
        <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white/80 px-2 py-2 font-mono text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
        />
        <input
            type="time"
            value={time}
            step="1"
            onChange={(e) => onTimeChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white/80 px-2 py-2 font-mono text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
        />
    </div>
)

/* ---------- Main Component ---------- */
const TimeCalculator: React.FC = () => {
    // Mobile tabs
    const [activeTab, setActiveTab] = useState<"calculator" | "converter">(
        "calculator"
    )

    /* ========== Calculator State ========== */
    type CalcMode = "addSubtract" | "difference"
    const [calcMode, setCalcMode] = useState<CalcMode>("addSubtract")

    // Date mode toggle (only for add/subtract)
    const [useDateMode, setUseDateMode] = useState(true)

    // ---- Add/Subtract Mode ----
    const [baseDate, setBaseDate] = useState("")
    const [baseTime, setBaseTime] = useState("12:00")

    const [rows, setRows] = useState([
        {
            id: 1,
            sign: "+" as const,
            days: "",
            hours: "",
            minutes: "",
            seconds: "",
        },
    ])
    const [nextRowId, setNextRowId] = useState(2)

    const addRow = () => {
        setRows((prev) => [
            ...prev,
            {
                id: nextRowId,
                sign: "+" as const,
                days: "",
                hours: "",
                minutes: "",
                seconds: "",
            },
        ])
        setNextRowId((id) => id + 1)
    }

    const removeRow = (id: number) => {
        if (rows.length <= 1) return
        setRows((prev) => prev.filter((r) => r.id !== id))
    }

    const updateRowField = (id: number, field: string, value: string) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        )
    }

    const toggleSign = (id: number) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, sign: r.sign === "+" ? "-" : "+" } : r
            )
        )
    }

    const rowToSeconds = (row: (typeof rows)[0]) => {
        const d = parseInt(row.days, 10) || 0
        const h = parseInt(row.hours, 10) || 0
        const m = parseInt(row.minutes, 10) || 0
        const s = parseInt(row.seconds, 10) || 0
        return d * 86400 + h * 3600 + m * 60 + s
    }

    const totalOffsetSeconds = useMemo(() => {
        return rows.reduce((sum, row) => {
            const sec = rowToSeconds(row)
            return sum + (row.sign === "+" ? sec : -sec)
        }, 0)
    }, [rows])

    const resultingDate = useMemo(() => {
        if (!useDateMode || !baseDate) return null
        const [year, month, day] = baseDate.split("-").map(Number)
        const [hours, minutes, seconds = 0] = baseTime.split(":").map(Number)
        const dt = new Date(
            year,
            month - 1,
            day,
            hours || 0,
            minutes || 0,
            seconds || 0
        )
        dt.setTime(dt.getTime() + totalOffsetSeconds * 1000)
        return dt
    }, [useDateMode, baseDate, baseTime, totalOffsetSeconds])

    const formatResultDate = (date: Date) => {
        const yyyy = date.getFullYear()
        const mm = String(date.getMonth() + 1).padStart(2, "0")
        const dd = String(date.getDate()).padStart(2, "0")
        const hh = String(date.getHours()).padStart(2, "0")
        const min = String(date.getMinutes()).padStart(2, "0")
        const ss = String(date.getSeconds()).padStart(2, "0")
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
    }

    const clearAddSubtract = () => {
        setBaseDate("")
        setBaseTime("12:00")
        setRows([
            { id: 1, sign: "+", days: "", hours: "", minutes: "", seconds: "" },
        ])
        setNextRowId(2)
    }

    // ---- Difference Mode ----
    const [startDate, setStartDate] = useState("")
    const [startTime, setStartTime] = useState("00:00")
    const [endDate, setEndDate] = useState("")
    const [endTime, setEndTime] = useState("00:00")
    const [diffResult, setDiffResult] = useState<number | null>(null)

    const computeDifference = () => {
        if (!startDate || !endDate) return
        const [sy, sm, sd] = startDate.split("-").map(Number)
        const [sh, smin, ss = 0] = startTime.split(":").map(Number)
        const [ey, em, ed] = endDate.split("-").map(Number)
        const [eh, emin, es = 0] = endTime.split(":").map(Number)
        const start = new Date(sy, sm - 1, sd, sh || 0, smin || 0, ss || 0)
        const end = new Date(ey, em - 1, ed, eh || 0, emin || 0, es || 0)
        const diffMs = end.getTime() - start.getTime()
        setDiffResult(diffMs / 1000)
    }

    const clearDifference = () => {
        setStartDate("")
        setStartTime("00:00")
        setEndDate("")
        setEndTime("00:00")
        setDiffResult(null)
    }

    /* ========== Converter State ========== */
    const [convInput, setConvInput] = useState("")
    const [convTotalSeconds, setConvTotalSeconds] = useState<number | null>(
        null
    )

    const handleConvInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setConvInput(val)
        const parsed = parseTimeExpression(val)
        setConvTotalSeconds(parsed)
    }

    const conversions = useMemo(() => {
        if (convTotalSeconds === null) return null
        const t = convTotalSeconds
        return {
            ms: t * 1000,
            sec: t,
            min: t / 60,
            hr: t / 3600,
            days: t / 86400,
            weeks: t / 604800,
            months: t / 2592000,
            years: t / 31536000,
        }
    }, [convTotalSeconds])

    const clearConverter = () => {
        setConvInput("")
        setConvTotalSeconds(null)
    }

    /* ========== Render ========== */
    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-5xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    {/* Mobile tabs */}
                    <div className="flex border-b border-slate-200/80 lg:hidden dark:border-slate-800/60">
                        <button
                            onClick={() => setActiveTab("calculator")}
                            className={`flex-1 py-3 text-center text-xs font-medium transition ${
                                activeTab === "calculator"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            📅 Calculator
                        </button>
                        <button
                            onClick={() => setActiveTab("converter")}
                            className={`flex-1 py-3 text-center text-xs font-medium transition ${
                                activeTab === "converter"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            🔄 Converter
                        </button>
                    </div>

                    {/* Main content grid */}
                    <div className="p-5 sm:p-6">
                        <div className="grid gap-5 lg:grid-cols-2">
                            {/* Left: Calculator */}
                            <div
                                className={
                                    activeTab === "calculator"
                                        ? ""
                                        : "hidden lg:block"
                                }
                            >
                                <Panel
                                    title="📅 Date & Time Calculator"
                                    onClear={
                                        calcMode === "addSubtract"
                                            ? clearAddSubtract
                                            : clearDifference
                                    }
                                >
                                    {/* Mode toggle */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setCalcMode("addSubtract")
                                            }
                                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                                                calcMode === "addSubtract"
                                                    ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                    : "border-slate-200 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
                                            }`}
                                        >
                                            Add / Subtract
                                        </button>
                                        <button
                                            onClick={() =>
                                                setCalcMode("difference")
                                            }
                                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                                                calcMode === "difference"
                                                    ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                    : "border-slate-200 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
                                            }`}
                                        >
                                            Difference
                                        </button>
                                    </div>

                                    {calcMode === "addSubtract" && (
                                        <>
                                            {/* Date mode toggle */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                    Include date?
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setUseDateMode(
                                                            !useDateMode
                                                        )
                                                    }
                                                    className={`relative inline-flex h-5 w-9 rounded-full border transition-colors ${
                                                        useDateMode
                                                            ? "border-blue-500 bg-blue-500"
                                                            : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-700"
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                                            useDateMode
                                                                ? "translate-x-4"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </button>
                                            </div>

                                            {useDateMode && (
                                                <div>
                                                    <label className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                        Start Date & Time
                                                    </label>
                                                    <DateTimePicker
                                                        date={baseDate}
                                                        time={baseTime}
                                                        onDateChange={
                                                            setBaseDate
                                                        }
                                                        onTimeChange={
                                                            setBaseTime
                                                        }
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                    Durations
                                                </label>
                                                <div className="space-y-2">
                                                    {rows.map((row) => (
                                                        <div
                                                            key={row.id}
                                                            className="flex flex-wrap items-center gap-2"
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    toggleSign(
                                                                        row.id
                                                                    )
                                                                }
                                                                className={`w-8 rounded-lg border px-2 py-1.5 text-xs font-bold transition ${
                                                                    row.sign ===
                                                                    "+"
                                                                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                                                        : "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                                                                }`}
                                                            >
                                                                {row.sign}
                                                            </button>
                                                            <TimePartInput
                                                                label="d"
                                                                value={row.days}
                                                                onChange={(v) =>
                                                                    updateRowField(
                                                                        row.id,
                                                                        "days",
                                                                        v
                                                                    )
                                                                }
                                                            />
                                                            <TimePartInput
                                                                label="h"
                                                                value={
                                                                    row.hours
                                                                }
                                                                onChange={(v) =>
                                                                    updateRowField(
                                                                        row.id,
                                                                        "hours",
                                                                        v
                                                                    )
                                                                }
                                                                max={23}
                                                            />
                                                            <TimePartInput
                                                                label="m"
                                                                value={
                                                                    row.minutes
                                                                }
                                                                onChange={(v) =>
                                                                    updateRowField(
                                                                        row.id,
                                                                        "minutes",
                                                                        v
                                                                    )
                                                                }
                                                                max={59}
                                                            />
                                                            <TimePartInput
                                                                label="s"
                                                                value={
                                                                    row.seconds
                                                                }
                                                                onChange={(v) =>
                                                                    updateRowField(
                                                                        row.id,
                                                                        "seconds",
                                                                        v
                                                                    )
                                                                }
                                                                max={59}
                                                            />
                                                            {rows.length >
                                                                1 && (
                                                                <button
                                                                    onClick={() =>
                                                                        removeRow(
                                                                            row.id
                                                                        )
                                                                    }
                                                                    className="p-1 text-slate-400 hover:text-rose-500"
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={addRow}
                                                        className="w-full rounded-lg border border-dashed border-slate-300 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                                                    >
                                                        + Add duration
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Result */}
                                            <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800/60 dark:bg-slate-900/30">
                                                {useDateMode ? (
                                                    resultingDate ? (
                                                        <>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                                    Result
                                                                </span>
                                                                <span className="text-lg font-bold text-slate-800 tabular-nums dark:text-white">
                                                                    {formatResultDate(
                                                                        resultingDate
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                                                Offset:{" "}
                                                                {formatDuration(
                                                                    totalOffsetSeconds
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">
                                                            Pick a start date
                                                        </span>
                                                    )
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                                Total duration
                                                            </span>
                                                            <span className="text-lg font-bold text-slate-800 tabular-nums dark:text-white">
                                                                {formatDuration(
                                                                    totalOffsetSeconds
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                                            {formatDurationDetailed(
                                                                totalOffsetSeconds
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {calcMode === "difference" && (
                                        <>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                    Start
                                                </label>
                                                <DateTimePicker
                                                    date={startDate}
                                                    time={startTime}
                                                    onDateChange={setStartDate}
                                                    onTimeChange={setStartTime}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                    End
                                                </label>
                                                <DateTimePicker
                                                    date={endDate}
                                                    time={endTime}
                                                    onDateChange={setEndDate}
                                                    onTimeChange={setEndTime}
                                                />
                                            </div>
                                            <button
                                                onClick={computeDifference}
                                                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold tracking-wide text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                                            >
                                                Calculate Difference
                                            </button>
                                            {diffResult !== null && (
                                                <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800/60 dark:bg-slate-900/30">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                            Difference
                                                        </span>
                                                        <span className="text-lg font-bold text-slate-800 tabular-nums dark:text-white">
                                                            {formatDuration(
                                                                Math.abs(
                                                                    diffResult
                                                                )
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                                        {formatDurationDetailed(
                                                            Math.abs(diffResult)
                                                        )}
                                                    </div>
                                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                                        <StatCard
                                                            label="Total Days"
                                                            value={(
                                                                diffResult! /
                                                                86400
                                                            ).toFixed(2)}
                                                            accent="slate"
                                                        />
                                                        <StatCard
                                                            label="Total Hours"
                                                            value={(
                                                                diffResult! /
                                                                3600
                                                            ).toFixed(2)}
                                                            accent="emerald"
                                                        />
                                                        <StatCard
                                                            label="Total Minutes"
                                                            value={(
                                                                diffResult! / 60
                                                            ).toFixed(2)}
                                                            accent="blue"
                                                        />
                                                        <StatCard
                                                            label="Total Seconds"
                                                            value={Math.abs(
                                                                diffResult!
                                                            ).toFixed(0)}
                                                            accent="violet"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Panel>
                            </div>

                            {/* Right: Converter */}
                            <div
                                className={
                                    activeTab === "converter"
                                        ? ""
                                        : "hidden lg:block"
                                }
                            >
                                <Panel
                                    title="🔄 Time Converter"
                                    onClear={clearConverter}
                                >
                                    <div>
                                        <label className="mb-2 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                            Enter a time expression
                                        </label>
                                        <input
                                            type="text"
                                            value={convInput}
                                            onChange={handleConvInputChange}
                                            placeholder="e.g., 2h 30m, 1d 5h 3s, 1y 2mo, 3:15:00"
                                            className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
                                        />
                                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                                            Supports: d (days), h (hours), m
                                            (minutes), s (seconds), y (years),
                                            mo (months), w (weeks), HH:MM:SS
                                        </p>
                                    </div>

                                    {conversions && (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            <StatCard
                                                label="Milliseconds"
                                                value={conversions.ms.toFixed(
                                                    0
                                                )}
                                                accent="slate"
                                            />
                                            <StatCard
                                                label="Seconds"
                                                value={conversions.sec.toFixed(
                                                    2
                                                )}
                                                accent="slate"
                                            />
                                            <StatCard
                                                label="Minutes"
                                                value={conversions.min.toFixed(
                                                    2
                                                )}
                                                accent="emerald"
                                            />
                                            <StatCard
                                                label="Hours"
                                                value={conversions.hr.toFixed(
                                                    2
                                                )}
                                                accent="blue"
                                            />
                                            <StatCard
                                                label="Days"
                                                value={conversions.days.toFixed(
                                                    2
                                                )}
                                                accent="violet"
                                            />
                                            <StatCard
                                                label="Weeks"
                                                value={conversions.weeks.toFixed(
                                                    2
                                                )}
                                                accent="slate"
                                            />
                                            <StatCard
                                                label="Months (30d)"
                                                value={conversions.months.toFixed(
                                                    2
                                                )}
                                                accent="emerald"
                                            />
                                            <StatCard
                                                label="Years (365d)"
                                                value={conversions.years.toFixed(
                                                    2
                                                )}
                                                accent="blue"
                                            />
                                        </div>
                                    )}
                                </Panel>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TimeCalculator
