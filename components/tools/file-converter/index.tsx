"use client";

import React, { useState, useRef, useCallback } from 'react';
import styles from './styles.module.css';

const FileConverter = () => {

    const [file, setFile] = useState(null);
    const [originalContent, setOriginalContent] = useState('');
    const [convertedContent, setConvertedContent] = useState('');
    const [converting, setConverting] = useState(false);
    const [fileInfo, setFileInfo] = useState({});
    const [conversionSettings, setConversionSettings] = useState({
        targetFormat: 'json',
        csvDelimiter: ',',
        jsonFormat: 'pretty',
        includeHeaders: true,
        sheetName: 'Sheet1'
    });

    // ✅ ONLY FIX HERE
    const fileInputRef = useRef(null);

    const detectFileFormat = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();

        switch (extension) {
            case 'csv': return 'csv';
            case 'xlsx':
            case 'xls': return 'excel';
            case 'json': return 'json';
            default: return null;
        }
    };

    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;

            if (file.type.includes('json') || file.name.endsWith('.json')) {
                reader.readAsText(file, 'UTF-8');
            } else {
                reader.readAsText(file, 'UTF-8');
            }
        });
    };

    const parseCSV = (text, delimiter = ',') => {
        const lines = text.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return { data: [], headers: [] };

        const cleanLines = lines.map(line => line.replace(/\r/g, ''));

        const headers = cleanLines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));

        const data = cleanLines.slice(1).map((line) => {
            const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
            const row = {};
            headers.forEach((header, colIndex) => {
                row[header] = values[colIndex] || '';
            });
            return row;
        }).filter(row => Object.values(row).some(val => val !== ''));

        return { data, headers };
    };

    const convertCSVToJSON = (csvText, delimiter = ',') => {
        try {
            const { data } = parseCSV(csvText, delimiter);
            if (data.length === 0) {
                throw new Error("File is empty");
            }

            return conversionSettings.jsonFormat === 'pretty'
                ? JSON.stringify(data, null, 2)
                : JSON.stringify(data);
        } catch {
            throw new Error("Invalid CSV format");
        }
    };

    const convertJSONToCSV = (jsonText) => {
        let data;
        try {
            data = JSON.parse(jsonText);
        } catch {
            throw new Error("Invalid JSON format");
        }

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Invalid JSON format");
        }

        const headers = Object.keys(data[0]);
        const csvRows = [];

        if (conversionSettings.includeHeaders) {
            csvRows.push(headers.map(header => `"${header}"`).join(conversionSettings.csvDelimiter));
        }

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                const stringValue = value !== null && value !== undefined ? String(value).replace(/"/g, '""') : '';
                return `"${stringValue}"`;
            });
            csvRows.push(values.join(conversionSettings.csvDelimiter));
        });

        return csvRows.join('\n');
    };

    const convertToExcel = async (content, originalFormat) => {
        if (originalFormat === 'json') {
            return convertJSONToCSV(content);
        }
        return content;
    };

    const convertFromExcel = async (content) => {
        return content;
    };

    const performConversion = async () => {
        if (!file) {
            alert("Please select a file first");
            return;
        }

        setConverting(true);
        setConvertedContent('');

        try {
            const content = await readFileContent(file);
            const originalFormat = detectFileFormat(file);
            let result;

            switch (originalFormat) {
                case 'csv':
                    if (conversionSettings.targetFormat === 'json') {
                        result = convertCSVToJSON(content, conversionSettings.csvDelimiter);
                    } else if (conversionSettings.targetFormat === 'excel') {
                        result = await convertToExcel(content, 'csv');
                    }
                    break;

                case 'json':
                    if (conversionSettings.targetFormat === 'csv') {
                        result = convertJSONToCSV(content);
                    } else if (conversionSettings.targetFormat === 'excel') {
                        result = await convertToExcel(content, 'json');
                    }
                    break;

                case 'excel':
                    if (conversionSettings.targetFormat === 'csv') {
                        result = await convertFromExcel(content);
                    } else if (conversionSettings.targetFormat === 'json') {
                        const csv = await convertFromExcel(content);
                        result = convertCSVToJSON(csv, conversionSettings.csvDelimiter);
                    }
                    break;

                default:
                    throw new Error("Invalid file format");
            }

            setConvertedContent(result);
            setConverting(false);

        } catch (error) {
            console.error('Conversion error:', error);
            setConverting(false);
            alert(error.message || "Conversion failed");
        }
    };

    const handleFileUpload = useCallback(async (uploadedFile) => {
        if (!uploadedFile) return;

        if (uploadedFile.size > 10 * 1024 * 1024) {
            alert("File too large (max 10MB)");
            return;
        }

        const format = detectFileFormat(uploadedFile);
        if (!format) {
            alert("Invalid file format");
            return;
        }

        try {
            const content = await readFileContent(uploadedFile);
            setFile(uploadedFile);
            setOriginalContent(content);
            setConvertedContent('');

            const info = {
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: format.toUpperCase(),
                originalFormat: format
            };

            if (format === 'csv') {
                const { data, headers } = parseCSV(content, conversionSettings.csvDelimiter);
                info.rows = data.length;
                info.columns = headers.length;
            } else if (format === 'json') {
                try {
                    const jsonData = JSON.parse(content);
                    if (Array.isArray(jsonData)) {
                        info.rows = jsonData.length;
                        info.columns = jsonData[0] ? Object.keys(jsonData[0]).length : 0;
                    }
                } catch { }
            }

            setFileInfo(info);

            const defaultTargets = {
                csv: 'json',
                json: 'csv',
                excel: 'csv'
            };

            setConversionSettings(prev => ({
                ...prev,
                targetFormat: defaultTargets[format] || 'json'
            }));

        } catch (error) {
            console.error('File reading error:', error);
            alert("Conversion failed");
        }
    }, [conversionSettings.csvDelimiter]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const uploadedFile = e.dataTransfer.files[0];
        handleFileUpload(uploadedFile);
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const downloadFile = () => {
        if (!convertedContent) return;

        const blob = new Blob([convertedContent], {
            type: getMimeType(conversionSettings.targetFormat)
        });
        const url = URL.createObjectURL(blob);
        const extension = getFileExtension(conversionSettings.targetFormat);
        const fileName = `${fileInfo.name.split('.')[0]}_converted.${extension}`;

        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const getMimeType = (format) => {
        switch (format) {
            case 'csv': return 'text/csv';
            case 'json': return 'application/json';
            case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            default: return 'text/plain';
        }
    };

    const getFileExtension = (format) => {
        switch (format) {
            case 'csv': return 'csv';
            case 'json': return 'json';
            case 'excel': return 'xlsx';
            default: return 'txt';
        }
    };

    const clearAll = () => {
        setFile(null);
        setOriginalContent('');
        setConvertedContent('');
        setFileInfo({});
        setConversionSettings({
            targetFormat: 'json',
            csvDelimiter: ',',
            jsonFormat: 'pretty',
            includeHeaders: true,
            sheetName: 'Sheet1'
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatOptions = [
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' },
        { value: 'excel', label: 'Excel' }
    ];

    const delimiterOptions = [
        { value: ',', label: "Comma" },
        { value: ';', label: "Semicolon" },
        { value: '\t', label: "Tab" }
    ];

    return (
        <div className={styles["file-converter"]}>
            {/* UI unchanged */}
        </div>
    );
};

export default FileConverter;