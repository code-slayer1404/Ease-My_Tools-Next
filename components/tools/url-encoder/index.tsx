"use client";

import React, { useState } from 'react';
import styles from './styles.module.css';

const URLEncoder = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [operation, setOperation] = useState('encode');

    const processText = () => {
        if (!inputText.trim()) {
            alert("Please enter some text");
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
            alert("Invalid input for the selected operation");
        }
    };

    const clearAll = () => {
        setInputText('');
        setOutputText('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const swapOperation = () => {
        setOperation(operation === 'encode' ? 'decode' : 'encode');
        setInputText(outputText);
        setOutputText(inputText);
    };

    const processFullURL = () => {
        if (!inputText.trim()) {
            alert("Please enter a URL");
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
            alert("Invalid URL for the selected operation");
        }
    };

    return (
        <div className={styles["url-encoder"]}>
            <div className={styles["encoder-header"]}>
                <h1>{"URL Encoder/Decoder"}</h1>
                <p>{"Encode and decode URL strings online"}</p>
            </div>

            <div className={styles["encoder-container"]}>
                <div className={styles["operation-selector"]}>
                    <button 
                        className={`${styles["op-btn"]} ${operation === 'encode' ? styles["active"] : ""}`}
                        onClick={() => setOperation('encode')}
                    >
                        {"Encode"}
                    </button>
                    <button 
                        className={`${styles["op-btn"]} ${operation === 'decode' ? styles["active"] : ""}`}
                        onClick={() => setOperation('decode')}
                    >
                        {"Decode"}
                    </button>
                </div>

                <div className={styles["input-section"]}>
                    <label>
                        {operation === 'encode' 
                            ? "Text to Encode"
                            : "URL to Decode"
                        }
                    </label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={
                            operation === 'encode' 
                                ? "Enter text to encode to URL format..."
                                : "Enter URL to decode..."
                        }
                        className={styles["text-input"]}
                        rows={4}
                    />
                </div>

                <div className={styles["action-buttons"]}>
                    <button onClick={processText} className={styles["process-btn"]}>
                        {operation === 'encode' 
                            ? "Encode Component"
                            : "Decode Component"
                        }
                    </button>
                    <button onClick={processFullURL} className={`${styles["process-btn"]} ${styles["full"]}`}>
                        {operation === 'encode' 
                            ? "Encode Full URL"
                            : "Decode Full URL"
                        }
                    </button>
                    <button onClick={swapOperation} className={styles["swap-btn"]}>
                        {"Swap"}
                    </button>
                    <button onClick={clearAll} className={styles["clear-btn"]}>
                        {"Clear All"}
                    </button>
                </div>

                {outputText && (
                    <div className={styles["output-section"]}>
                        <label>
                            {operation === 'encode' 
                                ? "Encoded Result"
                                : "Decoded Result"
                            }
                        </label>
                        <div className={styles["output-container"]}>
                            <pre className={styles["output-text"]}>{outputText}</pre>
                            <button 
                                onClick={() => copyToClipboard(outputText)} 
                                className={styles["copy-btn"]}
                            >
                                {"Copy"}
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles["info-section"]}>
                    <h4>{"About URL Encoding"}</h4>
                    <p><strong>{"encodeURIComponent()"}:</strong> {"Encodes all characters except: A-Z a-z 0-9 - _ . ! ~ * ' ( )"}</p>
                    <p><strong>{"encodeURI()"}:</strong> {"Encodes a complete URL, preserving characters like : / ? & ="}</p>
                    
                    <h5>{"Common Uses:"}</h5>
                    <ul>
                        <li>{"Query parameters in URLs"}</li>
                        <li>{"Form data submission"}</li>
                        <li>{"API requests with special characters"}</li>
                        <li>{"Handling user input in web applications"}</li>
                    </ul>

                    <div className={styles["examples"]}>
                        <h5>{"Examples:"}</h5>
                        <div className={styles["example"]}>
                            <strong>{"Encode:"}</strong> "hello world" → "hello%20world"
                        </div>
                        <div className={styles["example"]}>
                            <strong>{"Decode:"}</strong> "hello%20world" → "hello world"
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default URLEncoder;