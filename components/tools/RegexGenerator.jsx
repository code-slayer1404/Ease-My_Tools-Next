"use client";

import React, { useState, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/RegexGenerator.css';

const RegexGenerator = () => {
    const { theme } = useTheme();
    
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
    }, [description, t]);

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
        <div className={`regex-generator ${theme}`}>
            <div className="tool-header">
                <h1>{"Regex Generator"}</h1>
                <p>{"Generate regular expressions from natural language descriptions"}</p>
            </div>

            <div className="regex-container">
                {/* Input Section */}
                <div className="input-section">
                    <div className="input-group">
                        <label htmlFor="description">{"Describe what pattern you want to match..."}</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={"Describe what pattern you want to match..."}
                            rows="3"
                        />
                    </div>

                    <div className="action-buttons">
                        <button 
                            onClick={generateRegex}
                            className={`primary-btn ${isGenerating ? 'generating' : ''}`}
                            disabled={isGenerating || !description.trim()}
                        >
                            {isGenerating ? "Generating..." : "Generate Regex"}
                        </button>
                        <button onClick={clearAll} className="secondary-btn">
                            {"Clear"}
                        </button>
                    </div>
                </div>

                {/* Examples Section */}
                <div className="examples-section">
                    <h3>{"Examples"}</h3>
                    <div className="examples-grid">
                        {examples.map((example, index) => (
                            <button
                                key={index}
                                className="example-btn"
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
                    <div className="results-section">
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                        
                        {regex && (
                            <>
                                <div className="result-group">
                                    <label>Generated Regex</label>
                                    <div className="regex-display">
                                        <code>{regex}</code>
                                        <button 
                                            onClick={() => copyToClipboard(regex)}
                                            className="copy-btn"
                                        >
                                            {"Copy"}
                                        </button>
                                    </div>
                                </div>

                                {explanation && (
                                    <div className="result-group">
                                        <label>{"Explanation"}</label>
                                        <div className="explanation-box">
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
                    <div className="test-section">
                        <h3>{"Test Your Regex"}</h3>
                        <div className="input-group">
                            <textarea
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                placeholder={"Enter text to test the regex pattern..."}
                                rows="3"
                                onBlur={testRegex}
                            />
                        </div>
                        
                        {matches.length > 0 ? (
                            <div className="matches-section">
                                <h4>{"Matches"} ({matches.length})</h4>
                                <div className="matches-list">
                                    {matches.map((match, index) => (
                                        <div key={index} className="match-item">
                                            <span className="match-text">"{match.text}"</span>
                                            <span className="match-position">at position {match.index}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : testText && (
                            <div className="no-matches">
                                {"No matches found"}
                            </div>
                        )}
                    </div>
                )}

                {/* Cheatsheet Section */}
                <div className="cheatsheet-section">
                    <h3>{"Regex Cheatsheet"}</h3>
                    <div className="cheatsheet-grid">
                        {cheatsheetItems.map((item, index) => (
                            <div key={index} className="cheatsheet-item">
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



// import React, { useState, useCallback, useEffect } from 'react';
// 
// import { useTheme } from '../../contexts/ThemeContext';
// import '../../styles/tools/RegexGenerator.css';

// const RegexGenerator = () => {
//     const { t } = useTranslation('regexGenerator');
//     const { theme } = useTheme();
    
//     const [activeMode, setActiveMode] = useState('generate');
//     const [description, setDescription] = useState('');
//     const [regex, setRegex] = useState('');
//     const [explanation, setExplanation] = useState('');
//     const [testText, setTestText] = useState('');
//     const [replaceText, setReplaceText] = useState('');
//     const [replacedResult, setReplacedResult] = useState('');
//     const [matches, setMatches] = useState([]);
//     const [splitResults, setSplitResults] = useState([]);
//     const [isGenerating, setIsGenerating] = useState(false);
//     const [error, setError] = useState('');
//     const [regexFlags, setRegexFlags] = useState({
//         g: true,
//         i: false,
//         m: false,
//         s: false,
//         u: false,
//         y: false
//     });
//     const [captureGroups, setCaptureGroups] = useState([]);
//     const [performanceStats, setPerformanceStats] = useState(null);
//     const [regexTree, setRegexTree] = useState([]);
//     const [activeTool, setActiveTool] = useState('tester');

//     const tools = [
//         { id: 'tester', label: t('tools.tester'), icon: '🧪' },
//         { id: 'explainer', label: t('tools.explainer'), icon: '📖' },
//         { id: 'visualizer', label: t('tools.visualizer'), icon: '🌳' },
//         { id: 'replacer', label: t('tools.replacer'), icon: '🔄' },
//         { id: 'splitter', label: t('tools.splitter'), icon: '✂️' },
//         { id: 'validator', label: t('tools.validator'), icon: '✅' },
//         { id: 'generator', label: t('tools.generator'), icon: '🤖' }
//     ];

//     const modes = [
//         { id: 'generate', label: t('modes.generate'), icon: '⚡' },
//         { id: 'analyze', label: t('modes.analyze'), icon: '🔍' },
//         { id: 'learn', label: t('modes.learn'), icon: '🎓' }
//     ];

//     const flags = [
//         { id: 'g', label: t('flags.global') },
//         { id: 'i', label: t('flags.caseInsensitive') },
//         { id: 'm', label: t('flags.multiline') },
//         { id: 's', label: t('flags.dotAll') },
//         { id: 'u', label: t('flags.unicode') },
//         { id: 'y', label: t('flags.sticky') }
//     ];

//     const advancedExamples = [
//         { 
//             name: "Match email addresses", 
//             pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
//             description: 'Validates email addresses'
//         },
//         { 
//             name: "Match US phone numbers", 
//             pattern: '^\\+?1?[-.\\s]?\\(?[2-9]\\d{2}\\)?[-.\\s]?[2-9]\\d{2}[-.\\s]?\\d{4}$',
//             description: 'Matches various phone number formats'
//         },
//         { 
//             name: "Match URLs", 
//             pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
//             description: 'Extracts URLs from text'
//         },
//         { 
//             name: t('examplesList.hexColor'), 
//             pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
//             description: 'Matches hex color codes'
//         },
//         { 
//             name: t('examplesList.time'), 
//             pattern: '^(0?[1-9]|1[0-2]):[0-5][0-9]\\s?(AM|PM)$',
//             description: '12-hour time format'
//         }
//     ];

//     const generateRegex = useCallback(async () => {
//         if (!description.trim()) {
//             setError('Please enter a description');
//             return;
//         }

//         setIsGenerating(true);
//         setError('');

//         try {
//             // Simulate AI API call
//             await new Promise(resolve => setTimeout(resolve, 2000));
            
//             const result = await generateAdvancedRegex(description);
//             setRegex(result.pattern);
//             setExplanation(result.explanation);
//             setRegexTree(result.tree || []);
            
//         } catch (err) {
//             setError("Error generating regex");
//             console.error('Regex generation error:', err);
//         } finally {
//             setIsGenerating(false);
//         }
//     }, [description, t]);

//     const generateAdvancedRegex = async (desc) => {
//         // Enhanced regex generation with more sophisticated patterns
//         const patterns = {
//             email: {
//                 pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
//                 explanation: 'Email validation: local-part@domain.tld with 2+ character TLD',
//                 tree: [
//                     { type: 'start', value: '^' },
//                     { type: 'character', value: 'Email local part' },
//                     { type: 'literal', value: '@' },
//                     { type: 'character', value: 'Domain name' },
//                     { type: 'literal', value: '.' },
//                     { type: 'character', value: 'TLD (2+ chars)' },
//                     { type: 'end', value: '$' }
//                 ]
//             },
//             phone: {
//                 pattern: '^\\+?1?[-.\\s]?\\(?[2-9]\\d{2}\\)?[-.\\s]?[2-9]\\d{2}[-.\\s]?\\d{4}$',
//                 explanation: 'US phone numbers with optional country code, parentheses, and separators',
//                 tree: [
//                     { type: 'start', value: '^' },
//                     { type: 'optional', value: 'Country code (+1)' },
//                     { type: 'separator', value: 'Optional separator' },
//                     { type: 'group', value: 'Area code' },
//                     { type: 'separator', value: 'Optional separator' },
//                     { type: 'group', value: 'Exchange code' },
//                     { type: 'separator', value: 'Optional separator' },
//                     { type: 'group', value: 'Line number' },
//                     { type: 'end', value: '$' }
//                 ]
//             },
//             password: {
//                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
//                 explanation: 'Strong password: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character',
//                 tree: [
//                     { type: 'start', value: '^' },
//                     { type: 'lookahead', value: 'Must contain lowercase' },
//                     { type: 'lookahead', value: 'Must contain uppercase' },
//                     { type: 'lookahead', value: 'Must contain digit' },
//                     { type: 'lookahead', value: 'Must contain special char' },
//                     { type: 'character', value: 'Allowed characters' },
//                     { type: 'quantifier', value: '8 or more' },
//                     { type: 'end', value: '$' }
//                 ]
//             }
//         };

//         const lowerDesc = desc.toLowerCase();
        
//         for (const [key, value] of Object.entries(patterns)) {
//             if (lowerDesc.includes(key)) {
//                 return value;
//             }
//         }

//         // Fallback to AI-like generation
//         return {
//             pattern: '^.*$',
//             explanation: 'Generic pattern matching any character sequence. Consider being more specific.',
//             tree: [
//                 { type: 'start', value: '^' },
//                 { type: 'wildcard', value: 'Any character' },
//                 { type: 'quantifier', value: 'Zero or more' },
//                 { type: 'end', value: '$' }
//             ]
//         };
//     };

//     const testRegex = useCallback(() => {
//         if (!regex) return;

//         const startTime = performance.now();
        
//         try {
//             const flagsString = Object.entries(regexFlags)
//                 .filter(([_, enabled]) => enabled)
//                 .map(([flag]) => flag)
//                 .join('');
            
//             const regexObj = new RegExp(regex, flagsString);
//             const testMatches = [];
//             const groups = [];
            
//             let match;
//             const regexCopy = new RegExp(regexObj);
            
//             while ((match = regexCopy.exec(testText)) !== null) {
//                 const matchInfo = {
//                     text: match[0],
//                     index: match.index,
//                     groups: match.slice(1).map((group, i) => ({
//                         text: group,
//                         index: match.index + match[0].indexOf(group),
//                         number: i + 1
//                     }))
//                 };
//                 testMatches.push(matchInfo);
                
//                 if (match.length > 1) {
//                     groups.push(...matchInfo.groups);
//                 }
                
//                 if (!regexFlags.g) break;
//             }
            
//             setMatches(testMatches);
//             setCaptureGroups(groups);
            
//             const endTime = performance.now();
//             setPerformanceStats({
//                 executionTime: endTime - startTime,
//                 matchesCount: testMatches.length,
//                 groupsCount: groups.length
//             });
            
//         } catch (err) {
//             setError('Invalid regex pattern: ' + err.message);
//             setMatches([]);
//             setCaptureGroups([]);
//             setPerformanceStats(null);
//         }
//     }, [regex, testText, regexFlags]);

//     const performReplace = useCallback(() => {
//         if (!regex || !testText) return;

//         try {
//             const flagsString = Object.entries(regexFlags)
//                 .filter(([_, enabled]) => enabled)
//                 .map(([flag]) => flag)
//                 .join('');
            
//             const regexObj = new RegExp(regex, flagsString);
//             const result = testText.replace(regexObj, replaceText);
//             setReplacedResult(result);
            
//         } catch (err) {
//             setError('Replace error: ' + err.message);
//         }
//     }, [regex, testText, replaceText, regexFlags]);

//     const splitText = useCallback(() => {
//         if (!regex || !testText) return;

//         try {
//             const flagsString = Object.entries(regexFlags)
//                 .filter(([_, enabled]) => enabled)
//                 .map(([flag]) => flag)
//                 .join('');
            
//             const regexObj = new RegExp(regex, flagsString);
//             const results = testText.split(regexObj);
//             setSplitResults(results.filter(r => r !== ''));
            
//         } catch (err) {
//             setError('Split error: ' + err.message);
//         }
//     }, [regex, testText, regexFlags]);

//     const analyzeRegex = useCallback(() => {
//         if (!regex.trim()) {
//             setError('Please enter a regex to analyze');
//             return;
//         }

//         try {
//             // Basic regex analysis
//             const analysis = analyzeRegexPattern(regex);
//             setExplanation(analysis.explanation);
//             setRegexTree(analysis.tree);
//             setError('');
            
//         } catch (err) {
//             setError('Invalid regex pattern for analysis');
//         }
//     }, [regex]);

//     const analyzeRegexPattern = (pattern) => {
//         // Simple regex analysis - in production, use a proper regex parser
//         const components = [];
//         let explanation = 'Pattern breakdown:\n';
        
//         // Basic component extraction (simplified)
//         if (pattern.includes('^')) components.push('Starts with');
//         if (pattern.includes('$')) components.push('Ends with');
//         if (pattern.includes('.*')) components.push('Any characters');
//         if (pattern.includes('\\d')) components.push('Digits');
//         if (pattern.includes('\\w')) components.push('Word characters');
//         if (pattern.includes('\\s')) components.push('Whitespace');
//         if (pattern.includes('+')) components.push('One or more');
//         if (pattern.includes('*')) components.push('Zero or more');
//         if (pattern.includes('?')) components.push('Optional');
//         if (pattern.includes('{')) components.push('Specific quantity');
//         if (pattern.includes('[')) components.push('Character class');
//         if (pattern.includes('(')) components.push('Capture group');
        
//         return {
//             explanation: explanation + components.join(', '),
//             tree: components.map(comp => ({ type: 'component', value: comp }))
//         };
//     };

//     const copyToClipboard = useCallback((text) => {
//         navigator.clipboard.writeText(text);
//         // Add toast notification here
//     }, []);

//     const escapeRegex = useCallback(() => {
//         if (!regex) return;
//         const escaped = regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//         setRegex(escaped);
//     }, [regex]);

//     const minimizeRegex = useCallback(() => {
//         if (!regex) return;
//         // Simple minimization - remove unnecessary escapes, combine character classes
//         let minimized = regex
//             .replace(/\\\\([.*+?^${}()|[\]\\])/g, '$1')
//             .replace(/\[([a-z])\-([a-z])\]/gi, (match, p1, p2) => {
//                 return p1.toLowerCase() === p1 && p2.toLowerCase() === p2 ? `[${p1}-${p2}]` : match;
//             });
//         setRegex(minimized);
//     }, [regex]);

//     useEffect(() => {
//         if (regex && testText && activeTool === 'tester') {
//             const debounceTimer = setTimeout(testRegex, 500);
//             return () => clearTimeout(debounceTimer);
//         }
//     }, [regex, testText, regexFlags, activeTool, testRegex]);

//     const renderActiveTool = () => {
//         switch (activeTool) {
//             case 'tester':
//                 return (
//                     <div className="tool-panel">
//                         <div className="input-group">
//                             <label>Test Text</label>
//                             <textarea
//                                 value={testText}
//                                 onChange={(e) => setTestText(e.target.value)}
//                                 placeholder={"Enter text to test the regex pattern..."}
//                                 rows="4"
//                             />
//                         </div>
                        
//                         {matches.length > 0 ? (
//                             <div className="matches-section">
//                                 <h4>{"Matches"} ({matches.length})</h4>
//                                 <div className="matches-list">
//                                     {matches.map((match, index) => (
//                                         <div key={index} className="match-item">
//                                             <span className="match-text">"{match.text}"</span>
//                                             <span className="match-position">at position {match.index}</span>
//                                             {match.groups.length > 0 && (
//                                                 <div className="capture-groups">
//                                                     {match.groups.map((group, groupIndex) => (
//                                                         <span key={groupIndex} className="capture-group">
//                                                             Group {group.number}: "{group.text}"
//                                                         </span>
//                                                     ))}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         ) : testText && (
//                             <div className="no-matches">
//                                 {"No matches found"}
//                             </div>
//                         )}
//                     </div>
//                 );

//             case 'replacer':
//                 return (
//                     <div className="tool-panel">
//                         <div className="input-group">
//                             <label>Replacement Text</label>
//                             <input
//                                 type="text"
//                                 value={replaceText}
//                                 onChange={(e) => setReplaceText(e.target.value)}
//                                 placeholder="Enter replacement text..."
//                             />
//                         </div>
//                         <button onClick={performReplace} className="primary-btn">
//                             Perform Replace
//                         </button>
                        
//                         {replacedResult && (
//                             <div className="result-section">
//                                 <h4>Replaced Result</h4>
//                                 <div className="result-box">
//                                     {replacedResult}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 );

//             case 'splitter':
//                 return (
//                     <div className="tool-panel">
//                         <button onClick={splitText} className="primary-btn">
//                             Split Text
//                         </button>
                        
//                         {splitResults.length > 0 && (
//                             <div className="split-results">
//                                 <h4>Split Results ({splitResults.length} parts)</h4>
//                                 <div className="split-list">
//                                     {splitResults.map((result, index) => (
//                                         <div key={index} className="split-item">
//                                             Part {index + 1}: "{result}"
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 );

//             case 'visualizer':
//                 return (
//                     <div className="tool-panel">
//                         <h4>Regex Structure Tree</h4>
//                         <div className="regex-tree">
//                             {regexTree.map((node, index) => (
//                                 <div key={index} className={`tree-node ${node.type}`}>
//                                     <span className="node-type">{node.type}</span>
//                                     <span className="node-value">{node.value}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 );

//             case 'validator':
//                 return (
//                     <div className="tool-panel">
//                         <div className="validation-results">
//                             <h4>Pattern Validation</h4>
//                             <div className="validation-item">
//                                 <span>Syntax:</span>
//                                 <span className="valid">✓ Valid</span>
//                             </div>
//                             {performanceStats && (
//                                 <>
//                                     <div className="validation-item">
//                                         <span>Performance:</span>
//                                         <span className="valid">
//                                             ✓ {performanceStats.executionTime.toFixed(2)}ms
//                                         </span>
//                                     </div>
//                                     <div className="validation-item">
//                                         <span>Matches:</span>
//                                         <span className={performanceStats.matchesCount > 0 ? 'valid' : 'warning'}>
//                                             {performanceStats.matchesCount} found
//                                         </span>
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 );

//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className={`regex-generator enhanced ${theme}`}>
//             <div className="tool-header">
//                 <h1>{"Regex Generator"}</h1>
//                 <p>{"Generate regular expressions from natural language descriptions"}</p>
//             </div>

//             {/* Mode Selector */}
//             <div className="mode-selector">
//                 {modes.map(mode => (
//                     <button
//                         key={mode.id}
//                         className={`mode-btn ${activeMode === mode.id ? 'active' : ''}`}
//                         onClick={() => setActiveMode(mode.id)}
//                     >
//                         <span className="mode-icon">{mode.icon}</span>
//                         {mode.label}
//                     </button>
//                 ))}
//             </div>

//             <div className="regex-container">
//                 {/* Main Input Section */}
//                 <div className="main-input-section">
//                     <div className="input-group">
//                         <label>
//                             {activeMode === 'generate' ? 'Describe your pattern:' : 
//                              activeMode === 'analyze' ? 'Enter regex to analyze:' : 'Learn regex concepts:'}
//                         </label>
//                         <textarea
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             placeholder={"Describe what pattern you want to match..."}
//                             rows="3"
//                         />
//                     </div>

//                     {/* Regex Flags */}
//                     <div className="flags-section">
//                         <label>Regex Flags:</label>
//                         <div className="flags-grid">
//                             {flags.map(flag => (
//                                 <label key={flag.id} className="flag-checkbox">
//                                     <input
//                                         type="checkbox"
//                                         checked={regexFlags[flag.id]}
//                                         onChange={(e) => setRegexFlags(prev => ({
//                                             ...prev,
//                                             [flag.id]: e.target.checked
//                                         }))}
//                                     />
//                                     <span>{flag.label}</span>
//                                 </label>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="action-buttons">
//                         {activeMode === 'generate' && (
//                             <button 
//                                 onClick={generateRegex}
//                                 className={`primary-btn ${isGenerating ? 'generating' : ''}`}
//                                 disabled={isGenerating || !description.trim()}
//                             >
//                                 {isGenerating ? "Generating..." : "Generate Regex"}
//                             </button>
//                         )}
//                         {activeMode === 'analyze' && (
//                             <button 
//                                 onClick={analyzeRegex}
//                                 className="primary-btn"
//                             >
//                                 Analyze Pattern
//                             </button>
//                         )}
//                         <button onClick={() => {
//                             setDescription('');
//                             setRegex('');
//                             setTestText('');
//                             setReplaceText('');
//                             setReplacedResult('');
//                             setMatches([]);
//                             setSplitResults([]);
//                             setError('');
//                         }} className="secondary-btn">
//                             {"Clear"}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Generated Regex Display */}
//                 {regex && (
//                     <div className="regex-display-section">
//                         <div className="result-group">
//                             <label>Generated Regex</label>
//                             <div className="regex-display">
//                                 <code>/ {regex} /</code>
//                                 <div className="regex-actions">
//                                     <button 
//                                         onClick={() => copyToClipboard(regex)}
//                                         className="copy-btn"
//                                     >
//                                         {"Copy"}
//                                     </button>
//                                     <button 
//                                         onClick={escapeRegex}
//                                         className="secondary-btn small"
//                                     >
//                                         Escape
//                                     </button>
//                                     <button 
//                                         onClick={minimizeRegex}
//                                         className="secondary-btn small"
//                                     >
//                                         Minimize
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         {explanation && (
//                             <div className="result-group">
//                                 <label>{"Explanation"}</label>
//                                 <div className="explanation-box">
//                                     {explanation}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Tools Navigation */}
//                 <div className="tools-navigation">
//                     {tools.map(tool => (
//                         <button
//                             key={tool.id}
//                             className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
//                             onClick={() => setActiveTool(tool.id)}
//                         >
//                             <span className="tool-icon">{tool.icon}</span>
//                             {tool.label}
//                         </button>
//                     ))}
//                 </div>

//                 {/* Active Tool Panel */}
//                 {regex && (
//                     <div className="active-tool-container">
//                         {renderActiveTool()}
//                     </div>
//                 )}

//                 {/* Examples Section */}
//                 <div className="examples-section">
//                     <h3>{"Examples"}</h3>
//                     <div className="examples-grid">
//                         {advancedExamples.map((example, index) => (
//                             <div key={index} className="example-card">
//                                 <div className="example-header">
//                                     <h4>{example.name}</h4>
//                                     <button 
//                                         onClick={() => {
//                                             setRegex(example.pattern);
//                                             setExplanation(example.description);
//                                         }}
//                                         className="use-example-btn"
//                                     >
//                                         Use
//                                     </button>
//                                 </div>
//                                 <code className="example-pattern">{example.pattern}</code>
//                                 <p className="example-desc">{example.description}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Performance Stats */}
//                 {performanceStats && (
//                     <div className="performance-stats">
//                         <h4>Performance</h4>
//                         <div className="stats-grid">
//                             <div className="stat">
//                                 <span>Execution Time:</span>
//                                 <span>{performanceStats.executionTime.toFixed(2)}ms</span>
//                             </div>
//                             <div className="stat">
//                                 <span>Matches Found:</span>
//                                 <span>{performanceStats.matchesCount}</span>
//                             </div>
//                             <div className="stat">
//                                 <span>Capture Groups:</span>
//                                 <span>{performanceStats.groupsCount}</span>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default RegexGenerator;