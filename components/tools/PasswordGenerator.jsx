"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/PasswordGenerator.css';

const t = (key, fallback) => fallback ?? key;

const PasswordGenerator = () => {
    const { theme } = useTheme();
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [excludeSimilar, setExcludeSimilar] = useState(false);
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
    const [copied, setCopied] = useState(false);

    const characters = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    const similarChars = 'il1Lo0O';
    const ambiguousChars = '{}[]()/\\\'"`~,;:.<> ';

    const generatePassword = () => {
        let charPool = '';
        
        if (includeUppercase) charPool += characters.uppercase;
        if (includeLowercase) charPool += characters.lowercase;
        if (includeNumbers) charPool += characters.numbers;
        if (includeSymbols) charPool += characters.symbols;

        if (charPool === '') {
            alert('Please select at least one character type');
            return;
        }

        if (excludeSimilar) {
            charPool = charPool.split('').filter(char => !similarChars.includes(char)).join('');
        }

        if (excludeAmbiguous) {
            charPool = charPool.split('').filter(char => !ambiguousChars.includes(char)).join('');
        }

        let generatedPassword = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charPool.length);
            generatedPassword += charPool[randomIndex];
        }

        setPassword(generatedPassword);
        setCopied(false);
    };

    const copyPassword = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const calculateStrength = () => {
        let score = 0;
        if (length >= 8) score++;
        if (length >= 12) score++;
        if (length >= 16) score++;
        if (includeUppercase) score++;
        if (includeLowercase) score++;
        if (includeNumbers) score++;
        if (includeSymbols) score++;
        if (excludeSimilar) score++;
        if (excludeAmbiguous) score++;

        if (score <= 3) return { strength: 'veryWeak', level: 1 };
        if (score <= 5) return { strength: 'weak', level: 2 };
        if (score <= 7) return { strength: 'fair', level: 3 };
        if (score <= 9) return { strength: 'good', level: 4 };
        return { strength: 'strong', level: 5 };
    };

    const strength = calculateStrength();

    useEffect(() => {
        generatePassword();
    }, []);

    return (
        <div className={`password-generator ${theme}`}>
            <div className="tool-header">
                <h1>{"Password Generator"}</h1>
                <p>{"Generate strong and secure passwords"}</p>
            </div>

            <div className="generator-container">
                <div className="password-display">
                    <div className="password-field">
                        <input
                            type="text"
                            value={password}
                            readOnly
                            className="password-input"
                        />
                        <button 
                            onClick={copyPassword}
                            className={`copy-btn ${copied ? 'copied' : ''}`}
                            disabled={!password}
                        >
                            {copied ? '✓' : "Copy Password"}
                        </button>
                    </div>
                    {copied && (
                        <div className="copied-message">
                            {"Password copied to clipboard!"}
                        </div>
                    )}
                </div>

                <div className="strength-meter">
                    <label>{"Password Strength"}:</label>
                    <div className="strength-bars">
                        {[1, 2, 3, 4, 5].map(level => (
                            <div
                                key={level}
                                className={`strength-bar ${level <= strength.level ? 'active' : ''} ${strength.strength}`}
                            />
                        ))}
                    </div>
                    <span className={`strength-text ${strength.strength}`}>
                        {t(strength.strength)}
                    </span>
                </div>

                <div className="settings-section">
                    <div className="setting-group">
                        <label htmlFor="length">{"Password Length"}: {length}</label>
                        <input
                            id="length"
                            type="range"
                            min="4"
                            max="32"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            className="length-slider"
                        />
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={includeUppercase}
                                onChange={(e) => setIncludeUppercase(e.target.checked)}
                            />
                            {"Include Uppercase Letters (A-Z)"}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={includeLowercase}
                                onChange={(e) => setIncludeLowercase(e.target.checked)}
                            />
                            {"Include Lowercase Letters (a-z)"}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={includeNumbers}
                                onChange={(e) => setIncludeNumbers(e.target.checked)}
                            />
                            {"Include Numbers (0-9)"}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={includeSymbols}
                                onChange={(e) => setIncludeSymbols(e.target.checked)}
                            />
                            {"Include Symbols (!@#$%^&*)"}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={excludeSimilar}
                                onChange={(e) => setExcludeSimilar(e.target.checked)}
                            />
                            {"Exclude Similar Characters (i, l, 1, L, o, 0, O)"}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={excludeAmbiguous}
                                onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                            />
                            {"Exclude Ambiguous Characters ({ } [ ] ( ) / \\ ' \" ` ~ , ; : . < > )"}
                        </label>
                    </div>
                </div>

                <div className="action-buttons">
                    <button onClick={generatePassword} className="primary-btn">
                        {"Regenerate"}
                    </button>
                </div>

                <div className="password-tips">
                    <h4>{"Password Security Tips"}</h4>
                    <ul>
                        <li>{"Use at least 12 characters"}</li>
                        <li>{"Include uppercase, lowercase, numbers, and symbols"}</li>
                        <li>{"Avoid common words and patterns"}</li>
                        <li>{"Use unique passwords for different accounts"}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PasswordGenerator;