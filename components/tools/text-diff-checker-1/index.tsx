"use client";

import React, { useState } from 'react';
import styles from './styles.module.css';

const t = (key: string, fallback?: string) => fallback ?? key;

const TextDiffChecker = () => {
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [diffResult, setDiffResult] = useState('');

    const findDifferences = () => {
        if (!text1.trim() || !text2.trim()) {
            alert(t('enterBothTexts') || 'Please enter both texts');
            return;
        }

        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        let result = '';

        const maxLines = Math.max(lines1.length, lines2.length);
        
        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';

            if (line1 === line2) {
                result += `  ${line1}\n`;
            } else {
                if (line1) result += `- ${line1}\n`;
                if (line2) result += `+ ${line2}\n`;
            }
        }

        setDiffResult(result);
    };

    const clearAll = () => {
        setText1('');
        setText2('');
        setDiffResult('');
    };

    const swapTexts = () => {
        setText1(text2);
        setText2(text1);
    };

    return (
        <div className={styles["text-diff-checker"]}>
            <div className={styles["diff-header"]}>
                <h1>{t('title') || 'Text Diff Checker'}</h1>
                <p>{t('subtitle') || 'Compare and find differences between two texts'}</p>
            </div>

            <div className={styles["diff-container"]}>
                <div className={styles["text-inputs"]}>
                    <div className={styles["text-section"]}>
                        <label>{t('text1') || 'Text 1'}</label>
                        <textarea
                            value={text1}
                            onChange={(e) => setText1(e.target.value)}
                            placeholder={t('text1Placeholder') || 'Enter first text...'}
                            className={styles["text-input"]}
                            rows={8}
                        />
                    </div>

                    <div className={styles["text-section"]}>
                        <label>{t('text2') || 'Text 2'}</label>
                        <textarea
                            value={text2}
                            onChange={(e) => setText2(e.target.value)}
                            placeholder={t('text2Placeholder') || 'Enter second text...'}
                            className={styles["text-input"]}
                            rows={8}
                        />
                    </div>
                </div>

                <div className={styles["action-buttons"]}>
                    <button onClick={findDifferences} className={styles["diff-btn"]}>
                        {t('findDifferences') || 'Find Differences'}
                    </button>
                    <button onClick={swapTexts} className={styles["swap-btn"]}>
                        {t('swapTexts') || 'Swap Texts'}
                    </button>
                    <button onClick={clearAll} className={styles["clear-btn"]}>
                        {t('clear') || 'Clear All'}
                    </button>
                </div>

                {diffResult && (
                    <div className={styles["result-section"]}>
                        <h3>{t('differences') || 'Differences'}</h3>
                        <div className={styles["diff-output"]}>
                            <pre>{diffResult}</pre>
                        </div>
                        <div className={styles["diff-legend"]}>
                            <div className={styles["legend-item"]}>
                                <span className={styles["removed"]}>-</span> {t('removed') || 'Removed'}
                            </div>
                            <div className={styles["legend-item"]}>
                                <span className={styles["added"]}>+</span> {t('added') || 'Added'}
                            </div>
                            <div className={styles["legend-item"]}>
                                <span className={styles["unchanged"]}> </span> {t('unchanged') || 'Unchanged'}
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles["info-section"]}>
                    <h4>{t('aboutDiff') || 'About Text Comparison'}</h4>
                    <p>{t('diffInfo') || 'Text diff tools compare two pieces of text and highlight the differences between them. This is useful for code reviews, document comparison, and tracking changes.'}</p>
                    
                    <h5>{t('commonUses') || 'Common Uses:'}</h5>
                    <ul>    
                        <li>{t('use1') || 'Code review and version control'}</li>
                        <li>{t('use2') || 'Document comparison'}</li>
                        <li>{t('use3') || 'Plagiarism detection'}</li>
                        <li>{t('use4') || 'Content change tracking'}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TextDiffChecker;