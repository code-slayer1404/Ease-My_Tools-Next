"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/TextDiffChecker.css';

const t = (key, fallback) => fallback ?? key;

const TextDiffChecker = () => {
    const { theme } = useTheme();
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
        <div className={`text-diff-checker ${theme}`}>
            <div className="diff-header">
                <h1>{t('title') || 'Text Diff Checker'}</h1>
                <p>{t('subtitle') || 'Compare and find differences between two texts'}</p>
            </div>

            <div className="diff-container">
                <div className="text-inputs">
                    <div className="text-section">
                        <label>{t('text1') || 'Text 1'}</label>
                        <textarea
                            value={text1}
                            onChange={(e) => setText1(e.target.value)}
                            placeholder={t('text1Placeholder') || 'Enter first text...'}
                            className="text-input"
                            rows="8"
                        />
                    </div>

                    <div className="text-section">
                        <label>{t('text2') || 'Text 2'}</label>
                        <textarea
                            value={text2}
                            onChange={(e) => setText2(e.target.value)}
                            placeholder={t('text2Placeholder') || 'Enter second text...'}
                            className="text-input"
                            rows="8"
                        />
                    </div>
                </div>

                <div className="action-buttons">
                    <button onClick={findDifferences} className="diff-btn">
                        {t('findDifferences') || 'Find Differences'}
                    </button>
                    <button onClick={swapTexts} className="swap-btn">
                        {t('swapTexts') || 'Swap Texts'}
                    </button>
                    <button onClick={clearAll} className="clear-btn">
                        {t('clear') || 'Clear All'}
                    </button>
                </div>

                {diffResult && (
                    <div className="result-section">
                        <h3>{t('differences') || 'Differences'}</h3>
                        <div className="diff-output">
                            <pre>{diffResult}</pre>
                        </div>
                        <div className="diff-legend">
                            <div className="legend-item">
                                <span className="removed">-</span> {t('removed') || 'Removed'}
                            </div>
                            <div className="legend-item">
                                <span className="added">+</span> {t('added') || 'Added'}
                            </div>
                            <div className="legend-item">
                                <span className="unchanged"> </span> {t('unchanged') || 'Unchanged'}
                            </div>
                        </div>
                    </div>
                )}

                <div className="info-section">
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