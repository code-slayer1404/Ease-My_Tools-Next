"use client";

import React, { useState } from 'react';
import styles from './styles.module.css';

const LoremIpsumGenerator = () => {
    const [outputType, setOutputType] = useState('paragraphs');
    const [quantity, setQuantity] = useState(3);
    const [generatedText, setGeneratedText] = useState('');

    const loremIpsumWords = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
        'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
        'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna',
        'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis',
        'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
        'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis',
        'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat',
        'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
        'cupidatat', 'non', 'proident', 'sunt', 'in', 'culpa',
        'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];

    const generateText = () => {
        let text = '';

        if (outputType === 'paragraphs') {
            for (let i = 0; i < quantity; i++) {
                text += generateParagraph() + '\n\n';
            }
        } else if (outputType === 'words') {
            text = generateWords(quantity);
        } else if (outputType === 'sentences') {
            for (let i = 0; i < quantity; i++) {
                text += generateSentence() + ' ';
            }
        } else if (outputType === 'list') {
            for (let i = 0; i < quantity; i++) {
                text += `• ${generateSentence()}\n`;
            }
        }

        setGeneratedText(text.trim());
    };

    const generateParagraph = () => {
        const sentences = 4 + Math.floor(Math.random() * 3); // 4-6 sentences
        let paragraph = '';
        
        for (let i = 0; i < sentences; i++) {
            paragraph += generateSentence() + ' ';
        }
        
        return paragraph.trim();
    };

    const generateSentence = () => {
        const words = 8 + Math.floor(Math.random() * 8); // 8-15 words
        let sentence = generateWords(words);
        
        // Capitalize first letter and add period
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
        
        return sentence;
    };

    const generateWords = (count) => {
        let words = '';
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * loremIpsumWords.length);
            words += loremIpsumWords[randomIndex] + ' ';
        }
        
        return words.trim();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedText);
        alert("Text copied to clipboard!");
    };

    const clearText = () => {
        setGeneratedText('');
    };

    const downloadText = () => {
        const blob = new Blob([generatedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lorem-ipsum.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles["lorem-generator"]}>
            <div className={styles["generator-header"]}>
                <h1>{"Lorem Ipsum Generator"}</h1>
                <p>{"Generate placeholder text for your projects"}</p>
            </div>

            <div className={styles["generator-container"]}>
                <div className={styles["controls-section"]}>
                    <div className={styles["control-group"]}>
                        <label>{"Output Type"}</label>
                        <select 
                            value={outputType} 
                            onChange={(e) => setOutputType(e.target.value)}
                            className={styles["type-select"]}
                        >
                            <option value="paragraphs">{"Paragraphs"}</option>
                            <option value="sentences">{"Sentences"}</option>
                            <option value="words">{"Words"}</option>
                            <option value="list">{"List Items"}</option>
                        </select>
                    </div>

                    <div className={styles["control-group"]}>
                        <label>{"Quantity"}</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            max={outputType === 'words' ? 1000 : 50}
                            className={styles["quantity-input"]}
                        />
                    </div>

                    <button onClick={generateText} className={styles["generate-btn"]}>
                        {"Generate Lorem Ipsum"}
                    </button>
                </div>

                {generatedText && (
                    <div className={styles["output-section"]}>
                        <div className={styles["output-header"]}>
                            <h3>{"Generated Text"}</h3>
                            <div className={styles["output-actions"]}>
                                <button onClick={copyToClipboard} className={styles["copy-btn"]}>
                                    {"Copy"}
                                </button>
                                <button onClick={downloadText} className={styles["download-btn"]}>
                                    {"Download"}
                                </button>
                                <button onClick={clearText} className={styles["clear-btn"]}>
                                    {"Clear"}
                                </button>
                            </div>
                        </div>
                        <div className={styles["text-output"]}>
                            <pre>{generatedText}</pre>
                        </div>
                    </div>
                )}

                <div className={styles["info-section"]}>
                    <h4>{"About Lorem Ipsum"}</h4>
                    <p>{"Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's standard dummy text ever since the 1500s."}</p>
                    
                    <h5>{"Common Uses:"}</h5>
                    <ul>
                        <li>{"Web design mockups"}</li>
                        <li>{"Printing and typesetting"}</li>
                        <li>{"Layout testing"}</li>
                        <li>{"Content placeholder"}</li>
                    </ul>

                    <div className={styles["quick-generate"]}>
                        <h5>{"Quick Generate:"}</h5>
                        <div className={styles["quick-buttons"]}>
                            <button onClick={() => {setOutputType('paragraphs'); setQuantity(1); generateText();}} className={styles["quick-btn"]}>
                                1 {"Paragraph"}
                            </button>
                            <button onClick={() => {setOutputType('paragraphs'); setQuantity(3); generateText();}} className={styles["quick-btn"]}>
                                3 {"Paragraphs"}
                            </button>
                            <button onClick={() => {setOutputType('words'); setQuantity(50); generateText();}} className={styles["quick-btn"]}>
                                50 {"Words"}
                            </button>
                            <button onClick={() => {setOutputType('list'); setQuantity(5); generateText();}} className={styles["quick-btn"]}>
                                5 {"List Items"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoremIpsumGenerator;