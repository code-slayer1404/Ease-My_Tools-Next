"use client";

import React, { useState } from 'react';
import styles from './styles.module.css';

const CSVtoJSON = () => {
    const [csvInput, setCsvInput] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [delimiter, setDelimiter] = useState(',');
    const [hasHeaders, setHasHeaders] = useState(true);

    const convertCSVtoJSON = () => {
        if (!csvInput.trim()) {
            alert("Please enter CSV data");
            return;
        }

        try {
            const lines = csvInput.trim().split('\n');
            const result: Record<string, any>[] = [];

            let headers: string[] = [];

            if (hasHeaders) {
                headers = lines[0].split(delimiter).map(header => header.trim());
            } else {
                headers = lines[0].split(delimiter).map((_, index) => `col${index + 1}`);
            }

            const startLine = hasHeaders ? 1 : 0;

            for (let i = startLine; i < lines.length; i++) {
                const currentLine = lines[i].trim();
                if (!currentLine) continue;

                const values = currentLine.split(delimiter);
                const obj: Record<string, any> = {};

                headers.forEach((header, index) => {
                    let value: any = values[index] ? values[index].trim() : '';

                    if (!isNaN(value) && value !== '') {
                        value = Number(value);
                    } else if (value.toLowerCase() === 'true') {
                        value = true;
                    } else if (value.toLowerCase() === 'false') {
                        value = false;
                    } else if (value === 'null') {
                        value = null;
                    }

                    obj[header] = value;
                });

                result.push(obj);
            }

            setJsonOutput(JSON.stringify(result, null, 2));
        } catch (error: unknown) {
            alert("Error converting CSV to JSON: " + (error instanceof Error ? error.message : ""));
        }
    };

    const convertJSONtoCSV = () => {
        if (!jsonOutput.trim()) {
            alert("Please enter JSON data");
            return;
        }

        try {
            const data = JSON.parse(jsonOutput);

            if (!Array.isArray(data)) {
                alert("JSON must be an array of objects");
                return;
            }

            if (data.length === 0) {
                setCsvInput('');
                return;
            }

            const headers = Object.keys(data[0]);
            let csv = '';

            if (hasHeaders) {
                csv += headers.join(delimiter) + '\n';
            }

            data.forEach((row: Record<string, any>) => {
                const values = headers.map(header => {
                    let value = row[header];

                    if (value === null || value === undefined) {
                        value = '';
                    } else if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    } else {
                        value = String(value);
                    }

                    if (value.includes(delimiter) || value.includes('\n') || value.includes('"')) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }

                    return value;
                });

                csv += values.join(delimiter) + '\n';
            });

            setCsvInput(csv.trim());
        } catch (error: unknown) {
            alert("Invalid JSON: " + (error instanceof Error ? error.message : ""));
        }
    };

    const clearAll = () => {
        setCsvInput('');
        setJsonOutput('');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const downloadFile = (content: string, filename: string, contentType: string) => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadCSV = () => {
        if (!csvInput) return;
        downloadFile(csvInput, 'data.csv', 'text/csv');
    };

    const downloadJSON = () => {
        if (!jsonOutput) return;
        downloadFile(jsonOutput, 'data.json', 'application/json');
    };

    return (
        <div className={styles["csv-json-converter"]}>
            <div className={styles["converter-header"]}>
                <h1>{"CSV to JSON Converter"}</h1>
                <p>{"Convert between CSV and JSON formats"}</p>
            </div>

            <div className={styles["converter-container"]}>
                <div className={styles["settings-panel"]}>
                    <div className={styles["setting"]}>
                        <label>{"Delimiter"}</label>
                        <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
                            <option value=",">, {"Comma"}</option>
                            <option value=";">; {"Semicolon"}</option>
                            <option value="\t">\t {"Tab"}</option>
                            <option value="|">| {"Pipe"}</option>
                        </select>
                    </div>

                    <div className={styles["setting"]}>
                        <label>
                            <input
                                type="checkbox"
                                checked={hasHeaders}
                                onChange={(e) => setHasHeaders(e.target.checked)}
                            />
                            {"First row contains headers"}
                        </label>
                    </div>
                </div>

                <div className={styles["input-output-section"]}>
                    <div className={styles["input-section"]}>
                        <label>{"CSV Input"}</label>
                        <textarea
                            value={csvInput}
                            onChange={(e) => setCsvInput(e.target.value)}
                            placeholder={"Paste your CSV data here..."}
                            className={styles["text-input"]}
                            rows={8}
                        />

                        <div className={styles["input-actions"]}>
                            <button onClick={downloadCSV} disabled={!csvInput}>
                                {"Download CSV"}
                            </button>
                            <button onClick={() => copyToClipboard(csvInput)} disabled={!csvInput}>
                                {"Copy CSV"}
                            </button>
                        </div>
                    </div>

                    <div className={styles["conversion-buttons"]}>
                        <button onClick={convertCSVtoJSON}>
                            {"CSV → JSON"}
                        </button>
                        <button onClick={convertJSONtoCSV}>
                            {"JSON → CSV"}
                        </button>
                    </div>

                    <div className={styles["output-section"]}>
                        <label>{"JSON Output"}</label>
                        <textarea
                            value={jsonOutput}
                            onChange={(e) => setJsonOutput(e.target.value)}
                            placeholder={"JSON output will appear here..."}
                            className={styles["text-output"]}
                            rows={8}
                        />

                        <div className={styles["output-actions"]}>
                            <button onClick={downloadJSON} disabled={!jsonOutput}>
                                {"Download JSON"}
                            </button>
                            <button onClick={() => copyToClipboard(jsonOutput)} disabled={!jsonOutput}>
                                {"Copy JSON"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles["action-buttons"]}>
                    <button onClick={clearAll}>
                        {"Clear All"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CSVtoJSON;