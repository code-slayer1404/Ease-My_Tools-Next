"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  ArrowLeftRight,
  RefreshCw,
  Copy,
  TrendingUp,
  DollarSign,
  Loader2,
  AlertCircle,
  Check,
  Sparkles,
  ChevronDown,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import ToolHero from "@/components/tool-page-helpers/ToolHero"
import { ToolHeroProps } from "@/types/tool"

// Popular Currencies with names & symbols
const POPULAR_CURRENCIES: Record<string, { name: string; symbol: string }> = {
  INR: { name: "Indian Rupee", symbol: "₹" },
  USD: { name: "US Dollar", symbol: "$" },
  EUR: { name: "Euro", symbol: "€" },
  GBP: { name: "British Pound", symbol: "£" },
  AED: { name: "UAE Dirham", symbol: "د.إ" },
  JPY: { name: "Japanese Yen", symbol: "¥" },
  CAD: { name: "Canadian Dollar", symbol: "CA$" },
  AUD: { name: "Australian Dollar", symbol: "A$" },
  SAR: { name: "Saudi Riyal", symbol: "SR" },
  SGD: { name: "Singapore Dollar", symbol: "S$" },
  CNY: { name: "Chinese Yuan", symbol: "¥" },
  CHF: { name: "Swiss Franc", symbol: "CHF" },
  RUB: { name: "Russian Ruble", symbol: "₽" },
  BRL: { name: "Brazilian Real", symbol: "R$" },
  KRW: { name: "South Korean Won", symbol: "₩" },
  ZAR: { name: "South African Rand", symbol: "R" },
  TRY: { name: "Turkish Lira", symbol: "₺" },
  MXN: { name: "Mexican Peso", symbol: "MX$" },
}

// Universal Currency Symbol Resolver
function getCurrencySymbol(code: string): string {
  if (POPULAR_CURRENCIES[code]?.symbol) return POPULAR_CURRENCIES[code].symbol
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(1)
    const symbolPart = parts.find((p) => p.type === "currency")
    return symbolPart ? symbolPart.value : code
  } catch {
    return code
  }
}

// Universal Currency Name Resolver
function getCurrencyName(code: string): string {
  if (POPULAR_CURRENCIES[code]?.name) return POPULAR_CURRENCIES[code].name
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "currency" })
    return displayNames.of(code) || code
  } catch {
    return code
  }
}

// Custom shadcn/ui style Currency Select Dropdown Component
function ShadcnCurrencySelect({
  value,
  onChange,
  currencyList,
}: {
  value: string
  onChange: (val: string) => void
  currencyList: string[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return currencyList
    const q = search.toLowerCase()
    return currencyList.filter((code) => {
      const name = getCurrencyName(code)
      return code.toLowerCase().includes(q) || name.toLowerCase().includes(q)
    })
  }, [currencyList, search])

  const selectedSymbol = getCurrencySymbol(value)
  const selectedName = getCurrencyName(value)

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Select Trigger (shadcn style) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/60 dark:focus:border-blue-400"
      >
        <span className="flex items-center gap-2 truncate">
          <span className="font-bold">{value}</span>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-slate-700 dark:text-blue-400">
            {selectedSymbol}
          </span>
          <span className="truncate text-xs font-normal text-slate-400">
            - {selectedName}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Select Content Popover (shadcn style) */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-64 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          {/* Search Input inside Popover */}
          <div className="relative mb-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currency or country..."
              className="w-full rounded-xl border-none bg-slate-100/70 py-1.5 pl-8 pr-3 text-xs outline-none focus:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800"
            />
          </div>

          {/* Currency List Items */}
          <div className="max-h-48 overflow-auto space-y-0.5 pr-1">
            {filteredCurrencies.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">No currency found</div>
            ) : (
              filteredCurrencies.map((code) => {
                const symbol = getCurrencySymbol(code)
                const name = getCurrencyName(code)
                const isSelected = value === code

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onChange(code)
                      setIsOpen(false)
                      setSearch("")
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition ${
                      isSelected
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                        : "text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="font-bold">{code}</span>
                      <span className="rounded bg-slate-100 px-1.5 font-mono text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {symbol}
                      </span>
                      <span className="truncate text-[11px] text-slate-400">
                        {name}
                      </span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LiveCurrencyConverter({ tool }: ToolHeroProps) {
  const [amount, setAmount] = useState<number | string>(100)
  const [fromCurrency, setFromCurrency] = useState<string>("USD")
  const [toCurrency, setToCurrency] = useState<string>("INR")
  const [rates, setRates] = useState<Record<string, number>>({})
  const [currencyList, setCurrencyList] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)

  // Fetch live exchange rates
  const fetchRates = useCallback(async (base: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${base}`)
      if (!response.ok) throw new Error("Exchange rate network error")
      const data = await response.json()

      if (data.result === "success") {
        setRates(data.rates)
        setCurrencyList(Object.keys(data.rates))
        const updateDate = new Date(data.time_last_update_utc).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        setLastUpdated(updateDate)
      } else {
        throw new Error("Unable to fetch currency data")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch live rates"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates(fromCurrency)
  }, [fromCurrency, fetchRates])

  // Calculation
  const convertedAmount = useMemo(() => {
    const numericAmount = typeof amount === "number" ? amount : parseFloat(amount) || 0
    const rate = rates[toCurrency] || 0
    return (numericAmount * rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [amount, rates, toCurrency])

  const currentRate = useMemo(() => {
    return rates[toCurrency] ? rates[toCurrency].toFixed(4) : "—"
  }, [rates, toCurrency])

  const fromSymbol = useMemo(() => getCurrencySymbol(fromCurrency), [fromCurrency])
  const toSymbol = useMemo(() => getCurrencySymbol(toCurrency), [toCurrency])

  // Swap currencies
  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    toast.message("Currencies swapped")
  }

  // Copy result
  const handleCopyResult = async () => {
    const textToCopy = `${fromSymbol}${amount} ${fromCurrency} = ${toSymbol}${convertedAmount} ${toCurrency}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      toast.success("Conversion copied to clipboard")
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Copy failed")
    }
  }

  return (
    <div className="flex justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="w-full max-w-5xl space-y-6">
        <ToolHero tool={tool} />

        {/* Card Component (shadcn style) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/40">
          
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight text-slate-900 dark:text-slate-100">
                  Live Currency Exchange
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time global rate calculator</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Badge Component (shadcn style) */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Rates
              </div>

              {/* Sync Button */}
              <button
                onClick={() => fetchRates(fromCurrency)}
                disabled={loading}
                title="Refresh rates"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">
            
            {/* Input Controls Grid */}
            <div className="grid gap-4 md:grid-cols-12 md:items-end">
              
              {/* Amount Field */}
              <div className="space-y-2 md:col-span-5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">
                    {fromSymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-14 py-3 text-base font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                    {fromCurrency}
                  </span>
                </div>
              </div>

              {/* From Currency Select (shadcn Custom Dropdown) */}
              <div className="space-y-2 md:col-span-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">From</label>
                <ShadcnCurrencySelect
                  value={fromCurrency}
                  onChange={setFromCurrency}
                  currencyList={currencyList}
                />
              </div>

              {/* Swap Action Button */}
              <div className="flex justify-center md:col-span-1">
                <button
                  onClick={handleSwap}
                  title="Swap currencies"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-blue-600 hover:text-white active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-blue-600"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
              </div>

              {/* To Currency Select (shadcn Custom Dropdown) */}
              <div className="space-y-2 md:col-span-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">To</label>
                <ShadcnCurrencySelect
                  value={toCurrency}
                  onChange={setToCurrency}
                  currencyList={currencyList}
                />
              </div>
            </div>

            {/* Quick Amount Selector Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Presets:</span>
              {[1, 10, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`rounded-xl border px-3 py-1 text-xs font-medium transition ${
                    Number(amount) === val
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {fromSymbol}{val} {fromCurrency}
                </button>
              ))}
            </div>

            {/* Main Result Card */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-slate-50/70 p-6 transition dark:border-blue-900/30 dark:bg-slate-900/60">
              {loading ? (
                <div className="flex h-20 items-center justify-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-5 w-5 animate-spin" /> Updating exchange rates...
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {fromSymbol}{amount} {fromCurrency} =
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      <span className="text-blue-600 dark:text-blue-400">{toSymbol}</span> {convertedAmount}{" "}
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{toCurrency}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      1 {fromCurrency} ({fromSymbol}) = {currentRate} {toCurrency} ({toSymbol}) • Last updated {lastUpdated}
                    </p>
                  </div>

                  <button
                    onClick={handleCopyResult}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/10 transition hover:bg-blue-700 active:scale-95"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Copied" : "Copy Result"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Major Currencies Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Major Currencies (Base: {fromSymbol} {fromCurrency})
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" /> Click card to switch target
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {Object.keys(POPULAR_CURRENCIES)
                  .filter((code) => code !== fromCurrency)
                  .slice(0, 8)
                  .map((code) => {
                    const symbol = getCurrencySymbol(code)
                    const name = getCurrencyName(code)
                    const rate = rates[code] ? rates[code].toFixed(2) : "—"
                    const isSelected = toCurrency === code
                    return (
                      <div
                        key={code}
                        onClick={() => setToCurrency(code)}
                        className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20 shadow-sm"
                            : "border-slate-200/70 bg-white/60 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="font-bold">{code}</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400">
                            {symbol}{rate}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[10px] text-slate-400">{name}</p>
                      </div>
                    )
                  })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}