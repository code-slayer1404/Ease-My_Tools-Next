"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/CSVtoJSON.css';

const CSVtoJSON = () => {
    const { theme } = useTheme();
    const [csvInput, setCsvInput] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [delimiter, setDelimiter] = useState(',');
    const [hasHeaders, setHasHeaders] = useState(true);

    const convertCSVtoJSON = () => {
        if (!csvInput.trim()) {
            alert("Please enter CSV data" || 'Please enter CSV data');
            return;
        }

        try {
            const lines = csvInput.trim().split('\n');
            const result = [];
            
            let headers = [];
            if (hasHeaders) {
                headers = lines[0].split(delimiter).map(header => header.trim());
            } else {
                // Generate headers like col1, col2, col3...
                headers = lines[0].split(delimiter).map((_, index) => `col${index + 1}`);
            }

            const startLine = hasHeaders ? 1 : 0;
            
            for (let i = startLine; i < lines.length; i++) {
                const currentLine = lines[i].trim();
                if (!currentLine) continue;

                const values = currentLine.split(delimiter);
                const obj = {};
                
                headers.forEach((header, index) => {
                    let value = values[index] ? values[index].trim() : '';
                    
                    // Try to parse numbers and booleans
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
        } catch (error) {
            alert("Error converting CSV to JSON" || 'Error converting CSV to JSON: ' + error.message);
        }
    };

    const convertJSONtoCSV = () => {
        if (!jsonOutput.trim()) {
            alert("Please enter JSON data" || 'Please enter JSON data');
            return;
        }

        try {
            const data = JSON.parse(jsonOutput);
            if (!Array.isArray(data)) {
                alert("JSON must be an array of objects" || 'JSON must be an array of objects');
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

            data.forEach(row => {
                const values = headers.map(header => {
                    let value = row[header];
                    if (value === null || value === undefined) {
                        value = '';
                    } else if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    } else {
                        value = String(value);
                    }
                    
                    // Handle values containing delimiter or newlines
                    if (value.includes(delimiter) || value.includes('\n') || value.includes('"')) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    
                    return value;
                });
                
                csv += values.join(delimiter) + '\n';
            });

            setCsvInput(csv.trim());
        } catch (error) {
            alert("Invalid JSON" || 'Invalid JSON: ' + error.message);
        }
    };

    const clearAll = () => {
        setCsvInput('');
        setJsonOutput('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!" || 'Copied to clipboard!');
    };

    const downloadFile = (content, filename, contentType) => {
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
        <div className={`csv-json-converter ${theme}`}>
            <div className="converter-header">
                <h1>{"CSV to JSON Converter" || 'CSV to JSON Converter'}</h1>
                <p>{"Convert between CSV and JSON formats" || 'Convert between CSV and JSON formats'}</p>
            </div>

            <div className="converter-container">
                <div className="settings-panel">
                    <div className="setting">
                        <label>{"Delimiter" || 'Delimiter'}</label>
                        <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
                            <option value=",">, {"Comma" || 'Comma'}</option>
                            <option value=";">; {"Semicolon" || 'Semicolon'}</option>
                            <option value="\t">\t {"Tab" || 'Tab'}</option>
                            <option value="|">| {"Pipe" || 'Pipe'}</option>
                        </select>
                    </div>
                    <div className="setting">
                        <label>
                            <input
                                type="checkbox"
                                checked={hasHeaders}
                                onChange={(e) => setHasHeaders(e.target.checked)}
                            />
                            {"First row contains headers" || 'First row contains headers'}
                        </label>
                    </div>
                </div>

                <div className="input-output-section">
                    <div className="input-section">
                        <label>{"CSV Input" || 'CSV Input'}</label>
                        <textarea
                            value={csvInput}
                            onChange={(e) => setCsvInput(e.target.value)}
                            placeholder={"Paste your CSV data here..." || 'Paste your CSV data here...'}
                            className="text-input"
                            rows="8"
                        />
                        <div className="input-actions">
                            <button onClick={downloadCSV} className="download-btn" disabled={!csvInput}>
                                {"Download CSV" || 'Download CSV'}
                            </button>
                            <button onClick={() => copyToClipboard(csvInput)} className="copy-btn" disabled={!csvInput}>
                                {"Copy CSV" || 'Copy CSV'}
                            </button>
                        </div>
                    </div>

                    <div className="conversion-buttons">
                        <button onClick={convertCSVtoJSON} className="convert-btn">
                            {"CSV → JSON" || 'CSV → JSON'}
                        </button>
                        <button onClick={convertJSONtoCSV} className="convert-btn">
                            {"JSON → CSV" || 'JSON → CSV'}
                        </button>
                    </div>

                    <div className="output-section">
                        <label>{"JSON Output" || 'JSON Output'}</label>
                        <textarea
                            value={jsonOutput}
                            onChange={(e) => setJsonOutput(e.target.value)}
                            placeholder={"JSON output will appear here..." || 'JSON output will appear here...'}
                            className="text-output"
                            rows="8"
                        />
                        <div className="output-actions">
                            <button onClick={downloadJSON} className="download-btn" disabled={!jsonOutput}>
                                {"Download JSON" || 'Download JSON'}
                            </button>
                            <button onClick={() => copyToClipboard(jsonOutput)} className="copy-btn" disabled={!jsonOutput}>
                                {"Copy JSON" || 'Copy JSON'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <button onClick={clearAll} className="clear-btn">
                        {"Clear All" || 'Clear All'}
                    </button>
                </div>

                <div className="info-section">
                    <h4>{"About CSV and JSON" || 'About CSV and JSON'}</h4>
                    <p><strong>CSV</strong> {"(Comma-Separated Values) is a simple file format used to store tabular data." || '(Comma-Separated Values) is a simple file format used to store tabular data.'}</p>
                    <p><strong>JSON</strong> {"(JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write." || '(JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write.'}</p>
                    
                    <h5>{"Common Uses:" || 'Common Uses:'}</h5>
                    <ul>
                        <li>{"Data migration between systems" || 'Data migration between systems'}</li>
                        <li>{"Exporting data from databases" || 'Exporting data from databases'}</li>
                        <li>{"API data formatting" || 'API data formatting'}</li>
                        <li>{"Spreadsheet data processing" || 'Spreadsheet data processing'}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CSVtoJSON;



// import React, { useState, useRef } from 'react';
// 
// import { useTheme } from '../../contexts/ThemeContext';
// import '../../styles/tools/CsvToJson.css';

// const CsvToJson = () => {
//     const { t } = useTranslation('csvToJson');
//     const { theme } = useTheme();
//     const [csvInput, setCsvInput] = useState('');
//     const [jsonOutput, setJsonOutput] = useState('');
//     const [delimiter, setDelimiter] = useState(',');
//     const [firstRowHeader, setFirstRowHeader] = useState(true);
//     const [conversionInfo, setConversionInfo] = useState(null);
//     const [isDragging, setIsDragging] = useState(false);
//     const fileInputRef = useRef(null);

//     const delimiters = {
//         ',': "Comma",
//         ';': "Semicolon",
//         '\t': "Tab",
//         '|': "Pipe"
//     };

//     const parseCSV = (text) => {
//         const lines = text.split('\n').filter(line => line.trim() !== '');
//         if (lines.length === 0) return [];

//         const headers = firstRowHeader 
//             ? lines[0].split(delimiter).map(header => header.trim())
//             : lines[0].split(delimiter).map((_, index) => `column${index + 1}`);

//         const startIndex = firstRowHeader ? 1 : 0;
//         const result = [];

//         for (let i = startIndex; i < lines.length; i++) {
//             const currentLine = lines[i];
//             const values = currentLine.split(delimiter);
//             const obj = {};

//             headers.forEach((header, index) => {
//                 obj[header] = values[index] ? values[index].trim() : '';
//             });

//             result.push(obj);
//         }

//         setConversionInfo({
//             rowsConverted: result.length,
//             columnsDetected: headers.length,
//             headers: headers
//         });

//         return result;
//     };

//     const convertToJson = () => {
//         try {
//             if (!csvInput.trim()) {
//                 alert('Please enter CSV data or upload a file');
//                 return;
//             }

//             const jsonData = parseCSV(csvInput);
//             setJsonOutput(JSON.stringify(jsonData, null, 2));
//         } catch (error) {
//             alert('Error converting CSV to JSON: ' + error.message);
//         }
//     };

//     const handleFileUpload = (file) => {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             setCsvInput(e.target.result);
//         };
//         reader.readAsText(file);
//     };

//     const handleFileSelect = (event) => {
//         const file = event.target.files[0];
//         if (file && file.type === 'text/csv') {
//             handleFileUpload(file);
//         } else {
//             alert('Please select a valid CSV file');
//         }
//     };

//     const handleDragOver = (e) => {
//         e.preventDefault();
//         setIsDragging(true);
//     };

//     const handleDragLeave = (e) => {
//         e.preventDefault();
//         setIsDragging(false);
//     };

//     const handleDrop = (e) => {
//         e.preventDefault();
//         setIsDragging(false);
//         const file = e.dataTransfer.files[0];
//         if (file && file.type === 'text/csv') {
//             handleFileUpload(file);
//         } else {
//             alert('Please drop a valid CSV file');
//         }
//     };

//     const clearAll = () => {
//         setCsvInput('');
//         setJsonOutput('');
//         setConversionInfo(null);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     const copyJson = () => {
//         navigator.clipboard.writeText(jsonOutput);
//         alert('JSON copied to clipboard!');
//     };

//     const downloadJson = () => {
//         const blob = new Blob([jsonOutput], { type: 'application/json' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'converted.json';
//         a.click();
//         URL.revokeObjectURL(url);
//     };

//     return (
//         <div className={`csv-to-json ${theme}`}>
//             <div className="tool-header">
//                 <h1>{"CSV to JSON Converter"}</h1>
//                 <p>{"Convert between CSV and JSON formats"}</p>
//             </div>

//             <div className="converter-container">
//                 <div className="input-section">
//                     <div className="upload-section">
//                         <div 
//                             className={`drop-zone ${isDragging ? 'dragging' : ''}`}
//                             onDragOver={handleDragOver}
//                             onDragLeave={handleDragLeave}
//                             onDrop={handleDrop}
//                         >
//                             <input
//                                 ref={fileInputRef}
//                                 type="file"
//                                 accept=".csv"
//                                 onChange={handleFileSelect}
//                                 className="file-input"
//                             />
//                             <div className="upload-text">
//                                 <span className="upload-icon">📁</span>
//                                 <span>{t('uploadCsv')}</span>
//                                 <span className="drag-text">{t('dragDrop')}</span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="csv-input-section">
//                         <label>{"CSV Input"}</label>
//                         <textarea
//                             value={csvInput}
//                             onChange={(e) => setCsvInput(e.target.value)}
//                             placeholder={"Paste your CSV data here..."}
//                             rows="8"
//                         />
//                     </div>
//                 </div>

//                 <div className="settings-section">
//                     <div className="setting-group">
//                         <label>{"Delimiter"}</label>
//                         <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
//                             {Object.entries(delimiters).map(([value, label]) => (
//                                 <option key={value} value={value}>{label}</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="setting-group">
//                         <label className="checkbox-label">
//                             <input
//                                 type="checkbox"
//                                 checked={firstRowHeader}
//                                 onChange={(e) => setFirstRowHeader(e.target.checked)}
//                             />
//                             {t('firstRowHeader')}
//                         </label>
//                     </div>
//                 </div>

//                 <div className="action-buttons">
//                     <button onClick={convertToJson} className="primary-btn">
//                         {t('convert')}
//                     </button>
//                     <button onClick={clearAll} className="secondary-btn">
//                         {t('clear')}
//                     </button>
//                 </div>

//                 {conversionInfo && (
//                     <div className="conversion-info">
//                         <h3>{t('conversionInfo')}</h3>
//                         <div className="info-grid">
//                             <div className="info-item">
//                                 <span className="info-label">{t('rowsConverted')}:</span>
//                                 <span className="info-value">{conversionInfo.rowsConverted}</span>
//                             </div>
//                             <div className="info-item">
//                                 <span className="info-label">{t('columnsDetected')}:</span>
//                                 <span className="info-value">{conversionInfo.columnsDetected}</span>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {jsonOutput && (
//                     <div className="output-section">
//                         <div className="output-header">
//                             <h3>{"JSON Output"}</h3>
//                             <div className="output-actions">
//                                 <button onClick={copyJson} className="copy-btn">
//                                     {t('copyJson')}
//                                 </button>
//                                 <button onClick={downloadJson} className="download-btn">
//                                     {t('downloadJson')}
//                                 </button>
//                             </div>
//                         </div>
//                         <pre className="json-output">{jsonOutput}</pre>
//                     </div>
//                 )}

//                 <div className="csv-tips">
//                     <h4>{t('csvTips')}</h4>
//                     <ul>
//                         <li>{t('tip1')}</li>
//                         <li>{t('tip2')}</li>
//                         <li>{t('tip3')}</li>
//                         <li>{t('tip4')}</li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CsvToJson;