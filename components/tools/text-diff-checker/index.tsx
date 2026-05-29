"use client";

import React, { useState, useCallback, useMemo } from "react";
import styles from "./styles.module.css";
import {
    diffWords,
    diffLines,
    diffChars,
    type Change,
} from "diff";

type DiffMode = "words" | "characters" | "lines";
type ViewMode = "unified" | "split";

const TextDiffChecker: React.FC = () => {
    const [textA, setTextA] = useState<string>(`function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("World"));`);

    const [textB, setTextB] = useState<string>(`function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));
console.log("Welcome!");`);

    const [diffResult, setDiffResult] = useState<Change[]>([]);
    const [diffMode, setDiffMode] = useState<DiffMode>("words");
    const [viewMode, setViewMode] = useState<ViewMode>("unified");
    const [ignoreWhitespace, setIgnoreWhitespace] =
        useState<boolean>(false);
    const [caseSensitive, setCaseSensitive] =
        useState<boolean>(true);
    const [showStats, setShowStats] = useState<boolean>(true);

    const handleCompare = useCallback(() => {
        let text1 = textA;
        let text2 = textB;

        if (!caseSensitive) {
            text1 = text1.toLowerCase();
            text2 = text2.toLowerCase();
        }

        if (ignoreWhitespace) {
            text1 = text1.replace(/\s+/g, " ").trim();
            text2 = text2.replace(/\s+/g, " ").trim();
        }

        let diff: Change[];

        switch (diffMode) {
            case "characters":
                diff = diffChars(text1, text2);
                break;

            case "lines":
                diff = diffLines(text1, text2);
                break;

            case "words":
            default:
                diff = diffWords(text1, text2);
                break;
        }

        setDiffResult(diff);
    }, [
        textA,
        textB,
        diffMode,
        ignoreWhitespace,
        caseSensitive,
    ]);

    const handleSwap = useCallback(() => {
        setTextA(textB);
        setTextB(textA);
    }, [textA, textB]);

    const handleClear = useCallback(() => {
        setTextA("");
        setTextB("");
        setDiffResult([]);
    }, []);

    const handleLoadSample = useCallback(() => {
        setTextA(`const calculateTotal = (items) => {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price;
    }
    return total;
};`);

        setTextB(`const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price, 0);
};`);
    }, []);

    const getDiffStats = useMemo(() => {
        let added = 0;
        let removed = 0;
        let unchanged = 0;

        diffResult.forEach((part) => {
            const length = part.value.length;

            if (part.added) {
                added += length;
            } else if (part.removed) {
                removed += length;
            } else {
                unchanged += length;
            }
        });

        return {
            added,
            removed,
            unchanged,
            total: added + removed + unchanged,
        };
    }, [diffResult]);

    const copyDiff = useCallback(() => {
        const diffText = diffResult
            .map((part) => {
                if (part.added) return `[+] ${part.value}`;
                if (part.removed) return `[-] ${part.value}`;
                return `    ${part.value}`;
            })
            .join("");

        navigator.clipboard.writeText(diffText);
        alert("Diff copied to clipboard!");
    }, [diffResult]);

    const renderUnifiedDiff = () => {
        return (
            <div className={styles.unifiedDiff}>
                {diffResult.map((part, index) => {
                    let className = styles.unifiedPart;

                    if (part.added) {
                        className += ` ${styles.added}`;
                    } else if (part.removed) {
                        className += ` ${styles.removed}`;
                    }

                    const lines = part.value.split("\n");

                    return lines.map((line, lineIndex) => (
                        <div
                            key={`${index}-${lineIndex}`}
                            className={className}
                        >
                            {part.added && (
                                <span className={styles.prefix}>
                                    +{" "}
                                </span>
                            )}

                            {part.removed && (
                                <span className={styles.prefix}>
                                    -{" "}
                                </span>
                            )}

                            {!part.added && !part.removed && (
                                <span className={styles.prefix}>
                                    {" "}
                                </span>
                            )}

                            <span className={styles.lineContent}>
                                {line || " "}
                            </span>
                        </div>
                    ));
                })}
            </div>
        );
    };

    const renderSplitDiff = () => {
        return (
            <div className={styles.splitDiff}>
                <div className={styles.splitColumn}>
                    <div className={styles.splitHeader}>
                        Original Text
                    </div>

                    <div className={styles.splitContent}>
                        {diffResult.map((part, index) => {
                            if (!part.removed) return null;

                            const lines = part.value.split("\n");

                            return lines.map((line, lineIndex) => (
                                <div
                                    key={`removed-${index}-${lineIndex}`}
                                    className={`${styles.splitLine} ${styles.removedBg}`}
                                >
                                    <span
                                        className={styles.lineNumber}
                                    >
                                        {lineIndex + 1}
                                    </span>

                                    <span
                                        className={styles.lineContent}
                                    >
                                        {line || " "}
                                    </span>
                                </div>
                            ));
                        })}
                    </div>
                </div>

                <div className={styles.splitColumn}>
                    <div className={styles.splitHeader}>
                        Modified Text
                    </div>

                    <div className={styles.splitContent}>
                        {diffResult.map((part, index) => {
                            if (!part.added) return null;

                            const lines = part.value.split("\n");

                            return lines.map((line, lineIndex) => (
                                <div
                                    key={`added-${index}-${lineIndex}`}
                                    className={`${styles.splitLine} ${styles.addedBg}`}
                                >
                                    <span
                                        className={styles.lineNumber}
                                    >
                                        {lineIndex + 1}
                                    </span>

                                    <span
                                        className={styles.lineContent}
                                    >
                                        {line || " "}
                                    </span>
                                </div>
                            ));
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <label>Diff Mode</label>

                    <select
                        value={diffMode}
                        onChange={(e) =>
                            setDiffMode(
                                e.target.value as DiffMode
                            )
                        }
                    >
                        <option value="words">Words</option>
                        <option value="characters">
                            Characters
                        </option>
                        <option value="lines">Lines</option>
                    </select>
                </div>

                <div className={styles.controlGroup}>
                    <label>View Mode</label>

                    <select
                        value={viewMode}
                        onChange={(e) =>
                            setViewMode(
                                e.target.value as ViewMode
                            )
                        }
                    >
                        <option value="unified">
                            Unified View
                        </option>
                        <option value="split">
                            Split View
                        </option>
                    </select>
                </div>

                <div className={styles.controlGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={ignoreWhitespace}
                            onChange={(e) =>
                                setIgnoreWhitespace(
                                    e.target.checked
                                )
                            }
                        />
                        Ignore Whitespace
                    </label>
                </div>

                <div className={styles.controlGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={caseSensitive}
                            onChange={(e) =>
                                setCaseSensitive(
                                    e.target.checked
                                )
                            }
                        />
                        Case Sensitive
                    </label>
                </div>

                <div className={styles.controlGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={showStats}
                            onChange={(e) =>
                                setShowStats(
                                    e.target.checked
                                )
                            }
                        />
                        Show Statistics
                    </label>
                </div>
            </div>

            <div className={styles.inputsContainer}>
                <div className={styles.inputPanel}>
                    <div className={styles.panelHeader}>
                        <span>📄 Original Text</span>

                        <button
                            className={styles.iconBtn}
                            onClick={() => setTextA("")}
                            title="Clear"
                        >
                            🗑️
                        </button>
                    </div>

                    <textarea
                        className={styles.textarea}
                        placeholder="Enter original text here..."
                        value={textA}
                        onChange={(e) =>
                            setTextA(e.target.value)
                        }
                    />
                </div>

                <div className={styles.inputPanel}>
                    <div className={styles.panelHeader}>
                        <span>📝 Modified Text</span>

                        <button
                            className={styles.iconBtn}
                            onClick={() => setTextB("")}
                            title="Clear"
                        >
                            🗑️
                        </button>
                    </div>

                    <textarea
                        className={styles.textarea}
                        placeholder="Enter modified text here..."
                        value={textB}
                        onChange={(e) =>
                            setTextB(e.target.value)
                        }
                    />
                </div>
            </div>

            <div className={styles.actionButtons}>
                <button
                    className={styles.primaryBtn}
                    onClick={handleCompare}
                >
                    🔄 Compare Texts
                </button>

                <button
                    className={styles.secondaryBtn}
                    onClick={handleSwap}
                >
                    ⇄ Swap Texts
                </button>

                <button
                    className={styles.secondaryBtn}
                    onClick={handleLoadSample}
                >
                    📋 Load Sample
                </button>

                <button
                    className={styles.secondaryBtn}
                    onClick={handleClear}
                >
                    🗑️ Clear All
                </button>

                {diffResult.length > 0 && (
                    <button
                        className={styles.secondaryBtn}
                        onClick={copyDiff}
                    >
                        📋 Copy Diff
                    </button>
                )}
            </div>

            {showStats && diffResult.length > 0 && (
                <div className={styles.statsContainer}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>
                            Added
                        </span>

                        <span
                            className={`${styles.statValue} ${styles.addedText}`}
                        >
                            +{getDiffStats.added} chars
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>
                            Removed
                        </span>

                        <span
                            className={`${styles.statValue} ${styles.removedText}`}
                        >
                            -{getDiffStats.removed} chars
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>
                            Unchanged
                        </span>

                        <span className={styles.statValue}>
                            {getDiffStats.unchanged} chars
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>
                            Total Changes
                        </span>

                        <span className={styles.statValue}>
                            {getDiffStats.added +
                                getDiffStats.removed}{" "}
                            chars
                        </span>
                    </div>
                </div>
            )}

            {diffResult.length > 0 && (
                <div className={styles.diffContainer}>
                    <div className={styles.diffHeader}>
                        <h3>Difference Result</h3>

                        <span className={styles.diffHint}>
                            {viewMode === "unified"
                                ? "Green = Added, Red = Removed"
                                : "Left = Removed, Right = Added"}
                        </span>
                    </div>

                    <div className={styles.diffContent}>
                        {viewMode === "unified"
                            ? renderUnifiedDiff()
                            : renderSplitDiff()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextDiffChecker;