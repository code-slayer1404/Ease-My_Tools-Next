"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/TimeCalculator.css';

const TimeCalculator = () => {
    const { theme } = useTheme();
    const [calculationType, setCalculationType] = useState('add');
    const [time1, setTime1] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [time2, setTime2] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [result, setResult] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateResult, setDateResult] = useState(null);

    const calculateTime = () => {
        const totalSeconds1 = time1.hours * 3600 + time1.minutes * 60 + time1.seconds;
        const totalSeconds2 = time2.hours * 3600 + time2.minutes * 60 + time2.seconds;

        let resultSeconds;
        if (calculationType === 'add') {
            resultSeconds = totalSeconds1 + totalSeconds2;
        } else {
            resultSeconds = totalSeconds1 - totalSeconds2;
            if (resultSeconds < 0) resultSeconds = 0;
        }

        const hours = Math.floor(resultSeconds / 3600);
        const minutes = Math.floor((resultSeconds % 3600) / 60);
        const seconds = resultSeconds % 60;

        setResult({ hours, minutes, seconds, totalSeconds: resultSeconds });
    };

    const calculateDateDifference = () => {
        if (!startDate || !endDate) {
            alert("Please select both dates" || 'Please select both dates');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start > end) {
            alert("Start date must be before end date" || 'Start date must be before end date');
            return;
        }

        const diffTime = Math.abs(end - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);

        setDateResult({
            days: diffDays,
            hours: diffHours,
            minutes: diffMinutes,
            seconds: diffSeconds,
            totalDays: diffTime / (1000 * 60 * 60 * 24),
            totalHours: diffTime / (1000 * 60 * 60),
            totalMinutes: diffTime / (1000 * 60),
            totalSeconds: diffTime / 1000
        });
    };

    const clearAll = () => {
        setTime1({ hours: 0, minutes: 0, seconds: 0 });
        setTime2({ hours: 0, minutes: 0, seconds: 0 });
        setResult(null);
        setStartDate('');
        setEndDate('');
        setDateResult(null);
    };

    const formatTime = (time) => {
        return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`time-calculator ${theme}`}>
            <div className="calculator-header">
                <h1>{"Time Calculator" || 'Time Calculator'}</h1>
                <p>{"Add, subtract time and calculate date differences" || 'Add, subtract time and calculate date differences'}</p>
            </div>

            <div className="calculator-container">
                <div className="calculation-types">
                    <button 
                        className={`type-btn ${calculationType === 'add' ? 'active' : ''}`}
                        onClick={() => setCalculationType('add')}
                    >
                        {"Add/Subtract Time" || 'Add/Subtract Time'}
                    </button>
                    <button 
                        className={`type-btn ${calculationType === 'date' ? 'active' : ''}`}
                        onClick={() => setCalculationType('date')}
                    >
                        {"Date Difference" || 'Date Difference'}
                    </button>
                </div>

                {calculationType === 'add' && (
                    <div className="time-section">
                        <h3>{"Add/Subtract Time" || 'Add/Subtract Time'}</h3>
                        
                        <div className="time-inputs">
                            <div className="time-group">
                                <label>{"Time 1" || 'Time 1'}</label>
                                <div className="time-controls">
                                    <input
                                        type="number"
                                        value={time1.hours}
                                        onChange={(e) => setTime1(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                                        min="0"
                                        placeholder="HH"
                                    />
                                    <span>:</span>
                                    <input
                                        type="number"
                                        value={time1.minutes}
                                        onChange={(e) => setTime1(prev => ({ ...prev, minutes: Math.min(59, parseInt(e.target.value) || 0) }))}
                                        min="0"
                                        max="59"
                                        placeholder="MM"
                                    />
                                    <span>:</span>
                                    <input
                                        type="number"
                                        value={time1.seconds}
                                        onChange={(e) => setTime1(prev => ({ ...prev, seconds: Math.min(59, parseInt(e.target.value) || 0) }))}
                                        min="0"
                                        max="59"
                                        placeholder="SS"
                                    />
                                </div>
                            </div>

                            <div className="operation-selector">
                                <button 
                                    className={`op-btn ${calculationType === 'add' ? 'active' : ''}`}
                                    onClick={() => setCalculationType('add')}
                                >
                                    +
                                </button>
                                <button 
                                    className={`op-btn ${calculationType === 'subtract' ? 'active' : ''}`}
                                    onClick={() => setCalculationType('subtract')}
                                >
                                    -
                                </button>
                            </div>

                            <div className="time-group">
                                <label>{"Time 2" || 'Time 2'}</label>
                                <div className="time-controls">
                                    <input
                                        type="number"
                                        value={time2.hours}
                                        onChange={(e) => setTime2(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                                        min="0"
                                        placeholder="HH"
                                    />
                                    <span>:</span>
                                    <input
                                        type="number"
                                        value={time2.minutes}
                                        onChange={(e) => setTime2(prev => ({ ...prev, minutes: Math.min(59, parseInt(e.target.value) || 0) }))}
                                        min="0"
                                        max="59"
                                        placeholder="MM"
                                    />
                                    <span>:</span>
                                    <input
                                        type="number"
                                        value={time2.seconds}
                                        onChange={(e) => setTime2(prev => ({ ...prev, seconds: Math.min(59, parseInt(e.target.value) || 0) }))}
                                        min="0"
                                        max="59"
                                        placeholder="SS"
                                    />
                                </div>
                            </div>
                        </div>

                        <button onClick={calculateTime} className="calculate-btn">
                            {"Calculate" || 'Calculate'}
                        </button>

                        {result && (
                            <div className="result-section">
                                <h4>{"Result" || 'Result'}</h4>
                                <div className="result-display">
                                    <div className="result-time">{formatTime(result)}</div>
                                    <div className="result-breakdown">
                                        <div>{result.hours} {"hours" || 'hours'}</div>
                                        <div>{result.minutes} {"minutes" || 'minutes'}</div>
                                        <div>{result.seconds} {"seconds" || 'seconds'}</div>
                                        <div>{result.totalSeconds} {"Total Seconds" || 'total seconds'}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {calculationType === 'date' && (
                    <div className="date-section">
                        <h3>{"Date Difference" || 'Date Difference'}</h3>
                        
                        <div className="date-inputs">
                            <div className="date-group">
                                <label>{"Start Date" || 'Start Date'}</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="date-input"
                                />
                            </div>
                            <div className="date-group">
                                <label>{"End Date" || 'End Date'}</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="date-input"
                                />
                            </div>
                        </div>

                        <button onClick={calculateDateDifference} className="calculate-btn">
                            {"Calculate Difference" || 'Calculate Difference'}
                        </button>

                        {dateResult && (
                            <div className="result-section">
                                <h4>{"Difference" || 'Difference'}</h4>
                                <div className="date-result">
                                    <div className="result-grid">
                                        <div className="result-item">
                                            <span className="value">{dateResult.days}</span>
                                            <span className="label">{"Days" || 'Days'}</span>
                                        </div>
                                        <div className="result-item">
                                            <span className="value">{dateResult.hours}</span>
                                            <span className="label">{"hours" || 'Hours'}</span>
                                        </div>
                                        <div className="result-item">
                                            <span className="value">{dateResult.minutes}</span>
                                            <span className="label">{"minutes" || 'Minutes'}</span>
                                        </div>
                                        <div className="result-item">
                                            <span className="value">{dateResult.seconds}</span>
                                            <span className="label">{"seconds" || 'Seconds'}</span>
                                        </div>
                                    </div>
                                    <div className="total-breakdown">
                                        <div>{"Total Days" || 'Total Days'}: {dateResult.totalDays.toFixed(2)}</div>
                                        <div>{"Total Hours" || 'Total Hours'}: {dateResult.totalHours.toFixed(2)}</div>
                                        <div>{"Total Minutes" || 'Total Minutes'}: {dateResult.totalMinutes.toFixed(2)}</div>
                                        <div>{"Total Seconds" || 'Total Seconds'}: {dateResult.totalSeconds.toFixed(2)}</div>
                                    </div>
                                </div>
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

export default TimeCalculator;