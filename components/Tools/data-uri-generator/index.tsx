"use client"

import React, { useState, useRef } from "react"
import styles from "./styles.module.css"
import Image from "next/image"

interface FileInfo {
    name: string
    size: number
    type: string
    lastModified?: number
    characterCount?: number
    uriLength?: number
}

const DataUriGenerator = () => {
    const [inputType, setInputType] = useState("text")
    const [text, setText] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [textType, setTextType] = useState("plainText")
    const [dataUri, setDataUri] = useState("")
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
    const [copied, setCopied] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const mimeTypes: Record<string, string> = {
        plainText: "text/plain",
        html: "text/html",
        css: "text/css",
        javascript: "application/javascript",
        json: "application/json",
        xml: "application/xml",
        svg: "image/svg+xml",
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setFileInfo({
                name: selectedFile.name,
                size: selectedFile.size,
                type: selectedFile.type,
                lastModified: selectedFile.lastModified,
            })
        }
    }

    const generateDataUri = () => {
        try {
            if (inputType === "text" && text.trim()) {
                const mimeType = mimeTypes[textType] || "text/plain"
                const encodedText = encodeURIComponent(text)
                const uri = `data:${mimeType};charset=utf-8,${encodedText}`
                setDataUri(uri)
                setFileInfo({
                    name: "text.txt",
                    size: new Blob([text]).size,
                    type: mimeType,
                    characterCount: text.length,
                    uriLength: uri.length,
                })
            } else if (inputType === "file" && file) {
                const reader = new FileReader()
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    const uri = e.target?.result
                    if (typeof uri === "string") {
                        setDataUri(uri)
                        setFileInfo((prev) => {
                            if (!prev) return null
                            return {
                                ...prev,
                                uriLength: uri.length,
                            }
                        })
                    }
                }
                reader.readAsDataURL(file)
            } else {
                alert("Please provide input text or select a file")
            }
            setCopied(false)
        } catch (error) {
            if (error instanceof Error)
                alert("Error generating Data URI: " + error.message)
        }
    }

    const copyUri = () => {
        navigator.clipboard.writeText(dataUri)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const clearAll = () => {
        setText("")
        setFile(null)
        setDataUri("")
        setFileInfo(null)
        setCopied(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const getPreview = () => {
        if (!dataUri) return null

        if (dataUri.startsWith("data:image/")) {
            return (
                <Image
                    src={dataUri}
                    alt="Preview"
                    height={100}
                    width={100}
                    className={styles["image-preview"]}
                />
            )
        } else if (
            dataUri.startsWith("data:text/") ||
            dataUri.startsWith("data:application/")
        ) {
            const parts = dataUri.split(",")
            if (parts.length < 2 || !parts[1]) {
                return (
                    <div className={styles["no-preview"]}>Invalid data URI</div>
                )
            }
            const content = decodeURIComponent(parts[1])
            return (
                <pre className={styles["text-preview"]}>
                    {content.length > 1000
                        ? content.substring(0, 1000) + "..."
                        : content}
                </pre>
            )
        }
        return <div className={styles["no-preview"]}>No preview available</div>
    }

    return (
        <div className={styles["data-uri-generator"]}>
            {/* <div className={styles["tool-header"]}>
                <h1>{"Data URI Generator"}</h1>
                <p>{"Convert files and text to Data URIs"}</p>
            </div> */}

            <div className={styles["generator-container"]}>
                <div className={styles["input-section"]}>
                    <div className={styles["input-type-selector"]}>
                        <label>
                            <input
                                type="radio"
                                value="text"
                                checked={inputType === "text"}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => setInputType(e.target.value)}
                            />
                            {"Text Input"}
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="file"
                                checked={inputType === "file"}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => setInputType(e.target.value)}
                            />
                            {"File Input"}
                        </label>
                    </div>

                    {inputType === "text" && (
                        <div className={styles["text-input-section"]}>
                            <div className={styles["text-type-selector"]}>
                                <label>{"Text Type"}:</label>
                                <select
                                    value={textType}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLSelectElement>
                                    ) => setTextType(e.target.value)}
                                >
                                    <option value="plainText">
                                        {"Plain Text"}
                                    </option>
                                    <option value="html">{"HTML"}</option>
                                    <option value="css">{"CSS"}</option>
                                    <option value="javascript">
                                        {"JavaScript"}
                                    </option>
                                    <option value="json">{"JSON"}</option>
                                    <option value="xml">{"XML"}</option>
                                    <option value="svg">{"SVG"}</option>
                                </select>
                            </div>
                            <textarea
                                value={text}
                                onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>
                                ) => setText(e.target.value)}
                                placeholder={"Enter text to convert..."}
                                rows={8}
                            />
                        </div>
                    )}

                    {inputType === "file" && (
                        <div className={styles["file-input-section"]}>
                            <div className={styles["file-selector"]}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    className={styles["file-input"]}
                                />
                                <div className={styles["file-info"]}>
                                    {file ? (
                                        <div className={styles["file-details"]}>
                                            <strong>{file.name}</strong>
                                            <span>
                                                ({formatFileSize(file.size)})
                                            </span>
                                        </div>
                                    ) : (
                                        <span className={styles["no-file"]}>
                                            {"No file selected"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles["action-buttons"]}>
                    <button
                        onClick={generateDataUri}
                        className={styles["primary-btn"]}
                    >
                        {"Generate Data URI"}
                    </button>
                    <button
                        onClick={clearAll}
                        className={styles["secondary-btn"]}
                    >
                        {"Clear"}
                    </button>
                </div>

                {fileInfo && (
                    <div className={styles["file-info-section"]}>
                        <h3>{"File Information"}</h3>
                        <div className={styles["info-grid"]}>
                            <div className={styles["info-item"]}>
                                <span className={styles["info-label"]}>
                                    {"File Name"}:
                                </span>
                                <span className={styles["info-value"]}>
                                    {fileInfo.name}
                                </span>
                            </div>
                            <div className={styles["info-item"]}>
                                <span className={styles["info-label"]}>
                                    {"File Size"}:
                                </span>
                                <span className={styles["info-value"]}>
                                    {formatFileSize(fileInfo.size)}
                                </span>
                            </div>
                            <div className={styles["info-item"]}>
                                <span className={styles["info-label"]}>
                                    {"MIME Type"}:
                                </span>
                                <span className={styles["info-value"]}>
                                    {fileInfo.type}
                                </span>
                            </div>
                            {fileInfo.characterCount && (
                                <div className={styles["info-item"]}>
                                    <span className={styles["info-label"]}>
                                        {"Character Count"}:
                                    </span>
                                    <span className={styles["info-value"]}>
                                        {fileInfo.characterCount.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {fileInfo.uriLength && (
                                <div className={styles["info-item"]}>
                                    <span className={styles["info-label"]}>
                                        {"URI Length"}:
                                    </span>
                                    <span className={styles["info-value"]}>
                                        {fileInfo.uriLength.toLocaleString()}{" "}
                                        characters
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {dataUri && (
                    <div className={styles["results-section"]}>
                        <div className={styles["data-uri-output"]}>
                            <div className={styles["output-header"]}>
                                <h3>{"Data URI"}</h3>
                                <button
                                    onClick={copyUri}
                                    className={`${styles["copy-btn"]} ${copied ? "copied" : ""}`}
                                >
                                    {copied ? "✓" : "Copy URI"}
                                </button>
                            </div>
                            <textarea
                                value={dataUri}
                                readOnly
                                rows={4}
                                className={styles["uri-output"]}
                            />
                            {copied && (
                                <div className={styles["copied-message"]}>
                                    {"URI copied to clipboard!"}
                                </div>
                            )}
                        </div>

                        <div className={styles["preview-section"]}>
                            <h3>{"Preview"}</h3>
                            <div className={styles["preview-container"]}>
                                {getPreview()}
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles["data-uri-info"]}>
                    <h4>{"Data URI Information"}</h4>
                    <ul>
                        <li>
                            {
                                "Data URIs allow embedding data directly in web pages"
                            }
                        </li>
                        <li>
                            {"Useful for small images, icons, and data files"}
                        </li>
                        <li>
                            {"Can increase page load speed for small resources"}
                        </li>
                        <li>{"Not recommended for large files (> 100KB)"}</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default DataUriGenerator
