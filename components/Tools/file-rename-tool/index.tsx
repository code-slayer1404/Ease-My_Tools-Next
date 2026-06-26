"use client"

import React, { useState, useRef, useCallback } from "react"
import styles from "./styles.module.css"

const t = (key: string, fallback?: string) => fallback ?? key

type RenameStatus = "pending" | "modified" | "renamed"

type FileItem = {
    id: number
    originalName: string
    newName: string
    file: File
    extension: string
    nameWithoutExtension: string
    size: number
    type: string
    lastModified: number
    status: RenameStatus
}

type RenameHistoryItem = {
    id: number
    timestamp: string
    files: { original: string; new: string }[]
}

const FileRenameTool = () => {
    const [files, setFiles] = useState<FileItem[]>([])
    const [originalFiles, setOriginalFiles] = useState<FileItem[]>([])
    const [processing, setProcessing] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [renameHistory, setRenameHistory] = useState<RenameHistoryItem[]>([])

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const [namingStrategy, setNamingStrategy] = useState({
        method: "sequential",
        baseName: "file",
        startNumber: 1,
        padding: 3,
        customPattern: "[name]_[counter]",
        case: "original",
        separator: "_",
    })

    const [advancedOptions, setAdvancedOptions] = useState({
        removeSpaces: false,
        replaceSpacesWith: "_",
        removeSpecialChars: false,
        allowedChars: "a-zA-Z0-9-_ .",
        addPrefix: "",
        addSuffix: "",
        preserveExtension: true,
        dateFormat: "YYYY-MM-DD",
        addTimestamp: false,
    })

    const handleFileUpload = useCallback((uploadedFiles: FileList | null) => {
        if (!uploadedFiles || uploadedFiles.length === 0) return

        const validFiles = Array.from(uploadedFiles).filter(
            (file: File) => file.size <= 100 * 1024 * 1024
        )

        if (validFiles.length === 0) {
            alert(t("fileTooLarge"))
            return
        }

        const fileObjects: FileItem[] = validFiles.map((file, index) => ({
            id: index + 1,
            originalName: file.name,
            newName: file.name,
            file: file,
            extension: file.name.split(".").pop() || "",
            nameWithoutExtension: file.name.replace(/\.[^/.]+$/, ""),
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            status: "pending",
        }))

        setFiles(fileObjects)
        setOriginalFiles([...fileObjects])
        generatePreview(fileObjects)
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            handleFileUpload(e.dataTransfer.files)
        },
        [handleFileUpload]
    )

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }, [])

    const generateNewNames = useCallback(
        (fileList: FileItem[]): FileItem[] => {
            return fileList.map((file, index) => {
                let newName = ""
                const counter = (namingStrategy.startNumber + index)
                    .toString()
                    .padStart(namingStrategy.padding, "0")

                switch (namingStrategy.method) {
                    case "sequential":
                        newName = `${namingStrategy.baseName}${namingStrategy.separator}${counter}`
                        break

                    case "custom":
                        newName = namingStrategy.customPattern
                            .replace("[name]", file.nameWithoutExtension)
                            .replace("[counter]", counter)
                            .replace(
                                "[date]",
                                new Date().toISOString().split("T")[0] ?? ""
                            )
                            .replace("[timestamp]", Date.now().toString())
                        break

                    case "pattern":
                        newName = file.nameWithoutExtension
                        break

                    case "metadata":
                        newName = `${namingStrategy.baseName}_${counter}`
                        break

                    default:
                        newName = file.nameWithoutExtension
                }

                switch (namingStrategy.case) {
                    case "lowercase":
                        newName = newName.toLowerCase()
                        break
                    case "uppercase":
                        newName = newName.toUpperCase()
                        break
                    case "titlecase":
                        newName = newName.replace(
                            /\w\S*/g,
                            (txt) =>
                                txt.charAt(0).toUpperCase() +
                                txt.substring(1).toLowerCase()
                        )
                        break
                }

                if (advancedOptions.removeSpaces) {
                    newName = newName.replace(
                        /\s+/g,
                        advancedOptions.replaceSpacesWith
                    )
                }

                if (advancedOptions.removeSpecialChars) {
                    const regex = new RegExp(
                        `[^${advancedOptions.allowedChars}]`,
                        "g"
                    )
                    newName = newName.replace(regex, "")
                }

                if (advancedOptions.addPrefix) {
                    newName = advancedOptions.addPrefix + newName
                }

                if (advancedOptions.addSuffix) {
                    newName = newName + advancedOptions.addSuffix
                }

                if (advancedOptions.addTimestamp) {
                    newName = `${newName}_${Date.now()}`
                }

                if (advancedOptions.preserveExtension && file.extension) {
                    newName += `.${file.extension}`
                }

                return {
                    ...file,
                    newName,
                    status: (newName !== file.originalName
                        ? "modified"
                        : "pending") as RenameStatus,
                }
            })
        },
        [namingStrategy, advancedOptions]
    )

    const generatePreview = useCallback(
        (fileList: FileItem[] = files) => {
            const updatedFiles = generateNewNames(fileList)
            setFiles(updatedFiles)
            setPreviewMode(true)
        },
        [files, generateNewNames]
    )

    const applyRenaming = async () => {
        if (files.length === 0) return

        setProcessing(true)

        try {
            const renamedFiles = files.map((file) => ({
                ...file,
                status: "renamed" as RenameStatus,
            }))

            setRenameHistory((prev) => [
                {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    files: renamedFiles.map((f) => ({
                        original: f.originalName,
                        new: f.newName,
                    })),
                },
                ...prev,
            ])

            setFiles(renamedFiles)
            await createDownloadPackage(renamedFiles)
        } catch (error) {
            console.error("Renaming error:", error)
            alert(t("renameError"))
        } finally {
            setProcessing(false)
        }
    }

    const createDownloadPackage = async (renamedFiles: FileItem[]) => {
        const renameData = {
            timestamp: new Date().toISOString(),
            totalFiles: renamedFiles.length,
            operations: renamedFiles.map((file) => ({
                originalName: file.originalName,
                newName: file.newName,
                status: file.status,
            })),
        }

        console.log("Renaming operations:", renameData)
        alert(t("renameComplete"))
    }

    const downloadReport = () => {
        const report = {
            renameSession: {
                timestamp: new Date().toISOString(),
                strategy: namingStrategy,
                options: advancedOptions,
                files: files.map((f) => ({
                    original: f.originalName,
                    new: f.newName,
                    status: f.status,
                })),
            },
        }

        const dataStr = JSON.stringify(report, null, 2)
        const blob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `rename-report-${Date.now()}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    const resetNames = () => {
        setFiles([...originalFiles])
        setPreviewMode(false)
    }

    const clearAll = () => {
        setFiles([])
        setOriginalFiles([])
        setPreviewMode(false)
        setRenameHistory([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const updateFileName = (fileId: number, newName: string) => {
        setFiles((prev) =>
            prev.map((file) =>
                file.id === fileId
                    ? {
                          ...file,
                          newName,
                          status:
                              newName !== file.originalName
                                  ? "modified"
                                  : "pending",
                      }
                    : file
            )
        )
    }

    const sortFiles = (criteria: string) => {
        const sorted = [...files].sort((a, b) => {
            if (criteria === "name")
                return a.originalName.localeCompare(b.originalName)
            if (criteria === "size") return a.size - b.size
            if (criteria === "date") return a.lastModified - b.lastModified
            if (criteria === "type") return a.type.localeCompare(b.type)
            return 0
        })
        setFiles(sorted)
    }

    const filterFiles = (fileType: string) => {
        if (fileType === "all") setFiles([...originalFiles])
        else {
            const filtered = originalFiles.filter(
                (file) =>
                    file.type.startsWith(fileType) ||
                    file.extension === fileType
            )
            setFiles(filtered)
        }
    }

    const statusCounts = files.reduce<Record<string, number>>((acc, file) => {
        acc[file.status] = (acc[file.status] || 0) + 1
        return acc
    }, {})

    return (
        <div className={styles["file-rename-tool"]}>
            <div className={styles["rename-container"]}>
                {/* Upload Section */}
                <div className={styles["upload-section"]}>
                    <div
                        className={styles["upload-area"]}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {files.length === 0 ? (
                            <div className={styles["upload-content"]}>
                                <div className={styles["upload-icon"]}>📁</div>
                                <h3>{t("uploadArea")}</h3>
                                <p>{t("dragDrop")}</p>
                                <small>{t("supportedFiles")}</small>
                                <small>{t("maxSize")}</small>
                            </div>
                        ) : (
                            <div className={styles["files-summary"]}>
                                <div className={styles["summary-icon"]}>📁</div>
                                <div className={styles["summary-info"]}>
                                    <strong>
                                        {files.length} {t("filesSelected")}
                                    </strong>
                                    <div className={styles["file-stats"]}>
                                        <span>
                                            📝 {statusCounts.modified || 0}{" "}
                                            {t("modified")}
                                        </span>
                                        <span>
                                            ⏳ {statusCounts.pending || 0}{" "}
                                            {t("pending")}
                                        </span>
                                        <span>
                                            ✅ {statusCounts.renamed || 0}{" "}
                                            {t("renamed")}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className={styles["clear-btn"]}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        clearAll()
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={(e) => handleFileUpload(e.target.files)}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>

                {/* File Actions */}
                {files.length > 0 && (
                    <div className={styles["file-actions-section"]}>
                        <div className={styles["action-buttons"]}>
                            <button
                                className={`${styles["btn"]} ${styles["secondary"]}`}
                                onClick={() => sortFiles("name")}
                            >
                                🔤 {t("sortByName")}
                            </button>
                            <button
                                className={`${styles["btn"]} ${styles["secondary"]}`}
                                onClick={() => sortFiles("size")}
                            >
                                📊 {t("sortBySize")}
                            </button>
                            <button
                                className={`${styles["btn"]} ${styles["secondary"]}`}
                                onClick={() => sortFiles("date")}
                            >
                                📅 {t("sortByDate")}
                            </button>

                            <select
                                className={styles["filter-select"]}
                                onChange={(e) => filterFiles(e.target.value)}
                                defaultValue="all"
                            >
                                <option value="all">📁 {t("allFiles")}</option>
                                <option value="image">🖼️ {t("images")}</option>
                                <option value="video">🎥 {t("videos")}</option>
                                <option value="audio">🎵 {t("audio")}</option>
                                <option value="pdf">📄 PDF</option>
                                <option value="document">
                                    📝 {t("documents")}
                                </option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Naming Strategy Section */}
                {files.length > 0 && (
                    <div className={styles["strategy-section"]}>
                        <h3>{t("namingStrategy")}</h3>

                        <div className={styles["strategy-grid"]}>
                            {/* Method Selection */}
                            <div className={styles["strategy-group"]}>
                                <label>{t("renameMethod")}</label>
                                <div className={styles["method-options"]}>
                                    {[
                                        {
                                            value: "sequential",
                                            label: t("sequential"),
                                            icon: "🔢",
                                            description: t("sequentialDesc"),
                                        },
                                        {
                                            value: "custom",
                                            label: t("customPattern"),
                                            icon: "🎨",
                                            description: t("customDesc"),
                                        },
                                        {
                                            value: "pattern",
                                            label: t("keepPattern"),
                                            icon: "📝",
                                            description: t("patternDesc"),
                                        },
                                        {
                                            value: "metadata",
                                            label: t("metadata"),
                                            icon: "🏷️",
                                            description: t("metadataDesc"),
                                        },
                                    ].map((method) => (
                                        <div
                                            key={method.value}
                                            className={`${styles["method-option"]} ${namingStrategy.method === method.value ? styles["active"] : ""}`}
                                            onClick={() =>
                                                setNamingStrategy((prev) => ({
                                                    ...prev,
                                                    method: method.value,
                                                }))
                                            }
                                        >
                                            <span
                                                className={
                                                    styles["method-icon"]
                                                }
                                            >
                                                {method.icon}
                                            </span>
                                            <div
                                                className={
                                                    styles["method-info"]
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles["method-label"]
                                                    }
                                                >
                                                    {method.label}
                                                </span>
                                                <span
                                                    className={
                                                        styles[
                                                            "method-description"
                                                        ]
                                                    }
                                                >
                                                    {method.description}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Method-specific settings */}
                            {namingStrategy.method === "sequential" && (
                                <div className={styles["method-settings"]}>
                                    <div className={styles["setting-row"]}>
                                        <label>{t("baseName")}</label>
                                        <input
                                            type="text"
                                            value={namingStrategy.baseName}
                                            onChange={(e) =>
                                                setNamingStrategy((prev) => ({
                                                    ...prev,
                                                    baseName: e.target.value,
                                                }))
                                            }
                                            placeholder={t(
                                                "baseNamePlaceholder"
                                            )}
                                        />
                                    </div>
                                    <div className={styles["setting-row"]}>
                                        <label>{t("startNumber")}</label>
                                        <input
                                            type="number"
                                            value={namingStrategy.startNumber}
                                            onChange={(e) =>
                                                setNamingStrategy((prev) => ({
                                                    ...prev,
                                                    startNumber: parseInt(
                                                        e.target.value
                                                    ),
                                                }))
                                            }
                                            min="1"
                                        />
                                    </div>
                                    <div className={styles["setting-row"]}>
                                        <label>{t("numberPadding")}</label>
                                        <input
                                            type="number"
                                            value={namingStrategy.padding}
                                            onChange={(e) =>
                                                setNamingStrategy((prev) => ({
                                                    ...prev,
                                                    padding: parseInt(
                                                        e.target.value
                                                    ),
                                                }))
                                            }
                                            min="1"
                                            max="6"
                                        />
                                    </div>
                                </div>
                            )}

                            {namingStrategy.method === "custom" && (
                                <div className={styles["method-settings"]}>
                                    <div className={styles["setting-row"]}>
                                        <label>{t("customPattern")}</label>
                                        <input
                                            type="text"
                                            value={namingStrategy.customPattern}
                                            onChange={(e) =>
                                                setNamingStrategy((prev) => ({
                                                    ...prev,
                                                    customPattern:
                                                        e.target.value,
                                                }))
                                            }
                                            placeholder="[name]_[counter]_[date]"
                                        />
                                    </div>
                                    <div className={styles["pattern-help"]}>
                                        <small>
                                            {t("patternHelp")}: [name],
                                            [counter], [date], [timestamp]
                                        </small>
                                    </div>
                                </div>
                            )}

                            {/* Case Transformation */}
                            <div className={styles["strategy-group"]}>
                                <label>{t("caseTransformation")}</label>
                                <div className={styles["case-options"]}>
                                    {[
                                        {
                                            value: "original",
                                            label: t("originalCase"),
                                        },
                                        {
                                            value: "lowercase",
                                            label: t("lowercase"),
                                        },
                                        {
                                            value: "uppercase",
                                            label: t("uppercase"),
                                        },
                                        {
                                            value: "titlecase",
                                            label: t("titleCase"),
                                        },
                                    ].map((caseOption) => (
                                        <button
                                            key={caseOption.value}
                                            className={`${styles["case-btn"]} ${namingStrategy.case === caseOption.value ? styles["active"] : ""}`}
                                            onClick={() =>
                                                setNamingStrategy((prev) => ({
                                                    ...prev,
                                                    case: caseOption.value,
                                                }))
                                            }
                                        >
                                            {caseOption.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Advanced Options */}
                        <div className={styles["advanced-section"]}>
                            <h4>{t("advancedOptions")}</h4>
                            <div className={styles["advanced-grid"]}>
                                <div className={styles["advanced-option"]}>
                                    <label className={styles["checkbox-label"]}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                advancedOptions.removeSpaces
                                            }
                                            onChange={(e) =>
                                                setAdvancedOptions((prev) => ({
                                                    ...prev,
                                                    removeSpaces:
                                                        e.target.checked,
                                                }))
                                            }
                                        />
                                        <span
                                            className={styles["checkmark"]}
                                        ></span>
                                        {t("removeSpaces")}
                                    </label>
                                    {advancedOptions.removeSpaces && (
                                        <select
                                            value={
                                                advancedOptions.replaceSpacesWith
                                            }
                                            onChange={(e) =>
                                                setAdvancedOptions((prev) => ({
                                                    ...prev,
                                                    replaceSpacesWith:
                                                        e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="_">
                                                Underscore (_)
                                            </option>
                                            <option value="-">
                                                Hyphen (-)
                                            </option>
                                            <option value="">
                                                Remove completely
                                            </option>
                                        </select>
                                    )}
                                </div>

                                <div className={styles["advanced-option"]}>
                                    <label className={styles["checkbox-label"]}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                advancedOptions.removeSpecialChars
                                            }
                                            onChange={(e) =>
                                                setAdvancedOptions((prev) => ({
                                                    ...prev,
                                                    removeSpecialChars:
                                                        e.target.checked,
                                                }))
                                            }
                                        />
                                        <span
                                            className={styles["checkmark"]}
                                        ></span>
                                        {t("removeSpecialChars")}
                                    </label>
                                </div>

                                <div className={styles["advanced-option"]}>
                                    <label>{t("addPrefix")}</label>
                                    <input
                                        type="text"
                                        value={advancedOptions.addPrefix}
                                        onChange={(e) =>
                                            setAdvancedOptions((prev) => ({
                                                ...prev,
                                                addPrefix: e.target.value,
                                            }))
                                        }
                                        placeholder={t("prefixPlaceholder")}
                                    />
                                </div>

                                <div className={styles["advanced-option"]}>
                                    <label>{t("addSuffix")}</label>
                                    <input
                                        type="text"
                                        value={advancedOptions.addSuffix}
                                        onChange={(e) =>
                                            setAdvancedOptions((prev) => ({
                                                ...prev,
                                                addSuffix: e.target.value,
                                            }))
                                        }
                                        placeholder={t("suffixPlaceholder")}
                                    />
                                </div>

                                <div className={styles["advanced-option"]}>
                                    <label className={styles["checkbox-label"]}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                advancedOptions.preserveExtension
                                            }
                                            onChange={(e) =>
                                                setAdvancedOptions((prev) => ({
                                                    ...prev,
                                                    preserveExtension:
                                                        e.target.checked,
                                                }))
                                            }
                                        />
                                        <span
                                            className={styles["checkmark"]}
                                        ></span>
                                        {t("preserveExtension")}
                                    </label>
                                </div>

                                <div className={styles["advanced-option"]}>
                                    <label className={styles["checkbox-label"]}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                advancedOptions.addTimestamp
                                            }
                                            onChange={(e) =>
                                                setAdvancedOptions((prev) => ({
                                                    ...prev,
                                                    addTimestamp:
                                                        e.target.checked,
                                                }))
                                            }
                                        />
                                        <span
                                            className={styles["checkmark"]}
                                        ></span>
                                        {t("addTimestamp")}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Preview & Apply Buttons */}
                        <div className={styles["action-section"]}>
                            <button
                                className={`${styles["btn"]} ${styles["primary"]} ${styles["preview-btn"]}`}
                                onClick={() => generatePreview()}
                                disabled={processing}
                            >
                                👁️ {t("previewChanges")}
                            </button>

                            {previewMode && (
                                <button
                                    className={`${styles["btn"]} ${styles["success"]} ${styles["apply-btn"]}`}
                                    onClick={applyRenaming}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <span
                                                className={styles["spinner"]}
                                            ></span>
                                            {t("applying")}...
                                        </>
                                    ) : (
                                        `✅ ${t("applyRenaming")}`
                                    )}
                                </button>
                            )}

                            <button
                                className={`${styles["btn"]} ${styles["outline"]} ${styles["reset-btn"]}`}
                                onClick={resetNames}
                                disabled={processing}
                            >
                                🔄 {t("reset")}
                            </button>
                        </div>
                    </div>
                )}

                {/* Files Preview */}
                {files.length > 0 && previewMode && (
                    <div className={styles["files-preview-section"]}>
                        <div className={styles["preview-header"]}>
                            <h3>
                                {t("preview")} ({files.length} {t("files")})
                            </h3>
                            <div className={styles["preview-actions"]}>
                                <button
                                    className={`${styles["btn"]} ${styles["outline"]}`}
                                    onClick={downloadReport}
                                >
                                    📊 {t("downloadReport")}
                                </button>
                            </div>
                        </div>

                        <div className={styles["files-list"]}>
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className={`${styles["file-item"]} ${file.status}`}
                                >
                                    <div className={styles["file-icon"]}>
                                        {file.type.startsWith("image")
                                            ? "🖼️"
                                            : file.type.startsWith("video")
                                              ? "🎥"
                                              : file.type.startsWith("audio")
                                                ? "🎵"
                                                : file.type.includes("pdf")
                                                  ? "📄"
                                                  : file.type.includes(
                                                          "document"
                                                      )
                                                    ? "📝"
                                                    : "📁"}
                                    </div>

                                    <div className={styles["file-names"]}>
                                        <div
                                            className={styles["original-name"]}
                                        >
                                            <span
                                                className={styles["name-label"]}
                                            >
                                                {t("original")}:
                                            </span>
                                            <span
                                                className={styles["name-value"]}
                                            >
                                                {file.originalName}
                                            </span>
                                        </div>
                                        <div className={styles["new-name"]}>
                                            <span
                                                className={styles["name-label"]}
                                            >
                                                {t("new")}:
                                            </span>
                                            <input
                                                type="text"
                                                value={file.newName}
                                                onChange={(e) =>
                                                    updateFileName(
                                                        file.id,
                                                        e.target.value
                                                    )
                                                }
                                                className={styles["name-input"]}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles["file-info"]}>
                                        <span className={styles["file-size"]}>
                                            {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                        <span
                                            className={`${styles["file-status"]} ${file.status}`}
                                        >
                                            {file.status === "modified" && "✏️"}
                                            {file.status === "pending" && "⏳"}
                                            {file.status === "renamed" && "✅"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* History Section */}
                {renameHistory.length > 0 && (
                    <div className={styles["history-section"]}>
                        <h3>{t("renameHistory")}</h3>
                        <div className={styles["history-list"]}>
                            {renameHistory.slice(0, 5).map((record) => (
                                <div
                                    key={record.id}
                                    className={styles["history-item"]}
                                >
                                    <div className={styles["history-header"]}>
                                        <span
                                            className={styles["history-time"]}
                                        >
                                            {new Date(
                                                record.timestamp
                                            ).toLocaleString()}
                                        </span>
                                        <span
                                            className={styles["history-count"]}
                                        >
                                            {record.files.length} {t("files")}
                                        </span>
                                    </div>
                                    <div className={styles["history-preview"]}>
                                        {record.files
                                            .slice(0, 3)
                                            .map((file, idx) => (
                                                <div
                                                    key={idx}
                                                    className={
                                                        styles["history-file"]
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles["original"]
                                                        }
                                                    >
                                                        {'"'}
                                                        {file.original}
                                                        {'"'}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles["arrow"]
                                                        }
                                                    >
                                                        →
                                                    </span>
                                                    <span
                                                        className={
                                                            styles["new"]
                                                        }
                                                    >
                                                        {'"'}
                                                        {file.new}
                                                        {'"'}
                                                    </span>
                                                </div>
                                            ))}
                                        {record.files.length > 3 && (
                                            <div
                                                className={
                                                    styles["history-more"]
                                                }
                                            >
                                                +{record.files.length - 3} more
                                                files
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tips Section */}
                <div className={styles["tips-section"]}>
                    <h3>💡 {t("professionalTips")}</h3>
                    <div className={styles["tips-grid"]}>
                        <div className={styles["tip-card"]}>
                            <div className={styles["tip-icon"]}>📁</div>
                            <div className={styles["tip-content"]}>
                                <h4>{t("tip1Title")}</h4>
                                <p>{t("tip1Description")}</p>
                            </div>
                        </div>
                        <div className={styles["tip-card"]}>
                            <div className={styles["tip-icon"]}>🔢</div>
                            <div className={styles["tip-content"]}>
                                <h4>{t("tip2Title")}</h4>
                                <p>{t("tip2Description")}</p>
                            </div>
                        </div>
                        <div className={styles["tip-card"]}>
                            <div className={styles["tip-icon"]}>🎯</div>
                            <div className={styles["tip-content"]}>
                                <h4>{t("tip3Title")}</h4>
                                <p>{t("tip3Description")}</p>
                            </div>
                        </div>
                        <div className={styles["tip-card"]}>
                            <div className={styles["tip-icon"]}>💾</div>
                            <div className={styles["tip-content"]}>
                                <h4>{t("tip4Title")}</h4>
                                <p>{t("tip4Description")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FileRenameTool
