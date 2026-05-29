"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./styles.module.css";

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  minNumbers: number;
  minSymbols: number;
  minUppercase: number;
  noDuplicate: boolean;
}

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [entropy, setEntropy] = useState<number>(0);

  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
    noDuplicate: false,
  });

  const characters = {
    uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
    lowercase: "abcdefghijkmnopqrstuvwxyz",
    numbers: "23456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  const similarChars = "il1Lo0O";
  const ambiguousChars = "{}[]()/\\'\"`~,;:.<> ";

  // Calculate password entropy
  const calculateEntropy = useCallback(
    (poolSize: number, length: number): number => {
      return Math.log2(Math.pow(poolSize, length));
    },
    []
  );

  // Get character pool size
  const getPoolSize = useMemo(() => {
    let poolSize = 0;
    if (options.uppercase) poolSize += characters.uppercase.length;
    if (options.lowercase) poolSize += characters.lowercase.length;
    if (options.numbers) poolSize += characters.numbers.length;
    if (options.symbols) poolSize += characters.symbols.length;
    return poolSize;
  }, [options]);

  // Generate password with constraints
  const generatePassword = useCallback(() => {
    let charPool = "";

    if (options.uppercase) charPool += characters.uppercase;
    if (options.lowercase) charPool += characters.lowercase;
    if (options.numbers) charPool += characters.numbers;
    if (options.symbols) charPool += characters.symbols;

    if (charPool === "") {
      alert("Please select at least one character type");
      return;
    }

    let workingPool = charPool;

    if (options.excludeSimilar) {
      workingPool = workingPool
        .split("")
        .filter((char) => !similarChars.includes(char))
        .join("");
    }

    if (options.excludeAmbiguous) {
      workingPool = workingPool
        .split("")
        .filter((char) => !ambiguousChars.includes(char))
        .join("");
    }

    let generatedPassword = "";
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      generatedPassword = "";
      for (let i = 0; i < options.length; i++) {
        const randomIndex = Math.floor(Math.random() * workingPool.length);
        generatedPassword += workingPool[randomIndex];
      }

      // Check constraints
      let valid = true;

      if (options.minNumbers > 0 && options.numbers) {
        const numberCount = (generatedPassword.match(/[0-9]/g) || []).length;
        if (numberCount < options.minNumbers) valid = false;
      }

      if (options.minSymbols > 0 && options.symbols) {
        const symbolCount = (generatedPassword.match(/[^a-zA-Z0-9]/g) || [])
          .length;
        if (symbolCount < options.minSymbols) valid = false;
      }

      if (options.minUppercase > 0 && options.uppercase) {
        const uppercaseCount = (generatedPassword.match(/[A-Z]/g) || []).length;
        if (uppercaseCount < options.minUppercase) valid = false;
      }

      if (options.noDuplicate) {
        const uniqueChars = new Set(generatedPassword.split(""));
        if (uniqueChars.size !== generatedPassword.length) valid = false;
      }

      if (valid) break;
      attempts++;
    }

    setPassword(generatedPassword);
    setCopied(false);

    // Calculate entropy
    const poolSize = getPoolSize;
    const entropyValue = calculateEntropy(poolSize, options.length);
    setEntropy(entropyValue);
  }, [options, getPoolSize, calculateEntropy]);

  const copyPassword = useCallback(async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const calculateStrength = useCallback(() => {
    let score = 0;
    if (options.length >= 12) score += 2;
    else if (options.length >= 8) score += 1;

    if (options.uppercase) score += 1;
    if (options.lowercase) score += 1;
    if (options.numbers) score += 1;
    if (options.symbols) score += 2;
    if (options.excludeSimilar) score += 1;
    if (options.excludeAmbiguous) score += 1;
    if (options.minNumbers >= 2) score += 1;
    if (options.minSymbols >= 2) score += 1;

    // Entropy based scoring
    if (entropy >= 80) score += 2;
    else if (entropy >= 60) score += 1;

    if (score <= 4)
      return {
        strength: "very-weak",
        label: "Very Weak",
        level: 1,
        color: "#ef4444",
      };
    if (score <= 6)
      return { strength: "weak", label: "Weak", level: 2, color: "#f59e0b" };
    if (score <= 8)
      return { strength: "fair", label: "Fair", level: 3, color: "#eab308" };
    if (score <= 10)
      return { strength: "good", label: "Good", level: 4, color: "#10b981" };
    return { strength: "strong", label: "Strong", level: 5, color: "#22c55e" };
  }, [options, entropy]);

  const strength = calculateStrength();

  // Auto-generate on mount and when options change
  useEffect(() => {
    generatePassword();
  }, [options, generatePassword]);

  return (
    <div className={styles.container}>
      <div className={styles.twoColumnLayout}>
        {/* Left Column - Generator */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🔐</span>
              <h3>Password Generator</h3>
            </div>

            {/* Password Display */}
            <div className={styles.passwordSection}>
              <div className={styles.passwordWrapper}>
                <input
                  type="text"
                  value={password}
                  readOnly
                  className={styles.passwordInput}
                />
                <button
                  onClick={copyPassword}
                  className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>

              {copied && (
                <div className={styles.copiedMessage}>
                  Password copied to clipboard!
                </div>
              )}
            </div>

            {/* Strength Meter */}
            <div className={styles.strengthSection}>
              <div className={styles.strengthHeader}>
                <span>Password Strength</span>
                <span className={styles.strengthValue}>{strength.label}</span>
              </div>
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`${styles.strengthBar} ${level <= strength.level ? styles.active : ""}`}
                    style={{
                      backgroundColor:
                        level <= strength.level ? strength.color : "#e2e8f0",
                    }}
                  />
                ))}
              </div>
              <div className={styles.entropyInfo}>
                <span>🔒 Entropy: {entropy.toFixed(1)} bits</span>
                <span>
                  📊 Pool size: {getPoolSize.toLocaleString()} characters
                </span>
              </div>
            </div>

            {/* Length Slider */}
            <div className={styles.inputGroup}>
              <div className={styles.sliderHeader}>
                <label>Password Length: {options.length}</label>
                <span className={styles.lengthHint}>
                  {options.length < 8
                    ? "Too short"
                    : options.length < 12
                      ? "Decent"
                      : options.length < 16
                        ? "Strong"
                        : "Very Strong"}
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                value={options.length}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    length: parseInt(e.target.value),
                  }))
                }
                className={styles.slider}
              />
              <div className={styles.sliderMarks}>
                <span>4</span>
                <span>8</span>
                <span>12</span>
                <span>16</span>
                <span>20</span>
                <span>24</span>
                <span>28</span>
                <span>32</span>
              </div>
            </div>

            {/* Character Types */}
            <div className={styles.inputGroup}>
              <label>Character Types</label>
              <div className={styles.checkboxGrid}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        uppercase: e.target.checked,
                      }))
                    }
                  />
                  <span>Uppercase (A-Z)</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        lowercase: e.target.checked,
                      }))
                    }
                  />
                  <span>Lowercase (a-z)</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.numbers}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        numbers: e.target.checked,
                      }))
                    }
                  />
                  <span>Numbers (0-9)</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.symbols}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        symbols: e.target.checked,
                      }))
                    }
                  />
                  <span>Symbols (!@#$%^&*)</span>
                </label>
              </div>
            </div>

            {/* Advanced Options */}
            <details className={styles.advancedSection}>
              <summary>Advanced Options</summary>
              <div className={styles.advancedPanel}>
                <div className={styles.optionRow}>
                  <label>Minimum Numbers</label>
                  <select
                    value={options.minNumbers}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        minNumbers: parseInt(e.target.value),
                      }))
                    }
                    className={styles.select}
                    disabled={!options.numbers}
                  >
                    <option value={0}>No minimum</option>
                    <option value={1}>At least 1</option>
                    <option value={2}>At least 2</option>
                    <option value={3}>At least 3</option>
                  </select>
                </div>

                <div className={styles.optionRow}>
                  <label>Minimum Symbols</label>
                  <select
                    value={options.minSymbols}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        minSymbols: parseInt(e.target.value),
                      }))
                    }
                    className={styles.select}
                    disabled={!options.symbols}
                  >
                    <option value={0}>No minimum</option>
                    <option value={1}>At least 1</option>
                    <option value={2}>At least 2</option>
                    <option value={3}>At least 3</option>
                  </select>
                </div>

                <div className={styles.optionRow}>
                  <label>Minimum Uppercase</label>
                  <select
                    value={options.minUppercase}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        minUppercase: parseInt(e.target.value),
                      }))
                    }
                    className={styles.select}
                    disabled={!options.uppercase}
                  >
                    <option value={0}>No minimum</option>
                    <option value={1}>At least 1</option>
                    <option value={2}>At least 2</option>
                  </select>
                </div>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        excludeSimilar: e.target.checked,
                      }))
                    }
                  />
                  Exclude Similar Characters (i, l, 1, L, o, 0, O)
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        excludeAmbiguous: e.target.checked,
                      }))
                    }
                  />
                  Exclude Ambiguous Characters
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.noDuplicate}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        noDuplicate: e.target.checked,
                      }))
                    }
                  />
                  No Duplicate Characters
                </label>
              </div>
            </details>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button onClick={generatePassword} className={styles.primaryBtn}>
                🔄 Generate New
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Tips & Statistics */}
        <div className={styles.rightColumn}>
          {/* Tips Section */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>💡</span>
              <h3>Security Tips</h3>
            </div>
            <div className={styles.tipsList}>
              <div className={styles.tipItem}>
                <span>🔒</span>
                <div>
                  <strong>Use Long Passwords</strong>
                  <p>Longer passwords are exponentially harder to crack</p>
                </div>
              </div>
              <div className={styles.tipItem}>
                <span>🎲</span>
                <div>
                  <strong>Enable All Character Types</strong>
                  <p>Mix of uppercase, lowercase, numbers, and symbols</p>
                </div>
              </div>
              <div className={styles.tipItem}>
                <span>🔄</span>
                <div>
                  <strong>Use Different Passwords</strong>
                  <p>Never reuse passwords across multiple accounts</p>
                </div>
              </div>
              <div className={styles.tipItem}>
                <span>🛡️</span>
                <div>
                  <strong>Use a Password Manager</strong>
                  <p>Securely store and manage all your passwords</p>
                </div>
              </div>
              <div className={styles.tipItem}>
                <span>⚡</span>
                <div>
                  <strong>Enable 2FA</strong>
                  <p>Add an extra layer of security to your accounts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.statsCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📊</span>
              <h3>Password Statistics</h3>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span>Possible Combinations</span>
                <strong>
                  {Math.pow(getPoolSize, options.length).toExponential(2)}
                </strong>
              </div>
              <div className={styles.statItem}>
                <span>Time to Crack (Brute Force)</span>
                <strong>
                  {entropy >= 60
                    ? "Centuries"
                    : entropy >= 40
                      ? "Years"
                      : entropy >= 30
                        ? "Days"
                        : "Hours"}
                </strong>
              </div>
              <div className={styles.statItem}>
                <span>Character Pool</span>
                <strong>{getPoolSize} characters</strong>
              </div>
              <div className={styles.statItem}>
                <span>Total Entropy</span>
                <strong>{entropy.toFixed(1)} bits</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;