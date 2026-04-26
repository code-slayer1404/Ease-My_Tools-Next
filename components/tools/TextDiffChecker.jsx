"use client";

import React, { useState } from "react";
import "../../styles/tools/TextDiffChecker.css";
import { diffWords } from "diff";

const TextDiffChecker = () => {
    const [textA, setTextA] = useState("");
    const [textB, setTextB] = useState("");
    const [diffResult, setDiffResult] = useState([]);

    const handleCompare = () => {
        const diff = diffWords(textA, textB);
        setDiffResult(diff);
    };

    return (
        <div className="diff-container">
            <h2>Text Diff Checker</h2>
            <div className="inputs">
                <textarea
                    placeholder="Enter Text A"
                    value={textA}
                    onChange={(e) => setTextA(e.target.value)}
                />
                <textarea
                    placeholder="Enter Text B"
                    value={textB}
                    onChange={(e) => setTextB(e.target.value)}
                />
            </div>
            <button onClick={handleCompare}>Compare</button>

            <div className="diff-result">
                {diffResult.map((part, index) => {
                    let className = "";
                    if (part.added) className = "added";
                    else if (part.removed) className = "removed";
                    return (
                        <span key={index} className={className}>
                            {part.value}
                        </span>
                    );
                })}   
            </div>
        </div>
    );
};

export default TextDiffChecker;
