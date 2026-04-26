"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/PercentageCalculator.css';

const PercentageCalculator = () => {
    const { theme } = useTheme();
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
        <div className={`percentage-calculator ${theme}`}>
            <div className="calculator-header">
                <h1>{"Percentage Calculator" || 'Percentage Calculator'}</h1>
                <p>{"Calculate percentages, discounts, and changes" || 'Calculate percentages, discounts, and changes'}</p>
            </div>

            <div className="calculator-container">
                <div className="calculation-types">
                    <button 
                        className={`type-btn ${calculationType === 'percentage' ? 'active' : ''}`}
                        onClick={() => setCalculationType('percentage')}
                    >
                        {"Basic Percentage" || 'Basic Percentage'}
                    </button>
                    <button 
                        className={`type-btn ${calculationType === 'change' ? 'active' : ''}`}
                        onClick={() => setCalculationType('change')}
                    >
                        {"Percentage Change" || 'Percentage Change'}
                    </button>
                    <button 
                        className={`type-btn ${calculationType === 'findNumber' ? 'active' : ''}`}
                        onClick={() => setCalculationType('findNumber')}
                    >
                        {"Find Number" || 'Find Number'}
                    </button>
                </div>

                {calculationType === 'percentage' && (
                    <div className="calculation-section">
                        <h3>{"Basic Percentage" || 'Basic Percentage'}</h3>
                        <div className="input-group">
                            <label>{"What is" || 'What is'} </label>
                            <input
                                type="number"
                                value={values.percentage}
                                onChange={(e) => setValues(prev => ({ ...prev, percentage: e.target.value }))}
                                placeholder="%"
                            />
                            <label> {"of" || 'of'} </label>
                            <input
                                type="number"
                                value={values.number}
                                onChange={(e) => setValues(prev => ({ ...prev, number: e.target.value }))}
                                placeholder={"Number" || 'Number'}
                            />
                            <span>?</span>
                        </div>
                        <button onClick={calculatePercentage} className="calculate-btn">
                            {"Calculate" || 'Calculate'}
                        </button>
                        {values.result && (
                            <div className="result">
                                <strong>{values.percentage}% {"of" || 'of'} {values.number} = {values.result}</strong>
                            </div>
                        )}
                    </div>
                )}

                {calculationType === 'change' && (
                    <div className="calculation-section">
                        <h3>{"Percentage Change" || 'Percentage Change'}</h3>
                        <div className="input-group vertical">
                            <label>{"Original Value" || 'Original Value'}</label>
                            <input
                                type="number"
                                value={values.original}
                                onChange={(e) => setValues(prev => ({ ...prev, original: e.target.value }))}
                                placeholder={"Original Value" || 'Original Value'}
                            />
                            <label>{"Final Value" || 'Final Value'}</label>
                            <input
                                type="number"
                                value={values.final}
                                onChange={(e) => setValues(prev => ({ ...prev, final: e.target.value }))}
                                placeholder={"Final Value" || 'Final Value'}
                            />
                        </div>
                        <button onClick={calculatePercentageChange} className="calculate-btn">
                            {"Calculate" || 'Calculate'}
                        </button>
                        {values.change && (
                            <div className="result">
                                <strong>{"Percentage Change" || 'Percentage Change'}: {values.change}%</strong>
                            </div>
                        )}
                    </div>
                )}

                {calculationType === 'findNumber' && (
                    <div className="calculation-section">
                        <h3>{"Find Number" || 'Find Number'}</h3>
                        <div className="input-group">
                            <label>{values.result} {"is" || 'is'} </label>
                            <input
                                type="number"
                                value={values.percentage}
                                onChange={(e) => setValues(prev => ({ ...prev, percentage: e.target.value }))}
                                placeholder="%"
                            />
                            <label> {"of what number?" || 'of what number?'} </label>
                            <input
                                type="number"
                                value={values.result}
                                onChange={(e) => setValues(prev => ({ ...prev, result: e.target.value }))}
                                placeholder={"Result" || 'Result'}
                            />
                        </div>
                        <button onClick={calculateNumberFromPercentage} className="calculate-btn">
                            {"Calculate" || 'Calculate'}
                        </button>
                        {values.number && (
                            <div className="result">
                                <strong>{values.result} {"is" || 'is'} {values.percentage}% {"of" || 'of'} {values.number}</strong>
                            </div>
                        )}
                    </div>
                )}

                <button onClick={clearAll} className="clear-btn">
                    {"Clear All" || 'Clear All'}
                </button>
            </div>
        </div>
    );
};

export default PercentageCalculator;