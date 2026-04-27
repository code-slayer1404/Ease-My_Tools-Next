"use client";

import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

// ✅ FIX: fallback optional
const t = (key: string, fallback?: string) => fallback ?? key;

const UnitConverter = () => {
    const [category, setCategory] = useState('length');
    const [fromUnit, setFromUnit] = useState('meter');
    const [toUnit, setToUnit] = useState('kilometer');
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const [isConverting, setIsConverting] = useState(false);

    const conversionFormulas = {
        length: { meter: 1, kilometer: 0.001, centimeter: 100, millimeter: 1000, mile: 0.000621371, yard: 1.09361, foot: 3.28084, inch: 39.3701 },
        weight: { kilogram: 1, gram: 1000, milligram: 1000000, pound: 2.20462, ounce: 35.274 },
        temperature: {
            celsius: (val, toUnit) => toUnit === 'fahrenheit' ? (val * 9 / 5) + 32 : toUnit === 'kelvin' ? val + 273.15 : val,
            fahrenheit: (val, toUnit) => toUnit === 'celsius' ? (val - 32) * 5 / 9 : toUnit === 'kelvin' ? (val - 32) * 5 / 9 + 273.15 : val,
            kelvin: (val, toUnit) => toUnit === 'celsius' ? val - 273.15 : toUnit === 'fahrenheit' ? (val - 273.15) * 9 / 5 + 32 : val,
        },
        area: { squareMeter: 1, squareKilometer: 0.000001, squareMile: 3.861e-7, squareYard: 1.19599, squareFoot: 10.7639, acre: 0.000247105, hectare: 0.0001 },
        volume: { liter: 1, milliliter: 1000, gallon: 0.264172, quart: 1.05669, pint: 2.11338, cubicMeter: 0.001, cubicFoot: 0.0353147 },
        speed: { meterPerSecond: 1, kilometerPerHour: 3.6, milePerHour: 2.23694, knot: 1.94384 }
    };

    const getCategories = () => {
        const categoryKeys = ['length', 'weight', 'temperature', 'area', 'volume', 'speed'];
        return categoryKeys.reduce((acc, key) => {
            acc[key] = t(`unitConverter:categories.${key}`, key.charAt(0).toUpperCase() + key.slice(1));
            return acc;
        }, {} as Record<string, string>);
    };

    const getUnits = () => {
        const unitKeys = Object.keys(conversionFormulas[category] || {});
        return unitKeys.map(key => ({
            value: key,
            label: t(`unitConverter:units.${category}.${key}`, key.charAt(0).toUpperCase() + key.slice(1))
        }));
    };

    const getUnitLabel = (unitKey) => t(`unitConverter:units.${category}.${unitKey}`, unitKey);

    const convertUnits = () => {
        if (!inputValue || isNaN(parseFloat(inputValue))) {
            setResult('');
            return;
        }

        setIsConverting(true);
        const value = parseFloat(inputValue);

        try {
            if (category === 'temperature') {
                const convertedValue = conversionFormulas.temperature[fromUnit](value, toUnit);
                setResult(convertedValue.toFixed(6));
            } else {
                const fromFactor = conversionFormulas[category][fromUnit];
                const toFactor = conversionFormulas[category][toUnit];
                if (fromFactor && toFactor) {
                    const baseValue = value / fromFactor;
                    const convertedValue = baseValue * toFactor;
                    setResult(convertedValue.toFixed(6));
                } else setResult('Error');
            }
        } catch (err) {
            console.error('Conversion error:', err);
            setResult('Error');
        }

        setIsConverting(false);
    };

    const swapUnits = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        const units = Object.keys(conversionFormulas[newCategory] || {});
        setFromUnit(units[0] || '');
        setToUnit(units[1] || units[0] || '');
        setInputValue('');
        setResult('');
    };

    useEffect(() => {
        if (inputValue && inputValue.trim() !== '') {
            const timeoutId = setTimeout(convertUnits, 500);
            return () => clearTimeout(timeoutId);
        } else setResult('');
    }, [inputValue, fromUnit, toUnit, category]);

    const categories = getCategories();
    const units = getUnits();

    return (
        <div className={styles["unit-converter"]}>
            <div className={styles["converter-header"]}>
                <h1>{"Unit Converter"}</h1>
                <p>{"Convert between different units instantly"}</p>
            </div>

            <div className={styles["converter-container"]}>
                <div className={styles["category-selector"]}>
                    {Object.entries(categories).map(([key, label]) => (
                        <button
                            key={key}
                            className={`${styles["category-btn"]} ${category === key ? styles["active"] : ""}`}
                            onClick={() => handleCategoryChange(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className={styles["conversion-interface"]}>
                    <div className={styles["input-section"]}>
                        <label>{"From"}</label>
                        <div className={styles["input-group"]}>
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={"Enter value"}
                                className={styles["value-input"]}
                            />
                            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className={styles["unit-select"]} disabled={!units.length}>
                                {units.map(unit => (
                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button className={styles["swap-btn"]} onClick={swapUnits} title={"Swap"} disabled={!units.length}>
                        ⇄
                    </button>

                    <div className={styles["output-section"]}>
                        <label>{"To"}</label>
                        <div className={styles["input-group"]}>
                            <input type="text" value={result || ''} readOnly className={styles["result-input"]} placeholder={"Result"} />
                            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className={styles["unit-select"]} disabled={!units.length}>
                                {units.map(unit => (
                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {result && result !== 'Error' && (
                    <div className={styles["result-display"]}>
                        <h3>{"Result"}:</h3>
                        <p>
                            {inputValue} {getUnitLabel(fromUnit)} =
                            <strong> {result} {getUnitLabel(toUnit)}</strong>
                        </p>
                    </div>
                )}

                {result === 'Error' && (
                    <div className={styles["error-display"]}>
                        <p>⚠️ {"Conversion error. Please check your input."}</p>
                    </div>
                )}

                {isConverting && (
                    <div className={styles["loading-display"]}>
                        <p>⏳ {"Converting..."}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnitConverter;