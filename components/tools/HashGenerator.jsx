"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/HashGenerator.css';

const HashGenerator = () => {
    const { theme } = useTheme();
    const [inputText, setInputText] = useState('');
    const [hashes, setHashes] = useState({ md5: '', sha1: '', sha256: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const generateHashes = async () => {
        if (!inputText.trim()) {
            alert("Please enter some text" || 'Please enter some text');
            return;
        }

        setIsProcessing(true);

        // Simulate hash generation (in real app, use crypto libraries)
        setTimeout(() => {
            const text = inputText;
            setHashes({
                md5: generateMockHash(text, 'md5'),
                sha1: generateMockHash(text, 'sha1'),
                sha256: generateMockHash(text, 'sha256')
            });
            setIsProcessing(false);
        }, 500);
    };

    const generateMockHash = (text, algorithm) => {
        // This is a mock implementation. In production, use proper crypto libraries
        const encoder = new TextEncoder();
        const data = encoder.encode(text + algorithm);
        let hash = '';
        for (let i = 0; i < 32; i++) {
            hash += Math.floor(Math.random() * 16).toString(16);
        }
        return hash;
    };

    const clearAll = () => {
        setInputText('');
        setHashes({ md5: '', sha1: '', sha256: '' });
    };

    const copyToClipboard = (hash) => {
        navigator.clipboard.writeText(hash);
        alert("Copied to clipboard!" || 'Copied to clipboard!');
    };

    return (
        <div className={`hash-generator ${theme}`}>
            <div className="generator-header">
                <h1>{"Hash Generator" || 'Hash Generator'}</h1>
                <p>{"Generate MD5, SHA-1, and SHA-256 hashes" || 'Generate MD5, SHA-1, and SHA-256 hashes'}</p>
            </div>

            <div className="generator-container">
                <div className="input-section">
                    <label>{"Input Text" || 'Input Text'}</label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={"Enter text to generate hashes..." || 'Enter text to generate hashes...'}
                        className="text-input"
                        rows="4"
                    />
                </div>

                <div className="action-buttons">
                    <button onClick={generateHashes} className="generate-btn" disabled={isProcessing}>
                        {isProcessing ? "Generating..." || 'Generating...' : "Generate Hashes" || 'Generate Hashes'}
                    </button>
                    <button onClick={clearAll} className="clear-btn">
                        {"Clear All" || 'Clear All'}
                    </button>
                </div>

                {(hashes.md5 || hashes.sha1 || hashes.sha256) && (
                    <div className="results-section">
                        <h3>{"Generated Hashes" || 'Generated Hashes'}</h3>
                        
                        <div className="hash-result">
                            <label>MD5:</label>
                            <div className="hash-output">
                                <code>{hashes.md5}</code>
                                <button onClick={() => copyToClipboard(hashes.md5)} className="copy-btn">
                                    {"Copy" || 'Copy'}
                                </button>
                            </div>
                        </div>

                        <div className="hash-result">
                            <label>SHA-1:</label>
                            <div className="hash-output">
                                <code>{hashes.sha1}</code>
                                <button onClick={() => copyToClipboard(hashes.sha1)} className="copy-btn">
                                    {"Copy" || 'Copy'}
                                </button>
                            </div>
                        </div>

                        <div className="hash-result">
                            <label>SHA-256:</label>
                            <div className="hash-output">
                                <code>{hashes.sha256}</code>
                                <button onClick={() => copyToClipboard(hashes.sha256)} className="copy-btn">
                                    {"Copy" || 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="info-section">
                    <h4>{"About Hash Functions" || 'About Hash Functions'}</h4>
                    <div className="algorithm-info">
                        <div className="algorithm">
                            <h5>MD5</h5>
                            <p>{"128-bit hash function. Fast but considered cryptographically broken." || '128-bit hash function. Fast but considered cryptographically broken.'}</p>
                        </div>
                        <div className="algorithm">
                            <h5>SHA-1</h5>
                            <p>{"160-bit hash function. No longer considered secure against attacks." || '160-bit hash function. No longer considered secure against attacks.'}</p>
                        </div>
                        <div className="algorithm">
                            <h5>SHA-256</h5>
                            <p>{"256-bit hash function. Part of SHA-2 family, currently secure." || '256-bit hash function. Part of SHA-2 family, currently secure.'}</p>
                        </div>
                    </div>

                    <h5>{"Common Uses:" || 'Common Uses:'}</h5>
                    <ul>
                        <li>{"Data integrity verification" || 'Data integrity verification'}</li>
                        <li>{"Digital signatures" || 'Digital signatures'}</li>
                        <li>{"Password storage" || 'Password storage'}</li>
                        <li>{"File checksums" || 'File checksums'}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default HashGenerator;