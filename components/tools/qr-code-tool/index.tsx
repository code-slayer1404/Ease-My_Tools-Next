"use client";

import React, { useState, useRef, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import jsQR from "jsqr";
import styles from './styles.module.css';

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
type QRSize = "small" | "medium" | "large" | "xlarge";

const QRCodeTool: React.FC = () => {
    const [inputText, setInputText] = useState<string>("");
    const [decodedText, setDecodedText] = useState<string>("");
    const [fileError, setFileError] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isDecoding, setIsDecoding] = useState<boolean>(false);
    
    // QR Code Settings
    const [qrSize, setQrSize] = useState<QRSize>("medium");
    const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M");
    const [fgColor, setFgColor] = useState<string>("#000000");
    const [bgColor, setBgColor] = useState<string>("#ffffff");
    const [includeMargin, setIncludeMargin] = useState<boolean>(true);
    const [qrImage, setQrImage] = useState<File | null>(null);
    const [qrImagePreview, setQrImagePreview] = useState<string>("");

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const svgRef = useRef<HTMLDivElement | null>(null);

    // Size mapping
    const sizeMap = {
        small: 160,
        medium: 200,
        large: 250,
        xlarge: 300,
    };

    const handleDecode = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileError("");
        setDecodedText("");
        setIsDecoding(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result !== "string") {
                setIsDecoding(false);
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) {
                    setIsDecoding(false);
                    return;
                }
                
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    setIsDecoding(false);
                    return;
                }
                
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);
                
                if (code) {
                    setDecodedText(code.data);
                } else {
                    setFileError("No QR code found in the image. Please try another image.");
                }
                setIsDecoding(false);
            };
            
            img.onerror = () => {
                setFileError("Failed to load image. Please check the file.");
                setIsDecoding(false);
            };
            
            img.src = result;
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDownload = useCallback(() => {
        if (!inputText || !svgRef.current) return;

        const svg = svgRef.current.querySelector("svg");
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-code-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [inputText]);

    const handleClear = useCallback(() => {
        setInputText("");
        setDecodedText("");
        setFileError("");
        setQrImage(null);
        setQrImagePreview("");
    }, []);

    const handleSampleData = useCallback(() => {
        setInputText("https://github.com/yourusername\n\nQR Code Generator Tool\n- Create custom QR codes\n- Decode existing QR codes\n- Download as SVG");
    }, []);

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setQrImage(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setQrImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const getSizeLabel = (size: QRSize): string => {
        const labels = {
            small: "Small (160px)",
            medium: "Medium (200px)",
            large: "Large (250px)",
            xlarge: "Extra Large (300px)",
        };
        return labels[size];
    };

    return (
        <div className={styles.container}>
            <div className={styles.twoColumnLayout}>
                {/* Left Column - QR Code Generator */}
                <div className={styles.generatorCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>✨</span>
                        <h3>Generate QR Code</h3>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Text or URL</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Enter text, URL, or any data you want to encode..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Advanced Settings */}
                    <details className={styles.advancedSection}>
                        <summary>Advanced Settings</summary>
                        <div className={styles.settingsGrid}>
                            <div className={styles.settingGroup}>
                                <label>QR Size</label>
                                <select 
                                    value={qrSize} 
                                    onChange={(e) => setQrSize(e.target.value as QRSize)}
                                    className={styles.select}
                                >
                                    <option value="small">Small (160px)</option>
                                    <option value="medium">Medium (200px)</option>
                                    <option value="large">Large (250px)</option>
                                    <option value="xlarge">Extra Large (300px)</option>
                                </select>
                            </div>

                            <div className={styles.settingGroup}>
                                <label>Error Correction</label>
                                <select 
                                    value={errorLevel} 
                                    onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                                    className={styles.select}
                                >
                                    <option value="L">Low (7%)</option>
                                    <option value="M">Medium (15%)</option>
                                    <option value="Q">Quartile (25%)</option>
                                    <option value="H">High (30%)</option>
                                </select>
                            </div>

                            <div className={styles.settingGroup}>
                                <label>Foreground Color</label>
                                <input 
                                    type="color" 
                                    value={fgColor} 
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                            </div>

                            <div className={styles.settingGroup}>
                                <label>Background Color</label>
                                <input 
                                    type="color" 
                                    value={bgColor} 
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                            </div>

                            <div className={styles.settingGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input 
                                        type="checkbox" 
                                        checked={includeMargin} 
                                        onChange={(e) => setIncludeMargin(e.target.checked)}
                                    />
                                    Include Margin
                                </label>
                            </div>
                        </div>
                    </details>

                    {inputText && (
                        <div className={styles.qrPreviewSection}>
                            <div className={styles.qrPreview} ref={svgRef}>
                                <QRCodeSVG 
                                    value={inputText} 
                                    size={sizeMap[qrSize]}
                                    level={errorLevel}
                                    fgColor={fgColor}
                                    bgColor={bgColor}
                                    includeMargin={includeMargin}
                                />
                            </div>
                            <div className={styles.buttonGroup}>
                                <button className={styles.downloadBtn} onClick={handleDownload}>
                                    💾 Download QR Code (SVG)
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={styles.actionButtons}>
                        <button className={styles.secondaryBtn} onClick={handleSampleData}>
                            📋 Load Sample
                        </button>
                        <button className={styles.secondaryBtn} onClick={handleClear}>
                            🗑️ Clear All
                        </button>
                    </div>
                </div>

                {/* Right Column - QR Code Decoder */}
                <div className={styles.decoderCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>📷</span>
                        <h3>Decode QR Code</h3>
                    </div>

                    <div className={styles.uploadArea}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleDecode}
                            className={styles.fileInput}
                            id="qr-upload"
                        />
                        <label htmlFor="qr-upload" className={styles.uploadLabel}>
                            <span className={styles.uploadIcon}>📤</span>
                            <span>Upload QR Code Image</span>
                            <small>PNG, JPG, JPEG, WebP, GIF, BMP</small>
                        </label>
                    </div>

                    {isDecoding && (
                        <div className={styles.loadingState}>
                            <span className={styles.spinner}></span>
                            <p>Decoding QR Code...</p>
                        </div>
                    )}

                    {fileError && (
                        <div className={styles.errorMessage}>
                            <span>⚠️</span>
                            <p>{fileError}</p>
                        </div>
                    )}

                    {decodedText && (
                        <div className={styles.resultCard}>
                            <div className={styles.resultHeader}>
                                <span>✅</span>
                                <strong>Decoded Successfully!</strong>
                            </div>
                            <div className={styles.decodedText}>
                                <label>Decoded Content:</label>
                                <div className={styles.textContent}>
                                    {decodedText}
                                </div>
                            </div>
                            <button 
                                className={styles.copyBtn}
                                onClick={() => {
                                    navigator.clipboard.writeText(decodedText);
                                    alert("Text copied to clipboard!");
                                }}
                            >
                                📋 Copy to Clipboard
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tips Section */}
            <div className={styles.tipsSection}>
                <h4>💡 QR Code Tips</h4>
                <div className={styles.tipsGrid}>
                    <div className={styles.tipCard}>
                        <span>🎯</span>
                        <div>
                            <strong>Error Correction</strong>
                            <p>Higher levels make QR codes more readable even when damaged</p>
                        </div>
                    </div>
                    <div className={styles.tipCard}>
                        <span>🎨</span>
                        <div>
                            <strong>Custom Colors</strong>
                            <p>Ensure good contrast between foreground and background</p>
                        </div>
                    </div>
                    <div className={styles.tipCard}>
                        <span>📏</span>
                        <div>
                            <strong>Size Matters</strong>
                            <p>Larger QR codes are easier to scan from a distance</p>
                        </div>
                    </div>
                    <div className={styles.tipCard}>
                        <span>🔍</span>
                        <div>
                            <strong>Clear Images</strong>
                            <p>For decoding, use clear, well-lit images for best results</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden canvas for decoding */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
};

export default QRCodeTool;