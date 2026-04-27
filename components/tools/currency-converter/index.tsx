"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './styles.module.css';

// ✅ ONLY CHANGE: fallback made optional
const t = (key: string, fallback?: string) => fallback ?? key;

const CurrencyConverter = () => {

    const [currencies, setCurrencies] = useState([]);
    const [conversion, setConversion] = useState({
        from: 'USD',
        to: 'INR',
        amount: 1,
        rate: 0,
        result: 0,
        cached: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [settings, setSettings] = useState({
        decimalPlaces: 2
    });

    const API_BASE_URL = 'http://localhost:8000';
    const lastConversionRef = useRef(null);

    const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD'];

    const currencyNames = {
        USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
        CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
        CNY: 'Chinese Yuan', INR: 'Indian Rupee', SGD: 'Singapore Dollar',
        AED: 'UAE Dirham', SAR: 'Saudi Riyal', MYR: 'Malaysian Ringgit',
        THB: 'Thai Baht', KRW: 'South Korean Won', IDR: 'Indonesian Rupiah',
        PHP: 'Philippine Peso', VND: 'Vietnamese Dong', PKR: 'Pakistani Rupee',
        BDT: 'Bangladeshi Taka', LKR: 'Sri Lankan Rupee', NPR: 'Nepalese Rupee',
        BRL: 'Brazilian Real', MXN: 'Mexican Peso', RUB: 'Russian Ruble',
        ZAR: 'South African Rand', NZD: 'New Zealand Dollar', SEK: 'Swedish Krona',
        NOK: 'Norwegian Krone', DKK: 'Danish Krone'
    };

    const fetchCurrencies = useCallback(async (baseCurrency = 'USD') => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/rates?base=${baseCurrency}`);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error('API returned unsuccessful response');
            }

            const rates = data.data.rates;
            const currencyList = Object.keys(rates).map(code => ({
                code,
                name: currencyNames[code] || code,
                rate: rates[code]
            }));

            setCurrencies(currencyList);

            if (conversion.from === baseCurrency && conversion.to in rates) {
                const newRate = rates[conversion.to];
                const newResult = conversion.amount * newRate;
                setConversion(prev => ({
                    ...prev,
                    rate: newRate,
                    result: newResult,
                    cached: data.data.cached || false
                }));
            }

        } catch (err) {
            console.error('Error fetching currencies:', err);
            setError("Error fetching exchange rates");
        } finally {
            setLoading(false);
        }
    }, [conversion.from, conversion.to, conversion.amount]);

    const convertCurrency = useCallback(async (from, to, amount) => {
        if (!from || !to || amount <= 0) return;

        lastConversionRef.current = { from, to, amount };

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${API_BASE_URL}/convert?from_currency=${from}&to_currency=${to}&amount=${amount}`
            );

            if (!response.ok) {
                throw new Error('Conversion failed');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error('Conversion API error');
            }

            setConversion({
                from: data.from,
                to: data.to,
                amount: data.amount,
                rate: data.rate,
                result: data.result,
                cached: data.cached || false
            });

        } catch (err) {
            console.error('Error converting currency:', err);
            setError("Error fetching exchange rates");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHistoricalData = useCallback(async (from, to) => {
        try {
            const response = await fetch(`${API_BASE_URL}/history?base=${from}&target=${to}&days=7`);
            if (!response.ok) {
                throw new Error('Failed to fetch historical data');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error('Historical data API error');
            }

            setHistoricalData(data.data.history || []);
        } catch (err) {
            console.error('Error fetching historical data:', err);
            setHistoricalData([]);
        }
    }, []);

    const handleAmountChange = (value) => {
        const amount = parseFloat(value) || 0;
        setConversion(prev => ({ ...prev, amount }));
        if (amount > 0) {
            convertCurrency(conversion.from, conversion.to, amount);
        }
    };

    const handleCurrencyChange = (type, currencyCode) => {
        if (type === 'from') {
            setConversion(prev => ({ ...prev, from: currencyCode }));
            convertCurrency(currencyCode, conversion.to, conversion.amount);
            fetchCurrencies(currencyCode);
        } else {
            setConversion(prev => ({ ...prev, to: currencyCode }));
            convertCurrency(conversion.from, currencyCode, conversion.amount);
        }

        setShowHistory(false);
        setHistoricalData([]);
    };

    const swapCurrencies = () => {
        setConversion(prev => ({
            ...prev,
            from: prev.to,
            to: prev.from,
            amount: prev.result,
            result: prev.amount,
            rate: prev.rate ? 1 / prev.rate : 0
        }));

        setShowHistory(false);
        setHistoricalData([]);
    };

    const toggleHistory = () => {
        if (!showHistory) {
            fetchHistoricalData(conversion.from, conversion.to);
        }
        setShowHistory(!showHistory);
    };

    const formatCurrency = (amount, currencyCode) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: settings.decimalPlaces,
            maximumFractionDigits: settings.decimalPlaces
        }).format(amount);
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: settings.decimalPlaces,
            maximumFractionDigits: settings.decimalPlaces
        }).format(number);
    };

    const getFilteredCurrencies = () => {
        return currencies.filter(currency =>
            currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            currency.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const calculateTrend = () => {
        if (historicalData.length < 2) return 'stable';

        const firstRate = historicalData[0].rate;
        const lastRate = historicalData[historicalData.length - 1].rate;
        const change = ((lastRate - firstRate) / firstRate) * 100;

        if (change > 0.1) return 'up';
        if (change < -0.1) return 'down';
        return 'stable';
    };

    const getTrendIcon = () => {
        const trend = calculateTrend();
        switch (trend) {
            case 'up': return '📈';
            case 'down': return '📉';
            default: return '➡️';
        }
    };

    const getTrendText = () => {
        const trend = calculateTrend();
        return t(trend);
    };

    useEffect(() => {
        fetchCurrencies('USD');
    }, [fetchCurrencies]);

    useEffect(() => {
        if (conversion.amount > 0 && conversion.from && conversion.to) {
            convertCurrency(conversion.from, conversion.to, conversion.amount);
        }
    }, [conversion.from, conversion.to, convertCurrency]);

    const filteredCurrencies = getFilteredCurrencies();
    const trendIcon = getTrendIcon();
    const trendText = getTrendText();

    return (
        <div className={styles["currency-converter"]}>
            <div className={styles["tool-header"]}>
                <h1>{"Currency Converter"}</h1>
                <p>{"Real-time exchange rates with historical data"}</p>
            </div>

            <div className={styles["converter-container"]}>
                {/* rest unchanged */}
            </div>
        </div>
    );
};

export default CurrencyConverter;