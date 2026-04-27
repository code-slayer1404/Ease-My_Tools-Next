"use client";

import React, { useState, useRef } from "react";
import styles from './styles.module.css';

const Base64Converter = () => {
    console.log("Base64Converter was rendered");

    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"encode" | "decode">("encode");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleEncode = () => {
        if (mode === "encode") {
            setOutput(btoa(unescape(encodeURIComponent(input))));
        } else {
            try {
                setOutput(decodeURIComponent(escape(atob(input))));
            } catch {
                setOutput("❌ Invalid Base64 string");
            }
        }
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            const result = e.target?.result;

            if (mode === "encode") {
                // ✅ SAFE TYPE NARROWING
                if (typeof result === "string") {
                    const base64 = result.split(",")[1];
                    setOutput(base64 || "");
                }
            }
        };

        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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
        <div className={styles["base64-container"]}>
            <h2 className={styles["title"]}>{"🔤 Base64 Converter"}</h2>

            <div className={styles["mode-selector"]}>
                <button
                    className={mode === "encode" ? styles["active"] : ""}
                    onClick={() => setMode("encode")}
                >
                    {"Encode"}
                </button>
                <button
                    className={mode === "decode" ? styles["active"] : ""}
                    onClick={() => setMode("decode")}
                >
                    {"Decode"}
                </button>
            </div>

            <div className={styles["input-section"]}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={"Enter text to encode/decode..."}
                    className={styles["text-area"]}
                    rows={6}
                />
            </div>

            <div
                className={styles["file-drop-zone"]}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <p>{"📂 Drag & drop a file here or click to browse"}</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                    }}
                    hidden
                />
            </div>

            <button
                className={`${styles["action-btn"]} ${styles["convert-btn"]}`}
                onClick={handleEncode}
            >
                {mode === "encode" ? "Encode" : "Decode"}
            </button>

            {output && (
                <div className={styles["output-section"]}>
                    <textarea
                        value={output}
                        readOnly
                        placeholder={"Result will appear here..."}
                        className={`${styles["text-area"]} ${styles["output"]}`}
                        rows={6}
                    />
                    <div className={styles["output-actions"]}>
                        <button className={styles["action-btn"]} onClick={copyToClipboard}>
                            {"📋 Copy"}
                        </button>
                        <button className={styles["action-btn"]} onClick={downloadFile}>
                            {"📥 Download as File"}
                        </button>
                        <button
                            className={`${styles["action-btn"]} ${styles["clear-btn"]}`}
                            onClick={clearAll}
                        >
                            {"🗑️ Clear"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Base64Converter;