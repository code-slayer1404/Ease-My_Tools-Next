"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/WordCounter.css';

const WordCounter = () => { // namespace for Word Counter
    const { theme } = useTheme();
    const [text, setText] = useState('');

    const stats = {
        characters: text.length,
        charactersWithoutSpaces: text.replace(/\s/g, '').length,
        words: text.split(/\s+/).filter(word => word.length > 0).length,
        sentences: text.split(/[.!?]+/).filter(sentence => sentence.length > 0).length,
        paragraphs: text.split(/\n+/).filter(paragraph => paragraph.length > 0).length,
        readingTime: Math.ceil(text.split(/\s+/).filter(word => word.length > 0).length / 200) // 200 words per minute
    };

    const clearText = () => {
        setText('');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        alert("Text copied to clipboard!");
    };

    return (
        <div className={`word-counter ${theme}`}>
            <div className="counter-header">
                <h1>{"Word Counter"}</h1>
                <p>{"Count words, characters, and more in your text"}</p>
            </div>

            <div className="counter-container">
                <div className="input-section">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={"Start typing or paste your text here..."}
                        className="text-area"
                        // @ts-ignore
                        rows="10"
                    />
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{stats.words}</div>
                        <div className="stat-label">{"Words"}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.characters}</div>
                        <div className="stat-label">{"Characters"}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.charactersWithoutSpaces}</div>
                        <div className="stat-label">{"Characters (no spaces)"}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.sentences}</div>
                        <div className="stat-label">{"Sentences"}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.paragraphs}</div>
                        <div className="stat-label">{"Paragraphs"}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.readingTime}</div>
                        <div className="stat-label">{"Reading Time (minutes)"}</div>
                    </div>
                </div>

                <div className="action-buttons">
                    <button onClick={copyToClipboard} className="action-btn copy">
                        {"Copy Text"}
                    </button>
                    <button onClick={clearText} className="action-btn clear">
                        {"Clear Text"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WordCounter;
