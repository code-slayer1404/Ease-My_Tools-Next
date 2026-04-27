"use client";

import React, { useState } from 'react';
import styles from './styles.module.css';

const t = (key: string, fallback?: string) => fallback ?? key;

const ColorPicker = () => { // <-- i18next
    const [selectedColor, setSelectedColor] = useState('#667eea');
    const [colorHistory, setColorHistory] = useState([]);

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setSelectedColor(newColor);

        setColorHistory(prev => {
            const filtered = prev.filter(color => color !== newColor);
            return [newColor, ...filtered].slice(0, 8);
        });
    };

    const getColorValues = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;

        if (max === min) h = s = 0;
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: h = (bNorm - rNorm) / d + 2; break;
                case bNorm: h = (rNorm - gNorm) / d + 4; break;
            }
            h /= 6;
        }

        return {
            hex: hex.toUpperCase(),
            rgb: `rgb(${r}, ${g}, ${b})`,
            hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
        };
    };

    const colorValues = getColorValues(selectedColor);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(t('copied', `Copied: ${text}`));
    };

    return (
        <div className={styles["color-picker"]}>
            <div className={styles["picker-header"]}>
                <h1>{"Color Picker"}</h1>
                <p>{"Pick colors and get their values in different formats"}</p>
            </div>

            <div className={styles["picker-container"]}>
                <div className={styles["color-display-section"]}>
                    <div className={styles["color-display"]} style={{ backgroundColor: selectedColor }}>
                        <span className={styles["color-text"]}>{selectedColor.toUpperCase()}</span>
                    </div>

                    <div className={styles["color-input"]}>
                        <label>{"Select Color"}</label>
                        <input
                            type="color"
                            value={selectedColor}
                            onChange={handleColorChange}
                            className={styles["color-input-field"]}
                        />
                        <input
                            type="text"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className={styles["color-hex-input"]}
                            placeholder="#000000"
                        />
                    </div>
                </div>

                <div className={styles["color-values"]}>
                    <h3>{"Color Values"}</h3>
                    <div className={styles["value-cards"]}>
                        <div className={styles["value-card"]} onClick={() => copyToClipboard(colorValues.hex)}>
                            <div className={styles["value-type"]}>HEX</div>
                            <div className={styles["value"]}>{colorValues.hex}</div>
                            <div className={styles["copy-hint"]}>{"Click to copy"}</div>
                        </div>
                        <div className={styles["value-card"]} onClick={() => copyToClipboard(colorValues.rgb)}>
                            <div className={styles["value-type"]}>RGB</div>
                            <div className={styles["value"]}>{colorValues.rgb}</div>
                            <div className={styles["copy-hint"]}>{"Click to copy"}</div>
                        </div>
                        <div className={styles["value-card"]} onClick={() => copyToClipboard(colorValues.hsl)}>
                            <div className={styles["value-type"]}>HSL</div>
                            <div className={styles["value"]}>{colorValues.hsl}</div>
                            <div className={styles["copy-hint"]}>{"Click to copy"}</div>
                        </div>
                    </div>
                </div>

                {colorHistory.length > 0 && (
                    <div className={styles["color-history"]}>
                        <h3>{"Recent Colors"}</h3>
                        <div className={styles["history-grid"]}>
                            {colorHistory.map((color, index) => (
                                <div
                                    key={index}
                                    className={styles["history-color"]}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColorPicker;
