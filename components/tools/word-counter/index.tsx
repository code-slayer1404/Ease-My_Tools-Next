"use client";

import React, { useState } from 'react';
import styles from './styles.module.css';

const WordCounter = () => { // namespace for Word Counter
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
        <div className={styles["word-counter"]}>
            <div className={styles["counter-header"]}>
                <h1>{"Word Counter"}</h1>
                <p>{"Count words, characters, and more in your text"}</p>
            </div>

            <div className={styles["counter-container"]}>
                <div className={styles["input-section"]}>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={"Start typing or paste your text here..."}
                        className={styles["text-area"]}
                        rows={10}
                    />
                </div>

                <div className={styles["stats-grid"]}>
                    <div className={styles["stat-card"]}>
                        <div className={styles["stat-number"]}>{stats.words}</div>
                        <div className={styles["stat-label"]}>{"Words"}</div>
                    </div>
                    <div className={styles["stat-card"]}>
                        <div className={styles["stat-number"]}>{stats.characters}</div>
                        <div className={styles["stat-label"]}>{"Characters"}</div>
                    </div>
                    <div className={styles["stat-card"]}>
                        <div className={styles["stat-number"]}>{stats.charactersWithoutSpaces}</div>
                        <div className={styles["stat-label"]}>{"Characters (no spaces)"}</div>
                    </div>
                    <div className={styles["stat-card"]}>
                        <div className={styles["stat-number"]}>{stats.sentences}</div>
                        <div className={styles["stat-label"]}>{"Sentences"}</div>
                    </div>
                    <div className={styles["stat-card"]}>
                        <div className={styles["stat-number"]}>{stats.paragraphs}</div>
                        <div className={styles["stat-label"]}>{"Paragraphs"}</div>
                    </div>
                    <div className={styles["stat-card"]}>
                        <div className={styles["stat-number"]}>{stats.readingTime}</div>
                        <div className={styles["stat-label"]}>{"Reading Time (minutes)"}</div>
                    </div>
                </div>

                <div className={styles["action-buttons"]}>
                    <button onClick={copyToClipboard} className={`${styles["action-btn"]} ${styles["copy"]}`}>
                        {"Copy Text"}
                    </button>
                    <button onClick={clearText} className={`${styles["action-btn"]} ${styles["clear"]}`}>
                        {"Clear Text"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WordCounter;
