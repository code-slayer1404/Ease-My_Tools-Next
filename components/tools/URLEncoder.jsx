"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/URLEncoder.css';

const URLEncoder = () => {
    const { theme } = useTheme();
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [operation, setOperation] = useState('encode');

    const processText = () => {
        if (!inputText.trim()) {
            alert("Please enter some text" || 'Please enter some text');
            return;
        }

        try {
            if (operation === 'encode') {
                const encoded = encodeURIComponent(inputText);
                setOutputText(encoded);
            } else {
                const decoded = decodeURIComponent(inputText);
                setOutputText(decoded);
            }
        } catch (error) {
            alert("Invalid input for the selected operation" || 'Invalid input for the selected operation');
        }
    };

    const clearAll = () => {
        setInputText('');
        setOutputText('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!" || 'Copied to clipboard!');
    };

    const swapOperation = () => {
        setOperation(operation === 'encode' ? 'decode' : 'encode');
        setInputText(outputText);
        setOutputText(inputText);
    };

    const processFullURL = () => {
        if (!inputText.trim()) {
            alert("Please enter a URL" || 'Please enter a URL');
            return;
        }

        try {
            if (operation === 'encode') {
                const encoded = encodeURI(inputText);
                setOutputText(encoded);
            } else {
                const decoded = decodeURI(inputText);
                setOutputText(decoded);
            }
        } catch (error) {
            alert("Invalid URL for the selected operation" || 'Invalid URL for the selected operation');
        }
    };

    return (
        <div className={`url-encoder ${theme}`}>
            <div className="encoder-header">
                <h1>{"URL Encoder/Decoder" || 'URL Encoder/Decoder'}</h1>
                <p>{"Encode and decode URL strings online" || 'Encode and decode URL strings online'}</p>
            </div>

            <div className="encoder-container">
                <div className="operation-selector">
                    <button 
                        className={`op-btn ${operation === 'encode' ? 'active' : ''}`}
                        onClick={() => setOperation('encode')}
                    >
                        {"Encode" || 'Encode'}
                    </button>
                    <button 
                        className={`op-btn ${operation === 'decode' ? 'active' : ''}`}
                        onClick={() => setOperation('decode')}
                    >
                        {"Decode" || 'Decode'}
                    </button>
                </div>

                <div className="input-section">
                    <label>
                        {operation === 'encode' 
                            ? "Text to Encode" || 'Text to Encode'
                            : "URL to Decode" || 'URL to Decode'
                        }
                    </label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={
                            operation === 'encode' 
                                ? "Enter text to encode to URL format..." || 'Enter text to encode to URL format...'
                                : "Enter URL to decode..." || 'Enter URL to decode...'
                        }
                        className="text-input"
                        rows="4"
                    />
                </div>

                <div className="action-buttons">
                    <button onClick={processText} className="process-btn">
                        {operation === 'encode' 
                            ? "Encode Component" || 'Encode Component'
                            : "Decode Component" || 'Decode Component'
                        }
                    </button>
                    <button onClick={processFullURL} className="process-btn full">
                        {operation === 'encode' 
                            ? "Encode Full URL" || 'Encode Full URL'
                            : "Decode Full URL" || 'Decode Full URL'
                        }
                    </button>
                    <button onClick={swapOperation} className="swap-btn">
                        {"Swap" || 'Swap'}
                    </button>
                    <button onClick={clearAll} className="clear-btn">
                        {"Clear All" || 'Clear All'}
                    </button>
                </div>

                {outputText && (
                    <div className="output-section">
                        <label>
                            {operation === 'encode' 
                                ? "Encoded Result" || 'Encoded Result'
                                : "Decoded Result" || 'Decoded Result'
                            }
                        </label>
                        <div className="output-container">
                            <pre className="output-text">{outputText}</pre>
                            <button 
                                onClick={() => copyToClipboard(outputText)} 
                                className="copy-btn"
                            >
                                {"Copy" || 'Copy'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="info-section">
                    <h4>{"About URL Encoding" || 'About URL Encoding'}</h4>
                    <p><strong>{"encodeURIComponent()" || 'encodeURIComponent()'}:</strong> {"Encodes all characters except: A-Z a-z 0-9 - _ . ! ~ * ' ( )" || 'Encodes all characters except: A-Z a-z 0-9 - _ . ! ~ * \' ( )'}</p>
                    <p><strong>{"encodeURI()" || 'encodeURI()'}:</strong> {"Encodes a complete URL, preserving characters like : / ? & =" || 'Encodes a complete URL, preserving characters like : / ? & ='}</p>
                    
                    <h5>{"Common Uses:" || 'Common Uses:'}</h5>
                    <ul>
                        <li>{"Query parameters in URLs" || 'Query parameters in URLs'}</li>
                        <li>{"Form data submission" || 'Form data submission'}</li>
                        <li>{"API requests with special characters" || 'API requests with special characters'}</li>
                        <li>{"Handling user input in web applications" || 'Handling user input in web applications'}</li>
                    </ul>

                    <div className="examples">
                        <h5>{"Examples:" || 'Examples:'}</h5>
                        <div className="example">
                            <strong>{"Encode:" || 'Encode:'}</strong> "hello world" → "hello%20world"
                        </div>
                        <div className="example">
                            <strong>{"Decode:" || 'Decode:'}</strong> "hello%20world" → "hello world"
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default URLEncoder;