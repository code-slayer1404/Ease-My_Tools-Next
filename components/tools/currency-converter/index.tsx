"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './styles.module.css';

// ✅ FIX: make fallback optional
const t = (key: string, fallback?: string) => fallback ?? key;

type Currency = {
    code: string;
    name: string;
    rate: number;
};

type Historical = {
    date: string;
    rate: number;
};

const CurrencyConverter = () => {

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [conversion, setConversion] = useState({
        from: 'USD',
        to: 'INR',
        amount: 1,
        rate: 0,
        result: 0,
        cached: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historicalData, setHistoricalData] = useState<Historical[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [settings, setSettings] = useState({
        decimalPlaces: 2
    });

    const API_BASE_URL = 'http://localhost:8000';
    const lastConversionRef = useRef<any>(null);

    const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD'];

    const currencyNames: Record<string, string> = {
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
            if (!response.ok) throw new Error('Failed to fetch exchange rates');

            const data = await response.json();
            if (!data.success) throw new Error('API returned unsuccessful response');

            const rates = data.data.rates;

            const currencyList: Currency[] = Object.keys(rates).map(code => ({
                code,
                name: currencyNames[code] || code,
                rate: rates[code]
            }));

            setCurrencies(currencyList);

        } catch {
            setError("Error fetching exchange rates");
        } finally {
            setLoading(false);
        }
    }, []);

    const calculateTrend = () => {
        if (historicalData.length < 2) return 'stable';

        const first = historicalData[0].rate;
        const last = historicalData[historicalData.length - 1].rate;
        const change = ((last - first) / first) * 100;

        if (change > 0.1) return 'up';
        if (change < -0.1) return 'down';
        return 'stable';
    };

    const getTrendIcon = () => {
        const trend = calculateTrend();
        if (trend === 'up') return '📈';
        if (trend === 'down') return '📉';
        return '➡️';
    };

    const getTrendText = () => {
        const trend = calculateTrend();
        return t(trend); // ✅ now valid
    };

    useEffect(() => {
        fetchCurrencies();
    }, [fetchCurrencies]);

    const trendIcon = getTrendIcon();
    const trendText = getTrendText();

    return (
        <div className={styles["currency-converter"]}>
            <h1>{"Currency Converter"}</h1>
            <p>{trendIcon} {trendText}</p>
        </div>
    );
};

export default CurrencyConverter;