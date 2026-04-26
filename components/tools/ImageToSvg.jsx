"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/ImageToSvg.css';

const ImageToSvg = () => {
    const { theme } = useTheme();
    const [file, setFile] = useState(null);
    const [originalImage, setOriginalImage] = useState('');
    const [svgOutput, setSvgOutput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [conversionSettings, setConversionSettings] = useState({
        mode: 'posterized',
        colors: 8,
        threshold: 128,
        simplify: 1.0,
        smooth: 0.5,
        accuracy: 'medium',
        optimize: true,
        removeSmallShapes: true,
        minShapeSize: 5,
        roundCoordinates: true,
        decimalPlaces: 2
    });
    
    const fileInputRef = useRef();
    const canvasRef = useRef();
    const previewCanvasRef = useRef();
    const originalDimensions = useRef({ width: 0, height: 0 });

    const handleFileUpload = useCallback((uploadedFile) => {
        if (!uploadedFile) return;

        if (uploadedFile.size > 10 * 1024 * 1024) {
            alert("File is too large. Maximum size is 10MB");
            return;
        }

        if (!uploadedFile.type.startsWith('image/')) {
            alert("Please upload a valid image file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            setFile(uploadedFile);
            setOriginalImage(imageUrl);
            setSvgOutput('');
            
            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                originalDimensions.current = {
                    width: img.width,
                    height: img.height
                };
            };
            img.src = imageUrl;
        };
        reader.readAsDataURL(uploadedFile);
    }, [t]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const uploadedFile = e.dataTransfer.files[0];
        handleFileUpload(uploadedFile);
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    // Simple color quantization function
    const quantize = (imageData, maxColors) => {
        const pixels = [];
        const colorMap = new Map();
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            
            const color = `rgba(${r},${g},${b},${a})`;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
            pixels.push({ r, g, b, a });
        }
        
        // Simple k-means like quantization (simplified)
        const colors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxColors)
            .map(entry => {
                const [color] = entry;
                const match = color.match(/rgba\((\d+),(\d+),(\d+),(\d+)\)/);
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3]),
                    a: parseInt(match[4])
                };
            });
        
        return { pixels, colors };
    };

    // Convert image to SVG using canvas and manual tracing
    const convertToSvg = async () => {
        if (!originalImage) {
            alert("Please select a file first");
            return;
        }

        setProcessing(true);

        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Set canvas dimensions to image dimensions
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image on canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Get image data for processing
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Generate SVG based on settings
                let svgContent = '';
                
                switch (conversionSettings.mode) {
                    case 'blackWhite':
                        svgContent = generateBlackWhiteSVG(imageData);
                        break;
                    case 'grayscale':
                        svgContent = generateGrayscaleSVG(imageData);
                        break;
                    case 'posterized':
                    default:
                        svgContent = generatePosterizedSVG(imageData);
                        break;
                }

                setSvgOutput(svgContent);
                setProcessing(false);
            };

            img.onerror = () => {
                setProcessing(false);
                alert("Conversion failed");
            };

            img.src = originalImage;

        } catch (error) {
            console.error('Conversion error:', error);
            setProcessing(false);
            alert("Conversion failed");
        }
    };

    const generateBlackWhiteSVG = (imageData) => {
        const { width, height } = imageData;
        const threshold = conversionSettings.threshold;
        let paths = [];
        
        // Simple edge detection and path generation
        for (let y = 0; y < height; y += 2) {
            for (let x = 0; x < width; x += 2) {
                const index = (y * width + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                
                // Convert to grayscale
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                
                if (brightness < threshold) {
                    const size = conversionSettings.simplify;
                    paths.push(
                        `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="black"/>`
                    );
                }
            }
        }
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${paths.join('\n  ')}
</svg>`;
    };

    const generateGrayscaleSVG = (imageData) => {
        const { width, height } = imageData;
        const step = Math.max(1, Math.floor(conversionSettings.simplify));
        let paths = [];
        
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const a = imageData.data[index + 3] / 255;
                
                if (a > 0.1) { // Only add visible pixels
                    const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                    const color = `rgb(${brightness},${brightness},${brightness})`;
                    
                    paths.push(
                        `<rect x="${x}" y="${y}" width="${step}" height="${step}" fill="${color}" opacity="${a}"/>`
                    );
                }
            }
        }
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${paths.join('\n  ')}
</svg>`;
    };

    const generatePosterizedSVG = (imageData) => {
        const { width, height } = imageData;
        const step = Math.max(1, Math.floor(conversionSettings.simplify));
        const maxColors = conversionSettings.colors;
        
        // Simple color quantization
        const colorMap = new Map();
        
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                const r = Math.round(imageData.data[index] / 32) * 32;
                const g = Math.round(imageData.data[index + 1] / 32) * 32;
                const b = Math.round(imageData.data[index + 2] / 32) * 32;
                const a = imageData.data[index + 3];
                
                if (a > 10) { // Only add visible pixels
                    const color = `rgb(${r},${g},${b})`;
                    const key = `${r},${g},${b}`;
                    
                    if (!colorMap.has(key)) {
                        colorMap.set(key, []);
                    }
                    colorMap.get(key).push({ x, y });
                }
            }
        }
        
        // Take most frequent colors up to maxColors
        const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, maxColors);
        
        let paths = [];
        
        sortedColors.forEach(([colorKey, points]) => {
            const [r, g, b] = colorKey.split(',').map(Number);
            const color = `rgb(${r},${g},${b})`;
            
            // Group nearby points for optimization
            points.forEach(point => {
                paths.push(
                    `<rect x="${point.x}" y="${point.y}" width="${step}" height="${step}" fill="${color}"/>`
                );
            });
        });
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${paths.join('\n  ')}
</svg>`;
    };

    const downloadSvg = () => {
        if (!svgOutput) return;

        const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `converted-${Date.now()}.svg`;
        
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const copySvgCode = async () => {
        if (!svgOutput) return;

        try {
            await navigator.clipboard.writeText(svgOutput);
            alert('SVG code copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = svgOutput;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('SVG code copied to clipboard!');
        }
    };

    const clearAll = () => {
        setFile(null);
        setOriginalImage('');
        setSvgOutput('');
        setConversionSettings({
            mode: 'posterized',
            colors: 8,
            threshold: 128,
            simplify: 1.0,
            smooth: 0.5,
            accuracy: 'medium',
            optimize: true,
            removeSmallShapes: true,
            minShapeSize: 5,
            roundCoordinates: true,
            decimalPlaces: 2
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getAccuracySettings = (accuracy) => {
        switch (accuracy) {
            case 'low':
                return { simplify: 4.0, colors: 4 };
            case 'medium':
                return { simplify: 2.0, colors: 8 };
            case 'high':
                return { simplify: 1.0, colors: 16 };
            case 'veryHigh':
                return { simplify: 0.5, colors: 32 };
            default:
                return { simplify: 2.0, colors: 8 };
        }
    };

    const handleAccuracyChange = (newAccuracy) => {
        const settings = getAccuracySettings(newAccuracy);
        setConversionSettings(prev => ({
            ...prev,
            accuracy: newAccuracy,
            simplify: settings.simplify,
            colors: settings.colors
        }));
    };

    return (
        <div className={`image-to-svg ${theme}`}>
            <div className="tool-header">
                <h1>{"Image to SVG Converter"}</h1>
                <p>{"Convert raster images (PNG, JPG, WebP) to scalable SVG format"}</p>
            </div>

            <div className="converter-container">
                {/* Upload Section */}
                <div className="upload-section">
                    <div 
                        className="upload-area"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="upload-content">
                            <div className="upload-icon">🖼️</div>
                            <h3>{"Upload Image File"}</h3>
                            <p>{"Drag & drop your image here or click to browse"}</p>
                            <small>{"Supported formats: PNG, JPG, JPEG, WebP, GIF"}</small>
                            <small>{"Max file size: 10MB"}</small>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {file && (
                        <div className="file-info">
                            <strong>Selected file:</strong> {file.name}
                            <br />
                            <small>
                                {"File size"}: {(file.size / 1024).toFixed(2)} KB
                                {originalDimensions.current.width > 0 && (
                                    <> | {"Dimensions"}: {originalDimensions.current.width} × {originalDimensions.current.height}</>
                                )}
                            </small>
                        </div>
                    )}
                </div>

                {/* Conversion Settings */}
                {file && (
                    <div className="settings-section">
                        <h3>{"Conversion Mode"}</h3>
                        
                        <div className="settings-grid">
                            <div className="setting-group">
                                <label>{"Trace Method"}</label>
                                <select
                                    value={conversionSettings.mode}
                                    onChange={(e) => setConversionSettings(prev => ({
                                        ...prev,
                                        mode: e.target.value
                                    }))}
                                >
                                    <option value="posterized">{"Full Color"}</option>
                                    <option value="grayscale">{"Grayscale"}</option>
                                    <option value="blackWhite">{"Black & White"}</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>{"Accuracy"}</label>
                                <select
                                    value={conversionSettings.accuracy}
                                    onChange={(e) => handleAccuracyChange(e.target.value)}
                                >
                                    <option value="low">{"Low"}</option>
                                    <option value="medium">{"Medium"}</option>
                                    <option value="high">{"High"}</option>
                                    <option value="veryHigh">{"Very High"}</option>
                                </select>
                            </div>

                            {conversionSettings.mode === 'posterized' && (
                                <div className="setting-group">
                                    <label>{"Max Colors"}: {conversionSettings.colors}</label>
                                    <input
                                        type="range"
                                        min="2"
                                        max="32"
                                        value={conversionSettings.colors}
                                        onChange={(e) => setConversionSettings(prev => ({
                                            ...prev,
                                            colors: parseInt(e.target.value)
                                        }))}
                                    />
                                </div>
                            )}

                            {conversionSettings.mode === 'blackWhite' && (
                                <div className="setting-group">
                                    <label>{"Threshold"}: {conversionSettings.threshold}</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="255"
                                        value={conversionSettings.threshold}
                                        onChange={(e) => setConversionSettings(prev => ({
                                            ...prev,
                                            threshold: parseInt(e.target.value)
                                        }))}
                                    />
                                </div>
                            )}

                            <div className="setting-group">
                                <label>{"Simplify"}: {conversionSettings.simplify}</label>
                                <input
                                    type="range"
                                        min="0.5"
                                        max="8"
                                        step="0.5"
                                        value={conversionSettings.simplify}
                                        onChange={(e) => setConversionSettings(prev => ({
                                            ...prev,
                                            simplify: parseFloat(e.target.value)
                                        }))}
                                />
                            </div>
                        </div>

                        {/* Advanced Options */}
                        <details className="advanced-options">
                            <summary>{"Advanced Options"}</summary>
                            <div className="advanced-grid">
                                <div className="setting-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={conversionSettings.optimize}
                                            onChange={(e) => setConversionSettings(prev => ({
                                                ...prev,
                                                optimize: e.target.checked
                                            }))}
                                        />
                                        {"Optimize SVG"}
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={conversionSettings.removeSmallShapes}
                                            onChange={(e) => setConversionSettings(prev => ({
                                                ...prev,
                                                removeSmallShapes: e.target.checked
                                            }))}
                                        />
                                        {"Remove small shapes"}
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={conversionSettings.roundCoordinates}
                                            onChange={(e) => setConversionSettings(prev => ({
                                                ...prev,
                                                roundCoordinates: e.target.checked
                                            }))}
                                        />
                                        {"Round coordinates"}
                                    </label>
                                </div>
                            </div>
                        </details>
                    </div>
                )}

                {/* Action Buttons */}
                {file && (
                    <div className="action-buttons">
                        <button 
                            onClick={convertToSvg} 
                            className="primary-btn"
                            disabled={processing}
                        >
                            {processing ? "Processing image..." : "Convert to SVG"}
                        </button>
                        <button onClick={clearAll} className="secondary-btn">
                            {"Clear"}
                        </button>
                    </div>
                )}

                {/* Preview Section */}
                {(originalImage || svgOutput) && (
                    <div className="preview-section">
                        <div className="preview-container">
                            {originalImage && (
                                <div className="preview-item">
                                    <h4>{"Original Image"}</h4>
                                    <img 
                                        src={originalImage} 
                                        alt="Original" 
                                        className="preview-image"
                                    />
                                </div>
                            )}
                            {svgOutput && (
                                <div className="preview-item">
                                    <h4>{"SVG Output"}</h4>
                                    <div 
                                        className="preview-svg"
                                        dangerouslySetInnerHTML={{ __html: svgOutput }}
                                    />
                                    <div className="svg-actions">
                                        <button onClick={downloadSvg} className="download-btn">
                                            {"Download SVG"}
                                        </button>
                                        <button onClick={copySvgCode} className="copy-btn">
                                            {"Copy SVG Code"}
                                        </button>
                                    </div>
                                    {svgOutput.length > 0 && (
                                        <div className="file-info">
                                            <small>{"SVG Size"}: {(svgOutput.length / 1024).toFixed(2)} KB</small>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SVG Code Preview */}
                        {svgOutput && (
                            <div className="code-section">
                                <h4>{"SVG Code"}</h4>
                                <pre className="svg-code">
                                    {svgOutput}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default ImageToSvg;