"use client";

import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/DataUriGenerator.css';

const DataUriGenerator = () => {
    const { theme } = useTheme();
    const [inputType, setInputType] = useState('text');
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [textType, setTextType] = useState('plainText');
    const [dataUri, setDataUri] = useState('');
    const [fileInfo, setFileInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

    const mimeTypes = {
        plainText: 'text/plain',
        html: 'text/html',
        css: 'text/css',
        javascript: 'application/javascript',
        json: 'application/json',
        xml: 'application/xml',
        svg: 'image/svg+xml'
    };

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileInfo({
                name: selectedFile.name,
                size: selectedFile.size,
                type: selectedFile.type,
                lastModified: selectedFile.lastModified
            });
        }
    };

    const generateDataUri = () => {
        try {
            if (inputType === 'text' && text.trim()) {
                const mimeType = mimeTypes[textType] || 'text/plain';
                const encodedText = encodeURIComponent(text);
                const uri = `data:${mimeType};charset=utf-8,${encodedText}`;
                setDataUri(uri);
                setFileInfo({
                    name: 'text.txt',
                    size: new Blob([text]).size,
                    type: mimeType,
                    characterCount: text.length,
                    uriLength: uri.length
                });
            } else if (inputType === 'file' && file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const uri = e.target.result;
                    setDataUri(uri);
                    setFileInfo(prev => ({
                        ...prev,
                        uriLength: uri.length
                    }));
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please provide input text or select a file');
            }
            setCopied(false);
        } catch (error) {
            alert('Error generating Data URI: ' + error.message);
        }
    };

    const copyUri = () => {
        navigator.clipboard.writeText(dataUri);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearAll = () => {
        setText('');
        setFile(null);
        setDataUri('');
        setFileInfo(null);
        setCopied(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getPreview = () => {
        if (!dataUri) return null;

        if (dataUri.startsWith('data:image/')) {
            return <img src={dataUri} alt="Preview" className="image-preview" />;
        } else if (dataUri.startsWith('data:text/') || dataUri.startsWith('data:application/')) {
            const content = decodeURIComponent(dataUri.split(',')[1]);
            return (
                <pre className="text-preview">
                    {content.length > 1000 ? content.substring(0, 1000) + '...' : content}
                </pre>
            );
        }
        return <div className="no-preview">No preview available</div>;
    };

    return (
        <div className={`data-uri-generator ${theme}`}>
            <div className="tool-header">
                <h1>{"Data URI Generator"}</h1>
                <p>{"Convert files and text to Data URIs"}</p>
            </div>

            <div className="generator-container">
                <div className="input-section">
                    <div className="input-type-selector">
                        <label>
                            <input
                                type="radio"
                                value="text"
                                checked={inputType === 'text'}
                                onChange={(e) => setInputType(e.target.value)}
                            />
                            {"Text Input"}
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="file"
                                checked={inputType === 'file'}
                                onChange={(e) => setInputType(e.target.value)}
                            />
                            {"File Input"}
                        </label>
                    </div>

                    {inputType === 'text' && (
                        <div className="text-input-section">
                            <div className="text-type-selector">
                                <label>{"Text Type"}:</label>
                                <select value={textType} onChange={(e) => setTextType(e.target.value)}>
                                    <option value="plainText">{"Plain Text"}</option>
                                    <option value="html">{"HTML"}</option>
                                    <option value="css">{"CSS"}</option>
                                    <option value="javascript">{"JavaScript"}</option>
                                    <option value="json">{"JSON"}</option>
                                    <option value="xml">{"XML"}</option>
                                    <option value="svg">{"SVG"}</option>
                                </select>
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={"Enter text to convert..."}
                                rows="8"
                            />
                        </div>
                    )}

                    {inputType === 'file' && (
                        <div className="file-input-section">
                            <div className="file-selector">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    className="file-input"
                                />
                                <div className="file-info">
                                    {file ? (
                                        <div className="file-details">
                                            <strong>{file.name}</strong>
                                            <span>({formatFileSize(file.size)})</span>
                                        </div>
                                    ) : (
                                        <span className="no-file">{"No file selected"}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    <button onClick={generateDataUri} className="primary-btn">
                        {"Generate Data URI"}
                    </button>
                    <button onClick={clearAll} className="secondary-btn">
                        {"Clear"}
                    </button>
                </div>

                {fileInfo && (
                    <div className="file-info-section">
                        <h3>{"File Information"}</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">{"File Name"}:</span>
                                <span className="info-value">{fileInfo.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">{"File Size"}:</span>
                                <span className="info-value">{formatFileSize(fileInfo.size)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">{"MIME Type"}:</span>
                                <span className="info-value">{fileInfo.type}</span>
                            </div>
                            {fileInfo.characterCount && (
                                <div className="info-item">
                                    <span className="info-label">{"Character Count"}:</span>
                                    <span className="info-value">{fileInfo.characterCount.toLocaleString()}</span>
                                </div>
                            )}
                            {fileInfo.uriLength && (
                                <div className="info-item">
                                    <span className="info-label">{"URI Length"}:</span>
                                    <span className="info-value">{fileInfo.uriLength.toLocaleString()} characters</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {dataUri && (
                    <div className="results-section">
                        <div className="data-uri-output">
                            <div className="output-header">
                                <h3>{"Data URI"}</h3>
                                <button 
                                    onClick={copyUri}
                                    className={`copy-btn ${copied ? 'copied' : ''}`}
                                >
                                    {copied ? '✓' : "Copy URI"}
                                </button>
                            </div>
                            <textarea
                                value={dataUri}
                                readOnly
                                rows="4"
                                className="uri-output"
                            />
                            {copied && (
                                <div className="copied-message">
                                    {"URI copied to clipboard!"}
                                </div>
                            )}
                        </div>

                        <div className="preview-section">
                            <h3>{"Preview"}</h3>
                            <div className="preview-container">
                                {getPreview()}
                            </div>
                        </div>
                    </div>
                )}

                <div className="data-uri-info">
                    <h4>{"Data URI Information"}</h4>
                    <ul>
                        <li>{"Data URIs allow embedding data directly in web pages"}</li>
                        <li>{"Useful for small images, icons, and data files"}</li>
                        <li>{"Can increase page load speed for small resources"}</li>
                        <li>{"Not recommended for large files (> 100KB)"}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DataUriGenerator;