"use client"

import React, { useState, useEffect, useMemo } from "react"

const PasswordGenerator = () => {
    const [password, setPassword] = useState("")
    const [length, setLength] = useState(16)
    const [includeUppercase, setIncludeUppercase] = useState(true)
    const [includeLowercase, setIncludeLowercase] = useState(true)
    const [includeNumbers, setIncludeNumbers] = useState(true)
    const [includeSymbols, setIncludeSymbols] = useState(true)
    const [minNumbers, setMinNumbers] = useState(1)
    const [minSymbols, setMinSymbols] = useState(1)
    const [minUppercase, setMinUppercase] = useState(1)
    const [excludeSimilar, setExcludeSimilar] = useState(false)
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
    const [noDuplicate, setNoDuplicate] = useState(false)
    const [copied, setCopied] = useState(false)

    const characters = {
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        numbers: "0123456789",
        symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    }

    const similarChars = "il1Lo0O"
    const ambiguousChars = "{}[]()/\\'\"`~,;:.<> "

    const shuffleArray = (arr: string[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr
    }

    const charPool = useMemo(() => {
        let pool = ""
        if (includeUppercase) pool += characters.uppercase
        if (includeLowercase) pool += characters.lowercase
        if (includeNumbers) pool += characters.numbers
        if (includeSymbols) pool += characters.symbols

        if (excludeSimilar) {
            pool = pool
                .split("")
                .filter((ch) => !similarChars.includes(ch))
                .join("")
        }
        if (excludeAmbiguous) {
            pool = pool
                .split("")
                .filter((ch) => !ambiguousChars.includes(ch))
                .join("")
        }
        return pool
    }, [
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        excludeSimilar,
        excludeAmbiguous,
    ])

    const charPoolSize = charPool.length

    const validateSettings = () => {
        if (charPoolSize === 0) {
            alert("Please select at least one character type")
            return false
        }
        const totalMin =
            (includeNumbers ? minNumbers : 0) +
            (includeSymbols ? minSymbols : 0) +
            (includeUppercase ? minUppercase : 0)
        if (totalMin > length) {
            alert(
                `Password length (${length}) is too short for the minimum requirements (${totalMin}). Increase length or reduce minimum counts.`
            )
            return false
        }
        if (noDuplicate && charPoolSize < length) {
            alert(
                `Cannot generate a password with no duplicate characters because the character pool (${charPoolSize}) is smaller than the password length (${length}). Include more character types or reduce length.`
            )
            return false
        }
        return true
    }

    const generatePassword = () => {
        if (!validateSettings()) return

        let passwordChars: string[] = []
        const addMin = (count: number, source: string) => {
            for (let i = 0; i < count; i++) {
                if (source.length) {
                    const idx = Math.floor(Math.random() * source.length)
                    passwordChars.push(source[idx])
                }
            }
        }

        if (includeNumbers) addMin(minNumbers, characters.numbers)
        if (includeSymbols) addMin(minSymbols, characters.symbols)
        if (includeUppercase) addMin(minUppercase, characters.uppercase)

        const remaining = length - passwordChars.length
        for (let i = 0; i < remaining; i++) {
            const idx = Math.floor(Math.random() * charPool.length)
            passwordChars.push(charPool[idx])
        }

        passwordChars = shuffleArray(passwordChars)

        if (noDuplicate) {
            const uniqueSet = new Set(passwordChars)
            if (uniqueSet.size < length) {
                const available = charPool
                    .split("")
                    .filter((ch) => !uniqueSet.has(ch))
                const needed = length - uniqueSet.size
                for (let i = 0; i < needed && i < available.length; i++) {
                    uniqueSet.add(available[i])
                }
                if (uniqueSet.size < length) {
                    const arr = Array.from(uniqueSet)
                    while (arr.length < length) {
                        arr.push(
                            charPool[
                                Math.floor(Math.random() * charPool.length)
                            ]
                        )
                    }
                    passwordChars = shuffleArray(arr)
                } else {
                    passwordChars = shuffleArray(Array.from(uniqueSet))
                }
            } else {
                passwordChars = shuffleArray(Array.from(uniqueSet))
            }
        }

        const generated = passwordChars.slice(0, length).join("")
        setPassword(generated)
        setCopied(false)
    }

    const copyPassword = () => {
        navigator.clipboard.writeText(password)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const stats = useMemo(() => {
        let totalCombinations = 0
        let entropyBits = 0
        if (charPoolSize > 0) {
            const log10Combinations = length * Math.log10(charPoolSize)
            totalCombinations = Math.pow(10, log10Combinations)
            entropyBits = length * Math.log2(charPoolSize)
        }
        return { totalCombinations, entropyBits }
    }, [charPoolSize, length])

    const formatCombinations = (num: number) => {
        if (!isFinite(num)) return "∞"
        if (num < 1e6) return Math.round(num).toLocaleString()
        const exponent = Math.floor(Math.log10(num))
        const mantissa = num / Math.pow(10, exponent)
        return `${mantissa.toFixed(2)}e+${exponent}`
    }

    const calculateStrength = () => {
        let score = 0
        if (length >= 8) score++
        if (length >= 12) score++
        if (length >= 16) score++
        if (length >= 20) score++
        if (includeUppercase) score++
        if (includeLowercase) score++
        if (includeNumbers) score++
        if (includeSymbols) score++
        if (excludeSimilar) score += 0.5
        if (excludeAmbiguous) score += 0.5
        if (noDuplicate) score += 0.5
        if (stats.entropyBits >= 80) score += 1

        if (score <= 3)
            return { strength: "Very Weak", level: 1, color: "bg-red-500" }
        if (score <= 5)
            return { strength: "Weak", level: 2, color: "bg-orange-500" }
        if (score <= 7)
            return { strength: "Fair", level: 3, color: "bg-yellow-500" }
        if (score <= 9)
            return { strength: "Good", level: 4, color: "bg-blue-500" }
        return { strength: "Strong", level: 5, color: "bg-emerald-500" }
    }

    const strength = calculateStrength()

    useEffect(() => {
        if (charPoolSize > 0) {
            const totalMin =
                (includeNumbers ? minNumbers : 0) +
                (includeSymbols ? minSymbols : 0) +
                (includeUppercase ? minUppercase : 0)
            if (
                totalMin <= length &&
                (!noDuplicate || charPoolSize >= length)
            ) {
                generatePassword()
            }
        }
    }, [
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        minNumbers,
        minSymbols,
        minUppercase,
        excludeSimilar,
        excludeAmbiguous,
        noDuplicate,
        charPoolSize,
    ])

    return (
        <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-8 text-slate-900 sm:px-4 sm:py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="w-full max-w-3xl">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
                    <div className="space-y-5 p-5 sm:p-6">
                        {/* Password Display */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={password}
                                readOnly
                                className="flex-1 rounded-lg border border-slate-300/80 bg-white/70 px-4 py-2.5 font-mono text-base font-medium text-slate-800 shadow-sm focus:outline-none dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100"
                            />
                            <button
                                onClick={copyPassword}
                                disabled={!password}
                                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                                    copied
                                        ? "bg-emerald-500 text-white shadow-md"
                                        : "border border-slate-300 bg-white/80 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
                                }`}
                            >
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>

                        {/* Strength Meter */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Password Strength
                                </label>
                                <span
                                    className={`text-xs font-bold ${strength.color.replace("bg-", "text-")}`}
                                >
                                    {strength.strength}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1.5 flex-1 rounded-full transition-all ${
                                            level <= strength.level
                                                ? strength.color
                                                : "bg-slate-200 dark:bg-slate-800"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Length Slider */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Password Length
                                </label>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    {length}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="4"
                                max="32"
                                value={length}
                                onChange={(e) =>
                                    setLength(parseInt(e.target.value))
                                }
                                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500 dark:bg-slate-800"
                            />
                        </div>

                        {/* Character Types - 2 columns on mobile, 4 on desktop */}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={includeUppercase}
                                    onChange={(e) =>
                                        setIncludeUppercase(e.target.checked)
                                    }
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                />
                                Uppercase (A-Z)
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={includeLowercase}
                                    onChange={(e) =>
                                        setIncludeLowercase(e.target.checked)
                                    }
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                />
                                Lowercase (a-z)
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={includeNumbers}
                                    onChange={(e) =>
                                        setIncludeNumbers(e.target.checked)
                                    }
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                />
                                Numbers (0-9)
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={includeSymbols}
                                    onChange={(e) =>
                                        setIncludeSymbols(e.target.checked)
                                    }
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                />
                                Symbols (!@#$%^&*)
                            </label>
                        </div>

                        {/* Advanced Options */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Advanced Options
                            </h3>

                            {/* Minimum selects - 2 columns on mobile, 3 on desktop */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                        Minimum Numbers
                                    </label>
                                    <select
                                        value={minNumbers}
                                        onChange={(e) =>
                                            setMinNumbers(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        disabled={!includeNumbers}
                                        className="w-full rounded-lg border border-slate-200/80 bg-white/60 px-2 py-1.5 text-xs text-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none disabled:opacity-50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                    >
                                        {[1, 2, 3, 4].map((n) => (
                                            <option key={n} value={n}>
                                                At least {n}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                        Minimum Symbols
                                    </label>
                                    <select
                                        value={minSymbols}
                                        onChange={(e) =>
                                            setMinSymbols(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        disabled={!includeSymbols}
                                        className="w-full rounded-lg border border-slate-200/80 bg-white/60 px-2 py-1.5 text-xs text-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none disabled:opacity-50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                    >
                                        {[1, 2, 3, 4].map((n) => (
                                            <option key={n} value={n}>
                                                At least {n}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                                        Minimum Uppercase
                                    </label>
                                    <select
                                        value={minUppercase}
                                        onChange={(e) =>
                                            setMinUppercase(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        disabled={!includeUppercase}
                                        className="w-full rounded-lg border border-slate-200/80 bg-white/60 px-2 py-1.5 text-xs text-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none disabled:opacity-50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100"
                                    >
                                        {[1, 2, 3, 4].map((n) => (
                                            <option key={n} value={n}>
                                                At least {n}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Additional checkboxes - 2 columns on mobile, 3 on desktop */}
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={excludeSimilar}
                                        onChange={(e) =>
                                            setExcludeSimilar(e.target.checked)
                                        }
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                    />
                                    Exclude Similar
                                </label>
                                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={excludeAmbiguous}
                                        onChange={(e) =>
                                            setExcludeAmbiguous(
                                                e.target.checked
                                            )
                                        }
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                    />
                                    Exclude Ambiguous
                                </label>
                                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={noDuplicate}
                                        onChange={(e) =>
                                            setNoDuplicate(e.target.checked)
                                        }
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 dark:border-slate-700"
                                    />
                                    No Duplicate Chars
                                </label>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="rounded-lg border border-slate-200/80 bg-white/50 p-3 dark:border-slate-800/60 dark:bg-slate-900/50">
                            <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Possible Combinations
                            </h3>
                            <div className="flex flex-wrap justify-between gap-2 text-xs">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Combinations:
                                    </span>
                                    <span className="ml-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                                        {formatCombinations(
                                            stats.totalCombinations
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Character Pool:
                                    </span>
                                    <span className="ml-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                                        {charPoolSize} chars
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Entropy:
                                    </span>
                                    <span className="ml-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                                        {stats.entropyBits.toFixed(1)} bits
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Regenerate Button */}
                        <button
                            onClick={generatePassword}
                            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-bold tracking-wide text-white shadow-sm shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow active:scale-[0.98]"
                        >
                            Generate New
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PasswordGenerator
