"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import styles from "./styles.module.css"

const t = (key: string, fallback?: string) => fallback ?? key

const CurrencyConverter = () => {
    const [currencies, setCurrencies] = useState<any[]>([])
    const [conversion, setConversion] = useState({
        from: "USD",
        to: "INR",
        amount: 1,
        rate: 0,
        result: 0,
        cached: false,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any | null>(null)
    const [historicalData, setHistoricalData] = useState<any[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [settings, setSettings] = useState({
        decimalPlaces: 2,
    })

    const API_BASE_URL = "http://localhost:8000"
    const lastConversionRef = useRef<{
        from: string
        to: string
        amount: number
    } | null>(null)

    const popularCurrencies = [
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CAD",
        "AUD",
        "CHF",
        "CNY",
        "INR",
        "SGD",
    ]

    const currencyNames = {
        USD: "US Dollar",
        EUR: "Euro",
        GBP: "British Pound",
        JPY: "Japanese Yen",
        CAD: "Canadian Dollar",
        AUD: "Australian Dollar",
        CHF: "Swiss Franc",
        CNY: "Chinese Yuan",
        INR: "Indian Rupee",
        SGD: "Singapore Dollar",
        AED: "UAE Dirham",
        SAR: "Saudi Riyal",
        MYR: "Malaysian Ringgit",
        THB: "Thai Baht",
        KRW: "South Korean Won",
        IDR: "Indonesian Rupiah",
        PHP: "Philippine Peso",
        VND: "Vietnamese Dong",
        PKR: "Pakistani Rupee",
        BDT: "Bangladeshi Taka",
        LKR: "Sri Lankan Rupee",
        NPR: "Nepalese Rupee",
        BRL: "Brazilian Real",
        MXN: "Mexican Peso",
        RUB: "Russian Ruble",
        ZAR: "South African Rand",
        NZD: "New Zealand Dollar",
        SEK: "Swedish Krona",
        NOK: "Norwegian Krone",
        DKK: "Danish Krone",
    }

    const fetchCurrencies = useCallback(
        async (baseCurrency = "USD") => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(
                    `${API_BASE_URL}/rates?base=${baseCurrency}`
                )
                if (!response.ok) {
                    throw new Error("Failed to fetch exchange rates")
                }

                const data = await response.json()
                if (!data.success) {
                    throw new Error("API returned unsuccessful response")
                }

                const rates = data.data.rates
                const currencyList = Object.keys(rates).map((code) => ({
                    code,
                    name: currencyNames[code] || code,
                    rate: rates[code],
                }))

                setCurrencies(currencyList)

                // Update conversion rate if needed
                if (
                    conversion.from === baseCurrency &&
                    conversion.to in rates
                ) {
                    const newRate = rates[conversion.to]
                    const newResult = conversion.amount * newRate
                    setConversion((prev) => ({
                        ...prev,
                        rate: newRate,
                        result: newResult,
                        cached: data.data.cached || false,
                    }))
                }
            } catch (err) {
                console.error("Error fetching currencies:", err)
                setError("Error fetching exchange rates")
            } finally {
                setLoading(false)
            }
        },
        [conversion.from, conversion.to, conversion.amount, t]
    )

    const convertCurrency = useCallback(
        async (from, to, amount) => {
            if (!from || !to || amount <= 0) return

            // Store the conversion for history
            lastConversionRef.current = { from, to, amount }

            try {
                setLoading(true)
                setError(null)

                const response = await fetch(
                    `${API_BASE_URL}/convert?from_currency=${from}&to_currency=${to}&amount=${amount}`
                )

                if (!response.ok) {
                    throw new Error("Conversion failed")
                }

                const data = await response.json()
                if (!data.success) {
                    throw new Error("Conversion API error")
                }

                setConversion({
                    from: data.from,
                    to: data.to,
                    amount: data.amount,
                    rate: data.rate,
                    result: data.result,
                    cached: data.cached || false,
                })
            } catch (err) {
                console.error("Error converting currency:", err)
                setError("Error fetching exchange rates")
            } finally {
                setLoading(false)
            }
        },
        [t]
    )

    const fetchHistoricalData = useCallback(async (from, to) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/history?base=${from}&target=${to}&days=7`
            )
            if (!response.ok) {
                throw new Error("Failed to fetch historical data")
            }

            const data = await response.json()
            if (!data.success) {
                throw new Error("Historical data API error")
            }

            setHistoricalData(data.data.history || [])
        } catch (err) {
            console.error("Error fetching historical data:", err)
            setHistoricalData([])
        }
    }, [])

    const handleAmountChange = (value) => {
        const amount = parseFloat(value) || 0
        setConversion((prev) => ({ ...prev, amount }))
        if (amount > 0) {
            convertCurrency(conversion.from, conversion.to, amount)
        }
    }

    const handleCurrencyChange = (type, currencyCode) => {
        if (type === "from") {
            setConversion((prev) => ({ ...prev, from: currencyCode }))
            convertCurrency(currencyCode, conversion.to, conversion.amount)
            fetchCurrencies(currencyCode)
        } else {
            setConversion((prev) => ({ ...prev, to: currencyCode }))
            convertCurrency(conversion.from, currencyCode, conversion.amount)
        }

        // Reset history when currencies change
        setShowHistory(false)
        setHistoricalData([])
    }

    const swapCurrencies = () => {
        setConversion((prev) => ({
            ...prev,
            from: prev.to,
            to: prev.from,
            amount: prev.result,
            result: prev.amount,
            rate: prev.rate ? 1 / prev.rate : 0,
        }))

        setShowHistory(false)
        setHistoricalData([])
    }

    const toggleHistory = () => {
        if (!showHistory) {
            fetchHistoricalData(conversion.from, conversion.to)
        }
        setShowHistory(!showHistory)
    }

    const formatCurrency = (amount, currencyCode) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: settings.decimalPlaces,
            maximumFractionDigits: settings.decimalPlaces,
        }).format(amount)
    }

    const formatNumber = (number) => {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: settings.decimalPlaces,
            maximumFractionDigits: settings.decimalPlaces,
        }).format(number)
    }

    const getFilteredCurrencies = () => {
        return currencies.filter(
            (currency) =>
                currency.code
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                currency.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    const calculateTrend = () => {
        if (historicalData.length < 2) return "stable"

        const firstRate = historicalData[0].rate
        const lastRate = historicalData[historicalData.length - 1].rate
        const change = ((lastRate - firstRate) / firstRate) * 100

        if (change > 0.1) return "up"
        if (change < -0.1) return "down"
        return "stable"
    }

    const getTrendIcon = () => {
        const trend = calculateTrend()
        switch (trend) {
            case "up":
                return "📈"
            case "down":
                return "📉"
            default:
                return "➡️"
        }
    }

    const getTrendText = () => {
        const trend = calculateTrend()
        return t(trend)
    }

    // Initialize currencies
    useEffect(() => {
        fetchCurrencies("USD")
    }, [fetchCurrencies])

    // Convert when amount or currencies change
    useEffect(() => {
        if (conversion.amount > 0 && conversion.from && conversion.to) {
            convertCurrency(conversion.from, conversion.to, conversion.amount)
        }
    }, [conversion.from, conversion.to, convertCurrency])

    const filteredCurrencies = getFilteredCurrencies()
    const trendIcon = getTrendIcon()
    const trendText = getTrendText()

    return (
        <div className={styles["currency-converter"]}>
            {/* <div className={styles["tool-header"]}>
                <h1>{"Currency Converter"}</h1>
                <p>{"Real-time exchange rates with historical data"}</p>
            </div> */}

            <div className={styles["converter-container"]}>
                {/* Main Conversion Card */}
                <div className={styles["conversion-card"]}>
                    <div className={styles["conversion-form"]}>
                        <div className={styles["amount-section"]}>
                            <label>{"Amount"}</label>
                            <div className={styles["amount-input-container"]}>
                                <input
                                    type="number"
                                    value={conversion.amount}
                                    onChange={(e) =>
                                        handleAmountChange(e.target.value)
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className={styles["amount-input"]}
                                />
                                <span className={styles["currency-symbol"]}>
                                    {conversion.from}
                                </span>
                            </div>
                        </div>

                        <div className={styles["currency-selection"]}>
                            <div className={styles["currency-group"]}>
                                <label>{"From"}</label>
                                <select
                                    value={conversion.from}
                                    onChange={(e) =>
                                        handleCurrencyChange(
                                            "from",
                                            e.target.value
                                        )
                                    }
                                    className={styles["currency-select"]}
                                >
                                    {currencies.map((currency) => (
                                        <option
                                            key={currency.code}
                                            value={currency.code}
                                        >
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className={styles["swap-btn"]}
                                onClick={swapCurrencies}
                                title={"Swap Currencies"}
                                disabled={loading}
                            >
                                ⇄
                            </button>

                            <div className={styles["currency-group"]}>
                                <label>{"To"}</label>
                                <select
                                    value={conversion.to}
                                    onChange={(e) =>
                                        handleCurrencyChange(
                                            "to",
                                            e.target.value
                                        )
                                    }
                                    className={styles["currency-select"]}
                                >
                                    {currencies.map((currency) => (
                                        <option
                                            key={currency.code}
                                            value={currency.code}
                                        >
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading && (
                            <div className={styles["loading-indicator"]}>
                                <div className={styles["spinner"]}></div>
                                <span>{"Calculating..."}</span>
                            </div>
                        )}

                        {error && (
                            <div className={styles["error-message"]}>
                                <span>{error}</span>
                                <button
                                    onClick={() =>
                                        fetchCurrencies(conversion.from)
                                    }
                                    className={styles["retry-btn"]}
                                >
                                    {"Retry"}
                                </button>
                            </div>
                        )}

                        {conversion.result > 0 && !loading && !error && (
                            <div className={styles["conversion-result"]}>
                                <div className={styles["result-main"]}>
                                    <span className={styles["result-amount"]}>
                                        {formatCurrency(
                                            conversion.result,
                                            conversion.to
                                        )}
                                    </span>
                                    <span className={styles["result-label"]}>
                                        {"Converted Amount"}
                                    </span>
                                </div>

                                <div className={styles["conversion-details"]}>
                                    <div className={styles["rate-info"]}>
                                        <span className={styles["rate-label"]}>
                                            {"Exchange Rate"}:
                                        </span>
                                        <span className={styles["rate-value"]}>
                                            1 {conversion.from} ={" "}
                                            {formatNumber(conversion.rate)}{" "}
                                            {conversion.to}
                                        </span>
                                    </div>

                                    <div className={styles["cache-info"]}>
                                        <span className={styles["cache-label"]}>
                                            {"Last Updated"}:
                                        </span>
                                        <span className={styles["cache-value"]}>
                                            {new Date().toLocaleTimeString()}
                                            {conversion.cached && (
                                                <span
                                                    className={
                                                        styles["cached-badge"]
                                                    }
                                                >
                                                    Cached
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className={styles["history-toggle-btn"]}
                                    onClick={toggleHistory}
                                >
                                    {showHistory
                                        ? "Hide History"
                                        : "View History"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Historical Data Section */}
                    {showHistory && historicalData.length > 0 && (
                        <div className={styles["historical-section"]}>
                            <h3>{"Historical Trend (7 Days)"}</h3>
                            <div className={styles["trend-indicator"]}>
                                <span className={styles["trend-icon"]}>
                                    {trendIcon}
                                </span>
                                <span className={styles["trend-text"]}>
                                    {trendText}
                                </span>
                            </div>
                            <div className={styles["history-chart"]}>
                                {historicalData.map((day, index) => (
                                    <div
                                        key={day.date}
                                        className={styles["history-bar"]}
                                    >
                                        <div
                                            className={styles["bar-fill"]}
                                            style={{
                                                height: `${(day.rate / Math.max(...historicalData.map((d) => d.rate))) * 80}%`,
                                            }}
                                        ></div>
                                        <div className={styles["bar-label"]}>
                                            <small>
                                                {new Date(
                                                    day.date
                                                ).toLocaleDateString()}
                                            </small>
                                            <small>
                                                {formatNumber(day.rate)}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles["history-table"]}>
                                {historicalData.slice(-7).map((day) => (
                                    <div
                                        key={day.date}
                                        className={styles["history-row"]}
                                    >
                                        <span
                                            className={styles["history-date"]}
                                        >
                                            {new Date(
                                                day.date
                                            ).toLocaleDateString()}
                                        </span>
                                        <span
                                            className={styles["history-rate"]}
                                        >
                                            {formatNumber(day.rate)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showHistory && historicalData.length === 0 && !loading && (
                        <div className={styles["no-history"]}>
                            <p>{"No historical data available"}</p>
                        </div>
                    )}
                </div>

                {/* Popular Currencies */}
                <div className={styles["popular-currencies"]}>
                    <h3>{"Popular Currencies"}</h3>
                    <div className={styles["popular-grid"]}>
                        {popularCurrencies.map((currencyCode) => (
                            <button
                                key={currencyCode}
                                className={`${styles["currency-chip"]} ${conversion.to === currencyCode ? styles["active"] : ""}`}
                                onClick={() =>
                                    handleCurrencyChange("to", currencyCode)
                                }
                                disabled={loading}
                            >
                                {currencyCode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Currency List */}
                <div className={styles["currency-list-section"]}>
                    <div className={styles["section-header"]}>
                        <h3>{"All Currencies"}</h3>
                        <div className={styles["search-box"]}>
                            <input
                                type="text"
                                placeholder={"Search currency..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles["search-input"]}
                            />
                        </div>
                    </div>

                    <div className={styles["currency-list"]}>
                        {filteredCurrencies.slice(0, 50).map((currency) => (
                            <div
                                key={currency.code}
                                className={`${styles["currency-item"]} ${conversion.to === currency.code ? "selected" : ""}`}
                                onClick={() =>
                                    handleCurrencyChange("to", currency.code)
                                }
                            >
                                <div className={styles["currency-info"]}>
                                    <span className={styles["currency-code"]}>
                                        {currency.code}
                                    </span>
                                    <span className={styles["currency-name"]}>
                                        {currency.name}
                                    </span>
                                </div>
                                <div className={styles["currency-rate"]}>
                                    {formatNumber(currency.rate)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips Section */}
                <div className={styles["tips-section"]}>
                    <h3>💡 {"Conversion Tips"}</h3>
                    <div className={styles["tips-list"]}>
                        <div className={styles["tip-item"]}>
                            {"Rates are updated every 10 minutes"}
                        </div>
                        <div className={styles["tip-item"]}>
                            {"Click swap to quickly reverse conversion"}
                        </div>
                        <div className={styles["tip-item"]}>
                            {"Use historical data to track trends"}
                        </div>
                        <div className={styles["tip-item"]}>
                            {"Bookmark frequently used conversions"}
                        </div>
                        <div className={styles["tip-item"]}>
                            {"All rates are for informational purposes"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CurrencyConverter
