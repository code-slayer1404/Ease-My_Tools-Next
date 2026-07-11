"use client"

import React, { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Calendar,
    Calculator,
    Trash2,
    GitCompare,
    User,
    Users,
    Moon,
    Star,
    MapPin,
    Clock,
    AlertTriangle,
    Crown,
    Cake,
    Flame,
    Leaf,
    Wind,
    Droplets,
} from "lucide-react"
import { ToolHeroProps } from "@/types/tool"
import ToolHero from "@/components/tool-page-helpers/ToolHero"

/* ------------------------------------------------------------------ */
/*  Types & Data (unchanged)                                          */
/* ------------------------------------------------------------------ */

interface DateRange {
    month: number
    day: number
}
interface ZodiacData {
    name: string
    symbol: string
    element: string
    startDate: DateRange
    endDate: DateRange
}
interface RashiData {
    name: string
    english: string
    element: string
    symbol: string
    description: string
    startDate: DateRange
    endDate: DateRange
}
interface AgeResult {
    years: number
    months: number
    days: number
    totalDays: number
    nextBirthday: number
    birthDate: string
}
interface ComparisonResult {
    olderPerson?: "A" | "B"
    olderName?: string
    personA: AgeResult & { zodiac: ZodiacData | null; rashi: RashiData | null }
    personB: AgeResult & { zodiac: ZodiacData | null; rashi: RashiData | null }
    difference: {
        years: number
        months: number
        days: number
        totalDays: number
    }
    message?: string
}

const WESTERN_ZODIAC: Record<number, ZodiacData> = {
    0: {
        name: "Aries",
        symbol: "♈",
        element: "Fire",
        startDate: { month: 3, day: 21 },
        endDate: { month: 4, day: 19 },
    },
    1: {
        name: "Taurus",
        symbol: "♉",
        element: "Earth",
        startDate: { month: 4, day: 20 },
        endDate: { month: 5, day: 20 },
    },
    2: {
        name: "Gemini",
        symbol: "♊",
        element: "Air",
        startDate: { month: 5, day: 21 },
        endDate: { month: 6, day: 20 },
    },
    3: {
        name: "Cancer",
        symbol: "♋",
        element: "Water",
        startDate: { month: 6, day: 21 },
        endDate: { month: 7, day: 22 },
    },
    4: {
        name: "Leo",
        symbol: "♌",
        element: "Fire",
        startDate: { month: 7, day: 23 },
        endDate: { month: 8, day: 22 },
    },
    5: {
        name: "Virgo",
        symbol: "♍",
        element: "Earth",
        startDate: { month: 8, day: 23 },
        endDate: { month: 9, day: 22 },
    },
    6: {
        name: "Libra",
        symbol: "♎",
        element: "Air",
        startDate: { month: 9, day: 23 },
        endDate: { month: 10, day: 22 },
    },
    7: {
        name: "Scorpio",
        symbol: "♏",
        element: "Water",
        startDate: { month: 10, day: 23 },
        endDate: { month: 11, day: 21 },
    },
    8: {
        name: "Sagittarius",
        symbol: "♐",
        element: "Fire",
        startDate: { month: 11, day: 22 },
        endDate: { month: 12, day: 21 },
    },
    9: {
        name: "Capricorn",
        symbol: "♑",
        element: "Earth",
        startDate: { month: 12, day: 22 },
        endDate: { month: 1, day: 19 },
    },
    10: {
        name: "Aquarius",
        symbol: "♒",
        element: "Air",
        startDate: { month: 1, day: 20 },
        endDate: { month: 2, day: 18 },
    },
    11: {
        name: "Pisces",
        symbol: "♓",
        element: "Water",
        startDate: { month: 2, day: 19 },
        endDate: { month: 3, day: 20 },
    },
}

const VEDIC_RASHI: Record<number, RashiData> = {
    0: {
        name: "Mesha",
        english: "Aries",
        element: "Fire",
        symbol: "♈",
        description:
            "Courageous, energetic, and natural leaders who love challenges.",
        startDate: { month: 3, day: 21 },
        endDate: { month: 4, day: 19 },
    },
    1: {
        name: "Vrishabha",
        english: "Taurus",
        element: "Earth",
        symbol: "♉",
        description:
            "Reliable, patient, and practical with strong determination.",
        startDate: { month: 4, day: 20 },
        endDate: { month: 5, day: 20 },
    },
    2: {
        name: "Mithuna",
        english: "Gemini",
        element: "Air",
        symbol: "♊",
        description:
            "Adaptable, curious, and excellent communicators who love variety.",
        startDate: { month: 5, day: 21 },
        endDate: { month: 6, day: 20 },
    },
    3: {
        name: "Karka",
        english: "Cancer",
        element: "Water",
        symbol: "♋",
        description:
            "Intuitive, emotional, and deeply connected to family and home.",
        startDate: { month: 6, day: 21 },
        endDate: { month: 7, day: 22 },
    },
    4: {
        name: "Simha",
        english: "Leo",
        element: "Fire",
        symbol: "♌",
        description:
            "Charismatic, creative, and natural-born leaders with generous hearts.",
        startDate: { month: 7, day: 23 },
        endDate: { month: 8, day: 22 },
    },
    5: {
        name: "Kanya",
        english: "Virgo",
        element: "Earth",
        symbol: "♍",
        description:
            "Analytical, practical, and detail-oriented with a helpful nature.",
        startDate: { month: 8, day: 23 },
        endDate: { month: 9, day: 22 },
    },
    6: {
        name: "Tula",
        english: "Libra",
        element: "Air",
        symbol: "♎",
        description:
            "Diplomatic, fair-minded, and lovers of beauty and harmony.",
        startDate: { month: 9, day: 23 },
        endDate: { month: 10, day: 22 },
    },
    7: {
        name: "Vrishchika",
        english: "Scorpio",
        element: "Water",
        symbol: "♏",
        description:
            "Passionate, resourceful, and determined with strong intuition.",
        startDate: { month: 10, day: 23 },
        endDate: { month: 11, day: 21 },
    },
    8: {
        name: "Dhanu",
        english: "Sagittarius",
        element: "Fire",
        symbol: "♐",
        description:
            "Optimistic, adventurous, and philosophical truth-seekers.",
        startDate: { month: 11, day: 22 },
        endDate: { month: 12, day: 21 },
    },
    9: {
        name: "Makara",
        english: "Capricorn",
        element: "Earth",
        symbol: "♑",
        description:
            "Disciplined, responsible, and patient with long-term vision.",
        startDate: { month: 12, day: 22 },
        endDate: { month: 1, day: 19 },
    },
    10: {
        name: "Kumbha",
        english: "Aquarius",
        element: "Air",
        symbol: "♒",
        description: "Innovative, independent, and humanitarian thinkers.",
        startDate: { month: 1, day: 20 },
        endDate: { month: 2, day: 18 },
    },
    11: {
        name: "Meena",
        english: "Pisces",
        element: "Water",
        symbol: "♓",
        description: "Compassionate, artistic, and deeply intuitive dreamers.",
        startDate: { month: 2, day: 19 },
        endDate: { month: 3, day: 20 },
    },
}

const ELEMENT_COLORS: Record<string, string> = {
    Fire: "#ef4444",
    Earth: "#22c55e",
    Air: "#3b82f6",
    Water: "#8b5cf6",
}

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
    Fire: <Flame className="h-4 w-4" />,
    Earth: <Leaf className="h-4 w-4" />,
    Air: <Wind className="h-4 w-4" />,
    Water: <Droplets className="h-4 w-4" />,
}

