"use client";

import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const RegexGenerator = () => {
    
    const [description, setDescription] = useState('');
    const [regex, setRegex] = useState('');
    const [explanation, setExplanation] = useState('');
    const [testText, setTestText] = useState('');
    const [matches, setMatches] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const examples = [
        { description: "Match email addresses", prompt: "email addresses" },
        { description: "Match US phone numbers", prompt: "US phone numbers in format (555) 123-4567" },
        { description: "Match URLs", prompt: "URLs starting with http or https" },
        { description: "Match IP addresses", prompt: "IP addresses like 192.168.1.1" },
        { description: "Match dates (YYYY-MM-DD)", prompt: "dates in YYYY-MM-DD format" },
        { description: "Strong password validation", prompt: "strong password with at least 8 characters, one uppercase, one lowercase, one number and one special character" },
        { description: "Match HTML tags", prompt: "HTML tags like <div> or <p class='text'>" },
        { description: "Match credit card numbers", prompt: "credit card numbers (16 digits with optional spaces or dashes)" }
    ];

    const cheatsheetItems = [
        "Digits: \\d",
        "Word characters: \\w",
        "Whitespace: \\s",
        "Quantifiers: *, +, ?, {n}",
        "Groups: ()",
        "Alternation: |",
        "Anchors: ^, $",
        "Character classes: []"
    ];

    const generateRegex = useCallback(async () => {
        if (!description.trim()) {
            setError('Please enter a description');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            // Simulate API call - in real implementation, you'd call your backend
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const generated = generateRegexFromDescription(description);
            setRegex(generated.pattern);
            setExplanation(generated.explanation);
            
        } catch (err) {
            setError("Error generating regex");
            console.error('Regex generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    }, [description]);

    const generateRegexFromDescription = (desc) => {
        const lowerDesc = desc.toLowerCase();
        
        // Simple rule-based regex generation - in production, you'd use AI/ML
        if (lowerDesc.includes('email')) {
            return {
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                explanation: 'Matches email addresses: local-part@domain.tld'
            };
        } else if (lowerDesc.includes('phone')) {
            return {
                pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
                explanation: 'Matches US phone numbers in format: (555) 123-4567'
            };
        } else if (lowerDesc.includes('url')) {
            return {
                pattern: '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$',
                explanation: 'Matches URLs starting with http:// or https://'
            };
        } else if (lowerDesc.includes('ip') && lowerDesc.includes('address')) {
            return {
                pattern: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$',
                explanation: 'Matches IPv4 addresses like 192.168.1.1'
            };
        } else if (lowerDesc.includes('date')) {
            return {
                pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
                explanation: 'Matches dates in YYYY-MM-DD format'
            };
        } else if (lowerDesc.includes('password')) {
            return {
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                explanation: 'Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character'
            };
        } else if (lowerDesc.includes('html') && lowerDesc.includes('tag')) {
            return {
                pattern: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>',
                explanation: 'Matches HTML tags with content'
            };
        } else if (lowerDesc.includes('credit') && lowerDesc.includes('card')) {
            return {
                pattern: '^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$',
                explanation: 'Matches 16-digit credit card numbers with optional spaces or dashes'
            };
        } else {
            // Fallback - generate a simple pattern based on common requirements
            if (lowerDesc.includes('number')) {
                return {
                    pattern: '^\\d+$',
                    explanation: 'Matches one or more digits'
                };
            } else if (lowerDesc.includes('word') || lowerDesc.includes('text')) {
                return {
                    pattern: '^[a-zA-Z]+$',
                    explanation: 'Matches alphabetic characters only'
                };
            } else if (lowerDesc.includes('space') || lowerDesc.includes('whitespace')) {
                return {
                    pattern: '^\\s+$',
                    explanation: 'Matches whitespace characters'
                };
            } else {
                return {
                    pattern: '^.*$',
                    explanation: 'Generic pattern matching any character sequence'
                };
            }
        }
    };

    const testRegex = useCallback(() => {
        if (!regex || !testText) {
            setMatches([]);
            return;
        }

        try {
            const regexObj = new RegExp(regex, 'g');
            const testMatches = [];
            let match;
            
            while ((match = regexObj.exec(testText)) !== null) {
                testMatches.push({
                    text: match[0],
                    index: match.index,
                    groups: match.slice(1)
                });
            }
            
            setMatches(testMatches);
        } catch (err) {
            setMatches([]);
            setError('Invalid regex pattern');
        }
    }, [regex, testText]);

    const copyToClipboard = useCallback((text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    }, []);

    const useExample = useCallback((examplePrompt) => {
        setDescription(examplePrompt);
    }, []);

    const clearAll = useCallback(() => {
        setDescription('');
        setRegex('');
        setExplanation('');
        setTestText('');
        setMatches([]);
        setError('');
    }, []);

    return (
        <div className={styles["regex-generator"]}>
            <div className={styles["tool-header"]}>
                <h1>{"Regex Generator"}</h1>
                <p>{"Generate regular expressions from natural language descriptions"}</p>
            </div>

            <div className={styles["regex-container"]}>
                {/* Input Section */}
                <div className={styles["input-section"]}>
                    <div className={styles["input-group"]}>
                        <label htmlFor="description">{"Describe what pattern you want to match..."}</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={"Describe what pattern you want to match..."}
                            rows={3}
                        />
                    </div>

                    <div className={styles["action-buttons"]}>
                        <button 
                            onClick={generateRegex}
                            className={`${styles["primary-btn"]} ${isGenerating ? styles["generating"] : ""}`}
                            disabled={isGenerating || !description.trim()}
                        >
                            {isGenerating ? "Generating..." : "Generate Regex"}
                        </button>
                        <button onClick={clearAll} className={styles["secondary-btn"]}>
                            {"Clear"}
                        </button>
                    </div>
                </div>

                {/* Examples Section */}
                <div className={styles["examples-section"]}>
                    <h3>{"Examples"}</h3>
                    <div className={styles["examples-grid"]}>
                        {examples.map((example, index) => (
                            <button
                                key={index}
                                className={styles["example-btn"]}
                                onClick={() => useExample(example.prompt)}
                                title={example.description}
                            >
                                {example.description}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                {(regex || error) && (
                    <div className={styles["results-section"]}>
                        {error && (
                            <div className={styles["error-message"]}>
                                {error}
                            </div>
                        )}
                        
                        {regex && (
                            <>
                                <div className={styles["result-group"]}>
                                    <label>Generated Regex</label>
                                    <div className={styles["regex-display"]}>
                                        <code>{regex}</code>
                                        <button 
                                            onClick={() => copyToClipboard(regex)}
                                            className={styles["copy-btn"]}
                                        >
                                            {"Copy"}
                                        </button>
                                    </div>
                                </div>

                                {explanation && (
                                    <div className={styles["result-group"]}>
                                        <label>{"Explanation"}</label>
                                        <div className={styles["explanation-box"]}>
                                            {explanation}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Test Section */}
                {regex && (
                    <div className={styles["test-section"]}>
                        <h3>{"Test Your Regex"}</h3>
                        <div className={styles["input-group"]}>
                            <textarea
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                placeholder={"Enter text to test the regex pattern..."}
                                rows={3}
                                onBlur={testRegex}
                            />
                        </div>
                        
                        {matches.length > 0 ? (
                            <div className={styles["matches-section"]}>
                                <h4>{"Matches"} ({matches.length})</h4>
                                <div className={styles["matches-list"]}>
                                    {matches.map((match, index) => (
                                        <div key={index} className={styles["match-item"]}>
                                            <span className={styles["match-text"]}>"{match.text}"</span>
                                            <span className={styles["match-position"]}>at position {match.index}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : testText && (
                            <div className={styles["no-matches"]}>
                                {"No matches found"}
                            </div>
                        )}
                    </div>
                )}

                {/* Cheatsheet Section */}
                <div className={styles["cheatsheet-section"]}>
                    <h3>{"Regex Cheatsheet"}</h3>
                    <div className={styles["cheatsheet-grid"]}>
                        {cheatsheetItems.map((item, index) => (
                            <div key={index} className={styles["cheatsheet-item"]}>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegexGenerator;