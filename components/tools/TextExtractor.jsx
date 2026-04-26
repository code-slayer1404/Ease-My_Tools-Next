"use client";

import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/TextExtractor.css';

const TextExtractor = () => {
    const { theme } = useTheme();
    const [extractedText, setExtractedText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert("Please select an image file" || 'Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target.result);
            // Simulate OCR processing
            simulateOCRProcessing();
        };
        reader.readAsDataURL(file);
    };

    const simulateOCRProcessing = () => {
        setIsProcessing(true);
        setExtractedText('');

        // Simulate processing delay
        setTimeout(() => {
            // This is a simulation - in a real app, you'd use an OCR API
            const simulatedText = `Simulated extracted text from image:

This is a demonstration of text extraction.
In a real application, this would use OCR technology
to extract actual text from your uploaded image.

Sample extracted content:
- Line 1: Example text
- Line 2: More example content
- Line 3: Additional text lines

Note: This is a simulation. For real OCR functionality,
you would need to integrate with an OCR service like:
• Google Cloud Vision API
• Amazon Textract
• Tesseract.js (client-side)`;

            setExtractedText(simulatedText);
            setIsProcessing(false);
        }, 2000);
    };

    const handlePaste = async (event) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setUploadedImage(e.target.result);
                        simulateOCRProcessing();
                    };
                    reader.readAsDataURL(file);
                }
                break;
            }
        }
    };

    const clearAll = () => {
        setUploadedImage(null);
        setExtractedText('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(extractedText);
        alert("Text copied to clipboard!" || 'Text copied to clipboard!');
    };

    const downloadText = () => {
        const blob = new Blob([extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'extracted-text.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={`text-extractor ${theme}`} onPaste={handlePaste}>
            <div className="extractor-header">
                <h1>{"Text Extractor" || 'Text Extractor'}</h1>
                <p>{"Extract text from images (OCR simulation)" || 'Extract text from images (OCR simulation)'}</p>
            </div>

            <div className="extractor-container">
                <div className="upload-section">
                    <div className="upload-area">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="file-input"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="upload-label">
                            <div className="upload-icon">📁</div>
                            <div className="upload-text">
                                {"Click to upload image" || 'Click to upload image'}
                            </div>
                            <div className="upload-hint">
                                {"or paste image from clipboard" || 'or paste image from clipboard'}
                            </div>
                            <div className="supported-formats">
                                {"Supported formats: JPG, PNG, GIF, BMP" || 'Supported formats: JPG, PNG, GIF, BMP'}
                            </div>
                        </label>
                    </div>

                    {uploadedImage && (
                        <div className="image-preview">
                            <h4>{"Image Preview" || 'Image Preview'}</h4>
                            <img src={uploadedImage} alt="Uploaded preview" />
                        </div>
                    )}
                </div>

                {isProcessing && (
                    <div className="processing-indicator">
                        <div className="spinner"></div>
                        <p>{"Processing image..." || 'Processing image...'}</p>
                    </div>
                )}

                {extractedText && (
                    <div className="result-section">
                        <h3>{"Extracted Text" || 'Extracted Text'}</h3>
                        <div className="text-output">
                            <pre>{extractedText}</pre>
                        </div>
                        <div className="result-actions">
                            <button onClick={copyToClipboard} className="copy-btn">
                                {"Copy Text" || 'Copy Text'}
                            </button>
                            <button onClick={downloadText} className="download-btn">
                                {"Download Text" || 'Download Text'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="action-buttons">
                    <button onClick={clearAll} className="clear-btn">
                        {"Clear All" || 'Clear All'}
                    </button>
                </div>

                <div className="info-section">
                    <h4>{"About OCR Technology" || 'About OCR Technology'}</h4>
                    <p>{"OCR (Optical Character Recognition) technology converts different types of documents, such as scanned paper documents, PDF files or images captured by a digital camera into editable and searchable data." || 'OCR (Optical Character Recognition) technology converts different types of documents, such as scanned paper documents, PDF files or images captured by a digital camera into editable and searchable data.'}</p>
                    
                    <h5>{"Common Uses:" || 'Common Uses:'}</h5>
                    <ul>
                        <li>{"Digitizing printed documents" || 'Digitizing printed documents'}</li>
                        <li>{"Automating data entry from forms" || 'Automating data entry from forms'}</li>
                        <li>{"Extracting text from screenshots" || 'Extracting text from screenshots'}</li>
                        <li>{"Processing business cards" || 'Processing business cards'}</li>
                    </ul>

                    <div className="limitations">
                        <h5>{"Limitations:" || 'Limitations:'}</h5>
                        <p>{"Note: This is a simulation. For production use, consider:" || 'Note: This is a simulation. For production use, consider:'}</p>
                        <ul>
                            <li>{"Google Cloud Vision API" || 'Google Cloud Vision API'}</li>
                            <li>{"Amazon Textract" || 'Amazon Textract'}</li>
                            <li>{"Tesseract.js (open source)" || 'Tesseract.js (open source)'}</li>
                            <li>{"Microsoft Azure Computer Vision" || 'Microsoft Azure Computer Vision'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextExtractor;