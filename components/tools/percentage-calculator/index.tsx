"use client";

import React, { useState } from 'react';
import styles from './styles.module.css';

const PercentageCalculator = () => {
    const [calculationType, setCalculationType] = useState('percentage');
    const [values, setValues] = useState({
        percentage: '',
        number: '',
        result: '',
        original: '',
        change: '',
        final: ''
    });

    const calculatePercentage = () => {
        const num = parseFloat(values.number);
        const perc = parseFloat(values.percentage);
        
        if (!isNaN(num) && !isNaN(perc)) {
            const result = (num * perc) / 100;
            setValues(prev => ({ ...prev, result: result.toFixed(2) }));
        }
    };

    const calculatePercentageChange = () => {
        const original = parseFloat(values.original);
        const final = parseFloat(values.final);
        
        if (!isNaN(original) && !isNaN(final)) {
            const change = ((final - original) / original) * 100;
            setValues(prev => ({ ...prev, change: change.toFixed(2) }));
        }
    };

    const calculateNumberFromPercentage = () => {
        const percentage = parseFloat(values.percentage);
        const result = parseFloat(values.result);
        
        if (!isNaN(percentage) && !isNaN(result)) {
            const number = (result * 100) / percentage;
            setValues(prev => ({ ...prev, number: number.toFixed(2) }));
        }
    };

    const clearAll = () => {
        setValues({
            percentage: '',
            number: '',
            result: '',
            original: '',
            change: '',
            final: ''
        });
    };

    return (
        <div className={styles["percentage-calculator"]}>
            <div className={styles["calculator-header"]}>
                <h1>{"Percentage Calculator"}</h1>
                <p>{"Calculate percentages, discounts, and changes"}</p>
            </div>

            <div className={styles["calculator-container"]}>
                <div className={styles["calculation-types"]}>
                    <button 
                        className={`${styles["type-btn"]} ${calculationType === 'percentage' ? styles["active"] : ""}`}
                        onClick={() => setCalculationType('percentage')}
                    >
                        {"Basic Percentage"}
                    </button>
                    <button 
                        className={`${styles["type-btn"]} ${calculationType === 'change' ? styles["active"] : ""}`}
                        onClick={() => setCalculationType('change')}
                    >
                        {"Percentage Change"}
                    </button>
                    <button 
                        className={`${styles["type-btn"]} ${calculationType === 'findNumber' ? styles["active"] : ""}`}
                        onClick={() => setCalculationType('findNumber')}
                    >
                        {"Find Number"}
                    </button>
                </div>

                {calculationType === 'percentage' && (
                    <div className={styles["calculation-section"]}>
                        <h3>{"Basic Percentage"}</h3>
                        <div className={styles["input-group"]}>
                            <label>{"What is"} </label>
                            <input
                                type="number"
                                value={values.percentage}
                                onChange={(e) => setValues(prev => ({ ...prev, percentage: e.target.value }))}
                                placeholder="%"
                            />
                            <label> {"of"} </label>
                            <input
                                type="number"
                                value={values.number}
                                onChange={(e) => setValues(prev => ({ ...prev, number: e.target.value }))}
                                placeholder={"Number"}
                            />
                            <span>?</span>
                        </div>
                        <button onClick={calculatePercentage} className={styles["calculate-btn"]}>
                            {"Calculate"}
                        </button>
                        {values.result && (
                            <div className={styles["result"]}>
                                <strong>{values.percentage}% {"of"} {values.number} = {values.result}</strong>
                            </div>
                        )}
                    </div>
                )}

                {calculationType === 'change' && (
                    <div className={styles["calculation-section"]}>
                        <h3>{"Percentage Change"}</h3>
                        <div className={`${styles["input-group"]} ${styles["vertical"]}`}>
                            <label>{"Original Value"}</label>
                            <input
                                type="number"
                                value={values.original}
                                onChange={(e) => setValues(prev => ({ ...prev, original: e.target.value }))}
                                placeholder={"Original Value"}
                            />
                            <label>{"Final Value"}</label>
                            <input
                                type="number"
                                value={values.final}
                                onChange={(e) => setValues(prev => ({ ...prev, final: e.target.value }))}
                                placeholder={"Final Value"}
                            />
                        </div>
                        <button onClick={calculatePercentageChange} className={styles["calculate-btn"]}>
                            {"Calculate"}
                        </button>
                        {values.change && (
                            <div className={styles["result"]}>
                                <strong>{"Percentage Change"}: {values.change}%</strong>
                            </div>
                        )}
                    </div>
                )}

                {calculationType === 'findNumber' && (
                    <div className={styles["calculation-section"]}>
                        <h3>{"Find Number"}</h3>
                        <div className={styles["input-group"]}>
                            <label>{values.result} {"is"} </label>
                            <input
                                type="number"
                                value={values.percentage}
                                onChange={(e) => setValues(prev => ({ ...prev, percentage: e.target.value }))}
                                placeholder="%"
                            />
                            <label> {"of what number?"} </label>
                            <input
                                type="number"
                                value={values.result}
                                onChange={(e) => setValues(prev => ({ ...prev, result: e.target.value }))}
                                placeholder={"Result"}
                            />
                        </div>
                        <button onClick={calculateNumberFromPercentage} className={styles["calculate-btn"]}>
                            {"Calculate"}
                        </button>
                        {values.number && (
                            <div className={styles["result"]}>
                                <strong>{values.result} {"is"} {values.percentage}% {"of"} {values.number}</strong>
                            </div>
                        )}
                    </div>
                )}

                <button onClick={clearAll} className={styles["clear-btn"]}>
                    {"Clear All"}
                </button>
            </div>
        </div>
    );
};

export default PercentageCalculator;