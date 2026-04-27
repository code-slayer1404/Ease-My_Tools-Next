"use client";

import React, { useState } from 'react';
import styles from './styles.module.css';

const CaseConverter = () => { // <-- i18next
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
        <div className={styles["case-converter"]}>
            <div className={styles["converter-header"]}>
                <h1>{"Text Case Converter"}</h1>
                <p>{"Convert text between different cases instantly"}</p>
            </div>

            <div className={styles["converter-container"]}>
                <div className={styles["input-section"]}>
                    <label>{"Input Text"}</label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={"Enter your text here..."}
                        className={styles["text-input"]}
                        rows={6}
                    />
                </div>

                <div className={styles["button-group"]}>
                    <button onClick={convertToUpperCase} className={styles["convert-btn"]}>
                        {"UPPERCASE"}
                    </button>
                    <button onClick={convertToLowerCase} className={styles["convert-btn"]}>
                        {"lowercase"}
                    </button>
                    <button onClick={convertToSentenceCase} className={styles["convert-btn"]}>
                        {"Sentence case"}
                    </button>
                    <button onClick={convertToTitleCase} className={styles["convert-btn"]}>
                        {"Title Case"}
                    </button>
                    <button onClick={clearText} className={styles["clear-btn"]}>
                        {"Clear"}
                    </button>
                </div>

                <div className={styles["output-section"]}>
                    <label>{"Converted Text"}</label>
                    <textarea
                        value={convertedText}
                        readOnly
                        placeholder={"Converted text will appear here..."}
                        className={styles["text-output"]}
                        rows={6}
                    />
                </div>

                {convertedText && (
                    <div className={styles["action-buttons"]}>
                        <button onClick={copyToClipboard} className={styles["copy-btn"]}>
                            {"Copy to Clipboard"}
                        </button>
                        <div className={styles["text-stats"]}>
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
