"use client";

import React, { useState, useRef } from 'react';
import styles from './styles.module.css';

const TextExtractor = () => {
    const [extractedText, setExtractedText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert("Please select an image file");
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
        alert("Text copied to clipboard!");
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
        <div className={styles["text-extractor"]} onPaste={handlePaste}>
            <div className={styles["extractor-header"]}>
                <h1>{"Text Extractor"}</h1>
                <p>{"Extract text from images (OCR simulation)"}</p>
            </div>

            <div className={styles["extractor-container"]}>
                <div className={styles["upload-section"]}>
                    <div className={styles["upload-area"]}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className={styles["file-input"]}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className={styles["upload-label"]}>
                            <div className={styles["upload-icon"]}>📁</div>
                            <div className={styles["upload-text"]}>
                                {"Click to upload image"}
                            </div>
                            <div className={styles["upload-hint"]}>
                                {"or paste image from clipboard"}
                            </div>
                            <div className={styles["supported-formats"]}>
                                {"Supported formats: JPG, PNG, GIF, BMP"}
                            </div>
                        </label>
                    </div>

                    {uploadedImage && (
                        <div className={styles["image-preview"]}>
                            <h4>{"Image Preview"}</h4>
                            <img src={uploadedImage} alt="Uploaded preview" />
                        </div>
                    )}
                </div>

                {isProcessing && (
                    <div className={styles["processing-indicator"]}>
                        <div className={styles["spinner"]}></div>
                        <p>{"Processing image..."}</p>
                    </div>
                )}

                {extractedText && (
                    <div className={styles["result-section"]}>
                        <h3>{"Extracted Text"}</h3>
                        <div className={styles["text-output"]}>
                            <pre>{extractedText}</pre>
                        </div>
                        <div className={styles["result-actions"]}>
                            <button onClick={copyToClipboard} className={styles["copy-btn"]}>
                                {"Copy Text"}
                            </button>
                            <button onClick={downloadText} className={styles["download-btn"]}>
                                {"Download Text"}
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles["action-buttons"]}>
                    <button onClick={clearAll} className={styles["clear-btn"]}>
                        {"Clear All"}
                    </button>
                </div>

                <div className={styles["info-section"]}>
                    <h4>{"About OCR Technology"}</h4>
                    <p>{"OCR (Optical Character Recognition) technology converts different types of documents, such as scanned paper documents, PDF files or images captured by a digital camera into editable and searchable data."}</p>
                    
                    <h5>{"Common Uses:"}</h5>
                    <ul>
                        <li>{"Digitizing printed documents"}</li>
                        <li>{"Automating data entry from forms"}</li>
                        <li>{"Extracting text from screenshots"}</li>
                        <li>{"Processing business cards"}</li>
                    </ul>

                    <div className={styles["limitations"]}>
                        <h5>{"Limitations:"}</h5>
                        <p>{"Note: This is a simulation. For production use, consider:"}</p>
                        <ul>
                            <li>{"Google Cloud Vision API"}</li>
                            <li>{"Amazon Textract"}</li>
                            <li>{"Tesseract.js (open source)"}</li>
                            <li>{"Microsoft Azure Computer Vision"}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextExtractor;