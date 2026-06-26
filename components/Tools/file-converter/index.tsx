"use client"

import React, { useState, useRef, useCallback } from "react"
import styles from "./styles.module.css"

const FileConverter = () => {
    const [file, setFile] = useState<any | null>(null)
    const [originalContent, setOriginalContent] = useState("")
    const [convertedContent, setConvertedContent] = useState("")
    const [converting, setConverting] = useState(false)
    const [fileInfo, setFileInfo] = useState<any>({})
    const [conversionSettings, setConversionSettings] = useState({
        targetFormat: "json",
        csvDelimiter: ",",
        jsonFormat: "pretty",
        includeHeaders: true,
        sheetName: "Sheet1",
    })

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const detectFileFormat = (file: any) => {
        const extension = file.name.split(".").pop()?.toLowerCase()

        switch (extension) {
            case "csv":
                return "csv"
            case "xlsx":
            case "xls":
                return "excel"
            case "json":
                return "json"
            default:
                return null
        }
    }

    const readFileContent = (file: any): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result
                if (typeof result !== "string") return
                resolve(result)
            }
            reader.onerror = reject

            reader.readAsText(file, "UTF-8")
        })
    }

    const parseCSV = (text: string, delimiter = ",") => {
        const lines = text
            .trim()
            .split("\n")
            .filter((line) => line.trim() !== "")
        if (lines.length === 0) return { data: [], headers: [] }

        const cleanLines = lines.map((line) => line.replace(/\r/g, ""))
        const headers = (cleanLines[0] ?? "")
            .split(delimiter)
            .map((h: string) => h.trim().replace(/^"|"$/g, ""))

        const data = cleanLines
            .slice(1)
            .map((line) => {
                const values = line
                    .split(delimiter)
                    .map((v) => v.trim().replace(/^"|"$/g, ""))
                const row: any = {}
                headers.forEach((header: string, colIndex: number) => {
                    row[header] = values[colIndex] || ""
                })
                return row
            })
            .filter((row) => Object.values(row).some((val) => val !== ""))

        return { data, headers }
    }

    const convertCSVToJSON = (csvText: string, delimiter = ",") => {
        try {
            const { data } = parseCSV(csvText, delimiter)
            if (data.length === 0) {
                throw new Error("File is empty")
            }

            return conversionSettings.jsonFormat === "pretty"
                ? JSON.stringify(data, null, 2)
                : JSON.stringify(data)
        } catch {
            throw new Error("Invalid CSV format")
        }
    }

    const convertJSONToCSV = (jsonText: string) => {
        let data: any[]
        try {
            data = JSON.parse(jsonText)
        } catch {
            throw new Error("Invalid JSON format")
        }

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Invalid JSON format")
        }

        const headers = Object.keys(data[0])
        const csvRows: string[] = []

        if (conversionSettings.includeHeaders) {
            csvRows.push(
                headers
                    .map((header) => `"${header}"`)
                    .join(conversionSettings.csvDelimiter)
            )
        }

        data.forEach((row: any) => {
            const values = headers.map((header) => {
                const value = row[header]
                const stringValue =
                    value !== null && value !== undefined
                        ? String(value).replace(/"/g, '""')
                        : ""
                return `"${stringValue}"`
            })
            csvRows.push(values.join(conversionSettings.csvDelimiter))
        })

        return csvRows.join("\n")
    }

    const convertToExcel = async (content: string, originalFormat: string) => {
        if (originalFormat === "json") {
            return convertJSONToCSV(content)
        }
        return content
    }

    const convertFromExcel = async (content: string) => {
        return content
    }

    const performConversion = async () => {
        if (!file) {
            alert("Please select a file first")
            return
        }

        setConverting(true)
        setConvertedContent("")

        try {
            const content = await readFileContent(file)
            const originalFormat = detectFileFormat(file)
            let result: any

            switch (originalFormat) {
                case "csv":
                    if (conversionSettings.targetFormat === "json") {
                        result = convertCSVToJSON(
                            content,
                            conversionSettings.csvDelimiter
                        )
                    } else if (conversionSettings.targetFormat === "excel") {
                        result = await convertToExcel(content, "csv")
                    }
                    break

                case "json":
                    if (conversionSettings.targetFormat === "csv") {
                        result = convertJSONToCSV(content)
                    } else if (conversionSettings.targetFormat === "excel") {
                        result = await convertToExcel(content, "json")
                    }
                    break

                case "excel":
                    if (conversionSettings.targetFormat === "csv") {
                        result = await convertFromExcel(content)
                    } else if (conversionSettings.targetFormat === "json") {
                        const csv = await convertFromExcel(content)
                        result = convertCSVToJSON(
                            csv,
                            conversionSettings.csvDelimiter
                        )
                    }
                    break

                default:
                    throw new Error("Invalid file format")
            }

            setConvertedContent(result)
            setConverting(false)
        } catch (error) {
            console.error("Conversion error:", error)
            setConverting(false)
            if (error instanceof Error) {
                alert(error.message)
            }
        }
    }

    const handleFileUpload = useCallback(
        async (uploadedFile: File | undefined) => {
            if (!uploadedFile) return

            if (uploadedFile.size > 10 * 1024 * 1024) {
                alert("File too large (max 10MB)")
                return
            }

            const format = detectFileFormat(uploadedFile)
            if (!format) {
                alert("Invalid file format")
                return
            }

            try {
                const content = await readFileContent(uploadedFile)
                setFile(uploadedFile)
                setOriginalContent(content)
                setConvertedContent("")

                const info: any = {
                    name: uploadedFile.name,
                    size: uploadedFile.size,
                    type: format.toUpperCase(),
                    originalFormat: format,
                }

                if (format === "csv") {
                    const { data, headers } = parseCSV(
                        content,
                        conversionSettings.csvDelimiter
                    )
                    info.rows = data.length
                    info.columns = headers.length
                } else if (format === "json") {
                    try {
                        const jsonData = JSON.parse(content)
                        if (Array.isArray(jsonData)) {
                            info.rows = jsonData.length
                            info.columns = jsonData[0]
                                ? Object.keys(jsonData[0]).length
                                : 0
                        }
                    } catch {}
                }

                setFileInfo(info)

                const defaultTargets: any = {
                    csv: "json",
                    json: "csv",
                    excel: "csv",
                }

                setConversionSettings((prev) => ({
                    ...prev,
                    targetFormat: defaultTargets[format] || "json",
                }))
            } catch {
                alert("Conversion failed")
            }
        },
        [conversionSettings.csvDelimiter]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            const uploadedFile = e.dataTransfer.files?.[0]
            handleFileUpload(uploadedFile)
        },
        [handleFileUpload]
    )

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
    }, [])

    const downloadFile = () => {
        if (!convertedContent) return

        const blob = new Blob([convertedContent], {
            type: getMimeType(conversionSettings.targetFormat),
        })
        const url = URL.createObjectURL(blob)
        const extension = getFileExtension(conversionSettings.targetFormat)
        const fileName = `${fileInfo.name?.split(".")[0] || "file"}_converted.${extension}`

        const link = document.createElement("a")
        link.download = fileName
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
    }

    const getMimeType = (format: string) => {
        switch (format) {
            case "csv":
                return "text/csv"
            case "json":
                return "application/json"
            case "excel":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            default:
                return "text/plain"
        }
    }

    const getFileExtension = (format: string) => {
        switch (format) {
            case "csv":
                return "csv"
            case "json":
                return "json"
            case "excel":
                return "xlsx"
            default:
                return "txt"
        }
    }

    const clearAll = () => {
        setFile(null)
        setOriginalContent("")
        setConvertedContent("")
        setFileInfo({})
        setConversionSettings({
            targetFormat: "json",
            csvDelimiter: ",",
            jsonFormat: "pretty",
            includeHeaders: true,
            sheetName: "Sheet1",
        })
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const formatOptions = [
        { value: "csv", label: "CSV" },
        { value: "json", label: "JSON" },
        { value: "excel", label: "Excel" },
    ]

    const delimiterOptions = [
        { value: ",", label: "Comma" },
        { value: ";", label: "Semicolon" },
        { value: "\t", label: "Tab" },
    ]

    return (
        <div className={styles["file-converter"]}>
            {/* <div className={styles["tool-header"]}>
                <h1>{"File Format Converter"}</h1>
                <p>{"Convert between CSV, Excel, and JSON formats seamlessly"}</p>
            </div> */}

            <div className={styles["converter-container"]}>
                <div className={styles["upload-section"]}>
                    <div
                        className={styles["upload-area"]}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className={styles["upload-content"]}>
                            <div className={styles["upload-icon"]}>📁</div>
                            <h3>{"Drop your file here or click to browse"}</h3>
                            <p>{"Drag & drop your file here"}</p>
                            <small>
                                {"Supported formats: CSV, XLSX, JSON"}
                            </small>
                            <small>{"Max file size: 10MB"}</small>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls,.json"
                            onChange={(e) =>
                                handleFileUpload(e.target.files?.[0])
                            }
                            style={{ display: "none" }}
                        />
                    </div>

                    {file && (
                        <div className={styles["file-info-card"]}>
                            <h4>{"File Information"}</h4>
                            <div className={styles["info-grid"]}>
                                <div className={styles["info-item"]}>
                                    <label>{"Name"}:</label>
                                    <span>{fileInfo.name}</span>
                                </div>
                                <div className={styles["info-item"]}>
                                    <label>{"Size"}:</label>
                                    <span>
                                        {(fileInfo.size / 1024).toFixed(2)} KB
                                    </span>
                                </div>
                                <div className={styles["info-item"]}>
                                    <label>{"Type"}:</label>
                                    <span className={styles["format-badge"]}>
                                        {fileInfo.type}
                                    </span>
                                </div>
                                {fileInfo.rows !== undefined && (
                                    <div className={styles["info-item"]}>
                                        <label>{"Rows"}:</label>
                                        <span>{fileInfo.rows}</span>
                                    </div>
                                )}
                                {fileInfo.columns !== undefined && (
                                    <div className={styles["info-item"]}>
                                        <label>{"Columns"}:</label>
                                        <span>{fileInfo.columns}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* rest JSX unchanged */}
            </div>
        </div>
    )
}

export default FileConverter
