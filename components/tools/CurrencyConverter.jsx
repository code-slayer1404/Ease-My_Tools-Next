"use client";

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// 
// import { useTheme } from '../../contexts/ThemeContext';
// import '../../styles/tools/CurrencyConverter.css';

// const CurrencyConverter = () => {
//     const { t } = useTranslation('currencyConverter');
//     const { theme } = useTheme();
    
//     const [currencies, setCurrencies] = useState([]);
//     const [conversion, setConversion] = useState({
//         from: 'USD',
//         to: 'INR',
//         amount: 1,
//         rate: 0,
//         result: 0,
//         lastUpdated: null,
//         cached: false
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [historicalData, setHistoricalData] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [settings, setSettings] = useState({
//         autoUpdate: true,
//         updateFrequency: 60,
//         decimalPlaces: 2
//     });

//     const API_BASE_URL = 'http://localhost:8000';
//     const updateIntervalRef = useRef();

//     const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD'];

//     const fetchCurrencies = useCallback(async (baseCurrency = 'USD') => {
//         try {
//             setLoading(true);
//             setError(null);
            
//             const response = await fetch(`${API_BASE_URL}/rates?base=${baseCurrency}`);
//             if (!response.ok) {
//                 throw new Error('Failed to fetch exchange rates');
//             }
            
//             const data = await response.json();
//             if (!data.success) {
//                 throw new Error('API returned unsuccessful response');
//             }

//             const rates = data.data.rates;
//             const currencyList = Object.keys(rates).map(code => ({
//                 code,
//                 name: getCurrencyName(code),
//                 rate: rates[code]
//             }));

//             setCurrencies(currencyList);
            
//             // Update conversion rate if needed
//             if (conversion.from === baseCurrency && conversion.to in rates) {
//                 const newRate = rates[conversion.to];
//                 const newResult = conversion.amount * newRate;
//                 setConversion(prev => ({
//                     ...prev,
//                     rate: newRate,
//                     result: newResult,
//                     lastUpdated: new Date().toLocaleString(),
//                     cached: data.data.cached || false
//                 }));
//             }

//         } catch (err) {
//             console.error('Error fetching currencies:', err);
//             setError("Error fetching exchange rates");
//         } finally {
//             setLoading(false);
//         }
//     }, [conversion.from, conversion.to, conversion.amount, t]);

//     const convertCurrency = useCallback(async (from, to, amount) => {
//         if (!from || !to || amount <= 0) return;

//         try {
//             setLoading(true);
//             setError(null);
            
//             const response = await fetch(
//                 `${API_BASE_URL}/convert?from_currency=${from}&to_currency=${to}&amount=${amount}`
//             );
            
//             if (!response.ok) {
//                 throw new Error('Conversion failed');
//             }
            
//             const data = await response.json();
//             if (!data.success) {
//                 throw new Error('Conversion API error');
//             }

//             setConversion({
//                 from: data.from,
//                 to: data.to,
//                 amount: data.amount,
//                 rate: data.rate,
//                 result: data.result,
//                 lastUpdated: new Date().toLocaleString(),
//                 cached: data.cached || false
//             });

//         } catch (err) {
//             console.error('Error converting currency:', err);
//             setError("Error fetching exchange rates");
//         } finally {
//             setLoading(false);
//         }
//     }, [t]);

//     const getCurrencyName = (code) => {
//         const currencyNames = {
//             USD: 'US Dollar',
//             EUR: 'Euro',
//             GBP: 'British Pound',
//             JPY: 'Japanese Yen',
//             CAD: 'Canadian Dollar',
//             AUD: 'Australian Dollar',
//             CHF: 'Swiss Franc',
//             CNY: 'Chinese Yuan',
//             INR: 'Indian Rupee',
//             SGD: 'Singapore Dollar',
//             AED: 'UAE Dirham',
//             SAR: 'Saudi Riyal',
//             MYR: 'Malaysian Ringgit',
//             THB: 'Thai Baht',
//             KRW: 'South Korean Won',
//             IDR: 'Indonesian Rupiah',
//             PHP: 'Philippine Peso',
//             VND: 'Vietnamese Dong',
//             PKR: 'Pakistani Rupee',
//             BDT: 'Bangladeshi Taka',
//             LKR: 'Sri Lankan Rupee',
//             NPR: 'Nepalese Rupee',
//             BRL: 'Brazilian Real',
//             MXN: 'Mexican Peso',
//             RUB: 'Russian Ruble',
//             ZAR: 'South African Rand'
//         };
//         return currencyNames[code] || code;
//     };

//     const handleAmountChange = (value) => {
//         const amount = parseFloat(value) || 0;
//         setConversion(prev => ({ ...prev, amount }));
//         if (amount > 0) {
//             convertCurrency(conversion.from, conversion.to, amount);
//         }
//     };

//     const handleCurrencyChange = (type, currencyCode) => {
//         if (type === 'from') {
//             setConversion(prev => ({ ...prev, from: currencyCode }));
//             convertCurrency(currencyCode, conversion.to, conversion.amount);
//             fetchCurrencies(currencyCode);
//         } else {
//             setConversion(prev => ({ ...prev, to: currencyCode }));
//             convertCurrency(conversion.from, currencyCode, conversion.amount);
//         }
//     };

//     const swapCurrencies = () => {
//         setConversion(prev => ({
//             ...prev,
//             from: prev.to,
//             to: prev.from,
//             amount: prev.result,
//             result: prev.amount,
//             rate: prev.rate ? 1 / prev.rate : 0
//         }));
//     };

//     const formatCurrency = (amount, currencyCode) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: currencyCode,
//             minimumFractionDigits: settings.decimalPlaces,
//             maximumFractionDigits: settings.decimalPlaces
//         }).format(amount);
//     };

//     const formatNumber = (number) => {
//         return new Intl.NumberFormat('en-US', {
//             minimumFractionDigits: settings.decimalPlaces,
//             maximumFractionDigits: settings.decimalPlaces
//         }).format(number);
//     };

//     const getFilteredCurrencies = () => {
//         return currencies.filter(currency =>
//             currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             currency.name.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//     };

//     // Initialize and set up auto-update
//     useEffect(() => {
//         fetchCurrencies('USD');
        
//         if (settings.autoUpdate) {
//             updateIntervalRef.current = setInterval(() => {
//                 fetchCurrencies(conversion.from);
//             }, settings.updateFrequency * 1000);
//         }

//         return () => {
//             if (updateIntervalRef.current) {
//                 clearInterval(updateIntervalRef.current);
//             }
//         };
//     }, [fetchCurrencies, settings.autoUpdate, settings.updateFrequency, conversion.from]);

//     // Convert when amount or currencies change
//     useEffect(() => {
//         if (conversion.amount > 0 && conversion.from && conversion.to) {
//             convertCurrency(conversion.from, conversion.to, conversion.amount);
//         }
//     }, [conversion.from, conversion.to, convertCurrency]);

//     const filteredCurrencies = getFilteredCurrencies();

//     return (
//         <div className={`currency-converter ${theme}`}>
//             <div className="tool-header">
//                 <h1>{"Currency Converter"}</h1>
//                 <p>{"Real-time exchange rates with historical data"}</p>
//             </div>

//             <div className="converter-container">
//                 {/* Main Conversion Card */}
//                 <div className="conversion-card">
//                     <div className="conversion-form">
//                         <div className="amount-section">
//                             <label>{"Amount"}</label>
//                             <div className="amount-input-container">
//                                 <input
//                                     type="number"
//                                     value={conversion.amount}
//                                     onChange={(e) => handleAmountChange(e.target.value)}
//                                     placeholder="0.00"
//                                     min="0"
//                                     step="0.01"
//                                     className="amount-input"
//                                 />
//                                 <span className="currency-symbol">
//                                     {conversion.from}
//                                 </span>
//                             </div>
//                         </div>

//                         <div className="currency-selection">
//                             <div className="currency-group">
//                                 <label>{"From"}</label>
//                                 <select
//                                     value={conversion.from}
//                                     onChange={(e) => handleCurrencyChange('from', e.target.value)}
//                                     className="currency-select"
//                                 >
//                                     {currencies.map(currency => (
//                                         <option key={currency.code} value={currency.code}>
//                                             {currency.code} - {currency.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <button 
//                                 className="swap-btn"
//                                 onClick={swapCurrencies}
//                                 title={"Swap Currencies"}
//                             >
//                                 ⇄
//                             </button>

//                             <div className="currency-group">
//                                 <label>{"To"}</label>
//                                 <select
//                                     value={conversion.to}
//                                     onChange={(e) => handleCurrencyChange('to', e.target.value)}
//                                     className="currency-select"
//                                 >
//                                     {currencies.map(currency => (
//                                         <option key={currency.code} value={currency.code}>
//                                             {currency.code} - {currency.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         {loading && (
//                             <div className="loading-indicator">
//                                 <div className="spinner"></div>
//                                 <span>{"Calculating..."}</span>
//                             </div>
//                         )}

//                         {error && (
//                             <div className="error-message">
//                                 <span>{error}</span>
//                                 <button 
//                                     onClick={() => fetchCurrencies(conversion.from)}
//                                     className="retry-btn"
//                                 >
//                                     {"Retry"}
//                                 </button>
//                             </div>
//                         )}

//                         {conversion.result > 0 && !loading && !error && (
//                             <div className="conversion-result">
//                                 <div className="result-main">
//                                     <span className="result-amount">
//                                         {formatCurrency(conversion.result, conversion.to)}
//                                     </span>
//                                     <span className="result-label">
//                                         {"Converted Amount"}
//                                     </span>
//                                 </div>
                                
//                                 <div className="conversion-details">
//                                     <div className="rate-info">
//                                         <span className="rate-label">{"Exchange Rate"}:</span>
//                                         <span className="rate-value">
//                                             1 {conversion.from} = {formatNumber(conversion.rate)} {conversion.to}
//                                         </span>
//                                     </div>
                                    
//                                     {conversion.lastUpdated && (
//                                         <div className="update-info">
//                                             <span className="update-label">{"Last Updated"}:</span>
//                                             <span className="update-value">
//                                                 {conversion.lastUpdated}
//                                                 {conversion.cached && <span className="cached-badge">Cached</span>}
//                                             </span>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Popular Currencies */}
//                 <div className="popular-currencies">
//                     <h3>{"Popular Currencies"}</h3>
//                     <div className="popular-grid">
//                         {popularCurrencies.map(currencyCode => (
//                             <button
//                                 key={currencyCode}
//                                 className={`currency-chip ${conversion.to === currencyCode ? 'active' : ''}`}
//                                 onClick={() => handleCurrencyChange('to', currencyCode)}
//                             >
//                                 {currencyCode}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Currency List */}
//                 <div className="currency-list-section">
//                     <div className="section-header">
//                         <h3>{"All Currencies"}</h3>
//                         <div className="search-box">
//                             <input
//                                 type="text"
//                                 placeholder={"Search currency..."}
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="search-input"
//                             />
//                         </div>
//                     </div>
                    
//                     <div className="currency-list">
//                         {filteredCurrencies.slice(0, 50).map(currency => (
//                             <div
//                                 key={currency.code}
//                                 className={`currency-item ${conversion.to === currency.code ? 'selected' : ''}`}
//                                 onClick={() => handleCurrencyChange('to', currency.code)}
//                             >
//                                 <div className="currency-info">
//                                     <span className="currency-code">{currency.code}</span>
//                                     <span className="currency-name">{currency.name}</span>
//                                 </div>
//                                 <div className="currency-rate">
//                                     {formatNumber(currency.rate)}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Tips Section */}
//                 <div className="tips-section">
//                     <h3>💡 {"Conversion Tips"}</h3>
//                     <div className="tips-list">
//                         <div className="tip-item">{"Rates are updated every 10 minutes"}</div>
//                         <div className="tip-item">{"Click swap to quickly reverse conversion"}</div>
//                         <div className="tip-item">{"Use historical data to track trends"}</div>
//                         <div className="tip-item">{"Bookmark frequently used conversions"}</div>
//                         <div className="tip-item">{"All rates are for informational purposes"}</div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CurrencyConverter;







import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/CurrencyConverter.css';

const t = (key, fallback) => fallback ?? key;

const CurrencyConverter = () => {
    const { theme } = useTheme();
    
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
            
            // Update conversion rate if needed
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
    }, [conversion.from, conversion.to, conversion.amount, t]);

    const convertCurrency = useCallback(async (from, to, amount) => {
        if (!from || !to || amount <= 0) return;

        // Store the conversion for history
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
    }, [t]);

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
        
        // Reset history when currencies change
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

    // Initialize currencies
    useEffect(() => {
        fetchCurrencies('USD');
    }, [fetchCurrencies]);

    // Convert when amount or currencies change
    useEffect(() => {
        if (conversion.amount > 0 && conversion.from && conversion.to) {
            convertCurrency(conversion.from, conversion.to, conversion.amount);
        }
    }, [conversion.from, conversion.to, convertCurrency]);

    const filteredCurrencies = getFilteredCurrencies();
    const trendIcon = getTrendIcon();
    const trendText = getTrendText();

    return (
        <div className={`currency-converter ${theme}`}>
            <div className="tool-header">
                <h1>{"Currency Converter"}</h1>
                <p>{"Real-time exchange rates with historical data"}</p>
            </div>

            <div className="converter-container">
                {/* Main Conversion Card */}
                <div className="conversion-card">
                    <div className="conversion-form">
                        <div className="amount-section">
                            <label>{"Amount"}</label>
                            <div className="amount-input-container">
                                <input
                                    type="number"
                                    value={conversion.amount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="amount-input"
                                />
                                <span className="currency-symbol">
                                    {conversion.from}
                                </span>
                            </div>
                        </div>

                        <div className="currency-selection">
                            <div className="currency-group">
                                <label>{"From"}</label>
                                <select
                                    value={conversion.from}
                                    onChange={(e) => handleCurrencyChange('from', e.target.value)}
                                    className="currency-select"
                                >
                                    {currencies.map(currency => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                className="swap-btn"
                                onClick={swapCurrencies}
                                title={"Swap Currencies"}
                                disabled={loading}
                            >
                                ⇄
                            </button>

                            <div className="currency-group">
                                <label>{"To"}</label>
                                <select
                                    value={conversion.to}
                                    onChange={(e) => handleCurrencyChange('to', e.target.value)}
                                    className="currency-select"
                                >
                                    {currencies.map(currency => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading && (
                            <div className="loading-indicator">
                                <div className="spinner"></div>
                                <span>{"Calculating..."}</span>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                <span>{error}</span>
                                <button 
                                    onClick={() => fetchCurrencies(conversion.from)}
                                    className="retry-btn"
                                >
                                    {"Retry"}
                                </button>
                            </div>
                        )}

                        {conversion.result > 0 && !loading && !error && (
                            <div className="conversion-result">
                                <div className="result-main">
                                    <span className="result-amount">
                                        {formatCurrency(conversion.result, conversion.to)}
                                    </span>
                                    <span className="result-label">
                                        {"Converted Amount"}
                                    </span>
                                </div>
                                
                                <div className="conversion-details">
                                    <div className="rate-info">
                                        <span className="rate-label">{"Exchange Rate"}:</span>
                                        <span className="rate-value">
                                            1 {conversion.from} = {formatNumber(conversion.rate)} {conversion.to}
                                        </span>
                                    </div>
                                    
                                    <div className="cache-info">
                                        <span className="cache-label">{"Last Updated"}:</span>
                                        <span className="cache-value">
                                            {new Date().toLocaleTimeString()}
                                            {conversion.cached && <span className="cached-badge">Cached</span>}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    className="history-toggle-btn"
                                    onClick={toggleHistory}
                                >
                                    {showHistory ? "Hide History" : "View History"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Historical Data Section */}
                    {showHistory && historicalData.length > 0 && (
                        <div className="historical-section">
                            <h3>{"Historical Trend (7 Days)"}</h3>
                            <div className="trend-indicator">
                                <span className="trend-icon">{trendIcon}</span>
                                <span className="trend-text">{trendText}</span>
                            </div>
                            <div className="history-chart">
                                {historicalData.map((day, index) => (
                                    <div key={day.date} className="history-bar">
                                        <div 
                                            className="bar-fill"
                                            style={{
                                                height: `${(day.rate / Math.max(...historicalData.map(d => d.rate))) * 80}%`
                                            }}
                                        ></div>
                                        <div className="bar-label">
                                            <small>{new Date(day.date).toLocaleDateString()}</small>
                                            <small>{formatNumber(day.rate)}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="history-table">
                                {historicalData.slice(-7).map(day => (
                                    <div key={day.date} className="history-row">
                                        <span className="history-date">
                                            {new Date(day.date).toLocaleDateString()}
                                        </span>
                                        <span className="history-rate">
                                            {formatNumber(day.rate)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showHistory && historicalData.length === 0 && !loading && (
                        <div className="no-history">
                            <p>{"No historical data available"}</p>
                        </div>
                    )}
                </div>

                {/* Popular Currencies */}
                <div className="popular-currencies">
                    <h3>{"Popular Currencies"}</h3>
                    <div className="popular-grid">
                        {popularCurrencies.map(currencyCode => (
                            <button
                                key={currencyCode}
                                className={`currency-chip ${conversion.to === currencyCode ? 'active' : ''}`}
                                onClick={() => handleCurrencyChange('to', currencyCode)}
                                disabled={loading}
                            >
                                {currencyCode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Currency List */}
                <div className="currency-list-section">
                    <div className="section-header">
                        <h3>{"All Currencies"}</h3>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder={"Search currency..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                    
                    <div className="currency-list">
                        {filteredCurrencies.slice(0, 50).map(currency => (
                            <div
                                key={currency.code}
                                className={`currency-item ${conversion.to === currency.code ? 'selected' : ''}`}
                                onClick={() => handleCurrencyChange('to', currency.code)}
                            >
                                <div className="currency-info">
                                    <span className="currency-code">{currency.code}</span>
                                    <span className="currency-name">{currency.name}</span>
                                </div>
                                <div className="currency-rate">
                                    {formatNumber(currency.rate)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips Section */}
                <div className="tips-section">
                    <h3>💡 {"Conversion Tips"}</h3>
                    <div className="tips-list">
                        <div className="tip-item">{"Rates are updated every 10 minutes"}</div>
                        <div className="tip-item">{"Click swap to quickly reverse conversion"}</div>
                        <div className="tip-item">{"Use historical data to track trends"}</div>
                        <div className="tip-item">{"Bookmark frequently used conversions"}</div>
                        <div className="tip-item">{"All rates are for informational purposes"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrencyConverter;