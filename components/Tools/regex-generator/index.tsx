"use client"

import React, { useState, useCallback, useEffect, useMemo } from "react"
import styles from "./styles.module.css"

type Match = {
    text: string
    index: number
    groups: string[]
}

type Flag = "g" | "i" | "m" | "s" | "u"
type Tab = "test" | "replace" | "templates"

interface LanguageSnippet {
    language: string
    snippet: string
    icon: string
}

interface Template {
    name: string
    pattern: string
    description: string
    category: string
}

const RegexStudio = () => {
    // Core state
    const [regex, setRegex] = useState("")
    const [testText, setTestText] = useState("")
    const [replaceText, setReplaceText] = useState("")
    const [matches, setMatches] = useState<Match[]>([])
    const [replacedText, setReplacedText] = useState("")
    const [flags, setFlags] = useState<Flag[]>(["g"])
    const [regexError, setRegexError] = useState("")
    const [matchCount, setMatchCount] = useState(0)
    const [activeTab, setActiveTab] = useState<Tab>("test")
    const [selectedLanguage, setSelectedLanguage] = useState("javascript")
    const [regexExplanation, setRegexExplanation] = useState<{
        pattern: string
        meaning: string
        parts: { part: string; description: string }[]
    } | null>(null)

    // Templates
    const templates: Template[] = [
        // Indian Templates
        {
            name: "Aadhaar Card",
            pattern: "^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$",
            description: "XXXX XXXX XXXX format",
            category: "Indian",
        },
        {
            name: "PAN Card",
            pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
            description: "5 letters, 4 digits, 1 letter",
            category: "Indian",
        },
        {
            name: "GSTIN",
            pattern:
                "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
            description: "15-character GSTIN",
            category: "Indian",
        },
        {
            name: "UPI ID",
            pattern: "^[a-zA-Z0-9.-]{2,256}@[a-zA-Z]{3,}$",
            description: "username@bankhandle",
            category: "Indian",
        },
        {
            name: "IFSC Code",
            pattern: "^[A-Z]{4}0[A-Z0-9]{6}$",
            description: "4 letters, 0, 6 alphanumeric",
            category: "Indian",
        },
        {
            name: "Vehicle Number",
            pattern: "^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$",
            description: "MH12AB1234 format",
            category: "Indian",
        },
        {
            name: "PIN Code",
            pattern: "^[1-9]{1}[0-9]{5}$",
            description: "6 digit postal code",
            category: "Indian",
        },
        {
            name: "Mobile Number",
            pattern: "^[6-9][0-9]{9}$",
            description: "10 digit mobile number",
            category: "Indian",
        },
        {
            name: "Voter ID",
            pattern: "^[A-Z]{3}[0-9]{7}$",
            description: "3 letters, 7 digits",
            category: "Indian",
        },
        {
            name: "Passport",
            pattern: "^[A-Z][0-9]{7}$",
            description: "1 letter, 7 digits",
            category: "Indian",
        },
        // Common Templates
        {
            name: "Email Address",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            description: "Valid email format",
            category: "Common",
        },
        {
            name: "URL",
            pattern:
                "^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$",
            description: "HTTP/HTTPS URL",
            category: "Common",
        },
        {
            name: "IP Address",
            pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$",
            description: "IPv4 address",
            category: "Common",
        },
        {
            name: "Date (YYYY-MM-DD)",
            pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$",
            description: "ISO date format",
            category: "Common",
        },
        {
            name: "Strong Password",
            pattern:
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            description: "8+ chars, uppercase, lowercase, number, special",
            category: "Common",
        },
        {
            name: "Hex Color",
            pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
            description: "Hex color code",
            category: "Common",
        },
        {
            name: "HTML Tag",
            pattern: "<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>",
            description: "HTML tag with content",
            category: "Common",
        },
        {
            name: "Credit Card",
            pattern: "^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$",
            description: "16-digit credit card",
            category: "Common",
        },
        {
            name: "Slug",
            pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            description: "URL-friendly slug",
            category: "Common",
        },
        {
            name: "Time (HH:MM)",
            pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
            description: "24-hour time format",
            category: "Common",
        },
    ]

    // Code snippets
    const codeSnippets: LanguageSnippet[] = [
        {
            language: "JavaScript",
            icon: "🟨",
            snippet:
                "const regex = /${pattern}/${flags};\nconst matches = text.match(regex);\nconst replaced = text.replace(regex, '${replacement}');",
        },
        {
            language: "Python",
            icon: "🐍",
            snippet:
                "import re\n\npattern = r'${pattern}'\nmatches = re.findall(pattern, text, re.${flags.toUpperCase()})\nreplaced = re.sub(pattern, '${replacement}', text)",
        },
        {
            language: "PHP",
            icon: "🐘",
            snippet:
                "$pattern = '/${pattern}/${flags}';\npreg_match_all($pattern, $text, $matches);\n$replaced = preg_replace($pattern, '${replacement}', $text);",
        },
        {
            language: "Java",
            icon: "☕",
            snippet:
                'Pattern pattern = Pattern.compile("${pattern}", ${flagsJava});\nMatcher matcher = pattern.matcher(text);\nString replaced = matcher.replaceAll("${replacement}");',
        },
        {
            language: "C#",
            icon: "🔷",
            snippet:
                'Regex regex = new Regex(@"${pattern}", RegexOptions.${flagsCSharp});\nMatchCollection matches = regex.Matches(text);\nstring replaced = regex.Replace(text, "${replacement}");',
        },
        {
            language: "VS Code",
            icon: "📝",
            snippet:
                "// Find: ${pattern}\n// Replace: ${replacement}\n// Use Ctrl+F, enable regex mode (.*)",
        },
        {
            language: "MongoDB",
            icon: "🍃",
            snippet: "{ $regex: /${pattern}/, $options: '${flags}' }",
        },
        {
            language: "MySQL",
            icon: "🐬",
            snippet: "SELECT * FROM table WHERE column REGEXP '${pattern}';",
        },
        {
            language: "PostgreSQL",
            icon: "🐘",
            snippet: "SELECT * FROM table WHERE column ~ '${pattern}';",
        },
    ]

    // Flag options
    const flagOptions = [
        { value: "g", label: "global", description: "Find all matches" },
        { value: "i", label: "ignoreCase", description: "Case insensitive" },
        {
            value: "m",
            label: "multiline",
            description: "^ and $ match line breaks",
        },
        { value: "s", label: "dotAll", description: "Dot matches newlines" },
        { value: "u", label: "unicode", description: "Unicode support" },
    ]

    // Explain regex
    const explainRegex = useCallback(
        (pattern: string): typeof regexExplanation => {
            const parts: { part: string; description: string }[] = []

            if (pattern.includes("\\d"))
                parts.push({
                    part: "\\d",
                    description: "Matches any digit (0-9)",
                })
            if (pattern.includes("\\w"))
                parts.push({
                    part: "\\w",
                    description:
                        "Matches any word character (a-z, A-Z, 0-9, _)",
                })
            if (pattern.includes("\\s"))
                parts.push({
                    part: "\\s",
                    description: "Matches any whitespace character",
                })
            if (pattern.includes("."))
                parts.push({
                    part: ".",
                    description: "Matches any character except newline",
                })
            if (pattern.includes("^"))
                parts.push({ part: "^", description: "Start of string anchor" })
            if (pattern.includes("$"))
                parts.push({ part: "$", description: "End of string anchor" })
            if (pattern.includes("+"))
                parts.push({
                    part: "+",
                    description: "Matches 1 or more of the preceding token",
                })
            if (pattern.includes("*"))
                parts.push({
                    part: "*",
                    description: "Matches 0 or more of the preceding token",
                })
            if (pattern.includes("?"))
                parts.push({
                    part: "?",
                    description: "Matches 0 or 1 of the preceding token",
                })
            if (pattern.includes("{")) {
                const match = pattern.match(/\{(\d+),?(\d+)?\}/)
                if (match)
                    parts.push({
                        part: match[0],
                        description: `Matches exactly ${match[1]} times`,
                    })
            }
            if (pattern.includes("["))
                parts.push({
                    part: "[...]",
                    description:
                        "Character class matching any character inside",
                })
            if (pattern.includes("|"))
                parts.push({
                    part: "|",
                    description: "Alternation (OR) operator",
                })
            if (pattern.includes("("))
                parts.push({ part: "(...)", description: "Capturing group" })
            if (pattern.includes("(?:"))
                parts.push({
                    part: "(?:...)",
                    description: "Non-capturing group",
                })
            if (pattern.includes("(?="))
                parts.push({
                    part: "(?=...)",
                    description: "Positive lookahead",
                })
            if (pattern.includes("(?!"))
                parts.push({
                    part: "(?!...)",
                    description: "Negative lookahead",
                })
            if (pattern.includes("(?<="))
                parts.push({
                    part: "(?<=...)",
                    description: "Positive lookbehind",
                })
            if (pattern.includes("(?<!"))
                parts.push({
                    part: "(?<!...)",
                    description: "Negative lookbehind",
                })

            return {
                pattern,
                meaning:
                    parts.length > 0
                        ? "Pattern contains: " +
                          parts.map((p) => p.part).join(", ")
                        : "Complex pattern - see breakdown below",
                parts,
            }
        },
        []
    )

    // Test regex
    const testRegex = useCallback(() => {
        if (!regex) {
            setMatches([])
            setMatchCount(0)
            setRegexError("")
            setRegexExplanation(null)
            return
        }

        try {
            const flagString = flags.join("")
            const regexObj = new RegExp(regex, flagString)
            const testMatches: Match[] = []

            let match
            let lastIndex = 0
            while ((match = regexObj.exec(testText)) !== null) {
                if (regexObj.lastIndex === lastIndex) break
                lastIndex = regexObj.lastIndex
                testMatches.push({
                    text: match[0],
                    index: match.index,
                    groups: match.slice(1),
                })
            }

            setMatches(testMatches)
            setMatchCount(testMatches.length)
            setRegexError("")
            setRegexExplanation(explainRegex(regex))
        } catch (err) {
            setMatches([])
            setMatchCount(0)
            setRegexError((err as Error).message)
            setRegexExplanation(null)
        }
    }, [regex, testText, flags, explainRegex])

    // Replace text
    const replaceTextFunc = useCallback(() => {
        if (!regex || !testText) return

        try {
            const flagString = flags.join("")
            const regexObj = new RegExp(regex, flagString)
            const replaced = testText.replace(regexObj, replaceText)
            setReplacedText(replaced)
        } catch (err) {
            setRegexError((err as Error).message)
        }
    }, [regex, testText, replaceText, flags])

    // Apply template
    const applyTemplate = useCallback(
        (pattern: string) => {
            setRegex(pattern)
            setRegexExplanation(explainRegex(pattern))
            setActiveTab("test")
        },
        [explainRegex]
    )

    // Toggle flag
    const toggleFlag = useCallback((flag: Flag) => {
        setFlags((prev) =>
            prev.includes(flag)
                ? prev.filter((f) => f !== flag)
                : [...prev, flag]
        )
    }, [])

    // Copy to clipboard
    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text)
    }, [])

    // Clear all
    const clearAll = useCallback(() => {
        setRegex("")
        setTestText("")
        setReplaceText("")
        setReplacedText("")
        setMatches([])
        setRegexError("")
        setMatchCount(0)
        setRegexExplanation(null)
    }, [])

    // Get flag string
    const flagString = useMemo(() => flags.join(""), [flags])

    // Get language snippet
    const getLanguageSnippet = useCallback(
        (snippet: string) => {
            return snippet
                .replace(/\${pattern}/g, regex)
                .replace(/\${flags}/g, flagString)
                .replace(/\${replacement}/g, replaceText || "$&")
                .replace(
                    /\${flagsJava}/g,
                    flags
                        .map((f) =>
                            f === "g" ? "" : `Pattern.${f.toUpperCase()}`
                        )
                        .filter(Boolean)
                        .join(" | ") || "0"
                )
                .replace(
                    /\${flagsCSharp}/g,
                    flags
                        .map(
                            (f) =>
                                `RegexOptions.${f === "g" ? "None" : f.toUpperCase()}`
                        )
                        .filter(Boolean)
                        .join(" | ") || "RegexOptions.None"
                )
        },
        [regex, flagString, replaceText, flags]
    )

    // Get highlighted text
    const getHighlightedText = useCallback(() => {
        if (!regex || matches.length === 0 || !testText)
            return [{ text: testText, isMatch: false }]

        let lastIndex = 0
        const parts: { text: string; isMatch: boolean }[] = []

        for (const match of matches) {
            if (match.index > lastIndex) {
                parts.push({
                    text: testText.substring(lastIndex, match.index),
                    isMatch: false,
                })
            }
            parts.push({ text: match.text, isMatch: true })
            lastIndex = match.index + match.text.length
        }

        if (lastIndex < testText.length) {
            parts.push({ text: testText.substring(lastIndex), isMatch: false })
        }

        return parts
    }, [regex, matches, testText])

    // Real-time testing
    useEffect(() => {
        if (regex && testText) {
            testRegex()
        }
    }, [regex, testText, flags, testRegex])

    // Real-time replace
    useEffect(() => {
        if (regex && testText && replaceText) {
            replaceTextFunc()
        }
    }, [regex, testText, replaceText, flags, replaceTextFunc])

    // Group templates by category (fixed TypeScript error)
    const groupedTemplates = templates.reduce(
        (acc, template) => {
            if (!acc[template.category]) {
                acc[template.category] = []
            }
            acc[template.category]!.push(template)
            return acc
        },
        {} as Record<string, Template[]>
    )

    return (
        <div className={styles.container}>
            <div className={styles.layout}>
                {/* Mode Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === "test" ? styles.active : ""}`}
                        onClick={() => setActiveTab("test")}
                    >
                        🧪 Test Regex
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "replace" ? styles.active : ""}`}
                        onClick={() => setActiveTab("replace")}
                    >
                        🔄 Find & Replace
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "templates" ? styles.active : ""}`}
                        onClick={() => setActiveTab("templates")}
                    >
                        📚 Templates
                    </button>
                </div>

                {/* Test Tab */}
                {activeTab === "test" && (
                    <div className={styles.tabContent}>
                        {/* Regex Input */}
                        <div className={styles.regexInputSection}>
                            <label className={styles.label}>
                                Regular Expression
                            </label>
                            <div className={styles.regexInputWrapper}>
                                <code className={styles.regexPrefix}>/</code>
                                <input
                                    type="text"
                                    value={regex}
                                    onChange={(e) => setRegex(e.target.value)}
                                    placeholder="Enter your regex pattern"
                                    className={styles.regexInput}
                                />
                                <code className={styles.regexSuffix}>
                                    /{flagString}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(regex)}
                                    className={styles.copyBtn}
                                >
                                    📋
                                </button>
                                <button
                                    onClick={clearAll}
                                    className={styles.clearBtn}
                                >
                                    🗑️
                                </button>
                            </div>
                            {regexError && (
                                <div className={styles.regexError}>
                                    {regexError}
                                </div>
                            )}
                        </div>

                        {/* Flags */}
                        <div className={styles.flagsSection}>
                            <label className={styles.label}>Flags</label>
                            <div className={styles.flagsGrid}>
                                {flagOptions.map((flag) => (
                                    <button
                                        key={flag.value}
                                        className={`${styles.flagBtn} ${flags.includes(flag.value as Flag) ? styles.active : ""}`}
                                        onClick={() =>
                                            toggleFlag(flag.value as Flag)
                                        }
                                    >
                                        <code>{flag.value}</code>
                                        <span>{flag.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Test Text */}
                        <div className={styles.testSection}>
                            <label className={styles.label}>Test Text</label>
                            <textarea
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                placeholder="Enter text to test the regex against..."
                                className={styles.testTextarea}
                                rows={8}
                            />

                            {/* Highlighted Preview */}
                            {testText && regex && matches.length > 0 && (
                                <div className={styles.highlightPreview}>
                                    <div className={styles.highlightHeader}>
                                        <span>
                                            🔍 Highlighted Matches ({matchCount}
                                            )
                                        </span>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(testText)
                                            }
                                            className={styles.iconBtn}
                                        >
                                            📋
                                        </button>
                                    </div>
                                    <div className={styles.highlightContent}>
                                        {getHighlightedText().map(
                                            (part, idx) => (
                                                <span
                                                    key={idx}
                                                    className={
                                                        part.isMatch
                                                            ? styles.highlightMatch
                                                            : ""
                                                    }
                                                >
                                                    {part.text}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Match Results */}
                        {matches.length > 0 && (
                            <div className={styles.matchesSection}>
                                <div className={styles.matchesHeader}>
                                    <h3>🎯 Matches Found ({matchCount})</h3>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                JSON.stringify(matches, null, 2)
                                            )
                                        }
                                        className={styles.iconBtn}
                                    >
                                        📋 Export
                                    </button>
                                </div>
                                <div className={styles.matchesList}>
                                    {matches.map((match, idx) => (
                                        <div
                                            key={idx}
                                            className={styles.matchItem}
                                        >
                                            <span className={styles.matchIndex}>
                                                {idx + 1}.
                                            </span>
                                            <code className={styles.matchText}>
                                                "{match.text}"
                                            </code>
                                            <span className={styles.matchPos}>
                                                at position {match.index}
                                            </span>
                                            {match.groups.length > 0 && (
                                                <div
                                                    className={
                                                        styles.matchGroups
                                                    }
                                                >
                                                    Groups:{" "}
                                                    {match.groups
                                                        .map(
                                                            (g, i) =>
                                                                `$${i + 1} = "${g}"`
                                                        )
                                                        .join(", ")}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Regex Explanation */}
                        {regex &&
                            regexExplanation &&
                            regexExplanation.parts.length > 0 && (
                                <div className={styles.explanationSection}>
                                    <div className={styles.explanationHeader}>
                                        <h3>📖 Regex Explanation</h3>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    regexExplanation.meaning
                                                )
                                            }
                                            className={styles.copyBtn}
                                        >
                                            📋
                                        </button>
                                    </div>
                                    <div className={styles.explanationBox}>
                                        <p
                                            className={
                                                styles.explanationSummary
                                            }
                                        >
                                            {regexExplanation.meaning}
                                        </p>
                                        <div className={styles.breakdownList}>
                                            {regexExplanation.parts.map(
                                                (part, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={
                                                            styles.breakdownItem
                                                        }
                                                    >
                                                        <code
                                                            className={
                                                                styles.breakdownCode
                                                            }
                                                        >
                                                            {part.part}
                                                        </code>
                                                        <span>
                                                            {part.description}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                {/* Replace Tab */}
                {activeTab === "replace" && (
                    <div className={styles.tabContent}>
                        {/* Regex Input */}
                        <div className={styles.regexInputSection}>
                            <label className={styles.label}>
                                Regular Expression
                            </label>
                            <div className={styles.regexInputWrapper}>
                                <code className={styles.regexPrefix}>/</code>
                                <input
                                    type="text"
                                    value={regex}
                                    onChange={(e) => setRegex(e.target.value)}
                                    placeholder="Enter your regex pattern"
                                    className={styles.regexInput}
                                />
                                <code className={styles.regexSuffix}>
                                    /{flagString}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(regex)}
                                    className={styles.copyBtn}
                                >
                                    📋
                                </button>
                                <button
                                    onClick={clearAll}
                                    className={styles.clearBtn}
                                >
                                    🗑️
                                </button>
                            </div>
                            {regexError && (
                                <div className={styles.regexError}>
                                    {regexError}
                                </div>
                            )}
                        </div>

                        {/* Flags */}
                        <div className={styles.flagsSection}>
                            <label className={styles.label}>Flags</label>
                            <div className={styles.flagsGrid}>
                                {flagOptions.map((flag) => (
                                    <button
                                        key={flag.value}
                                        className={`${styles.flagBtn} ${flags.includes(flag.value as Flag) ? styles.active : ""}`}
                                        onClick={() =>
                                            toggleFlag(flag.value as Flag)
                                        }
                                    >
                                        <code>{flag.value}</code>
                                        <span>{flag.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Text */}
                        <div className={styles.testSection}>
                            <label className={styles.label}>Input Text</label>
                            <textarea
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                placeholder="Enter text to perform find & replace on..."
                                className={styles.testTextarea}
                                rows={6}
                            />
                        </div>

                        {/* Replace Text */}
                        <div className={styles.replaceSection}>
                            <label className={styles.label}>Replace With</label>
                            <div className={styles.replaceWrapper}>
                                <input
                                    type="text"
                                    value={replaceText}
                                    onChange={(e) =>
                                        setReplaceText(e.target.value)
                                    }
                                    placeholder="$& for full match, $1 for first group, etc."
                                    className={styles.replaceInput}
                                />
                                <button
                                    onClick={() => copyToClipboard(replaceText)}
                                    className={styles.iconBtn}
                                >
                                    📋
                                </button>
                            </div>
                            <div className={styles.replaceHint}>
                                💡 <code>$&</code> = full match, <code>$`</code>{" "}
                                = text before, <code>$'</code> = text after,{" "}
                                <code>$1</code>, <code>$2</code> = capture
                                groups
                            </div>
                        </div>

                        {/* Result */}
                        {replacedText && (
                            <div className={styles.resultSection}>
                                <div className={styles.resultHeader}>
                                    <h3>✨ Result</h3>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(replacedText)
                                        }
                                        className={styles.copyBtn}
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                                <pre className={styles.resultPreview}>
                                    {replacedText}
                                </pre>
                                <div className={styles.statsRow}>
                                    <span>
                                        📊 Original length: {testText.length}{" "}
                                        chars
                                    </span>
                                    <span>
                                        🔄 New length: {replacedText.length}{" "}
                                        chars
                                    </span>
                                    <span>
                                        📈 Difference:{" "}
                                        {replacedText.length - testText.length >
                                        0
                                            ? "+"
                                            : ""}
                                        {replacedText.length - testText.length}{" "}
                                        chars
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Templates Tab */}
                {activeTab === "templates" && (
                    <div className={styles.tabContent}>
                        <div className={styles.templatesSection}>
                            <h3 className={styles.sectionTitle}>
                                📚 Regex Templates
                            </h3>
                            <p className={styles.templatesDescription}>
                                Click on any template to load it into the tester
                            </p>

                            {Object.entries(groupedTemplates).map(
                                ([category, categoryTemplates]) => (
                                    <div
                                        key={category}
                                        className={styles.templateCategory}
                                    >
                                        <h4 className={styles.categoryTitle}>
                                            {category} Templates
                                        </h4>
                                        <div className={styles.templatesGrid}>
                                            {categoryTemplates.map(
                                                (template, idx) => (
                                                    <button
                                                        key={idx}
                                                        className={
                                                            styles.templateBtn
                                                        }
                                                        onClick={() =>
                                                            applyTemplate(
                                                                template.pattern
                                                            )
                                                        }
                                                        title={
                                                            template.description
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.templateName
                                                            }
                                                        >
                                                            {template.name}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.templateDesc
                                                            }
                                                        >
                                                            {
                                                                template.description
                                                            }
                                                        </span>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Code Snippets Section */}
                <div className={styles.codeSection}>
                    <div className={styles.codeHeader}>
                        <h3 className={styles.sectionTitle}>
                            💻 Code Snippets
                        </h3>
                        <select
                            value={selectedLanguage}
                            onChange={(e) =>
                                setSelectedLanguage(e.target.value)
                            }
                            className={styles.languageSelect}
                        >
                            {codeSnippets.map((lang) => (
                                <option
                                    key={lang.language}
                                    value={lang.language}
                                >
                                    {lang.icon} {lang.language}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.codePreview}>
                        <pre className={styles.codeBlock}>
                            {getLanguageSnippet(
                                codeSnippets.find(
                                    (l) => l.language === selectedLanguage
                                )?.snippet || ""
                            )}
                        </pre>
                        <button
                            onClick={() =>
                                copyToClipboard(
                                    getLanguageSnippet(
                                        codeSnippets.find(
                                            (l) =>
                                                l.language === selectedLanguage
                                        )?.snippet || ""
                                    )
                                )
                            }
                            className={styles.copyCodeBtn}
                        >
                            📋 Copy Snippet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegexStudio
