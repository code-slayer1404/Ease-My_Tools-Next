"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/XMLFormatter.css';

const XMLFormatter = () => {
    const { theme } = useTheme();
    const [inputXML, setInputXML] = useState('');
    const [formattedXML, setFormattedXML] = useState('');
    const [indentSize, setIndentSize] = useState(2);
    const [isValid, setIsValid] = useState(true);
    const [error, setError] = useState('');

    const formatXML = () => {
        if (!inputXML.trim()) {
            alert("Please enter XML data" || 'Please enter XML data');
            return;
        }

        try {
            // Simple XML formatting function
            const formatted = formatXMLString(inputXML, indentSize);
            setFormattedXML(formatted);
            setIsValid(true);
            setError('');
        } catch (err) {
            setIsValid(false);
            setError(err.message);
            setFormattedXML('');
        }
    };

    const formatXMLString = (xml, indent = 2) => {
        let formatted = '';
        let indentLevel = 0;
        const spaces = ' '.repeat(indent);
        
        // Remove existing formatting
        xml = xml.replace(/>\s+</g, '><').trim();
        
        let inTag = false;
        let inAttribute = false;
        let currentTag = '';
        let currentText = '';

        for (let i = 0; i < xml.length; i++) {
            const char = xml[i];
            
            if (char === '<') {
                if (currentText.trim()) {
                    formatted += spaces.repeat(indentLevel) + currentText.trim() + '\n';
                    currentText = '';
                }
                inTag = true;
                currentTag = '<';
            } else if (char === '>') {
                currentTag += '>';
                inTag = false;
                
                if (currentTag.startsWith('</')) {
                    indentLevel--;
                    formatted += spaces.repeat(indentLevel) + currentTag + '\n';
                } else if (currentTag.endsWith('/>')) {
                    formatted += spaces.repeat(indentLevel) + currentTag + '\n';
                } else {
                    formatted += spaces.repeat(indentLevel) + currentTag + '\n';
                    indentLevel++;
                }
                currentTag = '';
            } else if (inTag) {
                currentTag += char;
            } else {
                currentText += char;
            }
        }

        return formatted.trim();
    };

    const validateXML = () => {
        if (!inputXML.trim()) {
            setError("Please enter XML data" || 'Please enter XML data');
            setIsValid(false);
            return;
        }

        try {
            // Simple XML validation
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(inputXML, "text/xml");
            
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                throw new Error(xmlDoc.getElementsByTagName("parsererror")[0].textContent);
            }
            
            setIsValid(true);
            setError("Valid XML!" || 'Valid XML!');
        } catch (err) {
            setIsValid(false);
            setError(err.message);
        }
    };

    const minifyXML = () => {
        if (!inputXML.trim()) {
            alert("Please enter XML data" || 'Please enter XML data');
            return;
        }

        try {
            const minified = inputXML.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
            setFormattedXML(minified);
            setIsValid(true);
            setError('');
        } catch (err) {
            setIsValid(false);
            setError(err.message);
        }
    };

    const clearAll = () => {
        setInputXML('');
        setFormattedXML('');
        setIsValid(true);
        setError('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!" || 'Copied to clipboard!');
    };

    return (
        <div className={`xml-formatter ${theme}`}>
            <div className="formatter-header">
                <h1>{"XML Formatter" || 'XML Formatter'}</h1>
                <p>{"Format, validate, and minify XML data" || 'Format, validate, and minify XML data'}</p>
            </div>

            <div className="formatter-container">
                <div className="settings-panel">
                    <div className="setting">
                        <label>{"Indent Size" || 'Indent Size'}:</label>
                        <select value={indentSize} onChange={(e) => setIndentSize(parseInt(e.target.value))}>
                            <option value={2}>2 {"spaces" || 'spaces'}</option>
                            <option value={4}>4 {"spaces" || 'spaces'}</option>
                            <option value={8}>8 {"spaces" || 'spaces'}</option>
                        </select>
                    </div>
                </div>

                <div className="input-section">
                    <label>{"Input XML" || 'Input XML'}</label>
                    <textarea
                        value={inputXML}
                        onChange={(e) => setInputXML(e.target.value)}
                        placeholder={"Paste your XML data here..." || 'Paste your XML data here...'}
                        className={`xml-input ${!isValid ? 'error' : ''}`}
                        rows="8"
                    />
                </div>

                <div className="action-buttons">
                    <button onClick={formatXML} className="format-btn">
                        {"Format XML" || 'Format XML'}
                    </button>
                    <button onClick={minifyXML} className="minify-btn">
                        {"Minify XML" || 'Minify XML'}
                    </button>
                    <button onClick={validateXML} className="validate-btn">
                        {"Validate XML" || 'Validate XML'}
                    </button>
                    <button onClick={clearAll} className="clear-btn">
                        {"Clear All" || 'Clear All'}
                    </button>
                </div>

                {error && (
                    <div className={`error-message ${isValid ? 'valid' : 'invalid'}`}>
                        {error}
                    </div>
                )}

                {formattedXML && (
                    <div className="output-section">
                        <label>{"Formatted XML" || 'Formatted XML'}</label>
                        <pre className="xml-output">
                            {formattedXML}
                        </pre>
                        <div className="output-actions">
                            <button onClick={() => copyToClipboard(formattedXML)} className="copy-btn">
                                {"Copy to Clipboard" || 'Copy to Clipboard'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="info-section">
                    <h4>{"About XML" || 'About XML'}</h4>
                    <p>{"XML (eXtensible Markup Language) is a markup language that defines a set of rules for encoding documents in a format that is both human-readable and machine-readable." || 'XML (eXtensible Markup Language) is a markup language that defines a set of rules for encoding documents in a format that is both human-readable and machine-readable.'}</p>
                    
                    <h5>{"Common Uses:" || 'Common Uses:'}</h5>
                    <ul>
                        <li>{"Web services (SOAP, REST)" || 'Web services (SOAP, REST)'}</li>
                        <li>{"Configuration files" || 'Configuration files'}</li>
                        <li>{"Data exchange between systems" || 'Data exchange between systems'}</li>
                        <li>{"Document storage" || 'Document storage'}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default XMLFormatter;