const calculateMoonRashi = (
    date: Date,
    time: string,
    place: string
): RashiData | null => {
    if (!date || !time || !place) return null
    const startDate = new Date(2024, 0, 1)
    const daysDiff = Math.floor(
        (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const rashiIndex = (daysDiff % 27) / 2.25
    const roundedIndex = Math.floor(rashiIndex) % 12
    return VEDIC_RASHI[roundedIndex] ?? VEDIC_RASHI[0]!
}

/* ------------------------------------------------------------------ */
/*  Helper Components                                                 */
/* ------------------------------------------------------------------ */

const ModernToggle: React.FC<{
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    icon?: React.ReactNode
}> = ({ checked, onChange, label, icon }) => (
    <label className="flex cursor-pointer items-center gap-3 select-none">
        <div className="relative">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-blue-600 dark:bg-slate-700 dark:peer-checked:bg-blue-500" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </div>
        <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            {icon}
            {label}
        </span>
    </label>
)

const InputWithIcon: React.FC<{
    icon: React.ReactNode
    label: string
    hint?: string
    error?: string
    children: React.ReactNode
}> = ({ icon, label, hint, error, children }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            {icon}
            {label}
        </label>
        {children}
        {hint && !error && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        )}
        {error && (
            <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                {error}
            </p>
        )}
    </div>
)

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

const AgeCalculator: React.FC<ToolHeroProps> = ({tool}) => {
    // -- state --
    const [birthDate, setBirthDate] = useState("")
    const [birthTime, setBirthTime] = useState("")
    const [birthPlace, setBirthPlace] = useState("")
    const [enableVedic, setEnableVedic] = useState(false)
    const [age, setAge] = useState<AgeResult | null>(null)
    const [westernZodiac, setWesternZodiac] = useState<ZodiacData | null>(null)
    const [vedicRashi, setVedicRashi] = useState<RashiData | null>(null)
    const [vedicError, setVedicError] = useState("")

    const [comparisonMode, setComparisonMode] = useState(false)
    const [personA, setPersonA] = useState("")
    const [personATime, setPersonATime] = useState("")
    const [personAPlace, setPersonAPlace] = useState("")
    const [personB, setPersonB] = useState("")
    const [personBTime, setPersonBTime] = useState("")
    const [personBPlace, setPersonBPlace] = useState("")
    const [enableVedicComparison, setEnableVedicComparison] = useState(false)
    const [comparisonResult, setComparisonResult] =
        useState<ComparisonResult | null>(null)
    const [comparisonError, setComparisonError] = useState("")

    // -- logic (fixed variable declarations) --
    const calculateWesternZodiac = useCallback(
        (dateString: string): ZodiacData | null => {
            if (!dateString) return null
            const d = new Date(dateString)
            const month = d.getMonth() + 1
            const day = d.getDate()
            if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
                return WESTERN_ZODIAC[9] ?? null
            for (const key in WESTERN_ZODIAC) {
                if (key === "9") continue
                const z = WESTERN_ZODIAC[parseInt(key)]
                if (!z) continue
                const sm = z.startDate.month,
                    sd = z.startDate.day
                const em = z.endDate.month,
                    ed = z.endDate.day
                if (
                    sm <= em &&
                    ((month === sm && day >= sd) ||
                        (month === em && day <= ed) ||
                        (month > sm && month < em))
                )
                    return z
            }
            return null
        },
        []
    )

    const calculateVedicRashi = useCallback(
        (dateString: string, time: string, place: string): RashiData | null => {
            if (!enableVedic) return null
            if (!dateString) {
                setVedicError("Birth date is required")
                return null
            }
            if (!time) {
                setVedicError(
                    "Birth time is required for accurate Vedic Rashi calculation"
                )
                return null
            }
            if (!place.trim()) {
                setVedicError(
                    "Birth place is required for accurate Vedic Rashi calculation"
                )
                return null
            }
            setVedicError("")
            const rashi = calculateMoonRashi(new Date(dateString), time, place)
            if (!rashi)
                setVedicError(
                    "Unable to calculate Vedic Rashi. Please check your inputs."
                )
            return rashi
        },
        [enableVedic]
    )

    const calculateAgeFromDate = useCallback(
        (dateString: string): AgeResult | null => {
            if (!dateString) return null
            const birth = new Date(dateString)
            const today = new Date()
            let years = today.getFullYear() - birth.getFullYear()
            let months = today.getMonth() - birth.getMonth()
            let days = today.getDate() - birth.getDate()
            if (days < 0) {
                months--
                days += new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    0
                ).getDate()
            }
            if (months < 0) {
                years--
                months += 12
            }
            const totalDays = Math.ceil(
                Math.abs(today.getTime() - birth.getTime()) /
                    (1000 * 60 * 60 * 24)
            )
            const nextBday = new Date(
                today.getFullYear(),
                birth.getMonth(),
                birth.getDate()
            )
            if (nextBday < today) nextBday.setFullYear(nextBday.getFullYear() + 1)
            const daysUntil = Math.ceil(
                (nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )
            return {
                years,
                months,
                days,
                totalDays,
                nextBirthday: daysUntil,
                birthDate: dateString,
            }
        },
        []
    )

    const calculateAge = useCallback(() => {
        if (!birthDate) {
            alert("Please select your birth date")
            return
        }
        setAge(calculateAgeFromDate(birthDate))
        setWesternZodiac(calculateWesternZodiac(birthDate))
        setVedicRashi(calculateVedicRashi(birthDate, birthTime, birthPlace))
    }, [
        birthDate,
        birthTime,
        birthPlace,
        calculateAgeFromDate,
        calculateWesternZodiac,
        calculateVedicRashi,
    ])

    const calculateComparison = useCallback(() => {
        setComparisonError("")
        setComparisonResult(null)
        if (!personA || !personB) {
            setComparisonError("Please select both dates for comparison")
            return
        }
        const ageA = calculateAgeFromDate(personA)
        const ageB = calculateAgeFromDate(personB)
        const zodiacA = calculateWesternZodiac(personA)
        const zodiacB = calculateWesternZodiac(personB)
        let rashiA: RashiData | null = null
        let rashiB: RashiData | null = null
        const vedicErrors: string[] = []
        if (enableVedicComparison) {
            if (!personATime || !personAPlace)
                vedicErrors.push(
                    "Person A: Birth time and place required for Vedic Rashi"
                )
            else
                rashiA = calculateMoonRashi(
                    new Date(personA),
                    personATime,
                    personAPlace
                )
            if (!personBTime || !personBPlace)
                vedicErrors.push(
                    "Person B: Birth time and place required for Vedic Rashi"
                )
            else
                rashiB = calculateMoonRashi(
                    new Date(personB),
                    personBTime,
                    personBPlace
                )
            if (vedicErrors.length)
                setComparisonError(vedicErrors.join(". "))
        }
        if (!ageA || !ageB) {
            setComparisonError("Invalid dates provided")
            return
        }
        const bA = new Date(personA)
        const bB = new Date(personB)
        if (bA.getTime() === bB.getTime()) {
            setComparisonResult({
                message: "Both are the same age",
                personA: { ...ageA, zodiac: zodiacA, rashi: rashiA },
                personB: { ...ageB, zodiac: zodiacB, rashi: rashiB },
                difference: { years: 0, months: 0, days: 0, totalDays: 0 },
            })
            return
        }

        // CORRECTED: use let for mutable diff variables
        let diffY = Math.abs(ageA.years - ageB.years)
        let diffM = Math.abs(ageA.months - ageB.months)
        let diffD = Math.abs(ageA.days - ageB.days)
        const totalDiffDays = Math.abs(ageA.totalDays - ageB.totalDays)

        if (diffD < 0) {
            diffM--
            diffD += new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate()
        }
        if (diffM < 0) {
            diffY--
            diffM += 12
        }

        setComparisonResult({
            olderPerson: bA < bB ? "A" : "B",
            olderName: bA < bB ? "Person A" : "Person B",
            personA: { ...ageA, zodiac: zodiacA, rashi: rashiA },
            personB: { ...ageB, zodiac: zodiacB, rashi: rashiB },
            difference: {
                years: diffY,
                months: diffM,
                days: diffD,
                totalDays: totalDiffDays,   // <-- fixed totalDiff -> totalDiffDays
            },
        })
    }, [
        personA,
        personB,
        personATime,
        personBTime,
        personAPlace,
        personBPlace,
        enableVedicComparison,
        calculateAgeFromDate,
        calculateWesternZodiac,
    ])

    const clearAll = useCallback(() => {
        setBirthDate("")
        setBirthTime("")
        setBirthPlace("")
        setAge(null)
        setWesternZodiac(null)
        setVedicRashi(null)
        setVedicError("")
        setPersonA("")
        setPersonATime("")
        setPersonAPlace("")
        setPersonB("")
        setPersonBTime("")
        setPersonBPlace("")
        setComparisonResult(null)
        setComparisonError("")
    }, [])

    const getDayOfWeek = useCallback((dateString: string) => {
        if (!dateString) return ""
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
        })
    }, [])

    const monthsLived = useMemo(() => {
        if (!age) return "0"
        return Math.floor(age.totalDays / 30.44).toLocaleString()
    }, [age])
    const weeksLived = useMemo(() => {
        if (!age) return "0"
        return Math.floor(age.totalDays / 7).toLocaleString()
    }, [age])
    const hoursLived = useMemo(() => {
        if (!age) return "0"
        return (age.totalDays * 24).toLocaleString()
    }, [age])

    /* ------------------------------------------------------------------ */
    /*  Render                                                           */
    /* ------------------------------------------------------------------ */

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-5xl space-y-8">
                {/* { Header} */}
                <ToolHero tool={tool}></ToolHero>


                {/* Mode Tabs */}
                <div className="flex justify-center">
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 shadow-inner dark:bg-slate-800">
                        <button
                            onClick={() => setComparisonMode(false)}
                            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                                !comparisonMode
                                    ? "bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            }`}
                        >
                            <User className="h-4 w-4" />
                            Single Age
                        </button>
                        <button
                            onClick={() => setComparisonMode(true)}
                            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                                comparisonMode
                                    ? "bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            Age Comparison
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
                    <div className="p-6 sm:p-8">
                        {/* Input Section */}
                        <AnimatePresence mode="wait">
                            {!comparisonMode ? (
                                <motion.div
                                    key="single"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <InputWithIcon
                                            icon={
                                                <Calendar className="h-4 w-4 text-slate-500" />
                                            }
                                            label="Birth Date"
                                        >
                                            <input
                                                type="date"
                                                value={birthDate}
                                                onChange={(e) =>
                                                    setBirthDate(e.target.value)
                                                }
                                                max={
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                                            />
                                        </InputWithIcon>

                                        <div className="flex items-end">
                                            <ModernToggle
                                                checked={enableVedic}
                                                onChange={(val) => {
                                                    setEnableVedic(val)
                                                    setVedicRashi(null)
                                                    setVedicError("")
                                                }}
                                                icon={
                                                    <Moon className="h-4 w-4" />
                                                }
                                                label="Include Vedic Rashi (Moon Sign)"
                                            />
                                        </div>
                                    </div>

                                    {enableVedic && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50 sm:grid-cols-2"
                                        >
                                            <InputWithIcon
                                                icon={
                                                    <Clock className="h-4 w-4 text-slate-500" />
                                                }
                                                label="Birth Time"
                                                hint="For accurate Moon position"
                                            >
                                                <input
                                                    type="time"
                                                    value={birthTime}
                                                    onChange={(e) =>
                                                        setBirthTime(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                />
                                            </InputWithIcon>
                                            <InputWithIcon
                                                icon={
                                                    <MapPin className="h-4 w-4 text-slate-500" />
                                                }
                                                label="Birth Place"
                                                hint="City, Country"
                                            >
                                                <input
                                                    type="text"
                                                    value={birthPlace}
                                                    onChange={(e) =>
                                                        setBirthPlace(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Mumbai, India"
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                                                />
                                            </InputWithIcon>
                                        </motion.div>
                                    )}

                                    {vedicError && (
                                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                                            <AlertTriangle className="h-4 w-4" />
                                            {vedicError}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={calculateAge}
                                            disabled={!birthDate}
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                                        >
                                            <Calculator className="h-4 w-4" />
                                            Calculate Age
                                        </button>
                                        <button
                                            onClick={clearAll}
                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Clear
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="comparison"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                            Compare Two Ages
                                        </h3>
                                        <ModernToggle
                                            checked={enableVedicComparison}
                                            onChange={(val) => {
                                                setEnableVedicComparison(val)
                                                setComparisonResult(null)
                                            }}
                                            icon={<Moon className="h-4 w-4" />}
                                            label="Include Vedic Rashi"
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Person A */}
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                <User className="h-4 w-4" />
                                                Person A
                                            </div>
                                            <div className="space-y-3">
                                                <InputWithIcon
                                                    icon={
                                                        <Calendar className="h-4 w-4" />
                                                    }
                                                    label="Birth Date"
                                                >
                                                    <input
                                                        type="date"
                                                        value={personA}
                                                        onChange={(e) =>
                                                            setPersonA(
                                                                e.target.value
                                                            )
                                                        }
                                                        max={
                                                            new Date()
                                                                .toISOString()
                                                                .split("T")[0]
                                                        }
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                    />
                                                </InputWithIcon>
                                                {enableVedicComparison && (
                                                    <>
                                                        <InputWithIcon
                                                            icon={
                                                                <Clock className="h-4 w-4" />
                                                            }
                                                            label="Time"
                                                        >
                                                            <input
                                                                type="time"
                                                                value={
                                                                    personATime
                                                                }
                                                                onChange={(e) =>
                                                                    setPersonATime(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                            />
                                                        </InputWithIcon>
                                                        <InputWithIcon
                                                            icon={
                                                                <MapPin className="h-4 w-4" />
                                                            }
                                                            label="Place"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={
                                                                    personAPlace
                                                                }
                                                                onChange={(e) =>
                                                                    setPersonAPlace(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="City, Country"
                                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                                                            />
                                                        </InputWithIcon>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Person B */}
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                <User className="h-4 w-4" />
                                                Person B
                                            </div>
                                            <div className="space-y-3">
                                                <InputWithIcon
                                                    icon={
                                                        <Calendar className="h-4 w-4" />
                                                    }
                                                    label="Birth Date"
                                                >
                                                    <input
                                                        type="date"
                                                        value={personB}
                                                        onChange={(e) =>
                                                            setPersonB(
                                                                e.target.value
                                                            )
                                                        }
                                                        max={
                                                            new Date()
                                                                .toISOString()
                                                                .split("T")[0]
                                                        }
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                    />
                                                </InputWithIcon>
                                                {enableVedicComparison && (
                                                    <>
                                                        <InputWithIcon
                                                            icon={
                                                                <Clock className="h-4 w-4" />
                                                            }
                                                            label="Time"
                                                        >
                                                            <input
                                                                type="time"
                                                                value={
                                                                    personBTime
                                                                }
                                                                onChange={(e) =>
                                                                    setPersonBTime(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                            />
                                                        </InputWithIcon>
                                                        <InputWithIcon
                                                            icon={
                                                                <MapPin className="h-4 w-4" />
                                                            }
                                                            label="Place"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={
                                                                    personBPlace
                                                                }
                                                                onChange={(e) =>
                                                                    setPersonBPlace(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="City, Country"
                                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                                                            />
                                                        </InputWithIcon>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {comparisonError && (
                                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                            <AlertTriangle className="h-4 w-4" />
                                            {comparisonError}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={calculateComparison}
                                            disabled={!personA || !personB}
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                                        >
                                            <GitCompare className="h-4 w-4" />
                                            Compare Ages
                                        </button>
                                        <button
                                            onClick={clearAll}
                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Clear
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                    {(age || comparisonResult) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {!comparisonMode && age && (
                                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
                                    <div className="p-6 sm:p-8">
                                        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                                            Your Age Breakdown
                                        </h2>
                                        {/* Main stats */}
                                        <div className="grid gap-4 sm:grid-cols-4">
                                            {[
                                                {
                                                    label: "Years",
                                                    value: age.years,
                                                },
                                                {
                                                    label: "Months",
                                                    value: age.months,
                                                },
                                                {
                                                    label: "Days",
                                                    value: age.days,
                                                },
                                                {
                                                    label: "Total Days",
                                                    value: age.totalDays.toLocaleString(),
                                                },
                                            ].map((stat, i) => (
                                                <div
                                                    key={i}
                                                    className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 text-center dark:from-blue-900/20 dark:to-blue-800/20"
                                                >
                                                    <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                                                        {stat.value}
                                                    </span>
                                                    <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                        {stat.label}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Extra stats */}
                                        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {monthsLived}
                                                </span>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Months lived
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {weeksLived}
                                                </span>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Weeks lived
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {hoursLived}
                                                </span>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Hours lived
                                                </p>
                                            </div>
                                        </div>

                                        {/* Western Zodiac */}
                                        {westernZodiac && (
                                            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 text-2xl shadow-inner dark:from-yellow-900/20 dark:to-orange-900/20">
                                                        {westernZodiac.symbol}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                                            {westernZodiac.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                                            {
                                                                ELEMENT_ICONS[
                                                                    westernZodiac
                                                                        .element
                                                                ]
                                                            }
                                                            {
                                                                westernZodiac.element
                                                            }{" "}
                                                            Element
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Vedic Rashi */}
                                        {enableVedic && (
                                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    <Moon className="h-4 w-4" />
                                                    Vedic Rashi (Moon Sign)
                                                </h3>
                                                {vedicRashi ? (
                                                    <div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-3xl">
                                                                {
                                                                    vedicRashi.symbol
                                                                }
                                                            </span>
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                                    {
                                                                        vedicRashi.name
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                                    {
                                                                        vedicRashi.english
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                                            {
                                                                ELEMENT_ICONS[
                                                                    vedicRashi
                                                                        .element
                                                                ]
                                                            }
                                                            {vedicRashi.element}{" "}
                                                            Element
                                                        </div>
                                                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                            {
                                                                vedicRashi.description
                                                            }
                                                        </p>
                                                    </div>
                                                ) : vedicError ? (
                                                    <p className="text-sm text-amber-600 dark:text-amber-400">
                                                        ⚠️ {vedicError}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Enter birth time and
                                                        place to see your Vedic
                                                        Rashi.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Birthday Countdown */}
                                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                <Cake className="h-4 w-4" />
                                                Birthday Countdown
                                            </h3>
                                            <div className="grid grid-cols-4 gap-4 text-center">
                                                <div>
                                                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                                                        {age.nextBirthday}
                                                    </span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Days
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                                                        {Math.floor(
                                                            age.nextBirthday / 7
                                                        )}
                                                    </span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Weeks
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                                                        {getDayOfWeek(
                                                            birthDate
                                                        )}
                                                    </span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Day of Birth
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                                                        {new Date().getFullYear() -
                                                            new Date(
                                                                birthDate
                                                            ).getFullYear() +
                                                            1}
                                                    </span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Next Age
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {comparisonMode && comparisonResult && (
                                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
                                    <div className="p-6 sm:p-8">
                                        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                                            Comparison Result
                                        </h2>
                                        {comparisonResult.message ? (
                                            <div className="flex flex-col items-center rounded-xl bg-green-50 p-8 dark:bg-green-900/20">
                                                <Crown className="mb-3 h-8 w-8 text-green-600" />
                                                <p className="text-lg font-medium text-green-800 dark:text-green-400">
                                                    {comparisonResult.message}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Older person highlight */}
                                                <div className="mb-6 flex items-center gap-4 rounded-xl bg-amber-50 p-5 dark:bg-amber-900/20">
                                                    <Crown className="h-6 w-6 text-amber-600" />
                                                    <div>
                                                        <p className="text-sm text-amber-700 dark:text-amber-400">
                                                            Older by
                                                        </p>
                                                        <p className="text-lg font-bold text-amber-900 dark:text-amber-300">
                                                            {
                                                                comparisonResult.olderName
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Difference stats */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                                                        <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                                            {
                                                                comparisonResult
                                                                    .difference
                                                                    .years
                                                            }
                                                        </span>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                                            Years
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                                                        <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                                            {
                                                                comparisonResult
                                                                    .difference
                                                                    .months
                                                            }
                                                        </span>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                                            Months
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                                                        <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                                            {
                                                                comparisonResult
                                                                    .difference
                                                                    .days
                                                            }
                                                        </span>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                                            Days
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm dark:bg-slate-700">
                                                    <span className="text-slate-600 dark:text-slate-400">
                                                        Total Days Difference:{" "}
                                                    </span>
                                                    <span className="ml-2 font-semibold text-slate-900 dark:text-white">
                                                        {comparisonResult.difference.totalDays.toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Individual cards */}
                                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                                                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
                                                            <User className="h-4 w-4" />{" "}
                                                            Person A
                                                        </h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {
                                                                comparisonResult
                                                                    .personA
                                                                    .years
                                                            }{" "}
                                                            years (
                                                            {comparisonResult.personA.totalDays.toLocaleString()}{" "}
                                                            days)
                                                        </p>
                                                        {comparisonResult
                                                            .personA.zodiac && (
                                                            <div className="mt-2 flex items-center gap-2 text-sm">
                                                                <span>
                                                                    {
                                                                        comparisonResult
                                                                            .personA
                                                                            .zodiac
                                                                            .symbol
                                                                    }
                                                                </span>
                                                                <span className="text-slate-600 dark:text-slate-400">
                                                                    {
                                                                        comparisonResult
                                                                            .personA
                                                                            .zodiac
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {enableVedicComparison &&
                                                            comparisonResult
                                                                .personA
                                                                .rashi && (
                                                                <div className="mt-1 flex items-center gap-2 text-sm">
                                                                    <span>
                                                                        {
                                                                            comparisonResult
                                                                                .personA
                                                                                .rashi
                                                                                .symbol
                                                                        }
                                                                    </span>
                                                                    <span className="text-slate-600 dark:text-slate-400">
                                                                        🌙{" "}
                                                                        {
                                                                            comparisonResult
                                                                                .personA
                                                                                .rashi
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                    </div>
                                                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                                                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
                                                            <User className="h-4 w-4" />{" "}
                                                            Person B
                                                        </h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {
                                                                comparisonResult
                                                                    .personB
                                                                    .years
                                                            }{" "}
                                                            years (
                                                            {comparisonResult.personB.totalDays.toLocaleString()}{" "}
                                                            days)
                                                        </p>
                                                        {comparisonResult
                                                            .personB.zodiac && (
                                                            <div className="mt-2 flex items-center gap-2 text-sm">
                                                                <span>
                                                                    {
                                                                        comparisonResult
                                                                            .personB
                                                                            .zodiac
                                                                            .symbol
                                                                    }
                                                                </span>
                                                                <span className="text-slate-600 dark:text-slate-400">
                                                                    {
                                                                        comparisonResult
                                                                            .personB
                                                                            .zodiac
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {enableVedicComparison &&
                                                            comparisonResult
                                                                .personB
                                                                .rashi && (
                                                                <div className="mt-1 flex items-center gap-2 text-sm">
                                                                    <span>
                                                                        {
                                                                            comparisonResult
                                                                                .personB
                                                                                .rashi
                                                                                .symbol
                                                                        }
                                                                    </span>
                                                                    <span className="text-slate-600 dark:text-slate-400">
                                                                        🌙{" "}
                                                                        {
                                                                            comparisonResult
                                                                                .personB
                                                                                .rashi
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default AgeCalculator