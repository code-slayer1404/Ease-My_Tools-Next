"use client";

import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const t = (key: string, fallback?: string) => fallback ?? key;

const PasswordGenerator = () => {
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
        <div className={styles["password-generator"]}>
            <div className={styles["tool-header"]}>
                <h1>{"Password Generator"}</h1>
                <p>{"Generate strong and secure passwords"}</p>
            </div>

            <div className={styles["generator-container"]}>
                <div className={styles["password-display"]}>
                    <div className={styles["password-field"]}>
                        <input
                            type="text"
                            value={password}
                            readOnly
                            className={styles["password-input"]}
                        />
                        <button 
                            onClick={copyPassword}
                            className={`${styles["copy-btn"]} ${copied ? 'copied' : ''}`}
                            disabled={!password}
                        >
                            {copied ? '✓' : "Copy Password"}
                        </button>
                    </div>
                    {copied && (
                        <div className={styles["copied-message"]}>
                            {"Password copied to clipboard!"}
                        </div>
                    )}
                </div>

                <div className={styles["strength-meter"]}>
                    <label>{"Password Strength"}:</label>
                    <div className={styles["strength-bars"]}>
                        {[1, 2, 3, 4, 5].map(level => (
                            <div
                                key={level}
                                className={`${styles["strength-bar"]} ${level <= strength.level ? styles["active"] : ""} ${styles[strength.strength]}`}
                            />
                        ))}
                    </div>
                    <span className={`${styles["strength-text"]} ${styles[strength.strength]}`}>
                        {t(strength.strength)}
                    </span>
                </div>

                <div className={styles["settings-section"]}>
                    <div className={styles["setting-group"]}>
                        <label htmlFor="length">{"Password Length"}: {length}</label>
                        <input
                            id="length"
                            type="range"
                            min="4"
                            max="32"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            className={styles["length-slider"]}
                        />
                    </div>

                    <div className={styles["checkbox-group"]}>
                        <label className={styles["checkbox-label"]}>
                            <input
                                type="checkbox"
                                checked={includeUppercase}
                                onChange={(e) => setIncludeUppercase(e.target.checked)}
                            />
                            {"Include Uppercase Letters (A-Z)"}
                        </label>

                        <label className={styles["checkbox-label"]}>
                            <input
                                type="checkbox"
                                checked={includeLowercase}
                                onChange={(e) => setIncludeLowercase(e.target.checked)}
                            />
                            {"Include Lowercase Letters (a-z)"}
                        </label>

                        <label className={styles["checkbox-label"]}>
                            <input
                                type="checkbox"
                                checked={includeNumbers}
                                onChange={(e) => setIncludeNumbers(e.target.checked)}
                            />
                            {"Include Numbers (0-9)"}
                        </label>

                        <label className={styles["checkbox-label"]}>
                            <input
                                type="checkbox"
                                checked={includeSymbols}
                                onChange={(e) => setIncludeSymbols(e.target.checked)}
                            />
                            {"Include Symbols (!@#$%^&*)"}
                        </label>

                        <label className={styles["checkbox-label"]}>
                            <input
                                type="checkbox"
                                checked={excludeSimilar}
                                onChange={(e) => setExcludeSimilar(e.target.checked)}
                            />
                            {"Exclude Similar Characters (i, l, 1, L, o, 0, O)"}
                        </label>

                        <label className={styles["checkbox-label"]}>
                            <input
                                type="checkbox"
                                checked={excludeAmbiguous}
                                onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                            />
                            {"Exclude Ambiguous Characters ({ } [ ] ( ) / \\ ' \" ` ~ , ; : . < > )"}
                        </label>
                    </div>
                </div>

                <div className={styles["action-buttons"]}>
                    <button onClick={generatePassword} className={styles["primary-btn"]}>
                        {"Regenerate"}
                    </button>
                </div>

                <div className={styles["password-tips"]}>
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