"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/CaseConverter.css';

const CaseConverter = () => { // <-- i18next
    const { theme } = useTheme();
    const [inputText, setInputText] = useState('');
    const [convertedText, setConvertedText] = useState('');

    const convertToUpperCase = () => {
        setConvertedText(inputText.toUpperCase());
    };

    const convertToLowerCase = () => {
        setConvertedText(inputText.toLowerCase());
    };

    const convertToSentenceCase = () => {
        const sentences = inputText.toLowerCase().split('. ');
        const sentenceCase = sentences.map(sentence =>
            sentence.charAt(0).toUpperCase() + sentence.slice(1)
        ).join('. ');
        setConvertedText(sentenceCase);
    };

    const convertToTitleCase = () => {
        const titleCase = inputText.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        setConvertedText(titleCase);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(convertedText);
        alert("Text copied to clipboard!");
    };

    const clearText = () => {
        setInputText('');
        setConvertedText('');
    };

    return (
        <div className={`case-converter ${theme}`}>
            <div className="converter-header">
                <h1>{"Text Case Converter"}</h1>
                <p>{"Convert text between different cases instantly"}</p>
            </div>

            <div className="converter-container">
                <div className="input-section">
                    <label>{"Input Text"}</label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={"Enter your text here..."}
                        className="text-input"
                        // @ts-ignore
                        rows="6"
                    />
                </div>

                <div className="button-group">
                    <button onClick={convertToUpperCase} className="convert-btn">
                        {"UPPERCASE"}
                    </button>
                    <button onClick={convertToLowerCase} className="convert-btn">
                        {"lowercase"}
                    </button>
                    <button onClick={convertToSentenceCase} className="convert-btn">
                        {"Sentence case"}
                    </button>
                    <button onClick={convertToTitleCase} className="convert-btn">
                        {"Title Case"}
                    </button>
                    <button onClick={clearText} className="clear-btn">
                        {"Clear"}
                    </button>
                </div>

                <div className="output-section">
                    <label>{"Converted Text"}</label>
                    <textarea
                        value={convertedText}
                        readOnly
                        placeholder={"Converted text will appear here..."}
                        className="text-output"
                        // @ts-ignore
                        rows="6"
                    />
                </div>

                {convertedText && (
                    <div className="action-buttons">
                        <button onClick={copyToClipboard} className="copy-btn">
                            {"Copy to Clipboard"}
                        </button>
                        <div className="text-stats">
                            <span>{"Characters"}: {convertedText.length}</span>
                            <span>{"Words"}: {convertedText.split(/\s+/).filter(word => word.length > 0).length}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaseConverter;
