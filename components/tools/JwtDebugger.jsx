"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/JwtDebugger.css';

const JwtDebugger = () => {
    const { theme } = useTheme();
    const [jwtToken, setJwtToken] = useState('');
    const [decoded, setDecoded] = useState(null);
    const [error, setError] = useState('');

    const decodeJWT = () => {
        try {
            setError('');
            if (!jwtToken.trim()) {
                setError("Invalid JWT token");
                return;
            }

            const parts = jwtToken.split('.');
            if (parts.length !== 3) {
                throw new Error("Invalid JWT token");
            }

            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            const signature = parts[2];

            // Calculate expiration info
            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp && payload.exp < now;
            const expiresIn = payload.exp ? payload.exp - now : null;

            setDecoded({
                header,
                payload,
                signature,
                isExpired,
                expiresIn
            });
        } catch (err) {
            setError(err.message);
            setDecoded(null);
        }
    };

    const clearAll = () => {
        setJwtToken('');
        setDecoded(null);
        setError('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
    };

    const formatTimeRemaining = (seconds) => {
        if (!seconds) return 'N/A';
        if (seconds < 0) return 'Expired';
        
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <div className={`jwt-debugger ${theme}`}>
            <div className="tool-header">
                <h1>{"JWT Debugger"}</h1>
                <p>{"Decode and verify JSON Web Tokens"}</p>
            </div>

            <div className="debugger-container">
                <div className="input-section">
                    <label>{"JWT Token"}</label>
                    <textarea
                        value={jwtToken}
                        onChange={(e) => setJwtToken(e.target.value)}
                        placeholder={"Paste your JWT token here..."}
                        rows="4"
                        className={error ? 'error' : ''}
                    />
                </div>

                <div className="action-buttons">
                    <button onClick={decodeJWT} className="primary-btn">
                        {"Decode JWT"}
                    </button>
                    <button onClick={clearAll} className="secondary-btn">
                        {"Clear"}
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {decoded && (
                    <div className="results-section">
                        <div className="token-info">
                            <h3>{"Token Information"}</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">{"Algorithm"}:</span>
                                    <span className="info-value">{decoded.header.alg || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">{"Token Type"}:</span>
                                    <span className="info-value">{decoded.header.typ || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">{"Expiration"}:</span>
                                    <span className={`info-value ${decoded.isExpired ? 'expired' : ''}`}>
                                        {formatTimestamp(decoded.payload.exp)}
                                        {decoded.expiresIn && (
                                            <span className="time-remaining">
                                                ({formatTimeRemaining(decoded.expiresIn)})
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">{"Issued At"}:</span>
                                    <span className="info-value">{formatTimestamp(decoded.payload.iat)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">{"Issuer"}:</span>
                                    <span className="info-value">{decoded.payload.iss || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">{"Subject"}:</span>
                                    <span className="info-value">{decoded.payload.sub || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">{"Audience"}:</span>
                                    <span className="info-value">{decoded.payload.aud || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">{"Token ID"}:</span>
                                    <span className="info-value">{decoded.payload.jti || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="jwt-parts">
                            <div className="jwt-part">
                                <div className="part-header">
                                    <h4>{"Header"}</h4>
                                    <button 
                                        onClick={() => copyToClipboard(decoded.header)}
                                        className="copy-btn-small"
                                    >
                                        {"Copy Header"}
                                    </button>
                                </div>
                                <pre className="json-output">{JSON.stringify(decoded.header, null, 2)}</pre>
                            </div>

                            <div className="jwt-part">
                                <div className="part-header">
                                    <h4>{"Payload"}</h4>
                                    <button 
                                        onClick={() => copyToClipboard(decoded.payload)}
                                        className="copy-btn-small"
                                    >
                                        {"Copy Payload"}
                                    </button>
                                </div>
                                <pre className="json-output">{JSON.stringify(decoded.payload, null, 2)}</pre>
                            </div>

                            <div className="jwt-part">
                                <div className="part-header">
                                    <h4>{"Signature"}</h4>
                                    <span className={`verification ${decoded.signature ? 'verified' : 'not-verified'}`}>
                                        {decoded.signature ? "Verified" : "Not Verified"}
                                    </span>
                                </div>
                                <div className="signature-output">
                                    {decoded.signature}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="jwt-info">
                    <h4>JWT Information</h4>
                    <ul>
                        <li>{"JWT consists of three parts: header, payload, and signature"}</li>
                        <li>{"Header contains token type and algorithm information"}</li>
                        <li>{"Payload contains the claims or data"}</li>
                        <li>{"Signature ensures the token hasn't been tampered with"}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default JwtDebugger;