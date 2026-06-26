"use client"

import React, { useState, useEffect } from "react"
import styles from "./styles.module.css"

type ConversionCategory =
    | "length"
    | "weight"
    | "temperature"
    | "area"
    | "volume"
    | "speed"

interface ConversionFormulas {
    length: Record<string, number>
    weight: Record<string, number>
    temperature: Record<string, (val: number, toUnit: string) => number>
    area: Record<string, number>
    volume: Record<string, number>
    speed: Record<string, number>
}

const UnitConverter = () => {
    const [category, setCategory] = useState<ConversionCategory>("length")
    const [fromUnit, setFromUnit] = useState<string>("meter")
    const [toUnit, setToUnit] = useState<string>("kilometer")
    const [inputValue, setInputValue] = useState<string>("")
    const [result, setResult] = useState<string>("")
    const [isConverting, setIsConverting] = useState<boolean>(false)

    const conversionFormulas: ConversionFormulas = {
        length: {
            meter: 1,
            kilometer: 0.001,
            centimeter: 100,
            millimeter: 1000,
            mile: 0.000621371,
            yard: 1.09361,
            foot: 3.28084,
            inch: 39.3701,
        },
        weight: {
            kilogram: 1,
            gram: 1000,
            milligram: 1000000,
            pound: 2.20462,
            ounce: 35.274,
        },
        temperature: {
            celsius: (val: number, toUnit: string) => {
                if (toUnit === "fahrenheit") return (val * 9) / 5 + 32
                if (toUnit === "kelvin") return val + 273.15
                return val
            },
            fahrenheit: (val: number, toUnit: string) => {
                if (toUnit === "celsius") return ((val - 32) * 5) / 9
                if (toUnit === "kelvin") return ((val - 32) * 5) / 9 + 273.15
                return val
            },
            kelvin: (val: number, toUnit: string) => {
                if (toUnit === "celsius") return val - 273.15
                if (toUnit === "fahrenheit")
                    return ((val - 273.15) * 9) / 5 + 32
                return val
            },
        },
        area: {
            squareMeter: 1,
            squareKilometer: 0.000001,
            squareMile: 3.861e-7,
            squareYard: 1.19599,
            squareFoot: 10.7639,
            acre: 0.000247105,
            hectare: 0.0001,
        },
        volume: {
            liter: 1,
            milliliter: 1000,
            gallon: 0.264172,
            quart: 1.05669,
            pint: 2.11338,
            cubicMeter: 0.001,
            cubicFoot: 0.0353147,
        },
        speed: {
            meterPerSecond: 1,
            kilometerPerHour: 3.6,
            milePerHour: 2.23694,
            knot: 1.94384,
        },
    }

    const categoryLabels: Record<ConversionCategory, string> = {
        length: "Length",
        weight: "Weight",
        temperature: "Temperature",
        area: "Area",
        volume: "Volume",
        speed: "Speed",
    }

    const unitLabels: Record<string, Record<string, string>> = {
        length: {
            meter: "Meter (m)",
            kilometer: "Kilometer (km)",
            centimeter: "Centimeter (cm)",
            millimeter: "Millimeter (mm)",
            mile: "Mile (mi)",
            yard: "Yard (yd)",
            foot: "Foot (ft)",
            inch: "Inch (in)",
        },
        weight: {
            kilogram: "Kilogram (kg)",
            gram: "Gram (g)",
            milligram: "Milligram (mg)",
            pound: "Pound (lb)",
            ounce: "Ounce (oz)",
        },
        temperature: {
            celsius: "Celsius (°C)",
            fahrenheit: "Fahrenheit (°F)",
            kelvin: "Kelvin (K)",
        },
        area: {
            squareMeter: "Square Meter (m²)",
            squareKilometer: "Square Kilometer (km²)",
            squareMile: "Square Mile (mi²)",
            squareYard: "Square Yard (yd²)",
            squareFoot: "Square Foot (ft²)",
            acre: "Acre",
            hectare: "Hectare",
        },
        volume: {
            liter: "Liter (L)",
            milliliter: "Milliliter (mL)",
            gallon: "Gallon (gal)",
            quart: "Quart (qt)",
            pint: "Pint (pt)",
            cubicMeter: "Cubic Meter (m³)",
            cubicFoot: "Cubic Foot (ft³)",
        },
        speed: {
            meterPerSecond: "Meter/Second (m/s)",
            kilometerPerHour: "Kilometer/Hour (km/h)",
            milePerHour: "Mile/Hour (mph)",
            knot: "Knot (kn)",
        },
    }

    const getUnits = () => {
        const unitKeys = Object.keys(conversionFormulas[category] || {})
        return unitKeys.map((key) => ({
            value: key,
            label:
                unitLabels[category]?.[key] ||
                key.charAt(0).toUpperCase() + key.slice(1),
        }))
    }

    const convertUnits = () => {
        if (!inputValue || isNaN(parseFloat(inputValue))) {
            setResult("")
            return
        }

        setIsConverting(true)
        const value = parseFloat(inputValue)

        setTimeout(() => {
            try {
                if (category === "temperature") {
                    const temperatureFormulas = conversionFormulas.temperature
                    const converter =
                        temperatureFormulas[
                            fromUnit as keyof typeof temperatureFormulas
                        ]
                    if (converter && typeof converter === "function") {
                        const convertedValue = converter(value, toUnit)
                        setResult(convertedValue.toFixed(6))
                    } else {
                        setResult("Error")
                    }
                } else {
                    const categoryFormulas = conversionFormulas[
                        category
                    ] as Record<string, number>
                    const fromFactor = categoryFormulas[fromUnit]
                    const toFactor = categoryFormulas[toUnit]

                    if (fromFactor && toFactor) {
                        const baseValue = value / fromFactor
                        const convertedValue = baseValue * toFactor
                        setResult(convertedValue.toFixed(6))
                    } else {
                        setResult("Error")
                    }
                }
            } catch {
                setResult("Error")
            }
            setIsConverting(false)
        }, 100)
    }

    const swapUnits = () => {
        setFromUnit(toUnit)
        setToUnit(fromUnit)
        setResult("")
    }

    const handleCategoryChange = (newCategory: ConversionCategory) => {
        setCategory(newCategory)
        const units = Object.keys(conversionFormulas[newCategory] || {})
        setFromUnit(units[0] || "")
        setToUnit(units[1] || units[0] || "")
        setInputValue("")
        setResult("")
    }

    useEffect(() => {
        if (inputValue && inputValue.trim() !== "") {
            const timeoutId = setTimeout(convertUnits, 500)
            return () => clearTimeout(timeoutId)
        } else {
            setResult("")
        }
    }, [inputValue, fromUnit, toUnit, category])

    const units = getUnits()

    return (
        <div className={styles["unit-converter"]}>
            {/* <div className={styles["converter-header"]}>
                <h1>Unit Converter</h1>
                <p>Convert between different units instantly</p>
            </div> */}

            <div className={styles["converter-container"]}>
                <div className={styles["category-selector"]}>
                    {(Object.keys(categoryLabels) as ConversionCategory[]).map(
                        (key) => (
                            <button
                                key={key}
                                className={`${styles["category-btn"]} ${category === key ? styles["active"] : ""}`}
                                onClick={() => handleCategoryChange(key)}
                            >
                                {categoryLabels[key]}
                            </button>
                        )
                    )}
                </div>

                <div className={styles["conversion-interface"]}>
                    <div className={styles["input-section"]}>
                        <label>From</label>
                        <div className={styles["input-group"]}>
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => setInputValue(e.target.value)}
                                placeholder="Enter value"
                                className={styles["value-input"]}
                            />
                            <select
                                value={fromUnit}
                                onChange={(
                                    e: React.ChangeEvent<HTMLSelectElement>
                                ) => setFromUnit(e.target.value)}
                                className={styles["unit-select"]}
                                disabled={!units.length}
                            >
                                {units.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        className={styles["swap-btn"]}
                        onClick={swapUnits}
                        title="Swap units"
                        disabled={!units.length}
                    >
                        ⇄
                    </button>

                    <div className={styles["output-section"]}>
                        <label>To</label>
                        <div className={styles["input-group"]}>
                            <input
                                type="text"
                                value={result || ""}
                                readOnly
                                className={styles["result-input"]}
                                placeholder="Result"
                            />
                            <select
                                value={toUnit}
                                onChange={(
                                    e: React.ChangeEvent<HTMLSelectElement>
                                ) => setToUnit(e.target.value)}
                                className={styles["unit-select"]}
                                disabled={!units.length}
                            >
                                {units.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {result && result !== "Error" && (
                    <div className={styles["result-display"]}>
                        <h3>Result:</h3>
                        <p>
                            {inputValue}{" "}
                            {unitLabels[category]?.[fromUnit] || fromUnit} =
                            <strong>
                                {" "}
                                {result}{" "}
                                {unitLabels[category]?.[toUnit] || toUnit}
                            </strong>
                        </p>
                    </div>
                )}

                {result === "Error" && (
                    <div className={styles["error-display"]}>
                        <p>⚠️ Conversion error. Please check your input.</p>
                    </div>
                )}

                {isConverting && (
                    <div className={styles["loading-display"]}>
                        <div className={styles["spinner"]}></div>
                        <p>Converting...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UnitConverter
