"use client";

//@ts-nocheck
import React, { useState, useRef } from "react";
import "../../styles/tools/Base64Converter.css";
import { useTheme } from "../../contexts/ThemeContext";

const Base64Converter = () => {
    console.log("Base64Converter was rendered");
    
    const { theme } = useTheme();
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState("encode");
    const fileInputRef = useRef(null);

    const handleEncode = () => {
        if (mode === "encode") {
            setOutput(btoa(unescape(encodeURIComponent(input))));
        } else {
            try {
                setOutput(decodeURIComponent(escape(atob(input))));
            } catch (error) {
                setOutput("❌ Invalid Base64 string");
            }
        }
    };

    const handleFileUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (mode === "encode") {
                const base64 = e.target.result.split(',')[1];
                setOutput(base64);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const downloadFile = () => {
        if (!output) return;

        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = mode === "encode" ? "encoded.txt" : "decoded.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
    };

    const clearAll = () => {
        setInput("");
        setOutput("");
    };

    return (
        <div className={`base64-container ${theme}`}>
            <h2 className="title">{"🔤 Base64 Converter"}</h2>

            <div className="mode-selector">
                <button
                    className={mode === "encode" ? "active" : ""}
                    onClick={() => setMode("encode")}
                >
                    {"Encode"}
                </button>
                <button
                    className={mode === "decode" ? "active" : ""}
                    onClick={() => setMode("decode")}
                >
                    {"Decode"}
                </button>
            </div>

            <div className="input-section">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={"Enter text to encode/decode..."}
                    className="text-area"
                    rows={6}
                />
            </div>

            <div
                className="file-drop-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <p>{"📂 Drag & drop a file here or click to browse"}</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    hidden
                />
            </div>

            <button className="action-btn convert-btn" onClick={handleEncode}>
                {mode === "encode" ? "Encode" : "Decode"}
            </button>

            {output && (
                <div className="output-section">
                    <textarea
                        value={output}
                        readOnly
                        placeholder={"Result will appear here..."}
                        className="text-area output"
                        rows={6}
                    />
                    <div className="output-actions">
                        <button className="action-btn" onClick={copyToClipboard}>
                            {"📋 Copy"}
                        </button>
                        <button className="action-btn" onClick={downloadFile}>
                            {"📥 Download as File"}
                        </button>
                        <button className="action-btn clear-btn" onClick={clearAll}>
                            {"🗑️ Clear"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Base64Converter;